/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LearningPlan } from '../models/LearningPlan';
import type { SessionProgressUpdate } from '../models/SessionProgressUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LearningService {
    /**
     * Get Learning Goals
     * Get a list of learning goals
     *
     * Args:
     * enriched: If True, return enriched goals with sub-goals. If False, return legacy format.
     * @param enriched
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLearningGoalsApiLearningGoalsGet(
        enriched: boolean = false,
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning/goals',
            query: {
                'enriched': enriched,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Sub Goals
     * Get sub-goals for a specific main goal
     *
     * Args:
     * goal_id: Main goal identifier (e.g., "travel", "business")
     *
     * Returns:
     * List of sub-goals with descriptions
     * @param goalId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSubGoalsApiLearningGoalsGoalIdSubGoalsGet(
        goalId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning/goals/{goal_id}/sub-goals',
            path: {
                'goal_id': goalId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Learning Plan
     * Create a custom learning plan based on user's proficiency level, goals, and duration.
     * Authentication is required for assessment data processing.
     * 🔥 FIXED: Now handles missing required fields and different request formats gracefully
     * @param requestBody
     * @returns LearningPlan Successful Response
     * @throws ApiError
     */
    public static createLearningPlanApiLearningPlanPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<LearningPlan> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/learning/plan',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Learning Plan
     * Get a specific learning plan by ID
     * @param planId
     * @returns LearningPlan Successful Response
     * @throws ApiError
     */
    public static getLearningPlanApiLearningPlanPlanIdGet(
        planId: string,
    ): CancelablePromise<LearningPlan> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning/plan/{plan_id}',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assign Plan To User
     * Assign an anonymous learning plan to the current user
     * @param planId
     * @returns LearningPlan Successful Response
     * @throws ApiError
     */
    public static assignPlanToUserApiLearningPlanPlanIdAssignPut(
        planId: string,
    ): CancelablePromise<LearningPlan> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/learning/plan/{plan_id}/assign',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Learning Plans
     * Get all learning plans for the current user
     * @returns LearningPlan Successful Response
     * @throws ApiError
     */
    public static getUserLearningPlansApiLearningPlansGet(): CancelablePromise<Array<LearningPlan>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning/plans',
        });
    }
    /**
     * Update Session Progress
     * Update the session progress for a learning plan
     * @param planId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateSessionProgressApiLearningPlanPlanIdProgressPut(
        planId: string,
        requestBody: SessionProgressUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/learning/plan/{plan_id}/progress',
            path: {
                'plan_id': planId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
