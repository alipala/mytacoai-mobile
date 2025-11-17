/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DownloadImageRequest } from '../models/DownloadImageRequest';
import type { ShareProgressRequest } from '../models/ShareProgressRequest';
import type { ShareProgressResponse } from '../models/ShareProgressResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShareService {
    /**
     * Generate Progress Image
     * Generate a shareable progress image using OpenAI DALL-E 3
     * @returns ShareProgressResponse Successful Response
     * @throws ApiError
     */
    public static generateProgressImageApiShareGenerateProgressImagePost({
        requestBody,
    }: {
        requestBody: ShareProgressRequest,
    }): CancelablePromise<ShareProgressResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/share/generate-progress-image',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Proxy Image
     * Proxy route to download images from external URLs (like OpenAI)
     * This avoids CORS issues and authentication problems
     * @returns any Successful Response
     * @throws ApiError
     */
    public static proxyImageApiShareProxyImageImageUrlGet({
        imageUrl,
    }: {
        imageUrl: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/share/proxy-image/{image_url}',
            path: {
                'image_url': imageUrl,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Download Image
     * Download image from OpenAI URL to avoid CORS issues
     * DEPRECATED: Use proxy-image route instead
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadImageApiShareDownloadImagePost({
        requestBody,
    }: {
        requestBody: DownloadImageRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/share/download-image',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Weeks
     * Get user's completed weeks for sharing
     * - If learning_plan_id is provided: return weeks for THAT specific plan only
     * - If no learning_plan_id: return aggregated weeks across ALL plans (global achievements)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUserWeeksApiShareUserWeeksGet({
        learningPlanId,
    }: {
        learningPlanId?: (string | null),
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/share/user-weeks',
            query: {
                'learning_plan_id': learningPlanId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Shorten Url
     * Create a shortened URL for sharing (simple implementation)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static shortenUrlApiShareShortenUrlPost({
        requestBody,
    }: {
        requestBody: Record<string, any>,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/share/shorten-url',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Sharing Stats
     * Get user's sharing statistics
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSharingStatsApiShareSharingStatsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/share/sharing-stats',
        });
    }
}
