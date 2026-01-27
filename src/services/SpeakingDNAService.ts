/**
 * Speaking DNA Service
 * ====================
 * Handles all API calls for the Speaking DNA feature.
 *
 * Speaking DNA creates unique "speaking fingerprints" for each learner
 * based on their conversation patterns across 6 DNA strands.
 *
 * Features:
 * - Session analysis and DNA profile updates
 * - Breakthrough moment detection
 * - DNA evolution tracking
 * - Coach instructions personalization
 * - Caching for performance
 * - Premium feature access control
 */

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SpeakingDNAProfile,
  DNAProfileResponse,
  DNAEvolutionResponse,
  DNABreakthroughsResponse,
  SessionAnalysisInput,
  AnalyzeSessionResponse,
  SpeakingBreakthrough,
  DNAHistorySnapshot,
  CoachInstructionsResponse,
} from '../types/speakingDNA';

// Get API base URL from config
import { API_BASE_URL } from '../config/api';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_ENDPOINTS = {
  ANALYZE_SESSION: '/api/speaking-dna/analyze-session',
  PROFILE: '/api/speaking-dna/profile',
  EVOLUTION: '/api/speaking-dna/evolution',
  BREAKTHROUGHS: '/api/speaking-dna/breakthroughs',
  CELEBRATE: '/api/speaking-dna/breakthroughs',
  COACH_INSTRUCTIONS: '/api/speaking-dna/coach-instructions',
} as const;

// Cache keys (will be prefixed with user ID and language)
const CACHE_KEYS = {
  profile: 'dna_profile_',
  evolution: 'dna_evolution_',
  breakthroughs: 'dna_breakthroughs_',
} as const;

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  profile: 10 * 60 * 1000, // 10 minutes
  evolution: 30 * 60 * 1000, // 30 minutes
  breakthroughs: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user ID for cache key (to make cache user-specific)
 */
async function getUserId(): Promise<string> {
  try {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user._id || 'unknown';
    }
    return 'unknown';
  } catch (error) {
    console.error('[SpeakingDNAService] Failed to get user ID:', error);
    return 'unknown';
  }
}

/**
 * Get auth token from storage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    let token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      token = await AsyncStorage.getItem('authToken');
    }
    return token;
  } catch (error) {
    console.error('[SpeakingDNAService] Failed to get auth token:', error);
    return null;
  }
}

/**
 * Create auth headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get cached data if it exists and is not expired
 */
