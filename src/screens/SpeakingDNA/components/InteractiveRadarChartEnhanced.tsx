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
  Defs,
  RadialGradient,
  Stop,
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
        {/* Define radial gradient for immersive glow effect */}
        <Defs>
          <RadialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Immersive glow background - like share card */}
        <Circle
          cx={center}
          cy={center}
          r={maxRadius * 1.2}
          fill="url(#glowGradient)"
        />

        {/* Grid polygons (spider chart web) - hexagons with dark theme */}
        {gridLevels.map((level) => (
          <Polygon
            key={`grid-${level}`}
            points={getGridPolygonPoints(level)}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={2}
            fill="none"
          />
        ))}

        {/* Axis lines (spider chart spokes) - matching share card */}
        {data.map((_, index) => {
          const point = getPointPosition(index, 100);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={2}
            />
          );
        })}

        {/* Grid level labels removed for cleaner design like share card */}

        {/* HEXAGONAL FILLED AREA - Matching share card style */}
        <AnimatedPolygon
          animatedProps={animatedProps}
          fill="#14B8A6"
          fillOpacity={0.2}
          stroke="#14B8A6"
          strokeWidth={4}
        />

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
              {/* Glow circle - always visible like share card */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill={point.color}
                opacity={isSelected ? 0.4 : 0.3}
              />
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
              {/* Main vertex circle - with white stroke */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 12 : 12}
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
        {data.map((point) => {
          const isSelected = selectedStrand === point.strand;
          return (
            <Pressable
              key={`legend-${point.strand}`}
              onPress={() => handleStrandPress(point.strand)}
              style={[
                styles.legendItem,
                isSelected && {
                  backgroundColor: `${point.color}10`,
                  borderColor: point.color,
                  borderWidth: 2,
                },
              ]}
            >
              <View style={[styles.legendCircle, { backgroundColor: point.color }]} />
              <Text
                style={[
                  styles.legendText,
                  isSelected && { color: point.color, fontWeight: '700' },
                ]}
              >
                {point.label}
              </Text>
            </Pressable>
          );
        })}
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
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '48%',
  },
  legendCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
});

export default InteractiveRadarChartEnhanced;
