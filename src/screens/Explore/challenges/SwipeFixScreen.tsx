import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SwipeFixChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { SkiaParticleBurst } from '../../../components/SkiaParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { useAudio } from '../../../hooks/useAudio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeFixScreenProps {
  challenge: SwipeFixChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function SwipeFixScreen({
  challenge,
  onComplete,
  onClose,
}: SwipeFixScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: SCREEN_WIDTH / 2, y: 200 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const screenOpacity = useSharedValue(1);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer } = useCharacterState();
  const { play } = useAudio();

  // Reset state when challenge changes
  useEffect(() => {
    setCurrentIndex(0);
    setHasViewed(false);
    setShowCelebration(false);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    translateX.setValue(0);
    screenOpacity.value = 1;
  }, [challenge.id]);

  const currentExample = challenge.examples[currentIndex];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = SCREEN_WIDTH * 0.25;

        if (gestureState.dx > threshold && currentIndex > 0) {
          // Swipe right - previous example
          handleSwipe('right');
        } else if (
          gestureState.dx < -threshold &&
          currentIndex < challenge.examples.length - 1
        ) {
          // Swipe left - next example
          handleSwipe('left');
        } else {
          // Return to center
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Update index
      setCurrentIndex((prev) =>
        direction === 'left'
          ? Math.min(prev + 1, challenge.examples.length - 1)
          : Math.max(prev - 1, 0)
      );

      setHasViewed(true);

      // Reset position
      translateX.setValue(direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.spring(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      // Soft haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
    });
  };

  const handleDone = (event: any) => {
    // Capture tap position for animations
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    // Calculate XP
    const timeSpent = 8; // Swipe challenges take time to review
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

    // Character celebrates
    reactToAnswer(true);

    // Play correct answer sound
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
            correctAnswer: challenge.concept,
            explanation: `You reviewed ${challenge.examples.length} examples of: ${challenge.concept}`,
          });
        }
      });
    }, 800);
  };

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <ReanimatedAnimated.View style={[styles.container, screenAnimatedStyle]}>
      {/* Celebration Companion - Only shows after "Done" is pressed */}
      {showCelebration && (
        <View style={styles.celebrationCompanion}>
          <LearningCompanion
            state={characterState}
            combo={1}
            size={96}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Learning Companion (before pressing Done) */}
        {!showCelebration && (
          <View style={styles.companionContainer}>
            <LearningCompanion
              state={characterState}
              combo={session?.currentCombo || 1}
              size={80}
            />
          </View>
        )}

        {/* Concept Section - Removed title */}
        <View style={styles.titleSection}>
          <Text style={styles.concept}>{challenge.concept}</Text>
        </View>

        {/* Swipe Hint */}
        <View style={styles.swipeHint}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textLight} />
          <Text style={styles.swipeHintText}>Swipe to compare</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {/* Correctness Indicator */}
            <View
              style={[
                styles.correctnessBadge,
                currentExample.isCorrect
                  ? styles.correctBadge
                  : styles.incorrectBadge,
              ]}
            >
              <Text style={styles.correctnessText}>
                {currentExample.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </Text>
            </View>

            {/* Example Text */}
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleText}>{currentExample.text}</Text>
            </View>

            {/* Explanation */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                {currentExample.explanation}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {challenge.examples.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Done Button */}
        {hasViewed && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
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
    </ReanimatedAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  celebrationCompanion: {
    position: 'absolute',
    top: 80,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  concept: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.turquoise,
    textAlign: 'center',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  swipeHintText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  correctnessBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  correctBadge: {
    backgroundColor: '#D1FAE5',
  },
  incorrectBadge: {
    backgroundColor: '#FEE2E2',
  },
  correctnessText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  exampleContainer: {
    marginBottom: 24,
  },
  exampleText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 34,
    textAlign: 'center',
  },
  explanationBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 16,
  },
  explanationText: {
    fontSize: 16,
    color: COLORS.textGray,
    lineHeight: 24,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.turquoise,
    width: 24,
  },
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
