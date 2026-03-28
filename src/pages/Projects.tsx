
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, PlusCircle } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { mockProjects } from "@/data/mockProjects"; // fallback only
import { useVotes } from "@/utils/voteUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showDemo, setShowDemo] = useState(true);
  const [showUserProjects, setShowUserProjects] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { votes, remainingVotes, addVote, removeVote } = useVotes();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Fetch real projects from Supabase
        const { data, error } = await (supabase
          .from('oshub_projects') as any)
          .select('*');
          
        if (error) throw error;
        
        // Format the real projects
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
          tags: project.tags || [],
          stars: project.stars || 0,
          contributorsCount: project.contributors_count || 0,
          lastUpdated: new Date(project.last_updated).toLocaleDateString(),
          image_url: project.image_url,
          is_demo: project.is_demo
        }));
        
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        
        // Fallback to mock projects if fetch fails
        setProjects(mockProjects.map(project => ({
          ...project,
          is_demo: true
        })));
        
        toast({
          title: "Error",
          description: "Failed to load all projects. Showing demo projects only.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [toast]);
  
  // Extract unique tags from all projects
  const allTags = Array.from(
    new Set(projects.flatMap(project => project.tags))
  ).sort();
  
  // Filter projects based on search query, selected tags, and project type
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.every(tag => project.tags.includes(tag));
    
    const matchesProjectType = 
      (project.is_demo && showDemo) || 
      (!project.is_demo && showUserProjects);
    
    return matchesSearch && matchesTags && matchesProjectType;
  });
  
  // Sort projects based on selected sort method
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "stars") {
      return (b.stars || 0) - (a.stars || 0);
    } else if (sortBy === "contributors") {
      return b.contributorsCount - a.contributorsCount;
    } else {
      // Default sort by newest (last updated)
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
  });
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleVote = (projectId: string, increment: boolean) => {
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
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
          <p className="text-gray-600">
            Find Lovable projects to contribute to
          </p>
        </div>
        <Link to="/add-project" className="mt-4 md:mt-0">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-2/3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects by name or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="stars">Most Stars</SelectItem>
              <SelectItem value="contributors">Most Contributors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-2/3">
          <div className="flex items-center mb-3">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button 
                variant="link" 
                className="text-sm text-gray-500 px-2"
                onClick={() => setSelectedTags([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="flex items-center mb-3">
            <span className="font-medium">Project type:</span>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={showDemo ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setShowDemo(!showDemo)}
            >
              Demo Projects
            </Badge>
            <Badge
              variant={showUserProjects ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setShowUserProjects(!showUserProjects)}
            >
              User Projects
            </Badge>
          </div>
        </div>
      </div>
      
      {sortedProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            No projects match your current search criteria.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setSelectedTags([]);
              setShowDemo(true);
              setShowUserProjects(true);
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              voteCount={votes[project.id] || 0}
              onVote={(increment) => handleVote(project.id, increment)}
              remainingVotes={remainingVotes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
