/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackgroundAnalysisRequest } from '../models/BackgroundAnalysisRequest';
import type { BackgroundAnalysisResponse } from '../models/BackgroundAnalysisResponse';
import type { CustomTopicRequest } from '../models/CustomTopicRequest';
import type { RealtimeUsageData } from '../models/RealtimeUsageData';
import type { SentenceAnalysisFeedback } from '../models/SentenceAnalysisFeedback';
import type { SentenceAssessmentRequest } from '../models/SentenceAssessmentRequest';
import type { SentenceAssessmentResponse } from '../models/SentenceAssessmentResponse';
import type { SentenceEvaluationRequest } from '../models/SentenceEvaluationRequest';
import type { SentenceEvaluationResponse } from '../models/SentenceEvaluationResponse';
import type { SpeakingAssessmentRequest } from '../models/SpeakingAssessmentRequest';
import type { SpeakingAssessmentResponse } from '../models/SpeakingAssessmentResponse';
import type { SubscriptionRequest } from '../models/SubscriptionRequest';
import type { SummarizeRequest } from '../models/SummarizeRequest';
import type { TutorSessionRequest } from '../models/TutorSessionRequest';
import type { VoiceSampleRequest } from '../models/VoiceSampleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Store Session Summary
     * Store comprehensive conversation analysis summary for a learning plan session
     * @returns any Successful Response
     * @throws ApiError
     */
    public static storeSessionSummaryApiLearningSessionSummaryPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/learning/session-summary',
        });
    }
    /**
     * Get Low Minutes Status
     * 🚀 OPTIMIZED: API endpoint to check if current user has low remaining minutes with server-side caching
     * Returns status and appropriate warning message
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLowMinutesStatusApiSubscriptionLowMinutesCheckGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/subscription/low-minutes-check',
        });
    }
    /**
     * Check Can Start Session
     * Check if user can start a new session based on remaining minutes
     * @returns any Successful Response
     * @throws ApiError
     */
    public static checkCanStartSessionApiSubscriptionCanStartSessionGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/subscription/can-start-session',
        });
    }
    /**
     * Health Ping
     * Ultra-lightweight health check endpoint
     * Returns minimal response for connectivity verification
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthPingApiHealthPingGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health/ping',
        });
    }
    /**
     * Health Ping
     * Ultra-lightweight health check endpoint
     * Returns minimal response for connectivity verification
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthPingApiHealthPingHead(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/api/health/ping',
        });
    }
    /**
     * Health Status
     * Detailed health status for debugging
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthStatusApiHealthStatusGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health/status',
        });
    }
    /**
     * Generate Voice Sample
     * Generate a voice sample using OpenAI's realtime API
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateVoiceSampleApiVoiceSamplePost({
        requestBody,
    }: {
        requestBody: VoiceSampleRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/voice/sample',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Voice Characters
     * Get all available voice characters with their descriptions
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getVoiceCharactersApiVoiceCharactersGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/voice/characters',
        });
    }
    /**
     * Shorten Openai Image
     * Download OpenAI image and return short URL
     * @returns any Successful Response
     * @throws ApiError
     */
    public static shortenOpenaiImageApiShortenImagePost({
        requestBody,
    }: {
        requestBody: Record<string, any>,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/shorten-image',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Serve Image
     * Serve shortened image
     * @returns any Successful Response
     * @throws ApiError
     */
    public static serveImageApiImgImageIdGet({
        imageId,
    }: {
        imageId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/img/{image_id}',
            path: {
                'image_id': imageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Cleanup Old Images
     * Remove images older than 24 hours
     * @returns any Successful Response
     * @throws ApiError
     */
    public static cleanupOldImagesApiCleanupImagesPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/cleanup-images',
        });
    }
    /**
     * Test Endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static testEndpointApiTestGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/test',
        });
    }
    /**
     * Health Check
     * Minimal health check - only returns status and environment (no logging)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthCheckApiHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
    /**
     * Health Check
     * Minimal health check - only returns status and environment (no logging)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthCheckHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Generate Token
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateTokenApiRealtimeTokenPost({
        requestBody,
    }: {
        requestBody: TutorSessionRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/realtime/token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Summarize Conversation
     * Summarize conversation transcript using gpt-4o-mini for cost efficiency.
     * Used to reduce cached token usage in OpenAI Realtime API.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static summarizeConversationApiSummarizePost({
        requestBody,
    }: {
        requestBody: SummarizeRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/summarize',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Log Realtime Usage
     * Store realtime API usage data and calculate costs.
     *
     * 🚀 PERFORMANCE OPTIMIZATION: Returns immediately while processing happens in background.
     * Response time reduced from 3,041ms to <100ms (97% faster).
     * @returns any Successful Response
     * @throws ApiError
     */
    public static logRealtimeUsageApiRealtimeUsageLogPost({
        requestBody,
    }: {
        requestBody: RealtimeUsageData,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/realtime/usage-log',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Research Custom Topic
     * Research a custom topic using OpenAI's web search capabilities with gpt-4o-search-preview
     * @returns any Successful Response
     * @throws ApiError
     */
    public static researchCustomTopicApiCustomTopicResearchPost({
        requestBody,
    }: {
        requestBody: CustomTopicRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/custom-topic/research',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Subscribe To Newsletter
     * Subscribe user to newsletter - stores email in MongoDB
     * @returns any Successful Response
     * @throws ApiError
     */
    public static subscribeToNewsletterApiSubscribePost({
        requestBody,
    }: {
        requestBody: SubscriptionRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/subscribe',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit Sentence Analysis Feedback
     * Store user feedback about sentence analysis decisions
     * @returns any Successful Response
     * @throws ApiError
     */
    public static submitSentenceAnalysisFeedbackApiFeedbackSentenceAnalysisPost({
        requestBody,
    }: {
        requestBody: SentenceAnalysisFeedback,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/feedback/sentence-analysis',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Semantic Feedback Monitoring
     * Monitor semantic VAD feedback incidents and conversation quality metrics
     * Provides debugging information for semantic VAD issues
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSemanticFeedbackMonitoringApiRealtimeSemanticFeedbackGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/realtime/semantic-feedback',
        });
    }
    /**
     * Assess Sentence Construction
     * @returns SentenceAssessmentResponse Successful Response
     * @throws ApiError
     */
    public static assessSentenceConstructionApiSentenceAssessPost({
        requestBody,
    }: {
        requestBody: SentenceAssessmentRequest,
    }): CancelablePromise<SentenceAssessmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sentence/assess',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assess Speaking
     * @returns SpeakingAssessmentResponse Successful Response
     * @throws ApiError
     */
    public static assessSpeakingApiSpeakingAssessPost({
        requestBody,
    }: {
        requestBody: SpeakingAssessmentRequest,
    }): CancelablePromise<SpeakingAssessmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/speaking/assess',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Speaking Prompts
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSpeakingPromptsApiSpeakingPromptsGet({
        language,
        level,
        count = 3,
    }: {
        language: string,
        level: string,
        count?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/speaking/prompts',
            query: {
                'language': language,
                'level': level,
                'count': count,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Evaluate Sentence For Analysis
     * Evaluate whether a sentence is substantial enough for analysis.
     * This endpoint is used by the frontend to determine if background analysis should be triggered.
     * @returns SentenceEvaluationResponse Successful Response
     * @throws ApiError
     */
    public static evaluateSentenceForAnalysisApiSentenceEvaluatePost({
        requestBody,
    }: {
        requestBody: SentenceEvaluationRequest,
    }): CancelablePromise<SentenceEvaluationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sentence/evaluate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Perform Background Sentence Analysis
     * Perform background sentence analysis without interrupting the conversation.
     * This endpoint analyzes the sentence and returns detailed assessment results.
     * @returns BackgroundAnalysisResponse Successful Response
     * @throws ApiError
     */
    public static performBackgroundSentenceAnalysisApiSentenceBackgroundAnalyzePost({
        requestBody,
    }: {
        requestBody: BackgroundAnalysisRequest,
    }): CancelablePromise<BackgroundAnalysisResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sentence/background-analyze',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Process Sentence Background
     * Complete background sentence processing pipeline.
     * Evaluates if sentence should be analyzed, and if so, performs the analysis.
     * Returns None if sentence doesn't warrant analysis, otherwise returns analysis results.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static processSentenceBackgroundApiSentenceProcessBackgroundPost({
        requestBody,
    }: {
        requestBody: BackgroundAnalysisRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sentence/process-background',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Transcription Status
     * Monitor transcription model configuration and usage
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getTranscriptionStatusApiTranscriptionStatusGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transcription/status',
        });
    }
    /**
     * Get Model Config
     * Get the current OpenAI Realtime API model configuration
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getModelConfigApiRealtimeModelConfigGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/realtime/model-config',
        });
    }
    /**
     * Generate Mock Token
     * Mock endpoint for testing when OpenAI API is not available
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateMockTokenApiMockTokenPost({
        requestBody,
    }: {
        requestBody: TutorSessionRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mock-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
