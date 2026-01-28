/**
 * Speaking DNA Constants
 *
 * Centralized configuration for colors, animations, and DNA strands
 */

import { DNAStrandKey } from '../../types/speakingDNA';

// DNA Strand Colors
export const DNA_COLORS: Record<DNAStrandKey, string> = {
  rhythm: '#4ECDC4',
  confidence: '#9B59B6',
  vocabulary: '#2ECC71',
  accuracy: '#3498DB',
  learning: '#E67E22',
  emotional: '#E91E63',
};

// Theme Colors
export const THEME_COLORS = {
  primary: '#14B8A6',
  secondary: '#0D9488',
  accent: '#FFD63A',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    light: '#9CA3AF',
    white: '#FFFFFF',
  },
  gradient: {
    start: '#14B8A6',
    mid: '#F0FDFA',
    end: '#FAFAFA',
  },
};

// Animation Configurations
export const ANIMATION_CONFIG = {
  spring: {
    damping: 15,
    stiffness: 100,
  },
  timing: {
    duration: 800,
  },
  stagger: 100, // ms between staggered items
};

// DNA Strand Labels
export const DNA_STRAND_LABELS: Record<DNAStrandKey, string> = {
  rhythm: 'Rhythm',
  confidence: 'Confidence',
  vocabulary: 'Vocabulary',
  accuracy: 'Accuracy',
  learning: 'Learning',
  emotional: 'Emotional',
};

// Tab Names
export const TABS = {
  SUMMARY: 0,
  GROWTH: 1,
  HISTORY: 2,
  BREAKTHROUGHS: 3,
} as const;

export const TAB_LABELS = ['Summary', 'Growth', 'History', 'Breakthroughs'];

/**
 * Extract numeric score (0-100) from DNA strand object
 * Different strands store scores in different fields (all 0-1 scale)
 */
export const getStrandScore = (strand: any): number => {
  if (!strand) return 0;

  // Try different score fields based on strand type
  if ('score' in strand) return Math.round(strand.score * 100);
  if ('consistency_score' in strand) return Math.round(strand.consistency_score * 100);
  if ('grammar_accuracy' in strand) return Math.round(strand.grammar_accuracy * 100);
  if ('new_word_attempt_rate' in strand) return Math.round(strand.new_word_attempt_rate * 100);
  if ('challenge_acceptance' in strand) return Math.round(strand.challenge_acceptance * 100);
  if ('session_end_confidence' in strand) return Math.round(strand.session_end_confidence * 100);

  return 0;
};
