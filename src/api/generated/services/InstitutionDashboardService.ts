/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_bulk_import_learners_institution_dashboard__institution_id__learners_bulk_import_post } from '../models/Body_bulk_import_learners_institution_dashboard__institution_id__learners_bulk_import_post';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InstitutionDashboardService {
    /**
     * Get Language Distribution
     * Get language distribution of learners in the institution
     * @param institutionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLanguageDistributionInstitutionDashboardInstitutionIdAnalyticsLanguageDistributionGet(
        institutionId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/dashboard/{institution_id}/analytics/language-distribution',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Level Distribution
     * Get proficiency level distribution of learners
     * @param institutionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLevelDistributionInstitutionDashboardInstitutionIdAnalyticsLevelDistributionGet(
        institutionId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/dashboard/{institution_id}/analytics/level-distribution',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Tutors
     * Get all tutors for an institution with their assigned learners (including inactive)
     * OPTIMIZED: Uses aggregation pipeline to avoid N+1 queries
     * @param institutionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getTutorsInstitutionDashboardInstitutionIdTutorsGet(
        institutionId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/dashboard/{institution_id}/tutors',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Tutor
     * Add a new tutor to the institution
     * NEW: Now includes password field for tutor login
     * @param institutionId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addTutorInstitutionDashboardInstitutionIdTutorsPost(
        institutionId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/tutors',
            path: {
                'institution_id': institutionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Tutor
     * Remove/deactivate a tutor (DEPRECATED - use deactivate_tutor instead)
     * @param institutionId
     * @param tutorId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeTutorInstitutionDashboardInstitutionIdTutorsTutorIdDelete(
        institutionId: string,
        tutorId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/institution/dashboard/{institution_id}/tutors/{tutor_id}',
            path: {
                'institution_id': institutionId,
                'tutor_id': tutorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Deactivate Tutor
     * Deactivate a tutor and unassign all their learners
     * This is a reversible operation that:
     * 1. Marks the tutor as inactive (preserves account data)
     * 2. Unassigns all learners from this tutor (they become "Unassigned")
     * 3. Allows future reactivation
     * @param institutionId
     * @param tutorId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deactivateTutorInstitutionDashboardInstitutionIdTutorsDeactivateTutorIdPost(
        institutionId: string,
        tutorId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/tutors/deactivate/{tutor_id}',
            path: {
                'institution_id': institutionId,
                'tutor_id': tutorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reactivate Tutor
     * Reactivate a previously deactivated tutor
     * @param institutionId
     * @param tutorId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reactivateTutorInstitutionDashboardInstitutionIdTutorsReactivateTutorIdPost(
        institutionId: string,
        tutorId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/tutors/reactivate/{tutor_id}',
            path: {
                'institution_id': institutionId,
                'tutor_id': tutorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Tutor Permissions
     * Update tutor permissions
     * @param institutionId
     * @param tutorId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateTutorPermissionsInstitutionDashboardInstitutionIdTutorsTutorIdPermissionsPut(
        institutionId: string,
        tutorId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/institution/dashboard/{institution_id}/tutors/{tutor_id}/permissions',
            path: {
                'institution_id': institutionId,
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
     * Get Learners
     * Get all learners for an institution with progress data (including deactivated)
     * OPTIMIZED: Uses aggregation pipeline to avoid N+1 queries
     * @param institutionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLearnersInstitutionDashboardInstitutionIdLearnersGet(
        institutionId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/dashboard/{institution_id}/learners',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assign Learner To Tutor
     * Assign a learner to a specific tutor
     * @param institutionId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static assignLearnerToTutorInstitutionDashboardInstitutionIdLearnersAssignTutorPost(
        institutionId: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/learners/assign-tutor',
            path: {
                'institution_id': institutionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Deactivate Learner
     * Deactivate/archive a learner (reversible operation)
     * @param institutionId
     * @param learnerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deactivateLearnerInstitutionDashboardInstitutionIdLearnersDeactivateLearnerIdPost(
        institutionId: string,
        learnerId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/learners/deactivate/{learner_id}',
            path: {
                'institution_id': institutionId,
                'learner_id': learnerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reactivate Learner
     * Reactivate a previously deactivated learner
     * @param institutionId
     * @param learnerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reactivateLearnerInstitutionDashboardInstitutionIdLearnersReactivateLearnerIdPost(
        institutionId: string,
        learnerId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/learners/reactivate/{learner_id}',
            path: {
                'institution_id': institutionId,
                'learner_id': learnerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Bulk Import Learners
     * Bulk import learners from CSV file
     * Expected CSV format: name, email, language, level, tutor_email
     * @param institutionId
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static bulkImportLearnersInstitutionDashboardInstitutionIdLearnersBulkImportPost(
        institutionId: string,
        formData: Body_bulk_import_learners_institution_dashboard__institution_id__learners_bulk_import_post,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/dashboard/{institution_id}/learners/bulk-import',
            path: {
                'institution_id': institutionId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Comprehensive Learner Details
     * Get comprehensive learner analytics with AI-generated insights
     * Includes ALL learning plans, sessions, assessments, and recommendations
     * @param institutionId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getComprehensiveLearnerDetailsInstitutionDashboardInstitutionIdLearnersUserIdComprehensiveDetailsGet(
        institutionId: string,
        userId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/dashboard/{institution_id}/learners/{user_id}/comprehensive-details',
            path: {
                'institution_id': institutionId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Learners
     * Export learner data as CSV format data
     * @param institutionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportLearnersInstitutionDashboardInstitutionIdLearnersExportGet(
        institutionId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/dashboard/{institution_id}/learners/export',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
