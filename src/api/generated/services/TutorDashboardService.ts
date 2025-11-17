/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TutorChangePasswordRequest } from '../models/TutorChangePasswordRequest';
import type { TutorLoginRequest } from '../models/TutorLoginRequest';
import type { TutorLoginResponse } from '../models/TutorLoginResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TutorDashboardService {
    /**
     * Tutor Login
     * Tutor login endpoint
     *
     * Returns JWT token and tutor information
     * Rejects if tutor is inactive or has no password set
     * @returns TutorLoginResponse Successful Response
     * @throws ApiError
     */
    public static tutorLoginTutorLoginPost({
        requestBody,
    }: {
        requestBody: TutorLoginRequest,
    }): CancelablePromise<TutorLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tutor/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Change Password
     * Change tutor password
     *
     * Validates current password and updates to new password
     * Clears first_login flag
     * @returns string Successful Response
     * @throws ApiError
     */
    public static changePasswordTutorChangePasswordPost({
        requestBody,
    }: {
        requestBody: TutorChangePasswordRequest,
    }): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tutor/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Assigned Learners
     * Get all learners assigned to this tutor with progress data
     *
     * PHASE 1: Basic learner list
     * PHASE 2: Advanced filtering by language, level, status, activity
     *
     * Security: Verifies tutor can only access their own learners
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAssignedLearnersTutorDashboardTutorIdLearnersGet({
        tutorId,
        language,
        level,
        status,
        lastActivity,
        search,
        page = 1,
        perPage = 10,
    }: {
        tutorId: string,
        /**
         * Filter by language
         */
        language?: (string | null),
        /**
         * Filter by proficiency level (A1-C2)
         */
        level?: (string | null),
        /**
         * Filter by progress status (on_track|at_risk|inactive)
         */
        status?: (string | null),
        /**
         * Filter by last activity (today|week|month|1month|2months)
         */
        lastActivity?: (string | null),
        /**
         * Search by name or email
         */
        search?: (string | null),
        /**
         * Page number (starts at 1)
         */
        page?: number,
        /**
         * Items per page (max 100)
         */
        perPage?: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tutor/dashboard/{tutor_id}/learners',
            path: {
                'tutor_id': tutorId,
            },
            query: {
                'language': language,
                'level': level,
                'status': status,
                'last_activity': lastActivity,
                'search': search,
                'page': page,
                'per_page': perPage,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Learner Details
     * Get comprehensive learner details (respects consent_given)
     *
     * Security:
     * - Verifies tutor_id matches authenticated tutor
     * - Checks learner is assigned to this tutor
     * - Respects consent_given field
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLearnerDetailsTutorDashboardTutorIdLearnerUserIdDetailsGet({
        tutorId,
        userId,
    }: {
        tutorId: string,
        userId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tutor/dashboard/{tutor_id}/learner/{user_id}/details',
            path: {
                'tutor_id': tutorId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Tutor Analytics
     * Get tutor's personal statistics and analytics
     *
     * Returns overview of all assigned learners' progress
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getTutorAnalyticsTutorDashboardTutorIdAnalyticsGet({
        tutorId,
    }: {
        tutorId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tutor/dashboard/{tutor_id}/analytics',
            path: {
                'tutor_id': tutorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Learner Report
     * Generate PDF report for a learner
     *
     * Request body:
     * {
         * "learner_id": "user_id",
         * "sections": ["profile", "learning_plans", "assessment_results", ...],
         * "date_range": {"start": "2025-01-01", "end": "2025-10-05"}
         * }
         * @returns any Successful Response
         * @throws ApiError
         */
        public static generateLearnerReportTutorDashboardTutorIdReportsGeneratePost({
            tutorId,
            requestBody,
        }: {
            tutorId: string,
            requestBody: Record<string, any>,
        }): CancelablePromise<Record<string, any>> {
            return __request(OpenAPI, {
                method: 'POST',
                url: '/tutor/dashboard/{tutor_id}/reports/generate',
                path: {
                    'tutor_id': tutorId,
                },
                body: requestBody,
                mediaType: 'application/json',
                errors: {
                    422: `Validation Error`,
                },
            });
        }
        /**
         * Download Report
         * Download generated PDF report
         *
         * Returns: PDF file stream (to be implemented)
         * @returns any Successful Response
         * @throws ApiError
         */
        public static downloadReportTutorReportsReportIdDownloadGet({
            reportId,
        }: {
            reportId: string,
        }): CancelablePromise<Record<string, any>> {
            return __request(OpenAPI, {
                method: 'GET',
                url: '/tutor/reports/{report_id}/download',
                path: {
                    'report_id': reportId,
                },
                errors: {
                    422: `Validation Error`,
                },
            });
        }
    }
