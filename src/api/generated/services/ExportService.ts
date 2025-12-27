/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExportService {
    /**
     * Export Learning Plans
     * Export learning plans and assessments
     * @param format
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportLearningPlansApiExportLearningPlansGet(
        format: string = 'json',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/export/learning-plans',
            query: {
                'format': format,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export Conversations
     * Export conversation history and analysis
     * @param format
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportConversationsApiExportConversationsGet(
        format: string = 'json',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/export/conversations',
            query: {
                'format': format,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Export All Data
     * Export all user data
     * @param format
     * @returns any Successful Response
     * @throws ApiError
     */
    public static exportAllDataApiExportDataGet(
        format: string = 'json',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/export/data',
            query: {
                'format': format,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
