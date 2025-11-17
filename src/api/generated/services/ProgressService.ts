/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SaveConversationRequest } from '../models/SaveConversationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProgressService {
    /**
     * Get Dashboard Data
     * 🚀 BATCH ENDPOINT: Get all dashboard data in a single request
     *
     * This endpoint combines multiple API calls into one:
     * - Progress stats
     * - Recent conversations
     * - Achievements
     * - Flashcard sets
     * - Due flashcards
     * - Learning plans
     *
     * All queries run in parallel for optimal performance.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDashboardDataApiProgressDashboardDataGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/progress/dashboard-data',
        });
    }
    /**
     * Save Conversation
     * Save a conversation session for a registered user with batch sentence analysis
     * @returns any Successful Response
     * @throws ApiError
     */
    public static saveConversationApiProgressSaveConversationPost({
        requestBody,
    }: {
        requestBody: SaveConversationRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/progress/save-conversation',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Progress Stats
     * 🔥 FIXED: Get user's conversation statistics INCLUDING learning plan sessions
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getProgressStatsApiProgressStatsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/progress/stats',
        });
    }
    /**
     * Get Conversation History
     * Get user's conversation history
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationHistoryApiProgressConversationsGet({
        limit = 10,
        offset,
    }: {
        limit?: number,
        offset?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/progress/conversations',
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversation Analysis
     * Get enhanced analysis for a specific conversation session
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationAnalysisApiProgressConversationSessionIdAnalysisGet({
        sessionId,
    }: {
        sessionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/progress/conversation/{session_id}/analysis',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Achievements
     * Get user's achievements based on their progress
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUserAchievementsApiProgressAchievementsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/progress/achievements',
        });
    }
}
