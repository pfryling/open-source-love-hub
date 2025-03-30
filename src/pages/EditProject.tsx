
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ProjectForm from "@/components/ProjectForm";
import { ProjectFormData, Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Format the project data
        setProject({
          id: data.id,
          name: data.name,
          shortDescription: data.short_description,
          fullDescription: data.full_description,
          lovableUrl: data.lovable_url,
          contactEmail: data.contact_email,
          contactDiscord: data.contact_discord,
          goals: data.goals,
          contributionAreas: data.contribution_areas,
          tags: data.tags || [],
          stars: data.stars,
          contributorsCount: data.contributors_count,
          lastUpdated: data.last_updated,
          image_url: data.image_url
        });
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project. Please try again.",
          variant: "destructive"
        });
        navigate("/my-projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id, toast, navigate]);
  
  const handleSubmit = (data: ProjectFormData) => {
    // This will be handled in the ProjectForm component
    console.log("Form submitted:", data);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're trying to edit doesn't exist or you don't have permission to edit it.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Project: {project.name}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Update your project details to keep information current for potential contributors.
        </p>
      </div>
      
      <ProjectForm 
        onSubmit={handleSubmit} 
        editMode={true}
        projectId={project.id}
        initialData={{
          name: project.name,
          shortDescription: project.shortDescription,
          fullDescription: project.fullDescription,
          lovableUrl: project.lovableUrl || "",
          contactEmail: project.contactEmail || "",
          contactDiscord: project.contactDiscord || "",
          goals: project.goals || "",
          contributionAreas: project.contributionAreas || "",
          tags: project.tags.join(", ")
        }}
      />
    </div>
  );
};

export default EditProject;
