import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@hasSeenOnboarding';

export const onboardingStorage = {
  // Check if user has seen onboarding
  hasSeenOnboarding: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading onboarding status:', error);
      return false;
    }
  },

  // Mark onboarding as completed
  completeOnboarding: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  // Reset onboarding (for testing)
  resetOnboarding: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  },
};
