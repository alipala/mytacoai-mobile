import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { BrainTicklerChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';

interface BrainTicklerScreenProps {
  challenge: BrainTicklerChallenge;
  onComplete: (challengeId: string) => void;
  onClose: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BrainTicklerScreen({
  challenge,
  onComplete,
  onClose,
}: BrainTicklerScreenProps) {
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Timer logic
  useEffect(() => {
    if (!timerActive || showFeedback) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          setShowFeedback(true);
          // Haptic feedback when time runs out
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, showFeedback]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((challenge.timeLimit - timeLeft) / challenge.timeLimit) * 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, challenge.timeLimit]);

  // Pulse animation for last 3 seconds
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft]);

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback || !timerActive) return; // Prevent selection after answer

    const option = challenge.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelectedOption(optionId);
    setShowFeedback(true);
    setTimerActive(false);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      if (option.isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
    }
  };

  const handleDone = () => {
    onComplete(challenge.id);
  };

  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    const option = challenge.options.find((o) => o.id === selectedOption);
    return option?.isCorrect || false;
  };

  const correctOption = challenge.options.find((o) => o.isCorrect);

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (timeLeft > 6) return '#10B981'; // Green
    if (timeLeft > 3) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const circumference = 2 * Math.PI * 45; // radius = 45

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!showFeedback ? (
          <>
            {/* Challenge Title */}
            <View style={styles.titleSection}>
              <Text style={styles.emoji}>{challenge.emoji}</Text>
              <Text style={styles.title}>{challenge.title}</Text>
            </View>

            {/* Timer */}
            <Animated.View
              style={[
                styles.timerContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Svg width="120" height="120">
                {/* Background circle */}
                <Circle
                  cx="60"
                  cy="60"
                  r="45"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <AnimatedCircle
                  cx="60"
                  cy="60"
                  r="45"
                  stroke={getTimerColor()}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [circumference, 0],
                  })}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.timerTextContainer}>
                <Text style={[styles.timerText, { color: getTimerColor() }]}>
                  {timeLeft}
                </Text>
              </View>
            </Animated.View>

            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{challenge.question}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {challenge.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selectedOption === option.id && styles.optionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Feedback State */}
            <View style={styles.feedbackContainer}>
              {timeLeft === 0 && !selectedOption ? (
                <>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>⏰</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Time's up!</Text>
                </>
              ) : isCorrectAnswer() ? (
                <>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>⚡</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Lightning fast!</Text>
                </>
              ) : (
                <>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>💡</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Not quite!</Text>
                </>
              )}

              {/* Correct Answer Display (if wrong or timeout) */}
              {(!isCorrectAnswer() || !selectedOption) && correctOption && (
                <View style={styles.correctAnswerBox}>
                  <Text style={styles.correctAnswerLabel}>✓ Correct answer:</Text>
                  <Text style={styles.correctAnswerText}>
                    {correctOption.text}
                  </Text>
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Explanation:</Text>
                <Text style={styles.explanationText}>{challenge.explanation}</Text>
              </View>

              {/* Done Button */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 42,
    fontWeight: '700',
  },
  questionContainer: {
    backgroundColor: '#FFE8F5',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: {
    borderColor: '#EC4899',
    backgroundColor: '#FCE7F3',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  feedbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  feedbackIcon: {
    marginBottom: 20,
  },
  feedbackEmoji: {
    fontSize: 80,
  },
  feedbackTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 32,
  },
  correctAnswerBox: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  explanationBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
