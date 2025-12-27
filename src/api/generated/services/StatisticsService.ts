/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyStatsResponse } from '../models/DailyStatsResponse';
import type { LifetimeProgressResponse } from '../models/LifetimeProgressResponse';
import type { RecentPerformanceResponse } from '../models/RecentPerformanceResponse';
import type { UnifiedStatsResponse } from '../models/UnifiedStatsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsService {
    /**
     * Get Daily Stats
     * Get today's statistics for the current user.
     *
     * Returns:
     * - Overall stats (challenges, accuracy, XP, time)
     * - Breakdown by language, level, and challenge type
     * - Streak information
     * @param timezone User's timezone (e.g., 'America/New_York')
     * @returns DailyStatsResponse Successful Response
     * @throws ApiError
     */
    public static getDailyStatsApiStatsDailyGet(
        timezone?: (string | null),
    ): CancelablePromise<DailyStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stats/daily',
            query: {
                'timezone': timezone,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Recent Performance Endpoint
     * Get recent performance statistics (rolling window).
     *
     * Returns:
     * - Summary metrics (total challenges, average accuracy, XP, time)
     * - Insights (most/least practiced areas, improvement trend)
     * - Daily breakdown for charting
     * - Language and type distributions
     * - Level-wise performance rankings
     * @param days Number of days to look back
     * @param timezone
     * @returns RecentPerformanceResponse Successful Response
     * @throws ApiError
     */
    public static getRecentPerformanceEndpointApiStatsRecentGet(
        days: number = 7,
        timezone?: (string | null),
    ): CancelablePromise<RecentPerformanceResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stats/recent',
            query: {
                'days': days,
                'timezone': timezone,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Lifetime Progress Endpoint
     * Get lifetime progress and mastery statistics.
     *
     * Returns:
     * - Summary metrics (total challenges, XP, time, streaks)
     * - Language-specific progress with mastery percentages
     * - CEFR level mastery with star ratings
     * - Challenge type mastery with rankings
     * - Learning path recommendations
     * - Optional: Achievement history
     * - Milestone tracking
     * @param language Filter by language
     * @param includeAchievements Include achievement history
     * @returns LifetimeProgressResponse Successful Response
     * @throws ApiError
     */
    public static getLifetimeProgressEndpointApiStatsLifetimeGet(
        language?: (string | null),
        includeAchievements: boolean = false,
    ): CancelablePromise<LifetimeProgressResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stats/lifetime',
            query: {
                'language': language,
                'include_achievements': includeAchievements,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get All Stats
     * Get unified stats response (daily + recent + lifetime).
     *
     * This endpoint is optimized for mobile apps to fetch all stats
     * in a single request, reducing network overhead.
     *
     * Returns:
     * - Daily stats (today's progress)
     * - Recent performance (7-day rolling window)
     * - Lifetime progress (cumulative statistics)
     * @param timezone
     * @param days Days for recent performance
     * @param includeAchievements Include achievements in lifetime stats
     * @returns UnifiedStatsResponse Successful Response
     * @throws ApiError
     */
    public static getAllStatsApiStatsAllGet(
        timezone?: (string | null),
        days: number = 7,
        includeAchievements: boolean = false,
    ): CancelablePromise<UnifiedStatsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stats/all',
            query: {
                'timezone': timezone,
                'days': days,
                'include_achievements': includeAchievements,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
