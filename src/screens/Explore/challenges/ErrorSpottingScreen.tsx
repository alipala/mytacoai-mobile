/**
 * Error Spotting Screen (REDESIGNED)
 *
 * Game-feel challenge experience with:
 * - Immediate feedback at tap point
 * - Character reactions
 * - XP flying animations
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
import { ErrorSpottingChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { ParticleBurst } from '../../../components/ParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ErrorSpottingScreenProps {
  challenge: ErrorSpottingChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function ErrorSpottingScreen({
  challenge,
  onComplete,
  onClose,
}: ErrorSpottingScreenProps) {
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
  const sentenceScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);

  // Breathing animation for sentence
  useEffect(() => {
    sentenceScale.value = createBreathingAnimation(1.0);
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

    // Capture tap position for XP animation
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
      correctAnswer: correctOption?.text || challenge.correctedSentence,
      explanation: challenge.explanation,
    });
  };

  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    const option = challenge.options.find((o) => o.id === selectedOption);
    return option?.isCorrect || false;
  };

  // Animated styles
  const sentenceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sentenceScale.value }],
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
              <Text style={styles.subtitle}>Find the mistake!</Text>
            </View>

            {/* Sentence with breathing animation */}
            <Animated.View style={[styles.sentenceContainer, sentenceAnimatedStyle]}>
              <Text style={styles.sentence}>"{challenge.sentence}"</Text>
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
                  <Text style={[styles.feedbackTitle, { color: '#059669' }]}>
                    Excellent!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    You spotted it!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>
                    Not quite!
                  </Text>
                  <Text style={styles.feedbackSubtitle}>
                    Let's learn together
                  </Text>
                </>
              )}

              {/* Corrected Sentence */}
              <View style={styles.correctedSentenceContainer}>
                <Text style={styles.correctedLabel}>Correct version:</Text>
                <Text style={styles.correctedSentence}>
                  "{challenge.correctedSentence}"
                </Text>
              </View>

              {/* Explanation */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Why:</Text>
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
          colors={['#FFD700', '#FFA500', '#10B981', '#06B6D4', '#FF6347']}
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
  const translateX = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
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
        <View style={styles.optionLetter}>
          <Text style={styles.optionLetterText}>
            {String.fromCharCode(65 + index)}
          </Text>
        </View>
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
    backgroundColor: '#D1FAE5',
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGray,
    marginTop: 4,
  },
  sentenceContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 24,
    borderRadius: 20,
    marginBottom: 28,
  },
  sentence: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
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
    borderColor: COLORS.turquoise,
    backgroundColor: COLORS.turquoiseLight,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
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
  correctedSentenceContainer: {
    backgroundColor: '#E8F7F5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  correctedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.turquoise,
    marginBottom: 8,
  },
  correctedSentence: {
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
