/**
 * Speaking DNA Types
 * ==================
 * Type definitions for the Speaking DNA feature.
 *
 * Speaking DNA creates unique "speaking fingerprints" for each learner
 * based on their conversation patterns across 6 DNA strands.
 */

// ============================================================================
// DNA STRAND TYPES
// ============================================================================

export interface DNAStrandRhythm {
  type: 'thoughtful_pacer' | 'rapid_responder' | 'steady_speaker';
  words_per_minute_avg: number;
  pause_duration_avg_ms: number;
  consistency_score: number; // 0-1 scale
  description: string;
}

export interface DNAStrandConfidence {
  level: 'hesitant' | 'building' | 'comfortable' | 'fluent';
  score: number; // 0-1 scale
  response_latency_avg_ms: number;
  filler_rate_per_minute: number;
  trend: 'declining' | 'stable' | 'improving';
  description: string;
}

export interface DNAStrandVocabulary {
  style: 'adventurous' | 'safety_first' | 'balanced';
  unique_words_per_session: number;
  new_word_attempt_rate: number; // 0-1 scale
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

export interface DNAStrandAccuracy {
  pattern: 'perfectionist' | 'risk_taker' | 'balanced';
  grammar_accuracy: number; // 0-1 scale
  common_errors: string[];
  improving_areas: string[];
  description: string;
}

export interface DNAStrandLearning {
  type: 'explorer' | 'persistent' | 'cautious';
  retry_rate: number; // 0-1 scale
  challenge_acceptance: number; // 0-1 scale
  description: string;
}

export interface DNAStrandEmotional {
  pattern: 'quick_starter' | 'slow_warmer' | 'consistent';
  session_start_confidence: number; // 0-1 scale
  session_end_confidence: number; // 0-1 scale
  anxiety_triggers: string[];
  description: string;
}

export interface DNAStrands {
  rhythm: DNAStrandRhythm;
  confidence: DNAStrandConfidence;
  vocabulary: DNAStrandVocabulary;
  accuracy: DNAStrandAccuracy;
  learning: DNAStrandLearning;
  emotional: DNAStrandEmotional;
}

// ============================================================================
// OVERALL PROFILE TYPES
// ============================================================================

export interface OverallDNAProfile {
  speaker_archetype: string; // e.g., "The Thoughtful Builder"
  summary: string;
  coach_approach: 'patient_encourager' | 'challenge_provider' | 'balanced_guide' | 'adaptive_guide';
  strengths: string[];
  growth_areas: string[];
}

export interface BaselineAssessment {
  date: string;
  acoustic_metrics: Record<string, number>;
}

// ============================================================================
// COMPLETE DNA PROFILE
// ============================================================================

export interface SpeakingDNAProfile {
  _id: string;
  user_id: string;
  language: string;
  dna_strands: DNAStrands;
  overall_profile: OverallDNAProfile;
  baseline_assessment?: BaselineAssessment;
  sessions_analyzed: number;
  total_speaking_minutes: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BREAKTHROUGH TYPES
// ============================================================================

export type BreakthroughType =
  | 'confidence_jump'
  | 'vocabulary_expansion'
  | 'challenge_accepted'
  | 'confidence_level_up'
  | 'fluency_streak'
  | 'grammar_mastery'
  | 'speed_improvement'
  | 'anxiety_overcome';

export type BreakthroughCategory =
  | 'confidence'
  | 'vocabulary'
  | 'learning'
  | 'rhythm'
  | 'accuracy'
  | 'emotional';

export interface SpeakingBreakthrough {
  _id: string;
  user_id: string;
  language: string;
  session_id?: string;
  breakthrough_type: BreakthroughType;
  category: BreakthroughCategory;
  title: string;
  description: string;
  emoji: string;
  metrics: {
    before: Record<string, any>;
    after: Record<string, any>;
    improvement_percent?: number;
  };
  context: {
    session_type: string;
    topics?: string[];
    trigger_sentence?: string;
  };
  celebrated: boolean;
  shared: boolean;
  created_at: string;
}

// ============================================================================
// DNA EVOLUTION & HISTORY
// ============================================================================

export interface DNAHistorySnapshot {
  _id: string;
  user_id: string;
  language: string;
  week_start: string;
  week_number: number;
  strand_snapshots: Record<string, Record<string, any>>;
  week_stats: {
    sessions_completed: number;
    total_minutes: number;
    breakthroughs_count?: number;
  };
  created_at: string;
}

// ============================================================================
// SESSION ANALYSIS TYPES
// ============================================================================

export interface SessionTurnData {
  transcript: string;
  start_time_ms: number;
  end_time_ms: number;
  ai_prompt_end_time_ms?: number;
}

export interface SessionAnalysisInput {
  session_id: string;
  session_type: 'learning' | 'freestyle' | 'news' | 'voice_check' | 'speaking_assessment';
  duration_seconds: number;
  user_turns: SessionTurnData[];
  corrections_received?: any[];
  challenges_offered?: number;
  challenges_accepted?: number;
  topics_discussed?: string[];
  audio_base64?: string;
  audio_format?: string;
}

export interface SessionInsights {
  insights: string[];
  highlight_stat: {
    label: string;
    value: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface AnalyzeSessionResponse {
  success: boolean;
  breakthroughs: SpeakingBreakthrough[];
  session_insights: SessionInsights;
}

export interface DNAProfileResponse {
  profile: SpeakingDNAProfile | null;
  has_profile: boolean;
}

export interface DNAEvolutionResponse {
  evolution: DNAHistorySnapshot[];
  weeks_tracked: number;
}

export interface DNABreakthroughsResponse {
  breakthroughs: SpeakingBreakthrough[];
  total_count: number;
}

export interface CoachInstructionsResponse {
  instructions: string;
  has_profile: boolean;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface DNALoadingState {
  profile: boolean;
  evolution: boolean;
  breakthroughs: boolean;
}

export interface DNAErrorState {
  profile?: string;
  evolution?: string;
  breakthroughs?: string;
}

// ============================================================================
// STRAND COLORS (for UI visualization)
// ============================================================================

export const DNA_STRAND_COLORS = {
  rhythm: '#4ECDC4', // Teal
  confidence: '#9B59B6', // Purple
  vocabulary: '#2ECC71', // Green
  accuracy: '#E74C3C', // Red
  learning: '#3498DB', // Blue
  emotional: '#F39C12', // Orange
} as const;

export const DNA_STRAND_ICONS = {
  rhythm: 'pulse-outline',
  confidence: 'trending-up-outline',
  vocabulary: 'book-outline',
  accuracy: 'checkmark-circle-outline',
  learning: 'school-outline',
  emotional: 'heart-outline',
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DNAStrandKey = keyof DNAStrands;

export interface DNAMetricsCollectorState {
  sessionStartTime: number;
  userTurns: SessionTurnData[];
  corrections: any[];
  challengesOffered: number;
  challengesAccepted: number;
  topics: string[];
  lastAIPromptEndTime: number | null;
}
