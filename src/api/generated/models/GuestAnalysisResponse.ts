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
    sentence: string;
    is_worth_analyzing: boolean;
    grammar_issues: Array<string>;
    vocabulary_suggestions: Array<string>;
    alternative_phrasings: Array<string>;
    difficulty_level: string;
    quality_score: number;
    explanation: string;
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
