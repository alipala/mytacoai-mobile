/**
 * DNA Voice Scan Screen
 *
 * Standalone full-screen recording for periodic voice checks.
 * Dark immersive design — big circle button shows title/subtitle/timer inside.
 *
 * Flow: Dashboard → DNAVoiceScanScreen → DNAScanResultsScreen → Conversation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useVoiceCheckRecording } from '../../hooks/useVoiceCheckRecording';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { useVoiceCheckSchedule } from '../../hooks/useVoiceCheckSchedule';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 80, 260);
const RECORDING_DURATION = 30;
const MINIMUM_DURATION = 10;
const PROGRESS_MESSAGE_THRESHOLD = 15;

interface DNAVoiceScanScreenProps {
  navigation: any;
  route: any;
}

export const DNAVoiceScanScreen: React.FC<DNAVoiceScanScreenProps> = ({
  navigation,
  route,
}) => {
  const { planId, cardColor, language, voiceCheckSession, voiceCheckPrompt } = route.params || {};
  const { t } = useTranslation();

  const {
    isCountingDown,
    countdownNumber,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  } = useVoiceCheckRecording();

  const { completeVoiceCheck, status: voiceCheckStatus } = useVoiceCheckSchedule(planId);

  const [showProgressMessage, setShowProgressMessage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownScaleAnim = useRef(new Animated.Value(0)).current;
  const countdownOpacityAnim = useRef(new Animated.Value(0)).current;
  const progressMessageAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const timeRemaining = RECORDING_DURATION - recordingDuration;
  const progress = recordingDuration / RECORDING_DURATION;
  const isWarning = isRecording && timeRemaining <= 10;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeInAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Pulse while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Countdown animation
  useEffect(() => {
    if (isCountingDown && countdownNumber > 0) {
      countdownScaleAnim.setValue(0.5);
      countdownOpacityAnim.setValue(1);
      Animated.spring(countdownScaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
      if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Animated.timing(countdownOpacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }, 750);
    }
  }, [isCountingDown, countdownNumber]);

  // Progress message at 15s
  useEffect(() => {
    if (isRecording && recordingDuration === PROGRESS_MESSAGE_THRESHOLD) {
      setShowProgressMessage(true);
      Animated.sequence([
        Animated.spring(progressMessageAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(progressMessageAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowProgressMessage(false));
      if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [recordingDuration]);

  // Trigger completion at 29s — one second before the hook's internal 30s auto-stop,
  // so the screen wins the race and receives the base64 from stopRecording().
  const hasAutoCompleted = useRef(false);
  useEffect(() => {
    if (recordingDuration >= RECORDING_DURATION - 1 && isRecording && !hasAutoCompleted.current) {
      hasAutoCompleted.current = true;
      handleComplete();
    }
  }, [recordingDuration, isRecording]);

  // Reset the guard when a new recording starts
  useEffect(() => {
    if (isRecording) {
      hasAutoCompleted.current = false;
    }
  }, [isRecording]);

  const handleStart = async () => {
    try {
      if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await startRecording();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('dna_scan.error_start'));
    }
  };

  const handleComplete = async () => {
    try {
      if (recordingDuration < MINIMUM_DURATION) {
        Alert.alert(t('dna_scan.almost_there'), t('dna_scan.speak_longer', { seconds: MINIMUM_DURATION }));
        return;
      }
      setIsAnalyzing(true);
      const audioBase64 = await stopRecording();
      if (!audioBase64) {
        Alert.alert(t('common.error'), t('dna_scan.error_process'));
        setIsAnalyzing(false);
        return;
      }

      const voiceCheckSessionData = {
        session_id: `voice_check_${Date.now()}`,
        session_type: 'voice_check' as const,
        duration_seconds: 30,
        user_turns: [],
        corrections_received: [],
        challenges_offered: 0,
        challenges_accepted: 0,
        topics_discussed: [voiceCheckPrompt?.title || 'Voice Check'],
        audio_base64: audioBase64,
        audio_format: 'wav',
      };

      const targetLanguage = (language || 'english').toLowerCase();
      const dnaResult = await speakingDNAService.analyzeSession(targetLanguage, voiceCheckSessionData);

      if (voiceCheckStatus && planId) {
        await completeVoiceCheck(voiceCheckStatus.current_session);
      }

      const updatedProfile = await speakingDNAService.getProfile(targetLanguage, true);
      setIsAnalyzing(false);

      navigation.replace('DNAScanResults', {
        planId, cardColor, language, dnaResult, updatedProfile, voiceCheckPrompt,
      });
    } catch (err: any) {
      console.error('[DNA_SCAN] Error completing:', err);
      Alert.alert(t('common.error'), err.message || t('dna_scan.error_complete'));
      setIsAnalyzing(false);
    }
  };

  const prompt = voiceCheckPrompt || {
    title: t('dna_scan.default_prompt_title'),
    prompt: t('dna_scan.default_prompt_text'),
    icon: 'calendar',
  };

  const TIP_CARDS = [
    { icon: 'time-outline', label: t('dna_scan.tip_30s'), sub: t('dna_scan.tip_quick'), colors: ['#14B8A6', '#0D9488'] as [string, string] },
    { icon: 'mic-outline', label: t('dna_scan.tip_speak'), sub: t('dna_scan.tip_quiet'), colors: ['#8B5CF6', '#7C3AED'] as [string, string] },
    { icon: 'sparkles-outline', label: t('dna_scan.tip_natural'), sub: t('dna_scan.tip_relax'), colors: ['#FB923C', '#EA7C1A'] as [string, string] },
  ];

  // Circle gradient colours
  const circleColors: [string, string] = isAnalyzing
    ? ['#1E3040', '#0B1A1F']
    : isWarning
      ? ['#7F1D1D', '#450A0A']
      : isRecording
        ? ['#1E1040', '#0D0B1F']
        : ['#0D2F2B', '#0B1A1F'];

  const circleBorder = isWarning ? '#EF4444' : isRecording ? '#8B5CF6' : '#14B8A6';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom'] as any}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>

        {/* ── Header: DNA emoji ───────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.dnaEmoji}>🧬</Text>
        </View>

        {/* ── Prompt card ─────────────────────────────────────────────── */}
        <View style={styles.promptCard}>
          <View style={styles.promptIconRow}>
            <LinearGradient colors={['#14B8A6', '#0891B2']} style={styles.promptIconBg}>
              <Ionicons name={prompt.icon as any} size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.promptTitle}>{prompt.title}</Text>
          </View>
          <Text style={styles.promptText}>{prompt.prompt}</Text>
        </View>

        {/* ── Big circle button ────────────────────────────────────────── */}
        <View style={styles.circleWrapper}>

          <TouchableOpacity
            onPress={
              isAnalyzing ? undefined
              : isRecording && recordingDuration >= MINIMUM_DURATION ? handleComplete
              : !isRecording && !isCountingDown ? handleStart
              : undefined
            }
            disabled={(isRecording && recordingDuration < MINIMUM_DURATION) || isAnalyzing}
            activeOpacity={0.85}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={circleColors}
                style={[styles.circle, { borderColor: circleBorder }]}
              >
                {isAnalyzing ? (
                  <>
                    <ActivityIndicator size="large" color="#14B8A6" />
                    <Text style={styles.circleAnalyzing}>{t('dna_scan.analyzing')}</Text>
                  </>
                ) : isRecording ? (
                  <>
                    <Text style={[styles.circleTimer, isWarning && styles.circleTimerWarning]}>
                      {timeRemaining}
                    </Text>
                    <Text style={styles.circleTimerUnit}>{t('dna_scan.seconds_left')}</Text>
                    {recordingDuration >= MINIMUM_DURATION && (
                      <View style={styles.circleStopHint}>
                        <View style={styles.stopSquare} />
                        <Text style={styles.circleStopText}>{t('dna_scan.tap_to_stop')}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.circleTitle}>{t('dna_scan.title')}</Text>
                    <Text style={styles.circleSub}>{t('dna_scan.subtitle')}</Text>
                    <Text style={styles.circleDuration}>30s</Text>
                  </>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Progress bar (while recording) */}
        {isRecording && (
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${progress * 100}%` as any, backgroundColor: isWarning ? '#EF4444' : '#14B8A6' },
            ]} />
          </View>
        )}

        {/* Status / halfway message */}
        {isRecording && (
          <View style={styles.statusRow}>
            <View style={[styles.recordingDot, isWarning && { backgroundColor: '#EF4444' }]} />
            <Text style={styles.recordingText}>{t('dna_scan.recording')}</Text>
          </View>
        )}
        {showProgressMessage && (
          <Animated.View style={[styles.progressMsg, { opacity: progressMessageAnim, transform: [{ scale: progressMessageAnim }] }]}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.progressMsgText}>{t('dna_scan.halfway')}</Text>
          </Animated.View>
        )}

        {/* ── Tip cards (before recording only) ──────────────────────── */}
        {!isRecording && !isCountingDown && !isAnalyzing && (
          <View style={styles.tipRow}>
            {TIP_CARDS.map((tip) => (
              <LinearGradient key={tip.label} colors={tip.colors} style={styles.tipCard}>
                <Ionicons name={tip.icon as any} size={20} color="#FFFFFF" />
                <Text style={styles.tipLabel}>{tip.label}</Text>
                <Text style={styles.tipSub}>{tip.sub}</Text>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* ── Action button ────────────────────────────────────────────── */}
        {!isCountingDown && !isAnalyzing && (
          <TouchableOpacity
            onPress={
              isRecording && recordingDuration >= MINIMUM_DURATION ? handleComplete
              : !isRecording ? handleStart
              : undefined
            }
            activeOpacity={0.85}
            disabled={isRecording && recordingDuration < MINIMUM_DURATION}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={
                isRecording
                  ? (recordingDuration >= MINIMUM_DURATION ? ['#EF4444', '#DC2626'] : ['#4B5563', '#374151'])
                  : ['#14B8A6', '#0891B2']
              }
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.actionButtonText}>
                {isRecording
                  ? (recordingDuration >= MINIMUM_DURATION
                      ? t('dna_scan.finish_recording')
                      : t('dna_scan.keep_speaking', { seconds: MINIMUM_DURATION - recordingDuration }))
                  : t('dna_scan.start_scan')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

      </Animated.View>

      {/* ── Countdown overlay ───────────────────────────────────────── */}
      {isCountingDown && countdownNumber > 0 && (
        <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
          <View style={styles.countdownOverlay}>
            <Animated.View style={[styles.countdownCircle, {
              transform: [{ scale: countdownScaleAnim }],
              opacity: countdownOpacityAnim,
            }]}>
              <LinearGradient colors={['#14B8A6', '#0891B2']} style={styles.countdownGradient}>
                <Text style={styles.countdownNumber}>{countdownNumber}</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.countdownLabel}>{t('dna_scan.get_ready')}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // ── Header ───────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  dnaEmoji: {
    fontSize: 64,
  },

  // ── Prompt card ───────────────────────────────────────────────────────
  promptCard: {
    backgroundColor: 'rgba(20,184,166,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.25)',
    padding: 14,
    marginBottom: 32,
  },
  promptIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptIconBg: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  promptTitle: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '700',
  },
  promptText: {
    color: '#D1F5F0',
    fontSize: 14,
    lineHeight: 21,
  },

  // ── Circle button ─────────────────────────────────────────────────────
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  circleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  circleSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  circleDuration: {
    color: '#14B8A6',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  circleTimer: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 80,
  },
  circleTimerWarning: {
    color: '#EF4444',
  },
  circleTimerUnit: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  circleStopHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  circleStopText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
  stopSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  circleAnalyzing: {
    color: '#14B8A6',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },

  // ── Progress bar ──────────────────────────────────────────────────────
  progressBar: {
    width: SCREEN_WIDTH - 80,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },

  // ── Status row ────────────────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  progressMsgText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  // ── Tip cards ─────────────────────────────────────────────────────────
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tipCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tipLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 7,
    textAlign: 'center',
  },
  tipSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // ── Action button ─────────────────────────────────────────────────────
  actionButton: {
    marginTop: 'auto' as any,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  // ── Countdown overlay ─────────────────────────────────────────────────
  countdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11,26,31,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 24,
  },
  countdownGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '900',
  },
  countdownLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '500',
  },
});
