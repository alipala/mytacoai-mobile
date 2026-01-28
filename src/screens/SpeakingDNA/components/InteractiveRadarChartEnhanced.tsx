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
  Text as SvgText,
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
  const maxRadius = center - 60; // Optimized space for labels

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

  // Grid levels for reference polygons
  const gridLevels = [20, 40, 60, 80, 100];

  /**
   * Generate polygon grid points for each level
   */
  const getGridPolygonPoints = (level: number) => {
    const points = data.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (level / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return points;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Very subtle center circle - minimal interference */}
        <Circle
          cx={center}
          cy={center}
          r={maxRadius}
          fill="#FAFAFA"
          opacity={0.2}
        />

        {/* Grid polygons (spider chart web) - clean and professional */}
        {gridLevels.map((level) => (
          <Polygon
            key={`grid-${level}`}
            points={getGridPolygonPoints(level)}
            stroke={level === 100 ? "#9CA3AF" : "#D1D5DB"}
            strokeWidth={level === 100 ? 1.5 : 0.8}
            strokeDasharray={level === 100 ? undefined : "5,5"}
            fill="none"
          />
        ))}

        {/* Axis lines (spider chart spokes) - subtle but visible */}
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

        {/* Grid level labels (subtle scale indicators) */}
        {gridLevels.filter(level => level === 40 || level === 60 || level === 80).map((level) => {
          const labelPos = getPointPosition(0, level);
          return (
            <SvgText
              key={`grid-label-${level}`}
              x={labelPos.x}
              y={labelPos.y - 8}
              fill="#9CA3AF"
              fontSize="8"
              fontWeight="500"
              textAnchor="middle"
              opacity={0.6}
            >
              {level}
            </SvgText>
          );
        })}

        {/* HEXAGONAL FILLED AREA - SOLID TEAL */}
        <AnimatedPolygon
          animatedProps={animatedProps}
          fill="#5EEAD4"
          stroke="none"
        />

        {/* Spider chart connecting LINES between data points - GLOW EFFECT */}
        {data.map((point, index) => {
          const currentPos = getPointPosition(index, point.score);
          const nextIndex = (index + 1) % data.length;
          const nextPos = getPointPosition(nextIndex, data[nextIndex].score);

          return (
            <G key={`edge-${index}`}>
              {/* Outer glow for immersive effect */}
              <Line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="#14B8A6"
                strokeWidth={8}
                strokeLinecap="round"
                opacity={0.15}
              />
              {/* Middle glow */}
              <Line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="#14B8A6"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.3}
              />
              {/* Main line - crisp and clean */}
              <Line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="#14B8A6"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </G>
          );
        })}

        {/* Data points (vertices) - immersive and beautiful */}
        {data.map((point, index) => {
          const pos = getPointPosition(index, point.score);
          const isSelected = selectedStrand === point.strand;

          return (
            <G key={`vertex-${index}`}>
              {/* Outer glow - always visible for immersive effect */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 22 : 16}
                fill={point.color}
                opacity={isSelected ? 0.25 : 0.15}
              />
              {/* Middle glow */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 14 : 11}
                fill={point.color}
                opacity={0.4}
              />
              {/* White outer ring */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 10 : 8}
                fill="#FFFFFF"
                opacity={1}
              />
              {/* Main vertex circle - color-coded and prominent */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 7 : 5.5}
                fill={point.color}
              />
            </G>
          );
        })}
      </Svg>

      {/* Touchable Labels with Values - ANIMATED */}
      {data.map((point, index) => {
        const { x, y } = getLabelPosition(index);
        const isSelected = selectedStrand === point.strand;

        return (
          <Animated.View
            key={`label-${point.strand}`}
            style={[
              styles.labelContainer,
              {
                left: x - 45,
                top: y - 28,
              },
            ]}
          >
            <Pressable onPress={() => handleStrandPress(point.strand)}>
              <Animated.View
                style={[
                  styles.labelBox,
                  {
                    backgroundColor: isSelected ? point.color : `${point.color}15`,
                    borderColor: point.color,
                    transform: [{ scale: isSelected ? 1.15 : 1 }],
                    shadowColor: isSelected ? point.color : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isSelected ? 0.3 : 0,
                    shadowRadius: isSelected ? 8 : 0,
                    elevation: isSelected ? 8 : 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.labelText,
                    {
                      color: isSelected ? '#FFFFFF' : point.color,
                      fontWeight: isSelected ? '800' : '700',
                    },
                  ]}
                >
                  {point.label}
                </Text>
                <Text
                  style={[
                    styles.labelValue,
                    {
                      color: isSelected ? '#FFFFFF' : '#1F2937',
                      fontWeight: isSelected ? '800' : '700',
                    },
                  ]}
                >
                {point.score}%
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
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
