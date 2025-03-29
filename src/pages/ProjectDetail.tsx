
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  HandHelping 
} from "lucide-react";
import { mockProjects } from "@/data/mockProjects";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = mockProjects.find(p => p.id === id);
  
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
                <Heart className="h-5 w-5 text-rose-400" />
                <span className="text-lg font-medium">{project.stars || 0} stars</span>
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
