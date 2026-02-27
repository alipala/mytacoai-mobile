/**
 * Statistics Service
 *
 * Handles all API calls for gamification statistics.
 * Provides caching and error handling.
 */

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import {
  DailyStatsResponse,
  RecentPerformanceResponse,
  LifetimeProgressResponse,
  UnifiedStatsResponse,
  StatsLayer,
} from '../types/stats';

// Get API base URL from config
import { API_BASE_URL } from '../config/api';

/**
 * Get user ID for cache key (to make cache user-specific)
 */
async function getUserId(): Promise<string> {
  try {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const userId = user.id || user._id || 'unknown';
      return userId;
    }
    return 'unknown';
  } catch (error) {
    console.error('[StatsService] Failed to get user ID:', error);
    return 'unknown';
  }
}

// Cache keys (will be prefixed with user ID)
const CACHE_KEYS = {
  daily: 'stats_daily_',
  recent: 'stats_recent_',
  lifetime: 'stats_lifetime_',
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  daily: 5 * 60 * 1000, // 5 minutes
  recent: 15 * 60 * 1000, // 15 minutes
  lifetime: 60 * 60 * 1000, // 1 hour
};

/**
 * Get user's timezone from device
 */
function getUserTimezone(): string {
  try {
    return Localization.timezone || 'UTC';
  } catch (error) {
    console.warn('[StatsService] Could not get timezone:', error);
    return 'UTC';
  }
}

/**
 * Get auth token from storage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Try both possible key names for compatibility
    let token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      token = await AsyncStorage.getItem('authToken');
    }
    return token;
  } catch (error) {
    console.error('[StatsService] Failed to get auth token:', error);
    return null;
  }
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cachedAt: string, duration: number): boolean {
  const cacheTime = new Date(cachedAt).getTime();
  const now = Date.now();
  return now - cacheTime < duration;
}

/**
 * Get cached data from AsyncStorage
 */
async function getCachedData<T>(
  cacheKey: string,
  duration: number
): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed.cachedAt || !isCacheValid(parsed.cachedAt, duration)) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.data as T;
  } catch (error) {
    console.warn('[StatsService] Cache read error:', error);
    return null;
  }
}

/**
 * Set cached data in AsyncStorage
 */
async function setCachedData<T>(cacheKey: string, data: T): Promise<void> {
  try {
    const cached = {
      data,
      cachedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (error) {
    console.warn('[StatsService] Cache write error:', error);
  }
}

/**
 * Invalidate cache for a specific layer
 */
export async function invalidateCache(layer: StatsLayer): Promise<void> {
  try {
    const timezone = getUserTimezone();
    const userId = await getUserId();
    const cacheKey =
      layer === 'all'
        ? null
        : `${CACHE_KEYS[layer]}${userId}_${timezone}`;

    if (cacheKey) {
      await AsyncStorage.removeItem(cacheKey);
      console.log(`[StatsService] Invalidated cache for ${layer}`);
    } else {
      // Invalidate all - get all keys and remove stats-related ones
      const allKeys = await AsyncStorage.getAllKeys();
      const statsKeys = allKeys.filter(
        key =>
          key.startsWith('stats_daily_') ||
          key.startsWith('stats_recent_') ||
          key.startsWith('stats_lifetime_')
      );
      if (statsKeys.length > 0) {
        await AsyncStorage.multiRemove(statsKeys);
        console.log(`[StatsService] Invalidated ${statsKeys.length} cached stats`);
      }
    }
  } catch (error) {
    console.error('[StatsService] Cache invalidation error:', error);
  }
}

/**
 * Clear all old stats cache (for migration/cleanup)
 */
export async function clearAllStatsCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const statsKeys = allKeys.filter(
      key =>
        key.startsWith('stats_daily_') ||
        key.startsWith('stats_recent_') ||
        key.startsWith('stats_lifetime_')
    );
    if (statsKeys.length > 0) {
      await AsyncStorage.multiRemove(statsKeys);
      console.log(`[StatsService] Cleared ${statsKeys.length} old cache entries`);
    }
  } catch (error) {
    console.error('[StatsService] Failed to clear cache:', error);
  }
}

/**
 * Fetch daily statistics
 */
export async function fetchDailyStats(
  forceRefresh: boolean = false
): Promise<DailyStatsResponse> {
  const timezone = getUserTimezone();
  const userId = await getUserId();
  const cacheKey = `${CACHE_KEYS.daily}${userId}_${timezone}`;

  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await getCachedData<DailyStatsResponse>(
        cacheKey,
        CACHE_DURATIONS.daily
      );
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('[StatsService] Fetching daily stats from API...');
    const response = await axios.get<DailyStatsResponse>(
      `${API_BASE_URL}/api/stats/daily`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          timezone,
        },
      }
    );

    // Cache the result
    await setCachedData(cacheKey, response.data);

    return response.data;
  } catch (error) {
    console.error('[StatsService] Failed to fetch daily stats:', error);
    throw handleStatsError(error, 'daily');
  }
}

/**
 * Fetch recent performance (7-day rolling window)
 */
