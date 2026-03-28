import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import ProjectForm from './ProjectForm';

// ── Hoisted mock functions ─────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  createProject: vi.fn().mockResolvedValue({ success: true, message: 'Created' }),
  updateProject: vi.fn().mockResolvedValue({ success: true }),
  getUserProjects: vi.fn().mockResolvedValue([]),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('@/contexts/WaitlistContext', () => ({
  useWaitlist: () => ({
    createProject: mocks.createProject,
    updateProject: mocks.updateProject,
    getUserProjects: mocks.getUserProjects,
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

vi.mock('./ImageUpload', () => ({
  default: () => <div data-testid="image-upload" />,
}));

// ──────────────────────────────────────────────────────────────────────────

const renderForm = (props = {}) =>
  render(
    <MemoryRouter>
      <ProjectForm {...props} />
    </MemoryRouter>
  );

const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/project name/i), 'My Project');
  await user.type(screen.getByLabelText(/short description/i), 'A short desc');
  await user.type(screen.getByLabelText(/full description/i), 'Full description text');
  await user.type(screen.getByLabelText(/lovable project url/i), 'https://my-project.lovable.app/');
  await user.type(screen.getByLabelText(/contact email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/project goals/i), 'Some goals');
  await user.type(screen.getByLabelText(/areas where you need contributors/i), 'Frontend');
  await user.type(screen.getByLabelText(/tags/i), 'react, ts');
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createProject.mockResolvedValue({ success: true, message: 'Created' });
  mocks.updateProject.mockResolvedValue({ success: true });
  mocks.getUserProjects.mockResolvedValue([]);
});

// ──────────────────────────────────────────────────────────────────────────

describe('ProjectForm — rendering', () => {
  it('renders in create mode by default', () => {
    renderForm();
    expect(screen.getByText('Add Your Project')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit project/i })).toBeInTheDocument();
  });

  it('renders in edit mode when editMode=true', () => {
    renderForm({ editMode: true, projectId: 'p1' });
    expect(screen.getByText('Edit Your Project')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update project/i })).toBeInTheDocument();
  });

  it('pre-fills fields from initialData', async () => {
    renderForm({
      initialData: { name: 'Pre-filled Name', shortDescription: 'Pre desc' },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Pre-filled Name')).toBeInTheDocument();
    });
  });
});

describe('ProjectForm — validation', () => {
  it('shows errors for all empty required fields on submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
      expect(screen.getByText('Short description is required')).toBeInTheDocument();
      expect(screen.getByText('Full description is required')).toBeInTheDocument();
      expect(screen.getByText('Lovable URL is required')).toBeInTheDocument();
      expect(screen.getByText('Project goals are required')).toBeInTheDocument();
      expect(screen.getByText('Contribution areas are required')).toBeInTheDocument();
    });
  });

  it('shows error when shortDescription exceeds 150 characters', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/short description/i), 'a'.repeat(151));
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/short description must be less than 150 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('shows error for non-Lovable URL', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/lovable project url/i), 'https://github.com/foo');
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid lovable project url/i)).toBeInTheDocument();
    });
  });

  it('accepts lovable.app URL without showing URL error', async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(screen.queryByText(/valid lovable project url/i)).not.toBeInTheDocument();
    });
  });

  it('shows error when both contact fields are empty', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/project name/i), 'P');
    await user.type(screen.getByLabelText(/short description/i), 'D');
    await user.type(screen.getByLabelText(/full description/i), 'FD');
    await user.type(screen.getByLabelText(/lovable project url/i), 'https://p.lovable.app/');
    await user.type(screen.getByLabelText(/project goals/i), 'G');
    await user.type(screen.getByLabelText(/areas where you need contributors/i), 'C');
    await user.type(screen.getByLabelText(/tags/i), 't');
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(
        screen.getAllByText(/at least one contact method is required/i).length
      ).toBeGreaterThan(0);
    });
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/project name/i), 'P');
    await user.type(screen.getByLabelText(/short description/i), 'D');
    await user.type(screen.getByLabelText(/full description/i), 'FD');
    await user.type(screen.getByLabelText(/lovable project url/i), 'https://p.lovable.app/');
    await user.type(screen.getByLabelText(/contact email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/project goals/i), 'G');
    await user.type(screen.getByLabelText(/areas where you need contributors/i), 'C');
    await user.type(screen.getByLabelText(/tags/i), 't');
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });
  });

  it('clears a field error when the user types in that field', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /submit project/i }));
    await waitFor(() =>
      expect(screen.getByText('Project name is required')).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/project name/i), 'Fixed');
    await waitFor(() =>
      expect(screen.queryByText('Project name is required')).not.toBeInTheDocument()
    );
  });
});

describe('ProjectForm — submission', () => {
  it('calls createProject with correct data on valid submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Project',
          shortDescription: 'A short desc',
          lovableUrl: 'https://my-project.lovable.app/',
          tags: 'react, ts',
        })
      );
    });
  });

  it('navigates to /my-projects after successful create', async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/my-projects'));
  });

  it('calls updateProject (not createProject) in edit mode', async () => {
    const user = userEvent.setup();
    renderForm({ editMode: true, projectId: 'proj-99' });
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /update project/i }));

    await waitFor(() => {
      expect(mocks.updateProject).toHaveBeenCalledWith('proj-99', expect.any(Object));
      expect(mocks.createProject).not.toHaveBeenCalled();
    });
  });
});
