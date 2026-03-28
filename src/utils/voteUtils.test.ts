import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { getMsUntilMidnight, formatCountdown, BASE_VOTES, DAILY_BONUS_VOTES, useVotes } from './voteUtils';

// ── Mutable mock state ─────────────────────────────────────────────────────
// Tests override these to control Supabase responses
const mockState = {
  votesData: [] as any[],
  bonusData: null as any,
};

// ── Chain builder (thenable + chainable) ───────────────────────────────────
// Each method returns `self` so the chain is traversable.
// `await chain` (or `await chain.select().eq()`) resolves via the `then` trap.
// `maybeSingle()` and `insert()` return explicit Promises.

function makeVotesChain() {
  const self: any = {};
  self.select = vi.fn().mockReturnValue(self);
  self.eq = vi.fn().mockReturnValue(self);
  self.update = vi.fn().mockReturnValue(self);
  self.delete = vi.fn().mockReturnValue(self);
  self.insert = vi.fn().mockImplementation(() => Promise.resolve({ error: null }));
  self.maybeSingle = vi.fn().mockImplementation(() =>
    Promise.resolve({ data: mockState.bonusData, error: null })
  );
  // Makes the chain directly awaitable: `await from().select().eq()`
  self.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve({ data: mockState.votesData, error: null }).then(onFulfilled, onRejected);
  return self;
}

function makeBonusChain() {
  const self: any = {};
  self.select = vi.fn().mockReturnValue(self);
  self.eq = vi.fn().mockReturnValue(self);
  self.insert = vi.fn().mockImplementation(() => Promise.resolve({ error: null }));
  self.maybeSingle = vi.fn().mockImplementation(() =>
    Promise.resolve({ data: mockState.bonusData, error: null })
  );
  self.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve({ data: mockState.bonusData, error: null }).then(onFulfilled, onRejected);
  return self;
}

// We create the chains outside the mock factory so they persist across tests.
// vi.mock is hoisted, but because we use plain objects (not const with vi.fn at top level),
// the factory captures them by reference. We also use vi.hoisted to be safe.
const chains = vi.hoisted(() => ({
  votes: null as any,
  bonus: null as any,
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'oshub_user_votes') return chains.votes;
      if (table === 'oshub_daily_bonus') return chains.bonus;
      return chains.votes;
    }),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

let mockAuthUser: { id: string; email: string } | null = { id: 'user-123', email: 'test@example.com' };

// ──────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Reset mock state
  mockState.votesData = [];
  mockState.bonusData = null;
  mockAuthUser = { id: 'user-123', email: 'test@example.com' };

  // Rebuild chains so vi.fn() call histories are clean
  chains.votes = makeVotesChain();
  chains.bonus = makeBonusChain();
});

// ──────────────────────────────────────────────────────────────────────────
// Pure function tests
// ──────────────────────────────────────────────────────────────────────────

describe('getMsUntilMidnight', () => {
  it('returns a positive value less than 24 hours in ms', () => {
    const ms = getMsUntilMidnight();
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});

describe('formatCountdown', () => {
  it('formats 0ms as "0h 0m"', () => {
    expect(formatCountdown(0)).toBe('0h 0m');
  });

  it('formats exactly 1 hour', () => {
    expect(formatCountdown(3_600_000)).toBe('1h 0m');
  });

  it('formats 1.5 hours', () => {
    expect(formatCountdown(5_400_000)).toBe('1h 30m');
  });

  it('formats 23 hours 59 minutes', () => {
    expect(formatCountdown(23 * 3_600_000 + 59 * 60_000)).toBe('23h 59m');
  });
});

// ──────────────────────────────────────────────────────────────────────────
// useVotes hook tests
// ──────────────────────────────────────────────────────────────────────────

describe('useVotes', () => {
  it('initialises with empty votes and BASE_VOTES remaining when Supabase returns no data', async () => {
    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.votes).toEqual({});
    expect(result.current.remainingVotes).toBe(BASE_VOTES);
    expect(result.current.maxVotes).toBe(BASE_VOTES);
    expect(result.current.dailyClaimed).toBe(false);
  });

  it('loads existing votes from Supabase on mount', async () => {
    mockState.votesData = [{ project_id: 'proj-1', vote_count: 2 }];

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.votes).toEqual({ 'proj-1': 2 });
    expect(result.current.remainingVotes).toBe(BASE_VOTES - 2);
  });

  it('sets dailyClaimed=true when bonus row exists in Supabase', async () => {
    mockState.bonusData = { id: 'bonus-1' };

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.dailyClaimed).toBe(true);
    expect(result.current.maxVotes).toBe(BASE_VOTES + DAILY_BONUS_VOTES);
  });

  it('returns empty state and loading=false when user is not authenticated', async () => {
    mockAuthUser = null;

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.votes).toEqual({});
    expect(result.current.remainingVotes).toBe(BASE_VOTES);
  });

  it('addVote inserts a new row and optimistically updates state', async () => {
    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.addVote('proj-abc');
    });

    expect(success).toBe(true);
    expect(result.current.votes['proj-abc']).toBe(1);
    expect(result.current.remainingVotes).toBe(BASE_VOTES - 1);
  });

  it('addVote returns false when no remaining votes', async () => {
    // Exhaust the vote limit
    mockState.votesData = [
      { project_id: 'p1', vote_count: 1 },
      { project_id: 'p2', vote_count: 1 },
      { project_id: 'p3', vote_count: 1 },
    ];

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.remainingVotes).toBe(0);

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.addVote('p-new');
    });

    expect(success).toBe(false);
    expect(result.current.votes['p-new']).toBeUndefined();
  });

  it('addVote returns false when user is not authenticated', async () => {
    mockAuthUser = null;

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.addVote('proj-x');
    });

    expect(success).toBe(false);
  });

  it('removeVote decrements vote count in state', async () => {
    mockState.votesData = [{ project_id: 'proj-1', vote_count: 2 }];

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeVote('proj-1');
    });

    expect(result.current.votes['proj-1']).toBe(1);
  });

  it('removeVote removes key from votes when count reaches 0', async () => {
    mockState.votesData = [{ project_id: 'proj-1', vote_count: 1 }];

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeVote('proj-1');
    });

    expect(result.current.votes['proj-1']).toBeUndefined();
    expect(result.current.remainingVotes).toBe(BASE_VOTES);
  });

  it('removeVote returns false when project has no votes', async () => {
    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.removeVote('nonexistent');
    });

    expect(success).toBe(false);
  });

  it('claimDaily inserts bonus row and sets dailyClaimed=true', async () => {
    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dailyClaimed).toBe(false);

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.claimDaily();
    });

    expect(success).toBe(true);
    expect(result.current.dailyClaimed).toBe(true);
    expect(result.current.maxVotes).toBe(BASE_VOTES + DAILY_BONUS_VOTES);
  });

  it('claimDaily returns false when already claimed', async () => {
    mockState.bonusData = { id: 'bonus-1' };

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dailyClaimed).toBe(true);

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.claimDaily();
    });

    expect(success).toBe(false);
  });

  it('claimDaily returns false when user is not authenticated', async () => {
    mockAuthUser = null;

    const { result } = renderHook(() => useVotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.claimDaily();
    });

    expect(success).toBe(false);
  });
});
