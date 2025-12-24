/**
 * ComboBadge Component
 *
 * Displays current combo streak with escalating visual effects
 * Pulses on combo increase, shatters on combo loss
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useComboSystem } from '../hooks/useComboSystem';
import { getComboBadgeColors } from '../animations/ComboSystem';

interface ComboBadgeProps {
  onMilestone?: (combo: number, message: string) => void;
  onComboLost?: () => void;
  style?: any;
}

export function ComboBadge({ onMilestone, onComboLost, style }: ComboBadgeProps) {
  const {
    currentCombo,
    shouldShowBadge,
    getComboDisplayText,
    comboScale,
    comboOpacity,
    comboTranslateY,
    isMilestone,
    milestoneMessage,
  } = useComboSystem({
    onMilestone,
    onComboLost,
  });

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: comboScale.value },
      { translateY: comboTranslateY.value },
    ],
    opacity: comboOpacity.value,
  }));

  // Don't render if combo is 1 (no badge needed)
  if (!shouldShowBadge()) {
    return null;
  }

  const gradientColors = getComboBadgeColors(currentCombo);

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.comboText}>{getComboDisplayText()}</Text>
      </LinearGradient>

      {/* Glow effect for higher combos */}
      {currentCombo >= 5 && (
        <View style={[styles.glow, { shadowColor: gradientColors[0] }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'visible',
  },
  gradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    zIndex: -1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
