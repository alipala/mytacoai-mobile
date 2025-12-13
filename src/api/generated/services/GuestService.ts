/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuestAnalysisRequest } from '../models/GuestAnalysisRequest';
import type { GuestAnalysisResponse } from '../models/GuestAnalysisResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class GuestService {
    /**
     * Analyze Guest Session
     * Complete session analysis for guest users including sentence corrections,
     * AI summary, insights, and flashcards without requiring authentication
     * @returns GuestAnalysisResponse Successful Response
     * @throws ApiError
     */
    public static analyzeGuestSessionApiGuestAnalyzeSessionPost({
        requestBody,
    }: {
        requestBody: GuestAnalysisRequest;
    }): CancelablePromise<GuestAnalysisResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/guest/analyze-session',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Quick Stats
     * Get just session statistics without full analysis (faster, cheaper)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static quickStatsApiGuestQuickStatsPost({
        requestBody,
    }: {
        requestBody: {
            messages: Array<{
                role: string;
                content: string;
            }>;
            duration_minutes: number;
        };
    }): CancelablePromise<{
        success: boolean;
        stats: {
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
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/guest/quick-stats',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
