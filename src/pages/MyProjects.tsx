
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useWaitlist } from "@/contexts/WaitlistContext";
import WaitlistForm from "@/components/WaitlistForm";
import { Project } from "@/types/project";

const MyProjects = () => {
  const { toast } = useToast();
  const { email, isVerified, loading, getUserProjects } = useWaitlist();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      if (isVerified && email) {
        try {
          const userProjects = await getUserProjects();
          setProjects(userProjects);
        } catch (error) {
          console.error("Error fetching projects:", error);
          toast({
            title: "Error",
            description: "Failed to load your projects. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchProjects();
    }
  }, [email, getUserProjects, isVerified, loading, toast]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Join Our Waitlist</CardTitle>
            <CardDescription>
              Sign up to create and manage your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WaitlistForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>
              Please check your email and verify your account to manage projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="h-16 w-16 text-amber-500" />
            </div>
            <p className="text-center">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and spam folder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-2">
            Manage your open source projects
          </p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => navigate("/add-project")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Project
        </Button>
      </div>
      
      {projects.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-medium">No Projects Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You haven't created any projects yet. Add your first project to showcase it to the community!
              </p>
              <Button onClick={() => navigate("/add-project")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/edit-project/${project.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
