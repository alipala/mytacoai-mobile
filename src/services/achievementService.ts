/**
 * Achievement Service
 *
 * Defines and checks for achievement unlocks during sessions
 */

import {
  SessionAchievement,
  AchievementCriteria,
  SessionStats,
  ChallengeSession,
  DEFAULT_SESSION_CONFIG,
} from '../types/session';

/**
 * Session-based achievements (earned within a single session)
 */
export const SESSION_ACHIEVEMENTS: AchievementCriteria[] = [
  {
    id: 'perfect_session',
    title: 'Perfect Session',
    description: 'Completed session with 100% accuracy',
    icon: '⭐',
    xpBonus: 100,
    check: (stats) => stats.accuracy === 100,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answered all challenges in under 10 seconds',
    icon: '⚡',
    xpBonus: 75,
    check: (stats) => stats.averageTime < DEFAULT_SESSION_CONFIG.speedBonusThreshold,
  },
  {
    id: 'combo_master',
    title: 'Combo Master',
    description: 'Achieved 5x combo or higher',
    icon: '🔥',
    xpBonus: 50,
    check: (stats) => stats.maxCombo >= 5,
  },
  {
    id: 'first_try',
    title: 'First Try Hero',
    description: 'Completed session without mistakes',
    icon: '💎',
    xpBonus: 100,
    check: (stats) => stats.wrongAnswers === 0,
  },
  {
    id: 'quick_finish',
    title: 'Lightning Fast',
    description: 'Completed session in under 2 minutes',
    icon: '⚡',
    xpBonus: 50,
    check: (stats) => stats.totalTime < 120,
  },
  {
    id: 'perfect_combo',
    title: 'Ultimate Combo',
    description: 'Reached 10x combo multiplier',
    icon: '👑',
    xpBonus: 150,
    check: (stats) => stats.maxCombo >= 10,
  },
];

/**
 * Calculate basic session statistics without achievements
 * (Helper function to avoid circular dependency)
 *
 * @param session - Challenge session
 * @returns Basic session stats without achievements
 */
function calculateBasicStats(session: ChallengeSession): Omit<SessionStats, 'achievements'> {
  const totalChallenges = session.completedChallenges;
  const correctAnswers = session.correctAnswers;
  const wrongAnswers = session.wrongAnswers;
  const accuracy = totalChallenges > 0 ? (correctAnswers / totalChallenges) * 100 : 0;

  // Calculate timing stats
  const totalTime = session.answerTimes.reduce((sum, time) => sum + time, 0);
  const averageTime = totalChallenges > 0 ? totalTime / totalChallenges : 0;

  // Extract incorrect challenges
  const incorrectChallenges = session.challenges.filter(
    challenge => session.incorrectChallengeIds.includes(challenge.id)
  );

  return {
    totalChallenges,
    correctAnswers,
    wrongAnswers,
    accuracy,
    totalXP: session.totalXP,
    maxCombo: session.maxCombo,
    averageTime,
    totalTime,
    incorrectChallenges,
  };
}

/**
 * Check which achievements were earned in a session
 *
 * @param session - Completed challenge session
 * @returns Array of unlocked achievements
 */
export function checkSessionAchievements(session: ChallengeSession): SessionAchievement[] {
  // Use basic stats to avoid circular dependency
  const basicStats = calculateBasicStats(session);
  const stats = { ...basicStats, achievements: [] }; // Temporarily add empty achievements for criteria check

  const unlockedAchievements: SessionAchievement[] = [];
  const now = new Date();

  for (const criteria of SESSION_ACHIEVEMENTS) {
    if (criteria.check(stats, session)) {
      unlockedAchievements.push({
        id: criteria.id,
        title: criteria.title,
        description: criteria.description,
        icon: criteria.icon,
        xpBonus: criteria.xpBonus,
        unlockedAt: now,
      });
    }
  }

  return unlockedAchievements;
}

/**
 * Calculate session statistics
 *
 * @param session - Challenge session
 * @returns Session stats
 */
export function calculateSessionStats(session: ChallengeSession): SessionStats {
  // Calculate basic stats
  const basicStats = calculateBasicStats(session);

  // Check for achievements
  const achievements = checkSessionAchievements(session);

  return {
    ...basicStats,
    achievements,
  };
}

/**
 * Calculate total XP including achievement bonuses
 *
 * @param baseXP - XP earned from challenges
 * @param achievements - Achievements unlocked
 * @returns Total XP with bonuses
 */
export function calculateTotalXPWithAchievements(
  baseXP: number,
  achievements: SessionAchievement[]
): number {
  const achievementBonus = achievements.reduce((sum, achievement) => sum + achievement.xpBonus, 0);
  return baseXP + achievementBonus;
}

/**
 * Get encouraging message based on performance
 *
 * @param accuracy - Accuracy percentage
 * @returns Encouraging message
 */
export function getEncouragementMessage(accuracy: number): string {
  if (accuracy === 100) {
    return 'Flawless! You\'re a champion! 🏆';
  } else if (accuracy >= 90) {
    return 'Outstanding work! Keep it up! ⭐';
  } else if (accuracy >= 80) {
    return 'Great job! You\'re getting better! 🎯';
  } else if (accuracy >= 70) {
    return 'Good effort! Keep practicing! 💪';
  } else if (accuracy >= 60) {
    return 'Nice try! You can do this! 📚';
  } else {
    return 'Don\'t give up! Practice makes perfect! 🌟';
  }
}

/**
 * Format session time for display
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "2m 34s")
 */
export function formatSessionTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Get performance comparison message
 *
 * @param currentXP - Current session XP
 * @param previousXP - Previous session XP (if available)
 * @returns Comparison message
 */
export function getPerformanceComparison(
  currentXP: number,
  previousXP?: number
): string | null {
  if (previousXP === undefined) {
    return null;
  }

  const difference = currentXP - previousXP;

  if (difference > 0) {
    return `🎯 +${difference} XP from last session!`;
  } else if (difference < 0) {
    return `Keep trying! Last session: ${previousXP} XP`;
  } else {
    return `Same as last session: ${currentXP} XP`;
  }
}
