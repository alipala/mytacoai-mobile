/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConversationHelpRequest } from '../models/ConversationHelpRequest';
import type { ConversationHelpResponse } from '../models/ConversationHelpResponse';
import type { UserHelpSettings } from '../models/UserHelpSettings';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConversationHelpService {
    /**
     * Generate Help Content
     * Generate conversation help content based on AI tutor's response
     * @param requestBody
     * @returns ConversationHelpResponse Successful Response
     * @throws ApiError
     */
    public static generateHelpContentApiConversationHelpGeneratePost(
        requestBody: ConversationHelpRequest,
    ): CancelablePromise<ConversationHelpResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/conversation-help/generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Help Settings
     * Get user's conversation help settings
     * @returns UserHelpSettings Successful Response
     * @throws ApiError
     */
    public static getHelpSettingsApiConversationHelpSettingsGet(): CancelablePromise<UserHelpSettings> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/conversation-help/settings',
        });
    }
    /**
     * Update Help Settings
     * Update user's conversation help settings
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateHelpSettingsApiConversationHelpSettingsPut(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/conversation-help/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Track Help System Usage
     * Track help system usage for analytics
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static trackHelpSystemUsageApiConversationHelpTrackUsagePost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/conversation-help/track-usage',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Complete Conversation Session
     * CRITICAL FIX: Track session completion with proper duration and subscription usage
     * This endpoint should be called when a conversation session ends
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static completeConversationSessionApiConversationHelpCompleteSessionPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/conversation-help/complete-session',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Help Analytics
     * Get help system usage analytics for the current user
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHelpAnalyticsApiConversationHelpAnalyticsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/conversation-help/analytics',
        });
    }
    /**
     * Get Supported Help Languages
     * Get list of supported languages for help content
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSupportedHelpLanguagesApiConversationHelpLanguagesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/conversation-help/languages',
        });
    }
}
