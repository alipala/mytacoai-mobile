/**
 * Challenge Session Types
 *
 * Defines all types for the gamified challenge session system
 */

import { Challenge, Language, CEFRLevel } from '../services/mockChallengeData';
import { HeartPool, ConsumeHeartResponse } from './hearts';

/**
 * Main session state
 */
export interface ChallengeSession {
  // Identity
  id: string;
  userId: string;
  language: Language;
  level: CEFRLevel;
  challengeType: string;
  source: 'reference' | 'learning_plan';

  // Progress
  challenges: Challenge[];
  currentIndex: number;
  completedChallenges: number;

  // Performance metrics
  correctAnswers: number;
  wrongAnswers: number;
  currentCombo: number;
  maxCombo: number;
  totalXP: number;
  incorrectChallengeIds: string[]; // Track which challenges were answered incorrectly

  // Timing
  startTime: Date;
  challengeStartTime: Date | null;
  answerTimes: number[]; // Time taken per challenge in seconds

  // Heart System (Focus Energy)
  heartPool: HeartPool | null;
  lastHeartResponse: ConsumeHeartResponse | null;
  endedEarly: boolean; // True if session ended due to no hearts

  // State
  isActive: boolean;
  isPaused: boolean;
  completedAt?: Date;
}

/**
 * Answer result for a single challenge
 */
export interface ChallengeAnswer {
  challengeId: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
  xpEarned: number;
  comboAtTime: number;
}

/**
 * Session statistics
 */
export interface SessionStats {
  totalChallenges: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number; // Percentage
  totalXP: number;
  maxCombo: number;
  averageTime: number; // Average seconds per challenge
  totalTime: number; // Total session time in seconds
  achievements: SessionAchievement[];
  incorrectChallenges: Challenge[]; // Challenges that were answered incorrectly
}

/**
 * Achievement earned in a session
 */
export interface SessionAchievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon name
  xpBonus: number;
  unlockedAt: Date;
}

/**
 * Achievement criteria
 */
export interface AchievementCriteria {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  check: (stats: SessionStats, session: ChallengeSession) => boolean;
}

/**
 * XP calculation result
 */
export interface XPResult {
  baseXP: number;
  speedBonus: number;
  comboMultiplier: number;
  totalXP: number;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  challengesPerSession: number; // Default: 10
  speedBonusThreshold: number; // Default: 10 seconds
  speedBonusXP: number; // Default: 5 XP
  baseCorrectXP: number; // Default: 10 XP
  maxComboMultiplier: number; // Default: 10x
  autoAdvanceDelay: number; // Default: 2000ms
}

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  challengesPerSession: 10,
  speedBonusThreshold: 10,
  speedBonusXP: 5,
  baseCorrectXP: 10,
  maxComboMultiplier: 10,
  autoAdvanceDelay: 2000,
};

/**
 * Session creation parameters
 */
export interface CreateSessionParams {
  userId: string;
  language: Language;
  level: CEFRLevel;
  challengeType: string;
  source: 'reference' | 'learning_plan';
  specificChallenges?: Challenge[]; // For review sessions - use these specific challenges instead of fetching new ones
}

/**
 * Session resume data
 */
export interface ResumeSessionData {
  session: ChallengeSession;
  canResume: boolean;
  remainingChallenges: number;
}
