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
import { TrendBadge } from './TrendBadge';

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
  baselineScore?: number; // Week 1 baseline score for comparison
  trend?: {
    delta: number; // Percentage change from previous week/baseline
    previousScore?: number; // Optional: score from previous period
  };
}

interface InteractiveRadarChartEnhancedProps {
  data: RadarDataPoint[];
  size?: number;
  onStrandTap?: (strand: DNAStrandKey) => void;
  selectedStrand?: DNAStrandKey | null;
  showComparison?: boolean; // Toggle to show/hide baseline comparison
}

// ============================================================================
// COMPONENT
// ============================================================================

export const InteractiveRadarChartEnhanced: React.FC<InteractiveRadarChartEnhancedProps> = ({
  data,
  size = SCREEN_WIDTH - 40,
  onStrandTap,
  selectedStrand,
  showComparison = false,
}) => {
  const animationProgress = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const center = size / 2;
  const maxRadius = center - 30; // More space for larger chart

  const strandCount = data.length;
  const angleStep = (2 * Math.PI) / strandCount;

  // Pre-calculate scores for animation
  const scores = useMemo(() => data.map(d => d.score), [data]);
  const baselineScores = useMemo(() => data.map(d => d.baselineScore || d.score), [data]);
  const hasBaseline = useMemo(() => data.some(d => d.baselineScore !== undefined && d.baselineScore !== d.score), [data]);

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
      <View style={{ width: size, height: size, overflow: 'visible' }}>
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

        {/* BASELINE POLYGON - Ghost/shadow showing Week 1 state */}
        {showComparison && hasBaseline && (
          <Polygon
            points={data.map((point, index) => {
              const pos = getPointPosition(index, point.baselineScore || point.score);
              return `${pos.x},${pos.y}`;
            }).join(' ')}
            fill="#9CA3AF"
            fillOpacity={0.12}
            stroke="#9CA3AF"
            strokeWidth={3}
            strokeDasharray="6,4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* CURRENT POLYGON - Bright and solid showing current state */}
        <Polygon
          points={data.map((point, index) => {
            const pos = getPointPosition(index, point.score);
            return `${pos.x},${pos.y}`;
          }).join(' ')}
          fill="#14B8A6"
          fillOpacity={showComparison && hasBaseline ? 0.25 : 0.3}
          stroke="#14B8A6"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
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

      {/* Strand labels with score (showing baseline → current if comparison enabled) */}
      {data.map((point, index) => {
        const angle = index * angleStep - Math.PI / 2;
        // Position label at the outer edge (100% radius) so it sits near the chart boundary
        const labelRadius = maxRadius + 28;
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);
        const isSelected = selectedStrand === point.strand;
        const hasBaseline = showComparison && point.baselineScore !== undefined && point.baselineScore !== point.score;
        const hasTrend = point.trend && Math.abs(point.trend.delta) > 0;

        return (
          <Pressable
            key={`label-${point.strand}`}
            onPress={() => handleStrandPress(point.strand)}
            style={[
              styles.vertexLabel,
              {
                left: labelX - 40,
                top: labelY - (hasBaseline ? 26 : hasTrend ? 24 : 20),
              },
            ]}
          >
            <Text style={[styles.vertexLabelName, { color: point.color, fontWeight: isSelected ? '700' : '600' }]}>
              {point.label}
            </Text>

            {/* Show baseline → current comparison */}
            {hasBaseline ? (
              <View style={styles.comparisonRow}>
                <Text style={[styles.baselineScore, { color: point.color }]}>
                  {Math.round(point.baselineScore!)}%
                </Text>
                <Text style={styles.arrowText}>→</Text>
                <Text style={[styles.currentScore, { color: point.color }]}>
                  {Math.round(point.score)}%
                </Text>
              </View>
            ) : (
              /* Show just current score (with optional trend badge) */
              <View style={styles.scoreRow}>
                <Text style={[styles.vertexLabelScore, { color: point.color }]}>
                  {Math.round(point.score)}%
                </Text>
                {hasTrend && !showComparison && (
                  <View style={styles.trendBadgeContainer}>
                    <TrendBadge
                      delta={point.trend!.delta}
                      size="small"
                      variant="compact"
                      showPercentage={true}
                    />
                  </View>
                )}
              </View>
            )}
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
  vertexLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    zIndex: 5,
  },
  vertexLabelName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    gap: 4,
  },
  vertexLabelScore: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  trendBadgeContainer: {
    marginTop: -1,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    gap: 3,
  },
  baselineScore: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
  },
  arrowText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  currentScore: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default InteractiveRadarChartEnhanced;
