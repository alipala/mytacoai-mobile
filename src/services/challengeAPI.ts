/**
 * Challenge API Service
 * Provides API integration for personalized daily challenges from backend
 *
 * Features:
 * - Timeout handling (30s for first call)
 * - Automatic retry logic
 * - Error recovery
 * - Type-safe responses matching mock data structure
 */

import { Challenge, Language, CEFRLevel } from './mockChallengeData';
import { OpenAPI } from '../api/generated/core/OpenAPI';

// API timeout configuration
const API_TIMEOUT = 30000; // 30 seconds for AI generation
const RETRY_ATTEMPTS = 2;

/**
 * Custom error class for challenge API errors
 */
export class ChallengeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ChallengeAPIError';
  }
}

/**
 * Helper to create fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ChallengeAPIError(
        'Request timed out. AI is generating your personalized challenges.',
        408
      );
    }
    throw error;
  }
}

/**
 * Helper to retry API calls
 */
async function retryFetch<T>(
  fn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`API attempt ${i + 1} failed:`, error);

      // Don't retry on 4xx errors (client errors)
      if (error instanceof ChallengeAPIError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * Get the base API URL from OpenAPI config
 */
function getApiBaseUrl(): string {
  const baseUrl = OpenAPI.BASE;

  if (!baseUrl || baseUrl === '') {
    throw new ChallengeAPIError(
      'API URL not configured. Please set OpenAPI.BASE in your app initialization.'
    );
  }

  return baseUrl;
}

/**
 * Challenge API client
 */
export const ChallengeAPI = {
  /**
   * Get challenge counts by type
   *
   * @param token - Authentication token (optional for guest users)
   * @param language - Optional language filter
   * @param level - Optional CEFR level filter
   * @returns Object with count per challenge type
   * @throws ChallengeAPIError on failure
   */
  async getChallengeCounts(
    token: string | null,
    language?: Language,
    level?: CEFRLevel
  ): Promise<Record<string, number>> {
    return retryFetch(async () => {
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();

      if (language) params.append('language', language);
      if (level) params.append('level', level);

      const queryString = params.toString();
      const url = `${baseUrl}/api/challenges/counts${queryString ? `?${queryString}` : ''}`;

      console.log('📊 Fetching challenge counts', language ? `for ${language}` : '', level ? `level ${level}` : '');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers,
        },
        5000
      );

      if (!response.ok) {
        throw new ChallengeAPIError(
          `Failed to fetch challenge counts: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('✅ Successfully fetched challenge counts:', data);

      // Backend might return counts directly or wrapped in "counts" key
      if (data.counts) {
        return data.counts;
      }

      // If it's already the counts object directly
      return data;
    });
  },

  /**
   * Get challenges by specific type
   *
   * @param token - Authentication token (optional for guest users)
   * @param challengeType - Type of challenge
   * @param limit - Maximum number of challenges to return
   * @param language - Optional language filter
   * @param level - Optional CEFR level filter
   * @returns Array of challenges of specified type
   * @throws ChallengeAPIError on failure
   */
  async getChallengesByType(
    token: string | null,
    challengeType: string,
    limit: number = 50,
    language?: Language,
    level?: CEFRLevel
  ): Promise<Challenge[]> {
    return retryFetch(async () => {
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();

      params.append('limit', limit.toString());
      if (language) params.append('language', language);
      if (level) params.append('level', level);

      const url = `${baseUrl}/api/challenges/by-type/${challengeType}?${params.toString()}`;

      console.log(`📚 Fetching ${challengeType} challenges`, language ? `for ${language}` : '', level ? `level ${level}` : '');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers,
        },
        10000 // 10 second timeout
      );

      if (!response.ok) {
        throw new ChallengeAPIError(
          `Failed to fetch challenges: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      if (!data.challenges || !Array.isArray(data.challenges)) {
        throw new ChallengeAPIError(
          'Invalid response format: expected challenges array'
        );
      }

      console.log(`✅ Fetched ${data.challenges.length} ${challengeType} challenges`);
      return data.challenges as Challenge[];
    });
  },

  /**
   * Get 6 personalized daily challenges from backend
   *
   * Returns one challenge of each type from the pre-generated pool
   *
   * @param token - Authentication token (optional for guest users)
   * @param language - Optional language filter
   * @param level - Optional CEFR level filter
   * @returns Array of 6 personalized challenges
   * @throws ChallengeAPIError on failure
   */
  async getDailyChallenge(
    token: string | null,
    language?: Language,
    level?: CEFRLevel
  ): Promise<Challenge[]> {
    return retryFetch(async () => {
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();

      if (language) params.append('language', language);
      if (level) params.append('level', level);

      const queryString = params.toString();
      const url = `${baseUrl}/api/challenges/daily${queryString ? `?${queryString}` : ''}`;

      console.log('🎯 Fetching daily challenges from:', url);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ChallengeAPIError(
          `Failed to fetch challenges: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data.challenges || !Array.isArray(data.challenges)) {
        throw new ChallengeAPIError(
          'Invalid response format: expected challenges array'
        );
      }

      console.log('✅ Successfully fetched', data.challenges.length, 'challenges');
      return data.challenges as Challenge[];
    });
  },

  /**
   * Mark a challenge as completed
   *
   * @param token - Authentication token
   * @param challengeId - Challenge ID
   * @param correct - Whether the user answered correctly
   * @param timeSpent - Time spent on challenge in seconds
   * @returns Response from backend
   * @throws ChallengeAPIError on failure
   */
  async completeChallenge(
    token: string,
    challengeId: string,
    correct: boolean,
    timeSpent: number
  ): Promise<{ success: boolean; message?: string }> {
    if (!token) {
      throw new ChallengeAPIError('Authentication token is required');
    }

    return retryFetch(async () => {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/api/challenges/${challengeId}/complete`;

      console.log('📝 Marking challenge', challengeId, 'as completed');

      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            challenge_id: challengeId,
            correct,
            time_spent: timeSpent,
          }),
        },
        5000 // Shorter timeout for completion
      );

      if (!response.ok) {
        throw new ChallengeAPIError(
          `Failed to complete challenge: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('✅ Challenge marked as completed');
      return data;
    });
  },

  /**
   * Get user's challenge statistics
   *
   * @param token - Authentication token
   * @returns User's challenge stats
   * @throws ChallengeAPIError on failure
   */
  async getStats(token: string): Promise<{
    total_completed: number;
    current_streak: number;
    accuracy: number;
    total_time_spent: number;
  }> {
    if (!token) {
      throw new ChallengeAPIError('Authentication token is required');
    }

    return retryFetch(async () => {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/api/challenges/stats`;

      console.log('📊 Fetching challenge stats');

      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000 // Shorter timeout for stats
      );

      if (!response.ok) {
        throw new ChallengeAPIError(
          `Failed to fetch stats: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('✅ Successfully fetched challenge stats');
      return data;
    });
  },

  /**
   * Get available languages with challenge availability info
   *
   * @param token - Authentication token (optional for guest users)
   * @param level - Optional CEFR level to check availability for
   * @returns Language availability information
   * @throws ChallengeAPIError on failure
   */
  async getLanguages(
    token: string | null,
    level?: CEFRLevel
  ): Promise<{
    success: boolean;
    active_language: string | null;
    languages: Array<{
      language: Language;
      has_learning_plan: boolean;
      is_active: boolean;
      available_challenges: number;
    }>;
  }> {
    return retryFetch(async () => {
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();

      if (level) params.append('level', level);

      const queryString = params.toString();
      const url = `${baseUrl}/api/challenges/languages${queryString ? `?${queryString}` : ''}`;

      console.log('🌍 Fetching available languages', level ? `for level ${level}` : '');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers,
        },
        5000
      );

      if (!response.ok) {
        throw new ChallengeAPIError(
          `Failed to fetch languages: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('✅ Successfully fetched language availability:', data);
      return data;
    });
  },

  /**
   * Test API connectivity
   *
   * @param token - Authentication token
   * @returns true if API is reachable
   */
  async testConnection(token: string): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/api/challenges/stats`;

      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000
      );

      return response.ok;
    } catch (error) {
      console.warn('API connection test failed:', error);
      return false;
    }
  },
};
