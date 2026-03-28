
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/project";
import { useAuth } from "@/contexts/AuthContext";

const UserProfileForm = () => {
  const { toast } = useToast();
  const { user, updateUserDetails } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    user_id: "",
    display_name: "",
    bio: "",
    avatar_url: "",
    interests: [],
    created_at: "",
    updated_at: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfileAndTags = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await (supabase
          .from('oshub_user_profiles') as any)
          .select('*')
          .maybeSingle();
          
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is the error code when no rows are returned
          throw profileError;
        }
        
        // Fetch all unique tags from projects
        const { data: projectData, error: projectError } = await (supabase
          .from('oshub_projects') as any)
          .select('tags');
          
        if (projectError) throw projectError;
        
        // Extract all unique tags
        const allTags = new Set<string>();
        projectData?.forEach(project => {
          project.tags?.forEach(tag => {
            allTags.add(tag);
          });
        });
        
        setAvailableTags(Array.from(allTags).sort());
        
        // If profile exists, set it
        if (profileData) {
          setProfile(profileData as UserProfile);
        } else if (user) {
          // Initialize with user data if no profile exists yet
          setProfile({
            id: "",
            user_id: user.id,
            display_name: user.user_metadata?.name || "",
            bio: "",
            avatar_url: user.user_metadata?.avatar_url || "",
            interests: [],
            created_at: "",
            updated_at: ""
          });
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
    
    fetchProfileAndTags();
  }, [toast, user]);

  useEffect(() => {
    // Filter tags based on search input
    if (searchTag) {
      const filtered = availableTags.filter(
        tag => tag.toLowerCase().includes(searchTag.toLowerCase()) && 
        !profile.interests.includes(tag)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [searchTag, availableTags, profile.interests]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (url: string | null) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: url || ""
    }));
  };

  const addInterest = (tag: string) => {
    if (!profile.interests.includes(tag)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, tag]
      }));
    }
    setSearchTag("");
  };

  const removeInterest = (tag: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }
      
      // Check if profile exists
      if (profile.id) {
        // Update existing profile
        const { error } = await (supabase
          .from('oshub_user_profiles') as any)
          .update({
            display_name: profile.display_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            interests: profile.interests,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
          
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await (supabase
          .from('oshub_user_profiles') as any)
          .insert({
            user_id: user.id,
            display_name: profile.display_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            interests: profile.interests
          });
          
        if (error) throw error;
      }
      
      // Update user metadata in auth.users
      await updateUserDetails({
        display_name: profile.display_name,
        avatar_url: profile.avatar_url
      });
      
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <ImageUpload 
            value={profile.avatar_url} 
            onChange={handleAvatarChange} 
            label="Profile Picture"
          />
          
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              value={profile.display_name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself and your interests"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.interests.map(tag => (
                <Badge key={tag} className="flex items-center gap-1 p-1 pl-3">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 rounded-full"
                    onClick={() => removeInterest(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            
            <div className="relative">
              <Input
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="Search interests"
                className="w-full"
              />
              
              {filteredTags.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                  {filteredTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => addInterest(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Select interests that match project tags to discover relevant projects.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserProfileForm;
