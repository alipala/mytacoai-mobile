/**
 * Native Check Screen - IMMERSIVE TINDER-STYLE SWIPE INTERFACE
 *
 * Beautiful, colorful card-swiping experience:
 * - Vibrant, modern design
 * - Card positioned right after progress bar
 * - Colorful arrows and text
 * - Swipe LEFT = "Natural" ✓
 * - Swipe RIGHT = "Sounds Odd" ✗
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { NativeCheckChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { useAudio } from '../../../hooks/useAudio';
import { LearningCompanion } from '../../../components/LearningCompanion';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Swipe thresholds
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

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
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer } = useCharacterState();
  const { play } = useAudio();

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  // Next card animation (stack effect)
  const nextCardScale = useSharedValue(0.92);
  const nextCardOpacity = useSharedValue(0.5);

  // Reset state when challenge changes
  useEffect(() => {
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setIsAnswered(false);
    setShowCelebration(false);
    setShowXPAnimation(false);
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;

    // Animate next card
    nextCardScale.value = withSpring(0.94);
    nextCardOpacity.value = withSpring(0.6);
  }, [challenge.id]);

  const handleSwipeComplete = (isNaturalSwipe: boolean) => {
    if (isAnswered) return;

    setIsAnswered(true);

    const isCorrect = isNaturalSwipe === challenge.isNatural;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    // Play sound
    if (isCorrect) {
      play('correct_answer');
    } else {
      play('wrong_answer');
    }

    // React character
    reactToAnswer(isCorrect);

    if (isCorrect) {
      // Calculate XP
      const timeSpent = 5;
      const combo = session?.currentCombo || 1;
      const xpResult = calculateXP(true, timeSpent, combo);

      setXPValue(xpResult.baseXP);
      setSpeedBonus(xpResult.speedBonus);

      // Show XP animation
      setShowXPAnimation(true);

      // Auto-advance
      setTimeout(() => {
        screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)(challenge.id, true, {
              correctAnswer: challenge.isNatural ? 'Natural' : 'Not Natural',
              explanation: challenge.explanation,
            });
          }
        });
      }, 800);
    } else {
      // Wrong answer
      setTimeout(() => {
        setShowCelebration(true);
      }, 300);

      setTimeout(() => {
        screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)(challenge.id, false, {
              correctAnswer: challenge.isNatural ? 'Natural' : 'Not Natural',
              explanation: challenge.explanation,
            });
          }
        });
      }, 2500);
    }
  };

  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (isAnswered) return;
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      if (isAnswered) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2;
    })
    .onEnd((event) => {
      if (isAnswered) return;

      const velocityX = event.velocityX;
      const absTranslateX = Math.abs(translateX.value);

      if (absTranslateX > SWIPE_THRESHOLD || Math.abs(velocityX) > 500) {
        // Swipe completed
        const swipedLeft = translateX.value < 0;
        const targetX = swipedLeft ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;

        // Animate card off screen
        translateX.value = withSpring(targetX, {
          velocity: velocityX,
          damping: 20,
          stiffness: 90,
        });
        translateY.value = withSpring(-SCREEN_HEIGHT * 0.1, {
          damping: 20,
          stiffness: 90,
        });
        scale.value = withSpring(0.8);

        // Handle answer (LEFT = Natural, RIGHT = Odd)
        runOnJS(handleSwipeComplete)(swipedLeft);
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  // Card animated style
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Left overlay (Natural)
  const leftOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, -50, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  // Right overlay (Odd)
  const rightOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50, SCREEN_WIDTH / 2],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  // Next card style
  const nextCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextCardScale.value }],
    opacity: nextCardOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, screenAnimatedStyle]}>
        {/* Card Stack - Right after progress bar */}
        <View style={styles.cardStackContainer}>
          {/* Next card (behind) - Colorful stack effect */}
          <Animated.View style={[styles.nextCard, nextCardAnimatedStyle]}>
            <LinearGradient
              colors={['#E0E7FF', '#C7D2FE']}
              style={styles.nextCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.nextCardInner}>
                <Text style={styles.nextCardText}>Next ⚡</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Current card (front) - Swipeable with gradient */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC', '#F1F5F9']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {/* LEFT overlay - Natural with vibrant green */}
                <Animated.View style={[styles.overlayLeft, leftOverlayStyle]}>
                  <View style={styles.overlayContent}>
                    <Text style={styles.overlayIcon}>✓</Text>
                    <Text style={styles.overlayText}>Natural!</Text>
                  </View>
                </Animated.View>

                {/* RIGHT overlay - Odd with vibrant red */}
                <Animated.View style={[styles.overlayRight, rightOverlayStyle]}>
                  <View style={styles.overlayContent}>
                    <Text style={styles.overlayIcon}>✗</Text>
                    <Text style={styles.overlayText}>Sounds Odd</Text>
                  </View>
                </Animated.View>

                {/* Card content */}
                <View style={styles.cardContent}>
                  {/* Sentence with colorful background */}
                  <View style={styles.sentenceWrapper}>
                    <LinearGradient
                      colors={['#F0F9FF', '#E0F2FE']}
                      style={styles.sentenceGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.sentence}>{challenge.sentence}</Text>
                    </LinearGradient>
                  </View>

                  {/* Question with colorful styling */}
                  <View style={styles.questionContainer}>
                    <View style={styles.questionBadge}>
                      <Text style={styles.questionText}>Would a native say this?</Text>
                    </View>

                    {/* Colorful arrows INSIDE card */}
                    <View style={styles.arrowsContainer}>
                      <View style={styles.arrowBoxLeft}>
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          style={styles.arrowGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.arrowIcon}>←</Text>
                        </LinearGradient>
                        <Text style={styles.arrowLabelGreen}>Natural</Text>
                      </View>

                      <View style={styles.arrowBoxRight}>
                        <LinearGradient
                          colors={['#EF4444', '#DC2626']}
                          style={styles.arrowGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.arrowIcon}>→</Text>
                        </LinearGradient>
                        <Text style={styles.arrowLabelRed}>Sounds Odd</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Feedback overlay (wrong answers) */}
        {showCelebration && (
          <View style={styles.feedbackOverlay}>
            <View style={styles.feedbackCard}>
              <LearningCompanion
                state={characterState}
                combo={session?.currentCombo || 1}
                size={96}
              />
              <Text style={[styles.feedbackTitle, { color: '#DC2626' }]}>
                Not quite!
              </Text>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Why:</Text>
                <Text style={styles.explanationText}>
                  {challenge.explanation}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* XP Flying Animation */}
        {showXPAnimation && !showCelebration && (
          <XPFlyingNumber
            value={xpValue}
            startX={SCREEN_WIDTH / 2}
            startY={SCREEN_HEIGHT * 0.4}
            endX={SCREEN_WIDTH - 80}
            endY={60}
            speedBonus={speedBonus}
            onComplete={() => setShowXPAnimation(false)}
            delay={0}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cardStackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nextCard: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: 520,
    borderRadius: 28,
  },
  nextCardGradient: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#A5B4FC',
  },
  nextCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCardText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 520,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  cardGradient: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  overlayLeft: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#10B981',
  },
  overlayRight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#EF4444',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayIcon: {
    fontSize: 96,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    marginBottom: 12,
  },
  overlayText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  sentenceWrapper: {
    marginTop: 20,
  },
  sentenceGradient: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    ...Platform.select({
      ios: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  sentence: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 34,
  },
  questionContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  questionBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  arrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  arrowBoxLeft: {
    alignItems: 'center',
  },
  arrowBoxRight: {
    alignItems: 'center',
  },
  arrowGradient: {
    width: 70,
    height: 70,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  arrowIcon: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  arrowLabelGreen: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
    letterSpacing: 0.5,
  },
  arrowLabelRed: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  feedbackTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  explanationBox: {
    backgroundColor: COLORS.lightGray,
    padding: 24,
    borderRadius: 18,
    width: '100%',
  },
  explanationLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 16,
    color: COLORS.textGray,
    lineHeight: 26,
  },
});
