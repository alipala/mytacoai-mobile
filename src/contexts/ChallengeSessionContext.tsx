/**
 * Challenge Session Context
 *
 * Manages global state for challenge sessions including:
 * - Session creation and lifecycle
 * - Challenge progression
 * - XP and combo tracking
 * - Session statistics
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, Language, CEFRLevel } from '../services/mockChallengeData';
import { ChallengeService } from '../services/challengeService';
import {
  ChallengeSession,
  CreateSessionParams,
  ChallengeAnswer,
  SessionStats,
  SessionAchievement,
  DEFAULT_SESSION_CONFIG,
} from '../types/session';
import { calculateXP } from '../services/xpCalculator';
import { checkSessionAchievements, calculateSessionStats } from '../services/achievementService';
import { completeSession as completeSessionAPI } from '../services/achievementAPI';

const SESSION_STORAGE_KEY = '@challenge_session';

interface SessionContextValue {
  // Current session state
  session: ChallengeSession | null;
  isLoading: boolean;

  // Session actions
  startSession: (params: CreateSessionParams) => Promise<void>;
  answerChallenge: (challengeId: string, isCorrect: boolean) => void;
  nextChallenge: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<SessionStats>;

  // Session info
  getCurrentChallenge: () => Challenge | null;
  getProgress: () => { current: number; total: number; percentage: number };
  canAdvance: () => boolean;
  isSessionComplete: () => boolean;
}

const ChallengeSessionContext = createContext<SessionContextValue | undefined>(undefined);

export function ChallengeSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ChallengeSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ref to always access latest session (fixes closure stale state issues)
  const sessionRef = useRef<ChallengeSession | null>(null);

  // Update ref whenever session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Load session from storage on mount
  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  // Save session to storage whenever it changes
  useEffect(() => {
    if (session) {
      saveSessionToStorage(session);
    }
  }, [session]);

  /**
   * Load session from AsyncStorage
   */
  const loadSessionFromStorage = async () => {
    try {
      const storedSession = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        // Convert date strings back to Date objects
        parsedSession.startTime = new Date(parsedSession.startTime);
        if (parsedSession.challengeStartTime) {
          parsedSession.challengeStartTime = new Date(parsedSession.challengeStartTime);
        }
        if (parsedSession.completedAt) {
          parsedSession.completedAt = new Date(parsedSession.completedAt);
        }
        setSession(parsedSession);
      }
    } catch (error) {
      console.error('Failed to load session from storage:', error);
    }
  };

  /**
   * Save session to AsyncStorage
   */
  const saveSessionToStorage = async (sessionToSave: ChallengeSession) => {
    try {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToSave));
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  };

  /**
   * Clear session from storage
   */
  const clearSessionFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session from storage:', error);
    }
  };

  /**
   * Start a new challenge session
   */
  const startSession = useCallback(
    async (params: CreateSessionParams) => {
      setIsLoading(true);

      try {
        let challenges: Challenge[];

        // Use specific challenges if provided (for review sessions), otherwise fetch new ones
        if (params.specificChallenges && params.specificChallenges.length > 0) {
          challenges = params.specificChallenges;
          console.log(`📚 Starting review session with ${challenges.length} specific challenges`);
        } else {
          // Fetch challenges from backend
          const result = await ChallengeService.getChallengesByType(
            params.challengeType,
            DEFAULT_SESSION_CONFIG.challengesPerSession,
            params.language,
            params.level,
            params.source
          );

          if (!result.challenges || result.challenges.length === 0) {
            throw new Error('No challenges available');
          }

          challenges = result.challenges.slice(0, DEFAULT_SESSION_CONFIG.challengesPerSession);
        }

        // Create new session
        const newSession: ChallengeSession = {
          id: `session_${Date.now()}`,
          userId: params.userId,
          language: params.language,
          level: params.level,
          challengeType: params.challengeType,
          source: params.source,
          challenges,
          currentIndex: 0,
          completedChallenges: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          currentCombo: 1, // Start at 1x combo
          maxCombo: 1,
          totalXP: 0,
          incorrectChallengeIds: [], // Track incorrect challenges
          startTime: new Date(),
          challengeStartTime: new Date(),
          answerTimes: [],
          isActive: true,
          isPaused: false,
        };

        setSession(newSession);
        console.log('✅ Session started:', newSession.id);
      } catch (error) {
        console.error('Failed to start session:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Answer current challenge
   */
  const answerChallenge = useCallback(
    (challengeId: string, isCorrect: boolean) => {
      if (!session || !session.isActive || session.isPaused) {
        console.warn('Cannot answer challenge: no active session');
        return;
      }

      const currentChallenge = session.challenges[session.currentIndex];
      if (!currentChallenge || currentChallenge.id !== challengeId) {
        console.warn('Challenge ID mismatch');
        return;
      }

      // Calculate time spent on this challenge
      const now = new Date();
      const timeSpent = session.challengeStartTime
        ? (now.getTime() - new Date(session.challengeStartTime).getTime()) / 1000
        : 0;

      // Calculate XP earned
      const xpResult = calculateXP(isCorrect, timeSpent, session.currentCombo);

      // Update combo
      const newCombo = isCorrect ? session.currentCombo + 1 : 1;
      const newMaxCombo = Math.max(session.maxCombo, newCombo);

      // Track incorrect challenges
      const updatedIncorrectIds = isCorrect
        ? session.incorrectChallengeIds
        : [...session.incorrectChallengeIds, challengeId];

      // Update session
      setSession({
        ...session,
        completedChallenges: session.completedChallenges + 1,
        correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
        wrongAnswers: session.wrongAnswers + (isCorrect ? 0 : 1),
        currentCombo: newCombo,
        maxCombo: newMaxCombo,
        totalXP: session.totalXP + xpResult.totalXP,
        incorrectChallengeIds: updatedIncorrectIds,
        answerTimes: [...session.answerTimes, timeSpent],
        challengeStartTime: null, // Stop timer for current challenge
      });

      console.log(`📊 Challenge answered:`, {
        correct: isCorrect,
        timeSpent: `${timeSpent.toFixed(1)}s`,
        xpEarned: xpResult.totalXP,
        combo: newCombo,
      });
    },
    [session]
  );

  /**
   * Advance to next challenge
   */
  const nextChallenge = useCallback(() => {
    setSession((prevSession) => {
      if (!prevSession) return null;

      const nextIndex = prevSession.currentIndex + 1;

      if (nextIndex >= prevSession.challenges.length) {
        // Session complete
        console.log('🎉 Session completed!');
        return {
          ...prevSession,
          isActive: false,
          completedAt: new Date(),
        };
      } else {
        // Move to next challenge
        console.log(`➡️ Advanced to challenge ${nextIndex + 1}/${prevSession.challenges.length}`);
        return {
          ...prevSession,
          currentIndex: nextIndex,
          challengeStartTime: new Date(), // Start timer for next challenge
        };
      }
    });
  }, []);

  /**
   * Pause session
   */
  const pauseSession = useCallback(() => {
    setSession((prevSession) => {
      if (!prevSession) return null;
      console.log('⏸️ Session paused');
      return { ...prevSession, isPaused: true };
    });
  }, []);

  /**
   * Resume session
   */
  const resumeSession = useCallback(() => {
    setSession((prevSession) => {
      if (!prevSession) return null;
      console.log('▶️ Session resumed');
      return {
        ...prevSession,
        isPaused: false,
        challengeStartTime: new Date(), // Restart timer
      };
    });
  }, []);

  /**
   * End session and calculate final stats
   * Uses sessionRef to always get the latest session state (avoids closure stale state)
   */
  const endSession = useCallback(async (): Promise<SessionStats> => {
    // Use ref to get LATEST session state (not closure state)
    const currentSession = sessionRef.current;

    if (!currentSession) {
      throw new Error('No active session to end');
    }

    // Mark session as complete
    const completedSession = {
      ...currentSession,
      isActive: false,
      completedAt: new Date(),
    };

    // Calculate final stats
    const stats = calculateSessionStats(completedSession);

    // Check for achievements
    const achievements = checkSessionAchievements(completedSession);
    const achievementIds = achievements.map(a => a.id);

    console.log('✅ Session ended:', stats);
    console.log('🏆 Achievements unlocked:', achievementIds);

    // Send session data to backend
    try {
      const response = await completeSessionAPI(
        currentSession.id,
        currentSession.correctAnswers,
        currentSession.wrongAnswers,
        currentSession.maxCombo,
        currentSession.totalXP,
        currentSession.answerTimes,
        achievementIds
      );

      console.log('✅ Session persisted to backend:', response);

      // Update stats with server-side unlocked achievements
      stats.achievements = response.unlocked_achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpBonus: a.xpBonus,
        unlockedAt: a.unlocked_at || new Date(),
      }));
    } catch (error) {
      console.error('❌ Error persisting session to backend:', error);
      // Continue with local stats even if backend fails
      stats.achievements = achievements;
    }

    // Clear session
    setSession(null);
    await clearSessionFromStorage();

    return stats;
  }, []); // No dependencies - uses ref instead!

  /**
   * Get current challenge
   */
  const getCurrentChallenge = useCallback((): Challenge | null => {
    if (!session || session.currentIndex >= session.challenges.length) {
      return null;
    }
    return session.challenges[session.currentIndex];
  }, [session]);

  /**
   * Get progress information
   */
  const getProgress = useCallback((): {
    current: number;
    total: number;
    percentage: number;
  } => {
    if (!session) {
      return { current: 0, total: 0, percentage: 0 };
    }
    // Use currentIndex for display, cap at total
    const current = Math.min(session.currentIndex, session.challenges.length - 1);
    const total = session.challenges.length;
    // Use completedChallenges for percentage calculation
    const percentage = total > 0 ? (session.completedChallenges / total) * 100 : 0;
    return { current, total, percentage };
  }, [session]);

  /**
   * Check if can advance to next challenge
   */
  const canAdvance = useCallback((): boolean => {
    if (!session) return false;
    return session.completedChallenges > session.currentIndex;
  }, [session]);

  /**
   * Check if session is complete
   */
  const isSessionComplete = useCallback((): boolean => {
    if (!session) return false;
    return !session.isActive && session.completedAt !== undefined;
  }, [session]);

  const value: SessionContextValue = {
    session,
    isLoading,
    startSession,
    answerChallenge,
    nextChallenge,
    pauseSession,
    resumeSession,
    endSession,
    getCurrentChallenge,
    getProgress,
    canAdvance,
    isSessionComplete,
  };

  return (
    <ChallengeSessionContext.Provider value={value}>
      {children}
    </ChallengeSessionContext.Provider>
  );
}

/**
 * Hook to use challenge session context
 */
export function useChallengeSession() {
  const context = useContext(ChallengeSessionContext);
  if (context === undefined) {
    throw new Error('useChallengeSession must be used within a ChallengeSessionProvider');
  }
  return context;
}
