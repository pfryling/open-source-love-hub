
import { useToast } from "@/hooks/use-toast";
import ProjectForm from "@/components/ProjectForm";
import { ProjectFormData } from "@/types/project";
import { useWaitlist } from "@/contexts/WaitlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddProject = () => {
  const { toast } = useToast();
  const { isVerified, loading: waitlistLoading } = useWaitlist();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is not verified or not authenticated
  useEffect(() => {
    if (!waitlistLoading && !authLoading) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to add projects.",
          variant: "destructive"
        });
        navigate("/auth");
      } else if (!isVerified) {
        toast({
          title: "Verification required",
          description: "You need to verify your email before adding projects.",
          variant: "destructive"
        });
        navigate("/");
      }
    }
  }, [isVerified, waitlistLoading, user, authLoading, navigate, toast]);
  
  const handleSubmit = (data: ProjectFormData) => {
    // This will be handled in the ProjectForm component now
    console.log("Form submitted:", data);
  };
  
  if (waitlistLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Your Open Source Project</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your Lovable project with the community to find contributors and 
          collaborators who can help your project grow.
        </p>
      </div>
      
      <ProjectForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddProject;
