/**
 * Focus Context (Heart System Management)
 *
 * Manages the gamified heart system across all challenge types.
 * Features:
 * - Separate hearts per challenge type
 * - Daily midnight reset
 * - Gradual refill (1 heart per interval)
 * - Subscription tier support (free, fluency_builder, language_mastery)
 * - Persistent state (AsyncStorage)
 * - Real-time refill timers
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChallengeType } from '../services/mockChallengeData';
import {
  FocusState,
  HeartState,
  FocusConfig,
  SubscriptionTier,
  FOCUS_CONFIGS,
  ConsumeHeartResult,
  RefillHeartResult,
  AlternativeChallenge,
  OutOfHeartsData,
  FOCUS_STORAGE_KEYS,
  HeartAnimationEvent,
  StreakShield,
} from '../types/focus';

// Challenge type metadata
const CHALLENGE_METADATA: Record<ChallengeType, { title: string; emoji: string }> = {
  error_spotting: { title: 'Error Spotting', emoji: '🔍' },
  swipe_fix: { title: 'Swipe Fix', emoji: '👆' },
  micro_quiz: { title: 'Micro Quiz', emoji: '❓' },
  smart_flashcard: { title: 'Smart Flashcard', emoji: '📚' },
  native_check: { title: 'Native Check', emoji: '✅' },
  brain_tickler: { title: 'Brain Tickler', emoji: '🧠' },
};

interface FocusContextValue {
  // State
  focusState: FocusState | null;
  subscriptionTier: SubscriptionTier;
  config: FocusConfig;
  isLoading: boolean;

  // Streak shield
  streakShield: StreakShield;

  // Heart operations
  consumeHeart: (challengeType: ChallengeType, useShield?: boolean) => Promise<ConsumeHeartResult>;
  getHeartsForType: (challengeType: ChallengeType) => HeartState | null;
  hasHeartsAvailable: (challengeType: ChallengeType) => boolean;
  getAlternativeChallenges: (currentType: ChallengeType) => AlternativeChallenge[];
  getOutOfHeartsData: (challengeType: ChallengeType) => OutOfHeartsData | null;

  // Streak shield operations
  incrementStreak: () => void;
  resetStreak: () => void;
  consumeShield: () => boolean;

  // Refill operations
  checkAndRefillHearts: () => Promise<void>;
  forceRefillAll: () => Promise<void>; // For testing

  // Subscription management
  updateSubscriptionTier: (tier: SubscriptionTier) => Promise<void>;

  // Animation events
  onHeartAnimationEvent?: (event: HeartAnimationEvent) => void;
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

interface FocusProviderProps {
  children: React.ReactNode;
  onHeartAnimationEvent?: (event: HeartAnimationEvent) => void;
}

export function FocusProvider({ children, onHeartAnimationEvent }: FocusProviderProps) {
  const [focusState, setFocusState] = useState<FocusState | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [streakShield, setStreakShield] = useState<StreakShield>({
    isActive: false,
    correctAnswersStreak: 0,
    requiredStreak: 3,
  });

  const refillTimerRef = useRef<NodeJS.Timeout | null>(null);
  const config = FOCUS_CONFIGS[subscriptionTier];

  /**
   * Initialize focus state from storage or create new
   */
  const initializeFocusState = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load user subscription tier from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      let tier: SubscriptionTier = 'free';

      if (userStr) {
        const user = JSON.parse(userStr);
        const plan = user.subscription_plan?.toLowerCase() || '';

        if (plan.includes('mastery')) {
          tier = 'language_mastery';
        } else if (plan.includes('fluency') || plan.includes('builder')) {
          tier = 'fluency_builder';
        }
      }

      setSubscriptionTier(tier);
      const tierConfig = FOCUS_CONFIGS[tier];

      // Load existing focus state
      const storedState = await AsyncStorage.getItem(FOCUS_STORAGE_KEYS.FOCUS_STATE);

      if (storedState) {
        const parsed = JSON.parse(storedState);
        // Convert date strings back to Date objects
        const hydratedState: FocusState = {
          ...parsed,
          lastDailyReset: new Date(parsed.lastDailyReset),
          error_spotting: {
            ...parsed.error_spotting,
            lastRefillTime: new Date(parsed.error_spotting.lastRefillTime),
            nextRefillTime: parsed.error_spotting.nextRefillTime
              ? new Date(parsed.error_spotting.nextRefillTime)
              : null,
          },
          swipe_fix: {
            ...parsed.swipe_fix,
            lastRefillTime: new Date(parsed.swipe_fix.lastRefillTime),
            nextRefillTime: parsed.swipe_fix.nextRefillTime
              ? new Date(parsed.swipe_fix.nextRefillTime)
              : null,
          },
          micro_quiz: {
            ...parsed.micro_quiz,
            lastRefillTime: new Date(parsed.micro_quiz.lastRefillTime),
            nextRefillTime: parsed.micro_quiz.nextRefillTime
              ? new Date(parsed.micro_quiz.nextRefillTime)
              : null,
          },
          smart_flashcard: {
            ...parsed.smart_flashcard,
            lastRefillTime: new Date(parsed.smart_flashcard.lastRefillTime),
            nextRefillTime: parsed.smart_flashcard.nextRefillTime
              ? new Date(parsed.smart_flashcard.nextRefillTime)
              : null,
          },
          native_check: {
            ...parsed.native_check,
            lastRefillTime: new Date(parsed.native_check.lastRefillTime),
            nextRefillTime: parsed.native_check.nextRefillTime
              ? new Date(parsed.native_check.nextRefillTime)
              : null,
          },
          brain_tickler: {
            ...parsed.brain_tickler,
            lastRefillTime: new Date(parsed.brain_tickler.lastRefillTime),
            nextRefillTime: parsed.brain_tickler.nextRefillTime
              ? new Date(parsed.brain_tickler.nextRefillTime)
              : null,
          },
        };

        setFocusState(hydratedState);
      } else {
        // Create initial state
        const now = new Date();
        const initialState: FocusState = {
          error_spotting: createInitialHeartState(tierConfig, now),
          swipe_fix: createInitialHeartState(tierConfig, now),
          micro_quiz: createInitialHeartState(tierConfig, now),
          smart_flashcard: createInitialHeartState(tierConfig, now),
          native_check: createInitialHeartState(tierConfig, now),
          brain_tickler: createInitialHeartState(tierConfig, now),
          lastDailyReset: now,
          subscriptionTier: tier,
        };

        setFocusState(initialState);
        await AsyncStorage.setItem(FOCUS_STORAGE_KEYS.FOCUS_STATE, JSON.stringify(initialState));
      }
    } catch (error) {
      console.error('Failed to initialize focus state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create initial heart state for a challenge type
   */
  const createInitialHeartState = (tierConfig: FocusConfig, now: Date): HeartState => ({
    current: tierConfig.maxHearts,
    max: tierConfig.maxHearts,
    lastRefillTime: now,
    nextRefillTime: null, // Full, so no refill needed
  });

  /**
   * Save focus state to storage
   */
  const saveFocusState = useCallback(async (state: FocusState) => {
    try {
      await AsyncStorage.setItem(FOCUS_STORAGE_KEYS.FOCUS_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save focus state:', error);
    }
  }, []);

  /**
   * Check if it's time for daily reset (midnight)
   */
  const checkDailyReset = useCallback(async () => {
    if (!focusState || !config.dailyResetEnabled) return;

    const now = new Date();
    const lastReset = new Date(focusState.lastDailyReset);

    // Check if we've crossed midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastResetDay = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());

    if (today > lastResetDay) {
      console.log('🌙 Midnight reset triggered!');

      // Reset all hearts to maximum
      const resetState: FocusState = {
        ...focusState,
        lastDailyReset: now,
        error_spotting: { ...focusState.error_spotting, current: config.maxHearts, nextRefillTime: null },
        swipe_fix: { ...focusState.swipe_fix, current: config.maxHearts, nextRefillTime: null },
        micro_quiz: { ...focusState.micro_quiz, current: config.maxHearts, nextRefillTime: null },
        smart_flashcard: { ...focusState.smart_flashcard, current: config.maxHearts, nextRefillTime: null },
        native_check: { ...focusState.native_check, current: config.maxHearts, nextRefillTime: null },
        brain_tickler: { ...focusState.brain_tickler, current: config.maxHearts, nextRefillTime: null },
      };

      setFocusState(resetState);
      await saveFocusState(resetState);

      // Emit animation event
      if (onHeartAnimationEvent) {
        onHeartAnimationEvent({
          type: 'daily_reset',
          totalHeartsRestored: config.maxHearts * 6, // 6 challenge types
        });
      }
    }
  }, [focusState, config, saveFocusState, onHeartAnimationEvent]);

  /**
   * Check and refill hearts based on time elapsed
   */
  const checkAndRefillHearts = useCallback(async () => {
    if (!focusState || config.unlimitedHearts || !config.gradualRefillEnabled) return;

    const now = new Date();
    let updated = false;
    const newState = { ...focusState };

    // Check each challenge type
    (Object.keys(focusState) as Array<ChallengeType | 'lastDailyReset' | 'subscriptionTier'>).forEach((key) => {
      if (key === 'lastDailyReset' || key === 'subscriptionTier') return;

      const challengeType = key as ChallengeType;
      const heartState = focusState[challengeType];

      // Skip if already full
      if (heartState.current >= heartState.max) return;

      // Calculate how many hearts should have refilled
      const timeSinceLastRefill = now.getTime() - new Date(heartState.lastRefillTime).getTime();
      const heartsToRefill = Math.floor(timeSinceLastRefill / config.refillIntervalMs);

      if (heartsToRefill > 0) {
        const newCurrent = Math.min(heartState.current + heartsToRefill, heartState.max);
        const isNowFull = newCurrent >= heartState.max;

        newState[challengeType] = {
          ...heartState,
          current: newCurrent,
          lastRefillTime: now,
          nextRefillTime: isNowFull ? null : new Date(now.getTime() + config.refillIntervalMs),
        };

        updated = true;

        console.log(`❤️ Refilled ${heartsToRefill} heart(s) for ${challengeType}: ${heartState.current} → ${newCurrent}`);

        // Emit animation event
        if (onHeartAnimationEvent) {
          onHeartAnimationEvent({
            type: 'heart_refilled',
            challengeType,
          });
        }
      }
    });

    if (updated) {
      setFocusState(newState);
      await saveFocusState(newState);
    }
  }, [focusState, config, saveFocusState, onHeartAnimationEvent]);

  /**
   * Consume a heart when user makes a mistake
   */
  const consumeHeart = useCallback(
    async (challengeType: ChallengeType, useShield: boolean = false): Promise<ConsumeHeartResult> => {
      // Unlimited hearts (premium)
      if (config.unlimitedHearts) {
        return {
          success: true,
          remainingHearts: Infinity,
          shouldShowModal: false,
          challengeType,
        };
      }

      // Use streak shield instead of consuming heart
      if (useShield && streakShield.isActive) {
        console.log('🛡️ Streak shield protected you!');
        return {
          success: true,
          remainingHearts: focusState?.[challengeType].current || 0,
          shouldShowModal: false,
          challengeType,
        };
      }

      if (!focusState) {
        return {
          success: false,
          remainingHearts: 0,
          shouldShowModal: true,
          challengeType,
        };
      }

      const heartState = focusState[challengeType];

      // No hearts left
      if (heartState.current <= 0) {
        return {
          success: false,
          remainingHearts: 0,
          shouldShowModal: true,
          challengeType,
        };
      }

      // Consume one heart
      const newCurrent = heartState.current - 1;
      const now = new Date();

      const newState: FocusState = {
        ...focusState,
        [challengeType]: {
          ...heartState,
          current: newCurrent,
          lastRefillTime: now,
          nextRefillTime: new Date(now.getTime() + config.refillIntervalMs),
        },
      };

      setFocusState(newState);
      await saveFocusState(newState);

      console.log(`💔 Heart consumed for ${challengeType}: ${heartState.current} → ${newCurrent}`);

      return {
        success: true,
        remainingHearts: newCurrent,
        shouldShowModal: newCurrent === 0,
        challengeType,
      };
    },
    [focusState, config, streakShield, saveFocusState]
  );

  /**
   * Get hearts for a specific challenge type
   */
  const getHeartsForType = useCallback(
    (challengeType: ChallengeType): HeartState | null => {
      if (!focusState) return null;
      return focusState[challengeType];
    },
    [focusState]
  );

  /**
   * Check if hearts are available for a challenge type
   */
  const hasHeartsAvailable = useCallback(
    (challengeType: ChallengeType): boolean => {
      if (config.unlimitedHearts) return true;
      const heartState = getHeartsForType(challengeType);
      return heartState ? heartState.current > 0 : false;
    },
    [config, getHeartsForType]
  );

  /**
   * Get alternative challenges when one type is depleted
   */
  const getAlternativeChallenges = useCallback(
    (currentType: ChallengeType): AlternativeChallenge[] => {
      if (!focusState) return [];

      const alternatives: AlternativeChallenge[] = [];

      (Object.keys(focusState) as Array<ChallengeType | 'lastDailyReset' | 'subscriptionTier'>).forEach((key) => {
        if (key === 'lastDailyReset' || key === 'subscriptionTier') return;

        const challengeType = key as ChallengeType;

        // Skip the current type
        if (challengeType === currentType) return;

        const heartState = focusState[challengeType];

        // Only include types with hearts available
        if (heartState.current > 0) {
          const metadata = CHALLENGE_METADATA[challengeType];
          alternatives.push({
            type: challengeType,
            title: metadata.title,
            emoji: metadata.emoji,
            availableHearts: heartState.current,
          });
        }
      });

      return alternatives;
    },
    [focusState]
  );

  /**
   * Get complete "out of hearts" modal data
   */
  const getOutOfHeartsData = useCallback(
    (challengeType: ChallengeType): OutOfHeartsData | null => {
      if (!focusState) return null;

      const heartState = focusState[challengeType];
      const alternatives = getAlternativeChallenges(challengeType);
      const metadata = CHALLENGE_METADATA[challengeType];

      // Calculate next refill time
      const nextHeartRefillTime = heartState.nextRefillTime || new Date(Date.now() + config.refillIntervalMs);

      // Calculate midnight reset time
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

      return {
        challengeType,
        challengeTitle: metadata.title,
        remainingTypes: alternatives,
        nextHeartRefillTime,
        allHeartsRefillTime: config.dailyResetEnabled ? tomorrow : null,
        hasAnyAlternatives: alternatives.length > 0,
        isCompletelyBlocked: alternatives.length === 0,
      };
    },
    [focusState, config, getAlternativeChallenges]
  );

  /**
   * Increment streak for shield
   */
  const incrementStreak = useCallback(() => {
    setStreakShield((prev) => {
      const newStreak = prev.correctAnswersStreak + 1;
      const shouldActivate = newStreak >= prev.requiredStreak;

      if (shouldActivate && !prev.isActive) {
        console.log('🛡️ Streak shield activated!');
      }

      return {
        ...prev,
        correctAnswersStreak: newStreak,
        isActive: shouldActivate,
      };
    });
  }, []);

  /**
   * Reset streak (on wrong answer without shield)
   */
  const resetStreak = useCallback(() => {
    setStreakShield((prev) => ({
      ...prev,
      correctAnswersStreak: 0,
      isActive: false,
    }));
  }, []);

  /**
   * Consume streak shield
   */
  const consumeShield = useCallback((): boolean => {
    if (!streakShield.isActive) return false;

    setStreakShield((prev) => ({
      ...prev,
      isActive: false,
      correctAnswersStreak: 0,
    }));

    return true;
  }, [streakShield]);

  /**
   * Force refill all hearts (for testing)
   */
  const forceRefillAll = useCallback(async () => {
    if (!focusState) return;

    const now = new Date();
    const resetState: FocusState = {
      ...focusState,
      error_spotting: { ...focusState.error_spotting, current: config.maxHearts, lastRefillTime: now, nextRefillTime: null },
      swipe_fix: { ...focusState.swipe_fix, current: config.maxHearts, lastRefillTime: now, nextRefillTime: null },
      micro_quiz: { ...focusState.micro_quiz, current: config.maxHearts, lastRefillTime: now, nextRefillTime: null },
      smart_flashcard: { ...focusState.smart_flashcard, current: config.maxHearts, lastRefillTime: now, nextRefillTime: null },
      native_check: { ...focusState.native_check, current: config.maxHearts, lastRefillTime: now, nextRefillTime: null },
      brain_tickler: { ...focusState.brain_tickler, current: config.maxHearts, lastRefillTime: now, nextRefillTime: null },
    };

    setFocusState(resetState);
    await saveFocusState(resetState);
    console.log('✅ All hearts refilled (manual)');
  }, [focusState, config, saveFocusState]);

  /**
   * Update subscription tier
   */
  const updateSubscriptionTier = useCallback(async (tier: SubscriptionTier) => {
    setSubscriptionTier(tier);

    // Update max hearts for all types
    if (focusState) {
      const newMax = FOCUS_CONFIGS[tier].maxHearts;
      const updatedState: FocusState = {
        ...focusState,
        subscriptionTier: tier,
        error_spotting: { ...focusState.error_spotting, max: newMax },
        swipe_fix: { ...focusState.swipe_fix, max: newMax },
        micro_quiz: { ...focusState.micro_quiz, max: newMax },
        smart_flashcard: { ...focusState.smart_flashcard, max: newMax },
        native_check: { ...focusState.native_check, max: newMax },
        brain_tickler: { ...focusState.brain_tickler, max: newMax },
      };

      setFocusState(updatedState);
      await saveFocusState(updatedState);
    }
  }, [focusState, saveFocusState]);

  // Initialize on mount
  useEffect(() => {
    initializeFocusState();
  }, [initializeFocusState]);

  // Setup refill timer
  useEffect(() => {
    // Check for daily reset and refills every minute
    const interval = setInterval(() => {
      checkDailyReset();
      checkAndRefillHearts();
    }, 60 * 1000); // Every minute

    // Also check immediately
    checkDailyReset();
    checkAndRefillHearts();

    return () => clearInterval(interval);
  }, [checkDailyReset, checkAndRefillHearts]);

  const value: FocusContextValue = {
    focusState,
    subscriptionTier,
    config,
    isLoading,
    streakShield,
    consumeHeart,
    getHeartsForType,
    hasHeartsAvailable,
    getAlternativeChallenges,
    getOutOfHeartsData,
    incrementStreak,
    resetStreak,
    consumeShield,
    checkAndRefillHearts,
    forceRefillAll,
    updateSubscriptionTier,
    onHeartAnimationEvent,
  };

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

/**
 * Hook to use focus context
 */
export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
