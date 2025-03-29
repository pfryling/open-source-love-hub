
import { useToast } from "@/components/ui/use-toast";
import ProjectForm from "@/components/ProjectForm";
import { ProjectFormData } from "@/types/project";
import { useWaitlist } from "@/contexts/WaitlistContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddProject = () => {
  const { toast } = useToast();
  const { isVerified, loading } = useWaitlist();
  const navigate = useNavigate();
  
  // Redirect if user is not verified
  useEffect(() => {
    if (!loading && !isVerified) {
      toast({
        title: "Verification required",
        description: "You need to verify your email before adding projects.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isVerified, loading, navigate, toast]);
  
  const handleSubmit = (data: ProjectFormData) => {
    // This will be handled in the ProjectForm component now
    console.log("Form submitted:", data);
  };
  
  if (loading) {
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
