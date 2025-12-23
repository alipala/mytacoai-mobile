/**
 * Statistics API Type Definitions
 *
 * Types matching the backend gamification & statistics system.
 * Based on: docs/GAMIFICATION_STATS_DESIGN.md
 */

// ============================================================================
// DAILY STATISTICS TYPES
// ============================================================================

export interface DailyStatsBreakdown {
  challenges: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  xp: number;
}

export interface DailyStatsOverall {
  total_sessions: number;
  total_challenges: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  total_xp: number;
  time_minutes: number;
}

export interface StreakInfo {
  current: number;
  longest: number;
  is_active_today: boolean;
  next_milestone: number;
}

export interface DailyStatsResponse {
  success: boolean;
  date: string; // "2025-12-21"
  timezone: string;
  overall: DailyStatsOverall;
  by_language: Record<string, DailyStatsBreakdown>;
  by_level: Record<string, DailyStatsBreakdown>;
  by_type: Record<string, DailyStatsBreakdown>;
  streak: StreakInfo;
  metadata: {
    last_updated: string | null;
    has_more_data: boolean;
  };
}

// ============================================================================
// RECENT PERFORMANCE TYPES
// ============================================================================

export interface RecentPerformanceSummary {
  total_sessions: number;
  total_challenges: number;
  average_accuracy: number;
  total_xp: number;
  total_time_minutes: number;
  active_days: number;
}

export interface RecentPerformanceInsights {
  most_practiced_type: string | null;
  most_practiced_language: string | null;
  weakest_level: string | null;
  weakest_level_accuracy: number;
  strongest_level: string | null;
  strongest_level_accuracy: number;
  improvement_trend: 'positive' | 'negative' | 'stable';
  accuracy_change_percent: number;
}

export interface DailyBreakdownItem {
  date: string;
  challenges: number;
  accuracy: number;
  xp: number;
  time_minutes: number;
  sessions: number;
}

export interface LanguageDistribution {
  challenges: number;
  percentage: number;
  accuracy: number;
}

export interface LevelPerformance {
  challenges: number;
  accuracy: number;
  rank: 'excellent' | 'good' | 'fair' | 'needs_work';
}

export interface RecentPerformanceResponse {
  success: boolean;
  window: {
    start: string;
    end: string;
    days: number;
  };
  summary: RecentPerformanceSummary;
  insights: RecentPerformanceInsights;
  daily_breakdown: DailyBreakdownItem[];
  language_distribution: Record<string, LanguageDistribution>;
  type_distribution: Record<string, LanguageDistribution>;
  level_performance: Record<string, LevelPerformance>;
  metadata: {
    calculated_at: string;
    cached_until: string;
  };
}

// ============================================================================
// LIFETIME PROGRESS TYPES
// ============================================================================

export interface LifetimeSummary {
  total_challenges: number;
  total_sessions: number;
  total_xp: number;
  total_time_hours: number;
  member_since: string;
  longest_streak: number;
  current_streak: number;
}

export interface LanguageProgress {
  total_challenges: number;
  highest_level: string;
  total_xp: number;
  started_at: string;
  last_practiced: string;
  time_hours: number;
  mastery_percent: number;
  level_breakdown: Record<string, {
    completed: number;
    accuracy: number;
    mastered: boolean;
  }>;
}

export interface LevelMastery {
  total_challenges: number;
  accuracy: number;
  mastery_stars: number; // 0-5
  languages: string[];
}

export interface ChallengeTypeMastery {
  total_challenges: number;
  accuracy: number;
  mastery_level: number; // 1-5
  rank: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  favorite: boolean;
}

export interface LearningPath {
  current_focus: string | null;
  suggested_next: string | null;
  weak_areas: string[];
  ready_for_next_level: string[];
}

export interface Milestone {
  type: string;
  current: number;
  target: number;
  progress_percent: number;
  reward_xp?: number;
}

export interface LifetimeProgressResponse {
  success: boolean;
  summary: LifetimeSummary;
  language_progress: Record<string, LanguageProgress>;
  level_mastery: Record<string, LevelMastery>;
  challenge_type_mastery: Record<string, ChallengeTypeMastery>;
  learning_path: LearningPath;
  achievements: any | null; // Optional
  milestones: {
    next_milestone?: Milestone;
    upcoming: Milestone[];
  };
  metadata: {
    calculated_at: string;
    data_since: string;
  };
}

// ============================================================================
// UNIFIED STATS TYPES
// ============================================================================

export interface UnifiedStatsResponse {
  success: boolean;
  daily: DailyStatsResponse;
  recent: RecentPerformanceResponse;
  lifetime: LifetimeProgressResponse;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type StatsLayer = 'daily' | 'recent' | 'lifetime' | 'all';

export interface StatsError {
  layer: StatsLayer;
  message: string;
  timestamp: Date;
}

// For UI state management
export interface StatsState {
  daily: DailyStatsResponse | null;
  recent: RecentPerformanceResponse | null;
  lifetime: LifetimeProgressResponse | null;
  loading: {
    daily: boolean;
    recent: boolean;
    lifetime: boolean;
  };
  errors: StatsError[];
  lastFetched: {
    daily: Date | null;
    recent: Date | null;
    lifetime: Date | null;
  };
}
