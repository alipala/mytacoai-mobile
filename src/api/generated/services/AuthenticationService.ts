/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppleLoginRequest } from '../models/AppleLoginRequest';
import type { Body_login_for_access_token_api_auth_token_post } from '../models/Body_login_for_access_token_api_auth_token_post';
import type { EmailCheckRequest } from '../models/EmailCheckRequest';
import type { EmailVerificationConfirm } from '../models/EmailVerificationConfirm';
import type { GoogleLoginRequest } from '../models/GoogleLoginRequest';
import type { LoginRequest } from '../models/LoginRequest';
import type { PasswordResetConfirm } from '../models/PasswordResetConfirm';
import type { PasswordResetRequest } from '../models/PasswordResetRequest';
import type { PasswordUpdateRequest } from '../models/PasswordUpdateRequest';
import type { ResendVerificationRequest } from '../models/ResendVerificationRequest';
import type { Token } from '../models/Token';
import type { UserCreate } from '../models/UserCreate';
import type { UserResponse } from '../models/UserResponse';
import type { UserUpdate } from '../models/UserUpdate';
import type { VoiceSelectionRequest } from '../models/VoiceSelectionRequest';
import type { VoiceSelectionResponse } from '../models/VoiceSelectionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Check User Type
     * Check if an email belongs to a tutor or institution admin
     * Returns the user type and appropriate login URL
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static checkUserTypeApiAuthCheckUserTypePost(
        requestBody: EmailCheckRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/check-user-type',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Register
     * Register a new user with email and password
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static registerApiAuthRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * Login with email and password
     * @param requestBody
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginApiAuthLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login For Access Token
     * OAuth2 compatible token login, get an access token for future requests
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginForAccessTokenApiAuthTokenPost(
        formData: Body_login_for_access_token_api_auth_token_post,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Google Login
     * Login with Google OAuth token
     * @param requestBody
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static googleLoginApiAuthGoogleLoginPost(
        requestBody: GoogleLoginRequest,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/google-login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Apple Login
     * Login with Apple Sign-In token
     * Handles new user creation, existing user login, and account linking
     * @param requestBody
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static appleLoginApiAuthAppleLoginPost(
        requestBody: AppleLoginRequest,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/apple-login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Google Callback
     * Handle Google OAuth callback
     * @param code
     * @param error
     * @param state
     * @returns any Successful Response
     * @throws ApiError
     */
    public static googleCallbackApiAuthGoogleCallbackGet(
        code?: string,
        error?: string,
        state?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/google-callback',
            query: {
                'code': code,
                'error': error,
                'state': state,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Forgot Password
     * Request a password reset token
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static forgotPasswordApiAuthForgotPasswordPost(
        requestBody: PasswordResetRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Confirm Reset Password
     * Reset password using token
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static confirmResetPasswordApiAuthResetPasswordPost(
        requestBody: PasswordResetConfirm,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Logout
     * Logout and invalidate the current session
     * @returns void
     * @throws ApiError
     */
    public static logoutApiAuthLogoutPost(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
        });
    }
    /**
     * Get User Me
     * Get current user information
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getUserMeApiAuthMeGet(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
        });
    }
    /**
     * Register Push Token
     * Register or update user's Expo push notification token
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static registerPushTokenApiAuthPushTokenPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/push-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Profile
     * Update user profile information
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateProfileApiAuthUpdateProfilePut(
        requestBody: UserUpdate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/auth/update-profile',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Password
     * Update user password
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static updatePasswordApiAuthUpdatePasswordPost(
        requestBody: PasswordUpdateRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/update-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Deactivate Account
     * Deactivate user account by setting is_active to false
     * @returns void
     * @throws ApiError
     */
    public static deactivateAccountApiAuthDeactivateAccountPost(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/deactivate-account',
        });
    }
    /**
     * Verify Email Get Redirect
     * Handle GET requests from email links - directly verify and show success page
     * @param token
     * @returns any Successful Response
     * @throws ApiError
     */
    public static verifyEmailGetRedirectApiAuthVerifyEmailGet(
        token: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/verify-email',
            query: {
                'token': token,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Verify Email
     * Verify email address using verification token
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static verifyEmailApiAuthVerifyEmailPost(
        requestBody: EmailVerificationConfirm,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/verify-email',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resend Verification
     * Resend verification email to user
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resendVerificationApiAuthResendVerificationPost(
        requestBody: ResendVerificationRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/resend-verification',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mark Existing Verified
     * Mark all existing users as verified (migration endpoint)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static markExistingVerifiedApiAuthMarkExistingUsersVerifiedPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/mark-existing-users-verified',
        });
    }
    /**
     * Get Verification Status
     * Get verification status for an email (for debugging)
     * @param email
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getVerificationStatusApiAuthVerificationStatusEmailGet(
        email: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/verification-status/{email}',
            path: {
                'email': email,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Select Voice
     * Update user's preferred AI tutor voice (for registered users only)
     * @param requestBody
     * @returns VoiceSelectionResponse Successful Response
     * @throws ApiError
     */
    public static selectVoiceApiAuthSelectVoicePost(
        requestBody: VoiceSelectionRequest,
    ): CancelablePromise<VoiceSelectionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/select-voice',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Voice Preference
     * Get user's current AI tutor voice preference
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getVoicePreferenceApiAuthGetVoiceGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/get-voice',
        });
    }
}
