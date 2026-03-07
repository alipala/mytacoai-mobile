/**
 * API Interceptor for Global Error Handling
 * ==========================================
 *
 * Intercepts all API errors and handles rate limiting (429) globally.
 * This ensures rate limit modal appears automatically without manual error handling.
 */

import { handleRateLimitError } from '../utils/rateLimitHandler';

let isInterceptorSetup = false;

/**
 * Setup global API interceptor for rate limit errors
 * Call this once during app initialization
 */
export const setupApiInterceptor = () => {
  if (isInterceptorSetup) {
    console.log('[API Interceptor] Already setup, skipping');
    return;
  }

  console.log('[API Interceptor] Setting up global rate limit handler');

  // Monkey-patch the request function to add global error handling
  const requestModule = require('./generated/core/request');
  const originalRequest = requestModule.request;

  // Wrap the original request function
  requestModule.request = function <T>(...args: any[]): any {
    const promise = originalRequest.apply(this, args);

    // Add catch handler for rate limit errors
    const originalCatch = promise.catch.bind(promise);
    promise.catch = function (onRejected?: ((reason: any) => any) | null | undefined) {
      return originalCatch((error: any) => {
        // Try to handle as rate limit error
        const handled = handleRateLimitError(error);

        if (handled) {
          console.log('[API Interceptor] Rate limit error handled, showing modal');
        }

        // Always re-throw so calling code can handle it
        if (onRejected) {
          return onRejected(error);
        }
        throw error;
      });
    };

    return promise;
  };

  isInterceptorSetup = true;
  console.log('[API Interceptor] ✅ Global rate limit handler setup complete');
};

/**
 * Check if interceptor is setup
 */
export const isInterceptorActive = () => isInterceptorSetup;
