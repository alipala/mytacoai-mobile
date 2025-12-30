/**
 * Native Check Screen (REDESIGNED)
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
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NativeCheckChallenge } from '../../../services/mockChallengeData';
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

interface NativeCheckScreenProps {
  challenge: NativeCheckChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onWrongAnswerSelected?: () => void;
  onClose: () => void;
}

export default function NativeCheckScreen({
  challenge,
  onComplete,
  onWrongAnswerSelected,
  onClose,
}: NativeCheckScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer, reactToSelection } = useCharacterState();
  const { play } = useAudio();

  // Animation values
  const sentenceScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  // No breathing animation for question box - removed for cleaner look

  // Reset state when challenge changes with fade animation
  useEffect(() => {
    // Fade in animation for new challenge
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    backgroundOpacity.value = 0;
  }, [challenge.id]);

  const handleAnswer = (answer: boolean, event: any) => {
    if (showFeedback) return;

    // Capture tap position for animations
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    const isCorrect = answer === challenge.isNatural;

    setSelectedAnswer(answer);

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

      // Auto-advance ONLY for correct answers
      if (isCorrect) {
        setTimeout(() => {
          // Capture the answer status BEFORE the fade animation
          const finalIsCorrect = isCorrect;
          const correctAnswerText = challenge.isNatural ? 'Natural' : 'Not Natural';
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
    return selectedAnswer === challenge.isNatural;
  };

  // Animated styles
  const sentenceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sentenceScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
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
            {/* Learning Companion */}
            <View style={styles.companionContainer}>
              <LearningCompanion
                state={characterState}
                combo={session?.currentCombo || 1}
                size={80}
              />
            </View>

            {/* Title removed - only companion animation shown */}

            {/* Sentence container (no animation) */}
            <View style={styles.sentenceContainer}>
              <Text style={styles.sentence}>"{challenge.sentence}"</Text>
            </View>

            {/* Question */}
            <Text style={styles.question}>
              Would a native speaker say this?
            </Text>

            {/* Answer Buttons */}
            <View style={styles.answerContainer}>
              <AnswerButton
                label="Yes, sounds natural"
                emoji="✓"
                isYes={true}
                isSelected={selectedAnswer === true}
                onPress={(event) => handleAnswer(true, event)}
              />

              <AnswerButton
                label="No, sounds odd"
                emoji="✗"
                isYes={false}
                isSelected={selectedAnswer === false}
                onPress={(event) => handleAnswer(false, event)}
              />
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
                  <Text style={[styles.feedbackTitle, { color: '#EAB308' }]}>
                    Spot on!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    Great instinct!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>
                    Let's see...
                  </Text>
                </>
              )}

              {/* Original Sentence */}
              <View style={styles.sentenceFeedbackBox}>
                <Text style={styles.sentenceFeedbackLabel}>
                  {challenge.isNatural ? '✓ Natural' : '✗ Unnatural'}
                </Text>
                <Text style={styles.sentenceFeedbackText}>
                  "{challenge.sentence}"
                </Text>
              </View>

              {/* Corrected Version (if not natural) */}
              {!challenge.isNatural && challenge.correctedVersion && (
                <View style={styles.correctedBox}>
                  <Text style={styles.correctedLabel}>✓ Better:</Text>
                  <Text style={styles.correctedText}>
                    "{challenge.correctedVersion}"
                  </Text>
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Why:</Text>
                <Text style={styles.explanationText}>
                  {challenge.explanation}
                </Text>
              </View>

              {/* Continue Button - Only show for incorrect answers */}
              {!isCorrectAnswer() && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => {
                    const finalIsCorrect = isCorrectAnswer();
                    const correctAnswerText = challenge.isNatural ? 'Natural' : 'Not Natural';
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

// Answer Button Component
interface AnswerButtonProps {
  label: string;
  emoji: string;
  isYes: boolean;
  isSelected: boolean;
  onPress: (event: any) => void;
}

function AnswerButton({ label, emoji, isYes, isSelected, onPress }: AnswerButtonProps) {
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
          styles.answerButton,
          isYes ? styles.yesButton : styles.noButton,
          isSelected && styles.answerSelected,
          animatedStyle,
        ]}
      >
        <Text style={styles.answerEmoji}>{emoji}</Text>
        <Text style={styles.answerText}>{label}</Text>
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
    backgroundColor: '#FEF3C7',
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
    marginBottom: 20,
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
  sentenceContainer: {
    backgroundColor: '#FFFBEB',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    shadowColor: '#92400E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  sentence: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 30,
  },
  question: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 32,
    textAlign: 'center',
  },
  answerContainer: {
    gap: 14,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 3,
  },
  yesButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  noButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  answerSelected: {
    borderWidth: 3,
    borderColor: '#EAB308',
    ...Platform.select({
      ios: {
        shadowColor: '#EAB308',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  answerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
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
  sentenceFeedbackBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
  },
  sentenceFeedbackLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textGray,
    marginBottom: 8,
  },
  sentenceFeedbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  correctedBox: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  correctedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  correctedText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 28,
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
