/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConsentGrantRequest } from '../models/ConsentGrantRequest';
import type { ConsentRevokeRequest } from '../models/ConsentRevokeRequest';
import type { ConsentStatusResponse } from '../models/ConsentStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConsentService {
    /**
     * Grant Consent
     * Grant consent for data sharing with institution
     * @returns any Successful Response
     * @throws ApiError
     */
    public static grantConsentConsentGrantPost({
        requestBody,
    }: {
        requestBody: ConsentGrantRequest,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/consent/grant',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Revoke Consent
     * Revoke consent for data sharing
     * @returns any Successful Response
     * @throws ApiError
     */
    public static revokeConsentConsentRevokePost({
        requestBody,
    }: {
        requestBody: ConsentRevokeRequest,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/consent/revoke',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Consent Status
     * Get consent status for a learner
     * @returns ConsentStatusResponse Successful Response
     * @throws ApiError
     */
    public static getConsentStatusConsentStatusLearnerIdInstitutionIdGet({
        learnerId,
        institutionId,
    }: {
        learnerId: string,
        institutionId: string,
    }): CancelablePromise<ConsentStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/consent/status/{learner_id}/{institution_id}',
            path: {
                'learner_id': learnerId,
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
