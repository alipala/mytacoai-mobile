/**
 * useAudio Hook
 *
 * React hook for easy audio playback in components
 */

import { useEffect, useState, useCallback } from 'react';
import { audioService, SoundType } from '../services/audioService';

export function useAudio() {
  const [volume, setVolumeState] = useState(audioService.getVolume());
  const [isMuted, setIsMutedState] = useState(audioService.isMutedState());

  // Initialize audio service on mount
  useEffect(() => {
    audioService.initialize();
  }, []);

  /**
   * Play a sound
   */
  const play = useCallback((type: SoundType) => {
    audioService.play(type);
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback(async (newVolume: number) => {
    await audioService.setVolume(newVolume);
    setVolumeState(newVolume);
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(async () => {
    const newMutedState = await audioService.toggleMute();
    setIsMutedState(newMutedState);
    return newMutedState;
  }, []);

  /**
   * Set mute state
   */
  const setMuted = useCallback(async (muted: boolean) => {
    await audioService.setMuted(muted);
    setIsMutedState(muted);
  }, []);

  return {
    play,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    setMuted,
  };
}
