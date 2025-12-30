/**
 * HeartDisplay Component (REDESIGNED)
 *
 * Displays individual hearts in a row with smooth animations
 * - Individual hearts: ❤️❤️❤️🤍🤍
 * - Smooth fade/scale on heart loss
 * - Bounce on heart gain
 * - Shield glow effect when active
 * - Perfect synchronization with game events
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { HeartPool } from '../types/hearts';

interface HeartDisplayProps {
  heartPool: HeartPool;
  showShield?: boolean;
  size?: 'small' | 'medium' | 'large';
  previousHearts?: number; // For animation detection
  onHeartLost?: () => void; // Callback when heart is lost
  separateShield?: boolean; // Show divider between shield and hearts
}

// Individual Heart Component with animation
const AnimatedHeart = ({
  isFilled,
  index,
  size,
  shouldAnimate,
  animationType
}: {
  isFilled: boolean;
  index: number;
  size: 'small' | 'medium' | 'large';
  shouldAnimate: boolean;
  animationType: 'lose' | 'gain' | 'none';
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const sizes = {
    small: 20,
    medium: 28,
    large: 36,
  };

  const heartSize = sizes[size];

  useEffect(() => {
    if (shouldAnimate && animationType === 'lose') {
      // Heart loss: Scale down + fade out
      scale.value = withSequence(
        withTiming(1.2, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0.6, { duration: 300, easing: Easing.in(Easing.quad) })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.3, { duration: 300 })
      );
    } else if (shouldAnimate && animationType === 'gain') {
      // Heart gain: Pop in with bounce
      scale.value = 0;
      opacity.value = 0;
      scale.value = withDelay(
        index * 50,
        withSpring(1, {
          damping: 8,
          stiffness: 200,
          overshootClamping: false,
        })
      );
      opacity.value = withDelay(
        index * 50,
        withTiming(1, { duration: 200 })
      );
    } else {
      // Reset to normal state
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(isFilled ? 1 : 0.3, { duration: 200 });
    }
  }, [shouldAnimate, animationType, isFilled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.heart, { fontSize: heartSize }]}>
        {isFilled ? '❤️' : '🤍'}
      </Text>
    </Animated.View>
  );
};

// Shield Component with glow effect
const ShieldIcon = ({ size }: { size: 'small' | 'medium' | 'large' }) => {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const sizes = {
    small: 18,
    medium: 24,
    large: 32,
  };

  const shieldSize = sizes[size];

  useEffect(() => {
    // Continuous glow pulse
    glowScale.value = withSequence(
      withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
    );
    glowOpacity.value = withSequence(
      withTiming(0.6, { duration: 800 }),
      withTiming(0.2, { duration: 800 })
    );

    // Repeat
    const interval = setInterval(() => {
      glowScale.value = withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      );
      glowOpacity.value = withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.2, { duration: 800 })
      );
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.shieldContainer}>
      {/* Glow effect */}
      <Animated.View style={[styles.shieldGlow, glowStyle]} />
      {/* Shield icon */}
      <Text style={[styles.shieldIcon, { fontSize: shieldSize }]}>🛡️</Text>
    </View>
  );
};

export function HeartDisplay({
  heartPool,
  showShield = true,
  size = 'medium',
  previousHearts,
  onHeartLost,
  separateShield = false,
}: HeartDisplayProps) {
  const containerShake = useSharedValue(0);

  // Detect heart changes
  useEffect(() => {
    if (previousHearts === undefined) return;

    if (heartPool.currentHearts < previousHearts) {
      // Heart lost - NO shake animation (WrongAnswerFeedback handles screen shake)
      // Just trigger callback if needed
      if (onHeartLost) {
        setTimeout(onHeartLost, 0);
      }
    }
  }, [heartPool.currentHearts, previousHearts]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: containerShake.value }],
  }));

  // Determine animation type
  const getAnimationType = (): 'lose' | 'gain' | 'none' => {
    if (previousHearts === undefined) return 'none';
    if (heartPool.currentHearts < previousHearts) return 'lose';
    if (heartPool.currentHearts > previousHearts) return 'gain';
    return 'none';
  };

  const animationType = getAnimationType();

  // Unlimited hearts (Language Mastery)
  if (heartPool.maxHearts >= 999999) {
    return (
      <View style={styles.unlimitedContainer}>
        <Text style={styles.unlimitedText}>∞</Text>
        <Text style={[styles.heart, { fontSize: sizes[size].heart }]}>❤️</Text>
      </View>
    );
  }

  const sizes = {
    small: { heart: 20, gap: 4 },
    medium: { heart: 28, gap: 6 },
    large: { heart: 36, gap: 8 },
  };

  // Render individual hearts
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < heartPool.maxHearts; i++) {
      const isFilled = i < heartPool.currentHearts;
      const shouldAnimate =
        animationType !== 'none' &&
        (animationType === 'lose' ? i === heartPool.currentHearts : i === heartPool.currentHearts - 1);

      hearts.push(
        <AnimatedHeart
          key={i}
          isFilled={isFilled}
          index={i}
          size={size}
          shouldAnimate={shouldAnimate}
          animationType={animationType}
        />
      );
    }
    return hearts;
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Shield (before hearts) */}
      {showShield && heartPool.shieldActive && (
        <ShieldIcon size={size} />
      )}

      {/* Divider between shield and hearts */}
      {separateShield && showShield && heartPool.shieldActive && (
        <View style={styles.shieldDivider} />
      )}

      {/* Hearts Row */}
      <View style={[styles.heartsRow, { gap: sizes[size].gap }]}>
        {renderHearts()}
      </View>

      {/* Refill timer (if refilling) */}
      {heartPool.refillInProgress && heartPool.refillInfo && heartPool.currentHearts === 0 && (
        <View style={styles.refillBadge}>
          <Text style={styles.refillText}>
            ⏳ {Math.ceil(heartPool.refillInfo.nextHeartInMinutes)}m
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    lineHeight: undefined, // Let the emoji determine its own height
  },
  unlimitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  unlimitedText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EC4899',
  },
  shieldContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  shieldGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
  },
  shieldIcon: {
    zIndex: 1,
  },
  shieldDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  refillBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  refillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
});
