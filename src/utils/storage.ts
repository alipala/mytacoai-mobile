/**
 * AsyncStorage Utility Helpers
 *
 * Centralized storage management for the MyTaco AI app.
 * Handles onboarding state and other app-level preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
  LAST_ONBOARDING_SCREEN: 'lastOnboardingScreen',
} as const;

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    console.log('🔵 [Storage] Checking onboarding status...');
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    const isCompleted = value === 'true';
    console.log(`📱 [Storage] Onboarding status - Raw value: "${value}", Is completed: ${isCompleted}`);
    return isCompleted;
  } catch (error) {
    console.error('❌ [Storage] Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    console.log('🔵 [Storage] Setting onboarding completed...');
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');

    // Verify it was saved
    const verification = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    console.log('✅ [Storage] Onboarding marked as completed, verified:', verification);
  } catch (error) {
    console.error('❌ [Storage] Error setting onboarding status:', error);
    throw error;
  }
};

/**
 * Reset onboarding status (for testing/debugging)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_ONBOARDING_SCREEN);
    console.log('🔄 Onboarding status reset');
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
};

/**
 * Save last viewed onboarding screen (optional - for resuming)
 */
export const saveLastOnboardingScreen = async (index: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ONBOARDING_SCREEN, index.toString());
  } catch (error) {
    console.error('Error saving last onboarding screen:', error);
  }
};

/**
 * Get last viewed onboarding screen
 */
export const getLastOnboardingScreen = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ONBOARDING_SCREEN);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting last onboarding screen:', error);
    return 0;
  }
};

/**
 * Debug utility - Log all onboarding-related storage values
 */
export const debugOnboardingStorage = async (): Promise<void> => {
  try {
    console.log('🔍 [Debug] === Onboarding Storage Debug ===');
    const hasCompleted = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    const lastScreen = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ONBOARDING_SCREEN);
    console.log(`  HAS_COMPLETED_ONBOARDING: "${hasCompleted}"`);
    console.log(`  LAST_ONBOARDING_SCREEN: "${lastScreen}"`);
    console.log('🔍 [Debug] === End Debug ===');
  } catch (error) {
    console.error('❌ [Debug] Error reading storage:', error);
  }
};
