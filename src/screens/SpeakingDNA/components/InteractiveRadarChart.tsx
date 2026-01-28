/**
 * Interactive Radar Chart Component
 *
 * A touch-enabled radar chart using Victory Native with GPU acceleration
 * Supports tap, long-press, and pinch gestures for rich interactions
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Polygon, G } from 'react-native-svg';

import { COLORS, SPRING_CONFIGS } from '../constants';
import { InteractiveRadarChartProps, RadarDataPoint, DNAStrandKey } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(SCREEN_WIDTH - 64, 340);

/**
 * Interactive Radar Chart Component
 */
export const InteractiveRadarChart: React.FC<InteractiveRadarChartProps> = ({
  data,
  size = DEFAULT_SIZE,
  onStrandTap,
  onStrandLongPress,
  animated = true,
}) => {
  const [activeStrand, setActiveStrand] = useState<DNAStrandKey | null>(null);

  // Gesture states
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  /**
   * Calculate radar chart points
   */
  const radarPoints = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    const radius = (size / 2) - 80; // Leave space for labels
    const center = size / 2;

    return data.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const value = point.score / 100; // Normalize to 0-1
      const x = center + radius * value * Math.cos(angle);
      const y = center + radius * value * Math.sin(angle);
      return { x, y, angle, value: point.score, ...point };
    });
  }, [data, size]);

  /**
   * Handle strand tap with haptic feedback
   */
  const handleStrandTap = useCallback((strand: DNAStrandKey) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveStrand(strand);
    onStrandTap?.(strand);
  }, [onStrandTap]);

  /**
   * Handle strand long press with haptic feedback
   */
  const handleStrandLongPress = useCallback((strand: DNAStrandKey) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onStrandLongPress?.(strand);
  }, [onStrandLongPress]);

  /**
   * Pinch gesture for zoom
   */
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
      // Clamp scale between 1 and 1.5
      scale.value = Math.min(Math.max(scale.value, 1), 1.5);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  /**
   * Double tap to reset zoom
   */
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1, SPRING_CONFIGS.bouncy);
      savedScale.value = 1;
      if (Platform.OS !== 'web') {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  /**
   * Composed gestures
   */
  const composedGestures = Gesture.Race(doubleTapGesture, pinchGesture);

  /**
   * Animated styles for zoom effect
   */
  const animatedChartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Get color for strand
   */
  const getStrandColor = useCallback((strandKey: string) => {
    return COLORS.strand[strandKey as DNAStrandKey] || COLORS.primary[500];
  }, []);

  // Calculate grid circles
  const gridLevels = [20, 40, 60, 80, 100];
  const center = size / 2;
  const maxRadius = (size / 2) - 80;

  // Calculate polygon points string
  const polygonPoints = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background gradient circle */}
      <View style={[styles.backgroundCircle, { width: size, height: size }]} />

      {/* Custom SVG Radar Chart */}
      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[styles.chartContainer, animatedChartStyle]}>
          <Svg width={size} height={size}>
            <G>
              {/* Grid circles */}
              {gridLevels.map((level) => {
                const radius = (level / 100) * maxRadius;
                return (
                  <Circle
                    key={level}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={COLORS.gray[200]}
                    strokeWidth={1}
                    strokeDasharray="4, 4"
                    fill="none"
                  />
                );
              })}

              {/* Axis lines from center to each point */}
              {radarPoints.map((point, index) => {
                const angle = point.angle;
                const endX = center + maxRadius * Math.cos(angle);
                const endY = center + maxRadius * Math.sin(angle);
                return (
                  <Line
                    key={`axis-${index}`}
                    x1={center}
                    y1={center}
                    x2={endX}
                    y2={endY}
                    stroke={COLORS.gray[300]}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Data polygon */}
              <Polygon
                points={polygonPoints}
                fill={`${COLORS.primary[500]}30`}
                stroke={COLORS.primary[500]}
                strokeWidth={3}
                strokeLinejoin="round"
              />

              {/* Data points (vertices) */}
              {radarPoints.map((point, index) => (
                <Circle
                  key={`point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={6}
                  fill={getStrandColor(point.strand)}
                  stroke={COLORS.white}
                  strokeWidth={2}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleStrandTap(point.strand);
                  }}
                />
              ))}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* Labels positioned outside the chart */}
      {data.map((point, index) => {
        const angle = (index * 60 - 90) * (Math.PI / 180); // Convert to radians
        const radius = size / 2 - 15;
        const labelX = size / 2 + radius * Math.cos(angle);
        const labelY = size / 2 + radius * Math.sin(angle);

        return (
          <View
            key={point.strand}
            style={[
              styles.label,
              {
                position: 'absolute',
                left: labelX,
                top: labelY,
                transform: [{ translateX: -30 }, { translateY: -12 }],
                backgroundColor: `${getStrandColor(point.strand)}15`,
                borderColor: getStrandColor(point.strand),
              },
            ]}
          >
            <Text
              style={[
                styles.labelText,
                {
                  color: getStrandColor(point.strand),
                  fontWeight: activeStrand === point.strand ? '700' : '600',
                },
              ]}
            >
              {point.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: `${COLORS.primary[50]}80`,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InteractiveRadarChart;
