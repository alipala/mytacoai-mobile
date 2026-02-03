/**
 * Voice Check Schedule Hook
 *
 * Manages voice check scheduling for Speaking DNA acoustic analysis.
 * Fetches schedule, checks if voice check is due, and tracks completion.
 *
 * Premium Feature: Only available for active subscribers.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { authService } from '../api/services/auth';

interface VoiceCheckPrompt {
  title: string;
  prompt: string;
  icon: string;
}

interface VoiceCheckProgress {
  total_scheduled: number;
  completed: number;
  remaining: number;
  completion_percentage: number;
  schedule: number[];
  completed_sessions: number[];
}

interface VoiceCheckStatus {
  is_due: boolean;
  next_check: number | null;
  current_session: number;
  schedule: number[];
  progress: VoiceCheckProgress;
  prompt: VoiceCheckPrompt;
  plan_id: string;
  language: string;
}

interface UseVoiceCheckScheduleReturn {
  status: VoiceCheckStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  completeVoiceCheck: (sessionNumber: number) => Promise<boolean>;
  skipVoiceCheck: (sessionNumber: number) => Promise<boolean>;
}

/**
 * Hook to manage voice check schedule for a learning plan.
 *
 * @param planId - Learning plan ID
 * @param enabled - Whether to fetch status (default: true)
 *
 * @example
 * const { status, completeVoiceCheck, skipVoiceCheck } = useVoiceCheckSchedule(planId);
 *
 * if (status?.is_due) {
 *   // Show voice check modal
 * }
 */
export const useVoiceCheckSchedule = (
  planId: string | null,
  enabled: boolean = true
): UseVoiceCheckScheduleReturn => {
  const [status, setStatus] = useState<VoiceCheckStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!planId || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/learning/plan/${planId}/voice-check-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('[VOICE_CHECK] Status fetched:', response.data);
      setStatus(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch voice check status';
      console.error('[VOICE_CHECK] Error fetching status:', errorMessage);
      setError(errorMessage);

      // If not premium, don't show error - just return null status
      if (err.response?.status === 403) {
        setStatus(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [planId, enabled]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const completeVoiceCheck = useCallback(
    async (sessionNumber: number): Promise<boolean> => {
      if (!planId) {
        console.error('[VOICE_CHECK] No plan ID provided');
        return false;
      }

      try {
        const token = await authService.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/learning/plan/${planId}/complete-voice-check`,
          null,
          {
            params: { session_number: sessionNumber },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('[VOICE_CHECK] ✅ Completed:', response.data);

        // Refresh status after completion
        await fetchStatus();

        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to complete voice check';
        console.error('[VOICE_CHECK] Error completing:', errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [planId, fetchStatus]
  );

  const skipVoiceCheck = useCallback(
    async (sessionNumber: number): Promise<boolean> => {
      if (!planId) {
        console.error('[VOICE_CHECK] No plan ID provided');
        return false;
      }

      try {
        const token = await authService.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/learning/plan/${planId}/skip-voice-check`,
          null,
          {
            params: { session_number: sessionNumber },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('[VOICE_CHECK] ⏭️ Skipped:', response.data);

        // Refresh status after skipping
        await fetchStatus();

        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to skip voice check';
        console.error('[VOICE_CHECK] Error skipping:', errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [planId, fetchStatus]
  );

  return {
    status,
    isLoading,
    error,
    refreshStatus: fetchStatus,
    completeVoiceCheck,
    skipVoiceCheck,
  };
};
