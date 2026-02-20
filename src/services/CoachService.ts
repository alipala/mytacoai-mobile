/**
 * Taal Coach Service
 * ==================
 * Handles all API calls for the AI Coach feature.
 *
 * The Taal Coach provides:
 * - Personalized learning guidance
 * - Progress insights and celebration
 * - Feature explanations and onboarding
 * - Motivational support
 * - Actionable tips and strategies
 *
 * All responses are multilingual (in user's target language).
 */

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RichMessage {
  type: 'text' | 'progress_card' | 'dna_card' | 'celebration';
  content?: string;
  data?: any;
  timestamp: string;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface ChatResponse {
  messages: RichMessage[];
  quick_replies: QuickReply[];
  raw_response: string;
}

export interface UserContext {
  user_profile: {
    user_id: string;
    email?: string;
    target_language: string;
    cefr_level: string;
    subscription_status?: string;
    created_at?: string;
  };
  is_new_user: boolean;
  has_learning_plan: boolean;
  has_dna_profile: boolean;
  learning_plan?: any;
  speaking_dna?: any;
  breakthroughs: any[];
  stats: {
    current_streak: number;
    total_sessions: number;
    total_challenges: number;
    last_7_days: any[];
  };
  recent_sessions: any[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_ENDPOINTS = {
  CONTEXT: '/api/coach/context',
  CHAT: '/api/coach/chat',
} as const;

// Cache keys
const CACHE_KEYS = {
  context: 'coach_context_',
  conversation: 'coach_conversation_',
} as const;

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  context: 15 * 60 * 1000, // 15 minutes (increased from 5)
  conversation: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user ID for cache key
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
    console.error('[CoachService] Failed to get user ID:', error);
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
    console.error('[CoachService] Failed to get auth token:', error);
    return null;
  }
}

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<{ Authorization?: string }> {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get cached data if not expired
 */
async function getCachedData(key: string, maxAge: number): Promise<any | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < maxAge) {
        console.log(`[CoachService] Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
        return data;
      } else {
        console.log(`[CoachService] Cache expired: ${key}`);
        await AsyncStorage.removeItem(key);
      }
    }
    return null;
  } catch (error) {
    console.error('[CoachService] Cache read error:', error);
    return null;
  }
}

/**
 * Set cached data with timestamp
 */
async function setCachedData(key: string, data: any): Promise<void> {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    console.log(`[CoachService] Cached: ${key}`);
  } catch (error) {
    console.error('[CoachService] Cache write error:', error);
  }
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class CoachService {
  /**
   * Get user context for coach AI
   *
   * This aggregates all user data (learning plan, DNA, sessions, stats)
   * for personalized coaching.
   *
   * @param language - Target language (e.g., 'dutch', 'spanish')
   * @param forceRefresh - Bypass cache and fetch fresh data
   * @returns User context object
   */
  async getContext(language: string, forceRefresh = false): Promise<UserContext> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.context}${userId}_${language}`;

      // Check cache first
      if (!forceRefresh) {
        const cached = await getCachedData(cacheKey, CACHE_DURATIONS.context);
        if (cached) {
          return cached;
        }
      }

      console.log('[CoachService] Fetching user context...');

      const response = await axios.get<UserContext>(
        `${API_BASE_URL}${API_ENDPOINTS.CONTEXT}/${language}`,
        { headers: await getAuthHeaders() }
      );

      console.log('[CoachService] Context fetched:', {
        is_new_user: response.data.is_new_user,
        has_dna: response.data.has_dna_profile,
        streak: response.data.stats.current_streak,
      });

      // Cache the result
      await setCachedData(cacheKey, response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail: string }>;
        console.error('[CoachService] Context fetch error:', {
          status: axiosError.response?.status,
          detail: axiosError.response?.data?.detail,
        });
        throw new Error(axiosError.response?.data?.detail || 'Failed to get user context');
      }
      throw error;
    }
  }

  /**
   * Chat with AI coach
   *
   * @param language - Interface language (English, Turkish, etc.)
   * @param message - User's message
   * @param conversationHistory - Previous messages in conversation
   * @param targetLanguage - User's learning language (optional)
   * @returns AI response with rich messages and quick replies
   */
  async chat(
    language: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    targetLanguage?: string
  ): Promise<ChatResponse> {
    try {
      console.log('[CoachService] Sending message:', message);

      const response = await axios.post<ChatResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.CHAT}`,
        {
          language,
          message,
          conversation_history: conversationHistory,
          target_language: targetLanguage,
        },
        { headers: await getAuthHeaders() }
      );

      console.log('[CoachService] Response received:', {
        message_count: response.data.messages.length,
        quick_reply_count: response.data.quick_replies.length,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail: string }>;
        console.error('[CoachService] Chat error:', {
          status: axiosError.response?.status,
          detail: axiosError.response?.data?.detail,
        });
        throw new Error(axiosError.response?.data?.detail || 'Failed to chat with coach');
      }
      throw error;
    }
  }

  /**
   * Save conversation messages to cache
   * Persists for 24 hours across app restarts
   */
  async saveConversation(language: string, messages: any[]): Promise<void> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.conversation}${userId}_${language}`;
      await setCachedData(cacheKey, messages);
      console.log(`[CoachService] Conversation saved (${messages.length} messages)`);
    } catch (error) {
      console.error('[CoachService] Failed to save conversation:', error);
    }
  }

  /**
   * Load conversation messages from cache
   * Returns null if cache expired or not found
   */
  async loadConversation(language: string): Promise<any[] | null> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.conversation}${userId}_${language}`;
      const cached = await getCachedData(cacheKey, CACHE_DURATIONS.conversation);

      if (cached) {
        console.log(`[CoachService] Conversation loaded (${cached.length} messages)`);
        return cached;
      }

      console.log('[CoachService] No cached conversation found');
      return null;
    } catch (error) {
      console.error('[CoachService] Failed to load conversation:', error);
      return null;
    }
  }

  /**
   * Clear conversation cache
   * Useful when user wants to start fresh
   */
  async clearConversation(language: string): Promise<void> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.conversation}${userId}_${language}`;
      await AsyncStorage.removeItem(cacheKey);
      console.log('[CoachService] Conversation cache cleared');
    } catch (error) {
      console.error('[CoachService] Failed to clear conversation:', error);
    }
  }

  /**
   * Clear cached context (useful after completing a session)
   */
  async clearContextCache(language: string): Promise<void> {
    try {
      const userId = await getUserId();
      const cacheKey = `${CACHE_KEYS.context}${userId}_${language}`;
      await AsyncStorage.removeItem(cacheKey);
      console.log('[CoachService] Context cache cleared');
    } catch (error) {
      console.error('[CoachService] Failed to clear cache:', error);
    }
  }

  /**
   * Clear all coach caches
   */
  async clearAllCaches(language: string): Promise<void> {
    await Promise.all([
      this.clearContextCache(language),
      this.clearConversation(language),
    ]);
    console.log('[CoachService] All caches cleared');
  }
}

// Export singleton instance
export const coachService = new CoachService();
export default coachService;
