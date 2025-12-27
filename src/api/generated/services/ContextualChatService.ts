/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContextualChatRequest } from '../models/ContextualChatRequest';
import type { ContextualChatResponse } from '../models/ContextualChatResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContextualChatService {
    /**
     * Get Contextual Knowledge
     * Answer questions using vector similarity search and GPT with user context awareness
     * @param requestBody
     * @param token
     * @returns ContextualChatResponse Successful Response
     * @throws ApiError
     */
    public static getContextualKnowledgeApiChatContextualKnowledgePost(
        requestBody: ContextualChatRequest,
        token?: (string | null),
    ): CancelablePromise<ContextualChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/chat/contextual-knowledge',
            query: {
                'token': token,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
