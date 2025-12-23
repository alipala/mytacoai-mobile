/**
 * useStats Hook
 *
 * React Hook for managing and fetching statistics.
 * Provides a simple interface for components to access stats data.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DailyStatsResponse,
  RecentPerformanceResponse,
  LifetimeProgressResponse,
  UnifiedStatsResponse,
  StatsState,
  StatsLayer,
} from '../types/stats';
import statsService from '../services/statsService';

interface UseStatsOptions {
  // Which layers to fetch
  layers?: StatsLayer[];
  // Auto-fetch on mount
  autoFetch?: boolean;
  // Days for recent performance
  recentDays?: number;
  // Include achievements in lifetime
  includeAchievements?: boolean;
  // Refetch interval (ms), 0 to disable
  refetchInterval?: number;
}

interface UseStatsReturn {
  // Data
  daily: DailyStatsResponse | null;
  recent: RecentPerformanceResponse | null;
  lifetime: LifetimeProgressResponse | null;

  // Loading states
  isLoading: boolean;
  isLoadingDaily: boolean;
  isLoadingRecent: boolean;
  isLoadingLifetime: boolean;

  // Error states
  error: Error | null;
  errors: {
    daily: Error | null;
    recent: Error | null;
    lifetime: Error | null;
  };

  // Actions
  refetch: (forceRefresh?: boolean) => Promise<void>;
  refetchDaily: (forceRefresh?: boolean) => Promise<void>;
  refetchRecent: (forceRefresh?: boolean) => Promise<void>;
  refetchLifetime: (forceRefresh?: boolean) => Promise<void>;
  clearCache: (layer?: StatsLayer) => Promise<void>;
}

export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const {
    layers = ['daily'],
    autoFetch = true,
    recentDays = 7,
    includeAchievements = false,
    refetchInterval = 0,
  } = options;

  // State
  const [state, setState] = useState<StatsState>({
    daily: null,
    recent: null,
    lifetime: null,
    loading: {
      daily: false,
      recent: false,
      lifetime: false,
    },
    errors: [],
    lastFetched: {
      daily: null,
      recent: null,
      lifetime: null,
    },
  });

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Update loading state for a layer
  const setLoading = useCallback((layer: StatsLayer, loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading: {
        ...prev.loading,
        [layer]: loading,
      },
    }));
  }, []);

  // Update data for a layer
  const setData = useCallback(
    (layer: StatsLayer, data: any) => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        [layer]: data,
        lastFetched: {
          ...prev.lastFetched,
          [layer]: new Date(),
        },
      }));
    },
    []
  );

  // Update error for a layer
  const setError = useCallback((layer: StatsLayer, error: Error | null) => {
    if (!mountedRef.current) return;

    setState((prev) => {
      const newErrors = prev.errors.filter((e) => e.layer !== layer);
      if (error) {
        newErrors.push({
          layer,
          message: error.message,
          timestamp: new Date(),
        });
      }
      return {
        ...prev,
        errors: newErrors,
      };
    });
  }, []);

  // Fetch daily stats
  const refetchDaily = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        setLoading('daily', true);
        setError('daily', null);
        const data = await statsService.fetchDailyStats(forceRefresh);
        setData('daily', data);
      } catch (error) {
        console.error('[useStats] Failed to fetch daily stats:', error);
        setError('daily', error as Error);
      } finally {
        setLoading('daily', false);
      }
    },
    [setLoading, setData, setError]
  );

  // Fetch recent performance
  const refetchRecent = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        setLoading('recent', true);
        setError('recent', null);
        const data = await statsService.fetchRecentPerformance(
          recentDays,
          forceRefresh
        );
        setData('recent', data);
      } catch (error) {
        console.error('[useStats] Failed to fetch recent performance:', error);
        setError('recent', error as Error);
      } finally {
        setLoading('recent', false);
      }
    },
    [recentDays, setLoading, setData, setError]
  );

  // Fetch lifetime progress
  const refetchLifetime = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        setLoading('lifetime', true);
        setError('lifetime', null);
        const data = await statsService.fetchLifetimeProgress(
          includeAchievements,
          forceRefresh
        );
        setData('lifetime', data);
      } catch (error) {
        console.error('[useStats] Failed to fetch lifetime progress:', error);
        setError('lifetime', error as Error);
      } finally {
        setLoading('lifetime', false);
      }
    },
    [includeAchievements, setLoading, setData, setError]
  );

  // Fetch all layers
  const refetch = useCallback(
    async (forceRefresh: boolean = false) => {
      const promises: Promise<void>[] = [];

      if (layers.includes('daily') || layers.includes('all')) {
        promises.push(refetchDaily(forceRefresh));
      }
      if (layers.includes('recent') || layers.includes('all')) {
        promises.push(refetchRecent(forceRefresh));
      }
      if (layers.includes('lifetime') || layers.includes('all')) {
        promises.push(refetchLifetime(forceRefresh));
      }

      await Promise.all(promises);
    },
    [layers, refetchDaily, refetchRecent, refetchLifetime]
  );

  // Clear cache
  const clearCache = useCallback(async (layer?: StatsLayer) => {
    try {
      await statsService.invalidateCache(layer || 'all');
      console.log(`[useStats] Cache cleared for ${layer || 'all'}`);
    } catch (error) {
      console.error('[useStats] Failed to clear cache:', error);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refetch(false);
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Run once on mount

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        console.log('[useStats] Auto-refetching stats...');
        refetch(false);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, refetch]);

  // Computed values
  const isLoading =
    state.loading.daily || state.loading.recent || state.loading.lifetime;

  const error = state.errors.length > 0 ? new Error(state.errors[0].message) : null;

  const errors = {
    daily: state.errors.find((e) => e.layer === 'daily')
      ? new Error(state.errors.find((e) => e.layer === 'daily')!.message)
      : null,
    recent: state.errors.find((e) => e.layer === 'recent')
      ? new Error(state.errors.find((e) => e.layer === 'recent')!.message)
      : null,
    lifetime: state.errors.find((e) => e.layer === 'lifetime')
      ? new Error(state.errors.find((e) => e.layer === 'lifetime')!.message)
      : null,
  };

  return {
    // Data
    daily: state.daily,
    recent: state.recent,
    lifetime: state.lifetime,

    // Loading states
    isLoading,
    isLoadingDaily: state.loading.daily,
    isLoadingRecent: state.loading.recent,
    isLoadingLifetime: state.loading.lifetime,

    // Error states
    error,
    errors,

    // Actions
    refetch,
    refetchDaily,
    refetchRecent,
    refetchLifetime,
    clearCache,
  };
}

/**
 * Specialized hook for daily stats only (optimized for Today's Progress Card)
 */
export function useDailyStats(autoFetch: boolean = true) {
  return useStats({
    layers: ['daily'],
    autoFetch,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

/**
 * Specialized hook for recent performance (optimized for trend charts)
 */
export function useRecentPerformance(days: number = 7, autoFetch: boolean = true) {
  return useStats({
    layers: ['recent'],
    autoFetch,
    recentDays: days,
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });
}

/**
 * Specialized hook for lifetime progress (optimized for profile screen)
 */
export function useLifetimeProgress(
  includeAchievements: boolean = false,
  autoFetch: boolean = true
) {
  return useStats({
    layers: ['lifetime'],
    autoFetch,
    includeAchievements,
    refetchInterval: 0, // No auto-refresh
  });
}

export default useStats;
