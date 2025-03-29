
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectForm from "@/components/ProjectForm";
import { addProject } from "@/services/projectService";
import { ProjectFormData } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AddProject = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (formData: ProjectFormData) => {
    setLoading(true);

    try {
      // Pass the user ID if authenticated with Supabase
      const userId = user?.id;
      const result = await addProject(formData, userId);

      if (result.success && result.data) {
        toast({
          title: "Project added successfully!",
          description: "Your project has been added to the platform.",
        });
        navigate(`/projects/${result.data.id}`);
      } else {
        toast({
          title: "Failed to add project",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add Your Project</CardTitle>
          <CardDescription>
            Share your open source project with the community to get feedback and contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm onSubmit={handleSubmit} isSubmitting={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProject;
