/**
 * Heart System API Service
 * Provides API integration for the Focus Energy (heart) system
 *
 * Features:
 * - Real-time heart status tracking
 * - Heart consumption after challenges
 * - Refill status calculations
 * - Analytics event logging
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenAPI } from '../api/generated/core/OpenAPI';
import {
  AllHeartsStatus,
  HeartPool,
  ConsumeHeartResponse
} from '../types/hearts';

// API timeout configuration
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Custom error class for heart API errors
 */
export class HeartAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'HeartAPIError';
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
      throw new HeartAPIError(
        'Request timed out while fetching heart status.',
        408
      );
    }
    throw error;
  }
}

/**
 * Helper to get authorization headers
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  // Try both possible key names for compatibility (same as statsService)
  let token = await AsyncStorage.getItem('auth_token');
  if (!token) {
    token = await AsyncStorage.getItem('authToken');
  }

  if (!token) {
    throw new HeartAPIError('No authentication token available', 401);
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Heart API Service
 */
export const heartAPI = {
  /**
   * Get heart status for all challenge types
   * Called on ExploreScreen mount and after returning from session
   */
  async getAllHeartsStatus(): Promise<AllHeartsStatus> {
    try {
      const url = `${OpenAPI.BASE}/api/hearts/status`;
      console.log('[HeartAPI] Fetching all hearts from:', url);

      console.log('[HeartAPI] Getting auth headers...');
      const headers = await getAuthHeaders();
      console.log('[HeartAPI] Headers obtained');

      console.log('[HeartAPI] Making fetch request...');
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers
      });
      console.log('[HeartAPI] Response received:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[HeartAPI] Error response:', errorData);
        throw new HeartAPIError(
          errorData.detail || 'Failed to fetch hearts status',
          response.status
        );
      }

      const data = await response.json();
      console.log('[HeartAPI] Hearts data:', JSON.stringify(data, null, 2));
      return data as AllHeartsStatus;

    } catch (error) {
      if (error instanceof HeartAPIError) {
        console.error('[HeartAPI] HeartAPIError:', error.message, error.statusCode);
        throw error;
      }
      console.error('[HeartAPI] Unexpected error:', error);
      throw new HeartAPIError(
        'Network error while fetching hearts status',
        0,
        error as Error
      );
    }
  },

  /**
   * Get heart status for specific challenge type
   * Called before starting a session
   */
  async getHeartStatus(challengeType: string): Promise<HeartPool> {
    try {
      const url = `${OpenAPI.BASE}/api/hearts/status/${challengeType}`;

      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: await getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HeartAPIError(
          errorData.detail || `Failed to fetch ${challengeType} hearts`,
          response.status
        );
      }

      const data = await response.json();
      return data as HeartPool;

    } catch (error) {
      if (error instanceof HeartAPIError) {
        throw error;
      }
      console.error(`Failed to fetch ${challengeType} hearts:`, error);
      throw new HeartAPIError(
        `Network error while fetching ${challengeType} hearts`,
        0,
        error as Error
      );
    }
  },

  /**
   * Consume heart after challenge answer
   * Called after each challenge within a session
   */
  async consumeHeart(
    challengeType: string,
    isCorrect: boolean,
    sessionId?: string
  ): Promise<ConsumeHeartResponse> {
    try {
      const url = `${OpenAPI.BASE}/api/hearts/consume`;

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          challenge_type: challengeType,
          is_correct: isCorrect,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HeartAPIError(
          errorData.detail || 'Failed to consume heart',
          response.status
        );
      }

      const data = await response.json();
      return data as ConsumeHeartResponse;

    } catch (error) {
      if (error instanceof HeartAPIError) {
        throw error;
      }
      console.error('Failed to consume heart:', error);
      throw new HeartAPIError(
        'Network error while consuming heart',
        0,
        error as Error
      );
    }
  },

  /**
   * Log out-of-hearts modal interaction
   */
  async logModalInteraction(
    challengeType: string,
    userAction: 'shown' | 'upgrade' | 'wait' | 'dismissed',
    sessionId: string,
    sessionProgress: { completed: number; total: number }
  ): Promise<void> {
    try {
      const url = `${OpenAPI.BASE}/api/hearts/log-modal`;

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          challenge_type: challengeType,
          user_action: userAction,
          session_id: sessionId,
          session_progress: sessionProgress
        })
      });

      if (!response.ok) {
        // Log error but don't throw - analytics failure shouldn't break UX
        console.warn('Failed to log modal interaction:', response.status);
      }

    } catch (error) {
      // Log error but don't throw - analytics failure shouldn't break UX
      console.warn('Failed to log modal interaction:', error);
    }
  },

  /**
   * Log session ended early
   */
  async logSessionEndedEarly(
    challengeType: string,
    sessionId: string,
    completed: number,
    total: number
  ): Promise<void> {
    try {
      const url = `${OpenAPI.BASE}/api/hearts/log-session-ended`;

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          challenge_type: challengeType,
          session_id: sessionId,
          completed,
          total
        })
      }, 5000); // Shorter timeout for analytics

      if (!response.ok) {
        // Log error but don't throw - analytics failure shouldn't break UX
        console.warn('Failed to log session ended:', response.status);
      }

    } catch (error) {
      // Log error but don't throw - analytics failure shouldn't break UX
      console.warn('Failed to log session ended:', error);
    }
  }
};
