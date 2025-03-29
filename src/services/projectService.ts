
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectFormData } from '@/types/project';

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(formatProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const addProject = async (projectData: ProjectFormData, userId?: string): Promise<{ success: boolean; data?: Project; error?: string }> => {
  try {
    const tags = projectData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const insertData = {
      name: projectData.name,
      short_description: projectData.shortDescription,
      full_description: projectData.fullDescription,
      lovable_url: projectData.lovableUrl,
      contact_email: projectData.contactEmail,
      contact_discord: projectData.contactDiscord,
      goals: projectData.goals,
      contribution_areas: projectData.contributionAreas,
      tags,
      contributors_count: 1,
      // Add user_id if available
      ...(userId ? { user_id: userId } : {})
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error("Failed to retrieve created project");
    }

    return { success: true, data: formatProject(data[0]) };
  } catch (error: any) {
    console.error('Error adding project:', error);
    return { success: false, error: error.message || 'Failed to add project' };
  }
};

export const updateProject = async (id: string, projectData: Partial<ProjectFormData>): Promise<{ success: boolean; data?: Project; error?: string }> => {
  try {
    const updateData: any = {};
    
    if (projectData.name) updateData.name = projectData.name;
    if (projectData.shortDescription) updateData.short_description = projectData.shortDescription;
    if (projectData.fullDescription) updateData.full_description = projectData.fullDescription;
    if (projectData.lovableUrl) updateData.lovable_url = projectData.lovableUrl;
    if (projectData.contactEmail) updateData.contact_email = projectData.contactEmail;
    if (projectData.contactDiscord) updateData.contact_discord = projectData.contactDiscord;
    if (projectData.goals) updateData.goals = projectData.goals;
    if (projectData.contributionAreas) updateData.contribution_areas = projectData.contributionAreas;
    
    if (projectData.tags) {
      updateData.tags = projectData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error("Failed to retrieve updated project");
    }

    return { success: true, data: formatProject(data[0]) };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { success: false, error: error.message || 'Failed to update project' };
  }
};

export const deleteProject = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message || 'Failed to delete project' };
  }
};

// Helper function to format project data
const formatProject = (project: any): Project => ({
  id: project.id,
  name: project.name,
  shortDescription: project.short_description,
  fullDescription: project.full_description,
  lovableUrl: project.lovable_url,
  contactEmail: project.contact_email,
  contactDiscord: project.contact_discord,
  goals: project.goals,
  contributionAreas: project.contribution_areas,
  tags: project.tags,
  stars: project.stars,
  contributorsCount: project.contributors_count,
  lastUpdated: formatDate(project.last_updated),
  is_demo: project.is_demo,
  userId: project.user_id // Correctly map the user_id from database to userId in our type
});

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString();
};
