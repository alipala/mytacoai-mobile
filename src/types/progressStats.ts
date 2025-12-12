// TypeScript types for Progress Statistics API responses

export interface SessionStats {
  session_number?: number; // For learning plan sessions
  week_number?: number; // For learning plan sessions
  week_focus?: string; // For learning plan sessions
  words_spoken: number;
  speaking_speed_wpm: number;
  unique_vocabulary: number;
  conversation_turns: number;
  grammar_score?: number | null;
  fluency_score?: number | null;
}

export interface SessionComparison {
  has_previous_session: boolean;
  words_improvement?: number;
  speed_improvement?: number;
  vocabulary_growth?: number;
}

export interface OverallProgress {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  // Learning plan specific fields
  plan_progress_percentage?: number;
  plan_completed_sessions?: number;
  plan_total_sessions?: number;
  plan_total_minutes?: number; // Calculated in frontend: sessions × duration
}

export interface ProgressStatsResponse {
  session_stats?: SessionStats;
  comparison?: SessionComparison;
  overall_progress?: OverallProgress;
  // Existing fields
  background_analyses?: any[];
  summary?: string;
}
