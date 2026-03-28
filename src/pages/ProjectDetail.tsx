import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Project, ProjectComment } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Edit, Calendar, Users, Star, Mail, MessageSquare, Link as LinkIcon } from "lucide-react";
import ProjectRating from "@/components/ProjectRating";
import ProjectComments from "@/components/ProjectComments";
import { useVotes } from "@/utils/voteUtils";
import { format } from "date-fns";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userHasRated, setUserHasRated] = useState(false);
  const { votes, remainingVotes, addVote, removeVote } = useVotes();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch project details
        const { data: projectData, error: projectError } = await (supabase
          .from('oshub_projects') as any)
          .select('*')
          .eq('id', id)
          .single();
          
        if (projectError) throw projectError;
        
        if (projectData) {
          // Format the project data
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
            stars: projectData.stars || 0,
            contributorsCount: projectData.contributors_count || 0,
            lastUpdated: projectData.last_updated,
            image_url: projectData.image_url,
            is_demo: projectData.is_demo,
            rating_sum: projectData.rating_sum || 0,
            rating_count: projectData.rating_count || 0
          };
          
          setProject(formattedProject);
          
          if (formattedProject.rating_count && formattedProject.rating_count > 0) {
            setAverageRating(formattedProject.rating_sum / formattedProject.rating_count);
            setRatingCount(formattedProject.rating_count);
          }
          
          // Check if user is the owner
          if (user && projectData.user_id === user.id) {
            setIsOwner(true);
          }
        }
        
        // If user is logged in, check if project is favorited
        if (user) {
          const { data: favData } = await (supabase
            .from('oshub_user_favorites') as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('project_id', id)
            .maybeSingle();
            
          setIsFavorited(!!favData);
          
          // Check if user has rated the project
          const { data: ratingData } = await (supabase
            .from('oshub_project_ratings') as any)
            .select('rating')
            .eq('user_id', user.id)
            .eq('project_id', id)
            .maybeSingle();
            
          if (ratingData) {
            setRating(ratingData.rating);
            setUserHasRated(true);
          }
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast({
          title: "Error",
          description: "Failed to load project details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id, user, toast]);
  
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to favorite projects.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await (supabase
          .from('oshub_user_favorites') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', id);
          
        if (error) throw error;
        
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "This project has been removed from your favorites.",
        });
      } else {
        // Add to favorites
        const { error } = await (supabase
          .from('oshub_user_favorites') as any)
          .insert({
            user_id: user.id,
            project_id: id
          });
          
        if (error) throw error;
        
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "This project has been added to your favorites.",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to toggle favorite status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRating = async (newRating: number) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to rate projects.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (userHasRated) {
        // Update existing rating
        const { error } = await (supabase
          .from('oshub_project_ratings') as any)
          .update({ rating: newRating })
          .eq('user_id', user.id)
          .eq('project_id', id);
          
        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await (supabase
          .from('oshub_project_ratings') as any)
          .insert({
            user_id: user.id,
            project_id: id,
            rating: newRating
          });
          
        if (error) throw error;
        setUserHasRated(true);
      }
      
      setRating(newRating);
      
      // Update the average rating display
      const newTotalRating = userHasRated 
        ? (averageRating * ratingCount) - rating + newRating 
        : (averageRating * ratingCount) + newRating;
        
      const newCount = userHasRated ? ratingCount : ratingCount + 1;
      const newAverage = newTotalRating / newCount;
      
      setAverageRating(newAverage);
      setRatingCount(newCount);
      
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this project!",
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleVote = (projectId: string, increment: boolean) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to vote.",
        variant: "destructive"
      });
      return;
    }
    
    const success = increment ? addVote(projectId) : removeVote(projectId);
    
    if (success) {
      if (increment) {
        toast({
          title: "Vote Added",
          description: `You've voted for this project. You have ${remainingVotes - 1} votes remaining.`,
        });
      } else {
        toast({
          title: "Vote Removed",
          description: `You've removed your vote from this project. You now have ${remainingVotes + 1} votes remaining.`,
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/projects')}>View All Projects</Button>
      </div>
    );
  }
  
  const handleEditProject = () => {
    navigate(`/edit-project/${project.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-gray-600 mb-2">{project.shortDescription}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
                {project.is_demo && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Demo Project
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {isOwner && (
                <Button onClick={handleEditProject} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              )}
            </div>
          </div>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>About this project</CardTitle>
              <CardDescription>Learn more about {project.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{project.fullDescription}</p>
              {project.lovableUrl && (
                <Button variant="link" className="mt-4 p-0">
                  <a href={project.lovableUrl} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Visit Lovable Project
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
          
          {(project.goals || project.contributionAreas) && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Project Goals & Contribution Areas</CardTitle>
                <CardDescription>What this project aims to achieve and how you can help</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.goals && (
                  <div>
                    <h3 className="font-medium text-lg mb-2">Goals</h3>
                    <p className="text-gray-700 whitespace-pre-line">{project.goals}</p>
                  </div>
                )}
                {project.contributionAreas && (
                  <div>
                    <h3 className="font-medium text-lg mb-2">Contribution Areas</h3>
                    <p className="text-gray-700 whitespace-pre-line">{project.contributionAreas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
              <CardDescription>Key metrics about the project</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>Last Updated: {format(new Date(project.lastUpdated), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span>{project.contributorsCount} Contributors</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support the Project</CardTitle>
              <CardDescription>Show your appreciation and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={toggleFavorite}>
                <Heart className="h-4 w-4 mr-2" />
                {isFavorited ? "Unfavorite" : "Favorite"}
              </Button>
              <ProjectRating 
                projectId={id || ""}
                initialRating={rating}
                averageRating={averageRating}
                ratingCount={ratingCount}
                onRatingChange={(newAvg, newCount) => {
                  setAverageRating(newAvg);
                  setRatingCount(newCount);
                }}
              />
              <Button className="w-full" onClick={() => handleVote(project.id, true)} disabled={remainingVotes <= 0}>
                <Star className="h-4 w-4 mr-2" />
                Vote ({votes[project.id] || 0}) - {remainingVotes} votes left
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Get in touch with the project maintainers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.contactEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <a href={`mailto:${project.contactEmail}`} className="text-primary hover:underline">
                    {project.contactEmail}
                  </a>
                </div>
              )}
              {project.contactDiscord && (
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <span>{project.contactDiscord}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ProjectComments projectId={id || ""} />
    </div>
  );
};

export default ProjectDetail;