export async function fetchRecentPerformance(
  days: number = 7,
  forceRefresh: boolean = false
): Promise<RecentPerformanceResponse> {
  const timezone = getUserTimezone();
  const userId = await getUserId();
  const cacheKey = `${CACHE_KEYS.recent}${userId}_${timezone}_${days}`;

  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await getCachedData<RecentPerformanceResponse>(
        cacheKey,
        CACHE_DURATIONS.recent
      );
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('[StatsService] Fetching recent performance from API...');
    const response = await axios.get<RecentPerformanceResponse>(
      `${API_BASE_URL}/api/stats/recent`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          timezone,
          days,
        },
      }
    );

    console.log(`[StatsService] ✅ API Response: ${response.data.summary.total_challenges} challenges`);
    console.log(`[StatsService] Daily breakdown has ${response.data.daily_breakdown.length} days`);
    response.data.daily_breakdown.forEach((day: any) => {
      if (day.challenges > 0) {
        console.log(`[StatsService]   ${day.date}: ${day.challenges} challenges`);
      }
    });

    // Cache the result
    await setCachedData(cacheKey, response.data);

    return response.data;
  } catch (error) {
    console.error('[StatsService] Failed to fetch recent performance:', error);
    throw handleStatsError(error, 'recent');
  }
}

/**
 * Fetch lifetime progress
 */
export async function fetchLifetimeProgress(
  includeAchievements: boolean = false,
  forceRefresh: boolean = false
): Promise<LifetimeProgressResponse> {
  const timezone = getUserTimezone();
  const userId = await getUserId();
  const cacheKey = `${CACHE_KEYS.lifetime}${userId}_${timezone}_${includeAchievements}`;

  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await getCachedData<LifetimeProgressResponse>(
        cacheKey,
        CACHE_DURATIONS.lifetime
      );
      if (cached) {
        return cached;
      }
    }

    // Fetch from API
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('[StatsService] Fetching lifetime progress from API...');
    const response = await axios.get<LifetimeProgressResponse>(
      `${API_BASE_URL}/api/stats/lifetime`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          include_achievements: includeAchievements,
        },
      }
    );

    // Cache the result
    await setCachedData(cacheKey, response.data);

    return response.data;
  } catch (error) {
    console.error('[StatsService] Failed to fetch lifetime progress:', error);
    throw handleStatsError(error, 'lifetime');
  }
}

/**
 * Fetch all statistics at once (unified endpoint)
 * Recommended for app launch to minimize network requests
 */
export async function fetchAllStats(
  days: number = 7,
  includeAchievements: boolean = false,
  forceRefresh: boolean = false
): Promise<UnifiedStatsResponse> {
  const timezone = getUserTimezone();
  const cacheKey = `${CACHE_KEYS.daily}all_${timezone}_${days}_${includeAchievements}`;

  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await getCachedData<UnifiedStatsResponse>(
        cacheKey,
        CACHE_DURATIONS.daily // Use shortest cache duration
      );
      if (cached) {
        console.log('[StatsService] Unified stats from cache');
        return cached;
      }
    }

    // Fetch from API
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    console.log('[StatsService] Fetching unified stats from API...');
    const response = await axios.get<UnifiedStatsResponse>(
      `${API_BASE_URL}/api/stats/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          timezone,
          days,
          include_achievements: includeAchievements,
        },
      }
    );

    // Cache the result
    await setCachedData(cacheKey, response.data);

    // Also cache individual layers
    await setCachedData(`${CACHE_KEYS.daily}${timezone}`, response.data.daily);
    await setCachedData(
      `${CACHE_KEYS.recent}${timezone}_${days}`,
      response.data.recent
    );
    await setCachedData(
      `${CACHE_KEYS.lifetime}${timezone}_${includeAchievements}`,
      response.data.lifetime
    );

    return response.data;
  } catch (error) {
    console.error('[StatsService] Failed to fetch unified stats:', error);
    throw handleStatsError(error, 'all');
  }
}

/**
 * Handle API errors and provide meaningful messages
 */
function handleStatsError(error: unknown, layer: StatsLayer): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Server responded with error
      const status = axiosError.response.status;
      const message =
        (axiosError.response.data as any)?.detail || axiosError.message;

      if (status === 401) {
        return new Error('Authentication required. Please log in again.');
      } else if (status === 404) {
        return new Error(`Statistics not found for ${layer} layer.`);
      } else if (status === 500) {
        return new Error(`Server error while fetching ${layer} statistics.`);
      } else {
        return new Error(`Failed to fetch ${layer} statistics: ${message}`);
      }
    } else if (axiosError.request) {
      // Request made but no response
      return new Error(
        'Network error. Please check your internet connection.'
      );
    }
  }

  // Unknown error
  return new Error(`Unexpected error fetching ${layer} statistics.`);
}

/**
 * Refresh stats after completing a challenge session
 * This invalidates caches and optionally refetches data
 */
export async function refreshStatsAfterSession(
  autoFetch: boolean = true
): Promise<void> {
  try {
    console.log('[StatsService] Refreshing stats after session completion...');

    // Invalidate all caches
    await invalidateCache('all');

    // Optionally refetch daily stats immediately
    if (autoFetch) {
      await fetchDailyStats(true);
    }

    console.log('[StatsService] Stats refresh complete');
  } catch (error) {
    console.error('[StatsService] Failed to refresh stats:', error);
  }
}

export default {
  fetchDailyStats,
  fetchRecentPerformance,
  fetchLifetimeProgress,
  fetchAllStats,
  invalidateCache,
  clearAllStatsCache,
  refreshStatsAfterSession,
};
