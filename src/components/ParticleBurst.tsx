/**
 * ParticleBurst Component
 *
 * Lightweight particle burst effect using Reanimated
 * Creates explosion of particles from tap point
 * (Can be upgraded to Skia for more complex effects later)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

interface ParticleBurstProps {
  x: number;
  y: number;
  particleCount?: number;
  colors?: string[];
  onComplete: () => void;
}

export function ParticleBurst({
  x,
  y,
  particleCount = 12,
  colors = ['#FFD700', '#FFA500', '#FF6347', '#10B981', '#06B6D4'],
  onComplete,
}: ParticleBurstProps) {
  // Generate particles in a circle pattern
  const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / particleCount,
    distance: 40 + Math.random() * 40, // Random distance 40-80px
    size: 6 + Math.random() * 6, // Random size 6-12px
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleItem
          key={particle.id}
          particle={particle}
          onComplete={particle.id === 0 ? onComplete : undefined}
        />
      ))}
    </View>
  );
}

interface ParticleItemProps {
  particle: Particle;
  onComplete?: () => void;
}

function ParticleItem({ particle, onComplete }: ParticleItemProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Calculate destination based on angle and distance
    const destX = Math.cos(particle.angle) * particle.distance;
    const destY = Math.sin(particle.angle) * particle.distance;

    // Burst animation
    opacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    scale.value = withSequence(
      withTiming(1.5, { duration: 100, easing: Easing.out(Easing.back(2)) }),
      withTiming(0.5, { duration: 400, easing: Easing.in(Easing.cubic) })
    );

    translateX.value = withTiming(destX, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    translateY.value = withTiming(
      destY,
      {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && onComplete) {
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
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
  },
});
