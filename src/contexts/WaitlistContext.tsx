
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
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

export const WaitlistProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for saved email
    const savedEmail = localStorage.getItem("waitlist-email");
    if (savedEmail) {
      setEmail(savedEmail);
      // Check verification status
      checkWaitlistStatus(savedEmail).then((verified) => {
        setIsVerified(verified);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const joinWaitlist = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if email already exists and is verified
      const { data: existingEntries } = await supabase
        .from("waitlist")
        .select("*")
        .eq("email", email);

      if (existingEntries && existingEntries.length > 0) {
        const entry = existingEntries[0];
        if (entry.is_verified) {
          // Already verified
          setEmail(email);
          setIsVerified(true);
          localStorage.setItem("waitlist-email", email);
          return { 
            success: true, 
            message: "Your email is already verified! You can now participate fully." 
          };
        } else {
          // Re-send verification
          const { data } = await supabase.functions.invoke("verify-email", {
            body: { email }
          });
          
          return { 
            success: true, 
            message: "A new verification email has been sent. Please check your inbox." 
          };
        }
      }

      // Insert new entry
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email }]);

      if (error) throw error;
      
      // Save email to local storage
      localStorage.setItem("waitlist-email", email);
      setEmail(email);

      // Send verification email
      const { data } = await supabase.functions.invoke("verify-email", {
        body: { email }
      });

      console.log("Email verification response:", data);

      return { 
        success: true, 
        message: "Thank you for joining the waitlist! Please check your email for verification." 
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
    try {
      // Find entry with token
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .eq("verification_token", token)
        .single();

      if (error || !data) {
        throw new Error("Invalid or expired verification token.");
      }

      // Update verification status
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({ is_verified: true })
        .eq("id", data.id);

      if (updateError) throw updateError;

      // Update local state
      setEmail(data.email);
      setIsVerified(true);
      localStorage.setItem("waitlist-email", data.email);

      return { 
        success: true, 
        message: "Email verified successfully! You can now participate fully." 
      };
    } catch (error: any) {
      console.error("Error verifying email:", error);
      return { 
        success: false, 
        message: error.message || "An error occurred during verification." 
      };
    }
  };

  const checkWaitlistStatus = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from("waitlist")
        .select("is_verified")
        .eq("email", email)
        .single();

      return data?.is_verified || false;
    } catch (error) {
      console.error("Error checking waitlist status:", error);
      return false;
    }
  };

  // New function to create a project
  const createProject = async (projectData: ProjectFormData): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      if (!email) {
        throw new Error("You need to join the waitlist first");
      }
      
      if (!isVerified) {
        throw new Error("You need to verify your email before creating projects");
      }

      // Find waitlist user ID
      const { data: waitlistUser } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", email)
        .single();

      if (!waitlistUser) {
        throw new Error("Waitlist user not found");
      }

      // Convert tags string to array
      const tagsArray = projectData.tags.split(',').map(tag => tag.trim());
      
      // Insert the project into the database
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
            user_id: waitlistUser.id, // Use waitlist user ID instead of auth user ID
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

  // New function to get user projects
  const getUserProjects = async (): Promise<any[]> => {
    try {
      if (!email || !isVerified) {
        return [];
      }

      // Find waitlist user ID
      const { data: waitlistUser } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", email)
        .single();

      if (!waitlistUser) {
        return [];
      }

      // Get projects for this user
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', waitlistUser.id);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching user projects:", error);
      return [];
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
    getUserProjects
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
