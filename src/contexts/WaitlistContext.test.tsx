import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { WaitlistProvider, useWaitlist } from './WaitlistContext';

// ── Hoisted mock functions ─────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ data: [{ id: 'new-proj' }], error: null }),
  update: vi.fn(),
  eq: vi.fn().mockResolvedValue({ error: null }),
  select: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mocks.insert,
      update: mocks.update,
      select: mocks.select,
      eq: mocks.eq,
    })),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// ──────────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WaitlistProvider>{children}</WaitlistProvider>
);

const sampleFormData = {
  name: 'Test Project',
  shortDescription: 'A test project',
  fullDescription: 'Full description here',
  lovableUrl: 'https://test.lovable.app/',
  contactEmail: 'test@example.com',
  contactDiscord: '',
  goals: 'Goal text',
  contributionAreas: 'Frontend',
  tags: 'react, typescript',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.insert.mockResolvedValue({ data: [{ id: 'new-proj' }], error: null });
  mocks.select.mockResolvedValue({ data: [], error: null });
  mocks.update.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockResolvedValue({ error: null });
});

// ──────────────────────────────────────────────────────────────────────────

describe('useWaitlist', () => {
  it('initialises with isVerified=true (demo mode)', async () => {
    const { result } = renderHook(() => useWaitlist(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isVerified).toBe(true);
    expect(result.current.email).toBe('demo-user@example.com');
  });
});

describe('joinWaitlist', () => {
  it('returns success and sets email', async () => {
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.joinWaitlist('user@example.com');
    });

    expect(response?.success).toBe(true);
    expect(result.current.email).toBe('user@example.com');
    expect(result.current.isVerified).toBe(true);
  });
});

describe('verifyEmail', () => {
  it('always returns success (demo mode)', async () => {
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let response: { success: boolean } | undefined;
    await act(async () => {
      response = await result.current.verifyEmail('any-token');
    });

    expect(response?.success).toBe(true);
  });
});

describe('createProject', () => {
  it('calls supabase insert with correct shape', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.createProject(sampleFormData);
    });

    expect(response?.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('oshub_projects');
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Test Project',
          short_description: 'A test project',
          tags: ['react', 'typescript'],
        }),
      ])
    );
  });

  it('converts tags string to trimmed array', async () => {
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    await act(async () => {
      await result.current.createProject({
        ...sampleFormData,
        tags: ' react , typescript , zod ',
      });
    });

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ tags: ['react', 'typescript', 'zod'] }),
      ])
    );
  });

  it('returns success:false and message on Supabase error', async () => {
    mocks.insert.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.createProject(sampleFormData);
    });

    expect(response?.success).toBe(false);
    expect(response?.message).toBe('DB error');
  });
});

describe('updateProject', () => {
  it('calls supabase update and eq with the correct project id', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let response: { success: boolean } | undefined;
    await act(async () => {
      response = await result.current.updateProject('proj-42', {
        ...sampleFormData,
        image_url: 'https://img.example.com/pic.png',
      });
    });

    expect(response?.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('oshub_projects');
    expect(mocks.eq).toHaveBeenCalledWith('id', 'proj-42');
  });

  it('strips empty tags from array', async () => {
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    await act(async () => {
      await result.current.updateProject('proj-42', {
        ...sampleFormData,
        tags: 'react,,  ,ts',
      });
    });

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['react', 'ts'] })
    );
  });
});

describe('getUserProjects', () => {
  it('returns projects from Supabase', async () => {
    mocks.select.mockResolvedValue({
      data: [{ id: '1', name: 'Project A' }],
      error: null,
    });
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let projects: any[] | undefined;
    await act(async () => {
      projects = await result.current.getUserProjects();
    });

    expect(projects).toHaveLength(1);
    expect(projects![0].name).toBe('Project A');
  });

  it('returns empty array on Supabase error', async () => {
    mocks.select.mockResolvedValue({ data: null, error: { message: 'fail' } });
    const { result } = renderHook(() => useWaitlist(), { wrapper });

    let projects: any[] | undefined;
    await act(async () => {
      projects = await result.current.getUserProjects();
    });

    expect(projects).toEqual([]);
  });
});
