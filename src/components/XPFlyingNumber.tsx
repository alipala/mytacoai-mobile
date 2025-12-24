/**
 * XPFlyingNumber Component
 *
 * Animated XP number that flies from tap point to XP badge
 * Creates visual connection between action and reward
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface XPFlyingNumberProps {
  value: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speedBonus?: number;
  onComplete: () => void;
  delay?: number;
}

export function XPFlyingNumber({
  value,
  startX,
  startY,
  endX,
  endY,
  speedBonus = 0,
  onComplete,
  delay = 0,
}: XPFlyingNumberProps) {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Delay before starting (allows tap burst to show first)
    const startDelay = delay;

    // Appear with pop
    opacity.value = withDelay(
      startDelay,
      withTiming(1, { duration: 100 })
    );

    scale.value = withDelay(
      startDelay,
      withSequence(
        withTiming(1.5, { duration: 150, easing: Easing.out(Easing.back(2)) }),
        withTiming(1.0, { duration: 100 })
      )
    );

    // Arc trajectory (parabolic path)
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 50; // Arc upward

    // Fly to destination in two stages (for arc effect)
    translateX.value = withDelay(
      startDelay + 200,
      withTiming(endX, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    );

    translateY.value = withDelay(
      startDelay + 200,
      withSequence(
        // Up to arc peak
        withTiming(midY, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        }),
        // Down to destination
        withTiming(endY, {
          duration: 200,
          easing: Easing.in(Easing.quad),
        })
      ),
      (finished) => {
        if (finished) {
          // Disappear on arrival
          opacity.value = withTiming(0, { duration: 100 });
          runOnJS(onComplete)();
        }
      }
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.xpText}>+{value} XP</Text>
      {speedBonus > 0 && (
        <Text style={styles.bonusText}>⚡ +{speedBonus}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  xpText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
