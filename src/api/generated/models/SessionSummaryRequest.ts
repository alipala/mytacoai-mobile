/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Model for session summary with optional duration and batch analysis
 */
export type SessionSummaryRequest = {
    messages?: null;
    duration_minutes?: (number | null);
    language?: (string | null);
    level?: (string | null);
    topic?: (string | null);
    sentences_for_analysis?: null;
};