async function getCachedData<T>(
  key: string,
  maxAge: number
): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age > maxAge) {
      // Cache expired
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error(`[SpeakingDNAService] Failed to get cached data for ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data with timestamp
 */
async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error(`[SpeakingDNAService] Failed to set cached data for ${key}:`, error);
  }
}

/**
 * Invalidate cache for a specific key pattern
 */
async function invalidateCache(keyPattern: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToRemove = keys.filter(key => key.includes(keyPattern));
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`[SpeakingDNAService] Invalidated ${keysToRemove.length} cache entries`);
    }
  } catch (error) {
    console.error('[SpeakingDNAService] Failed to invalidate cache:', error);
  }
}

/**
 * Handle API errors consistently
 */
function handleAPIError(error: any, context: string): never {
  console.error(`[SpeakingDNAService] ${context} error:`, error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail: string }>;

    if (axiosError.response?.status === 403) {
      // Premium feature access denied
      throw new Error(
        'Speaking DNA is a premium feature. Please upgrade your subscription to access this feature.'
      );
    }

    if (axiosError.response?.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    }

    if (axiosError.response?.data?.detail) {
      throw new Error(axiosError.response.data.detail);
    }

    throw new Error(`Failed to ${context}. Please try again.`);
  }

  throw new Error(`An unexpected error occurred while ${context}.`);
}

// ============================================================================
// SPEAKING DNA SERVICE CLASS
// ============================================================================

class SpeakingDNAService {
  /**
   * Analyze a completed session and update DNA profile
   *
   * @param language - Target language (e.g., 'dutch', 'spanish')
   * @param sessionData - Session data including user turns, corrections, etc.
   * @returns Analysis result with breakthroughs and insights
   */
  async analyzeSession(
    language: string,
    sessionData: SessionAnalysisInput
  ): Promise<AnalyzeSessionResponse> {
    try {
      console.log(`[SpeakingDNAService] Analyzing session for language: ${language}`);

      const headers = await getAuthHeaders();
      const response = await axios.post<AnalyzeSessionResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.ANALYZE_SESSION}`,
        sessionData,
        {
          params: { language },
          headers,
          timeout: 30000, // 30 second timeout for analysis
        }
      );

      // Invalidate profile cache since it was updated
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.profile}${userId}_${language}`;
      await invalidateCache(cacheKey);

      console.log(
        `[SpeakingDNAService] Session analyzed successfully. Breakthroughs: ${response.data.breakthroughs.length}`
      );

      return response.data;
    } catch (error) {
      return handleAPIError(error, 'analyzing session');
    }
  }

  /**
   * Get user's DNA profile for a language
   *
   * @param language - Target language
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns DNA profile or null if not exists
   */
  async getProfile(
    language: string,
    forceRefresh: boolean = false
  ): Promise<SpeakingDNAProfile | null> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.profile}${userId}_${language}`;

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await getCachedData<DNAProfileResponse>(
          cacheKey,
          CACHE_DURATIONS.profile
        );
        if (cached) {
          console.log('[SpeakingDNAService] Returning cached profile');
          return cached.profile;
        }
      }

      // Fetch from API
      console.log(`[SpeakingDNAService] Fetching profile for language: ${language}`);
      const headers = await getAuthHeaders();
      const response = await axios.get<DNAProfileResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.PROFILE}/${language}`,
        { headers }
      );

      // Cache the response
      await setCachedData(cacheKey, response.data);

      console.log(
        `[SpeakingDNAService] Profile fetched. Has profile: ${response.data.has_profile}`
      );

      return response.data.profile;
    } catch (error) {
      return handleAPIError(error, 'fetching DNA profile');
    }
  }

  /**
   * Get DNA evolution history for visualization
   *
   * @param language - Target language
   * @param weeks - Number of weeks to retrieve (default: 12)
   * @param forceRefresh - Skip cache and fetch fresh data
   * @returns Evolution history snapshots
   */
  async getEvolution(
    language: string,
    weeks: number = 12,
    forceRefresh: boolean = false
  ): Promise<DNAHistorySnapshot[]> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.evolution}${userId}_${language}_${weeks}`;

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await getCachedData<DNAEvolutionResponse>(
          cacheKey,
          CACHE_DURATIONS.evolution
        );
        if (cached) {
          console.log('[SpeakingDNAService] Returning cached evolution');
          return cached.evolution;
        }
      }

      // Fetch from API
      console.log(`[SpeakingDNAService] Fetching evolution for language: ${language}, weeks: ${weeks}`);
      const headers = await getAuthHeaders();
      const response = await axios.get<DNAEvolutionResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.EVOLUTION}/${language}`,
        {
          params: { weeks },
          headers,
        }
      );

      // Cache the response
      await setCachedData(cacheKey, response.data);

      console.log(
        `[SpeakingDNAService] Evolution fetched. Weeks tracked: ${response.data.weeks_tracked}`
      );

      return response.data.evolution;
    } catch (error) {
      return handleAPIError(error, 'fetching DNA evolution');
    }
  }

  /**
   * Get breakthrough moments
   *
   * @param language - Target language
   * @param options - Query options
   * @returns Breakthrough moments list
   */
  async getBreakthroughs(
    language: string,
    options: {
      limit?: number;
      uncelebratedOnly?: boolean;
      forceRefresh?: boolean;
    } = {}
  ): Promise<SpeakingBreakthrough[]> {
    try {
      const { limit = 20, uncelebratedOnly = false, forceRefresh = false } = options;

      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.breakthroughs}${userId}_${language}_${limit}_${uncelebratedOnly}`;

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await getCachedData<DNABreakthroughsResponse>(
          cacheKey,
          CACHE_DURATIONS.breakthroughs
        );
        if (cached) {
          console.log('[SpeakingDNAService] Returning cached breakthroughs');
          return cached.breakthroughs;
        }
      }

      // Fetch from API
      console.log(
        `[SpeakingDNAService] Fetching breakthroughs for language: ${language}, limit: ${limit}, uncelebrated: ${uncelebratedOnly}`
      );
      const headers = await getAuthHeaders();
      const response = await axios.get<DNABreakthroughsResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.BREAKTHROUGHS}/${language}`,
        {
          params: { limit, uncelebrated_only: uncelebratedOnly },
          headers,
        }
      );

      // Cache the response
      await setCachedData(cacheKey, response.data);

      console.log(
        `[SpeakingDNAService] Breakthroughs fetched. Total: ${response.data.total_count}`
      );

      return response.data.breakthroughs;
    } catch (error) {
      return handleAPIError(error, 'fetching breakthroughs');
    }
  }

  /**
   * Mark a breakthrough as celebrated
   *
   * @param breakthroughId - Breakthrough MongoDB ObjectId
   */
  async celebrateBreakthrough(breakthroughId: string): Promise<void> {
    try {
      console.log(`[SpeakingDNAService] Celebrating breakthrough: ${breakthroughId}`);

      const headers = await getAuthHeaders();
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CELEBRATE}/${breakthroughId}/celebrate`,
        {},
        { headers }
      );

      // Invalidate breakthroughs cache
      const userId = await getUserId();
      await invalidateCache(`${CACHE_KEYS.breakthroughs}${userId}`);

      console.log('[SpeakingDNAService] Breakthrough celebrated successfully');
    } catch (error) {
      return handleAPIError(error, 'celebrating breakthrough');
    }
  }

  /**
   * Get DNA-aware coach instructions (internal use)
   *
   * @param language - Target language
   * @param sessionType - Type of session
   * @returns Coach instructions
   */
  async getCoachInstructions(
    language: string,
    sessionType: 'learning' | 'freestyle' | 'news'
  ): Promise<string> {
    try {
      console.log(
        `[SpeakingDNAService] Fetching coach instructions for language: ${language}, type: ${sessionType}`
      );

      const headers = await getAuthHeaders();
      const response = await axios.get<CoachInstructionsResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.COACH_INSTRUCTIONS}/${language}`,
        {
          params: { session_type: sessionType },
          headers,
        }
      );

      return response.data.instructions;
    } catch (error) {
      // Non-fatal - return empty string if fails
      console.warn('[SpeakingDNAService] Failed to get coach instructions (non-fatal):', error);
      return '';
    }
  }

  /**
   * Clear all DNA-related cache
   */
  async clearCache(): Promise<void> {
    try {
      console.log('[SpeakingDNAService] Clearing all DNA cache');
      await invalidateCache('dna_');
    } catch (error) {
      console.error('[SpeakingDNAService] Failed to clear cache:', error);
    }
  }

  /**
   * Check if user has access to Speaking DNA (premium feature)
   */
  async hasPremiumAccess(): Promise<boolean> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        console.log('[SpeakingDNAService] No user in storage');
        return false;
      }

      const user = JSON.parse(userStr);
      const subscriptionStatus = user.subscription_status;

      console.log('[SpeakingDNAService] Premium access check:', {
        status: subscriptionStatus,
        plan: user.subscription_plan,
        email: user.email,
      });

      // Allow access for active, trialing, and canceling (still active until period end)
      const hasAccess = subscriptionStatus === 'active' ||
                        subscriptionStatus === 'trialing' ||
                        subscriptionStatus === 'canceling';

      console.log('[SpeakingDNAService] Has premium access:', hasAccess);
      return hasAccess;
    } catch (error) {
      console.error('[SpeakingDNAService] Failed to check premium access:', error);
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const speakingDNAService = new SpeakingDNAService();
export default speakingDNAService;
