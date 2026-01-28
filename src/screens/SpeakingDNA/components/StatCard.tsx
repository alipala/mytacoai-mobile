/**
 * Stat Card Component
 *
 * Animated card displaying session statistics
 * with number counter animation and icon
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOWS, SPRING_CONFIGS } from '../constants';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  iconColor: string;
  delay?: number;
  animateNumber?: boolean;
}

/**
 * Extract numeric value from string for animation
 */
const extractNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

/**
 * Format value with suffix/prefix preserved
 */
const formatValue = (original: string | number, current: number): string => {
  if (typeof original === 'number') return Math.round(current).toString();

  const numStr = Math.round(current).toString();
  const prefix = original.toString().match(/^[^\d.]*/)?.[0] || '';
  const suffix = original.toString().match(/[^\d.]*$/)?.[0] || '';

  return `${prefix}${numStr}${suffix}`;
};

/**
 * Stat Card Component
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  iconColor,
  delay = 0,
  animateNumber = true,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.9);
  const [displayValue, setDisplayValue] = React.useState('0');

  /**
   * Animate number counter
   */
  useEffect(() => {
    if (!animateNumber) {
      setDisplayValue(value.toString());
      return;
    }

    const targetNumber = extractNumber(value);
    const animatedValue = useSharedValue(0);

    animatedValue.value = withDelay(
      delay,
      withTiming(targetNumber, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      }, () => {
        runOnJS(setDisplayValue)(formatValue(value, targetNumber));
      })
    );

    // Update display value during animation
    const interval = setInterval(() => {
      setDisplayValue(formatValue(value, animatedValue.value));
    }, 16);

    return () => clearInterval(interval);
  }, [value, delay, animateNumber]);

  /**
   * Entry animation
   */
  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, SPRING_CONFIGS.gentle));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIGS.bouncy));
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIGS.bouncy));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.card, SHADOWS.sm, animatedStyle]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{displayValue}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
    textAlign: 'center',
  },
});

export default StatCard;
