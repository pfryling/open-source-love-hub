import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// ── Hoisted mock functions ─────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
      updateUser: mocks.updateUser,
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// ──────────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const noSession = { data: { session: null }, error: null };
const withSession = {
  data: {
    session: { user: { id: 'user-1', email: 'a@b.com' }, access_token: 'tok' },
  },
  error: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  // Restore default implementations after clearAllMocks
  mocks.getSession.mockResolvedValue(noSession);
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

// ──────────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleSpy.mockRestore();
  });

  it('starts with loading=true then resolves to loading=false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('user is null when no session exists', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('user is populated when a session is returned', async () => {
    mocks.getSession.mockResolvedValue(withSession);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe('user-1');
  });
});

describe('signIn', () => {
  it('returns success:true on valid credentials', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.signIn('a@b.com', 'pw123');
    });

    expect(response?.success).toBe(true);
  });

  it('returns success:false and the error message on failure', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.signIn('bad@email.com', 'wrong');
    });

    expect(response?.success).toBe(false);
    expect(response?.message).toBe('Invalid credentials');
  });
});

describe('signUp', () => {
  it('returns success:true on successful registration', async () => {
    mocks.signUp.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.signUp('new@user.com', 'pass', 'Alice');
    });

    expect(response?.success).toBe(true);
  });

  it('returns success:false on signup error', async () => {
    mocks.signUp.mockResolvedValue({ error: { message: 'Email already in use' } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.signUp('dupe@user.com', 'pass');
    });

    expect(response?.success).toBe(false);
    expect(response?.message).toBe('Email already in use');
  });
});

describe('signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    mocks.signOut.mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
});
