import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useVotes } from "@/utils/voteUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";

const FeaturedProjects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(6);
  const { votes, remainingVotes, addVote, removeVote } = useVotes();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedProjects = data.map(project => ({
          id: project.id,
          name: project.name,
          shortDescription: project.short_description,
          fullDescription: project.full_description,
          lovableUrl: project.lovable_url,
          contactEmail: project.contact_email,
          contactDiscord: project.contact_discord,
          goals: project.goals,
          contributionAreas: project.contribution_areas,
          tags: project.tags,
          stars: project.stars,
          contributorsCount: project.contributors_count,
          lastUpdated: formatDate(project.last_updated),
          is_demo: project.is_demo
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Failed to load projects",
          description: "Using demo data instead. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  const formatDate = (dateString: string) => {
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

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedProjects = filteredProjects.slice(0, displayCount);
  
  const loadMore = () => {
    setDisplayCount(prevCount => prevCount + 6);
  };

  const handleVote = (projectId: string, increment: boolean, isDemo: boolean): boolean | Promise<boolean> => {
    if (isDemo) {
      toast({
        title: increment ? "Demo Vote Added" : "Demo Vote Removed",
        description: `This is a demo project. Votes on demo projects don't count against your vote limit.`,
      });
      return true;
    }
    
    const success = increment ? addVote(projectId) : removeVote(projectId);
    
    if (success) {
      const project = projects.find(p => p.id === projectId);
      if (increment) {
        toast({
          title: "Vote Added",
          description: `You've voted for ${project?.name}. You have ${remainingVotes - 1} votes remaining.`,
        });
      } else {
        toast({
          title: "Vote Removed",
          description: `You've removed your vote from ${project?.name}. You now have ${remainingVotes + 1} votes remaining.`,
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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-bold mb-4 md:mb-0">Featured Projects</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No projects found matching your search.</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  voteCount={project.is_demo ? 0 : (votes[project.id] || 0)}
                  onVote={(increment) => handleVote(project.id, increment, Boolean(project.is_demo))}
                  remainingVotes={remainingVotes}
                />
              ))}
            </div>
            
            {displayCount < filteredProjects.length && (
              <div className="text-center mt-12">
                <Button variant="outline" onClick={loadMore}>
                  Load More Projects
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
