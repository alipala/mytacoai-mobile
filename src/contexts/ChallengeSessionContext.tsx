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
import { refreshStatsAfterSession } from '../services/statsService';
import { heartAPI } from '../services/heartAPI';
import { CHALLENGE_TYPE_API_NAMES } from '../types/hearts';

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
  quitSession: () => Promise<void>;

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
        // Convert challenge type to API format
        const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[params.challengeType] || params.challengeType;

        // Fetch heart status for this challenge type
        const heartPool = await heartAPI.getHeartStatus(challengeTypeAPI);

        // Check if user has hearts to start session
        if (heartPool.currentHearts === 0) {
          throw new Error(
            `No hearts available for ${params.challengeType}. ` +
            `Next heart in ${Math.ceil(heartPool.refillInfo?.nextHeartInMinutes || 0)} minutes.`
          );
        }

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
          // Heart System
          heartPool: heartPool,
          lastHeartResponse: null,
          endedEarly: false,
          // State
          isActive: true,
          isPaused: false,
        };

        setSession(newSession);
        console.log('✅ Session started:', newSession.id);
        console.log(`❤️  Starting with ${heartPool.currentHearts}/${heartPool.maxHearts} hearts`);
      } catch (error) {
        // Check if it's a heart-related error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('No hearts available')) {
          // Log as info instead of error to avoid error toast
          console.log('💔 Cannot start session: No hearts available');
        } else {
          // Log other errors normally
          console.error('Failed to start session:', error);
        }
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
    async (challengeId: string, isCorrect: boolean) => {
      // Use sessionRef to avoid stale closure
      const currentSession = sessionRef.current;
      if (!currentSession || !currentSession.isActive || currentSession.isPaused) {
        console.warn('Cannot answer challenge: no active session');
        return;
      }

      const currentChallenge = currentSession.challenges[currentSession.currentIndex];
      if (!currentChallenge || currentChallenge.id !== challengeId) {
        console.warn('Challenge ID mismatch');
        return;
      }

      // Calculate time spent on this challenge
      const now = new Date();
      const timeSpent = currentSession.challengeStartTime
        ? (now.getTime() - new Date(currentSession.challengeStartTime).getTime()) / 1000
        : 0;

      // Calculate XP earned
      const xpResult = calculateXP(isCorrect, timeSpent, currentSession.currentCombo);

      // NEW: Consume heart via API
      const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[currentSession.challengeType] || currentSession.challengeType;
      const heartResponse = await heartAPI.consumeHeart(
        challengeTypeAPI,
        isCorrect,
        currentSession.id
      );

      // Use functional setState to avoid race conditions
      setSession((prevSession) => {
        if (!prevSession) return null;

        // Update combo
        const newCombo = isCorrect ? prevSession.currentCombo + 1 : 1;
        const newMaxCombo = Math.max(prevSession.maxCombo, newCombo);

        // Track incorrect challenges
        const updatedIncorrectIds = isCorrect
          ? prevSession.incorrectChallengeIds
          : [...prevSession.incorrectChallengeIds, challengeId];

        return {
          ...prevSession,
          completedChallenges: prevSession.completedChallenges + 1,
          correctAnswers: prevSession.correctAnswers + (isCorrect ? 1 : 0),
          wrongAnswers: prevSession.wrongAnswers + (isCorrect ? 0 : 1),
          currentCombo: newCombo,
          maxCombo: newMaxCombo,
          totalXP: prevSession.totalXP + xpResult.totalXP,
          incorrectChallengeIds: updatedIncorrectIds,
          answerTimes: [...prevSession.answerTimes, timeSpent],
          challengeStartTime: null, // Stop timer for current challenge
          // Heart System updates
          heartPool: prevSession.heartPool ? {
            ...prevSession.heartPool,
            currentHearts: heartResponse.heartsRemaining,
            shieldActive: heartResponse.shieldActive,
            currentStreak: heartResponse.currentStreak,
            refillInProgress: heartResponse.outOfHearts,
            refillInfo: heartResponse.refillInfo
          } : null,
          lastHeartResponse: heartResponse,
        };
      });

      console.log(`📊 Challenge answered:`, {
        correct: isCorrect,
        timeSpent: `${timeSpent.toFixed(1)}s`,
        xpEarned: xpResult.totalXP,
        combo: isCorrect ? currentSession.currentCombo + 1 : 1,
        hearts: `${heartResponse.heartsRemaining} remaining`,
        shield: heartResponse.shieldActive ? '🛡️ Active' : '❌',
      });

      // Check if out of hearts
      if (heartResponse.outOfHearts) {
        console.warn('❤️  Out of hearts! Ending session early...');
        // Pass the updated session info for early end
        const finalSession = sessionRef.current;
        if (finalSession) {
          await endSessionEarly(finalSession);
        }
      }
    },
    [] // No dependencies - uses sessionRef instead
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
   * End session early due to no hearts
   * Saves progress and logs event
   */
  const endSessionEarly = useCallback(async (updatedSession: ChallengeSession) => {
    console.warn('💔 Session ending early: out of hearts');

    // Mark session as ended early
    const finalSession = {
      ...updatedSession,
      isActive: false,
      endedEarly: true,
      completedAt: new Date(),
    };

    setSession(finalSession);

    // Log session ended early event
    const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[finalSession.challengeType] || finalSession.challengeType;
    await heartAPI.logSessionEndedEarly(
      challengeTypeAPI,
      finalSession.id,
      finalSession.completedChallenges,
      finalSession.challenges.length
    );

    // Calculate and save stats for challenges completed before running out
    const stats = calculateSessionStats(finalSession);

    // Save progress to backend (if any challenges were completed)
    if (finalSession.completedChallenges > 0) {
      try {
        await completeSessionAPI(
          finalSession.id,
          finalSession.correctAnswers,
          finalSession.wrongAnswers,
          finalSession.maxCombo,
          finalSession.totalXP,
          finalSession.answerTimes,
          [], // No achievements for early-ended sessions
          finalSession.language,
          finalSession.level,
          finalSession.challengeType
        );

        // Refresh stats cache
        await refreshStatsAfterSession();

        console.log('✅ Early-ended session progress saved to backend');
      } catch (error) {
        console.error('Failed to save early-ended session:', error);
      }
    }

    // Session will stay in state to show OutOfHeartsModal
    // Don't clear session yet - let the UI handle it
  }, []);

  /**
   * Quit session and save progress
   * Similar to endSessionEarly but triggered by user quit action
   */
  const quitSession = useCallback(async () => {
    const currentSession = sessionRef.current;

    if (!currentSession) {
      console.warn('No active session to quit');
      return;
    }

    console.log('🚪 User quitting session, saving progress...');

    // Mark session as ended (user quit)
    const finalSession = {
      ...currentSession,
      isActive: false,
      endedEarly: true,
      completedAt: new Date(),
    };

    setSession(finalSession);

    // Log quit event (reuse the session ended early tracking)
    // Fire and forget - don't block navigation for analytics
    const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[finalSession.challengeType] || finalSession.challengeType;
    heartAPI.logSessionEndedEarly(
      challengeTypeAPI,
      finalSession.id,
      finalSession.completedChallenges,
      finalSession.challenges.length
    ).catch(err => console.warn('Failed to log quit event:', err));

    // Calculate and save stats for challenges completed before quitting
    const stats = calculateSessionStats(finalSession);

    // Save progress to backend (even if 0 challenges completed, to track quit events)
    // Do this in background - don't block navigation!
    completeSessionAPI(
      finalSession.id,
      finalSession.correctAnswers,
      finalSession.wrongAnswers,
      finalSession.maxCombo,
      finalSession.totalXP,
      finalSession.answerTimes,
      [], // No achievements for quit sessions
      finalSession.language,
      finalSession.level,
      finalSession.challengeType
    ).then(() => {
      console.log('✅ Quit session progress saved to backend');
      console.log('📊 Saved stats:', {
        completed: finalSession.completedChallenges,
        correctAnswers: finalSession.correctAnswers,
        wrongAnswers: finalSession.wrongAnswers,
        totalXP: finalSession.totalXP,
        maxCombo: finalSession.maxCombo,
      });

      // Refresh stats cache in background (don't block navigation)
      refreshStatsAfterSession().catch(err => {
        console.warn('Failed to refresh stats:', err);
      });
    }).catch(error => {
      console.error('❌ Failed to save quit session:', error);
    });

    // Clear session from storage and state
    await clearSessionFromStorage();
    setSession(null);

    console.log('🧹 Session cleared from state and storage');
    console.log('⚡ Quit complete! (stats saving in background)');
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
        achievementIds,
        currentSession.language,
        currentSession.level,
        currentSession.challengeType
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

      // 🔄 Invalidate stats cache and refresh immediately
      // This ensures UI updates with latest stats after session completion
      try {
        await refreshStatsAfterSession(true);
        console.log('✅ Stats cache refreshed after session completion');
      } catch (error) {
        console.error('⚠️ Failed to refresh stats cache:', error);
        // Don't block session completion if cache refresh fails
      }
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
    quitSession,
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
