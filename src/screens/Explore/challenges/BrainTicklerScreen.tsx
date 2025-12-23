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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { BrainTicklerChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { ParticleBurst } from '../../../components/ParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BrainTicklerScreenProps {
  challenge: BrainTicklerChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function BrainTicklerScreen({
  challenge,
  onComplete,
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
  const { characterState, reactToAnswer, reactToSelection, setCharacterState } = useCharacterState();

  // Animation values
  const timerScale = useSharedValue(1);
  const questionScale = useSharedValue(1);
  const progressPercent = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  const circumference = 2 * Math.PI * 45; // radius = 45

  // Breathing animation for question
  useEffect(() => {
    questionScale.value = createBreathingAnimation(1.0);
  }, []);

  // Reset state when challenge changes
  useEffect(() => {
    setTimeLeft(challenge.timeLimit);
    setSelectedOption(null);
    setShowFeedback(false);
    setTimerActive(true);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    progressPercent.value = 0;
    timerScale.value = 1;
    backgroundOpacity.value = 0;
  }, [challenge.id]);

  // Timer logic
  useEffect(() => {
    if (!timerActive || showFeedback) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          setShowFeedback(true);
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

    return () => clearInterval(interval);
  }, [timerActive, showFeedback]);

  // Progress animation
  useEffect(() => {
    progressPercent.value = withTiming(
      ((challenge.timeLimit - timeLeft) / challenge.timeLimit) * 100,
      { duration: 1000 }
    );
  }, [timeLeft, challenge.timeLimit]);

  // Pulse animation for last 3 seconds + character nervous
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0) {
      timerScale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      setCharacterState('nervous'); // Character gets nervous!
    } else if (timeLeft > 3) {
      setCharacterState('idle');
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
    reactToSelection();

    // Wait for anticipation
    setTimeout(() => {
      setShowFeedback(true);
      reactToAnswer(isCorrect);

      // Haptic feedback
      if (Platform.OS !== 'web') {
        if (isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

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
    }, 200); // Anticipation delay
  };

  const handleDone = () => {
    const isCorrect = isCorrectAnswer();
    const correctOption = challenge.options.find((o) => o.isCorrect);

    onComplete(challenge.id, isCorrect, {
      correctAnswer: correctOption?.text || '',
      explanation: challenge.explanation,
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

  const progressCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (progressPercent.value / 100) * circumference,
  }));

  return (
    <View style={styles.container}>
      {/* Success background glow */}
      <Animated.View
        style={[styles.successBackground, backgroundAnimatedStyle]}
        pointerEvents="none"
      />

      {/* Main Content */}
      <View style={styles.content}>
        {!showFeedback ? (
          <>
            {/* Learning Companion */}
            <View style={styles.companionContainer}>
              <LearningCompanion
                state={characterState}
                combo={session?.currentCombo || 1}
                size={64}
              />
            </View>

            {/* Challenge Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{challenge.title}</Text>
            </View>

            {/* Timer */}
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

            {/* Question with breathing animation */}
            <Animated.View style={[styles.questionContainer, questionAnimatedStyle]}>
              <Text style={styles.question}>{challenge.question}</Text>
            </Animated.View>

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
                  <Text style={styles.feedbackSubtitle}>
                    Keep practicing, you'll get it!
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

              {/* Done Button */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Particle Burst on Success */}
      {showParticleBurst && (
        <ParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          particleCount={15}
          colors={['#FFD700', '#FFA500', '#8B5CF6', '#7C3AED', '#EC4899']}
          onComplete={() => setShowParticleBurst(false)}
        />
      )}

      {/* XP Flying Animation */}
      {showXPAnimation && (
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
    </View>
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
    backgroundColor: COLORS.background,
  },
  successBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3E8FF',
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
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
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
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
