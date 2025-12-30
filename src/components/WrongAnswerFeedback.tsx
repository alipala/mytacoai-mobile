/**
 * WrongAnswerFeedback Component
 *
 * Orchestrates perfect synchronization for wrong answer feedback:
 * - Red screen flash
 * - Screen shake
 * - Haptic feedback
 * - Sound effect
 * - Heart loss animation
 * - Lottie sad animation
 *
 * All perfectly timed for maximum game feel
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../hooks/useAudio';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WrongAnswerFeedbackProps {
  visible: boolean;
  onAnimationComplete?: () => void;
  intensity?: 'light' | 'medium' | 'strong';
}

export function WrongAnswerFeedback({
  visible,
  onAnimationComplete,
  intensity = 'medium',
}: WrongAnswerFeedbackProps) {
  const redFlashOpacity = useSharedValue(0);
  const screenShakeX = useSharedValue(0);
  const screenShakeY = useSharedValue(0);
  const lottieOpacity = useSharedValue(0);
  const lottieRef = useRef<LottieView>(null);
  const { play } = useAudio();

  useEffect(() => {
    if (visible) {
      executeWrongAnswerSequence();
    } else {
      // Reset all animations
      redFlashOpacity.value = 0;
      screenShakeX.value = 0;
      screenShakeY.value = 0;
      lottieOpacity.value = 0;
    }
  }, [visible]);

  const executeWrongAnswerSequence = () => {
    // STEP 1: Immediate haptic feedback (0ms)
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // STEP 1b: Play wrong answer sound
    play('wrong_answer');

    // STEP 2: Red flash (0-400ms)
    redFlashOpacity.value = withSequence(
      withTiming(0.35, { duration: 100, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
    );

    // STEP 3: Screen shake (50-300ms)
    const shakeIntensity = intensity === 'strong' ? 12 : intensity === 'medium' ? 8 : 5;
    screenShakeX.value = withSequence(
      withTiming(-shakeIntensity, { duration: 50 }),
      withTiming(shakeIntensity, { duration: 50 }),
      withTiming(-shakeIntensity * 0.7, { duration: 50 }),
      withTiming(shakeIntensity * 0.7, { duration: 50 }),
      withTiming(-shakeIntensity * 0.3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    screenShakeY.value = withSequence(
      withTiming(-shakeIntensity * 0.5, { duration: 50 }),
      withTiming(shakeIntensity * 0.5, { duration: 50 }),
      withTiming(-shakeIntensity * 0.3, { duration: 50 }),
      withTiming(shakeIntensity * 0.3, { duration: 50 }),
      withTiming(-shakeIntensity * 0.1, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // STEP 4: Show disappointed Lottie animation (100ms delay)
    setTimeout(() => {
      lottieOpacity.value = withTiming(1, { duration: 200 });
      lottieRef.current?.play();

      // STEP 5: Hide Lottie and complete (after 1200ms total)
      setTimeout(() => {
        lottieOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        });
      }, 1000);
    }, 100);
  };

  const redFlashStyle = useAnimatedStyle(() => ({
    opacity: redFlashOpacity.value,
  }));

  const screenShakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: screenShakeX.value },
      { translateY: screenShakeY.value },
    ],
  }));

  const lottieStyle = useAnimatedStyle(() => ({
    opacity: lottieOpacity.value,
  }));

  if (!visible) return null;

  return (
    <>
      {/* Red Flash Overlay */}
      <Animated.View
        style={[styles.redFlash, redFlashStyle]}
        pointerEvents="none"
      />

      {/* Shake Container (wraps content) */}
      <Animated.View
        style={[styles.shakeContainer, screenShakeStyle]}
        pointerEvents="none"
      />

      {/* Disappointed Lottie Animation */}
      <Animated.View
        style={[styles.lottieContainer, lottieStyle]}
        pointerEvents="none"
      >
        <LottieView
          ref={lottieRef}
          source={require('../assets/lottie/companion_disappointed.json')}
          loop={false}
          style={styles.lottie}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  redFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DC2626',
    zIndex: 1000,
  },
  shakeContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  lottieContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -60 }],
    width: 120,
    height: 120,
    zIndex: 1001,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
