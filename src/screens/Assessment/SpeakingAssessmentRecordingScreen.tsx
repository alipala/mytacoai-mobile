import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { DefaultService } from '../../api/generated';
import type { SpeakingAssessmentResponse } from '../../api/generated';
import { styles } from './styles/SpeakingAssessmentRecordingScreen.styles';

interface SpeakingAssessmentRecordingScreenProps {
  navigation: any;
  route: any;
}

const RECORDING_DURATION = 60; // 60 seconds = 1 minute
const MINIMUM_SPEAKING_TIME = 45; // 45 seconds minimum for quality assessment

const SpeakingAssessmentRecordingScreen: React.FC<SpeakingAssessmentRecordingScreenProps> = ({
  navigation,
  route,
}) => {
  const { language, topic, topicName, prompt } = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(RECORDING_DURATION);
  const [recordingObject, setRecordingObject] = useState<Audio.Recording | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canStopRecording, setCanStopRecording] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownScaleAnim = useRef(new Animated.Value(0)).current;
  const countdownOpacityAnim = useRef(new Animated.Value(0)).current;
  const stopButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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

  // Countdown animation and logic
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      // Animate in the countdown number
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

      // Haptic feedback for each count
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(
          countdown <= 3
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium
        );
      }

      // Set timer for next count
      countdownTimerRef.current = setTimeout(() => {
        // Animate out
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
        ]).start();

        // Update countdown after animation starts
        setTimeout(() => {
          countdownScaleAnim.setValue(0);
          setCountdown(countdown - 1);
        }, 150);
      }, 1000);
    } else if (countdown === 0) {
      // Countdown finished, start recording
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCountdown(null);
      handleStartRecording();
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown]);

  // Timer countdown
  useEffect(() => {
    if (isRecording && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);

        // Calculate elapsed time
        const elapsedTime = RECORDING_DURATION - timeRemaining + 1;

        // Enable stop button at 45 seconds with celebration
        if (elapsedTime === MINIMUM_SPEAKING_TIME && !canStopRecording) {
          setCanStopRecording(true);

          // Success haptic feedback
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          // Animate stop button
          Animated.sequence([
            Animated.spring(stopButtonScaleAnim, {
              toValue: 1.1,
              tension: 100,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.spring(stopButtonScaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 3,
              useNativeDriver: true,
            }),
          ]).start();
        }

        // Haptic feedback at 10 seconds remaining
        if (timeRemaining === 10 && Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }, 1000);
    } else if (isRecording && timeRemaining === 0) {
      // Auto-stop when time is up
      handleStopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRecording, timeRemaining, canStopRecording]);

  // Request audio permissions and setup
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Microphone access is required for speaking assessment. Please enable it in Settings.',
            [
              {
                text: 'Go Back',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
        Alert.alert(
          'Setup Error',
          'Failed to set up audio recording. Please try again.',
          [{ text: 'Go Back', onPress: () => navigation.goBack() }]
        );
      }
    };

    setupAudio();

    return () => {
      // Cleanup timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Cleanup recording
      if (recordingObject) {
        recordingObject.stopAndUnloadAsync().catch(() => {
          console.log('Recording already cleaned up');
        });
      }
    };
  }, []);

  const startCountdown = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setCountdown(5);
  };

  const skipCountdown = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }
    setCountdown(null);
    handleStartRecording();
  };

  const handleStartRecording = async () => {
    try {
      // Clean up any existing recording first
      if (recordingObject) {
        try {
          await recordingObject.stopAndUnloadAsync();
        } catch (e) {
          console.log('No existing recording to clean up');
        }
        setRecordingObject(null);
      }

      const recording = new Audio.Recording();
      // Use LINEAR_PCM format to create WAV files that backend handles correctly
      // This matches what the backend expects and OpenAI can process
      const recordingOptions = {
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
      };
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();

      setRecordingObject(recording);
      setIsRecording(true);
      setTimeRemaining(RECORDING_DURATION);
      setCanStopRecording(false); // Reset - must record for 45 seconds

      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      if (!recordingObject) return;

      setIsRecording(false);
      await recordingObject.stopAndUnloadAsync();
      const uri = recordingObject.getURI();

      console.log('Recording stopped, URI:', uri);

      if (uri) {
        setIsAnalyzing(true);
        await processRecording(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const processRecording = async (audioUri: string) => {
    try {
      // Convert audio file to base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
      });

      console.log('Audio converted to base64, length:', base64Audio.length);

      // Calculate duration
      const duration = RECORDING_DURATION - timeRemaining;

      // Call the speaking assessment API
      // Note: Send ONLY the base64 string without any data URI prefix
      // Backend expects clean base64 data, same as web app
      const response: SpeakingAssessmentResponse = await DefaultService.assessSpeakingApiSpeakingAssessPost({
        audio_base64: base64Audio,
        language: language,
        duration: duration,
        prompt: prompt,
      });

      console.log('Assessment response received:', response);

      // Navigate to results screen with audio URI for playback
      setIsAnalyzing(false);
      navigation.replace('SpeakingAssessmentResults', {
        language,
        topic,
        topicName,
        assessmentResult: response,
        audioUri: audioUri, // Pass audio URI for playback on results screen
        recordingDuration: RECORDING_DURATION - timeRemaining,
      });
    } catch (error: any) {
      console.error('Error processing recording:', error);
      setIsAnalyzing(false);

      Alert.alert(
        'Error',
        error.message || 'Failed to analyze your speaking. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setTimeRemaining(RECORDING_DURATION);
              setRecordingObject(null);
            },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowExitModal(true);
  };

  const handleConfirmExit = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setShowExitModal(false);

    // Stop and cleanup recording if active
    if (isRecording && recordingObject) {
      try {
        await recordingObject.stopAndUnloadAsync();
      } catch (e) {
        console.log('Recording already stopped');
      }
    }

    // Clear any timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    console.log('[ASSESSMENT] User exited early - assessment NOT saved');

    // Navigate back without saving
    navigation.goBack();
  };

  const handleCancelExit = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowExitModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.analyzingContainer}>
          <View style={styles.analyzingIconContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
          </View>
          <Text style={styles.analyzingTitle}>Analyzing Your Speech</Text>
          <Text style={styles.analyzingSubtitle}>
            Please wait while we evaluate your speaking skills...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speaking Assessment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Timer Display - Circular Progress */}
          <View style={styles.timerSection}>
            <View style={styles.timerCircle}>
              <Text style={[
                styles.timerText,
                timeRemaining <= 10 && styles.timerTextWarning,
              ]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.timerSubtext}>
                {isRecording ? 'remaining' : 'duration'}
              </Text>
            </View>
          </View>

          {/* Topic Card */}
          <View style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#14B8A6" />
              <Text style={styles.topicLabel}>Your Topic</Text>
            </View>
            <Text style={styles.topicName}>{topicName}</Text>
            <View style={styles.promptBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#9CA3AF" style={styles.quoteIcon} />
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        {!isRecording && (
          <View style={styles.tipsSection}>
            <View style={[styles.tipCard, styles.tipCardTime]}>
              <View style={[styles.tipIconContainer, styles.tipIconContainerTime]}>
                <Ionicons name="time-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>1 minute</Text>
                <Text style={styles.tipText}>to speak</Text>
              </View>
            </View>

            <View style={[styles.tipCard, styles.tipCardMic]}>
              <View style={[styles.tipIconContainer, styles.tipIconContainerMic]}>
                <Ionicons name="mic-outline" size={22} color="#3B82F6" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Speak clearly</Text>
                <Text style={styles.tipText}>natural pace</Text>
              </View>
            </View>

            <View style={[styles.tipCard, styles.tipCardStar]}>
              <View style={[styles.tipIconContainer, styles.tipIconContainerStar]}>
                <Ionicons name="star-outline" size={22} color="#10B981" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Be yourself</Text>
                <Text style={styles.tipText}>relax & enjoy</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicatorContainer}>
            <Animated.View
              style={[
                styles.recordingPulse,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.recordingDot} />
            </Animated.View>
            <Text style={styles.recordingText}>Recording...</Text>
            <Text style={styles.recordingSubtext}>Speak naturally about the topic</Text>
          </View>
        )}
      </View>

      {/* Record Button */}
      <View style={styles.footer}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startCountdown}
            activeOpacity={0.8}
            disabled={countdown !== null}
          >
            <Ionicons name="mic" size={32} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stopButtonContainer}>
            {/* Progress Message */}
            {!canStopRecording && (
              <View style={styles.progressMessage}>
                <Ionicons name="timer-outline" size={20} color="#B4E4DD" />
                <Text style={styles.progressText}>
                  Keep speaking... {MINIMUM_SPEAKING_TIME - (RECORDING_DURATION - timeRemaining)}s more needed
                </Text>
              </View>
            )}
            {canStopRecording && (
              <View style={styles.progressMessage}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.progressText, styles.progressTextSuccess]}>
                  Perfect! You can finish now
                </Text>
              </View>
            )}

            {/* Stop Button */}
            <TouchableOpacity
              style={[
                styles.stopButton,
                !canStopRecording && styles.stopButtonDisabled
              ]}
              onPress={handleStopRecording}
              activeOpacity={0.8}
              disabled={!canStopRecording}
            >
              <Animated.View style={[
                styles.stopButtonContent,
                { transform: [{ scale: stopButtonScaleAnim }] }
              ]}>
                <Ionicons
                  name="stop"
                  size={32}
                  color={canStopRecording ? "#FFFFFF" : "#9CA3AF"}
                />
                <Text style={[
                  styles.stopButtonText,
                  !canStopRecording && styles.stopButtonTextDisabled
                ]}>
                  {canStopRecording ? 'Finish & Analyze' : 'Recording...'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownContent}>
            <Animated.View
              style={[
                styles.countdownCircle,
                {
                  opacity: countdownOpacityAnim,
                  transform: [{ scale: countdownScaleAnim }],
                },
              ]}
            >
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </Animated.View>
            <Text style={styles.countdownLabel}>Get ready to speak...</Text>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipCountdown}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
              <Ionicons name="play-skip-forward" size={18} color="#14B8A6" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Exit Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={styles.exitModalOverlay}>
          <View style={styles.exitModalContainer}>
            {/* Icon */}
            <View style={styles.exitModalIconContainer}>
              <Ionicons name="warning" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <Text style={styles.exitModalTitle}>Exit Assessment?</Text>

            {/* Message */}
            <Text style={styles.exitModalMessage}>
              {isRecording
                ? 'Your recording will be discarded and this assessment will not be saved. Are you sure you want to exit?'
                : 'Are you sure you want to exit without completing the speaking assessment?'}
            </Text>

            {/* Buttons */}
            <View style={styles.exitModalButtons}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.exitModalCancelButton}
                onPress={handleCancelExit}
                activeOpacity={0.8}
              >
                <Text style={styles.exitModalCancelText}>
                  {isRecording ? 'Continue Recording' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              {/* Exit Button */}
              <TouchableOpacity
                style={styles.exitModalExitButton}
                onPress={handleConfirmExit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.exitModalExitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.exitModalExitText}>Exit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SpeakingAssessmentRecordingScreen;
