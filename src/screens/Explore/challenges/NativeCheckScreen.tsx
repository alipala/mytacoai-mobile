/**
 * Native Check Screen - REFINED TINDER-STYLE SWIPE INTERFACE
 *
 * Fast, fluid swipe experience (no modals, no interruptions):
 * - Industry-standard swipe semantics (RIGHT=Natural, LEFT=Odd)
 * - Progressive overlay feedback (builds with swipe distance)
 * - Sentence as visual hero (larger font, reduced contrast)
 * - Progressive arrow disclosure (auto-hides after 3 swipes)
 * - 3-second undo for wrong answers (forgiveness mechanic)
 * - Asymmetric motion psychology (correct=light, wrong=heavy)
 * - Smooth flow: red overlay → undo → next card (no modal breaks)
 * - Review mistakes in Study Mode at session end
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  Animated as RNAnimated,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NativeCheckChallenge } from '../../../services/mockChallengeData';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { useAudio } from '../../../hooks/useAudio';
import { heartAPI } from '../../../services/heartAPI';
import { CHALLENGE_TYPE_API_NAMES } from '../../../types/hearts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Swipe thresholds
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ARROW_VISIBILITY_KEY = '@native_check_arrow_count';
const ARROW_HIDE_THRESHOLD = 3; // Hide arrows after 3 swipes

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
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [showArrows, setShowArrows] = useState(true);
  const [showUndo, setShowUndo] = useState(false);
  const [lastSwipe, setLastSwipe] = useState<{
    isCorrect: boolean;
    direction: 'left' | 'right';
  } | null>(null);

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer } = useCharacterState();
  const { play } = useAudio();

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const undoUsedRef = useRef<boolean>(false); // Track if undo was used
  const undoOpacity = useRef(new RNAnimated.Value(0)).current;

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  // Next card animation (stack effect)
  const nextCardScale = useSharedValue(0.92);
  const nextCardOpacity = useSharedValue(0.5);

  // Check arrow visibility on mount
  useEffect(() => {
    checkArrowVisibility();
  }, []);

  const checkArrowVisibility = async () => {
    try {
      const count = await AsyncStorage.getItem(ARROW_VISIBILITY_KEY);
      const swipeCount = count ? parseInt(count, 10) : 0;
      setShowArrows(swipeCount < ARROW_HIDE_THRESHOLD);
    } catch (error) {
      console.error('Failed to load arrow visibility:', error);
    }
  };

  const incrementArrowCount = async () => {
    try {
      const count = await AsyncStorage.getItem(ARROW_VISIBILITY_KEY);
      const swipeCount = count ? parseInt(count, 10) : 0;
      const newCount = swipeCount + 1;
      await AsyncStorage.setItem(ARROW_VISIBILITY_KEY, newCount.toString());

      if (newCount >= ARROW_HIDE_THRESHOLD) {
        setShowArrows(false);
      }
    } catch (error) {
      console.error('Failed to save arrow count:', error);
    }
  };

  // Reset state when challenge changes
  useEffect(() => {
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setIsAnswered(false);
    setShowXPAnimation(false);
    setShowUndo(false);
    setLastSwipe(null);
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;

    // Clear all timeouts
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    // Animate next card
    nextCardScale.value = withSpring(0.94);
    nextCardOpacity.value = withSpring(0.6);
  }, [challenge.id]);

  const handleUndo = async () => {
    if (!lastSwipe) return;

    // Mark that undo was used (prevents onComplete from being called)
    undoUsedRef.current = true;

    // Hide undo button immediately
    RNAnimated.timing(undoOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowUndo(false);
    });

    // Clear all timeouts (undo button hide + auto-advance)
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    // Call undo API
    try {
      const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES['native_check'] || 'native_check';
      const result = await heartAPI.undoHeartConsumption(
        challengeTypeAPI,
        challenge.id
      );

      if (result.success) {
        console.log('✅ Undo successful:', result);
      } else {
        console.warn('⚠️ Undo failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Undo API error:', error);
    }

    // Reset UI
    setIsAnswered(false);
    setShowXPAnimation(false);
    setLastSwipe(null);

    // Animate card back to center
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const handleSwipeComplete = (isNaturalSwipe: boolean) => {
    if (isAnswered) return;

    setIsAnswered(true);
    incrementArrowCount();

    // Reset undo tracking for new answer
    undoUsedRef.current = false;

    const isCorrect = isNaturalSwipe === challenge.isNatural;

    // Save last swipe for undo
    setLastSwipe({
      isCorrect,
      direction: isNaturalSwipe ? 'right' : 'left',
    });

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

    // Show undo button ONLY for wrong answers (3 second window)
    if (!isCorrect) {
      setShowUndo(true);
      RNAnimated.timing(undoOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Hide undo button after 3 seconds
      undoTimeoutRef.current = setTimeout(() => {
        RNAnimated.timing(undoOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowUndo(false);
          setLastSwipe(null);
        });
      }, 3000);
    }

    if (isCorrect) {
      // Calculate XP
      const timeSpent = 5;
      const combo = session?.currentCombo || 1;
      const xpResult = calculateXP(true, timeSpent, combo);

      setXPValue(xpResult.baseXP);
      setSpeedBonus(xpResult.speedBonus);

      // Delay XP animation from card center (200ms delay)
      setTimeout(() => {
        setShowXPAnimation(true);
      }, 200);

      // Auto-advance (correct answers advance immediately, no undo needed)
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)(challenge.id, true, {
              correctAnswer: challenge.isNatural ? 'Natural' : 'Not Natural',
              explanation: challenge.explanation,
            });
          }
        });
      }, 1200);
    } else {
      // Wrong answer - smooth advance after undo window (no modal, fast flow)
      // User sees red overlay + undo button, then smoothly advances
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        // Only advance if undo wasn't used
        if (!undoUsedRef.current) {
          screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
              runOnJS(onComplete)(challenge.id, false, {
                correctAnswer: challenge.isNatural ? 'Natural' : 'Not Natural',
                explanation: challenge.explanation,
              });
            }
          });
        }
      }, 3300); // Advance 300ms after undo window closes
    }
  };

  // Pan gesture for swiping with asymmetric motion
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (isAnswered) return;
      scale.value = withSpring(1.05, { damping: 15, stiffness: 150 });
    })
    .onUpdate((event) => {
      if (isAnswered) return;
      translateX.value = event.translationX;
      // Reduced vertical translation (less distracting)
      translateY.value = event.translationY * 0.1;
    })
    .onEnd((event) => {
      if (isAnswered) return;

      const velocityX = event.velocityX;
      const absTranslateX = Math.abs(translateX.value);

      if (absTranslateX > SWIPE_THRESHOLD || Math.abs(velocityX) > 500) {
        // Swipe completed
        const swipedRight = translateX.value > 0;
        const targetX = swipedRight ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        // Determine if answer is correct
        const isNaturalSwipe = swipedRight;
        const isCorrect = isNaturalSwipe === challenge.isNatural;

        // Asymmetric motion: correct=lighter/faster, wrong=heavier/slower
        const animConfig = isCorrect
          ? { velocity: velocityX, damping: 15, stiffness: 120 } // Light, confident
          : { velocity: velocityX * 0.8, damping: 25, stiffness: 80 }; // Heavier, slower

        // Animate card off screen
        translateX.value = withSpring(targetX, animConfig);
        translateY.value = withSpring(-SCREEN_HEIGHT * 0.08, {
          damping: 20,
          stiffness: 90,
        });
        scale.value = withSpring(0.8);

        // Handle answer (RIGHT = Natural, LEFT = Odd)
        runOnJS(handleSwipeComplete)(isNaturalSwipe);
      } else {
        // Snap back to center
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  // Card animated style
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12], // Reduced rotation for more subtle effect
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

  // Progressive overlay feedback (builds with swipe distance)
  const leftOverlayStyle = useAnimatedStyle(() => {
    const swipeDistance = Math.abs(translateX.value);
    const swipePercent = swipeDistance / SWIPE_THRESHOLD;

    // Progressive opacity
    let opacity = 0;
    if (translateX.value < 0) {
      if (swipePercent < 0.2) {
        // <20%: subtle tint only
        opacity = interpolate(swipePercent, [0, 0.2], [0, 0.15], Extrapolate.CLAMP);
      } else if (swipePercent < 0.5) {
        // 20-50%: label fades in
        opacity = interpolate(swipePercent, [0.2, 0.5], [0.15, 0.4], Extrapolate.CLAMP);
      } else {
        // 50%+: full feedback
        opacity = interpolate(swipePercent, [0.5, 1], [0.4, 0.8], Extrapolate.CLAMP);
      }
    }

    return { opacity };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    const swipeDistance = Math.abs(translateX.value);
    const swipePercent = swipeDistance / SWIPE_THRESHOLD;

    let opacity = 0;
    if (translateX.value > 0) {
      if (swipePercent < 0.2) {
        opacity = interpolate(swipePercent, [0, 0.2], [0, 0.15], Extrapolate.CLAMP);
      } else if (swipePercent < 0.5) {
        opacity = interpolate(swipePercent, [0.2, 0.5], [0.15, 0.4], Extrapolate.CLAMP);
      } else {
        opacity = interpolate(swipePercent, [0.5, 1], [0.4, 0.8], Extrapolate.CLAMP);
      }
    }

    return { opacity };
  });

  // Progressive label visibility
  const leftLabelOpacity = useAnimatedStyle(() => {
    const swipePercent = Math.abs(translateX.value) / SWIPE_THRESHOLD;
    const opacity = translateX.value < 0
      ? interpolate(swipePercent, [0.2, 0.5], [0, 1], Extrapolate.CLAMP)
      : 0;
    return { opacity };
  });

  const rightLabelOpacity = useAnimatedStyle(() => {
    const swipePercent = Math.abs(translateX.value) / SWIPE_THRESHOLD;
    const opacity = translateX.value > 0
      ? interpolate(swipePercent, [0.2, 0.5], [0, 1], Extrapolate.CLAMP)
      : 0;
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
        {/* Card Stack */}
        <View style={styles.cardStackContainer}>
          {/* Next card (behind) */}
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

          {/* Current card (front) - Swipeable */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              <LinearGradient
                colors={['#FFFFFF', '#FAFBFC']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {/* LEFT overlay - Sounds Odd */}
                <Animated.View style={[styles.overlayLeft, leftOverlayStyle]}>
                  <Animated.View style={[styles.overlayContent, leftLabelOpacity]}>
                    <Text style={styles.overlayIcon}>✗</Text>
                    <Text style={styles.overlayText}>Sounds Odd</Text>
                  </Animated.View>
                </Animated.View>

                {/* RIGHT overlay - Natural */}
                <Animated.View style={[styles.overlayRight, rightOverlayStyle]}>
                  <Animated.View style={[styles.overlayContent, rightLabelOpacity]}>
                    <Text style={styles.overlayIcon}>✓</Text>
                    <Text style={styles.overlayText}>Natural!</Text>
                  </Animated.View>
                </Animated.View>

                {/* Card content */}
                <View style={styles.cardContent}>
                  {/* Sentence as VISUAL HERO */}
                  <View style={styles.sentenceWrapper}>
                    <LinearGradient
                      colors={['#F8FBFF', '#F3F7FB']}
                      style={styles.sentenceGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.sentence}>{challenge.sentence}</Text>
                    </LinearGradient>
                  </View>

                  {/* Question - supportive microcopy (NOT bold) */}
                  <View style={styles.questionContainer}>
                    <View style={styles.questionBadge}>
                      <Text style={styles.questionText}>Would a native say this?</Text>
                    </View>

                    {/* Progressive arrow disclosure */}
                    {showArrows && (
                      <View style={styles.arrowsContainer}>
                        <View style={styles.arrowBoxLeft}>
                          <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            style={styles.arrowGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Text style={styles.arrowIcon}>←</Text>
                          </LinearGradient>
                          <Text style={styles.arrowLabelRed}>Sounds Odd</Text>
                        </View>

                        <View style={styles.arrowBoxRight}>
                          <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.arrowGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Text style={styles.arrowIcon}>→</Text>
                          </LinearGradient>
                          <Text style={styles.arrowLabelGreen}>Natural</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Undo Button (3-second forgiveness mechanic - wrong answers only) */}
        {showUndo && (
          <RNAnimated.View
            style={[
              styles.undoContainer,
              {
                opacity: undoOpacity,
                transform: [
                  {
                    translateY: undoOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.undoButton}
              onPress={handleUndo}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.undoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="arrow-undo" size={20} color="#FFF" />
                <Text style={styles.undoText}>Undo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </RNAnimated.View>
        )}

        {/* XP Flying Animation - originates from card center */}
        {showXPAnimation && (
          <XPFlyingNumber
            value={xpValue}
            startX={SCREEN_WIDTH / 2}
            startY={SCREEN_HEIGHT * 0.35}
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
    borderWidth: 2,
    borderColor: '#A5B4FC',
  },
  nextCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCardText: {
    fontSize: 20,
    fontWeight: '700',
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
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardGradient: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  overlayLeft: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  overlayRight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayIcon: {
    fontSize: 80,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 0.3,
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
    padding: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  sentence: {
    fontSize: 28, // Larger font - sentence as hero
    fontWeight: '500', // Not bold - professional feel
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 40,
  },
  questionContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  questionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionText: {
    fontSize: 14, // Smaller - supportive microcopy
    fontWeight: '500', // NOT bold
    color: '#64748B', // Lighter color
    textAlign: 'center',
    letterSpacing: 0.2,
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
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  arrowIcon: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowLabelGreen: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    letterSpacing: 0.3,
  },
  arrowLabelRed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  undoContainer: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
  },
  undoButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  undoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  undoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
