/**
 * Focus System Types (Heart/Lives System)
 *
 * Defines types for the gamified heart system that manages user's
 * learning capacity across different challenge types.
 *
 * Design: Separate hearts per challenge type + daily reset
 */

import { ChallengeType } from '../services/mockChallengeData';

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'fluency_builder' | 'language_mastery';

/**
 * Focus configuration based on subscription tier
 */
export interface FocusConfig {
  maxHearts: number;              // Maximum hearts per challenge type
  refillIntervalMs: number;       // Time between single heart refills (milliseconds)
  dailyResetEnabled: boolean;     // Whether to reset all hearts at midnight
  gradualRefillEnabled: boolean;  // Whether hearts refill gradually over time
  unlimitedHearts: boolean;       // Premium: Unlimited hearts (no tracking)
}

/**
 * Subscription tier configurations
 */
export const FOCUS_CONFIGS: Record<SubscriptionTier, FocusConfig> = {
  free: {
    maxHearts: 5,
    refillIntervalMs: 3 * 60 * 60 * 1000, // 3 hours
    dailyResetEnabled: true,
    gradualRefillEnabled: true,
    unlimitedHearts: false,
  },
  fluency_builder: {
    maxHearts: 10,
    refillIntervalMs: 2 * 60 * 60 * 1000, // 2 hours
    dailyResetEnabled: true,
    gradualRefillEnabled: true,
    unlimitedHearts: false,
  },
  language_mastery: {
    maxHearts: Infinity,
    refillIntervalMs: 0,
    dailyResetEnabled: false,
    gradualRefillEnabled: false,
    unlimitedHearts: true,
  },
};

/**
 * Heart state for a single challenge type
 */
export interface HeartState {
  current: number;                // Current available hearts
  max: number;                    // Maximum hearts for this type
  lastRefillTime: Date;           // Last time a heart was refilled
  nextRefillTime: Date | null;    // When next heart will refill (null if full)
}

/**
 * Complete focus state across all challenge types
 */
export type FocusState = {
  [key in ChallengeType]: HeartState;
} & {
  lastDailyReset: Date;           // Last midnight reset timestamp
  subscriptionTier: SubscriptionTier; // User's current subscription tier
};

/**
 * Focus action results
 */
export interface ConsumeHeartResult {
  success: boolean;
  remainingHearts: number;
  shouldShowModal: boolean;       // Should show "out of hearts" modal
  challengeType: ChallengeType;
}

export interface RefillHeartResult {
  success: boolean;
  newHeartCount: number;
  challengeType: ChallengeType;
  wasFullyRefilled: boolean;      // All hearts refilled (midnight reset)
}

/**
 * Alternative challenge suggestions when out of hearts
 */
export interface AlternativeChallenge {
  type: ChallengeType;
  title: string;
  emoji: string;
  availableHearts: number;
}

/**
 * Out of hearts modal data
 */
export interface OutOfHeartsData {
  challengeType: ChallengeType;
  challengeTitle: string;
  remainingTypes: AlternativeChallenge[];
  nextHeartRefillTime: Date;
  allHeartsRefillTime: Date | null; // Midnight reset time
  hasAnyAlternatives: boolean;
  isCompletelyBlocked: boolean;     // All types depleted (rare!)
}

/**
 * Local storage keys
 */
export const FOCUS_STORAGE_KEYS = {
  FOCUS_STATE: '@focus_state',
  LAST_DAILY_RESET: '@focus_last_daily_reset',
} as const;

/**
 * Heart animation event types
 */
export type HeartAnimationEvent =
  | { type: 'heart_lost'; position: { x: number; y: number }; challengeType: ChallengeType }
  | { type: 'heart_refilled'; challengeType: ChallengeType }
  | { type: 'daily_reset'; totalHeartsRestored: number }
  | { type: 'shield_used'; position: { x: number; y: number } };

/**
 * Streak shield state (separate from hearts)
 */
export interface StreakShield {
  isActive: boolean;
  correctAnswersStreak: number;   // Current streak
  requiredStreak: number;         // Streak needed to activate shield (default: 3)
}
