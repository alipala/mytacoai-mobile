import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// SMART CLIENT CACHE SERVICE
// ============================================================================
// Event-driven caching system with TTL-based expiration and manual invalidation
// Designed to reduce API calls by 90% at 1,000 users without infrastructure cost
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
}

// Cache configuration with TTL for each data type
export const CACHE_CONFIG: Record<string, CacheConfig> = {
  learning_plans: { key: 'cache:learning_plans', ttl: 10 * 60 * 1000 }, // 10 minutes
  progress_stats: { key: 'cache:progress_stats', ttl: 3 * 60 * 1000 },  // 3 minutes
  subscription_status: { key: 'cache:subscription_status', ttl: 15 * 60 * 1000 }, // 15 minutes
  notifications: { key: 'cache:notifications', ttl: 1 * 60 * 1000 },    // 1 minute
  hearts_status: { key: 'cache:hearts_status', ttl: 2 * 60 * 1000 },    // 2 minutes
  conversations: { key: 'cache:conversations', ttl: 5 * 60 * 1000 },    // 5 minutes
  recent_performance: { key: 'cache:recent_performance', ttl: 5 * 60 * 1000 }, // 5 minutes
  daily_stats: { key: 'cache:daily_stats', ttl: 5 * 60 * 1000 },        // 5 minutes
  lifetime_stats: { key: 'cache:lifetime_stats', ttl: 60 * 60 * 1000 }, // 60 minutes
};

// Dynamic cache keys for language-specific data
export const getDNACacheKey = (language: string): CacheConfig => ({
  key: `cache:dna_profile_${language}`,
  ttl: 5 * 60 * 1000, // 5 minutes
});

export const getConversationsCacheKey = (limit: number): CacheConfig => ({
  key: `cache:conversations_${limit}`,
  ttl: 5 * 60 * 1000, // 5 minutes
});

// ============================================================================
// CACHE EVENT EMITTER (React Native Compatible)
// ============================================================================
// Simple event emitter implementation for React Native (no Node dependencies)
// Events: session_completed, subscription_changed, app_foreground
// ============================================================================

class CacheEventEmitter {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[CacheEvents] Error in ${event} listener:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

export const cacheEvents = new CacheEventEmitter();

// ============================================================================
// SMART CACHE CLASS
// ============================================================================

class SmartCache {
  private version: number = 1;
  private debugMode: boolean = __DEV__;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Session completed - invalidate learning progress, stats, DNA
    cacheEvents.on('session_completed', async () => {
      if (this.debugMode) console.log('[SmartCache] session_completed event');
      await this.invalidateMultiple([
        'learning_plans',
        'progress_stats',
        'conversations',
        'recent_performance',
        'daily_stats',
      ]);
      // Invalidate all DNA profiles (all languages)
      await this.invalidateByPattern('cache:dna_profile_');
    });

    // Subscription changed - invalidate subscription and hearts
    cacheEvents.on('subscription_changed', async () => {
      if (this.debugMode) console.log('[SmartCache] subscription_changed event');
      await this.invalidateMultiple([
        'subscription_status',
        'hearts_status',
      ]);
    });

    // App came to foreground - invalidate all caches for fresh data
    cacheEvents.on('app_foreground', async () => {
      if (this.debugMode) console.log('[SmartCache] app_foreground event');
      await this.invalidateAll();
    });

    // Hearts consumed - invalidate hearts status
    cacheEvents.on('hearts_consumed', async () => {
      if (this.debugMode) console.log('[SmartCache] hearts_consumed event');
      await this.invalidate('hearts_status');
    });
  }

