/**
 * Full Screen Celebration Component
 *
 * Displays a full-screen celebration animation when user answers correctly
 * - Shows companion_celebrate.json animation in center
 * - Dims/transparentizes the background
 * - Auto-hides after animation completes
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FullScreenCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function FullScreenCelebration({
  visible,
  onComplete,
}: FullScreenCelebrationProps) {
  const lottieRef = useRef<LottieView>(null);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      // Play the animation
      if (lottieRef.current) {
        lottieRef.current.reset();
        lottieRef.current.play();
      }

      // Fade in and scale up
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      scale.value = withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 100 })
      );

      // Auto-hide after animation (celebration animation is ~1.5s)
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      opacity.value = 0;
      scale.value = 0.5;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      {/* Dimmed background overlay */}
      <View style={styles.backdrop} />

      {/* Celebration animation */}
      <Animated.View style={[styles.animationContainer, animationStyle]}>
        <LottieView
          ref={lottieRef}
          source={require('../assets/lottie/companion_celebrate.json')}
          style={styles.animation}
          loop={false}
          speed={1}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
