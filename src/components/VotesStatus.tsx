
import { useVotes, MAX_VOTES } from "@/utils/voteUtils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

const VotesStatus = () => {
  const { remainingVotes } = useVotes();
  const usedVotes = MAX_VOTES - remainingVotes;
  const percentUsed = (usedVotes / MAX_VOTES) * 100;

  return (
    <div className="bg-gray-50 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <h3 className="text-lg font-medium flex items-center mb-2 md:mb-0">
            <Info className="h-4 w-4 mr-2 text-primary" />
            Your Voting Status
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant={remainingVotes > 0 ? "outline" : "secondary"}>
              {remainingVotes} votes remaining
            </Badge>
            <Badge variant="default">
              {usedVotes} votes used
            </Badge>
          </div>
        </div>
        <Progress value={percentUsed} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">
          You have a total of {MAX_VOTES} votes to distribute among projects. Votes help determine which projects get featured and prioritized for community attention.
        </p>
      </div>
    </div>
  );
};

export default VotesStatus;
