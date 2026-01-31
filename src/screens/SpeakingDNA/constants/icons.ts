/**
 * Speaking DNA - Icon System
 *
 * Centralized icon mappings using Ionicons
 * Provides consistent iconography across the feature
 */

import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * DNA Strand Icons
 * Each strand has a unique icon that represents its concept
 */
export const DNA_STRAND_ICONS: Record<string, IconName> = {
  rhythm: 'pulse',           // Musical tempo feel - flowing rhythm
  confidence: 'trending-up', // Growth direction - building confidence
  vocabulary: 'library',     // Collection of words - knowledge base
  accuracy: 'checkmark-done',// Precision - correct usage
  learning: 'bulb',          // Ideas and growth - illumination
  emotional: 'heart',        // Emotional state - connection
};

/**
 * Action Icons
 * Icons for user interactions and navigation
 */
export const ACTION_ICONS = {
  // Navigation
  back: 'chevron-back' as IconName,
  forward: 'chevron-forward' as IconName,
  close: 'close' as IconName,

  // Expansion/Collapse
  expand: 'chevron-down' as IconName,
  collapse: 'chevron-up' as IconName,
  expandCircle: 'chevron-down-circle' as IconName,
  collapseCircle: 'chevron-up-circle' as IconName,

  // Sharing & Settings
  share: 'share-social-outline' as IconName,
  settings: 'settings-outline' as IconName,
  options: 'ellipsis-horizontal' as IconName,

  // Information
  info: 'information-circle-outline' as IconName,
  help: 'help-circle-outline' as IconName,
  alert: 'alert-circle-outline' as IconName,

  // Media Controls
  play: 'play-circle' as IconName,
  pause: 'pause-circle' as IconName,
  stop: 'stop-circle' as IconName,

  // Status & Feedback
  success: 'checkmark-circle' as IconName,
  error: 'close-circle' as IconName,
  warning: 'warning' as IconName,

  // Growth & Achievement
  trophy: 'trophy' as IconName,
  medal: 'medal' as IconName,
  star: 'star' as IconName,
  starOutline: 'star-outline' as IconName,
  flame: 'flame' as IconName,
  rocket: 'rocket' as IconName,

  // Analytics & Stats
  analytics: 'analytics' as IconName,
  trending: 'trending-up' as IconName,
  trendingDown: 'trending-down' as IconName,
  stats: 'stats-chart' as IconName,
  barChart: 'bar-chart' as IconName,

  // Time & Calendar
  time: 'time-outline' as IconName,
  calendar: 'calendar-outline' as IconName,
  calendarClear: 'calendar-clear-outline' as IconName,

  // Communication
  mic: 'mic' as IconName,
  micOff: 'mic-off' as IconName,
  chatbubble: 'chatbubble' as IconName,
  chatbubbles: 'chatbubbles' as IconName,

  // User
  person: 'person' as IconName,
  people: 'people' as IconName,

  // Actions
  add: 'add' as IconName,
  remove: 'remove' as IconName,
  refresh: 'refresh' as IconName,
  download: 'download' as IconName,
  upload: 'upload' as IconName,

  // Edit
  create: 'create' as IconName,
  trash: 'trash' as IconName,

  // Miscellaneous
  sparkles: 'sparkles' as IconName,
  flask: 'flask' as IconName,
  bookmark: 'bookmark' as IconName,
  flag: 'flag' as IconName,
};

/**
 * Session Stat Icons
 * Icons for displaying session statistics
 */
export const SESSION_STAT_ICONS = {
  duration: 'time-outline' as IconName,
  wordsSpoken: 'chatbubble-ellipses' as IconName,
  speakingSpeed: 'speedometer' as IconName,
  vocabulary: 'library' as IconName,
  turns: 'repeat' as IconName,
  analyzed: 'analytics' as IconName,
  accuracy: 'checkmark-done-circle' as IconName,
  fluency: 'pulse' as IconName,
  engagement: 'heart' as IconName,
};

/**
 * Insight Icons
 * Icons for displaying user insights
 */
export const INSIGHT_ICONS = {
  strength: 'checkmark-circle' as IconName,
  growthArea: 'arrow-up-circle' as IconName,
  improving: 'trending-up' as IconName,
  declining: 'trending-down' as IconName,
  stable: 'remove-circle' as IconName,
  newPattern: 'sparkles' as IconName,
};

/**
 * Breakthrough Category Icons
 * Icons for different breakthrough types
 */
export const BREAKTHROUGH_ICONS = {
  confidenceJump: 'trending-up' as IconName,
  vocabularyExpansion: 'library' as IconName,
  fluencyStreak: 'flame' as IconName,
  challengeAccepted: 'trophy' as IconName,
  levelUp: 'rocket' as IconName,
  perfectSession: 'star' as IconName,
  milestoneReached: 'medal' as IconName,
};

/**
 * Icon sizes
 * Standardized sizes for consistent hierarchy
 */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  huge: 64,
};

/**
 * Icon container sizes
 * For icons with background containers
 */
export const ICON_CONTAINER_SIZES = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  xxl: 64,
};

/**
 * Helper function to get icon name by strand key
 */
export const getStrandIcon = (strand: string): IconName => {
  return DNA_STRAND_ICONS[strand] || 'help-circle-outline';
};

/**
 * Helper function to get breakthrough icon by type
 */
export const getBreakthroughIcon = (type: string): IconName => {
  // Convert snake_case to camelCase
  const camelType = type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  return BREAKTHROUGH_ICONS[camelType as keyof typeof BREAKTHROUGH_ICONS] || 'trophy';
};

export type DNAStrandKey = keyof typeof DNA_STRAND_ICONS;
export type ActionIconKey = keyof typeof ACTION_ICONS;
export type SessionStatIconKey = keyof typeof SESSION_STAT_ICONS;
export type InsightIconKey = keyof typeof INSIGHT_ICONS;
export type BreakthroughIconKey = keyof typeof BREAKTHROUGH_ICONS;
