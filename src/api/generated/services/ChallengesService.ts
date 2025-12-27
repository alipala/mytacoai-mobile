/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChallengeCompletionRequest } from '../models/ChallengeCompletionRequest';
import type { ChallengeCountsResponse } from '../models/ChallengeCountsResponse';
import type { ChallengesByTypeResponse } from '../models/ChallengesByTypeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChallengesService {
    /**
     * Get Daily Challenges
     * Get 6 personalized daily challenges
     *
     * Query Parameters:
     * - language (optional): Target language (english, spanish, dutch, german, french, portuguese)
     * - level (optional): CEFR level (A1, A2, B1, B2, C1, C2)
     *
     * If not provided, falls back to user's active learning plan or profile preferences.
     *
     * - Returns cached challenges if available (24h cache)
     * - Personalizes based on user's weak areas from flashcards/sessions
     * - Marks challenges as completed if user finished them today
     * @param language
     * @param level
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDailyChallengesApiChallengesDailyGet(
        language?: (string | null),
        level?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/challenges/daily',
            query: {
                'language': language,
                'level': level,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Complete Challenge
     * Mark a challenge as completed
     *
     * - Tracks completion in user stats
     * - Updates streak
     * - Awards XP (optional for v1)
     * @param challengeId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static completeChallengeApiChallengesChallengeIdCompletePost(
        challengeId: string,
        requestBody: ChallengeCompletionRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/challenges/{challenge_id}/complete',
            path: {
                'challenge_id': challengeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Challenge Stats
     * Get user's challenge statistics
     *
     * Returns:
     * - Total completed
     * - Current streak
     * - Completed today count
     * - Challenge history
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getChallengeStatsApiChallengesStatsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/challenges/stats',
        });
    }
    /**
     * Get Challenge Counts
     * Get available challenge counts per type for the user
     *
     * Query Parameters:
     * - language (optional): Target language (english, spanish, dutch, german, french, portuguese)
     * - level (optional): CEFR level (A1, A2, B1, B2, C1, C2)
     * - source (optional): Challenge source - 'reference' for Freestyle Practice (fast, no AI),
     * 'learning_plan' for personalized challenges (AI-generated),
     * None for default behavior (backward compatible)
     *
     * If not provided, falls back to user's active learning plan or profile preferences.
     *
     * Auto-handling:
     * - New users: Instant copy from reference challenges
     * - Low pool: Auto-replenishes with personalized AI challenges
     * - Always ensures user has content
     * @param language
     * @param level
     * @param source
     * @returns ChallengeCountsResponse Successful Response
     * @throws ApiError
     */
    public static getChallengeCountsApiChallengesCountsGet(
        language?: (string | null),
        level?: (string | null),
        source?: (string | null),
    ): CancelablePromise<ChallengeCountsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/challenges/counts',
            query: {
                'language': language,
                'level': level,
                'source': source,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Challenges By Type
     * Get available challenges of a specific type
     *
     * Path Parameters:
     * - challenge_type: Type of challenge (error_spotting, swipe_fix, etc.)
     *
     * Query Parameters:
     * - language (optional): Target language (english, spanish, dutch, german, french, portuguese)
     * - level (optional): CEFR level (A1, A2, B1, B2, C1, C2)
     * - limit: Maximum number of challenges to return (default 50)
     * - source (optional): Challenge source - 'reference' for Freestyle Practice (fast, no AI),
     * 'learning_plan' for personalized challenges (AI-generated),
     * None for default behavior (backward compatible)
     *
     * If language/level not provided, falls back to user's active learning plan or profile preferences.
     *
     * Returns list of available challenges sorted by creation date
     * @param challengeType
     * @param language
     * @param level
     * @param limit
     * @param source
     * @returns ChallengesByTypeResponse Successful Response
     * @throws ApiError
     */
    public static getChallengesByTypeApiChallengesByTypeChallengeTypeGet(
        challengeType: string,
        language?: (string | null),
        level?: (string | null),
        limit: number = 50,
        source?: (string | null),
    ): CancelablePromise<ChallengesByTypeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/challenges/by-type/{challenge_type}',
            path: {
                'challenge_type': challengeType,
            },
            query: {
                'language': language,
                'level': level,
                'limit': limit,
                'source': source,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Available Languages
     * Get list of all available languages and user's learning status
     *
     * Query Parameters:
     * - level (optional): CEFR level to check counts for (A1, A2, B1, B2, C1, C2)
     *
     * Returns:
     * List of languages with:
     * - Language name
     * - Whether user has active plan
     * - Challenge counts available (for specified or user's level)
     * @param level
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAvailableLanguagesApiChallengesLanguagesGet(
        level?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/challenges/languages',
            query: {
                'level': level,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
