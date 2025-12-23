/**
 * Micro Quiz Screen (REDESIGNED)
 *
 * Game-feel challenge experience with:
 * - Immediate feedback at tap point
 * - Character reactions
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
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MicroQuizChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { ParticleBurst } from '../../../components/ParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MicroQuizScreenProps {
  challenge: MicroQuizChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function MicroQuizScreen({
  challenge,
  onComplete,
  onClose,
}: MicroQuizScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer, reactToSelection } = useCharacterState();

  // Animation values
  const questionScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);

  // Breathing animation for question
  useEffect(() => {
    questionScale.value = createBreathingAnimation(1.0);
  }, []);

  // Reset state when challenge changes
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    backgroundOpacity.value = 0;
  }, [challenge.id]);

  const handleOptionPress = (optionId: string, event: any) => {
    if (showFeedback) return;

    // Capture tap position for animations
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    const option = challenge.options.find((o) => o.id === optionId);
    if (!option) return;

    const isCorrect = option.isCorrect;

    setSelectedOption(optionId);
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

      // Calculate XP for correct answers
      if (isCorrect) {
        const timeSpent = 5; // Placeholder - would track actual time
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

  // Animated styles
  const questionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: questionScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
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

              {isCorrectAnswer() ? (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#2563EB' }]}>
                    Perfect!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    You nailed it!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>
                    Almost there!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    Let's review together
                  </Text>
                </>
              )}

              {/* Correct Answer Display (for incorrect answers) */}
              {!isCorrectAnswer() && correctOption && (
                <View style={styles.correctAnswerBox}>
                  <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
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

              {/* Next Button */}
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
          colors={['#FFD700', '#FFA500', '#3B82F6', '#2563EB', '#FF6347']}
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
    backgroundColor: '#DBEAFE',
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: '#FFF7ED',
    padding: 24,
    borderRadius: 20,
    marginBottom: 28,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 32,
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
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  optionText: {
    fontSize: 18,
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
