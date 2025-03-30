
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, Heart, Settings } from "lucide-react";
import UserProfileForm from "@/components/UserProfileForm";
import ProjectCard from "@/components/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Project, UserFavorite } from "@/types/project";
import { useVotes } from "@/utils/voteUtils";
import { useToast } from "@/hooks/use-toast";

const UserProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteProjects, setFavoriteProjects] = useState<UserFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { votes, remainingVotes, addVote, removeVote } = useVotes();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileAndFavorites = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .maybeSingle();
          
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is the error code when no rows are returned
          throw profileError;
        }
        
        if (profileData) {
          setProfile(profileData as UserProfile);
        }
        
        // Fetch favorite projects
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('user_favorites')
          .select(`
            id,
            user_id,
            project_id,
            created_at,
            projects:project_id (*)
          `);
          
        if (favoritesError) throw favoritesError;
        
        if (favoritesData) {
          // Transform the data to match our model
          const formattedFavorites: UserFavorite[] = favoritesData.map(item => ({
            id: item.id,
            user_id: item.user_id,
            project_id: item.project_id,
            created_at: item.created_at,
            project: item.projects ? {
              id: item.projects.id,
              name: item.projects.name,
              shortDescription: item.projects.short_description,
              fullDescription: item.projects.full_description,
              lovableUrl: item.projects.lovable_url,
              contactEmail: item.projects.contact_email,
              contactDiscord: item.projects.contact_discord,
              goals: item.projects.goals,
              contributionAreas: item.projects.contribution_areas,
              tags: item.projects.tags || [],
              stars: item.projects.stars || 0,
              contributorsCount: item.projects.contributors_count || 0,
              lastUpdated: item.projects.last_updated,
              image_url: item.projects.image_url
            } as Project : undefined
          }));
          
          setFavoriteProjects(formattedFavorites);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileAndFavorites();
  }, [toast]);
  
  const handleVote = (projectId: string, increment: boolean) => {
    const success = increment ? addVote(projectId) : removeVote(projectId);
    
    if (success) {
      const project = favoriteProjects.find(fav => fav.project?.id === projectId)?.project;
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
  
  const removeFavorite = (favoriteId: string) => {
    setFavoriteProjects(prev => prev.filter(fav => fav.id !== favoriteId));
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
      <Tabs defaultValue="profile">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center">
            <UserCircle className="h-10 w-10 mr-3 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                {profile?.display_name || "Your Profile"}
              </h1>
              <p className="text-gray-600">
                Manage your profile and favorite projects
              </p>
            </div>
          </div>
          <TabsList className="mt-4 md:mt-0">
            <TabsTrigger value="profile" className="flex items-center">
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Favorites
              <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {favoriteProjects.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="profile" className="space-y-8">
          {profile ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8">
                    {profile.avatar_url && (
                      <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.display_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-medium mb-2">{profile.display_name}</h3>
                      <p className="text-gray-700 mb-4 whitespace-pre-line">{profile.bio}</p>
                      {profile.interests && profile.interests.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600 mb-2">Interests:</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.interests.map(interest => (
                              <Badge key={interest} variant="secondary">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => document.querySelector('[data-value="settings"]')?.dispatchEvent(new Event('click'))}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserCircle className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Create Your Profile</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  Set up your profile to personalize your experience and connect with like-minded contributors.
                </p>
                <Button onClick={() => document.querySelector('[data-value="settings"]')?.dispatchEvent(new Event('click'))}>
                  Create Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="favorites">
          {favoriteProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Favorite Projects Yet</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  Heart projects you're interested in to add them to your favorites list.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/projects'}>
                  Browse Projects
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProjects.map((favorite) => favorite.project && (
                <ProjectCard
                  key={favorite.id}
                  project={favorite.project}
                  voteCount={votes[favorite.project.id] || 0}
                  onVote={(increment) => handleVote(favorite.project.id, increment)}
                  remainingVotes={remainingVotes}
                  isFavorited={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <UserProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;
