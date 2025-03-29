
import { useState } from "react";
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
import { ProjectFormData } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

interface ProjectFormProps {
  onSubmit?: (data: ProjectFormData) => void;
  isSubmitting?: boolean;
}

const ProjectForm = ({ onSubmit, isSubmitting = false }: ProjectFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    shortDescription: "",
    fullDescription: "",
    lovableUrl: "",
    contactEmail: "",
    contactDiscord: "",
    goals: "",
    contributionAreas: "",
    tags: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
        // Convert tags string to array
        const tagsArray = formData.tags.split(',').map(tag => tag.trim());
        
        // Get the authenticated user (if any)
        const { data: { session } } = await supabase.auth.getSession();
        
        // Insert the project into the database
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              name: formData.name,
              short_description: formData.shortDescription,
              full_description: formData.fullDescription,
              lovable_url: formData.lovableUrl,
              contact_email: formData.contactEmail,
              contact_discord: formData.contactDiscord,
              goals: formData.goals,
              contribution_areas: formData.contributionAreas,
              tags: tagsArray,
              user_id: session?.user?.id || null,
              contributors_count: 1,
              is_demo: false
            }
          ]);
        
        if (error) {
          throw error;
        }
        
        // Call the onSubmit prop if provided
        if (onSubmit) {
          onSubmit(formData);
        }
        
        toast({
          title: "Project submitted!",
          description: "Your project has been submitted successfully.",
        });
        
        navigate("/projects");
      } catch (error) {
        console.error('Error submitting project:', error);
        toast({
          title: "Error submitting project",
          description: "There was an error submitting your project. Please try again.",
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
        <CardTitle>Add Your Project</CardTitle>
        <CardDescription>
          Share your Lovable project with potential contributors. The more details you provide, 
          the easier it will be for others to understand and contribute to your project.
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
            {submitting || isSubmitting ? "Submitting..." : "Submit Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm;
