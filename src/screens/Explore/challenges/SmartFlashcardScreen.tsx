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
import { useTranslation } from 'react-i18next';
import { SmartFlashcardChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { useAudio } from '../../../hooks/useAudio';
import FullScreenCelebration from '../../../components/FullScreenCelebration';

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
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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
    // SmartFlashcard - show celebration on completion

    // Soft haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Show celebration animation
    setShowCelebration(true);

    // Simple fade out and advance
    screenOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)(challenge.id, true, {
          correctAnswer: challenge.word,
          explanation: challenge.explanation,
        });
      }
    });
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
      {/* Main Content */}
      <View style={styles.content}>
        {/* Flip Hint */}
        <View style={styles.flipHint}>
          <Text style={styles.flipHintText}>
            👆 {isFlipped ? t('explore.smart_flashcard.tap_to_flip') : t('explore.smart_flashcard.tap_to_reveal')}
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
              <Text style={styles.wordLabel}>{t('explore.smart_flashcard.word_phrase')}</Text>
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
                <Text style={styles.explanationLabel}>💡 {t('explore.smart_flashcard.meaning')}</Text>
                <Text style={styles.explanationText}>
                  {challenge.explanation}
                </Text>
              </View>

              {/* Example Sentence */}
              <View style={styles.exampleSection}>
                <Text style={styles.exampleLabel}>{t('explore.smart_flashcard.example')}</Text>
                <Text style={styles.exampleText}>
                  "{challenge.exampleSentence}"
                </Text>
              </View>

              {/* Highlight the word in example */}
              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>
                  {t('explore.smart_flashcard.highlight_note')}
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
              <Text style={styles.doneButtonText}>{t('explore.smart_flashcard.got_it')} →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Full Screen Celebration Animation */}
      <FullScreenCelebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Clean whitish background
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
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 18,
    color: '#D1D5DB',
    lineHeight: 28,
  },
  exampleSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
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
    color: '#FFFFFF',
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
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
