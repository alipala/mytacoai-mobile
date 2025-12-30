/**
 * Streak Shield Indicator Component
 *
 * Displays current correct answer streak and shield activation status
 * Features:
 * - Shows progress toward shield (e.g., "2/3")
 * - Animated shield icon when active
 * - Pulse animation on activation
 * - Clear visual feedback
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFocus } from '../contexts/FocusContext';
import { COLORS } from '../constants/colors';

interface StreakShieldIndicatorProps {
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export function StreakShieldIndicator({
  size = 'small',
  showLabel = true,
}: StreakShieldIndicatorProps) {
  const { shield, config } = useFocus();

  // Don't show for unlimited hearts (premium users)
  if (config.unlimitedHearts) {
    return null;
  }

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Animation when shield becomes active
  useEffect(() => {
    if (shield.isActive) {
      // Celebration pulse
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 10, stiffness: 200 })
      );

      // Gentle continuous pulse while active
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        true // Reverse
      );

      // Gentle rotation animation
      rotation.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 1000 }),
          withTiming(-5, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1.0);
      rotation.value = withSpring(0);
    }
  }, [shield.isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const iconSize = size === 'small' ? 16 : 20;
  const fontSize = size === 'small' ? 12 : 14;

  if (shield.isActive) {
    // Shield is active - show prominent indicator
    return (
      <View style={[styles.container, styles.containerActive]}>
        <Animated.View style={animatedStyle}>
          <Ionicons name="shield-checkmark" size={iconSize} color="#10B981" />
        </Animated.View>
        {showLabel && (
          <Text style={[styles.label, styles.labelActive, { fontSize }]}>
            Shield Active
          </Text>
        )}
      </View>
    );
  }

  // Building streak - show progress
  return (
    <View style={styles.container}>
      <Ionicons name="shield-outline" size={iconSize} color={COLORS.textGray} />
      {showLabel && (
        <Text style={[styles.label, { fontSize }]}>
          {shield.correctAnswersStreak}/{shield.requiredStreak}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  containerActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  label: {
    fontWeight: '700',
    color: COLORS.textGray,
  },
  labelActive: {
    color: '#10B981',
  },
});
