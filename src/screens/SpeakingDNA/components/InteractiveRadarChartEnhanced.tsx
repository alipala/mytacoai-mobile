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
  const pulseAnimation = useSharedValue(1);
  const center = size / 2;
  const maxRadius = center - 30; // More space for larger chart

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

  // Pulsing animation for selected point
  useEffect(() => {
    if (selectedStrand) {
      pulseAnimation.value = withTiming(1.3, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }, () => {
        pulseAnimation.value = withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }, (finished) => {
          if (finished && selectedStrand) {
            // Loop the animation
            pulseAnimation.value = withTiming(1.3, {
              duration: 800,
              easing: Easing.inOut(Easing.ease),
            });
          }
        });
      });
    } else {
      pulseAnimation.value = withTiming(1, { duration: 200 });
    }
  }, [selectedStrand]);

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
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
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

        {/* Spider chart connecting LINES - Clean elegant design */}
        {data.map((point, index) => {
          const currentPos = getPointPosition(index, point.score);
          const nextIndex = (index + 1) % data.length;
          const nextPos = getPointPosition(nextIndex, data[nextIndex].score);

          return (
            <G key={`edge-${index}`}>
              {/* Subtle outer glow */}
              <Line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="#14B8A6"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.15}
              />
              {/* Main elegant line */}
              <Line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="#14B8A6"
                strokeWidth={2.5}
                strokeLinecap="round"
                opacity={0.8}
              />
            </G>
          );
        })}

        {/* Data points (vertices) - LARGER for tap targets */}
        {data.map((point, index) => {
          const pos = getPointPosition(index, point.score);
          const isSelected = selectedStrand === point.strand;

          // Create animated props for pulsing effect
          const pulseProps = useAnimatedProps(() => {
            if (!isSelected) return { r: 28, opacity: 0 };

            return {
              r: 28 * pulseAnimation.value,
              opacity: 0.3 - (0.2 * (pulseAnimation.value - 1)),
            };
          });

          const pulseProps2 = useAnimatedProps(() => {
            if (!isSelected) return { r: 18, opacity: 0 };

            return {
              r: 18 * pulseAnimation.value,
              opacity: 0.4 - (0.25 * (pulseAnimation.value - 1)),
            };
          });

          return (
            <G key={`vertex-${index}`}>
              {/* Pulsing glow - selected only */}
              {isSelected && (
                <>
                  <AnimatedCircle
                    cx={pos.x}
                    cy={pos.y}
                    fill={point.color}
                    animatedProps={pulseProps}
                  />
                  <AnimatedCircle
                    cx={pos.x}
                    cy={pos.y}
                    fill={point.color}
                    animatedProps={pulseProps2}
                  />
                </>
              )}
              {/* White outer ring */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 13 : 11}
                fill="#FFFFFF"
                opacity={1}
              />
              {/* Main vertex circle - LARGER for better tap target */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 10 : 8}
                fill={point.color}
              />
            </G>
          );
        })}
      </Svg>

      {/* Invisible Touchable Overlays on Vertices */}
      {data.map((point, index) => {
        const pos = getPointPosition(index, point.score);

        return (
          <Pressable
            key={`touch-${point.strand}`}
            onPress={() => handleStrandPress(point.strand)}
            style={[
              styles.touchOverlay,
              {
                left: pos.x - 20,
                top: pos.y - 20,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        );
      })}
      </View>

      {/* Legend - 3x2 Grid */}
      <View style={styles.legendContainer}>
        {data.map((point) => (
          <Pressable
            key={`legend-${point.strand}`}
            onPress={() => handleStrandPress(point.strand)}
            style={[
              styles.legendItem,
              selectedStrand === point.strand && styles.legendItemSelected,
            ]}
          >
            <View style={[styles.legendCircle, { backgroundColor: point.color }]} />
            <Text
              style={[
                styles.legendText,
                selectedStrand === point.strand && styles.legendTextSelected,
              ]}
            >
              {point.label}
            </Text>
          </Pressable>
        ))}
      </View>
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
  },
  touchOverlay: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: '30%',
  },
  legendItemSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#14B8A6',
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  legendTextSelected: {
    color: '#0F766E',
    fontWeight: '700',
  },
});

export default InteractiveRadarChartEnhanced;
