/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RealtimeUsageData = {
    user_id?: (string | null);
    session_id: string;
    language: string;
    level: string;
    topic?: (string | null);
    audio_input_tokens?: number;
    audio_output_tokens?: number;
    text_input_tokens?: number;
    text_output_tokens?: number;
    cached_input_audio_tokens?: number;
    cached_input_text_tokens?: number;
    total_tokens?: number;
    session_start: string;
    session_end?: (string | null);
    session_duration_seconds?: (number | null);
    estimated_cost?: number;
    model?: string;
    start_time?: (number | null);
    end_time?: (number | null);
};

