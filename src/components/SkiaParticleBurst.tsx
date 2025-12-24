/**
 * SkiaParticleBurst Component (NO GROUP TRANSFORMS - STABLE)
 *
 * High-performance particle burst effect using React Native Skia
 * Avoids Group transforms that cause Reanimated crashes
 * Uses circles only for maximum stability
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SkiaParticle {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
  hasGlow: boolean;
  hasTrail: boolean;
}

interface SkiaParticleBurstProps {
  x: number;
  y: number;
  particleCount?: number;
  colors?: string[];
  preset?: 'success' | 'combo' | 'xp' | 'celebration';
  onComplete?: () => void;
}

const PRESETS = {
  success: {
    particleCount: 40,
    colors: ['#10B981', '#34D399', '#6EE7B7', '#FFD700'],
    velocity: { min: 80, max: 180 },
    lifetime: 800,
    glow: true,
  },
  combo: {
    particleCount: 60,
    colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FF6347'],
    velocity: { min: 100, max: 220 },
    lifetime: 900,
    glow: true,
  },
  xp: {
    particleCount: 30,
    colors: ['#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC'],
    velocity: { min: 60, max: 140 },
    lifetime: 700,
    glow: false,
  },
  celebration: {
    particleCount: 80,
    colors: ['#FFD700', '#FF6347', '#10B981', '#06B6D4', '#C084FC', '#F59E0B'],
    velocity: { min: 120, max: 250 },
    lifetime: 1000,
    glow: true,
  },
};

function generateParticles(
  x: number,
  y: number,
  preset: keyof typeof PRESETS,
  customCount?: number,
  customColors?: string[]
): SkiaParticle[] {
  const config = PRESETS[preset];
  const count = customCount || config.particleCount;
  const colors = customColors || config.colors;

  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min);

    return {
      id: i,
      startX: x,
      startY: y,
      angle,
      velocity,
      size: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      hasGlow: config.glow && Math.random() > 0.5,
      hasTrail: Math.random() > 0.5,
    };
  });
}

export function SkiaParticleBurst({
  x,
  y,
  particleCount,
  colors,
  preset = 'success',
  onComplete,
}: SkiaParticleBurstProps) {
  const progress = useSharedValue(0);
  const particles = useMemo(
    () => generateParticles(x, y, preset, particleCount, colors),
    [x, y, preset, particleCount, colors]
  );

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: PRESETS[preset].lifetime,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );
  }, [preset, onComplete]);

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      {particles.map((particle) => (
        <SkiaParticleItem key={particle.id} particle={particle} progress={progress} />
      ))}
    </Canvas>
  );
}

interface SkiaParticleItemProps {
  particle: SkiaParticle;
  progress: ReturnType<typeof useSharedValue>;
}

function SkiaParticleItem({ particle, progress }: SkiaParticleItemProps) {
  // Calculate position
  const cx = useDerivedValue(() => {
    const t = progress.value;
    const distance = particle.velocity * t;
    const curve = Math.sin(t * Math.PI) * 20;
    return particle.startX + Math.cos(particle.angle) * distance + curve;
  });

  const cy = useDerivedValue(() => {
    const t = progress.value;
    const distance = particle.velocity * t;
    const gravity = t * t * 100;
    return particle.startY + Math.sin(particle.angle) * distance + gravity;
  });

  // Calculate opacity
  const opacity = useDerivedValue(() => {
    const t = progress.value;
    if (t < 0.1) {
      return t * 10;
    } else if (t > 0.7) {
      return (1 - t) / 0.3;
    }
    return 1;
  });

  // Calculate scale
  const scale = useDerivedValue(() => {
    const t = progress.value;
    if (t < 0.15) {
      return t * 6.67;
    } else if (t > 0.8) {
      return 1 - (t - 0.8) * 5;
    }
    return 1;
  });

  // Main particle radius
  const mainR = useDerivedValue(() => particle.size * scale.value);

  // Trail calculations
  const trailCx = useDerivedValue(() => {
    const t = Math.max(0, progress.value - 0.05);
    const distance = particle.velocity * t;
    const curve = Math.sin(t * Math.PI) * 20;
    return particle.startX + Math.cos(particle.angle) * distance + curve;
  });

  const trailCy = useDerivedValue(() => {
    const t = Math.max(0, progress.value - 0.05);
    const distance = particle.velocity * t;
    const gravity = t * t * 100;
    return particle.startY + Math.sin(particle.angle) * distance + gravity;
  });

  const trailOpacity = useDerivedValue(() => opacity.value * 0.3);
  const trailR = useDerivedValue(() => particle.size * scale.value * 0.7);
  const glowOpacity = useDerivedValue(() => opacity.value * 0.5);

  return (
    <>
      {/* Trail */}
      {particle.hasTrail && (
        <Circle cx={trailCx} cy={trailCy} r={trailR} color={particle.color} opacity={trailOpacity} />
      )}

      {/* Main particle */}
      <Circle cx={cx} cy={cy} r={mainR} color={particle.color} opacity={opacity} />

      {/* Glow layer */}
      {particle.hasGlow && (
        <Circle cx={cx} cy={cy} r={mainR} color={particle.color} opacity={glowOpacity}>
          <BlurMask blur={6} style="solid" />
        </Circle>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});
