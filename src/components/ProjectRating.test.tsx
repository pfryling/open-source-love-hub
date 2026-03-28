import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProjectRating from './ProjectRating';

// ── Hoisted mock functions ─────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  authUser: null as { id: string } | null,
  navigate: vi.fn(),
  maybySingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  insert: vi.fn().mockResolvedValue({ error: null }),
  updateEq: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mocks.authUser }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mocks.maybySingle,
      update: vi.fn(() => ({ eq: mocks.updateEq })),
      insert: mocks.insert,
    })),
  },
}));

// ──────────────────────────────────────────────────────────────────────────

const defaultProps = {
  projectId: 'proj-1',
  averageRating: 4.0,
  ratingCount: 10,
  initialRating: 0,
};

const renderRating = (props: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <ProjectRating {...defaultProps} {...props} />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authUser = { id: 'user-1' };
  mocks.maybySingle.mockResolvedValue({ data: null, error: null });
  mocks.insert.mockResolvedValue({ error: null });
  mocks.updateEq.mockResolvedValue({ error: null });
});

// ──────────────────────────────────────────────────────────────────────────

describe('ProjectRating — display', () => {
  it('renders 5 star buttons', () => {
    renderRating();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('shows average rating and count when ratingCount > 0', () => {
    renderRating({ averageRating: 3.7, ratingCount: 5 });
    expect(screen.getByText(/3\.7/)).toBeInTheDocument();
    expect(screen.getByText(/5 ratings/)).toBeInTheDocument();
  });

  it('shows singular "rating" for count of 1', () => {
    renderRating({ ratingCount: 1, averageRating: 5 });
    expect(screen.getByText(/1 rating\b/)).toBeInTheDocument();
  });

  it('does not show count display when ratingCount=0', () => {
    renderRating({ ratingCount: 0 });
    expect(screen.queryByText(/ratings/)).not.toBeInTheDocument();
  });
});

describe('ProjectRating — unauthenticated user', () => {
  beforeEach(() => { mocks.authUser = null; });

  it('star buttons are enabled (clickable) when not logged in', () => {
    renderRating();
    // Buttons are not disabled — clicking them triggers the auth redirect
    screen.getAllByRole('button').forEach(btn => expect(btn).not.toBeDisabled());
  });

  it('shows "Sign in to rate this project" message', () => {
    renderRating();
    expect(screen.getByText(/sign in to rate/i)).toBeInTheDocument();
  });

  it('navigates to /auth when unauthenticated user clicks a star', async () => {
    const user = userEvent.setup();
    renderRating();
    await user.click(screen.getAllByRole('button')[0]);
    expect(mocks.navigate).toHaveBeenCalledWith('/auth');
  });
});

describe('ProjectRating — read-only mode', () => {
  it('disables all buttons in readOnly mode', () => {
    renderRating({ readOnly: true });
    screen.getAllByRole('button').forEach(btn => expect(btn).toBeDisabled());
  });

  it('does not show rate/update prompt in readOnly mode', () => {
    renderRating({ readOnly: true, initialRating: 3 });
    expect(screen.queryByText(/click to rate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/click to update/i)).not.toBeInTheDocument();
  });
});

describe('ProjectRating — interaction', () => {
  it('shows "Click to rate" prompt for authenticated user with no existing rating', () => {
    renderRating({ initialRating: 0 });
    expect(screen.getByText(/click to rate this project/i)).toBeInTheDocument();
  });

  it('shows "Click to update" prompt when user has an existing rating', () => {
    renderRating({ initialRating: 3 });
    expect(screen.getByText(/click to update your rating/i)).toBeInTheDocument();
  });

  it('calls supabase insert when user submits a new rating', async () => {
    const user = userEvent.setup();
    renderRating({ initialRating: 0 });
    await user.click(screen.getAllByRole('button')[2]); // 3rd star

    await waitFor(() => {
      expect(mocks.insert).toHaveBeenCalled();
    });
  });

  it('calls onRatingChange callback after successful submit', async () => {
    const user = userEvent.setup();
    const onRatingChange = vi.fn();
    renderRating({ initialRating: 0, onRatingChange });
    await user.click(screen.getAllByRole('button')[4]); // 5th star

    await waitFor(() => {
      expect(onRatingChange).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    });
  });

  it('calls update (not insert) when updating an existing rating', async () => {
    const user = userEvent.setup();
    // Simulate existing rating row returned by maybeSingle
    mocks.maybySingle.mockResolvedValue({ data: { id: 'rating-1', rating: 3 }, error: null });

    renderRating({ initialRating: 3 });
    await user.click(screen.getAllByRole('button')[4]); // update to 5 stars

    await waitFor(() => {
      expect(mocks.updateEq).toHaveBeenCalled();
      expect(mocks.insert).not.toHaveBeenCalled();
    });
  });
});
