import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Projects from './Projects';

// ── Hoisted mock functions ─────────────────────────────────────────────────
// toast MUST be a stable reference — Projects.tsx has `useEffect([toast])`.
// A new vi.fn() on every render would cause the effect to loop indefinitely.
const mocks = vi.hoisted(() => ({
  supabaseSelect: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: mocks.supabaseSelect })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('@/utils/voteUtils', () => ({
  useVotes: () => ({
    votes: {},
    remainingVotes: 3,
    addVote: vi.fn().mockResolvedValue(true),
    removeVote: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));

// Replace Radix Select with a native <select> so we can interact with it in jsdom
vi.mock('@/components/ui/select', () => ({
  Select: ({ onValueChange, value, children }: any) => (
    <select
      data-testid="sort-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Simplified ProjectCard — just render the project name
vi.mock('@/components/ProjectCard', () => ({
  default: ({
    project,
  }: {
    project: { name: string; tags: string[]; stars: number; is_demo?: boolean };
  }) => (
    <div
      data-testid="project-card"
      data-name={project.name}
      data-demo={project.is_demo ? 'true' : 'false'}
    >
      <h3>{project.name}</h3>
      {project.tags.map((t) => (
        <span key={t} data-testid="tag">
          {t}
        </span>
      ))}
    </div>
  ),
}));

// ──────────────────────────────────────────────────────────────────────────

const makeProject = (
  overrides: Partial<{
    id: string;
    name: string;
    short_description: string;
    full_description: string;
    lovable_url: string;
    tags: string[];
    stars: number;
    contributors_count: number;
    last_updated: string;
    is_demo: boolean;
  }> = {}
) => ({
  id: 'p1',
  name: 'Alpha',
  short_description: 'Alpha short',
  full_description: 'Alpha full',
  lovable_url: 'https://alpha.lovable.app/',
  tags: ['react'],
  stars: 10,
  contributors_count: 2,
  last_updated: '2026-01-15T00:00:00Z',
  is_demo: false,
  ...overrides,
});

const sampleProjects = [
  makeProject({ id: 'p1', name: 'Alpha', short_description: 'First unique project', tags: ['react', 'ts'], stars: 10, last_updated: '2026-01-15T00:00:00Z', is_demo: false }),
  makeProject({ id: 'p2', name: 'Beta', short_description: 'Second unique project', tags: ['vue'], stars: 5, last_updated: '2026-02-20T00:00:00Z', is_demo: false }),
  makeProject({ id: 'p3', name: 'Demo Project', short_description: 'Third unique project', tags: ['demo'], stars: 1, last_updated: '2026-03-01T00:00:00Z', is_demo: true }),
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <Projects />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.supabaseSelect.mockResolvedValue({ data: sampleProjects, error: null });
});

// ──────────────────────────────────────────────────────────────────────────

describe('Projects page', () => {
  it('renders all projects fetched from Supabase', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Demo Project')).toBeInTheDocument();
    });
  });

  it('falls back to mock projects when Supabase fetch fails', async () => {
    mocks.supabaseSelect.mockResolvedValue({ data: null, error: { message: 'network error' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByTestId('project-card').length).toBeGreaterThan(0);
    });
  });

  it('filters by search query matching project name', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());

    await user.type(
      screen.getByPlaceholderText(/search projects by name/i),
      'Alpha'
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });
  });

  it('filters by search query matching short description', async () => {
    const user = userEvent.setup();
    mocks.supabaseSelect.mockResolvedValue({
      data: [
        makeProject({ id: 'p1', name: 'One', short_description: 'alpha specific desc' }),
        makeProject({ id: 'p2', name: 'Two', short_description: 'beta specific desc' }),
      ],
      error: null,
    });

    renderPage();
    await waitFor(() => expect(screen.getByText('One')).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText(/search projects by name/i), 'alpha specific');

    await waitFor(() => {
      expect(screen.getByText('One')).toBeInTheDocument();
      expect(screen.queryByText('Two')).not.toBeInTheDocument();
    });
  });

  it('hides demo projects when the Demo Projects badge is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('Demo Project')).toBeInTheDocument());

    await user.click(screen.getByText('Demo Projects'));

    await waitFor(() => {
      expect(screen.queryByText('Demo Project')).not.toBeInTheDocument();
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
  });

  it('sorts projects by most stars when "Most Stars" is selected', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByTestId('project-card')).toHaveLength(3)
    );

    await userEvent.selectOptions(screen.getByTestId('sort-select'), 'stars');

    await waitFor(() => {
      const cards = screen.getAllByTestId('project-card');
      // Alpha (10 stars) should come before Beta (5) and Demo (1)
      expect(cards[0]).toHaveAttribute('data-name', 'Alpha');
    });
  });

  it('renders the page heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Explore Projects')).toBeInTheDocument();
    });
  });
});
