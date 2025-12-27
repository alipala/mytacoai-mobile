/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConvertToPaidRequest } from '../models/ConvertToPaidRequest';
import type { ExtendTrialRequest } from '../models/ExtendTrialRequest';
import type { GenerateActivationCodeRequest } from '../models/GenerateActivationCodeRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ActivationCodesService {
    /**
     * Generate Activation Code
     * Generate new activation code for institution
     *
     * - **institution_name**: Name of the institution
     * - **institution_type**: Type of institution
     * - **is_trial**: Whether to start as trial
     * - **trial_duration_days**: Trial duration (7-90 days) if is_trial=True
     * - **target_plan**: Target subscription plan
     * - **max_tutors**: Maximum number of tutors
     * - **max_learners**: Maximum number of learners
     * - **contract_id**: Contract ID (required if is_trial=False)
     * - **notes**: Optional notes
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateActivationCodeApiAdminActivationCodesPost(
        requestBody: GenerateActivationCodeRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/activation_codes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Activation Codes
     * List all activation codes with pagination and filters
     *
     * - **page**: Page number (default: 1)
     * - **per_page**: Items per page (default: 25)
     * - **status_filter**: Filter by status (pending/active_trial/active_paid/expired/cancelled)
     * - **is_trial**: Filter by trial status (true/false)
     * - **institution_name**: Search by institution name
     * @param page
     * @param perPage
     * @param statusFilter
     * @param isTrial
     * @param institutionName
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listActivationCodesApiAdminActivationCodesGet(
        page: number = 1,
        perPage: number = 25,
        statusFilter?: (string | null),
        isTrial?: (boolean | null),
        institutionName?: (string | null),
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/activation_codes',
            query: {
                'page': page,
                'per_page': perPage,
                'status_filter': statusFilter,
                'is_trial': isTrial,
                'institution_name': institutionName,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Activation Code
     * Get single activation code details by activation code or MongoDB ID
     * @param codeOrId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getActivationCodeApiAdminActivationCodesCodeOrIdGet(
        codeOrId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/activation_codes/{code_or_id}',
            path: {
                'code_or_id': codeOrId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Convert To Paid
     * Convert trial activation code to paid
     * Updates the SAME code, does not create a new one
     * @param code
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static convertToPaidApiAdminActivationCodesCodeConvertToPaidPut(
        code: string,
        requestBody: ConvertToPaidRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/activation_codes/{code}/convert-to-paid',
            path: {
                'code': code,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Extend Trial
     * Extend trial period for activation code
     * @param code
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static extendTrialApiAdminActivationCodesCodeExtendTrialPut(
        code: string,
        requestBody: ExtendTrialRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/activation_codes/{code}/extend-trial',
            path: {
                'code': code,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Regenerate Code
     * Generate NEW code (only if original expired and unused)
     * @param code
     * @returns any Successful Response
     * @throws ApiError
     */
    public static regenerateCodeApiAdminActivationCodesCodeRegeneratePost(
        code: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/activation_codes/{code}/regenerate',
            path: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cancel Code
     * Cancel activation code (soft delete, status → cancelled)
     * @param code
     * @returns any Successful Response
     * @throws ApiError
     */
    public static cancelCodeApiAdminActivationCodesCodeDelete(
        code: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/activation_codes/{code}',
            path: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
