/**
 * DNA Progress Ring Component
 *
 * Animated circular progress ring for DNA strands
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DNA_COLORS, DNA_STRAND_LABELS, THEME_COLORS } from '../constants';
import { DNAStrandKey } from '../../../types/speakingDNA';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DNAProgressRingProps {
  strand: DNAStrandKey;
  value: number;
  size?: number;
  delay?: number;
}

export const DNAProgressRing: React.FC<DNAProgressRingProps> = ({
  strand,
  value,
  size = 100,
  delay = 0,
}) => {
  const progress = useSharedValue(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = DNA_COLORS[strand];
  const label = DNA_STRAND_LABELS[strand];

  useEffect(() => {
    setTimeout(() => {
      progress.value = withTiming(value / 100, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
  }, [value, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Animated Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Percentage Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.percentageText, { color }]}>{value}%</Text>
        </View>
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLORS.text.secondary,
    marginTop: 8,
  },
});
