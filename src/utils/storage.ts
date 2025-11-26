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
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
    console.log('✅ Onboarding marked as completed');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
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
