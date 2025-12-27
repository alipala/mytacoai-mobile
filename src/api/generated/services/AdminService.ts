/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminLoginRequest } from '../models/AdminLoginRequest';
import type { AdminLoginResponse } from '../models/AdminLoginResponse';
import type { DashboardMetrics } from '../models/DashboardMetrics';
import type { UserListResponse } from '../models/UserListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Admin Login
     * Admin login endpoint
     * @param requestBody
     * @returns AdminLoginResponse Successful Response
     * @throws ApiError
     */
    public static adminLoginApiAdminLoginPost(
        requestBody: AdminLoginRequest,
    ): CancelablePromise<AdminLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Dashboard Metrics
     * Get dashboard metrics
     * @returns DashboardMetrics Successful Response
     * @throws ApiError
     */
    public static getDashboardMetricsApiAdminDashboardGet(): CancelablePromise<DashboardMetrics> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/dashboard',
        });
    }
    /**
     * Get Users Admin
     * Get users with pagination and search for admin panel
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @param q
     * @param isActive
     * @param isVerified
     * @param preferredLanguage
     * @returns UserListResponse Successful Response
     * @throws ApiError
     */
    public static getUsersAdminApiAdminUsersGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
        q?: (string | null),
        isActive?: (boolean | null),
        isVerified?: (boolean | null),
        preferredLanguage?: (string | null),
    ): CancelablePromise<UserListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/users',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
                'q': q,
                'is_active': isActive,
                'is_verified': isVerified,
                'preferred_language': preferredLanguage,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create User Admin
     * Create a new user
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createUserAdminApiAdminUsersPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Admin
     * Get single user details
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUserAdminApiAdminUsersUserIdGet(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User Admin
     * Update user details
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateUserAdminApiAdminUsersUserIdPut(
        userId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User Admin
     * Delete a user (admin only)
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteUserAdminApiAdminUsersUserIdDelete(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversations Admin
     * Get conversation sessions with pagination for admin panel
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationsAdminApiAdminConversationSessionsGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/conversation_sessions',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversation Admin
     * Get single conversation details
     * @param conversationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationAdminApiAdminConversationSessionsConversationIdGet(
        conversationId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/conversation_sessions/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Learning Plans Admin
     * Get learning plans with pagination for admin panel
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLearningPlansAdminApiAdminLearningPlansGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/learning_plans',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Stats Admin
     * Get user statistics with pagination for admin panel
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUserStatsAdminApiAdminUserStatsGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/user_stats',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Badges Admin
     * Get badges with pagination for admin panel
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getBadgesAdminApiAdminBadgesGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/badges',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Assessment History Admin
     * Get assessment history with pagination for admin panel
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAssessmentHistoryAdminApiAdminAssessmentHistoryGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/assessment_history',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Fix Subscription Dates
     * Fix subscription dates by syncing from Stripe
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static fixSubscriptionDatesApiAdminFixSubscriptionDatesUserIdPost(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/fix-subscription-dates/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Admin Health Check
     * Admin health check endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static adminHealthCheckApiAdminHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/health',
        });
    }
}
