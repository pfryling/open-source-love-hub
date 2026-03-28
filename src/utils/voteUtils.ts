
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Constants
export const BASE_VOTES = 3;
export const DAILY_BONUS_VOTES = 2;

// Types
export interface ProjectVotes {
  [projectId: string]: number;
}

// Get today's date string in YYYY-MM-DD format
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get milliseconds until next midnight (local)
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

// Custom hook to manage votes via Supabase
export const useVotes = () => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<ProjectVotes>({});
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [msUntilRefresh, setMsUntilRefresh] = useState(getMsUntilMidnight());
  const [loading, setLoading] = useState(true);

  // Fetch votes and daily bonus status from Supabase
  const fetchData = useCallback(async () => {
    if (!user) {
      setVotes({});
      setDailyClaimed(false);
      setLoading(false);
      return;
    }

    try {
      // Fetch user votes
      const { data: votesData } = await (supabase
        .from('oshub_user_votes') as any)
        .select('project_id, vote_count')
        .eq('user_id', user.id);

      const votesMap: ProjectVotes = {};
      if (votesData) {
        for (const row of votesData) {
          if (row.vote_count > 0) {
            votesMap[row.project_id] = row.vote_count;
          }
        }
      }
      setVotes(votesMap);

      // Check daily bonus
      const { data: bonusData } = await (supabase
        .from('oshub_daily_bonus') as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('claimed_date', getTodayKey())
        .maybeSingle();

      setDailyClaimed(!!bonusData);
    } catch (error) {
      console.error('Error fetching vote data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const ms = getMsUntilMidnight();
      setMsUntilRefresh(ms);

      // If a new day started, re-check bonus status
      if (ms > 23 * 60 * 60 * 1000 && dailyClaimed) {
        fetchData();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [dailyClaimed, fetchData]);

  // Calculate total and remaining votes
  const totalUsedVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  const maxVotes = BASE_VOTES + (dailyClaimed ? DAILY_BONUS_VOTES : 0);
  const remainingVotes = maxVotes - totalUsedVotes;

  // Claim daily bonus votes
  const claimDaily = async () => {
    if (dailyClaimed || !user) return false;

    try {
      const { error } = await (supabase
        .from('oshub_daily_bonus') as any)
        .insert({ user_id: user.id, claimed_date: getTodayKey() });

      if (error) throw error;
      setDailyClaimed(true);
      return true;
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return false;
    }
  };

  // Add a vote to a project
  const addVote = async (projectId: string) => {
    if (remainingVotes <= 0 || !user) return false;

    try {
      const currentCount = votes[projectId] || 0;
      
      if (currentCount === 0) {
        // Insert new row
        const { error } = await (supabase
          .from('oshub_user_votes') as any)
          .insert({ user_id: user.id, project_id: projectId, vote_count: 1 });
        if (error) throw error;
      } else {
        // Update existing row
        const { error } = await (supabase
          .from('oshub_user_votes') as any)
          .update({ vote_count: currentCount + 1, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('project_id', projectId);
        if (error) throw error;
      }

      setVotes(prev => ({ ...prev, [projectId]: currentCount + 1 }));
      return true;
    } catch (error) {
      console.error('Error adding vote:', error);
      return false;
    }
  };

  // Remove a vote from a project
  const removeVote = async (projectId: string) => {
    if (!votes[projectId] || votes[projectId] <= 0 || !user) return false;

    try {
      const newCount = votes[projectId] - 1;

      if (newCount === 0) {
        // Delete the row
        const { error } = await (supabase
          .from('oshub_user_votes') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId);
        if (error) throw error;
      } else {
        // Update count
        const { error } = await (supabase
          .from('oshub_user_votes') as any)
          .update({ vote_count: newCount, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('project_id', projectId);
        if (error) throw error;
      }

      setVotes(prev => {
        const updated = { ...prev };
        if (newCount === 0) {
          delete updated[projectId];
        } else {
          updated[projectId] = newCount;
        }
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error removing vote:', error);
      return false;
    }
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
    loading,
  };
};
