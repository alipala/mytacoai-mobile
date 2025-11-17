/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UsageTrackingRequest } from '../models/UsageTrackingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StripeService {
    /**
     * Create Checkout Session
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createCheckoutSessionApiStripeCreateCheckoutSessionPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/create-checkout-session',
        });
    }
    /**
     * Create Customer Portal Session
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createCustomerPortalSessionApiStripeCustomerPortalPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/customer-portal',
        });
    }
    /**
     * Get Subscription Status
     * 🔥 FIXED: Use SubscriptionService for consistent data
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSubscriptionStatusApiStripeSubscriptionStatusGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/subscription-status',
        });
    }
    /**
     * Get Subscription Limits
     * Get user's subscription limits and current usage
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSubscriptionLimitsApiStripeSubscriptionLimitsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/subscription-limits',
        });
    }
    /**
     * Track Usage
     * Track usage of practice sessions or assessments
     * @returns any Successful Response
     * @throws ApiError
     */
    public static trackUsageApiStripeTrackUsagePost({
        requestBody,
    }: {
        requestBody: UsageTrackingRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/track-usage',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Track Speaking Time
     * Track speaking time and optionally increment session count - supports both authenticated and beacon requests
     * @returns any Successful Response
     * @throws ApiError
     */
    public static trackSpeakingTimeApiStripeTrackSpeakingTimePost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/track-speaking-time',
        });
    }
    /**
     * Can Start Session
     * Check if user can start a new session based on minute limits
     * @returns any Successful Response
     * @throws ApiError
     */
    public static canStartSessionApiStripeCanStartSessionGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/can-start-session',
        });
    }
    /**
     * Can Access Feature
     * Check if user can access a specific feature
     * @returns any Successful Response
     * @throws ApiError
     */
    public static canAccessFeatureApiStripeCanAccessFeatureTypeGet({
        featureType,
    }: {
        featureType: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/can-access/{feature_type}',
            path: {
                'feature_type': featureType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Subscription Plans
     * Get all available subscription plans
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSubscriptionPlansApiStripePlansGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/plans',
        });
    }
    /**
     * Get Plan Details
     * Get details for a specific subscription plan
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPlanDetailsApiStripePlanPlanIdGet({
        planId,
    }: {
        planId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/plan/{plan_id}',
            path: {
                'plan_id': planId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Expiry Warning
     * Get expiry warning message if applicable
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getExpiryWarningApiStripeExpiryWarningGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stripe/expiry-warning',
        });
    }
    /**
     * Cancel Subscription
     * Cancel user's active subscription or trial
     * @returns any Successful Response
     * @throws ApiError
     */
    public static cancelSubscriptionApiStripeCancelSubscriptionPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/cancel-subscription',
        });
    }
    /**
     * Reactivate Subscription
     * Reactivate user's canceled subscription
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reactivateSubscriptionApiStripeReactivateSubscriptionPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/reactivate-subscription',
        });
    }
    /**
     * Link Guest Subscription
     * Link a guest subscription to the user account after signup
     * @returns any Successful Response
     * @throws ApiError
     */
    public static linkGuestSubscriptionApiStripeLinkGuestSubscriptionPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/link-guest-subscription',
        });
    }
    /**
     * Stripe Webhook
     * @returns any Successful Response
     * @throws ApiError
     */
    public static stripeWebhookApiStripeWebhookPost({
        stripeSignature,
    }: {
        stripeSignature?: (string | null),
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stripe/webhook',
            headers: {
                'stripe-signature': stripeSignature,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
