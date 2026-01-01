/**
 * Heart System (Focus Energy) Types
 *
 * Defines types for the gamified heart system that limits challenge attempts
 * based on subscription tiers.
 */

export interface HeartPool {
  challengeType: string;
  currentHearts: number;
  maxHearts: number;
  refillInProgress: boolean;
  refillInfo: RefillInfo | null;
  shieldActive: boolean;
  shieldExpiresAt: string | null;
  currentStreak: number;
}

export interface RefillInfo {
  refillStartedAt: string;
  refillCompleteAt: string;
  totalRefillMinutes: number;
  minutesPerHeart: number;
  nextHeartInMinutes: number;
  heartsRefilledSoFar: number;
}

export interface AllHeartsStatus {
  error_spotting: HeartPool;
  swipe_fix: HeartPool;
  micro_quiz: HeartPool;
  smart_flashcard: HeartPool;
  native_check: HeartPool;
  brain_tickler: HeartPool;
  story_builder: HeartPool;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

export interface ConsumeHeartResponse {
  heartsLost: boolean;
  heartsRemaining: number;
  shieldUsed: boolean;
  shieldActivated: boolean;
  shieldActive: boolean;
  currentStreak: number;
  outOfHearts: boolean;
  refillInfo: RefillInfo | null;
}

// Subscription tier configuration (matches backend)
export const HEART_CONFIG = {
  try_learn: {
    maxHearts: 5,
    refillMinutes: 180, // 3 hours
    displayName: 'Free'
  },
  fluency_builder: {
    maxHearts: 10,
    refillMinutes: 60, // 1 hour
    displayName: 'Fluency Builder'
  },
  team_mastery: {
    maxHearts: 999999, // Unlimited
    refillMinutes: 0,
    displayName: 'Language Mastery'
  }
};

// Challenge type display names
export const CHALLENGE_TYPE_NAMES: Record<string, string> = {
  error_spotting: 'Error Spotting',
  swipe_fix: 'Swipe Fix',
  micro_quiz: 'Micro Quiz',
  smart_flashcard: 'Smart Flashcard',
  native_check: 'Native Check',
  brain_tickler: 'Brain Tickler',
  story_builder: 'Story Builder'
};

// Challenge type to snake_case mapping (for API calls)
export const CHALLENGE_TYPE_API_NAMES: Record<string, string> = {
  'Error Spotting': 'error_spotting',
  'Swipe Fix': 'swipe_fix',
  'Micro Quiz': 'micro_quiz',
  'Smart Flashcard': 'smart_flashcard',
  'Native Check': 'native_check',
  'Brain Tickler': 'brain_tickler',
  'Story Builder': 'story_builder'
};
