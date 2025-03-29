
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GitFork, Heart, Users } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="hover-scale overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg md:text-xl">
            <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
              {project.name}
            </Link>
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground space-x-2">
            <Heart className="h-4 w-4 text-rose-400" />
            <span>{project.stars || 0}</span>
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
