/**
 * Speaking DNA - Type Definitions
 *
 * Comprehensive type definitions for the Speaking DNA feature
 */

/**
 * DNA Strand Keys
 */
export type DNAStrandKey = 'rhythm' | 'confidence' | 'vocabulary' | 'accuracy' | 'learning' | 'emotional';

/**
 * Individual DNA Strand
 */
export interface DNAStrand {
  score: number; // 0-100
  level: string; // e.g., "steady_speaker", "building", "balanced"
  type: string; // e.g., "steady_speaker", "building", "balanced"
  pattern: string; // Description of the pattern
  description: string; // Human-readable description
  improving?: boolean; // Is this strand improving?
}

/**
 * Complete DNA Strands Object
 */
export interface DNAStrands {
  rhythm: DNAStrand;
  confidence: DNAStrand;
  vocabulary: DNAStrand;
  accuracy: DNAStrand;
  learning: DNAStrand;
  emotional: DNAStrand;
}

/**
 * DNA Profile (Main)
 */
export interface DNAProfile {
  _id: string;
  user_id: string;
  language: string;
  dna_strands: DNAStrands;
  archetype: {
    key: string;
    name: string;
    summary: string;
    coach_approach: string;
  };
  strengths: string[];
  growth_areas: string[];
  total_sessions: number;
  total_minutes: number;
  last_session_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Weekly Snapshot
 */
export interface WeeklySnapshot {
  _id: string;
  user_id: string;
  language: string;
  week_start: string;
  strand_snapshots: DNAStrands;
  week_stats: {
    sessions_completed: number;
    total_minutes: number;
    breakthroughs_count: number;
  };
  created_at: string;
}

/**
 * Breakthrough
 */
export interface Breakthrough {
  _id: string;
  user_id: string;
  language: string;
  breakthrough_type: 'confidence_jump' | 'vocabulary_expansion' | 'challenge_accepted' | 'level_up';
  strand_affected: DNAStrandKey;
  context: string;
  previous_value: number;
  new_value: number;
  improvement: number;
  celebrated: boolean;
  created_at: string;
}

/**
 * Radar Chart Data Point
 */
export interface RadarDataPoint {
  strand: DNAStrandKey;
  score: number;
  label: string;
  x?: string; // For Victory Native
  y?: number; // For Victory Native
}

/**
 * Session Stats for Summary
 */
export interface SessionStats {
  duration: string; // formatted time e.g., "5:01"
  wordsSpoken: number;
  speakingSpeed: number; // wpm
  vocabulary: number; // unique words
  turns: number;
  analyzed: number;
  accuracy?: number; // percentage
}

/**
 * Comparison Data
 */
export interface ComparisonData {
  metric: string;
  current: number;
  previous: number;
  change: number; // +/- value
  changePercentage: number;
  improved: boolean;
}

/**
 * Insight Item
 */
export interface InsightItem {
  id: string;
  text: string;
  type: 'strength' | 'growth' | 'improving' | 'declining';
  icon: string;
}

/**
 * Evolution Timeline Week
 */
export interface TimelineWeek {
  weekNumber: number;
  weekStart: Date;
  sessions: number;
  minutes: number;
  strands: DNAStrands;
  isCurrent: boolean;
}

/**
 * Breakthrough Card Data
 */
export interface BreakthroughCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: string;
  gradient: string[];
  celebrated: boolean;
  createdAt: Date;
}

/**
 * DNA Screen State
 */
export interface DNAScreenState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  profile: DNAProfile | null;
  evolution: WeeklySnapshot[];
  breakthroughs: Breakthrough[];
  selectedStrand: DNAStrandKey | null;
}

/**
 * Touch Event Types
 */
export interface TouchPosition {
  x: number;
  y: number;
}

export interface GestureState {
  scale: number;
  translateX: number;
  translateY: number;
}

/**
 * Animation Config Types
 */
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
}

export interface StaggerConfig extends AnimationConfig {
  stagger: number;
}

/**
 * Component Props Types
 */

export interface InteractiveRadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  onStrandTap?: (strand: DNAStrandKey) => void;
  onStrandLongPress?: (strand: DNAStrandKey) => void;
  animated?: boolean;
}

export interface DNAStickyHeaderProps {
  scrollY: any; // Shared value from reanimated
  title: string;
  onBack?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
}

export interface DNAStrandCarouselProps {
  strands: DNAStrands;
  onStrandPress?: (strand: DNAStrandKey) => void;
}

export interface InsightsHubProps {
  strengths: string[];
  growthAreas: string[];
}

export interface EvolutionTimelineProps {
  weeks: TimelineWeek[];
  onWeekPress?: (week: TimelineWeek) => void;
}

export interface BreakthroughsSectionProps {
  breakthroughs: BreakthroughCard[];
  onBreakthroughPress?: (breakthrough: BreakthroughCard) => void;
  onSeeAll?: () => void;
}

export interface SessionSummaryBottomSheetProps {
  visible: boolean;
  stats: SessionStats;
  comparison?: ComparisonData[];
  onViewAnalysis: () => void;
  onClose: () => void;
}

export interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  color?: string;
  delay?: number;
}

/**
 * Helper Types
 */
export type StrandLevelType = 'low' | 'building' | 'balanced' | 'strong' | 'expert';
export type ArchetypeKey = 'natural' | 'analytical' | 'adventurer' | 'perfectionist' | 'explorer' | 'unique';

/**
 * API Response Types
 */
export interface DNAProfileResponse {
  profile: DNAProfile | null;
  has_profile: boolean;
}

export interface DNAEvolutionResponse {
  evolution: WeeklySnapshot[];
  weeks_tracked: number;
}

export interface DNABreakthroughsResponse {
  breakthroughs: Breakthrough[];
  total_count: number;
}

export interface AnalyzeSessionResponse {
  success: boolean;
  breakthroughs: Breakthrough[];
  session_insights: {
    archetype_updated: boolean;
    significant_changes: string[];
  };
}
