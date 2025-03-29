import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, PlusCircle } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { mockProjects } from "@/data/mockProjects";
import { useVotes } from "@/utils/voteUtils";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const { votes, remainingVotes, addVote, removeVote } = useVotes();
  const { toast } = useToast();
  
  const allTags = Array.from(
    new Set(mockProjects.flatMap(project => project.tags))
  ).sort();
  
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.every(tag => project.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "stars") {
      return (b.stars || 0) - (a.stars || 0);
    } else if (sortBy === "contributors") {
      return b.contributorsCount - a.contributorsCount;
    } else {
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
  
  const handleVote = async (projectId: string, increment: boolean): Promise<boolean> => {
    const success = increment ? addVote(projectId) : removeVote(projectId);
    
    if (success) {
      const project = mockProjects.find(p => p.id === projectId);
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
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
          <p className="text-gray-600">
            Find open source Lovable projects to contribute to
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
      
      <div className="mb-8">
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
            }}
          >
            Clear search & filters
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