  /**
   * Get cached data or execute fetcher function if cache is stale/missing
   */
  async get<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> {
    try {
      // Determine cache configuration
      const cacheConfig = config || CACHE_CONFIG[cacheKey];
      if (!cacheConfig) {
        if (this.debugMode) {
          console.warn(`[SmartCache] No config found for key: ${cacheKey}, fetching without cache`);
        }
        return await fetcher();
      }

      const storageKey = cacheConfig.key;

      // Try to get from cache
      const cachedString = await AsyncStorage.getItem(storageKey);

      if (cachedString) {
        const cached: CacheEntry<T> = JSON.parse(cachedString);
        const now = Date.now();
        const age = now - cached.timestamp;

        // Check if cache is still valid
        if (age < cacheConfig.ttl && cached.version === this.version) {
          if (this.debugMode) {
            console.log(`[SmartCache] HIT: ${cacheKey} (age: ${Math.round(age / 1000)}s / ${Math.round(cacheConfig.ttl / 1000)}s)`);
          }
          return cached.data;
        } else {
          if (this.debugMode) {
            const reason = cached.version !== this.version ? 'version mismatch' : 'expired';
            console.log(`[SmartCache] STALE: ${cacheKey} (${reason})`);
          }
        }
      } else {
        if (this.debugMode) {
          console.log(`[SmartCache] MISS: ${cacheKey}`);
        }
      }

      // Cache miss or stale - fetch fresh data
      const data = await fetcher();

      // Store in cache
      await this.set(storageKey, data);

      return data;
    } catch (error) {
      if (this.debugMode) {
        console.error(`[SmartCache] Error getting cache for ${cacheKey}:`, error);
      }
      // On error, always fetch fresh data
      return await fetcher();
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(storageKey: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
      if (this.debugMode) {
        console.log(`[SmartCache] SET: ${storageKey}`);
      }
    } catch (error) {
      if (this.debugMode) {
        console.error(`[SmartCache] Error setting cache for ${storageKey}:`, error);
      }
    }
  }

  /**
   * Invalidate a single cache entry by key
   */
  async invalidate(cacheKey: string): Promise<void> {
    try {
      const config = CACHE_CONFIG[cacheKey];
      if (config) {
        await AsyncStorage.removeItem(config.key);
        if (this.debugMode) {
          console.log(`[SmartCache] INVALIDATE: ${cacheKey}`);
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.error(`[SmartCache] Error invalidating ${cacheKey}:`, error);
      }
    }
  }

  /**
   * Invalidate multiple cache entries
   */
  async invalidateMultiple(cacheKeys: string[]): Promise<void> {
    try {
      const keysToRemove = cacheKeys
        .map(key => CACHE_CONFIG[key]?.key)
        .filter(Boolean);

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        if (this.debugMode) {
          console.log(`[SmartCache] INVALIDATE MULTIPLE: ${cacheKeys.join(', ')}`);
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.error('[SmartCache] Error invalidating multiple caches:', error);
      }
    }
  }

  /**
   * Invalidate all cache entries matching a pattern (e.g., "cache:dna_profile_")
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const matchingKeys = allKeys.filter(key => key.startsWith(pattern));

      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
        if (this.debugMode) {
          console.log(`[SmartCache] INVALIDATE PATTERN: ${pattern} (${matchingKeys.length} keys)`);
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.error(`[SmartCache] Error invalidating pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * Invalidate all caches
   */
  async invalidateAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        if (this.debugMode) {
          console.log(`[SmartCache] INVALIDATE ALL (${cacheKeys.length} keys)`);
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.error('[SmartCache] Error invalidating all caches:', error);
      }
    }
  }

  /**
   * Get cache statistics for debugging
   */
  async getStats(): Promise<{
    totalCaches: number;
    cacheKeys: string[];
    sizes: Record<string, number>;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));

      const sizes: Record<string, number> = {};
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          sizes[key] = new Blob([value]).size;
        }
      }

      return {
        totalCaches: cacheKeys.length,
        cacheKeys,
        sizes,
      };
    } catch (error) {
      console.error('[SmartCache] Error getting stats:', error);
      return { totalCaches: 0, cacheKeys: [], sizes: {} };
    }
  }

  /**
   * Clear all caches and reset version (for debugging)
   */
  async clearAll(): Promise<void> {
    await this.invalidateAll();
    this.version++;
    if (this.debugMode) {
      console.log(`[SmartCache] CLEAR ALL - version bumped to ${this.version}`);
    }
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const smartCache = new SmartCache();

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Log cache statistics to console
 */
export async function logCacheStats(): Promise<void> {
  const stats = await smartCache.getStats();
  console.log('=== SMART CACHE STATISTICS ===');
  console.log(`Total cached entries: ${stats.totalCaches}`);
  console.log('\nCache sizes:');
  Object.entries(stats.sizes).forEach(([key, size]) => {
    console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB`);
  });
  console.log('==============================');
}

/**
 * Clear all caches (useful for testing)
 */
export async function clearAllCaches(): Promise<void> {
  await smartCache.clearAll();
  console.log('[SmartCache] All caches cleared');
}
