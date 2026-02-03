/**
 * Voice Check Recording Hook
 *
 * Handles 30-second voice recordings for Speaking DNA acoustic analysis.
 * Based on SpeakingAssessmentRecordingScreen but adapted for voice checks.
 *
 * Records audio, converts to base64, and sends to backend for analysis.
 * WebRTC microphone is free when this runs (after session ends).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const VOICE_CHECK_DURATION = 30000; // 30 seconds
const MINIMUM_DURATION = 20000; // 20 seconds minimum
const COUNTDOWN_DURATION = 3000; // 3 seconds countdown

interface UseVoiceCheckRecordingReturn {
  isCountingDown: boolean;
  countdownNumber: number;
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  isProcessing: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
}

/**
 * Hook for recording voice checks for Speaking DNA acoustic analysis.
 *
 * Flow:
 * 1. Request microphone permissions
 * 2. Show 3-2-1 countdown
 * 3. Record for 30 seconds (auto-stops)
 * 4. Convert to base64
 * 5. Return base64 for API submission
 *
 * @example
 * const {
 *   isCountingDown,
 *   countdownNumber,
 *   isRecording,
 *   recordingDuration,
 *   startRecording,
 *   stopRecording
 * } = useVoiceCheckRecording();
 *
 * await startRecording(); // Shows countdown then starts recording
 * const audioBase64 = await stopRecording(); // Returns base64 string
 */
export const useVoiceCheckRecording = (): UseVoiceCheckRecordingReturn => {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      console.log('[VOICE_CHECK] 🎙️ Starting voice check recording...');

      // Request microphone permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission is required for voice checks');
        console.error('[VOICE_CHECK] ❌ Microphone permission denied');
        return;
      }

      console.log('[VOICE_CHECK] ✅ Microphone permission granted');

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start countdown (3-2-1)
      setIsCountingDown(true);
      setCountdownNumber(3);

      const runCountdown = () => {
        return new Promise<void>((resolve) => {
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
              setCountdownNumber(count);
            } else {
              clearInterval(countdownInterval);
              setIsCountingDown(false);
              resolve();
            }
          }, 1000);
        });
      };

      await runCountdown();

      console.log('[VOICE_CHECK] 🎤 Starting recording after countdown');

      // Create recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 64000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      console.log('[VOICE_CHECK] ✅ Recording started');

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Auto-stop after 30 seconds
      autoStopTimerRef.current = setTimeout(async () => {
        console.log('[VOICE_CHECK] ⏱️ Auto-stopping at 30 seconds');
        await stopRecording();
      }, VOICE_CHECK_DURATION);

    } catch (err: any) {
      console.error('[VOICE_CHECK] ❌ Failed to start recording:', err);
      setError(err.message || 'Failed to start recording');
      setIsCountingDown(false);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      console.log('[VOICE_CHECK] 🛑 Stopping recording...');

      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }

      if (!recordingRef.current) {
        console.warn('[VOICE_CHECK] ⚠️ No active recording to stop');
        return null;
      }

      setIsProcessing(true);

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) {
        console.error('[VOICE_CHECK] ❌ No URI after stopping recording');
        setIsProcessing(false);
        return null;
      }

      console.log(`[VOICE_CHECK] ✅ Recording stopped. Duration: ${recordingDuration}s`);
      console.log(`[VOICE_CHECK] 📁 File URI: ${uri}`);

      // Check minimum duration
      if (recordingDuration < MINIMUM_DURATION / 1000) {
        setError(`Recording too short. Please speak for at least ${MINIMUM_DURATION / 1000} seconds.`);
        console.warn(`[VOICE_CHECK] ⚠️ Recording too short: ${recordingDuration}s`);
        setIsProcessing(false);
        return null;
      }

      // Convert to base64
      console.log('[VOICE_CHECK] 🔄 Converting to base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const sizeKB = Math.round(base64.length / 1024);
      console.log(`[VOICE_CHECK] ✅ Converted to base64 (${sizeKB}KB)`);

      // Clean up temp file
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        console.log('[VOICE_CHECK] 🗑️ Temp file deleted');
      } catch (cleanupErr) {
        console.warn('[VOICE_CHECK] ⚠️ Failed to delete temp file:', cleanupErr);
      }

      setIsProcessing(false);
      return base64;

    } catch (err: any) {
      console.error('[VOICE_CHECK] ❌ Failed to stop recording:', err);
      setError(err.message || 'Failed to stop recording');
      setIsProcessing(false);
      setIsRecording(false);
      return null;
    }
  }, [recordingDuration]);

  const cancelRecording = useCallback(async () => {
    try {
      console.log('[VOICE_CHECK] ❌ Canceling recording...');

      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }

      // Stop recording if active
      if (recordingRef.current) {
        const uri = recordingRef.current.getURI();
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;

        // Delete temp file
        if (uri) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (cleanupErr) {
            console.warn('[VOICE_CHECK] ⚠️ Failed to delete temp file:', cleanupErr);
          }
        }
      }

      // Reset state
      setIsCountingDown(false);
      setIsRecording(false);
      setRecordingDuration(0);
      setIsProcessing(false);
      setError(null);

      console.log('[VOICE_CHECK] ✅ Recording canceled');
    } catch (err: any) {
      console.error('[VOICE_CHECK] ❌ Failed to cancel recording:', err);
    }
  }, []);

  return {
    isCountingDown,
    countdownNumber,
    isRecording,
    isPaused,
    recordingDuration,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
