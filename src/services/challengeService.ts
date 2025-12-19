/**
 * Challenge Service - Hybrid Data Source
 *
 * Intelligently fetches challenges from either:
 * 1. Backend API (personalized, AI-generated)
 * 2. Mock data (fallback, always available)
 *
 * Features:
 * - Automatic fallback on API failure
 * - Feature flag control
 * - Graceful error handling
 * - Loading state management
 */

import {
  Challenge,
  CEFRLevel,
  Language,
  getDailyChallenges as getMockChallenges,
} from './mockChallengeData';
import { ChallengeAPI, ChallengeAPIError } from './challengeAPI';
import { FeatureFlags, isFeatureEnabled } from '../config/features';
import { authService } from '../api/services/auth';

/**
 * Result type for challenge fetching
 */
export interface ChallengeResult {
  challenges: Challenge[];
  source: 'api' | 'mock' | 'cache';
  isLoading: boolean;
  error: string | null;
}

/**
 * Challenge cache to avoid repeated API calls
 */
interface ChallengeCache {
  challenges: Challenge[];
  timestamp: number;
  cefrLevel: CEFRLevel;
}

let challengeCache: ChallengeCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if cache is valid
 */
function isCacheValid(cefrLevel: CEFRLevel): boolean {
  if (!challengeCache) return false;
  if (challengeCache.cefrLevel !== cefrLevel) return false;

  const now = Date.now();
  const age = now - challengeCache.timestamp;

  return age < CACHE_DURATION;
}

/**
 * Save challenges to cache
 */
function setChallengeCache(challenges: Challenge[], cefrLevel: CEFRLevel): void {
  challengeCache = {
    challenges,
    timestamp: Date.now(),
    cefrLevel,
  };
  console.log('💾 Cached', challenges.length, 'challenges for level', cefrLevel);
}

/**
 * Clear challenge cache (useful for testing or forcing refresh)
 */
function clearChallengeCache(): void {
  challengeCache = null;
  console.log('🗑️ Challenge cache cleared');
}

/**
 * Challenge metadata for UI
 */
export const CHALLENGE_TYPES = [
  {
    type: 'error_spotting',
    title: 'Spot the Mistake',
    emoji: '🔍',
    description: 'Find grammar and vocabulary errors',
  },
  {
    type: 'swipe_fix',
    title: 'Swipe to Compare',
    emoji: '↔️',
    description: 'Learn from your mistakes',
  },
  {
    type: 'micro_quiz',
    title: 'Quick Quiz',
    emoji: '💡',
    description: 'Fast decision making',
  },
  {
    type: 'smart_flashcard',
    title: 'Smart Flashcard',
    emoji: '🎴',
    description: 'Vocabulary from your practice',
  },
  {
    type: 'native_check',
    title: 'Sounds Natural?',
    emoji: '🎯',
    description: 'Would a native say this?',
  },
  {
    type: 'brain_tickler',
    title: '10-Second Challenge',
    emoji: '⚡',
    description: 'Beat the clock!',
  },
] as const;

/**
 * Main Challenge Service
 */
