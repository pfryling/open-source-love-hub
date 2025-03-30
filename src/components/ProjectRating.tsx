
import { useState } from "react";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProjectRatingProps {
  projectId: string;
  initialRating?: number;
  averageRating: number;
  ratingCount: number;
  onRatingChange?: (newAverage: number, newCount: number) => void;
  readOnly?: boolean;
}

const ProjectRating = ({
  projectId,
  initialRating = 0,
  averageRating,
  ratingCount,
  onRatingChange,
  readOnly = false
}: ProjectRatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Calculate the display value for stars
  const displayValue = hoveredRating > 0 ? hoveredRating : rating;
  
  const handleRatingSubmit = async (newRating: number) => {
    if (readOnly) return;
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if user has already rated
      const { data: existingRating, error: checkError } = await supabase
        .from('project_ratings')
        .select('id, rating')
        .eq('project_id', projectId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      let oldRating = 0;
      
      if (existingRating) {
        // Update existing rating
        oldRating = existingRating.rating;
        
        const { error: updateError } = await supabase
          .from('project_ratings')
          .update({ rating: newRating })
          .eq('id', existingRating.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('project_ratings')
          .insert({
            project_id: projectId,
            rating: newRating
          });
          
        if (insertError) throw insertError;
      }
      
      // Now update the project's rating summary
      const newSum = existingRating
        ? averageRating * ratingCount - oldRating + newRating
        : averageRating * ratingCount + newRating;
        
      const newCount = existingRating ? ratingCount : ratingCount + 1;
      const newAverage = newSum / newCount;
      
      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update({
          rating_sum: newSum,
          rating_count: newCount
        })
        .eq('id', projectId);
        
      if (projectUpdateError) throw projectUpdateError;
      
      // Update local state
      setRating(newRating);
      
      // Call the callback if provided
      if (onRatingChange) {
        onRatingChange(newAverage, newCount);
      }
      
      toast({
        title: "Rating submitted",
        description: existingRating ? "Your rating has been updated." : "Your rating has been submitted.",
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={readOnly || isSubmitting}
              className={`${
                readOnly ? 'cursor-default' : 'cursor-pointer'
              } text-gray-300 p-0.5 focus:outline-none transition-colors duration-200 ${
                isSubmitting ? 'opacity-50' : ''
              }`}
              onMouseEnter={() => !readOnly && setHoveredRating(star)}
              onMouseLeave={() => !readOnly && setHoveredRating(0)}
              onClick={() => handleRatingSubmit(star)}
            >
              <Star
                className={`h-6 w-6 ${
                  star <= displayValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {ratingCount > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
          </span>
        )}
      </div>
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-1">
          {rating > 0 ? 'Click to update your rating' : 'Click to rate this project'}
        </p>
      )}
    </div>
  );
};

export default ProjectRating;
