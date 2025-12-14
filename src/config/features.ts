/**
 * Feature Flags Configuration
 *
 * Control feature availability and API integrations
 * Toggle features on/off for testing and gradual rollout
 */

/**
 * Feature flags for the application
 */
export const FeatureFlags = {
  /**
   * Enable backend API for challenges
   *
   * When false: Uses mock data from mockChallengeData.ts
   * When true: Fetches personalized challenges from backend API
   *
   * Set to false by default for safety - enable when backend is ready
   */
  USE_CHALLENGE_API: false,

  /**
   * Enable API fallback to mock data on failure
   *
   * When true: Falls back to mock data if API fails
   * When false: Shows error screen on API failure
   *
   * Recommended: true for production to ensure users always see content
   */
  ENABLE_API_FALLBACK: true,

  /**
   * Show API status indicator in UI
   *
   * When true: Shows indicator if using mock data vs API data
   * When false: No indicator shown
   *
   * Useful for testing and debugging
   */
  SHOW_API_STATUS_INDICATOR: false,

  /**
   * Enable challenge completion tracking
   *
   * When true: Sends completion data to backend API
   * When false: Only tracks locally
   */
  ENABLE_COMPLETION_TRACKING: false,

  /**
   * Enable challenge statistics
   *
   * When true: Fetches and displays user stats from API
   * When false: No stats displayed
   */
  ENABLE_CHALLENGE_STATS: false,
} as const;

/**
 * API Configuration
 */
export const APIConfig = {
  /**
   * Backend API URL
   *
   * Update this with your production backend URL
   * Leave empty to use OpenAPI.BASE from generated client
   */
  BACKEND_URL: '',

  /**
   * Timeout for challenge API requests (milliseconds)
   *
   * First-time generation can take 10-30s
   */
  CHALLENGE_API_TIMEOUT: 30000,

  /**
   * Number of retry attempts for failed API calls
   */
  RETRY_ATTEMPTS: 2,

  /**
   * Enable detailed API logging
   *
   * Useful for debugging, disable in production for performance
   */
  ENABLE_API_LOGGING: true,
} as const;

/**
 * Helper to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
}

/**
 * Helper to override feature flags at runtime (for testing)
 *
 * Example: setFeatureFlag('USE_CHALLENGE_API', true);
 */
export function setFeatureFlag(
  feature: keyof typeof FeatureFlags,
  value: boolean
): void {
  (FeatureFlags as any)[feature] = value;
  console.log(`🚩 Feature flag ${feature} set to ${value}`);
}
