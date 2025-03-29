import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import VoteCounter from "@/components/VoteCounter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WaitlistGuard from "@/components/WaitlistGuard";
import { ProjectFeature } from "@/types/project";

const featureSchema = z.object({
  featureName: z
    .string()
    .min(3, { message: "Feature name must be at least 3 characters" })
    .max(100, { message: "Feature name must not exceed 100 characters" }),
  featureDescription: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description must not exceed 500 characters" }),
});

type FeatureStatus = "suggested" | "planned" | "in-progress" | "completed";
type TabType = "all" | FeatureStatus;

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [features, setFeatures] = useState<ProjectFeature[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [remainingVotes, setRemainingVotes] = useState<number>(3);
  const [projectVotes, setProjectVotes] = useState<{ [projectId: string]: number }>({});

  const handleVoteOnProject = async (increment: boolean): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on this project",
        variant: "destructive",
      });
      return false;
    }

    if (!project) return false;

    try {
      if (increment && remainingVotes <= 0) {
        toast({
          title: "No votes remaining",
          description: "You have used all your available votes.",
          variant: "destructive",
        });
        return false;
      }

      setProjectVotes((prevVotes) => ({
        ...prevVotes,
        [project.id]: (prevVotes[project.id] || 0) + (increment ? 1 : -1),
      }));

      setRemainingVotes((prev) => (increment ? prev - 1 : prev + 1));

      if (increment) {
        await supabase.rpc('increment_votes', { table_name: 'projects', row_id: project.id });
      } else {
        await supabase.rpc('decrement_votes', { table_name: 'projects', row_id: project.id });
      }
      
      return true;
    } catch (error) {
      console.error("Error voting on project:", error);
      toast({
        title: "Vote failed",
        description: "There was an error processing your vote",
        variant: "destructive",
      });

      setProjectVotes((prevVotes) => ({
        ...prevVotes,
        [project.id]: (prevVotes[project.id] || 0) - (increment ? 1 : -1),
      }));
      setRemainingVotes((prev) => (increment ? prev + 1 : prev - 1));
      
      return false;
    }
  };

  const handleVoteOnFeature = async (featureId: string, increment: boolean): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on features",
        variant: "destructive",
      });
      return false;
    }

    try {
      setFeatures((prevFeatures) =>
        prevFeatures.map((feature) => {
          if (feature.id === featureId) {
            return {
              ...feature,
              votes: increment
                ? feature.votes + 1
                : Math.max(0, feature.votes - 1),
            };
          }
          return feature;
        })
      );

      if (increment) {
        await supabase.rpc('increment_votes', { table_name: 'project_features', row_id: featureId });
      } else {
        await supabase.rpc('decrement_votes', { table_name: 'project_features', row_id: featureId });
      }
      
      setRemainingVotes((prev) => (increment ? prev - 1 : prev + 1));
      return true;
    } catch (error) {
      console.error("Error voting on feature:", error);
      toast({
        title: "Vote failed",
        description: "There was an error processing your vote",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();
        
        if (projectError) throw projectError;
        if (!projectData) throw new Error("Project not found");
        
        setProject(projectData);
        
        const { data: featuresData, error: featuresError } = await supabase
          .from("project_features")
          .select("*")
          .eq("project_id", id);
          
        if (featuresError) throw featuresError;
        
        const formattedFeatures: ProjectFeature[] = featuresData.map(feature => ({
            id: feature.id,
            name: feature.name,
            description: feature.description,
            votes: feature.votes || 0,
            status: (feature.status as FeatureStatus) || "suggested"
          }));
          
          setFeatures(formattedFeatures);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast]);

  const form = useForm<z.infer<typeof featureSchema>>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      featureName: "",
      featureDescription: "",
    },
  });

  useEffect(() => {
    const storedVotes = localStorage.getItem('remainingVotes');
    if (storedVotes) {
      setRemainingVotes(parseInt(storedVotes, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('remainingVotes', remainingVotes.toString());
  }, [remainingVotes]);

  const onSubmit = async (data: z.infer<typeof featureSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to suggest a feature",
        variant: "destructive",
      });
      return;
    }
    
    if (!project) return;
    
    try {
      setIsSubmitting(true);
      
      const newFeature = {
        name: data.featureName,
        description: data.featureDescription,
        votes: 1,
        status: "suggested" as FeatureStatus,
        project_id: project.id
      };
      
      const { data: insertedFeatureData, error } = await supabase
        .from("project_features")
        .insert(newFeature)
        .select()
        .single();
        
      if (error) throw error;
      
      const insertedFeature = insertedFeatureData;
      
      const formattedFeature: ProjectFeature = {
        id: insertedFeature.id,
        name: insertedFeature.name,
        description: insertedFeature.description,
        votes: insertedFeature.votes || 1,
        status: (insertedFeature.status as FeatureStatus) || "suggested"
      };
      
      setFeatures(prev => [...prev, formattedFeature]);
      
      form.reset();
      
      toast({
        title: "Feature suggested",
        description: "Your feature has been successfully suggested",
      });
      
      setActiveTab("suggested");
    } catch (error) {
      console.error("Error suggesting feature:", error);
      toast({
        title: "Error",
        description: "Failed to suggest feature. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : project ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                to="/projects"
                className="text-primary hover:underline mb-4 inline-block"
              >
                ← Back to Projects
              </Link>
              <h1 className="text-3xl font-bold">{project.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <VoteCounter
                  projectId={project.id}
                  voteCount={projectVotes[project.id] || project.votes || 0}
                  onVote={handleVoteOnProject}
                  remainingVotes={remainingVotes}
                  isDemo={project.is_demo}
                />
                <span className="text-lg font-medium ml-2">{project.stars || 0} stars</span>
              </div>
              {project.lovable_url && (
                <Button variant="outline" asChild>
                  <a
                    href={project.lovable_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Try Now
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About the Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Description</h3>
                      <p className="mt-2 whitespace-pre-line">
                        {project.full_description}
                      </p>
                    </div>

                    {project.goals && (
                      <div>
                        <h3 className="text-lg font-semibold">Goals</h3>
                        <p className="mt-2 whitespace-pre-line">
                          {project.goals}
                        </p>
                      </div>
                    )}

                    {project.contribution_areas && (
                      <div>
                        <h3 className="text-lg font-semibold">
                          Areas for Contribution
                        </h3>
                        <p className="mt-2 whitespace-pre-line">
                          {project.contribution_areas}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <WaitlistGuard>
                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggest a Feature</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6"
                        >
                          <FormField
                            control={form.control}
                            name="featureName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Feature Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter a name for the feature"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="featureDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the feature in detail"
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Suggest Feature"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </WaitlistGuard>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Contributors
                      </h3>
                      <p className="mt-1">
                        {project.contributors_count || 0} contributors
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </h3>
                      <p className="mt-1">
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Last Updated
                      </h3>
                      <p className="mt-1">
                        {project.last_updated
                          ? new Date(
                              project.last_updated
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    {(project.contact_email || project.contact_discord) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Contact
                        </h3>
                        <div className="mt-1 space-y-1">
                          {project.contact_email && (
                            <p>Email: {project.contact_email}</p>
                          )}
                          {project.contact_discord && (
                            <p>Discord: {project.contact_discord}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Features & Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as TabType)}
                >
                  <TabsList>
                    <TabsTrigger value="all">All Features</TabsTrigger>
                    <TabsTrigger value="suggested">Suggested</TabsTrigger>
                    <TabsTrigger value="planned">Planned</TabsTrigger>
                    <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  {["all", "suggested", "planned", "in-progress", "completed"].map(
                    (tab) => (
                      <TabsContent key={tab} value={tab}>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Feature Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Votes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {features
                              .filter(
                                (feature) =>
                                  tab === "all" || feature.status === tab
                              )
                              .sort((a, b) => b.votes - a.votes)
                              .map((feature) => (
                                <TableRow key={feature.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">
                                        {feature.name}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {feature.description}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        feature.status === "completed"
                                          ? "default"
                                          : feature.status === "in-progress"
                                          ? "secondary"
                                          : feature.status === "planned"
                                          ? "outline"
                                          : "destructive"
                                      }
                                    >
                                      {feature.status === "in-progress"
                                        ? "In Progress"
                                        : feature.status
                                            .charAt(0)
                                            .toUpperCase() +
                                          feature.status.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <VoteCounter
                                        projectId={`feature-${feature.id}`}
                                        voteCount={feature.votes}
                                        onVote={(increment) => handleVoteOnFeature(feature.id, increment)}
                                        remainingVotes={remainingVotes}
                                        isDemo={project.is_demo}
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            {features.filter(
                              (feature) =>
                                tab === "all" || feature.status === tab
                            ).length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-center py-8"
                                >
                                  No features found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                    )
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="mt-2">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/projects"
            className="mt-4 inline-block text-primary hover:underline"
          >
            ← Back to Projects
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
