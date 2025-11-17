/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpgradeProcessRequest } from '../models/UpgradeProcessRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UpgradeService {
    /**
     * Get Upgrade Options
     * Get personalized upgrade options for the current user
     *
     * Returns:
     * Dictionary with current_plan and upgrade_options
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUpgradeOptionsApiUpgradeOptionsGet(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/upgrade/options',
        });
    }
    /**
     * Process Upgrade
     * Process a subscription upgrade
     *
     * Args:
     * request: UpgradeProcessRequest with price_id and upgrade_type
     *
     * Returns:
     * Dictionary with success status and details
     * @returns any Successful Response
     * @throws ApiError
     */
    public static processUpgradeApiUpgradeProcessPost({
        requestBody,
    }: {
        requestBody: UpgradeProcessRequest,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/upgrade/process',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
