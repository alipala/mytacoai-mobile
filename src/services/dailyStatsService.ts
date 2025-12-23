/**
 * Daily Stats Service
 *
 * Tracks and calculates user's daily challenge statistics
 * - Challenges completed today
 * - Accuracy rate
 * - Current streak
 * - Category-specific performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTodayCompletions } from './completionTracker';

export interface DailyStats {
  challengesCompletedToday: number;
  correctToday: number;
  incorrectToday: number;
  accuracyToday: number;
  currentStreak: number;
  lastPracticeDate: string;
}

export interface CategoryStats {
  completed: number;
  total: number;
  accuracy: number;
  lastPracticed?: string;
}

const DAILY_STATS_KEY = 'daily_challenge_stats';
const STREAK_KEY = 'challenge_streak';
const CATEGORY_STATS_KEY = 'category_stats';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Load daily stats from storage
 */
export async function loadDailyStats(): Promise<DailyStats> {
  try {
    const today = getTodayDateString();
    const statsJson = await AsyncStorage.getItem(DAILY_STATS_KEY);
    const streakJson = await AsyncStorage.getItem(STREAK_KEY);

    if (statsJson) {
      const stats = JSON.parse(statsJson);

      // Reset if it's a new day
      if (stats.lastPracticeDate !== today) {
        // Check if streak should continue
        const daysSinceLastPractice = daysBetween(stats.lastPracticeDate, today);
        const newStreak = daysSinceLastPractice === 1 ? stats.currentStreak : 0;

        return {
          challengesCompletedToday: 0,
          correctToday: 0,
          incorrectToday: 0,
          accuracyToday: 0,
          currentStreak: newStreak,
          lastPracticeDate: today,
        };
      }

      return stats;
    }

    // No stats yet - first time
    return {
      challengesCompletedToday: 0,
      correctToday: 0,
      incorrectToday: 0,
      accuracyToday: 0,
      currentStreak: 0,
      lastPracticeDate: today,
    };
  } catch (error) {
    console.error('❌ Error loading daily stats:', error);
    return {
      challengesCompletedToday: 0,
      correctToday: 0,
      incorrectToday: 0,
      accuracyToday: 0,
      currentStreak: 0,
      lastPracticeDate: getTodayDateString(),
    };
  }
}

/**
 * Update daily stats after completing a challenge
 */
export async function updateDailyStats(isCorrect: boolean): Promise<DailyStats> {
  try {
    const stats = await loadDailyStats();
    const today = getTodayDateString();

    // Check if we're continuing a streak
    if (stats.lastPracticeDate !== today) {
      const daysSinceLastPractice = daysBetween(stats.lastPracticeDate, today);
      if (daysSinceLastPractice === 1) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1; // Reset streak
      }
    } else if (stats.challengesCompletedToday === 0) {
      // First challenge of the day
      stats.currentStreak += 1;
    }

    // Update stats
    stats.challengesCompletedToday += 1;
    if (isCorrect) {
      stats.correctToday += 1;
    } else {
      stats.incorrectToday += 1;
    }

    // Recalculate accuracy
    const total = stats.correctToday + stats.incorrectToday;
    stats.accuracyToday = total > 0 ? (stats.correctToday / total) * 100 : 0;
    stats.lastPracticeDate = today;

    // Save to storage
    await AsyncStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));

    console.log('✅ Daily stats updated:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error updating daily stats:', error);
    throw error;
  }
}

/**
 * Get category-specific stats
 */
export async function getCategoryStats(
  language: string,
  level: string,
  categoryType: string
): Promise<CategoryStats> {
  try {
    const key = `${CATEGORY_STATS_KEY}_${language}_${level}_${categoryType}`;
    const statsJson = await AsyncStorage.getItem(key);

    if (statsJson) {
      return JSON.parse(statsJson);
    }

    return {
      completed: 0,
      total: 0,
      accuracy: 0,
    };
  } catch (error) {
    console.error('❌ Error loading category stats:', error);
    return {
      completed: 0,
      total: 0,
      accuracy: 0,
    };
  }
}

/**
 * Update category stats after completing a challenge
 */
export async function updateCategoryStats(
  language: string,
  level: string,
  categoryType: string,
  isCorrect: boolean,
  total: number
): Promise<void> {
  try {
    const key = `${CATEGORY_STATS_KEY}_${language}_${level}_${categoryType}`;
    const stats = await getCategoryStats(language, level, categoryType);

    stats.completed += 1;
    stats.total = total;

    // Update accuracy (weighted average)
    const previousCorrect = (stats.accuracy / 100) * (stats.completed - 1);
    const newCorrect = previousCorrect + (isCorrect ? 1 : 0);
    stats.accuracy = (newCorrect / stats.completed) * 100;
    stats.lastPracticed = getTodayDateString();

    await AsyncStorage.setItem(key, JSON.stringify(stats));
    console.log(`✅ Category stats updated for ${categoryType}:`, stats);
  } catch (error) {
    console.error('❌ Error updating category stats:', error);
  }
}

/**
 * Get all category stats for a language/level
 */
export async function getAllCategoryStats(
  language: string,
  level: string,
  categories: string[]
): Promise<Record<string, CategoryStats>> {
  try {
    const statsPromises = categories.map(async (category) => {
      const stats = await getCategoryStats(language, level, category);
      return { category, stats };
    });

    const results = await Promise.all(statsPromises);
    const categoryStats: Record<string, CategoryStats> = {};

    results.forEach(({ category, stats }) => {
      categoryStats[category] = stats;
    });

    return categoryStats;
  } catch (error) {
    console.error('❌ Error loading all category stats:', error);
    return {};
  }
}

/**
 * Reset daily stats (for testing or new day)
 */
export async function resetDailyStats(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DAILY_STATS_KEY);
    console.log('🗑️ Daily stats reset');
  } catch (error) {
    console.error('❌ Error resetting daily stats:', error);
  }
}

/**
 * Clear all old stats data (for migration cleanup)
 */
export async function clearAllOldStats(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DAILY_STATS_KEY);
    await AsyncStorage.removeItem(STREAK_KEY);

    // Clear all category stats
    const keys = await AsyncStorage.getAllKeys();
    const categoryKeys = keys.filter(key => key.startsWith(CATEGORY_STATS_KEY));
    if (categoryKeys.length > 0) {
      await AsyncStorage.multiRemove(categoryKeys);
    }

    console.log('🗑️ All old stats cleared');
  } catch (error) {
    console.error('❌ Error clearing old stats:', error);
  }
}
