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
  ScrollView,
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
import { useTranslation } from 'react-i18next';
import { BrainTicklerChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';
import { useAudio } from '../../../hooks/useAudio';
import FullScreenCelebration from '../../../components/FullScreenCelebration';

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
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit || 15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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
  const continueButtonScale = useSharedValue(1);

  const circumference = 2 * Math.PI * 45; // radius = 45

  // No breathing animation for question box - removed for cleaner look

  // Reset state when challenge changes with fade animation
  useEffect(() => {
    // Stop any existing timers first
    stopAllTimers();

    // Fade in animation for new challenge
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setTimeLeft(challenge.timeLimit || 15);
    setSelectedOption(null);
    setShowFeedback(false);
    setTimerActive(true);
    setShowXPAnimation(false);
    setIsAdvancing(false);
    setShowCelebration(false);
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
    const limit = challenge.timeLimit || 15;
    progressPercent.value = withTiming(
      ((limit - timeLeft) / limit) * 100,
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

    // Removed separate wrong answer animation - using inline feedback instead
    // if (!isCorrect && onWrongAnswerSelected) {
    //   onWrongAnswerSelected();
    // }

    // Wait briefly before showing feedback
    setTimeout(() => {
      setShowFeedback(true);
      reactToAnswer(isCorrect);

      // Haptic and audio feedback
      if (Platform.OS !== 'web') {
        if (isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }

      // Play sound effect
      if (isCorrect) {
        play('correct_answer');
      } else {
        play('wrong_answer');
      }

      // Calculate XP for correct answers (bonus for speed!)
      if (isCorrect) {
        const limit = challenge.timeLimit || 15;
        const timeSpent = limit - timeLeft;
        const combo = session?.currentCombo || 1;
        const xpResult = calculateXP(true, timeSpent, combo);

        setXPValue(xpResult.baseXP);
        setSpeedBonus(xpResult.speedBonus);

        // Show XP animation
        setShowXPAnimation(true);

        // Show full-screen celebration animation
        setShowCelebration(true);

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

          screenOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
              runOnJS(handleDone)(challengeIdToComplete, finalIsCorrect, correctAnswerText, explanationText);
            }
          });
        }, 800); // ✅ OPTIMIZED: Reduced from 1800ms to 800ms for snappy transitions
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

  const continueButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueButtonScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {/* Success background glow */}
      <Animated.View
        style={[styles.successBackground, backgroundAnimatedStyle]}
        pointerEvents="none"
      />

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Timer - Always visible */}
        {!showFeedback && (
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
        )}

        {/* Character - removed, now using full-screen celebration */}

        {/* Question container - hide during feedback */}
        {!showFeedback && (
          <View style={styles.questionContainer}>
            <Text style={styles.question}>{challenge.question}</Text>
          </View>
        )}

        {/* Feedback Title - shown after answer */}
        {showFeedback && (
          <>
            {timeLeft === 0 && !selectedOption ? (
              <>
                <Text style={[styles.feedbackTitle, { color: '#DC2626' }]}>
                  {t('explore.brain_tickler.times_up')}
                </Text>
                <Text style={styles.feedbackSubtitle}>
                  {t('explore.brain_tickler.no_worries')}
                </Text>
              </>
            ) : isCorrectAnswer() ? (
              <>
                <Text style={[styles.feedbackTitle, { color: '#7C3AED' }]}>
                  {t('explore.brain_tickler.amazing')}
                </Text>
                <Text style={styles.feedbackSubtitle}>
                  {t('explore.brain_tickler.lightning_fast')}
                </Text>
              </>
            ) : (
              <Text style={[styles.feedbackTitle, { color: '#D97706', marginBottom: 16 }]}>
                {t('explore.brain_tickler.good_try')}
              </Text>
            )}
          </>
        )}

        {/* Options - always visible with highlighting */}
        <View style={styles.optionsContainer}>
          {challenge.options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.isCorrect;
            const showAsWrong = showFeedback && isSelected && !isCorrect;
            const showAsCorrect = showFeedback && isCorrect;

            return (
              <OptionButtonWithFeedback
                key={option.id}
                option={option}
                index={index}
                isSelected={isSelected}
                showAsWrong={showAsWrong}
                showAsCorrect={showAsCorrect}
                disabled={showFeedback}
                onPress={(event) => handleOptionPress(option.id, event)}
              />
            );
          })}
        </View>

        {/* Explanation - shown inline for wrong answers */}
        {showFeedback && (!isCorrectAnswer() || !selectedOption) && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationLabel}>{t('explore.brain_tickler.explanation')}</Text>
            <Text style={styles.explanationText}>{challenge.explanation}</Text>
          </View>
        )}

        {/* Continue Button - Fixed position at bottom */}
        {showFeedback && (!isCorrectAnswer() || !selectedOption) && (
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity
              onPressIn={() => {
                continueButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
              }}
              onPressOut={() => {
                continueButtonScale.value = withSpring(1.0, { damping: 15, stiffness: 400 });
              }}
              onPress={() => {
                if (isAdvancing) return; // Prevent multiple taps
                setIsAdvancing(true);

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
              activeOpacity={1}
            >
              <Animated.View style={[styles.continueButton, continueButtonAnimatedStyle]}>
                <Text style={styles.continueButtonText}>{t('explore.button_continue')}</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

      {/* Full Screen Celebration Animation */}
      <FullScreenCelebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </Animated.View>
  );
}

// Option Button Component with Feedback
interface OptionButtonWithFeedbackProps {
  option: { id: string; text: string; isCorrect: boolean };
  index: number;
  isSelected: boolean;
  showAsWrong: boolean;
  showAsCorrect: boolean;
  disabled: boolean;
  onPress: (event: any) => void;
}

function OptionButtonWithFeedback({
  option,
  index,
  isSelected,
  showAsWrong,
  showAsCorrect,
  disabled,
  onPress
}: OptionButtonWithFeedbackProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    }
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
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.optionButton,
          isSelected && !showAsWrong && !showAsCorrect && styles.optionSelected,
          showAsWrong && styles.optionWrong,
          showAsCorrect && styles.optionCorrect,
          animatedStyle,
        ]}
      >
        <Text style={[
          styles.optionText,
          showAsWrong && styles.optionTextWrong,
          showAsCorrect && styles.optionTextCorrect,
        ]}>
          {option.text}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
  },
  successBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 184, 166, 0.15)', // Dark teal glow
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  companionContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#1F2937', // Solid dark gray background
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#EC4899', // Solid pink border (brain tickler theme)
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 4,
  },
  optionButton: {
    backgroundColor: '#1F2937', // Solid dark gray
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#374151', // Visible medium gray border
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionSelected: {
    backgroundColor: '#831843', // Solid dark pink background
    borderColor: '#EC4899', // Bright pink border
    borderWidth: 2.5,
    ...Platform.select({
      ios: {
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  optionWrong: {
    backgroundColor: '#7F1D1D', // Solid dark red background
    borderColor: '#EF4444', // Bright red border
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  optionCorrect: {
    backgroundColor: '#064E3B', // Solid dark green background
    borderColor: '#10B981', // Bright green border
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F9FAFB', // Bright white for better contrast
    textAlign: 'center',
    lineHeight: 24,
  },
  optionTextWrong: {
    color: '#FECACA', // Lighter red for contrast on dark red background
  },
  optionTextCorrect: {
    color: '#D1FAE5', // Lighter green for contrast on dark green background
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    marginTop: 4,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 12,
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
    color: '#FFFFFF',
    textAlign: 'center',
  },
  explanationBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D1D5DB',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: SCREEN_WIDTH < 400 ? 32 : 48,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueButtonContainer: {
    marginTop: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
