import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProjectFormData } from "@/types/project";

interface WaitlistContextType {
  email: string | null;
  isVerified: boolean;
  loading: boolean;
  joinWaitlist: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  checkWaitlistStatus: (email: string) => Promise<boolean>;
  setEmail: (email: string | null) => void;
  createProject: (project: ProjectFormData) => Promise<{ success: boolean; message: string; data?: any }>;
  getUserProjects: () => Promise<any[]>;
  updateProject: (projectId: string, formData: ProjectFormData & { image_url?: string }) => Promise<{ success: boolean }>;
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

export const WaitlistProvider = ({ children }: { children: ReactNode }) => {
  // Set a default demo email and always set isVerified to true
  const [email, setEmail] = useState<string | null>("demo-user@example.com");
  const [isVerified, setIsVerified] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Modified to bypass waitlist check on load
  useEffect(() => {
    // Initialize with demo user, no need to check verification
    setLoading(false);
  }, []);

  const joinWaitlist = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Simply save email to state and localStorage, always set as verified
      localStorage.setItem("waitlist-email", email);
      setEmail(email);
      setIsVerified(true);

      return { 
        success: true, 
        message: "You're now verified and can use all features!" 
      };
    } catch (error: any) {
      console.error("Error joining waitlist:", error);
      return { 
        success: false, 
        message: error.message || "An error occurred while joining the waitlist." 
      };
    }
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    // Always verify successfully
    setIsVerified(true);
    return { 
      success: true, 
      message: "Email verified successfully! You can now participate fully." 
    };
  };

  const checkWaitlistStatus = async (email: string): Promise<boolean> => {
    // Always return verified status
    return true;
  };

  // Modified to not require a waitlist user
  const createProject = async (projectData: ProjectFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      // Convert tags string to array
      const tagsArray = projectData.tags.split(',').map(tag => tag.trim());
      
      // Insert the project into the database without requiring a waitlist user_id
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: projectData.name,
            short_description: projectData.shortDescription,
            full_description: projectData.fullDescription,
            lovable_url: projectData.lovableUrl,
            contact_email: projectData.contactEmail,
            contact_discord: projectData.contactDiscord,
            goals: projectData.goals,
            contribution_areas: projectData.contributionAreas,
            tags: tagsArray,
            contributors_count: 1,
            is_demo: false,
            last_updated: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: "Project created successfully!", 
        data 
      };
    } catch (error: any) {
      console.error("Error creating project:", error);
      return { 
        success: false, 
        message: error.message || "An error occurred while creating the project." 
      };
    }
  };

  // Modified to not require a waitlist user
  const getUserProjects = async (): Promise<any[]> => {
    try {
      // Get all projects (no user filtering)
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

  const updateProject = async (projectId: string, formData: ProjectFormData & { image_url?: string }) => {
    try {
      // Process tags from comma-separated string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      // Prepare the data for Supabase
      const projectData = {
        name: formData.name,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription,
        lovable_url: formData.lovableUrl,
        contact_email: formData.contactEmail,
        contact_discord: formData.contactDiscord,
        goals: formData.goals,
        contribution_areas: formData.contributionAreas,
        tags: tagsArray,
        image_url: formData.image_url
      };
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating project:', error);
      return {
        success: false,
        message: error.message || 'There was an error updating your project.'
      };
    }
  };

  const value = {
    email,
    isVerified,
    loading,
    joinWaitlist,
    verifyEmail,
    checkWaitlistStatus,
    setEmail,
    createProject,
    getUserProjects,
    updateProject
  };

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>;
};

export const useWaitlist = () => {
  const context = useContext(WaitlistContext);
  if (context === undefined) {
    throw new Error("useWaitlist must be used within a WaitlistProvider");
  }
  return context;
};
