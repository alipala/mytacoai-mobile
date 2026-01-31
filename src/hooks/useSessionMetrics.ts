/**
 * useSessionMetrics Hook
 * ======================
 * Collects session metrics during speaking practice for DNA analysis.
 *
 * This hook tracks:
 * - User turn transcripts and timestamps
 * - Response latencies (time between AI finishing and user starting)
 * - Corrections received
 * - Challenge acceptance
 * - Topics discussed
 *
 * Usage:
 * ```tsx
 * const metrics = useSessionMetrics({
 *   sessionId: 'session_123',
 *   sessionType: 'learning'
 * });
 *
 * // Mark when AI finishes speaking
 * metrics.markAIPromptEnd();
 *
 * // Record user's speech turn
 * metrics.recordUserTurn(transcript, startTime, endTime);
 *
 * // Get session data for DNA analysis
 * const sessionData = metrics.getSessionData();
 * ```
 */

import { useRef, useCallback } from 'react';
import {
  SessionTurnData,
  SessionAnalysisInput,
  DNAMetricsCollectorState,
} from '../types/speakingDNA';

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseSessionMetricsOptions {
  /** Unique session identifier */
  sessionId: string;
  /** Type of session */
  sessionType: 'learning' | 'freestyle' | 'news';
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseSessionMetricsReturn {
  /** Mark when AI finishes speaking (user's turn to respond) */
  markAIPromptEnd: () => void;

  /** Record a user's speech turn */
  recordUserTurn: (transcript: string, startTimeMs: number, endTimeMs: number) => void;

  /** Record a correction received from AI */
  recordCorrection: (correction: any) => void;

  /** Record a challenge offered */
  recordChallengeOffered: () => void;

  /** Record a challenge accepted */
  recordChallengeAccepted: () => void;

  /** Add a topic to the discussed topics list */
  addTopic: (topic: string) => void;

  /** Get the complete session data for DNA analysis */
  getSessionData: () => SessionAnalysisInput;

  /** Reset all metrics (for new session) */
  reset: () => void;

  /** Get current metrics count */
  getMetricsCount: () => {
    turns: number;
    corrections: number;
    challengesOffered: number;
    challengesAccepted: number;
    topics: number;
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook to collect session metrics for DNA analysis
 */
export function useSessionMetrics(
  options: UseSessionMetricsOptions
): UseSessionMetricsReturn {
  const { sessionId, sessionType, debug = false } = options;

  // Session state
  const sessionStartTime = useRef<number>(Date.now());
  const userTurns = useRef<SessionTurnData[]>([]);
  const corrections = useRef<any[]>([]);
  const challengesOffered = useRef<number>(0);
  const challengesAccepted = useRef<number>(0);
  const topics = useRef<string[]>([]);
  const lastAIPromptEndTime = useRef<number | null>(null);

  /**
   * Log debug messages if debug mode is enabled
   */
  const log = useCallback(
    (message: string, data?: any) => {
      if (debug) {
        console.log(`[useSessionMetrics] ${message}`, data || '');
      }
    },
    [debug]
  );

  /**
   * Mark when AI finishes speaking (user's turn to respond)
   */
  const markAIPromptEnd = useCallback(() => {
    lastAIPromptEndTime.current = Date.now();
    log('AI prompt ended', { timestamp: lastAIPromptEndTime.current });
  }, [log]);

  /**
   * Record a user's speech turn
   */
  const recordUserTurn = useCallback(
    (transcript: string, startTimeMs: number, endTimeMs: number) => {
      if (!transcript || transcript.trim().length === 0) {
        log('Skipping empty transcript');
        return;
      }

      const turn: SessionTurnData = {
        transcript: transcript.trim(),
        start_time_ms: startTimeMs - sessionStartTime.current,
        end_time_ms: endTimeMs - sessionStartTime.current,
        ai_prompt_end_time_ms: lastAIPromptEndTime.current
          ? lastAIPromptEndTime.current - sessionStartTime.current
          : undefined,
      };

      userTurns.current.push(turn);

      log('User turn recorded', {
        transcript: transcript.substring(0, 50) + '...',
        duration: (endTimeMs - startTimeMs) / 1000,
        latency: lastAIPromptEndTime.current
          ? (startTimeMs - lastAIPromptEndTime.current) / 1000
          : null,
      });

      // Reset AI prompt end time after recording
      lastAIPromptEndTime.current = null;
    },
    [log]
  );

  /**
   * Record a correction received from AI
   */
  const recordCorrection = useCallback(
    (correction: any) => {
      corrections.current.push(correction);
      log('Correction recorded', { total: corrections.current.length });
    },
    [log]
  );

  /**
   * Record a challenge offered
   */
  const recordChallengeOffered = useCallback(() => {
    challengesOffered.current += 1;
    log('Challenge offered', { total: challengesOffered.current });
  }, [log]);

  /**
   * Record a challenge accepted
   */
  const recordChallengeAccepted = useCallback(() => {
    challengesAccepted.current += 1;
    log('Challenge accepted', { total: challengesAccepted.current });
  }, [log]);

  /**
   * Add a topic to the discussed topics list
   */
  const addTopic = useCallback(
    (topic: string) => {
      if (topic && !topics.current.includes(topic)) {
        topics.current.push(topic);
        log('Topic added', { topic, total: topics.current.length });
      }
    },
    [log]
  );

  /**
   * Get the complete session data for DNA analysis
   */
  const getSessionData = useCallback((): SessionAnalysisInput => {
    const durationSeconds = (Date.now() - sessionStartTime.current) / 1000;

    const sessionData: SessionAnalysisInput = {
      session_id: sessionId,
      session_type: sessionType,
      duration_seconds: Math.floor(durationSeconds),
      user_turns: [...userTurns.current], // Create a copy
      corrections_received: [...corrections.current],
      challenges_offered: challengesOffered.current,
      challenges_accepted: challengesAccepted.current,
      topics_discussed: [...topics.current],
    };

    log('Session data compiled', {
      duration: `${sessionData.duration_seconds}s`,
      turns: sessionData.user_turns.length,
      corrections: sessionData.corrections_received?.length || 0,
      challenges: `${sessionData.challenges_accepted}/${sessionData.challenges_offered}`,
      topics: sessionData.topics_discussed?.length || 0,
    });

    return sessionData;
  }, [sessionId, sessionType, log]);

  /**
   * Reset all metrics (for new session)
   */
  const reset = useCallback(() => {
    sessionStartTime.current = Date.now();
    userTurns.current = [];
    corrections.current = [];
    challengesOffered.current = 0;
    challengesAccepted.current = 0;
    topics.current = [];
    lastAIPromptEndTime.current = null;

    log('Metrics reset');
  }, [log]);

  /**
   * Get current metrics count
   */
  const getMetricsCount = useCallback(() => {
    return {
      turns: userTurns.current.length,
      corrections: corrections.current.length,
      challengesOffered: challengesOffered.current,
      challengesAccepted: challengesAccepted.current,
      topics: topics.current.length,
    };
  }, []);

  return {
    markAIPromptEnd,
    recordUserTurn,
    recordCorrection,
    recordChallengeOffered,
    recordChallengeAccepted,
    addTopic,
    getSessionData,
    reset,
    getMetricsCount,
  };
}

export default useSessionMetrics;
