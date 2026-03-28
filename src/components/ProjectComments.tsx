
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProjectComment } from "@/types/project";
import { format, formatDistance } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectCommentsProps {
  projectId: string;
}

const ProjectComments = ({ projectId }: ProjectCommentsProps) => {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        // Fetch comments for the project
        const { data, error } = await (supabase
          .from('oshub_project_comments') as any)
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Fetch user profiles for all comments
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(comment => comment.user_id).filter(Boolean))];
          
          if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await (supabase
              .from('oshub_user_profiles') as any)
              .select('user_id, display_name')
              .in('user_id', userIds);
              
            if (profilesError) throw profilesError;
            
            // Match profiles with comments
            const commentsWithUserNames = data.map(comment => {
              const profile = profiles?.find(p => p.user_id === comment.user_id);
              return {
                ...comment,
                user_name: profile?.display_name || 'Anonymous User'
              };
            });
            
            setComments(commentsWithUserNames);
          } else {
            setComments(data.map(comment => ({
              ...comment,
              user_name: 'Anonymous User'
            })));
          }
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
    
    // Set up real-time subscription for new comments
    const commentSubscription = supabase
      .channel('public:project_comments')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'oshub_project_comments', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          // Add the new comment to the list
          const newComment = payload.new as ProjectComment;
          
          try {
            // Fetch the user profile for the new comment
            if (newComment.user_id) {
              const { data: profile, error: profileError } = await (supabase
                .from('oshub_user_profiles') as any)
                .select('display_name')
                .eq('user_id', newComment.user_id)
                .maybeSingle();
                
              if (!profileError && profile) {
                newComment.user_name = profile.display_name;
              } else {
                newComment.user_name = 'Anonymous User';
              }
            } else {
              newComment.user_name = 'Anonymous User';
            }
            
            setComments(prev => [newComment, ...prev]);
          } catch (error) {
            console.error("Error processing real-time comment:", error);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(commentSubscription);
    };
  }, [projectId, toast]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await (supabase
        .from('oshub_project_comments') as any)
        .insert({
          project_id: projectId,
          user_id: user.id,
          comment: newComment.trim()
        });
        
      if (error) throw error;
      
      setNewComment("");
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {user && (
          <div className="mb-6">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {!user && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-600">Sign in to leave a comment</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. {user ? 'Be the first to comment!' : 'Sign in to be the first to comment!'}
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium">{comment.user_name || 'Anonymous User'}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {comment.created_at && format(new Date(comment.created_at), 'PPP')} 
                      ({comment.created_at && formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })})
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectComments;
