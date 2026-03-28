import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Project, ProjectFormData } from "@/types/project";
import { useWaitlist } from "@/contexts/WaitlistContext";
import ImageUpload from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";

interface ProjectFormProps {
  onSubmit?: (data: ProjectFormData) => void;
  isSubmitting?: boolean;
  editMode?: boolean;
  projectId?: string;
  initialData?: Partial<ProjectFormData> & { image_url?: string };
}

const ProjectForm = ({ 
  onSubmit, 
  isSubmitting = false, 
  editMode = false,
  projectId,
  initialData 
}: ProjectFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createProject, updateProject, getUserProjects } = useWaitlist();
  
  const [formData, setFormData] = useState<ProjectFormData & { image_url?: string }>({
    name: "",
    shortDescription: "",
    fullDescription: "",
    lovableUrl: "",
    contactEmail: "",
    contactDiscord: "",
    goals: "",
    contributionAreas: "",
    tags: "",
    image_url: "",
    github_url: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (editMode && projectId) {
        try {
          // First try to fetch from getUserProjects
          const userProjects = await getUserProjects();
          const project = userProjects.find(p => p.id === projectId);
          
          if (project) {
            setFormData({
              name: project.name || "",
              shortDescription: project.shortDescription || "",
              fullDescription: project.fullDescription || "",
              lovableUrl: project.lovableUrl || "",
              contactEmail: project.contactEmail || "",
              contactDiscord: project.contactDiscord || "",
              goals: project.goals || "",
              contributionAreas: project.contributionAreas || "",
              tags: project.tags?.join(", ") || "",
              image_url: project.image_url || "",
              github_url: project.github_url || ""
            });
            return;
          }
          
          // If not found or empty, try direct Supabase fetch
          const { data, error } = await (supabase
            .from('oshub_projects') as any)
            .select('*')
            .eq('id', projectId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setFormData({
              name: data.name || "",
              shortDescription: data.short_description || "",
              fullDescription: data.full_description || "",
              lovableUrl: data.lovable_url || "",
              contactEmail: data.contact_email || "",
              contactDiscord: data.contact_discord || "",
              goals: data.goals || "",
              contributionAreas: data.contribution_areas || "",
              tags: data.tags?.join(", ") || "",
              image_url: data.image_url || "",
              github_url: data.github_url || ""
            });
          }
        } catch (error) {
          console.error("Error fetching project data:", error);
          toast({
            title: "Error",
            description: "Failed to load project data. Please try again.",
            variant: "destructive"
          });
        }
      } else if (initialData) {
        setFormData(prev => ({
          ...prev,
          ...initialData
        }));
      }
    };
    
    fetchProjectData();
  }, [editMode, projectId, getUserProjects, toast, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (url: string | null) => {
    setFormData(prev => ({
      ...prev,
      image_url: url || ""
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    } else if (formData.shortDescription.length > 150) {
      newErrors.shortDescription = "Short description must be less than 150 characters";
    }
    
    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = "Full description is required";
    }
    
    if (!formData.lovableUrl.trim()) {
      newErrors.lovableUrl = "Lovable URL is required";
    } else if (!formData.lovableUrl.includes("lovable.dev") && !formData.lovableUrl.includes("lovable.app")) {
      newErrors.lovableUrl = "URL must be a valid Lovable project URL (lovable.dev or lovable.app)";
    }
    
    if (!formData.contactEmail.trim() && !formData.contactDiscord.trim()) {
      newErrors.contactEmail = "At least one contact method is required";
      newErrors.contactDiscord = "At least one contact method is required";
    } else if (
      formData.contactEmail.trim() && 
      !/^\S+@\S+\.\S+$/.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    
    if (!formData.goals.trim()) {
      newErrors.goals = "Project goals are required";
    }
    
    if (!formData.contributionAreas.trim()) {
      newErrors.contributionAreas = "Contribution areas are required";
    }
    
    if (!formData.tags.trim()) {
      newErrors.tags = "At least one tag is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      try {
        const formDataToSubmit: ProjectFormData & { image_url?: string } = {
          ...formData
        };
        
        let result;
        
        if (editMode && projectId) {
          // Update existing project
          result = await updateProject(projectId, formDataToSubmit);
        } else {
          // Create new project
          result = await createProject(formDataToSubmit);
        }
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        // Call the onSubmit prop if provided
        if (onSubmit) {
          onSubmit(formData);
        }
        
        toast({
          title: editMode ? "Project updated!" : "Project submitted!",
          description: editMode 
            ? "Your project has been updated successfully." 
            : "Your project has been submitted successfully.",
        });
        
        navigate("/my-projects");
      } catch (error: any) {
        console.error('Error submitting project:', error);
        toast({
          title: `Error ${editMode ? 'updating' : 'submitting'} project`,
          description: error.message || `There was an error ${editMode ? 'updating' : 'submitting'} your project. Please try again.`,
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      toast({
        title: "Form has errors",
        description: "Please fix the errors in the form and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{editMode ? "Edit Your Project" : "Add Your Project"}</CardTitle>
        <CardDescription>
          {editMode 
            ? "Update your project details to keep information current for potential contributors."
            : "Share your Lovable project with potential contributors. The more details you provide, the easier it will be for others to understand and contribute to your project."
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          
          <ImageUpload 
            value={formData.image_url} 
            onChange={handleImageChange} 
          />
          
          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="text-base">
              Short Description <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 ml-2">(max 150 characters)</span>
            </Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className={errors.shortDescription ? "border-red-500" : ""}
            />
            {errors.shortDescription && <p className="text-red-500 text-sm">{errors.shortDescription}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullDescription" className="text-base">
              Full Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="fullDescription"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows={5}
              className={errors.fullDescription ? "border-red-500" : ""}
            />
            {errors.fullDescription && <p className="text-red-500 text-sm">{errors.fullDescription}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lovableUrl" className="text-base">
              Lovable Project URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lovableUrl"
              name="lovableUrl"
              value={formData.lovableUrl}
              onChange={handleChange}
              placeholder="https://lovable.dev/projects/your-project-id"
              className={errors.lovableUrl ? "border-red-500" : ""}
            />
            {errors.lovableUrl && <p className="text-red-500 text-sm">{errors.lovableUrl}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github_url" className="text-base">
              GitHub Repository URL
            </Label>
            <Input
              id="github_url"
              name="github_url"
              value={formData.github_url || ""}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-base">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                className={errors.contactEmail ? "border-red-500" : ""}
              />
              {errors.contactEmail && <p className="text-red-500 text-sm">{errors.contactEmail}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactDiscord" className="text-base">
                Discord Username
              </Label>
              <Input
                id="contactDiscord"
                name="contactDiscord"
                value={formData.contactDiscord}
                onChange={handleChange}
                className={errors.contactDiscord ? "border-red-500" : ""}
              />
              {errors.contactDiscord && <p className="text-red-500 text-sm">{errors.contactDiscord}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goals" className="text-base">
              Project Goals <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="What are the main goals of your project? What problem does it solve?"
              rows={3}
              className={errors.goals ? "border-red-500" : ""}
            />
            {errors.goals && <p className="text-red-500 text-sm">{errors.goals}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contributionAreas" className="text-base">
              Areas Where You Need Contributors <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="contributionAreas"
              name="contributionAreas"
              value={formData.contributionAreas}
              onChange={handleChange}
              placeholder="What specific areas need help? E.g., UI design, feature implementation, testing"
              rows={3}
              className={errors.contributionAreas ? "border-red-500" : ""}
            />
            {errors.contributionAreas && <p className="text-red-500 text-sm">{errors.contributionAreas}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-base">
              Tags <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 ml-2">(comma separated)</span>
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, typescript, ecommerce, etc."
              className={errors.tags ? "border-red-500" : ""}
            />
            {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || isSubmitting}>
            {submitting || isSubmitting 
              ? (editMode ? "Updating..." : "Submitting...") 
              : (editMode ? "Update Project" : "Submit Project")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm;
