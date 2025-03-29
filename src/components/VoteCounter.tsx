
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, HelpCircle, Mail } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MAX_VOTES } from '@/utils/voteUtils';
import { useWaitlist } from "@/contexts/WaitlistContext";
import { Link } from "react-router-dom";

interface VoteCounterProps {
  projectId: string;
  voteCount: number;
  onVote: (increment: boolean) => void | Promise<void> | Promise<boolean>;
  remainingVotes: number;
  isDemo?: boolean;
}

const VoteCounter = ({ 
  projectId, 
  voteCount, 
  onVote,
  remainingVotes,
  isDemo = false
}: VoteCounterProps) => {
  const [animateCount, setAnimateCount] = useState(false);
  const { email, isVerified } = useWaitlist();
  const isAuthenticated = email && isVerified;

  const handleVote = async (increment: boolean) => {
    if (!isAuthenticated) return;
    
    try {
      const result = await onVote(increment);
      
      // Only animate if vote was successful
      if (result !== false) {
        setAnimateCount(true);
        setTimeout(() => setAnimateCount(false), 300);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleVote(true)}
        disabled={!isAuthenticated || (!isDemo && remainingVotes === 0 && voteCount === 0)}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      
      <span className={`font-bold text-lg ${animateCount ? 'animate-pulse text-primary' : ''}`}>
        {voteCount}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleVote(false)}
        disabled={!isAuthenticated || voteCount === 0}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {!isAuthenticated ? (
                <Link to="/auth">
                  <Mail className="h-3 w-3 mr-1 text-primary" />
                </Link>
              ) : (
                <HelpCircle className="h-3 w-3 mr-1" />
              )}
              <span>{isDemo ? "Demo" : isAuthenticated ? remainingVotes : "Join"}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {!isAuthenticated ? (
              <p>Join our waitlist to vote on projects</p>
            ) : isDemo ? (
              <p>Demo project votes don't count against your limit</p>
            ) : (
              <p>You have {remainingVotes} out of {MAX_VOTES} votes remaining</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default VoteCounter;
