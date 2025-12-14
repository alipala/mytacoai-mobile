/**
 * Challenge Completion Tracker
 *
 * Tracks daily challenge completions in AsyncStorage
 * Resets automatically at midnight
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'completed_challenges_';

/**
 * Get today's date key (YYYY-MM-DD format)
 */
function getTodayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${STORAGE_KEY_PREFIX}${year}_${month}_${day}`;
}

/**
 * Load completed challenges for today
 */
export async function loadTodayCompletions(): Promise<Set<string>> {
  try {
    const key = getTodayKey();
    const data = await AsyncStorage.getItem(key);

    if (data) {
      const completed = JSON.parse(data) as string[];
      console.log(`📋 Loaded ${completed.length} completed challenges for today`);
      return new Set(completed);
    }

    return new Set();
  } catch (error) {
    console.error('❌ Failed to load completions:', error);
    return new Set();
  }
}

/**
 * Mark a challenge as completed today
 */
export async function markChallengeCompleted(challengeId: string): Promise<void> {
  try {
    const key = getTodayKey();
    const completions = await loadTodayCompletions();

    completions.add(challengeId);

    await AsyncStorage.setItem(key, JSON.stringify(Array.from(completions)));
    console.log(`✅ Marked challenge ${challengeId} as completed today`);
  } catch (error) {
    console.error('❌ Failed to save completion:', error);
  }
}

/**
 * Check if a challenge is completed today
 */
export async function isChallengeCompletedToday(challengeId: string): Promise<boolean> {
  const completions = await loadTodayCompletions();
  return completions.has(challengeId);
}

/**
 * Get completion count for today
 */
export async function getTodayCompletionCount(): Promise<number> {
  const completions = await loadTodayCompletions();
  return completions.size;
}

/**
 * Clear old completion data (call on app start to cleanup)
 */
export async function cleanupOldCompletions(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const completionKeys = allKeys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));
    const todayKey = getTodayKey();

    // Remove all completion keys except today's
    const oldKeys = completionKeys.filter(key => key !== todayKey);

    if (oldKeys.length > 0) {
      await AsyncStorage.multiRemove(oldKeys);
      console.log(`🗑️ Cleaned up ${oldKeys.length} old completion records`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup old completions:', error);
  }
}
