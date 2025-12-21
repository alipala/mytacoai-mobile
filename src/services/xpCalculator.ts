/**
 * XP Calculator Service
 *
 * Calculates XP earned for challenge answers based on:
 * - Correctness
 * - Speed
 * - Combo multiplier
 */

import { XPResult, SessionConfig, DEFAULT_SESSION_CONFIG } from '../types/session';

/**
 * Calculate XP earned for a challenge answer
 *
 * @param isCorrect - Whether the answer was correct
 * @param timeSpent - Time taken to answer in seconds
 * @param currentCombo - Current combo streak (1-based)
 * @param config - Session configuration
 * @returns XP calculation breakdown
 */
export function calculateXP(
  isCorrect: boolean,
  timeSpent: number,
  currentCombo: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): XPResult {
  // No XP for wrong answers
  if (!isCorrect) {
    return {
      baseXP: 0,
      speedBonus: 0,
      comboMultiplier: 0,
      totalXP: 0,
    };
  }

  // Base XP for correct answer
  const baseXP = config.baseCorrectXP;

  // Speed bonus if answered quickly
  const speedBonus = timeSpent <= config.speedBonusThreshold ? config.speedBonusXP : 0;

  // Combo multiplier (capped at max)
  const comboMultiplier = Math.min(currentCombo, config.maxComboMultiplier);

  // Total XP = (Base + Speed Bonus) × Combo Multiplier
  const totalXP = (baseXP + speedBonus) * comboMultiplier;

  return {
    baseXP,
    speedBonus,
    comboMultiplier,
    totalXP,
  };
}

/**
 * Get combo milestone information
 * Returns special effects/messages for combo milestones
 */
export function getComboMilestone(combo: number): {
  isMilestone: boolean;
  message: string;
  emoji: string;
} | null {
  const milestones: Record<number, { message: string; emoji: string }> = {
    3: { message: 'On Fire!', emoji: '🔥' },
    5: { message: 'Unstoppable!', emoji: '⚡' },
    7: { message: 'Amazing!', emoji: '🌟' },
    10: { message: 'LEGENDARY!', emoji: '👑' },
  };

  if (milestones[combo]) {
    return {
      isMilestone: true,
      ...milestones[combo],
    };
  }

  return null;
}

/**
 * Format XP number for display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Get XP message for display
 */
export function getXPMessage(xpResult: XPResult): string {
  const parts: string[] = [];

  if (xpResult.baseXP > 0) {
    parts.push(`+${xpResult.baseXP} XP`);
  }

  if (xpResult.speedBonus > 0) {
    parts.push(`⚡ +${xpResult.speedBonus} Speed`);
  }

  if (xpResult.comboMultiplier > 1) {
    parts.push(`🔥 ${xpResult.comboMultiplier}x Combo`);
  }

  return parts.join(' • ');
}

/**
 * Calculate session grade based on performance
 */
export function calculateSessionGrade(
  correctAnswers: number,
  totalChallenges: number
): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  message: string;
  emoji: string;
} {
  const accuracy = (correctAnswers / totalChallenges) * 100;

  if (accuracy === 100) {
    return { grade: 'S', message: 'Perfect!', emoji: '🏆' };
  } else if (accuracy >= 90) {
    return { grade: 'A', message: 'Excellent!', emoji: '⭐' };
  } else if (accuracy >= 80) {
    return { grade: 'B', message: 'Great!', emoji: '👍' };
  } else if (accuracy >= 70) {
    return { grade: 'C', message: 'Good!', emoji: '✅' };
  } else if (accuracy >= 60) {
    return { grade: 'D', message: 'Keep Practicing!', emoji: '📚' };
  } else {
    return { grade: 'F', message: 'Keep Going!', emoji: '💪' };
  }
}
