import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { DefaultService } from '../../api/generated';
import type { SpeakingAssessmentResponse } from '../../api/generated';

interface SpeakingAssessmentRecordingScreenProps {
  navigation: any;
  route: any;
}

const RECORDING_DURATION = 60; // 60 seconds = 1 minute

const SpeakingAssessmentRecordingScreen: React.FC<SpeakingAssessmentRecordingScreenProps> = ({
  navigation,
  route,
}) => {
  const { language, topic, topicName, prompt } = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(RECORDING_DURATION);
  const [recordingObject, setRecordingObject] = useState<Audio.Recording | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Timer countdown
  useEffect(() => {
    if (isRecording && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);

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
  }, [isRecording, timeRemaining]);

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
        recordingObject.stopAndUnloadAsync();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      setRecordingObject(recording);
      setIsRecording(true);
      setTimeRemaining(RECORDING_DURATION);

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
      const response: SpeakingAssessmentResponse = await DefaultService.assessSpeakingApiSpeakingAssessPost({
        requestBody: {
          audio_base64: base64Audio,
          language: language,
          duration: duration,
          prompt: prompt,
        },
      });

      console.log('Assessment response received:', response);

      // Navigate to results screen
      setIsAnalyzing(false);
      navigation.replace('SpeakingAssessmentResults', {
        language,
        topic,
        topicName,
        assessmentResult: response,
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
    if (isRecording) {
      Alert.alert(
        'Stop Recording?',
        'Are you sure you want to cancel the recording?',
        [
          { text: 'Continue Recording', style: 'cancel' },
          {
            text: 'Stop',
            style: 'destructive',
            onPress: async () => {
              if (recordingObject) {
                await recordingObject.stopAndUnloadAsync();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
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
            <ActivityIndicator size="large" color="#4FD1C5" />
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
          disabled={isRecording}
        >
          <Ionicons name="close" size={28} color={isRecording ? '#D1D5DB' : '#1F2937'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speaking Assessment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={[
            styles.timerText,
            timeRemaining <= 10 && styles.timerTextWarning,
          ]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>

        {/* Topic Info */}
        <View style={styles.topicContainer}>
          <Text style={styles.topicLabel}>Topic</Text>
          <Text style={styles.topicName}>{topicName}</Text>
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{prompt}</Text>
          </View>
        </View>

        {/* Instructions */}
        {!isRecording && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
            <Text style={styles.instructionsText}>
              You have 1 minute to speak about this topic. Tap the microphone button when you're ready to start.
            </Text>
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
              <Ionicons name="mic" size={32} color="#EF4444" />
            </Animated.View>
            <Text style={styles.recordingText}>Recording in progress...</Text>
          </View>
        )}
      </View>

      {/* Record Button */}
      <View style={styles.footer}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleStartRecording}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={32} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopRecording}
            activeOpacity={0.8}
          >
            <Ionicons name="stop" size={32} color="#FFFFFF" />
            <Text style={styles.stopButtonText}>Stop & Analyze</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4FD1C5',
  },
  timerTextWarning: {
    color: '#EF4444',
  },
  topicContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  topicLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  topicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  promptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  promptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  recordingIndicatorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  recordingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recordButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stopButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  analyzingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SpeakingAssessmentRecordingScreen;
