/**
 * SpinningGlowButton
 *
 * Solid-color button with an animated border glow that sweeps around the edges,
 * inspired by conic-gradient CSS shimmer effects.
 *
 * Uses Skia SweepGradient (rotated via animated start/end angles) for the
 * spinning border, drawn behind a solid inner fill. Avoids Group transforms
 * to stay compatible with Reanimated.
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Canvas,
  RoundedRect,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SpinningGlowButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  borderWidth?: number;
  borderRadius?: number;
  buttonColor?: string;
  glowColors?: string[];
  /** Full rotation duration in ms */
  duration?: number;
  style?: any;
}

const SpinningGlowButton: React.FC<SpinningGlowButtonProps> = ({
  onPress,
  children,
  borderWidth = 2,
  borderRadius = 14,
  buttonColor = '#14B8A6',
  glowColors,
  duration = 3000,
  style,
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const rotation = useSharedValue(0);

  // Default gradient: one bright highlight sweeping around, rest dim
  const colors = glowColors ?? [
    '#CCFBF1', // peak highlight (light cyan-white)
    '#14B8A6', // shoulder
    '#0B2D28', // dim
    '#0B2D28',
    '#0B2D28',
    '#0B2D28',
    '#14B8A6', // shoulder
    '#CCFBF1', // wraps back to peak
  ];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration, easing: Easing.linear }),
      -1, // infinite
      false, // no reverse
    );
  }, []);

  // Rotate the sweep gradient by shifting its start/end angles
  const startAngle = useDerivedValue(() => rotation.value);
  const endAngle = useDerivedValue(() => rotation.value + Math.PI * 2);

  const { width: w, height: h } = layout;

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      {w > 0 && h > 0 && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Outer rounded rect with spinning sweep gradient = animated border */}
          <RoundedRect x={0} y={0} width={w} height={h} r={borderRadius}>
            <SweepGradient
              c={vec(w / 2, h / 2)}
              start={startAngle}
              end={endAngle}
              colors={colors}
            />
          </RoundedRect>
          {/* Inner fill = solid button face */}
          <RoundedRect
            x={borderWidth}
            y={borderWidth}
            width={w - borderWidth * 2}
            height={h - borderWidth * 2}
            r={borderRadius - borderWidth}
            color={buttonColor}
          />
        </Canvas>
      )}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    // Static outer glow (matches bottom tab bar shadow)
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  touchable: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default SpinningGlowButton;
