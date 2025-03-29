
import { useToast } from "@/components/ui/use-toast";
import ProjectForm from "@/components/ProjectForm";
import { ProjectFormData } from "@/types/project";

const AddProject = () => {
  const { toast } = useToast();
  
  const handleSubmit = (data: ProjectFormData) => {
    // In a real app, you would send this data to an API
    console.log("Form submitted:", data);
    
    // Show success toast
    toast({
      title: "Project submitted successfully!",
      description: "Your project has been added to our database and will be reviewed soon.",
    });
  };
  
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
