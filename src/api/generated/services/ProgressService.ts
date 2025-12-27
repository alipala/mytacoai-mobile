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
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static saveConversationApiProgressSaveConversationPost(
        requestBody: SaveConversationRequest,
    ): CancelablePromise<any> {
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
     * @param limit
     * @param offset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationHistoryApiProgressConversationsGet(
        limit: number = 10,
        offset?: number,
    ): CancelablePromise<any> {
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
     * @param sessionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationAnalysisApiProgressConversationSessionIdAnalysisGet(
        sessionId: string,
    ): CancelablePromise<any> {
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
    /**
     * Get Challenge Progress
     * Get user's challenge completion statistics
     *
     * Returns:
     * - completed_count: Total challenges completed for this language/level
     * - completed_by_type: Dict of completed count per challenge type
     * - total_available: Total challenges available (from reference)
     * - progress_percentage: Overall progress percentage
     * @param language
     * @param level
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getChallengeProgressApiProgressChallengeStatsGet(
        language: string,
        level: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/progress/challenge-stats',
            query: {
                'language': language,
                'level': level,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
