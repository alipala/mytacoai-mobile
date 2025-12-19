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

      // Preload sounds for instant playback
      await this.preloadSounds();

      this.isInitialized = true;
      console.log('🔊 Sound Service initialized');
    } catch (error) {
      console.error('❌ Error initializing sound service:', error);
    }
  }

  /**
   * Preload all sound files for instant playback
   * Note: You'll need to add actual sound files to /assets/sounds/
   */
  private async preloadSounds(): Promise<void> {
    // For now, we'll use synthesized sounds via the Audio API
    // In production, you would load actual sound files like this:
    // const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/correct.mp3'));

    console.log('🎵 Sound files would be preloaded here');
    // This will be implemented when actual sound files are added
  }

  /**
   * Play a sound effect
   */
  async play(type: SoundType): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Create a simple sound programmatically
      // In production, replace with actual sound file loading
      const { sound } = await Audio.Sound.createAsync(
        this.getSoundConfig(type),
        { shouldPlay: true, volume: this.getVolume(type) }
      );

      // Auto-unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error(`❌ Error playing ${type} sound:`, error);
    }
  }

  /**
   * Get sound configuration for each type
   * For now returns a simple beep config, but you'd replace with actual sound files
   */
  private getSoundConfig(type: SoundType): any {
    // Placeholder - in production, return actual sound file:
    // return require('../../assets/sounds/correct.mp3');

    switch (type) {
      case 'correct':
        // Happy ascending tone
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' }; // Placeholder
      case 'wrong':
        // Descending error tone
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      case 'timeout':
        // Urgent beep
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      case 'tick':
        // Short tick sound for countdown
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      case 'complete':
        // Success fanfare
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      case 'tap':
        // Gentle tap feedback
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      case 'swoosh':
        // Page transition sound
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      case 'confetti':
        // Celebration sound
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
      default:
        return { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...' };
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
 * USAGE GUIDE:
 *
 * 1. Initialize once in your App.tsx:
 *    await soundService.initialize();
 *
 * 2. Use in components:
 *    import { useSound } from '../services/soundService';
 *    const { playSound } = useSound();
 *    playSound('correct');
 *
 * 3. Add actual sound files to /assets/sounds/:
 *    - correct.mp3
 *    - wrong.mp3
 *    - timeout.mp3
 *    - tick.mp3
 *    - complete.mp3
 *    - tap.mp3
 *    - swoosh.mp3
 *    - confetti.mp3
 */
