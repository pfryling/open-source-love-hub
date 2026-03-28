
import { useState, useEffect } from 'react';

// Constants
export const BASE_VOTES = 3;
export const DAILY_BONUS_VOTES = 2;
const VOTES_STORAGE_KEY = 'lovable-project-votes';
const DAILY_VOTE_KEY = 'lovable-daily-vote-date';

// Types
export interface ProjectVotes {
  [projectId: string]: number;
}

// Load votes from localStorage
export const loadVotes = (): ProjectVotes => {
  const storedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
  return storedVotes ? JSON.parse(storedVotes) : {};
};

// Save votes to localStorage
export const saveVotes = (votes: ProjectVotes): void => {
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
};

// Get today's date string in YYYY-MM-DD format
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Check if daily bonus has been claimed today
const getDailyBonusClaimed = (): boolean => {
  const lastClaimed = localStorage.getItem(DAILY_VOTE_KEY);
  return lastClaimed === getTodayKey();
};

// Claim daily bonus
const claimDailyBonus = (): void => {
  localStorage.setItem(DAILY_VOTE_KEY, getTodayKey());
};

// Get milliseconds until next midnight (UTC)
export const getMsUntilMidnight = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
};

// Format countdown string
export const formatCountdown = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Custom hook to manage votes
export const useVotes = () => {
  const [votes, setVotes] = useState<ProjectVotes>(loadVotes());
  const [dailyClaimed, setDailyClaimed] = useState(getDailyBonusClaimed());
  const [msUntilRefresh, setMsUntilRefresh] = useState(getMsUntilMidnight());

  // Refresh daily status when day changes
  useEffect(() => {
    const interval = setInterval(() => {
      const ms = getMsUntilMidnight();
      setMsUntilRefresh(ms);
      
      // Check if a new day started (daily bonus should reset)
      if (!getDailyBonusClaimed() && dailyClaimed) {
        setDailyClaimed(false);
      }
    }, 60_000); // check every minute

    return () => clearInterval(interval);
  }, [dailyClaimed]);

  // Calculate total and remaining votes
  const totalUsedVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const maxVotes = BASE_VOTES + (dailyClaimed ? DAILY_BONUS_VOTES : 0);
  const remainingVotes = maxVotes - totalUsedVotes;

  // Claim daily bonus votes
  const claimDaily = () => {
    if (dailyClaimed) return false;
    claimDailyBonus();
    setDailyClaimed(true);
    return true;
  };

  // Add a vote to a project
  const addVote = (projectId: string) => {
    if (remainingVotes <= 0) return false;
    
    setVotes(prevVotes => {
      const newVotes = { 
        ...prevVotes, 
        [projectId]: (prevVotes[projectId] || 0) + 1 
      };
      saveVotes(newVotes);
      return newVotes;
    });
    
    return true;
  };

  // Remove a vote from a project
  const removeVote = (projectId: string) => {
    if (!votes[projectId] || votes[projectId] <= 0) return false;
    
    setVotes(prevVotes => {
      const newVotes = { 
        ...prevVotes, 
        [projectId]: prevVotes[projectId] - 1 
      };
      
      // Remove project from votes object if count is 0
      if (newVotes[projectId] === 0) {
        delete newVotes[projectId];
      }
      
      saveVotes(newVotes);
      return newVotes;
    });
    
    return true;
  };

  return { 
    votes, 
    remainingVotes, 
    maxVotes,
    addVote, 
    removeVote,
    dailyClaimed,
    claimDaily,
    msUntilRefresh,
  };
};
