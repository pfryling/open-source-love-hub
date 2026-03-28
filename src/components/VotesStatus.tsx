
import { useVotes, BASE_VOTES, DAILY_BONUS_VOTES, formatCountdown } from "@/utils/voteUtils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Gift, Clock } from "lucide-react";

const VotesStatus = () => {
  const { remainingVotes, maxVotes, dailyClaimed, claimDaily, msUntilRefresh } = useVotes();
  const usedVotes = maxVotes - remainingVotes;
  const percentUsed = maxVotes > 0 ? (usedVotes / maxVotes) * 100 : 0;

  return (
    <div className="bg-muted/50 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-2">
          <h3 className="text-lg font-medium flex items-center">
            <Info className="h-4 w-4 mr-2 text-primary" />
            Your Voting Status
          </h3>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Badge variant={remainingVotes > 0 ? "outline" : "secondary"}>
              {remainingVotes} votes remaining
            </Badge>
            <Badge variant="default">
              {usedVotes} / {maxVotes} used
            </Badge>
            {!dailyClaimed ? (
              <Button size="sm" variant="outline" className="gap-1.5 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={claimDaily}>
                <Gift className="h-3.5 w-3.5" />
                Claim {DAILY_BONUS_VOTES} bonus votes
              </Button>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Next bonus in {formatCountdown(msUntilRefresh)}
              </Badge>
            )}
          </div>
        </div>
        <Progress value={percentUsed} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          You start with {BASE_VOTES} votes. Claim {DAILY_BONUS_VOTES} bonus votes each day to support more projects! Votes help determine which projects get featured.
        </p>
      </div>
    </div>
  );
};

export default VotesStatus;
