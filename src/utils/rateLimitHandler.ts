/**
 * Global Rate Limit Handler
 * ==========================
 *
 * Centralized handler for 429 rate limit errors from the API.
 * Manages modal visibility and state.
 */

import { ApiError } from '../api/generated';
import type { RateLimitInfo } from '../components/RateLimitModal';

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitHandler {
  onRateLimit: (info: RateLimitInfo) => void;
}

let rateLimitHandler: RateLimitHandler | null = null;

// ============================================================================
// REGISTER HANDLER
// ============================================================================

/**
 * Register global rate limit handler (called from App.tsx)
 */
export const registerRateLimitHandler = (handler: RateLimitHandler) => {
  rateLimitHandler = handler;
};

// ============================================================================
// HANDLE ERROR
// ============================================================================

/**
 * Check if error is a rate limit error and handle it
 * Returns true if handled, false otherwise
 */
export const handleRateLimitError = (error: any): boolean => {
  // Check if it's a 429 error
  if (error instanceof ApiError && error.status === 429) {
    const body = error.body;

    // Extract rate limit info from error body
    const info: RateLimitInfo = {
      category: body?.category || 'general',
      retryAfter: body?.retry_after || 60,
      limit: body?.limit || 100,
      window: body?.window || 60,
      message: body?.message,
    };

    // Show rate limit modal
    if (rateLimitHandler) {
      rateLimitHandler.onRateLimit(info);
      return true;
    }
  }

  // Not a rate limit error or no handler registered
  return false;
};

// ============================================================================
// API ERROR INTERCEPTOR
// ============================================================================

/**
 * Wrap API calls with rate limit error handling
 * Usage: const result = await withRateLimitHandling(() => ApiService.someMethod())
 */
export const withRateLimitHandling = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    // Handle rate limit error
    if (handleRateLimitError(error)) {
      // Re-throw the error so calling code can handle it
      throw error;
    }

    // Re-throw other errors
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse error body from different API error formats
 */
export const parseRateLimitError = (error: any): RateLimitInfo | null => {
  try {
    // ApiError from generated client
    if (error instanceof ApiError && error.status === 429) {
      const body = error.body;
      return {
        category: body?.category || 'general',
        retryAfter: body?.retry_after || 60,
        limit: body?.limit || 100,
        window: body?.window || 60,
        message: body?.message,
      };
    }

    // Axios-style error
    if (error?.response?.status === 429) {
      const data = error.response.data;
      return {
        category: data?.category || 'general',
        retryAfter: data?.retry_after || 60,
        limit: data?.limit || 100,
        window: data?.window || 60,
        message: data?.message,
      };
    }

    // Fetch-style error
    if (error?.status === 429) {
      return {
        category: error?.category || 'general',
        retryAfter: error?.retry_after || 60,
        limit: error?.limit || 100,
        window: error?.window || 60,
        message: error?.message,
      };
    }

    return null;
  } catch (e) {
    console.error('[RateLimitHandler] Error parsing rate limit error:', e);
    return null;
  }
};
