/**
 * Smart Flashcard Screen (REDESIGNED)
 *
 * Game-feel challenge experience with:
 * - Preserved flip mechanic (now with Reanimated)
 * - Character reactions to flips
 * - XP flying animations
 * - Particle bursts on completion
 * - Breathing animations
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
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SmartFlashcardChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { SkiaParticleBurst } from '../../../components/SkiaParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { createBreathingAnimation } from '../../../animations/UniversalFeedback';
import { useAudio } from '../../../hooks/useAudio';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmartFlashcardScreenProps {
  challenge: SmartFlashcardChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function SmartFlashcardScreen({
  challenge,
  onComplete,
  onClose,
}: SmartFlashcardScreenProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer, updateState } = useCharacterState();
  const { play } = useAudio();

  // Animation values
  const flipRotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  // No breathing animation for card - removed for cleaner look

  // Reset state when challenge changes with fade animation
  useEffect(() => {
    // Fade in animation for new challenge
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setIsFlipped(false);
    setShowCelebration(false);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    flipRotation.value = 0;
  }, [challenge.id]);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;

    flipRotation.value = withSpring(toValue, {
      damping: 15,
      stiffness: 100,
    });

    setIsFlipped(!isFlipped);

    // Play card flip sound
    play('card_flip');

    // Soft haptic feedback on flip
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDone = (event: any) => {
    // Capture tap position for animations
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    // SmartFlashcard is educational, always mark as correct
    const timeSpent = 8; // Flashcards take more time to review
    const combo = session?.currentCombo || 1;
    const xpResult = calculateXP(true, timeSpent, combo);

    setXPValue(xpResult.baseXP);
    setSpeedBonus(xpResult.speedBonus);

    // Show celebration
    setShowCelebration(true);

    // Show particle burst immediately
    setShowParticleBurst(true);

    // Show XP animation
    setTimeout(() => {
      setShowXPAnimation(true);
    }, 150);

    // Character celebrates learning
    reactToAnswer(true);

    // Play correct answer sound (flashcard always correct)
    play('correct_answer');

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Auto-advance with fade out after animations
    setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)(challenge.id, true, {
            correctAnswer: challenge.word,
            explanation: challenge.explanation,
          });
        }
      });
    }, 800);
  };

  // Animated styles for flip
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 1], [0, 180]);
    const opacity = interpolate(flipRotation.value, [0, 0.5, 1], [1, 0, 0]);

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: cardScale.value },
      ],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 1], [180, 360]);
    const opacity = interpolate(flipRotation.value, [0, 0.5, 1], [0, 0, 1]);

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: cardScale.value },
      ],
      opacity,
    };
  });

  const doneButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(flipRotation.value, [0, 0.5, 1], [0, 0, 1]);
    const translateY = interpolate(flipRotation.value, [0, 1], [20, 0]);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {/* Celebration Companion - Only shows after "Got It!" is pressed */}
      {showCelebration && (
        <View style={styles.celebrationCompanion}>
          <LearningCompanion
            state={characterState}
            combo={1}
            size={96}
          />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Flip Hint */}
        <View style={styles.flipHint}>
          <Text style={styles.flipHintText}>
            👆 Tap card to {isFlipped ? 'flip back' : 'reveal'}
          </Text>
        </View>

        {/* Flashcard */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFlip}
          style={styles.cardContainer}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              frontAnimatedStyle,
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.wordLabel}>Word / Phrase:</Text>
              <Text style={styles.word}>{challenge.word}</Text>
            </View>
          </Animated.View>

          {/* Back of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              backAnimatedStyle,
            ]}
          >
            <View style={styles.cardContent}>
              {/* Explanation */}
              <View style={styles.explanationSection}>
                <Text style={styles.explanationLabel}>💡 Meaning:</Text>
                <Text style={styles.explanationText}>
                  {challenge.explanation}
                </Text>
              </View>

              {/* Example Sentence */}
              <View style={styles.exampleSection}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.exampleText}>
                  "{challenge.exampleSentence}"
                </Text>
              </View>

              {/* Highlight the word in example */}
              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>
                  The key phrase is highlighted in context above
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Done Button (only show after flip) */}
        {isFlipped && (
          <Animated.View style={[styles.doneButtonContainer, doneButtonAnimatedStyle]}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Got It! →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Particle Burst on Completion */}
      {showParticleBurst && (
        <SkiaParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          preset="success"
          onComplete={() => setShowParticleBurst(false)}
        />
      )}

      {/* XP Flying Animation - Hide during celebration */}
      {showXPAnimation && !showCelebration && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Clean whitish background
  },
  celebrationCompanion: {
    position: 'absolute',
    top: 80, // Position above the card
    alignSelf: 'center',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  companionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  context: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333EA',
    textAlign: 'center',
  },
  flipHint: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flipHintText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
    minHeight: 300,
    justifyContent: 'center',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backfaceVisibility: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  wordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
    color: '#9333EA',
    textAlign: 'center',
  },
  explanationSection: {
    marginBottom: 24,
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 18,
    color: COLORS.textGray,
    lineHeight: 28,
  },
  exampleSection: {
    backgroundColor: '#F3E8FF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  highlightBox: {
    paddingTop: 12,
  },
  highlightText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  doneButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
