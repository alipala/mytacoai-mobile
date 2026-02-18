/**
 * Voice Check Recording Hook
 *
 * Handles 60-second voice recordings for Speaking DNA acoustic analysis.
 * Mirrors SpeakingAssessmentRecordingScreen exactly — same audio setup,
 * same recording options, same file handling — to avoid "recorder not prepared" errors.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const VOICE_CHECK_DURATION = 30000; // 30 seconds (intermediate check between learning plan sessions)
const MINIMUM_DURATION = 10000;     // 10 seconds minimum

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
  const stopRecordingRef = useRef<(() => Promise<string | null>) | null>(null);

  // Set up audio mode on mount — same as SpeakingAssessmentRecordingScreen
  // IMPORTANT: Must be done before any recording attempt, not inline during recording.
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          setError('Microphone permission is required for voice checks');
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        console.log('[VOICE_CHECK] ✅ Audio mode configured on mount');
      } catch (err) {
        console.warn('[VOICE_CHECK] ⚠️ Audio setup on mount failed:', err);
      }
    };
    setupAudio();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      console.log('[VOICE_CHECK] 🛑 Stopping recording...');

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
      setIsRecording(false);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        console.error('[VOICE_CHECK] ❌ No URI after stopping recording');
        setIsProcessing(false);
        return null;
      }

      console.log(`[VOICE_CHECK] ✅ Recording stopped. URI: ${uri}`);

      if (recordingDuration < MINIMUM_DURATION / 1000) {
        setError(`Recording too short. Please speak for at least ${MINIMUM_DURATION / 1000} seconds.`);
        setIsProcessing(false);
        return null;
      }

      console.log('[VOICE_CHECK] 🔄 Converting to base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`[VOICE_CHECK] ✅ Converted to base64 (${Math.round(base64.length / 1024)}KB)`);

      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {}

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

  // Keep a ref so the auto-stop timeout always has the latest stopRecording
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      console.log('[VOICE_CHECK] 🎙️ Starting voice check recording...');

      // Re-confirm permissions (may have been revoked since mount)
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission is required for voice checks');
        console.error('[VOICE_CHECK] ❌ Microphone permission denied');
        return;
      }
      console.log('[VOICE_CHECK] ✅ Microphone permission granted');

      // Re-apply audio mode (user may have switched away and back)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 3-2-1 countdown
      setIsCountingDown(true);
      setCountdownNumber(3);

      await new Promise<void>((resolve) => {
        let count = 3;
        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            setCountdownNumber(count);
          } else {
            clearInterval(interval);
            setIsCountingDown(false);
            resolve();
          }
        }, 1000);
      });

      console.log('[VOICE_CHECK] 🎤 Starting recording after countdown');

      // Use the same proven approach as SpeakingAssessmentRecordingScreen
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      console.log('[VOICE_CHECK] ✅ Recording started');

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      autoStopTimerRef.current = setTimeout(() => {
        console.log('[VOICE_CHECK] ⏱️ Auto-stopping at 30 seconds');
        stopRecordingRef.current?.();
      }, VOICE_CHECK_DURATION);

    } catch (err: any) {
      console.error('[VOICE_CHECK] ❌ Failed to start recording:', err);
      setError(err.message || 'Failed to start recording');
      setIsCountingDown(false);
      setIsRecording(false);
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    try {
      console.log('[VOICE_CHECK] ❌ Canceling recording...');
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }

      if (recordingRef.current) {
        const uri = recordingRef.current.getURI();
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      }

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
