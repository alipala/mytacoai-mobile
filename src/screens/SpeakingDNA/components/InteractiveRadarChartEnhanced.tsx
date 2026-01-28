/**
 * Interactive Radar Chart Enhanced
 * =================================
 *
 * A beautiful, interactive radar chart with:
 * - Colorful segment backgrounds (each strand has its color)
 * - Animated entry with spring effects
 * - Tap on vertices to select/highlight strand
 * - Visual feedback on selection
 * - Haptic feedback on touch
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Pressable } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  G,
  Defs,
  RadialGradient,
  Stop,
  Path,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DNAStrandKey } from '../../../types/speakingDNA';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  const maxRadius = center - 70; // Leave space for labels

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
  const getPointPosition = (index: number, value: number, radius: number = maxRadius) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  /**
   * Get label position (outside the chart)
   */
  const getLabelPosition = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = maxRadius + 50;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, angle };
  };

  /**
   * Generate segment path for colored background
   */
  const getSegmentPath = (index: number) => {
    const startAngle = index * angleStep - Math.PI / 2 - angleStep / 2;
    const endAngle = startAngle + angleStep;
    const r = maxRadius + 10;

    const x1 = center + r * Math.cos(startAngle);
    const y1 = center + r * Math.sin(startAngle);
    const x2 = center + r * Math.cos(endAngle);
    const y2 = center + r * Math.sin(endAngle);

    return `M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
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

  // Grid levels for reference circles
  const gridLevels = [25, 50, 75, 100];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Radial gradient for center glow */}
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#14B8A6" stopOpacity="0.15" />
            <Stop offset="70%" stopColor="#14B8A6" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Background circle with gradient */}
        <Circle
          cx={center}
          cy={center}
          r={maxRadius + 20}
          fill="url(#centerGlow)"
        />

        {/* Colored segment backgrounds (subtle) */}
        <G opacity={0.08}>
          {data.map((point, index) => (
            <Path
              key={`segment-${index}`}
              d={getSegmentPath(index)}
              fill={point.color}
            />
          ))}
        </G>

        {/* Grid circles */}
        {gridLevels.map((level) => (
          <Circle
            key={`grid-${level}`}
            cx={center}
            cy={center}
            r={(level / 100) * maxRadius}
            stroke="#E5E7EB"
            strokeWidth={1}
            strokeDasharray={level === 100 ? undefined : "4,4"}
            fill="none"
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
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
              opacity={0.6}
            />
          );
        })}

        {/* Main data polygon (animated, filled) */}
        <AnimatedPolygon
          animatedProps={animatedProps}
          fill="rgba(20, 184, 166, 0.25)"
          stroke="#14B8A6"
          strokeWidth={3}
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
                  r={16}
                  fill={point.color}
                  opacity={0.3}
                />
              )}
              {/* Main vertex circle */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 10 : 7}
                fill={point.color}
                stroke="#FFFFFF"
                strokeWidth={3}
              />
            </G>
          );
        })}
      </Svg>

      {/* Touchable Labels with Values */}
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
                left: x - 45,
                top: y - 28,
              },
            ]}
          >
            <View
              style={[
                styles.labelBox,
                {
                  backgroundColor: isSelected ? point.color : `${point.color}15`,
                  borderColor: point.color,
                  transform: [{ scale: isSelected ? 1.1 : 1 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.labelText,
                  { color: isSelected ? '#FFFFFF' : point.color },
                ]}
              >
                {point.label}
              </Text>
              <Text
                style={[
                  styles.labelValue,
                  { color: isSelected ? '#FFFFFF' : '#1F2937' },
                ]}
              >
                {point.score}%
              </Text>
            </View>
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
  },
  labelContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  labelBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
});

export default InteractiveRadarChartEnhanced;
