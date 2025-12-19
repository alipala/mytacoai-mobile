/**
 * Sound Service
 *
 * Handles all audio feedback in the app for an immersive gaming experience
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sound types
export type SoundType =
  | 'correct'
  | 'wrong'
  | 'timeout'
  | 'tick'
  | 'complete'
  | 'tap'
  | 'swoosh'
  | 'confetti';

// Sound settings key
const SOUND_ENABLED_KEY = 'sound_enabled';

// Sound file mappings
const SOUND_FILES: Record<SoundType, any> = {
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  timeout: require('../../assets/sounds/timeout.mp3'),
  tick: require('../../assets/sounds/tick.mp3'),
  complete: require('../../assets/sounds/complete.mp3'),
  tap: require('../../assets/sounds/tap.mp3'),
  swoosh: require('../../assets/sounds/swoosh.mp3'),
  confetti: require('../../assets/sounds/confetti.mp3'),
};

class SoundService {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  /**
   * Initialize the sound service and load all sounds
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode for gaming
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load sound preferences
      const enabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      this.isEnabled = enabled !== 'false'; // Enabled by default

      this.isInitialized = true;
      console.log('🔊 Sound Service initialized');
    } catch (error) {
      console.error('❌ Error initializing sound service:', error);
    }
  }

  /**
   * Play a sound effect
   */
  async play(type: SoundType): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Get the sound file for this type
      const soundFile = SOUND_FILES[type];

      if (!soundFile) {
        // Silently skip if sound file doesn't exist
        return;
      }

      // Create and play the sound
      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        {
          shouldPlay: true,
          volume: this.getVolume(type),
        }
      );

      // Auto-unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Silently skip sound playback errors (file might not exist)
      // Only log in development
      if (__DEV__) {
        console.log(`⚠️ Sound ${type} not available (file may not exist)`);
      }
    }
  }

  /**
   * Get volume level for each sound type
   */
  private getVolume(type: SoundType): number {
    switch (type) {
      case 'tick':
        return 0.3; // Quieter for repetitive countdown
      case 'tap':
        return 0.2; // Very subtle
      case 'correct':
      case 'complete':
      case 'confetti':
        return 0.7; // Louder for celebrations
      case 'wrong':
      case 'timeout':
        return 0.5; // Medium for errors
      case 'swoosh':
        return 0.4; // Subtle transition
      default:
        return 0.5;
    }
  }

  /**
   * Enable or disable sound
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
    console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if sound is enabled
   */
  isEnabledSound(): boolean {
    return this.isEnabled;
  }

  /**
   * Cleanup all loaded sounds
   */
  async cleanup(): Promise<void> {
    try {
      for (const [type, sound] of this.sounds.entries()) {
        await sound.unloadAsync();
      }
      this.sounds.clear();
      console.log('🔊 Sound Service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up sounds:', error);
    }
  }
}

// Export singleton instance
export const soundService = new SoundService();

/**
 * Hook to use sound service in components
 */
export const useSound = () => {
  return {
    playSound: (type: SoundType) => soundService.play(type),
    setSoundEnabled: (enabled: boolean) => soundService.setEnabled(enabled),
    isSoundEnabled: () => soundService.isEnabledSound(),
  };
};

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Add MP3 sound files to /assets/sounds/:
 *    - correct.mp3    - Success/correct answer sound
 *    - wrong.mp3      - Error/wrong answer sound
 *    - timeout.mp3    - Time's up sound
 *    - tick.mp3       - Countdown tick sound
 *    - complete.mp3   - Challenge completion sound
 *    - tap.mp3        - Button tap sound
 *    - swoosh.mp3     - Page transition sound
 *    - confetti.mp3   - Celebration sound
 *
 * 2. The service will silently skip playback if files don't exist
 *
 * 3. Use in components:
 *    import { soundService } from '../services/soundService';
 *    soundService.play('correct');
 */
