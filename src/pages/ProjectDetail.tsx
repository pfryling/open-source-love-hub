import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Project, ProjectComment } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Edit, Calendar, Users, Star } from "lucide-react";
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
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rating, setRating] = useState(0);
  const [userHasRated, setUserHasRated] = useState(false);
  const { votes, remainingVotes, addVote, removeVote } = useVotes();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
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
            is_demo: projectData.is_demo
          };
          
          setProject(formattedProject);
          
          // Check if user is the owner
          if (user && projectData.user_id === user.id) {
            setIsOwner(true);
          }
        }
        
        // If user is logged in, check if project is favorited
        if (user) {
          const { data: favData } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('project_id', id)
            .maybeSingle();
            
          setIsFavorited(!!favData);
          
          // Check if user has rated the project
          const { data: ratingData } = await supabase
            .from('project_ratings')
            .select('rating')
            .eq('user_id', user.id)
            .eq('project_id', id)
            .maybeSingle();
            
          if (ratingData) {
            setRating(ratingData.rating);
            setUserHasRated(true);
          }
        }
        
        // Fetch comments
        const { data: commentsData } = await supabase
          .from('project_comments')
          .select(`
            id,
            user_id,
            comment,
            created_at,
            user_profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: false });
          
        if (commentsData) {
          const formattedComments: ProjectComment[] = commentsData.map(item => ({
            id: item.id,
            project_id: id,
            user_id: item.user_id,
            comment: item.comment,
            created_at: item.created_at,
            user_name: item.user_profiles?.display_name || 'Anonymous'
          }));
          
          setComments(formattedComments);
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
        const { error } = await supabase
          .from('user_favorites')
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
        const { error } = await supabase
          .from('user_favorites')
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
        const { error } = await supabase
          .from('project_ratings')
          .update({ rating: newRating })
          .eq('user_id', user.id)
          .eq('project_id', id);
          
        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from('project_ratings')
          .insert({
            user_id: user.id,
            project_id: id,
            rating: newRating
          });
          
        if (error) throw error;
        setUserHasRated(true);
      }
      
      setRating(newRating);
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
  
  const addComment = async (comment: string) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to add comments.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('project_comments')
        .insert({
          project_id: id,
          user_id: user.id,
          comment: comment
        })
        .select(`
          id,
          user_id,
          comment,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .single();
        
      if (error) throw error;
      
      const formattedComment: ProjectComment = {
        id: data.id,
        project_id: id,
        user_id: user.id,
        comment: comment,
        created_at: data.created_at,
        user_name: data.user_profiles?.display_name || 'Anonymous'
      };
      
      setComments(prevComments => [formattedComment, ...prevComments]);
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
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
              <p className="text-gray-700">{project.fullDescription}</p>
              <Button variant="link" className="mt-4">
                <a href={project.lovableUrl} target="_blank" rel="noopener noreferrer">
                  Visit Lovable Project
                </a>
              </Button>
            </CardContent>
          </Card>
          
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
                {isFavorited ? "Unfavorite" : "Favorite"}
              </Button>
              <ProjectRating rating={rating} onRating={handleRating} userHasRated={userHasRated} />
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
                  <Discord className="h-5 w-5 text-gray-500" />
                  <span>{project.contactDiscord}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ProjectComments projectId={id} comments={comments} addComment={addComment} />
    </div>
  );
};

export default ProjectDetail;

import { Mail, Discord } from "lucide-react";