export const ChallengeService = {
  /**
   * Get daily challenges - intelligently chooses between API and mock data
   *
   * Flow:
   * 1. Check if cache is valid → return cached challenges
   * 2. If USE_CHALLENGE_API is enabled → try API
   * 3. On API failure and ENABLE_API_FALLBACK → use mock data
   * 4. Otherwise → always use mock data
   *
   * @param cefrLevel - User's CEFR level
   * @param language - Optional language filter
   * @param level - Optional level override (uses cefrLevel if not provided)
   * @returns Promise with challenges and metadata
   */
  async getDailyChallenges(
    cefrLevel: CEFRLevel = 'B1',
    language?: Language,
    level?: CEFRLevel
  ): Promise<ChallengeResult> {
    const effectiveLevel = level || cefrLevel;
    console.log('🎯 Getting daily challenges for level:', effectiveLevel, language ? `language: ${language}` : '');

    // Check cache first (cache is bypassed if language is specified)
    if (!language && isCacheValid(effectiveLevel)) {
      console.log('✅ Returning cached challenges');
      return {
        challenges: challengeCache!.challenges,
        source: 'cache',
        isLoading: false,
        error: null,
      };
    }

    // Check if API is enabled
    if (!isFeatureEnabled('USE_CHALLENGE_API')) {
      console.log('📦 API disabled, using mock data');
      const challenges = getMockChallenges(effectiveLevel);
      if (!language) {
        setChallengeCache(challenges, effectiveLevel);
      }
      return {
        challenges,
        source: 'mock',
        isLoading: false,
        error: null,
      };
    }

    // Try to fetch from API
    try {
      console.log('🌐 Attempting to fetch from API...');
      const token = await authService.getToken();

      const challenges = await ChallengeAPI.getDailyChallenge(token, language, effectiveLevel);

      if (!challenges || challenges.length === 0) {
        throw new ChallengeAPIError('API returned empty challenges array');
      }

      if (!language) {
        setChallengeCache(challenges, effectiveLevel);
      }

      return {
        challenges,
        source: 'api',
        isLoading: false,
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ API fetch failed:', errorMessage);

      // Check if fallback is enabled
      if (isFeatureEnabled('ENABLE_API_FALLBACK')) {
        console.log('🔄 Falling back to mock data');
        const challenges = getMockChallenges(effectiveLevel);
        if (!language) {
          setChallengeCache(challenges, effectiveLevel);
        }

        return {
          challenges,
          source: 'mock',
          isLoading: false,
          error: `Using offline challenges: ${errorMessage}`,
        };
      }

      // No fallback - return error
      return {
        challenges: [],
        source: 'mock',
        isLoading: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Mark challenge as completed
   *
   * If API is enabled and completion tracking is enabled, sends to backend
   * Otherwise, only returns success locally
   *
   * @param challengeId - Challenge ID
   * @param correct - Whether user answered correctly
   * @param timeSpent - Time spent in seconds
   * @returns Success status
   */
  async completeChallenge(
    challengeId: string,
    correct: boolean,
    timeSpent: number
  ): Promise<{ success: boolean; error?: string }> {
    console.log('✅ Completing challenge:', challengeId);

    // If completion tracking is disabled, just return success
    if (!isFeatureEnabled('ENABLE_COMPLETION_TRACKING')) {
      console.log('📝 Completion tracking disabled, returning local success');
      return { success: true };
    }

    // Try to send to API
    try {
      const token = await authService.getToken();

      if (!token) {
        throw new ChallengeAPIError('No authentication token found');
      }

      await ChallengeAPI.completeChallenge(token, challengeId, correct, timeSpent);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to track completion:', errorMessage);

      // Return success anyway - don't block user experience
      return {
        success: true,
        error: errorMessage,
      };
    }
  },

  /**
   * Get user's challenge statistics
   *
   * Only fetches if feature is enabled
   *
   * @returns Stats or null if disabled/failed
   */
  async getStats(): Promise<{
    total_completed: number;
    current_streak: number;
    accuracy: number;
    total_time_spent: number;
  } | null> {
    if (!isFeatureEnabled('ENABLE_CHALLENGE_STATS')) {
      console.log('📊 Stats disabled');
      return null;
    }

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new ChallengeAPIError('No authentication token found');
      }

      return await ChallengeAPI.getStats(token);
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      return null;
    }
  },

  /**
   * Test API connection
   *
   * Useful for settings page or debugging
   *
   * @returns true if API is reachable
   */
  async testAPIConnection(): Promise<boolean> {
    if (!isFeatureEnabled('USE_CHALLENGE_API')) {
      return false;
    }

    try {
      const token = await authService.getToken();

      if (!token) {
        return false;
      }

      return await ChallengeAPI.testConnection(token);
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  },

  /**
   * Force refresh challenges (bypasses cache)
   *
   * @param cefrLevel - User's CEFR level
   * @returns Fresh challenges
   */
  async refreshChallenges(cefrLevel: CEFRLevel = 'B1'): Promise<ChallengeResult> {
    console.log('🔄 Force refreshing challenges...');
    clearChallengeCache();
    return this.getDailyChallenges(cefrLevel);
  },

  /**
   * Get available challenge counts by type
   *
   * @param language - Optional language filter
   * @param level - Optional CEFR level filter
   * @param source - Challenge source: 'reference' for reference_challenges, 'learning_plan' for personalized
   * @returns Object with count per challenge type
   */
  async getChallengeCounts(
    language?: Language,
    level?: CEFRLevel,
    source?: 'reference' | 'learning_plan'
  ): Promise<Record<string, number>> {
    if (!isFeatureEnabled('USE_CHALLENGE_API')) {
      console.log('📊 API disabled, returning default counts');
      // Return default counts for mock data
      return {
        error_spotting: 10,
        swipe_fix: 10,
        micro_quiz: 10,
        smart_flashcard: 10,
        native_check: 10,
        brain_tickler: 10,
      };
    }

    try {
      const token = await authService.getToken();
      console.log('📊 Fetching counts with source:', source || 'default');

      const counts = await ChallengeAPI.getChallengeCounts(token, language, level, source);
      console.log('📊 Raw counts from API:', JSON.stringify(counts));

      // Validate counts object
      if (!counts || typeof counts !== 'object') {
        console.warn('⚠️ Invalid counts format, using defaults');
        return {
          error_spotting: 10,
          swipe_fix: 10,
          micro_quiz: 10,
          smart_flashcard: 10,
          native_check: 10,
          brain_tickler: 10,
        };
      }

      return counts;
    } catch (error) {
      console.error('❌ Failed to fetch challenge counts:', error);

      // Return default counts on error
      return {
        error_spotting: 10,
        swipe_fix: 10,
        micro_quiz: 10,
        smart_flashcard: 10,
        native_check: 10,
        brain_tickler: 10,
      };
    }
  },

  /**
   * Get all challenges of a specific type
   *
   * @param challengeType - Type of challenge to fetch
   * @param limit - Maximum number to return
   * @param language - Optional language filter
   * @param level - Optional CEFR level filter
   * @param source - Challenge source: 'reference' for reference_challenges, 'learning_plan' for personalized
   * @returns Array of challenges
   */
  async getChallengesByType(
    challengeType: string,
    limit: number = 50,
    language?: Language,
    level?: CEFRLevel,
    source?: 'reference' | 'learning_plan'
  ): Promise<ChallengeResult> {
    console.log(`📚 Getting ${challengeType} challenges`, language ? `for ${language}` : '', level ? `level ${level}` : '', source ? `source: ${source}` : '');

    if (!isFeatureEnabled('USE_CHALLENGE_API')) {
      console.log('📦 API disabled, using mock data');
      // Return mock data of specific type
      const challenges = getMockChallenges(level || 'B1').filter(
        c => c.type === challengeType
      );
      return {
        challenges,
        source: 'mock',
        isLoading: false,
        error: null,
      };
    }

    try {
      const token = await authService.getToken();

      const challenges = await ChallengeAPI.getChallengesByType(
        token,
        challengeType,
        limit,
        language,
        level,
        source
      );

      return {
        challenges,
        source: 'api',
        isLoading: false,
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to fetch challenges by type:', errorMessage);

      // Fallback to mock data
      if (isFeatureEnabled('ENABLE_API_FALLBACK')) {
        console.log('🔄 Falling back to mock data');
        const challenges = getMockChallenges(level || 'B1').filter(
          c => c.type === challengeType
        );
        return {
          challenges,
          source: 'mock',
          isLoading: false,
          error: `Using offline challenges: ${errorMessage}`,
        };
      }

      return {
        challenges: [],
        source: 'mock',
        isLoading: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get available languages with challenge availability info
   *
   * @param level - Optional CEFR level to check availability for
   * @returns Language availability information
   */
  async getLanguages(level?: CEFRLevel): Promise<{
    success: boolean;
    active_language: string | null;
    languages: Array<{
      language: Language;
      has_learning_plan: boolean;
      is_active: boolean;
      available_challenges: number;
    }>;
  } | null> {
    if (!isFeatureEnabled('USE_CHALLENGE_API')) {
      console.log('📊 API disabled, cannot fetch languages');
      return null;
    }

    try {
      const token = await authService.getToken();
      return await ChallengeAPI.getLanguages(token, level);
    } catch (error) {
      console.error('❌ Failed to fetch languages:', error);
      return null;
    }
  },
};

/**
 * Export for convenience
 */
export { clearChallengeCache };
