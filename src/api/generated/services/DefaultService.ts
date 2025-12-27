/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementUnlockRequest } from '../models/AchievementUnlockRequest';
import type { BackgroundAnalysisRequest } from '../models/BackgroundAnalysisRequest';
import type { BackgroundAnalysisResponse } from '../models/BackgroundAnalysisResponse';
import type { CreateNextLevelPlanRequest } from '../models/CreateNextLevelPlanRequest';
import type { CustomTopicRequest } from '../models/CustomTopicRequest';
import type { FinalAssessmentRequirementsResponse } from '../models/FinalAssessmentRequirementsResponse';
import type { FinalAssessmentResultResponse } from '../models/FinalAssessmentResultResponse';
import type { FinalAssessmentStatusResponse } from '../models/FinalAssessmentStatusResponse';
import type { FinalAssessmentSubmitRequest } from '../models/FinalAssessmentSubmitRequest';
import type { GuestSessionAnalysisRequest } from '../models/GuestSessionAnalysisRequest';
import type { NextLevelPlanSuggestionResponse } from '../models/NextLevelPlanSuggestionResponse';
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
import type { UserAchievementsResponse } from '../models/UserAchievementsResponse';
import type { VoiceSampleRequest } from '../models/VoiceSampleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Websocket Status
     * Get WebSocket connection status (for debugging)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static websocketStatusApiWsStatusGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ws/status',
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
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateVoiceSampleApiVoiceSamplePost(
        requestBody: VoiceSampleRequest,
    ): CancelablePromise<any> {
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
     * Unlock Achievement
     * Unlock an achievement for the current user.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unlockAchievementApiAchievementsUnlockPost(
        requestBody: AchievementUnlockRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/achievements/unlock',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Achievements
     * Get all achievements unlocked by the current user.
     * @returns UserAchievementsResponse Successful Response
     * @throws ApiError
     */
    public static getUserAchievementsApiAchievementsGet(): CancelablePromise<UserAchievementsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/achievements',
        });
    }
    /**
     * Complete Challenge Session
     * Complete a challenge session and unlock achievements.
     * Called when user finishes a gamified challenge session.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static completeChallengeSessionApiAchievementsSessionsCompletePost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/achievements/sessions/complete',
        });
    }
    /**
     * Get Available Achievements
     * Get list of all available achievements (public endpoint).
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAvailableAchievementsApiAchievementsAvailableGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/achievements/available',
        });
    }
    /**
     * Test Endpoint
     * Simple test endpoint to verify API is running
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
     * Supports both /health and /api/health for compatibility
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
     * Supports both /health and /api/health for compatibility
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
     * Generate Mock Token
     * Mock endpoint for testing when OpenAI API is not available.
     * Returns a mock ephemeral token response that matches OpenAI's format.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateMockTokenApiMockTokenPost(
        requestBody: TutorSessionRequest,
    ): CancelablePromise<any> {
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
    /**
     * Shorten Openai Image
     * Download OpenAI image and return short URL
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static shortenOpenaiImageApiShortenImagePost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
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
     * @param imageId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static serveImageApiImgImageIdGet(
        imageId: string,
    ): CancelablePromise<any> {
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
     * Generate Token
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateTokenApiRealtimeTokenPost(
        requestBody: TutorSessionRequest,
    ): CancelablePromise<any> {
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
     * Log Realtime Usage
     * Store realtime API usage data and calculate costs.
     *
     * PERFORMANCE OPTIMIZATION: Returns immediately while processing happens in background.
     * Response time reduced from 3,041ms to <100ms (97% faster).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static logRealtimeUsageApiRealtimeUsageLogPost(
        requestBody: RealtimeUsageData,
    ): CancelablePromise<any> {
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
     * Summarize Conversation
     * Summarize conversation transcript using gpt-4o-mini for cost efficiency.
     * Used to reduce cached token usage in OpenAI Realtime API.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static summarizeConversationApiSummarizePost(
        requestBody: SummarizeRequest,
    ): CancelablePromise<any> {
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
     * Research Custom Topic
     * Research a custom topic using OpenAI's web search capabilities with gpt-4o-search-preview
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static researchCustomTopicApiCustomTopicResearchPost(
        requestBody: CustomTopicRequest,
    ): CancelablePromise<any> {
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
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static subscribeToNewsletterApiSubscribePost(
        requestBody: SubscriptionRequest,
    ): CancelablePromise<any> {
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
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static submitSentenceAnalysisFeedbackApiFeedbackSentenceAnalysisPost(
        requestBody: SentenceAnalysisFeedback,
    ): CancelablePromise<any> {
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
     * Assess Sentence Construction
     * @param requestBody
     * @returns SentenceAssessmentResponse Successful Response
     * @throws ApiError
     */
    public static assessSentenceConstructionApiSentenceAssessPost(
        requestBody: SentenceAssessmentRequest,
    ): CancelablePromise<SentenceAssessmentResponse> {
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
     * @param requestBody
     * @returns SpeakingAssessmentResponse Successful Response
     * @throws ApiError
     */
    public static assessSpeakingApiSpeakingAssessPost(
        requestBody: SpeakingAssessmentRequest,
    ): CancelablePromise<SpeakingAssessmentResponse> {
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
     * @param language
     * @param level
     * @param count
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSpeakingPromptsApiSpeakingPromptsGet(
        language: string,
        level: string,
        count: number = 3,
    ): CancelablePromise<any> {
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
     * @param requestBody
     * @returns SentenceEvaluationResponse Successful Response
     * @throws ApiError
     */
    public static evaluateSentenceForAnalysisApiSentenceEvaluatePost(
        requestBody: SentenceEvaluationRequest,
    ): CancelablePromise<SentenceEvaluationResponse> {
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
     * @param requestBody
     * @returns BackgroundAnalysisResponse Successful Response
     * @throws ApiError
     */
    public static performBackgroundSentenceAnalysisApiSentenceBackgroundAnalyzePost(
        requestBody: BackgroundAnalysisRequest,
    ): CancelablePromise<BackgroundAnalysisResponse> {
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
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static processSentenceBackgroundApiSentenceProcessBackgroundPost(
        requestBody: BackgroundAnalysisRequest,
    ): CancelablePromise<any> {
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
     * Analyze Guest Session
     * Analyze a guest user's practice session WITHOUT saving to database.
     * Returns sentence analyses, summary, stats, and insights for mobile app display.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static analyzeGuestSessionApiGuestAnalyzeSessionPost(
        requestBody: GuestSessionAnalysisRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/guest/analyze-session',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Guest Quick Stats
     * Quick endpoint to get just stats without full analysis.
     * Useful for showing immediate feedback during/after session.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getGuestQuickStatsApiGuestQuickStatsPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/guest/quick-stats',
        });
    }
    /**
     * Get Final Assessment Status
     * Check if user needs to take final assessment for their learning plan.
     *
     * Returns assessment status, last attempt info, and whether user can retry.
     * @param planId
     * @returns FinalAssessmentStatusResponse Successful Response
     * @throws ApiError
     */
    public static getFinalAssessmentStatusApiLearningPlansPlanIdFinalAssessmentStatusGet(
        planId: string,
    ): CancelablePromise<FinalAssessmentStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning-plans/{plan_id}/final-assessment-status',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Final Assessment Requirements
     * Get the assessment requirements for a learning plan.
     *
     * Returns duration, focus areas, and instructions based on current level and plan goals.
     * @param planId
     * @returns FinalAssessmentRequirementsResponse Successful Response
     * @throws ApiError
     */
    public static getFinalAssessmentRequirementsApiLearningPlansPlanIdFinalAssessmentRequirementsGet(
        planId: string,
    ): CancelablePromise<FinalAssessmentRequirementsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning-plans/{plan_id}/final-assessment-requirements',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit Final Assessment
     * Submit and evaluate final assessment for a learning plan.
     *
     * IMPORTANT: Final assessments DO NOT count toward subscription limits.
     *
     * Evaluates with dual criteria:
     * 1. Current level mastery (must >= 75)
     * 2. Next level readiness (must >= 70)
     *
     * Both must pass for user to advance to next level.
     * @param planId
     * @param requestBody
     * @returns FinalAssessmentResultResponse Successful Response
     * @throws ApiError
     */
    public static submitFinalAssessmentApiLearningPlansPlanIdFinalAssessmentPost(
        planId: string,
        requestBody: FinalAssessmentSubmitRequest,
    ): CancelablePromise<FinalAssessmentResultResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/learning-plans/{plan_id}/final-assessment',
            path: {
                'plan_id': planId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Next Level Plan Suggestion
     * Get auto-generated suggestion for next level learning plan.
     *
     * This is called after user passes final assessment.
     * User can review and customize before confirming.
     * @param planId
     * @returns NextLevelPlanSuggestionResponse Successful Response
     * @throws ApiError
     */
    public static getNextLevelPlanSuggestionApiLearningPlansPlanIdNextLevelSuggestionGet(
        planId: string,
    ): CancelablePromise<NextLevelPlanSuggestionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/learning-plans/{plan_id}/next-level-suggestion',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Next Level Plan
     * Create next level learning plan after passing final assessment.
     *
     * User can customize duration, goals before creating.
     * This uses the existing learning plan creation logic.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createNextLevelPlanApiLearningPlansCreateNextLevelPost(
        requestBody: CreateNextLevelPlanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/learning-plans/create-next-level',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
