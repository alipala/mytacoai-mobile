/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InstitutionLoginRequest } from '../models/InstitutionLoginRequest';
import type { InstitutionLoginResponse } from '../models/InstitutionLoginResponse';
import type { InstitutionSignupRequest } from '../models/InstitutionSignupRequest';
import type { InstitutionSignupResponse } from '../models/InstitutionSignupResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InstitutionService {
    /**
     * Signup Institution
     * Register a new institution and admin account
     * @returns InstitutionSignupResponse Successful Response
     * @throws ApiError
     */
    public static signupInstitutionInstitutionSignupPost({
        requestBody,
    }: {
        requestBody: InstitutionSignupRequest,
    }): CancelablePromise<InstitutionSignupResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login Institution
     * Authenticate institution admin
     * @returns InstitutionLoginResponse Successful Response
     * @throws ApiError
     */
    public static loginInstitutionInstitutionLoginPost({
        requestBody,
    }: {
        requestBody: InstitutionLoginRequest,
    }): CancelablePromise<InstitutionLoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institution/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Institution
     * Get institution details
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getInstitutionInstitutionInstitutionIdGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/{institution_id}',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Institution Stats
     * Get institution statistics
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getInstitutionStatsInstitutionStatsInstitutionIdGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institution/stats/{institution_id}',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
