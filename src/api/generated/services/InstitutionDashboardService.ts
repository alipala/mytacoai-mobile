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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLanguageDistributionInstitutionDashboardInstitutionIdAnalyticsLanguageDistributionGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLevelDistributionInstitutionDashboardInstitutionIdAnalyticsLevelDistributionGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getTutorsInstitutionDashboardInstitutionIdTutorsGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addTutorInstitutionDashboardInstitutionIdTutorsPost({
        institutionId,
        requestBody,
    }: {
        institutionId: string,
        requestBody: Record<string, any>,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeTutorInstitutionDashboardInstitutionIdTutorsTutorIdDelete({
        institutionId,
        tutorId,
    }: {
        institutionId: string,
        tutorId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deactivateTutorInstitutionDashboardInstitutionIdTutorsDeactivateTutorIdPost({
        institutionId,
        tutorId,
    }: {
        institutionId: string,
        tutorId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reactivateTutorInstitutionDashboardInstitutionIdTutorsReactivateTutorIdPost({
        institutionId,
        tutorId,
    }: {
        institutionId: string,
        tutorId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateTutorPermissionsInstitutionDashboardInstitutionIdTutorsTutorIdPermissionsPut({
        institutionId,
        tutorId,
        requestBody,
    }: {
        institutionId: string,
        tutorId: string,
        requestBody: Record<string, any>,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLearnersInstitutionDashboardInstitutionIdLearnersGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static assignLearnerToTutorInstitutionDashboardInstitutionIdLearnersAssignTutorPost({
        institutionId,
        requestBody,
    }: {
        institutionId: string,
        requestBody: Record<string, any>,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deactivateLearnerInstitutionDashboardInstitutionIdLearnersDeactivateLearnerIdPost({
        institutionId,
        learnerId,
    }: {
        institutionId: string,
        learnerId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reactivateLearnerInstitutionDashboardInstitutionIdLearnersReactivateLearnerIdPost({
        institutionId,
        learnerId,
    }: {
        institutionId: string,
        learnerId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static bulkImportLearnersInstitutionDashboardInstitutionIdLearnersBulkImportPost({
        institutionId,
        formData,
    }: {
        institutionId: string,
        formData: Body_bulk_import_learners_institution_dashboard__institution_id__learners_bulk_import_post,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getComprehensiveLearnerDetailsInstitutionDashboardInstitutionIdLearnersUserIdComprehensiveDetailsGet({
        institutionId,
        userId,
    }: {
        institutionId: string,
        userId: string,
    }): CancelablePromise<Record<string, any>> {
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportLearnersInstitutionDashboardInstitutionIdLearnersExportGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
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
