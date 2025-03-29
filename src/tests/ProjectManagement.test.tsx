
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddProject from '../pages/AddProject';
import { ProjectFormData } from '../types/project';
import { useToast } from '../hooks/use-toast';
import ProjectForm from '../components/ProjectForm';

// Mock the hooks and supabase client
vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock the contexts
vi.mock('../contexts/WaitlistContext', () => ({
  useWaitlist: vi.fn(() => ({
    isVerified: true,
    email: 'test@example.com',
  })),
}));

describe('Project Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the add project form', () => {
    render(
      <BrowserRouter>
        <AddProject />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Add Your Open Source Project/i)).toBeInTheDocument();
  });

  it('submits a new project successfully', async () => {
    const mockToast = vi.fn();
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    const mockOnSubmit = vi.fn();
    render(
      <BrowserRouter>
        <ProjectForm onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText(/Short Description/i), { target: { value: 'A test project' } });
    fireEvent.change(screen.getByLabelText(/Full Description/i), { target: { value: 'This is a test project with a full description' } });
    fireEvent.change(screen.getByLabelText(/Lovable URL/i), { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Project Goals/i), { target: { value: 'Test goals' } });
    fireEvent.change(screen.getByLabelText(/Contribution Areas/i), { target: { value: 'Test areas' } });
    fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 'test, demo' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Submit Project/i));
    
    // Check if onSubmit was called
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Project',
        shortDescription: 'A test project',
      }));
    });
  });

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <ProjectForm onSubmit={vi.fn()} />
      </BrowserRouter>
    );
    
    // Submit without filling required fields
    fireEvent.click(screen.getByText(/Submit Project/i));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Project name is required/i)).toBeInTheDocument();
    });
  });
});
