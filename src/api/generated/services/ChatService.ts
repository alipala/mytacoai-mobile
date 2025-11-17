/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectKnowledgeRequest } from '../models/ProjectKnowledgeRequest';
import type { ProjectKnowledgeResponse } from '../models/ProjectKnowledgeResponse';
import type { VectorChatRequest } from '../models/VectorChatRequest';
import type { VectorChatResponse } from '../models/VectorChatResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatService {
    /**
     * Get Project Knowledge
     * Answer questions about the Language Tutor project using RAG
     * @returns ProjectKnowledgeResponse Successful Response
     * @throws ApiError
     */
    public static getProjectKnowledgeApiChatProjectKnowledgePost({
        requestBody,
    }: {
        requestBody: ProjectKnowledgeRequest,
    }): CancelablePromise<ProjectKnowledgeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/chat/project-knowledge',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Vector Knowledge
     * Answer questions using vector similarity search and GPT
     * @returns VectorChatResponse Successful Response
     * @throws ApiError
     */
    public static getVectorKnowledgeApiChatVectorKnowledgePost({
        requestBody,
    }: {
        requestBody: VectorChatRequest,
    }): CancelablePromise<VectorChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/chat/vector-knowledge',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
