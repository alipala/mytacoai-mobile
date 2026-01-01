/**
 * Audio Service
 *
 * Manages game sound effects with:
 * - Preloading for instant playback
 * - Volume control
 * - Mute toggle
 * - Proper cleanup
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sound types
export type SoundType =
  | 'correct_answer'
  | 'wrong_answer'
  | 'session_complete'
  | 'timer_tick'
  | 'card_flip'
  | 'snap';

// Sound file mappings
const SOUND_FILES: Record<SoundType, any> = {
  correct_answer: require('../assets/sounds/correct_answer.mp3'),
  wrong_answer: require('../assets/sounds/wrong_answer.mp3'),
  session_complete: require('../assets/sounds/session_complete.mp3'),
  timer_tick: require('../assets/sounds/timer_tick.mp3'),
  card_flip: require('../assets/sounds/card_flip.mp3'),
  snap: require('../assets/sounds/snap.mp3'),
};

// Storage keys
const VOLUME_KEY = 'audio_volume';
const MUTED_KEY = 'audio_muted';

class AudioService {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private volume: number = 1.0;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  /**
   * Initialize audio service
   * - Preloads all sounds
   * - Loads saved settings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔊 Audio service already initialized');
      return;
    }

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load saved settings
      await this.loadSettings();

      // Preload all sounds
      await this.preloadSounds();

      this.isInitialized = true;
      console.log('🔊 Audio service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing audio service:', error);
    }
  }

  /**
   * Preload all sound files
   */
  private async preloadSounds(): Promise<void> {
    const loadPromises = Object.entries(SOUND_FILES).map(
      async ([type, source]) => {
        try {
          const { sound } = await Audio.Sound.createAsync(source, {
            shouldPlay: false,
            volume: this.volume,
          });
          this.sounds.set(type as SoundType, sound);
          console.log(`✅ Preloaded sound: ${type}`);
        } catch (error) {
          console.error(`❌ Error loading sound ${type}:`, error);
        }
      }
    );

    await Promise.all(loadPromises);
  }

  /**
   * Load saved audio settings
   */
  private async loadSettings(): Promise<void> {
    try {
      const [volumeStr, mutedStr] = await Promise.all([
        AsyncStorage.getItem(VOLUME_KEY),
        AsyncStorage.getItem(MUTED_KEY),
      ]);

      if (volumeStr) {
        this.volume = parseFloat(volumeStr);
      }
      if (mutedStr) {
        this.isMuted = mutedStr === 'true';
      }

      console.log(`🔊 Loaded audio settings: volume=${this.volume}, muted=${this.isMuted}`);
    } catch (error) {
      console.error('❌ Error loading audio settings:', error);
    }
  }

  /**
   * Play a sound effect
   */
  async play(type: SoundType): Promise<void> {
    if (!this.isInitialized) {
      console.warn('⚠️ Audio service not initialized, initializing now...');
      await this.initialize();
    }

    if (this.isMuted) {
      console.log(`🔇 Sound muted: ${type}`);
      return;
    }

    try {
      const sound = this.sounds.get(type);
      if (!sound) {
        console.warn(`⚠️ Sound not found: ${type}`);
        return;
      }

      // Reset to start and play
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(this.volume);
      await sound.playAsync();

      console.log(`🔊 Playing sound: ${type}`);
    } catch (error) {
      console.error(`❌ Error playing sound ${type}:`, error);
    }
  }

  /**
   * Stop a specific sound immediately
   */
  async stop(type: SoundType): Promise<void> {
    try {
      const sound = this.sounds.get(type);
      if (!sound) {
        return;
      }

      await sound.stopAsync();
      await sound.setPositionAsync(0);
      console.log(`⏹️  Stopped sound: ${type}`);
    } catch (error) {
      console.error(`❌ Error stopping sound ${type}:`, error);
    }
  }

  /**
   * Stop all currently playing sounds immediately
   */
  async stopAll(): Promise<void> {
    try {
      const stopPromises = Array.from(this.sounds.values()).map(async (sound) => {
        try {
          await sound.stopAsync();
          await sound.setPositionAsync(0);
        } catch (err) {
          // Ignore errors for sounds that aren't playing
        }
      });
      await Promise.all(stopPromises);
      console.log(`⏹️  Stopped all sounds`);
    } catch (error) {
      console.error('❌ Error stopping all sounds:', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update all loaded sounds
    const updatePromises = Array.from(this.sounds.values()).map((sound) =>
      sound.setVolumeAsync(this.volume)
    );
    await Promise.all(updatePromises);

    // Save to storage
    await AsyncStorage.setItem(VOLUME_KEY, this.volume.toString());
    console.log(`🔊 Volume set to: ${this.volume}`);
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Toggle mute
   */
  async toggleMute(): Promise<boolean> {
    this.isMuted = !this.isMuted;
    await AsyncStorage.setItem(MUTED_KEY, this.isMuted.toString());
    console.log(`🔊 Muted: ${this.isMuted}`);
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;
    await AsyncStorage.setItem(MUTED_KEY, this.isMuted.toString());
    console.log(`🔊 Muted: ${this.isMuted}`);
  }

  /**
   * Check if muted
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Cleanup - unload all sounds
   */
  async cleanup(): Promise<void> {
    try {
      const unloadPromises = Array.from(this.sounds.values()).map((sound) =>
        sound.unloadAsync()
      );
      await Promise.all(unloadPromises);
      this.sounds.clear();
      this.isInitialized = false;
      console.log('🔊 Audio service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up audio service:', error);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
