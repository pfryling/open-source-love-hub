
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { 
  GitFork, 
  Calendar, 
  Users, 
  Heart, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  ArrowLeft, 
  Target, 
  HandHelping,
  Plus,
  ThumbsUp,
  Loader2
} from "lucide-react";
import { mockProjects } from "@/data/mockProjects";
import { ProjectFeature, Project } from "@/types/project";
import { useVotes } from "@/utils/voteUtils";
import { useToast } from "@/hooks/use-toast";
import VoteCounter from "@/components/VoteCounter";
import { supabase } from "@/integrations/supabase/client";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<ProjectFeature[]>([]);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const { votes: projectVotes, remainingVotes, addVote, removeVote } = useVotes();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // Fetch project from Supabase
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
          
        if (projectError) {
          console.error('Error fetching project:', projectError);
          // Try to fallback to mock data
          const mockProject = mockProjects.find(p => p.id === id);
          if (mockProject) {
            setProject(mockProject);
            setFeatures(mockProject.features || []);
          } else {
            throw projectError;
          }
          return;
        }
        
        // Format the project data to match our Project interface
        const formattedProject: Project = {
          id: projectData.id,
          name: projectData.name,
          shortDescription: projectData.short_description,
          fullDescription: projectData.full_description,
          lovableUrl: projectData.lovable_url,
          contactEmail: projectData.contact_email,
          contactDiscord: projectData.contact_discord,
          goals: projectData.goals,
          contributionAreas: projectData.contribution_areas,
          tags: projectData.tags || [],
          stars: projectData.stars,
          contributorsCount: projectData.contributors_count,
          lastUpdated: formatDate(projectData.last_updated),
          is_demo: projectData.is_demo
        };
        
        setProject(formattedProject);
        
        // Fetch project features
        const { data: featureData, error: featureError } = await supabase
          .from('project_features')
          .select('*')
          .eq('project_id', id);
          
        if (featureError) {
          console.error('Error fetching features:', featureError);
          setFeatures([]);
        } else {
          const formattedFeatures: ProjectFeature[] = featureData.map(feature => ({
            id: feature.id,
            name: feature.name,
            description: feature.description,
            votes: feature.votes || 0,
            status: (feature.status as "planned" | "in-progress" | "completed" | "suggested") || "suggested"
          }));
          
          setFeatures(formattedFeatures);
        }
      } catch (error) {
        console.error('Error loading project details:', error);
        toast({
          title: "Error Loading Project",
          description: "Could not load the project details. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProject();
    }
  }, [id, toast]);

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    
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

  const form = useForm({
    defaultValues: {
      featureName: "",
      featureDescription: "",
      agreeToContribute: false
    }
  });
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/projects">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const handleVoteOnFeature = async (featureId: string, increment: boolean): Promise<boolean> => {
    try {
      // First update the UI optimistically
      setFeatures(prev => 
        prev.map(feature => 
          feature.id === featureId 
            ? { ...feature, votes: feature.votes + (increment ? 1 : -1) } 
            : feature
        )
      );
      
      // Then update the database
      const { error } = await supabase
        .from('project_features')
        .update({ 
          votes: increment 
            ? supabase.rpc('increment', { x: 'votes' }) 
            : supabase.rpc('decrement', { x: 'votes' }) 
        })
        .eq('id', featureId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: increment ? "Vote added" : "Vote removed",
        description: `Your vote for this feature has been ${increment ? "added" : "removed"}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating feature vote:', error);
      
      // Revert the optimistic update
      setFeatures(prev => 
        prev.map(feature => 
          feature.id === featureId 
            ? { ...feature, votes: feature.votes + (increment ? -1 : 1) } 
            : feature
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const handleVoteOnProject = (increment: boolean): boolean => {
    const projectId = project?.id;
    if (!projectId) return false;
    
    // Call the addVote or removeVote function synchronously
    const success = increment ? addVote(projectId) : removeVote(projectId);
    
    if (success) {
      if (increment) {
        toast({
          title: "Vote Added",
          description: `You've voted for ${project.name}. You have ${remainingVotes - 1} votes remaining.`,
        });
      } else {
        toast({
          title: "Vote Removed",
          description: `You've removed your vote from ${project.name}. You now have ${remainingVotes + 1} votes remaining.`,
        });
      }
    } else if (increment && remainingVotes <= 0) {
      toast({
        title: "No Votes Remaining",
        description: "You've used all your available votes. Remove votes from other projects to vote again.",
        variant: "destructive"
      });
    }
    
    return success;
  };

  const onSubmitFeature = async (data: any) => {
    try {
      // Create new feature object
      const newFeature: Omit<ProjectFeature, 'id'> & { project_id: string } = {
        name: data.featureName,
        description: data.featureDescription,
        votes: 1, // Start with 1 vote (the suggester's vote)
        status: "suggested" as const,
        project_id: project.id
      };
      
      // Insert the feature into Supabase
      const { data: insertedFeature, error } = await supabase
        .from('project_features')
        .insert(newFeature)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add the feature to the local state
      const formattedFeature: ProjectFeature = {
        id: insertedFeature.id,
        name: insertedFeature.name,
        description: insertedFeature.description,
        votes: insertedFeature.votes || 1,
        status: (insertedFeature.status as "suggested" | "planned" | "in-progress" | "completed") || "suggested"
      };
      
      setFeatures(prev => [...prev, formattedFeature]);
      form.reset();
      setShowSuggestionForm(false);
      
      toast({
        title: "Feature Suggested",
        description: "Your feature suggestion has been added with an initial vote from you.",
      });
    } catch (error) {
      console.error('Error adding feature:', error);
      toast({
        title: "Error",
        description: "Failed to add feature suggestion. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Link to="/projects" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Projects
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <VoteCounter 
                  projectId={project.id}
                  voteCount={projectVotes[project.id] || 0}
                  onVote={handleVoteOnProject}
                  remainingVotes={remainingVotes}
                  isDemo={project.is_demo}
                />
                <span className="text-lg font-medium ml-2">{project.stars || 0} stars</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-gray-500" />
                <span>{project.contributorsCount} contributors</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <span>Updated {project.lastUpdated}</span>
              </div>
              <a 
                href={project.lovableUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                <span>Visit Lovable Project</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About the Project</h2>
                <p className="text-gray-700 whitespace-pre-line">{project.fullDescription}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Project Goals</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{project.goals}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <HandHelping className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">How You Can Contribute</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{project.contributionAreas}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-primary" />
                    Feature Requests
                  </CardTitle>
                  <Dialog open={showSuggestionForm} onOpenChange={setShowSuggestionForm}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Suggest Feature
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Suggest a New Feature</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitFeature)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="featureName"
                            rules={{ required: "Feature name is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Feature Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter feature name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="featureDescription"
                            rules={{ required: "Description is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe what this feature would do and why it's valuable" 
                                    {...field} 
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="agreeToContribute"
                            rules={{ required: "You must agree to potentially contribute" }}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I'm willing to contribute to this feature if it's accepted
                                  </FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowSuggestionForm(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Submit Feature</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {features.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Votes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {features.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          <TableCell>{feature.description}</TableCell>
                          <TableCell>
                            <Badge variant={
                              feature.status === 'completed' 
                                ? 'default'
                                : feature.status === 'in-progress'
                                ? 'secondary'
                                : 'outline'
                            }>
                              {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <VoteCounter
                                projectId={`feature-${feature.id}`}
                                voteCount={feature.votes}
                                onVote={increment => handleVoteOnFeature(feature.id, increment)}
                                remainingVotes={remainingVotes}
                                isDemo={project.is_demo}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No feature requests yet. Be the first to suggest one!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Get Involved</h2>
                <a 
                  href={project.lovableUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full"
                >
                  <Button className="w-full mb-4">
                    <GitFork className="mr-2 h-4 w-4" />
                    Join This Project
                  </Button>
                </a>
                <p className="text-sm text-gray-600 mb-4">
                  Ready to contribute? Click the button above to visit the Lovable project page and get started.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                {project.contactEmail && (
                  <div className="flex items-start mb-4">
                    <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <a 
                        href={`mailto:${project.contactEmail}`} 
                        className="text-primary hover:underline break-all"
                      >
                        {project.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {project.contactDiscord && (
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Discord</h3>
                      <p className="text-gray-700">{project.contactDiscord}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
