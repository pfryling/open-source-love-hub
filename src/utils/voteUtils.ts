
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Constants
export const MAX_VOTES = 5;
const VOTES_STORAGE_KEY = 'lovable-project-votes';

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

// Custom hook to manage votes
export const useVotes = () => {
  const [votes, setVotes] = useState<ProjectVotes>(loadVotes());
  const [remainingVotes, setRemainingVotes] = useState(MAX_VOTES);

  // Calculate remaining votes on initial load and when votes change
  useEffect(() => {
    const totalUsedVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    setRemainingVotes(MAX_VOTES - totalUsedVotes);
  }, [votes]);

  // Add a vote to a project
  const addVote = async (projectId: string) => {
    if (remainingVotes <= 0) return false;
    
    try {
      // Update local state
      setVotes(prevVotes => {
        const newVotes = { 
          ...prevVotes, 
          [projectId]: (prevVotes[projectId] || 0) + 1 
        };
        saveVotes(newVotes);
        return newVotes;
      });
      
      return true;
    } catch (error) {
      console.error('Error adding vote:', error);
      return false;
    }
  };

  // Remove a vote from a project
  const removeVote = async (projectId: string) => {
    if (!votes[projectId] || votes[projectId] <= 0) return false;
    
    try {
      // Update local state
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
    } catch (error) {
      console.error('Error removing vote:', error);
      return false;
    }
  };

  return { votes, remainingVotes, addVote, removeVote };
};
