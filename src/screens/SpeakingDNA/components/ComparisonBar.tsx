/**
 * Comparison Bar Component
 *
 * Animated progress bar showing improvement/decline
 * compared to previous session with +/- indicator
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOWS, SPRING_CONFIGS } from '../constants';

interface ComparisonBarProps {
  icon: string;
  label: string;
  value: string;
  isPositive: boolean;
  delay?: number;
  maxWidth?: number;
}

/**
 * Comparison Bar Component
 */
export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  icon,
  label,
  value,
  isPositive,
  delay = 0,
  maxWidth = 100,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const barWidth = useSharedValue(0);
  const iconScale = useSharedValue(0);

  const color = isPositive ? COLORS.success : COLORS.error;
  const bgColor = isPositive ? `${COLORS.success}15` : `${COLORS.error}15`;

  /**
   * Entry animations
   */
  useEffect(() => {
    // Card fade in
    opacity.value = withDelay(delay, withSpring(1, SPRING_CONFIGS.gentle));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIGS.bouncy));

    // Bar growth animation
    barWidth.value = withDelay(
      delay + 200,
      withTiming(maxWidth, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Icon pop animation
    iconScale.value = withDelay(
      delay + 400,
      withSpring(1, SPRING_CONFIGS.bouncy)
    );
  }, [delay, maxWidth]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Animated.View style={[styles.card, SHADOWS.sm, cardAnimatedStyle]}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.emoji}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Animated.View style={[styles.valueContainer, iconAnimatedStyle]}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={16}
            color={color}
          />
          <Text style={[styles.value, { color }]}>{value}</Text>
        </Animated.View>
      </View>

      {/* Animated progress bar */}
      <View style={[styles.barTrack, { backgroundColor: bgColor }]}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: color },
            barAnimatedStyle,
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ComparisonBar;
