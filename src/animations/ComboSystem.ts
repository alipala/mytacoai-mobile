/**
 * Combo System Configuration
 *
 * Defines visual effects and escalation for combo streaks
 * Consistent across all challenge types
 */

export interface ComboLevel {
  level: number;
  displayBadge: boolean;
  badgeText: string;
  characterScale: number;
  backgroundTint: string;
  glowColor?: string;
  particleEffect?: 'none' | 'small' | 'medium' | 'large' | 'epic';
  milestone?: {
    message: string;
    duration: number;
    hapticPattern: 'light' | 'medium' | 'heavy' | 'sequence';
    celebration?: boolean;
  };
}

/**
 * Combo Level Definitions
 */
export const COMBO_LEVELS: Record<number, ComboLevel> = {
  1: {
    level: 1,
    displayBadge: false, // No badge at 1x
    badgeText: '',
    characterScale: 1.0,
    backgroundTint: 'transparent',
  },

  2: {
    level: 2,
    displayBadge: true,
    badgeText: '2x 🔥',
    characterScale: 1.05,
    backgroundTint: 'rgba(255, 107, 157, 0.05)',
    glowColor: '#FF6B9D',
    particleEffect: 'small',
  },

  3: {
    level: 3,
    displayBadge: true,
    badgeText: '3x 🔥',
    characterScale: 1.1,
    backgroundTint: 'rgba(255, 107, 157, 0.1)',
    glowColor: '#FF6B9D',
    particleEffect: 'medium',
    milestone: {
      message: 'On Fire!',
      duration: 800,
      hapticPattern: 'medium',
    },
  },

  4: {
    level: 4,
    displayBadge: true,
    badgeText: '4x 🔥',
    characterScale: 1.12,
    backgroundTint: 'rgba(249, 115, 22, 0.12)',
    glowColor: '#F97316',
    particleEffect: 'medium',
  },

  5: {
    level: 5,
    displayBadge: true,
    badgeText: '5x ⚡',
    characterScale: 1.15,
    backgroundTint: 'rgba(59, 130, 246, 0.15)',
    glowColor: '#3B82F6',
    particleEffect: 'large',
    milestone: {
      message: 'Unstoppable!',
      duration: 1000,
      hapticPattern: 'heavy',
      celebration: true,
    },
  },

  6: {
    level: 6,
    displayBadge: true,
    badgeText: '6x ⚡',
    characterScale: 1.17,
    backgroundTint: 'rgba(59, 130, 246, 0.17)',
    glowColor: '#3B82F6',
    particleEffect: 'large',
  },

  7: {
    level: 7,
    displayBadge: true,
    badgeText: '7x 🌟',
    characterScale: 1.2,
    backgroundTint: 'rgba(168, 85, 247, 0.2)',
    glowColor: '#A855F7',
    particleEffect: 'large',
    milestone: {
      message: 'Amazing!',
      duration: 1000,
      hapticPattern: 'heavy',
      celebration: true,
    },
  },

  8: {
    level: 8,
    displayBadge: true,
    badgeText: '8x 🌟',
    characterScale: 1.22,
    backgroundTint: 'rgba(168, 85, 247, 0.22)',
    glowColor: '#A855F7',
    particleEffect: 'large',
  },

  9: {
    level: 9,
    displayBadge: true,
    badgeText: '9x 🌟',
    characterScale: 1.24,
    backgroundTint: 'rgba(251, 191, 36, 0.24)',
    glowColor: '#FBBF24',
    particleEffect: 'epic',
  },

  10: {
    level: 10,
    displayBadge: true,
    badgeText: '10x 👑',
    characterScale: 1.25,
    backgroundTint: 'rgba(255, 215, 0, 0.25)',
    glowColor: '#FFD700',
    particleEffect: 'epic',
    milestone: {
      message: 'LEGENDARY!',
      duration: 1500,
      hapticPattern: 'sequence',
      celebration: true,
    },
  },
};

/**
 * Get combo level configuration
 * Returns appropriate config for current combo level
 */
export const getComboLevel = (combo: number): ComboLevel => {
  // Cap at level 10
  const level = Math.min(combo, 10);

  // Return exact level config, or fallback to highest if somehow > 10
  return COMBO_LEVELS[level] || COMBO_LEVELS[10];
};

/**
 * Check if current combo is a milestone
 */
export const isComboMilestone = (combo: number): boolean => {
  const config = getComboLevel(combo);
  return !!config.milestone;
};

/**
 * Get milestone message for display
 */
export const getComboMilestoneMessage = (combo: number): string | null => {
  const config = getComboLevel(combo);
  return config.milestone?.message || null;
};

/**
 * Combo Badge Colors (for gradient background)
 */
export const COMBO_BADGE_COLORS: Record<number, [string, string]> = {
  2: ['#FF6B9D', '#F97316'], // Pink to Orange
  3: ['#FF6B9D', '#F97316'],
  4: ['#F97316', '#FBBF24'], // Orange to Amber
  5: ['#3B82F6', '#60A5FA'], // Blue electric
  6: ['#3B82F6', '#60A5FA'],
  7: ['#A855F7', '#C084FC'], // Purple
  8: ['#A855F7', '#C084FC'],
  9: ['#FBBF24', '#FFD700'], // Amber to Gold
  10: ['#FFD700', '#FFA500'], // Gold to Orange
};

/**
 * Get combo badge gradient colors
 */
export const getComboBadgeColors = (combo: number): [string, string] => {
  const level = Math.min(combo, 10);
  return COMBO_BADGE_COLORS[level] || ['#FF6B9D', '#F97316'];
};

/**
 * Combo lost configuration
 */
export const COMBO_LOST_CONFIG = {
  shatterDuration: 400,
  messageDuration: 600,
  message: 'Streak lost!',
  hapticPattern: 'heavy' as const,
};
