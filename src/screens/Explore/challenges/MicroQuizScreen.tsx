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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MicroQuizChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';
import { useAudio } from '../../../hooks/useAudio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MicroQuizScreenProps {
  challenge: MicroQuizChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onWrongAnswerSelected?: () => void;
  onClose: () => void;
}

export default function MicroQuizScreen({
  challenge,
  onComplete,
  onWrongAnswerSelected,
  onClose,
}: MicroQuizScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer, reactToSelection } = useCharacterState();
  const { play } = useAudio();

  // Animation values
  const questionScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const continueButtonScale = useSharedValue(1);

  // No breathing animation for question box - removed for cleaner look

  // Reset state when challenge changes with fade animation
  useEffect(() => {
    // Fade in animation for new challenge
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setSelectedOption(null);
    setShowFeedback(false);
    setShowXPAnimation(false);
    setIsAdvancing(false);
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

      // Calculate XP for correct answers
      if (isCorrect) {
        const timeSpent = 5; // Placeholder - would track actual time
        const combo = session?.currentCombo || 1;
        const xpResult = calculateXP(true, timeSpent, combo);

        setXPValue(xpResult.baseXP);
        setSpeedBonus(xpResult.speedBonus);

        // Show XP animation
        setShowXPAnimation(true);

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

  // Animated styles
  const questionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: questionScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const continueButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueButtonScale.value }],
  }));

  return (
    <View style={styles.container}>
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
        {/* Learning Companion - always visible */}
        <View style={styles.companionContainer}>
          <LearningCompanion
            state={characterState}
            combo={session?.currentCombo || 1}
            size={showFeedback ? 64 : 80}
          />
        </View>

        {/* Question container - always visible */}
        {!showFeedback && (
          <View style={styles.questionContainer}>
            <Text style={styles.question}>{challenge.question}</Text>
          </View>
        )}

        {/* Feedback Title - shown after answer */}
        {showFeedback && (
          <>
            {isCorrectAnswer() ? (
              <>
                <Text style={[styles.feedbackTitle, { color: '#6EE7B7' }]}>
                  Perfect!
                </Text>
                <Text style={styles.feedbackSubtitle}>
                  You nailed it!
                </Text>
              </>
            ) : (
              <Text style={[styles.feedbackTitle, { color: '#FCA5A5', marginBottom: 12 }]}>
                Almost there!
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
        {showFeedback && !isCorrectAnswer() && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationLabel}>EXPLANATION</Text>
            <Text style={styles.explanationText}>{challenge.explanation}</Text>
          </View>
        )}

        {/* Continue Button - Fixed position at bottom with proper spacing */}
        {showFeedback && !isCorrectAnswer() && (
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
                <View style={styles.continueButtonContent}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
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
    </View>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)', // Purple tint
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 4,
  },
  optionButton: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark card background
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1.5,
  },
  optionWrong: {
    borderColor: '#F87171',
    borderWidth: 2,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionCorrect: {
    borderColor: '#34D399',
    borderWidth: 2,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionTextWrong: {
    color: '#FCA5A5',
  },
  optionTextCorrect: {
    color: '#6EE7B7',
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
    color: '#B4E4DD',
    marginBottom: 12,
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
    color: '#93C5FD',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
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
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
