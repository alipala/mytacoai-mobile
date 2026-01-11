/**
 * Brain Tickler Screen (REDESIGNED)
 *
 * Game-feel timed challenge experience with:
 * - Circular timer with Reanimated
 * - Character reactions to time pressure
 * - XP flying animations
 * - Particle bursts
 * - Emotion-first design
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  AppState,
  AppStateStatus,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { BrainTicklerChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { SkiaParticleBurst } from '../../../components/SkiaParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';
import { useAudio } from '../../../hooks/useAudio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BrainTicklerScreenProps {
  challenge: BrainTicklerChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onWrongAnswerSelected?: () => void;
  onClose: () => void;
}

export default function BrainTicklerScreen({
  challenge,
  onComplete,
  onWrongAnswerSelected,
  onClose,
}: BrainTicklerScreenProps) {
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer, reactToSelection, updateState } = useCharacterState();
  const { play, stopAll: stopAllAudio } = useAudio();

  // Refs to track timer intervals (for cleanup)
  const timerTickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to stop all timers immediately
  const stopAllTimers = () => {
    // 1. Clear interval timers
    if (timerTickIntervalRef.current) {
      clearInterval(timerTickIntervalRef.current);
      timerTickIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // 2. CRITICAL: Stop all audio playback immediately (timer tick sound is 8 seconds!)
    stopAllAudio();

    // 3. Set timerActive to false to prevent any pending state updates
    setTimerActive(false);
  };

  // Animation values
  const timerScale = useSharedValue(1);
  const questionScale = useSharedValue(1);
  const progressPercent = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const circumference = 2 * Math.PI * 45; // radius = 45

  // No breathing animation for question box - removed for cleaner look

  // Reset state when challenge changes with fade animation
  useEffect(() => {
    // Stop any existing timers first
    stopAllTimers();

    // Fade in animation for new challenge
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setTimeLeft(challenge.timeLimit);
    setSelectedOption(null);
    setShowFeedback(false);
    setTimerActive(true);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    progressPercent.value = 0;
    timerScale.value = 1;
    backgroundOpacity.value = 0;

    // Cleanup on unmount - CRITICAL: Stop timers immediately
    return () => {
      stopAllTimers();
    };
  }, [challenge.id]);

  // CRITICAL: Stop timers when component is about to unmount (back button, exit, etc.)
  useEffect(() => {
    return () => {
      // This cleanup runs when component unmounts for ANY reason
      // (back button, navigation, app background, etc.)
      stopAllTimers();
    };
  }, []);

  // CRITICAL: Stop timers when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background - stop timers immediately
        stopAllTimers();
        console.log('⏸️  App backgrounded - timers stopped');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Timer logic with continuous tick sound
  useEffect(() => {
    if (!timerActive || showFeedback) {
      // Stop all timers when timer becomes inactive
      stopAllTimers();
      return;
    }

    // Start timer tick sound immediately
    play('timer_tick');

    // Play tick sound every second
    timerTickIntervalRef.current = setInterval(() => {
      play('timer_tick');
    }, 1000);

    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // IMMEDIATELY stop ALL timers synchronously
          stopAllTimers();

          // Set states
          setTimerActive(false);
          setShowFeedback(true);

          // Play wrong answer sound on timeout
          play('wrong_answer');

          // Haptic feedback when time runs out
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          reactToAnswer(false); // Sad when timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
      stopAllTimers();
    };
  }, [timerActive, showFeedback]);

  // Progress animation
  useEffect(() => {
    progressPercent.value = withTiming(
      ((challenge.timeLimit - timeLeft) / challenge.timeLimit) * 100,
      { duration: 1000 }
    );
  }, [timeLeft, challenge.timeLimit]);

  // Pulse animation for last 3 seconds
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0) {
      timerScale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [timeLeft]);

  const handleOptionPress = (optionId: string, event: any) => {
    if (showFeedback || !timerActive) return;

    // Capture tap position for animations
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    const option = challenge.options.find((o) => o.id === optionId);
    if (!option) return;

    const isCorrect = option.isCorrect;

    setSelectedOption(optionId);
    setTimerActive(false);

    // Stop ALL timers immediately
    stopAllTimers();

    // TRIGGER WRONG ANSWER ANIMATIONS IMMEDIATELY
    if (!isCorrect && onWrongAnswerSelected) {
      onWrongAnswerSelected();
    }

    // Wait briefly before showing feedback
    setTimeout(() => {
      setShowFeedback(true);
      reactToAnswer(isCorrect);

      // Haptic and audio feedback - Skip for wrong answers (already done in WrongAnswerFeedback)
      if (Platform.OS !== 'web') {
        if (isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        // Removed wrong answer haptic - handled by WrongAnswerFeedback component
      }

      // Play sound effect - Skip for wrong answers (already done in WrongAnswerFeedback)
      if (isCorrect) {
        play('correct_answer');
      }
      // Removed wrong answer sound - handled by WrongAnswerFeedback component

      // Calculate XP for correct answers (bonus for speed!)
      if (isCorrect) {
        const timeSpent = challenge.timeLimit - timeLeft;
        const combo = session?.currentCombo || 1;
        const xpResult = calculateXP(true, timeSpent, combo);

        setXPValue(xpResult.baseXP);
        setSpeedBonus(xpResult.speedBonus);

        // Show particle burst immediately
        setShowParticleBurst(true);

        // Show XP animation after particle burst starts
        setTimeout(() => {
          setShowXPAnimation(true);
        }, 150);

        // Background success glow
        backgroundOpacity.value = withSequence(
          withTiming(0.3, { duration: 200 }),
          withTiming(0, { duration: 400 })
        );
      }

      // Auto-advance ONLY for correct answers
      if (isCorrect) {
        setTimeout(() => {
          // Capture the answer status BEFORE the fade animation
          const finalIsCorrect = isCorrect;
          const correctAnswerText = challenge.options.find((o) => o.isCorrect)?.text || '';
          const explanationText = challenge.explanation;
          const challengeIdToComplete = challenge.id;

          screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
              runOnJS(handleDone)(challengeIdToComplete, finalIsCorrect, correctAnswerText, explanationText);
            }
          });
        }, 1800); // Increased from 1200 to 1800ms to show celebration fully
      }
    }, 200); // Anticipation delay
  };

  const handleDone = (challengeId: string, isCorrect: boolean, correctAnswerText: string, explanationText: string) => {
    onComplete(challengeId, isCorrect, {
      correctAnswer: correctAnswerText,
      explanation: explanationText,
    });
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

  // Animated styles
  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: questionScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const progressCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progressPercent.value / 100) * circumference,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {/* Success background glow */}
      <Animated.View
        style={[styles.successBackground, backgroundAnimatedStyle]}
        pointerEvents="none"
      />

      {/* Main Content */}
      <View style={styles.content}>
        {!showFeedback ? (
          <>
            {/* Timer - No companion animation needed, timer provides visual feedback */}
            <Animated.View style={[styles.timerContainer, timerAnimatedStyle]}>
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
                  animatedProps={progressCircleProps}
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

            {/* Question container (no animation) */}
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{challenge.question}</Text>
            </View>

            {/* Options with dynamic layout */}
            <View style={styles.optionsContainer}>
              {challenge.options.map((option, index) => {
                const isSelected = selectedOption === option.id;

                return (
                  <OptionButton
                    key={option.id}
                    option={option}
                    index={index}
                    isSelected={isSelected}
                    onPress={(event) => handleOptionPress(option.id, event)}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <>
            {/* Feedback State */}
            <View style={styles.feedbackContainer}>
              {/* Character in celebration/disappointment */}
              <View style={styles.feedbackCharacter}>
                <LearningCompanion
                  state={characterState}
                  combo={session?.currentCombo || 1}
                  size={96}
                />
              </View>

              {timeLeft === 0 && !selectedOption ? (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#DC2626' }]}>
                    Time's up!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    No worries, let's see the answer
                  </Text>
                </>
              ) : isCorrectAnswer() ? (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#7C3AED' }]}>
                    Amazing!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    Lightning fast thinking!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>
                    Good try!
                  </Text>
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

              {/* Continue Button - Only show for incorrect answers or timeout */}
              {(!isCorrectAnswer() || !selectedOption) && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => {
                    const finalIsCorrect = isCorrectAnswer();
                    const correctAnswerText = correctOption?.text || '';
                    const explanationText = challenge.explanation;
                    const challengeIdToComplete = challenge.id;

                    screenOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
                      if (finished) {
                        runOnJS(handleDone)(challengeIdToComplete, finalIsCorrect, correctAnswerText, explanationText);
                      }
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneButtonText}>Continue →</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* Particle Burst on Success */}
      {showParticleBurst && (
        <SkiaParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          preset="success"
          onComplete={() => setShowParticleBurst(false)}
        />
      )}

      {/* XP Flying Animation - Hide during feedback */}
      {showXPAnimation && !showFeedback && (
        <XPFlyingNumber
          value={xpValue}
          startX={tapPosition.x}
          startY={tapPosition.y}
          endX={SCREEN_WIDTH - 80}
          endY={60}
          speedBonus={speedBonus}
          onComplete={() => setShowXPAnimation(false)}
          delay={0}
        />
      )}
    </Animated.View>
  );
}

// Option Button Component
interface OptionButtonProps {
  option: { id: string; text: string; isCorrect: boolean };
  index: number;
  isSelected: boolean;
  onPress: (event: any) => void;
}

function OptionButton({ option, index, isSelected, onPress }: OptionButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.optionButton,
          isSelected && styles.optionSelected,
          animatedStyle,
        ]}
      >
        <Text style={styles.optionText}>{option.text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Clean whitish background
  },
  successBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3E8FF',
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  companionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 24,
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
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FBCFE8',
    shadowColor: '#831843',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
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
  feedbackCharacter: {
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textGray,
    marginBottom: 32,
    textAlign: 'center',
  },
  correctAnswerBox: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  correctAnswerLabel: {
    fontSize: 13,
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
    paddingHorizontal: SCREEN_WIDTH < 400 ? 32 : 48,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
