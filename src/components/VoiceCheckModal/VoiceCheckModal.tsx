/**
 * Voice Check Modal Component
 *
 * Full-screen immersive modal for periodic voice checks in Speaking DNA.
 * Inspired by SpeakingAssessmentRecordingScreen with enhanced modern design.
 *
 * Features:
 * - 3-2-1 countdown with spring animations
 * - 30-second recording with circular timer
 * - Pulsing recording indicator
 * - Three tip cards with color accents
 * - Progress encouragement messages
 * - Exit warning modal
 * - Analyzing state with loading animation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useVoiceCheckRecording } from '../../hooks/useVoiceCheckRecording';
import { styles } from './VoiceCheckModal.styles';

const RECORDING_DURATION = 30; // 30 seconds (intermediate check between learning plan sessions)
const MINIMUM_DURATION = 10; // 10 seconds minimum
const PROGRESS_MESSAGE_THRESHOLD = 15; // Show encouragement at 15s

interface VoiceCheckPrompt {
  title: string;
  prompt: string;
  icon: string;
}

interface VoiceCheckModalProps {
  visible: boolean;
  prompt: VoiceCheckPrompt;
  language: string;
  onComplete: (audioBase64: string) => Promise<void>;
  onSkip: () => void;
}

export const VoiceCheckModal: React.FC<VoiceCheckModalProps> = ({
  visible,
  prompt,
  language,
  onComplete,
  onSkip,
}) => {
  const {
    isCountingDown,
    countdownNumber,
    isRecording,
    recordingDuration,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceCheckRecording();

  const [showProgressMessage, setShowProgressMessage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownScaleAnim = useRef(new Animated.Value(0)).current;
  const countdownOpacityAnim = useRef(new Animated.Value(0)).current;
  const progressMessageAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const timeRemaining = RECORDING_DURATION - recordingDuration;

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Glow animation for main card
  useEffect(() => {
    if (isRecording || isCountingDown) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isRecording, isCountingDown]);

  // Countdown animation
  useEffect(() => {
    if (isCountingDown && countdownNumber > 0) {
      // Animate in
      Animated.parallel([
        Animated.spring(countdownScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(countdownOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      // Animate out after 1 second
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(countdownScaleAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(countdownOpacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          countdownScaleAnim.setValue(0);
        });
      }, 700);
    }
  }, [isCountingDown, countdownNumber]);

  // Progress message animation
  useEffect(() => {
    if (isRecording && recordingDuration === PROGRESS_MESSAGE_THRESHOLD) {
      setShowProgressMessage(true);
      Animated.sequence([
        Animated.spring(progressMessageAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(progressMessageAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowProgressMessage(false));

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [recordingDuration]);

  // Auto-stop and complete
  useEffect(() => {
    if (recordingDuration >= RECORDING_DURATION && isRecording) {
      handleComplete();
    }
  }, [recordingDuration, isRecording]);

  const handleStart = async () => {
    try {
      await startRecording();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start recording');
    }
  };

  const handleComplete = async () => {
    try {
      if (recordingDuration < MINIMUM_DURATION) {
        Alert.alert(
          'Almost There!',
          `Please speak for at least ${MINIMUM_DURATION} seconds for better acoustic analysis.`
        );
        return;
      }

      setIsAnalyzing(true);
      const audioBase64 = await stopRecording();

      if (!audioBase64) {
        Alert.alert('Error', 'Failed to process recording. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      await onComplete(audioBase64);
      setIsAnalyzing(false);
    } catch (err: any) {
      console.error('[VOICE_CHECK_MODAL] Error completing:', err);
      Alert.alert('Error', err.message || 'Failed to complete voice check');
      setIsAnalyzing(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient colors={['#0B1A1F', '#0F2027', '#0B1A1F']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧬 DNA Voice Scan</Text>
        </View>

        <View style={styles.content}>
          {/* Main Card */}
          <Animated.View
            style={[
              styles.mainCard,
              {
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              },
            ]}
          >
            {/* Timer Circle */}
            <View style={styles.timerSection}>
              <View style={[styles.timerCircle, timeRemaining <= 10 && styles.timerCircleWarning]}>
                <Text style={[styles.timerText, timeRemaining <= 10 && styles.timerTextWarning]}>
                  {isRecording ? timeRemaining : RECORDING_DURATION}
                </Text>
                <Text style={styles.timerSubtext}>
                  {isRecording ? 'SECONDS LEFT' : 'SECONDS'}
                </Text>
              </View>
            </View>

            {/* Prompt Card */}
            <View style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Ionicons name={prompt.icon as any} size={24} color="#14B8A6" />
                <Text style={styles.promptTitle}>{prompt.title}</Text>
              </View>
              <View style={styles.promptBox}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#B4E4DD" style={styles.quoteIcon} />
                <Text style={styles.promptText}>{prompt.prompt}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Tips Section */}
          {!isRecording && !isCountingDown && !isAnalyzing && (
            <View style={styles.tipsSection}>
              <View style={[styles.tipCard, { borderColor: 'rgba(20, 184, 166, 0.3)' }]}>
                <View style={[styles.tipIconContainer, { backgroundColor: 'rgba(20, 184, 166, 0.2)' }]}>
                  <Ionicons name="time-outline" size={22} color="#14B8A6" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>30 Seconds</Text>
                  <Text style={styles.tipText}>Quick & easy</Text>
                </View>
              </View>

              <View style={[styles.tipCard, { borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                <View style={[styles.tipIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Ionicons name="mic-outline" size={22} color="#8B5CF6" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Clear Audio</Text>
                  <Text style={styles.tipText}>Quiet space</Text>
                </View>
              </View>

              <View style={[styles.tipCard, { borderColor: 'rgba(251, 146, 60, 0.3)' }]}>
                <View style={[styles.tipIconContainer, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
                  <Ionicons name="sparkles-outline" size={22} color="#FB923C" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Be Natural</Text>
                  <Text style={styles.tipText}>Just relax</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicatorContainer}>
              <Animated.View style={[styles.recordingPulse, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.recordingDot} />
              </Animated.View>
              <Text style={styles.recordingText}>Recording your voice...</Text>
              {recordingDuration >= MINIMUM_DURATION && (
                <Text style={styles.canStopText}>✓ You can stop now or continue</Text>
              )}
            </View>
          )}

          {/* Progress Message */}
          {showProgressMessage && (
            <Animated.View
              style={[
                styles.progressMessage,
                {
                  opacity: progressMessageAnim,
                  transform: [{ scale: progressMessageAnim }],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.progressMessageText}>Great! Keep going...</Text>
            </Animated.View>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#14B8A6" />
              <Text style={styles.analyzingText}>Analyzing your voice...</Text>
              <Text style={styles.analyzingSubtext}>Extracting acoustic patterns</Text>
            </View>
          )}

          {/* Action Buttons */}
          {!isRecording && !isCountingDown && !isAnalyzing && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip This Time</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                <LinearGradient
                  colors={['#14B8A6', '#0D9488']}
                  style={styles.startButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="mic" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.startButtonText}>Start DNA Scan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Countdown Overlay */}
        {isCountingDown && countdownNumber > 0 && (
          <View style={styles.countdownOverlay}>
            <Animated.View
              style={[
                styles.countdownCircle,
                {
                  transform: [{ scale: countdownScaleAnim }],
                  opacity: countdownOpacityAnim,
                },
              ]}
            >
              <Text style={styles.countdownNumber}>{countdownNumber}</Text>
            </Animated.View>
            <Text style={styles.countdownText}>Get ready to speak...</Text>
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
};
