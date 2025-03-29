
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GitFork, Heart, Info, Users } from "lucide-react";
import { Project } from "@/types/project";
import VoteCounter from "@/components/VoteCounter";
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
}

const ProjectCard = ({ 
  project,
  voteCount,
  onVote,
  remainingVotes
}: ProjectCardProps) => {
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
            <div className="flex items-center text-sm text-muted-foreground ml-3">
              <Heart className="h-4 w-4 text-rose-400" />
              <span className="ml-1">{project.stars || 0}</span>
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{project.shortDescription}</CardDescription>
      </CardHeader>
      <CardContent>
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
          <Button variant="ghost" size="sm" className="text-primary">
            <GitFork className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Link to={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">Contribute</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
