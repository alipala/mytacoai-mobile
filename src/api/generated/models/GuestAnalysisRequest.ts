/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GuestSentenceForAnalysis = {
    text: string;
    timestamp: string;
    messageIndex: number;
};

export type GuestAnalysisRequest = {
    messages: Array<{
        role: string;
        content: string;
        timestamp?: string;
    }>;
    duration_minutes: number;
    sentences_for_analysis: Array<GuestSentenceForAnalysis>;
    language: string;
    level: string;
    topic?: string;
};
