/**
 * Interactive Radar Chart Enhanced
 * =================================
 *
 * A clean, professional radar/spider chart with:
 * - White background with polygon grid lines
 * - Gradient filled data polygon
 * - Animated entry with spring effects
 * - Tap on vertices to select/highlight strand
 * - Simple, elegant labels
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Pressable } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DNAStrandKey } from '../../../types/speakingDNA';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

// ============================================================================
// TYPES
// ============================================================================

interface RadarDataPoint {
  strand: DNAStrandKey;
  label: string;
  score: number;
  color: string;
}

interface InteractiveRadarChartEnhancedProps {
  data: RadarDataPoint[];
  size?: number;
  onStrandTap?: (strand: DNAStrandKey) => void;
  selectedStrand?: DNAStrandKey | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InteractiveRadarChartEnhanced: React.FC<InteractiveRadarChartEnhancedProps> = ({
  data,
  size = SCREEN_WIDTH - 40,
  onStrandTap,
  selectedStrand,
}) => {
  const animationProgress = useSharedValue(0);
  const center = size / 2;
  const maxRadius = center - 60; // Leave space for labels

  const strandCount = data.length;
  const angleStep = (2 * Math.PI) / strandCount;

  // Pre-calculate scores for animation
  const scores = useMemo(() => data.map(d => d.score), [data]);

  // Animate on mount
  useEffect(() => {
    animationProgress.value = withSpring(1, {
      damping: 15,
      stiffness: 80,
      mass: 1,
    });
  }, []);

  /**
   * Calculate point position on the radar
   */
  const getPointPosition = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  /**
   * Generate polygon points string for grid levels
   */
  const getGridPolygonPoints = (level: number) => {
    const points = [];
    for (let i = 0; i < strandCount; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const r = (level / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  /**
   * Get label position (outside the chart)
   */
  const getLabelPosition = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = maxRadius + 45;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, angle };
  };

  /**
   * Animated polygon points
   */
  const animatedProps = useAnimatedProps(() => {
    const points = scores
      .map((score, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const r = (score / 100) * maxRadius * animationProgress.value;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

    return { points };
  });

  /**
   * Handle strand tap with haptic
   */
  const handleStrandPress = (strand: DNAStrandKey) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onStrandTap?.(strand);
  };

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* White background */}
      <View style={[styles.background, { width: size, height: size, borderRadius: size / 2 }]} />

      <Svg width={size} height={size}>
        <Defs>
          {/* Gradient for data polygon fill */}
          <LinearGradient id="dataGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#E91E63" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#E91E63" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Grid polygons (not circles) */}
        {gridLevels.map((level) => (
          <Polygon
            key={`grid-${level}`}
            points={getGridPolygonPoints(level)}
            stroke="#D1D5DB"
            strokeWidth={1}
            fill="none"
          />
        ))}

        {/* Axis lines from center to each vertex */}
        {data.map((_, index) => {
          const point = getPointPosition(index, 100);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#D1D5DB"
              strokeWidth={1}
            />
          );
        })}

        {/* Main data polygon (animated, gradient filled) */}
        <AnimatedPolygon
          animatedProps={animatedProps}
          fill="url(#dataGradient)"
          stroke="#E91E63"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Data points (vertices) */}
        {data.map((point, index) => {
          const pos = getPointPosition(index, point.score);
          const isSelected = selectedStrand === point.strand;

          return (
            <G key={`vertex-${index}`}>
              {/* Outer glow for selected */}
              {isSelected && (
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill="#E91E63"
                  opacity={0.3}
                />
              )}
              {/* Main vertex circle */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 8 : 6}
                fill="#E91E63"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            </G>
          );
        })}
      </Svg>

      {/* Labels outside the chart */}
      {data.map((point, index) => {
        const { x, y } = getLabelPosition(index);
        const isSelected = selectedStrand === point.strand;

        return (
          <Pressable
            key={`label-${point.strand}`}
            onPress={() => handleStrandPress(point.strand)}
            style={[
              styles.labelContainer,
              {
                left: x - 50,
                top: y - 12,
              },
            ]}
          >
            <Text
              style={[
                styles.labelText,
                isSelected && styles.labelTextSelected,
              ]}
            >
              {point.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  labelContainer: {
    position: 'absolute',
    zIndex: 10,
    width: 100,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  labelTextSelected: {
    color: '#E91E63',
    fontWeight: '700',
  },
});

export default InteractiveRadarChartEnhanced;
