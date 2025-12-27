/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuestMessage } from './GuestMessage';
import type { GuestSentence } from './GuestSentence';
export type GuestSessionAnalysisRequest = {
    messages: Array<GuestMessage>;
    duration_minutes: number;
    sentences_for_analysis: Array<GuestSentence>;
    language: string;
    level: string;
    topic?: (string | null);
};

