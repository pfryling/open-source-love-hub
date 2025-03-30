
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GitFork, Heart, Info, Users } from "lucide-react";
import { Project } from "@/types/project";
import VoteCounter from "@/components/VoteCounter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCardProps {
  project: Project;
  voteCount: number;
  onVote: (increment: boolean) => boolean;
  remainingVotes: number;
  isFavorited?: boolean;
}

const ProjectCard = ({ 
  project,
  voteCount,
  onVote,
  remainingVotes,
  isFavorited = false
}: ProjectCardProps) => {
  const [favorited, setFavorited] = useState(isFavorited);
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();

  const handleToggleFavorite = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      if (favorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('project_id', project.id);
          
        if (error) throw error;
        
        setFavorited(false);
        toast({
          title: "Removed from favorites",
          description: `${project.name} has been removed from your favorites.`,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            project_id: project.id
          });
          
        if (error) throw error;
        
        setFavorited(true);
        toast({
          title: "Added to favorites",
          description: `${project.name} has been added to your favorites.`,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className={`hover-scale overflow-hidden ${project.is_demo ? 'border-dashed border-2 border-amber-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <CardTitle className="text-lg md:text-xl">
              <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                {project.name}
              </Link>
            </CardTitle>
            {project.is_demo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <Info className="h-3 w-3 mr-1" />
                      Demo
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a demo project. Votes don't count against your limit.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center">
            <VoteCounter 
              projectId={project.id}
              voteCount={voteCount}
              onVote={onVote}
              remainingVotes={remainingVotes}
              isDemo={project.is_demo}
            />
            <Button
              variant="ghost"
              size="icon"
              className="ml-1"
              onClick={handleToggleFavorite}
              disabled={isToggling}
            >
              <Heart 
                className={`h-5 w-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} 
              />
            </Button>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{project.shortDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {project.image_url && (
          <div className="w-full h-40 mb-4 overflow-hidden rounded-md">
            <img 
              src={project.image_url} 
              alt={project.name} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{project.contributorsCount} contributors</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <span>Updated {project.lastUpdated}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Link to={`/projects/${project.id}`} className="w-full">
            <Button variant="ghost" size="sm" className="text-primary">
              <GitFork className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
          <Link to={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">Contribute</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
