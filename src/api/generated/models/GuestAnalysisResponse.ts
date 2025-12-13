/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GuestSessionStats = {
    total_words: number;
    user_words: number;
    tutor_words: number;
    user_message_count: number;
    tutor_message_count: number;
    total_messages: number;
    average_user_message_length: number;
    average_tutor_message_length: number;
    conversation_turns: number;
    speaking_speed_wpm: number;
    duration_minutes: number;
};

export type GuestBackgroundAnalysis = {
    analysis_id: string;
    recognized_text: string;
    corrected_text: string;
    overall_score: number;
    grammatical_score: number;
    vocabulary_score: number;
    complexity_score: number;
    appropriateness_score: number;
    grammar_issues: Array<string>;
    improvement_suggestions: Array<string>;
    level_appropriate_alternatives: Array<string>;
    timestamp: string;
};

export type GuestInsights = {
    breakthrough_moments: Array<string>;
    struggle_points: Array<string>;
    confidence_level: string;
    immediate_actions: Array<string>;
};

export type GuestFlashcard = {
    id: string;
    front: string;
    back: string;
    category: string;
    difficulty: string;
    hint?: string;
};

export type GuestAnalysisResponse = {
    success: boolean;
    is_guest: boolean;
    session_stats: GuestSessionStats;
    session_summary: string;
    background_analyses: Array<GuestBackgroundAnalysis>;
    insights: GuestInsights;
    flashcards: Array<GuestFlashcard>;
    message: string;
};
