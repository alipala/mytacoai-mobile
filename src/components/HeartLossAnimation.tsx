/**
 * HeartLossAnimation Component
 *
 * Animated broken heart effect when user loses a heart
 * Features:
 * - Heart breaks into pieces
 * - Pieces fall and fade out
 * - Particle burst effect
 * - Haptic feedback
 *
 * Inspired by research from:
 * - React Native heart animations with Reanimated
 * - Particle effect patterns
 */

import React, { useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface HeartLossAnimationProps {
  x: number;                    // Starting X position
  y: number;                    // Starting Y position
  onComplete: () => void;       // Callback when animation completes
}

export function HeartLossAnimation({ x, y, onComplete }: HeartLossAnimationProps) {
  // Heart animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Left piece animation
  const leftPieceX = useSharedValue(0);
  const leftPieceY = useSharedValue(0);
  const leftPieceRotation = useSharedValue(0);
  const leftPieceOpacity = useSharedValue(1);

  // Right piece animation
  const rightPieceX = useSharedValue(0);
  const rightPieceY = useSharedValue(0);
  const rightPieceRotation = useSharedValue(0);
  const rightPieceOpacity = useSharedValue(1);

  useEffect(() => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Main heart animation sequence
    // 1. Shake
    rotation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // 2. Scale pulse (distress)
    scale.value = withSequence(
      withTiming(1.2, { duration: 100, easing: Easing.out(Easing.quad) }),
      withTiming(0.9, { duration: 100, easing: Easing.in(Easing.quad) })
    );

    // 3. Break apart (after shake)
    setTimeout(() => {
      // Hide main heart
      opacity.value = withTiming(0, { duration: 100 });

      // Left piece flies to bottom-left
      leftPieceX.value = withTiming(-40, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      leftPieceY.value = withTiming(80, {
        duration: 600,
        easing: Easing.in(Easing.quad), // Gravity effect
      });
      leftPieceRotation.value = withTiming(-45, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      leftPieceOpacity.value = withTiming(
        0,
        { duration: 600 },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        }
      );

      // Right piece flies to bottom-right
      rightPieceX.value = withTiming(40, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      rightPieceY.value = withTiming(80, {
        duration: 600,
        easing: Easing.in(Easing.quad), // Gravity effect
      });
      rightPieceRotation.value = withTiming(45, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      rightPieceOpacity.value = withTiming(0, { duration: 600 });
    }, 200); // Start breaking after shake
  }, []);

  // Animated styles for main heart
  const mainHeartStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  // Animated styles for left piece
  const leftPieceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: leftPieceX.value },
      { translateY: leftPieceY.value },
      { rotate: `${leftPieceRotation.value}deg` },
      { scale: 0.6 },
    ],
    opacity: leftPieceOpacity.value,
  }));

  // Animated styles for right piece
  const rightPieceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rightPieceX.value },
      { translateY: rightPieceY.value },
      { rotate: `${rightPieceRotation.value}deg` },
      { scale: 0.6 },
    ],
    opacity: rightPieceOpacity.value,
  }));

  return (
    <>
      {/* Main heart (whole) - shows during shake */}
      <Animated.View
        style={[
          styles.heartContainer,
          { left: x - 20, top: y - 20 },
          mainHeartStyle,
        ]}
        pointerEvents="none"
      >
        <Ionicons name="heart" size={40} color="#FF6B9D" />
      </Animated.View>

      {/* Left piece (broken half) */}
      <Animated.View
        style={[
          styles.heartContainer,
          { left: x - 20, top: y - 20 },
          leftPieceStyle,
        ]}
        pointerEvents="none"
      >
        <Ionicons name="heart-half" size={40} color="#FF6B9D" />
      </Animated.View>

      {/* Right piece (broken half - flipped) */}
      <Animated.View
        style={[
          styles.heartContainer,
          { left: x - 20, top: y - 20 },
          rightPieceStyle,
        ]}
        pointerEvents="none"
      >
        <Ionicons
          name="heart-half"
          size={40}
          color="#FF6B9D"
          style={{ transform: [{ scaleX: -1 }] }}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  heartContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
