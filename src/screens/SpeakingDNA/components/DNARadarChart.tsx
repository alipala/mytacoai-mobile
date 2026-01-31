/**
 * DNA Radar Chart Component
 *
 * Animated radar/spider chart showing all 6 DNA strands
 * Uses custom SVG implementation with Reanimated for smooth animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { DNA_COLORS, DNA_STRAND_LABELS, THEME_COLORS, getStrandScore } from '../constants.OLD';
import { SpeakingDNAProfile, DNAStrandKey } from '../../../types/speakingDNA';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 64, 320);
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = CENTER - 80; // Leave space for labels

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface DNARadarChartProps {
  profile: SpeakingDNAProfile;
}

export const DNARadarChart: React.FC<DNARadarChartProps> = ({ profile }) => {
  const animationProgress = useSharedValue(0);

  // Get all strand keys and values
  const strands = Object.keys(DNA_STRAND_LABELS) as DNAStrandKey[];
  const strandCount = strands.length;
  const angleStep = (2 * Math.PI) / strandCount;

  // Extract scores BEFORE animation (on JS thread)
  const strandScores = strands.map((strand) => getStrandScore(profile.dna_strands[strand]));

  useEffect(() => {
    // Animate from 0 to 1 with bounce easing
    animationProgress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.back(1.5)),
    });
  }, []);

  // Calculate label positions (outside the chart)
  const getLabelPosition = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = MAX_RADIUS + 35;
    const x = CENTER + radius * Math.cos(angle);
    const y = CENTER + radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Calculate static points (for non-animated elements)
  const getStaticPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = (value / 100) * MAX_RADIUS;
    const x = CENTER + radius * Math.cos(angle);
    const y = CENTER + radius * Math.sin(angle);
    return { x, y };
  };

  // Animated polygon points (inline calculation for worklet compatibility)
  const animatedProps = useAnimatedProps(() => {
    const points = strandScores
      .map((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const radius = (value / 100) * MAX_RADIUS * animationProgress.value;
        const x = CENTER + radius * Math.cos(angle);
        const y = CENTER + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

    return { points };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          {/* Background grid circles */}
          {[20, 40, 60, 80, 100].map((percentage) => (
            <Circle
              key={percentage}
              cx={CENTER}
              cy={CENTER}
              r={(percentage / 100) * MAX_RADIUS}
              stroke="#E5E7EB"
              strokeWidth={1}
              fill="none"
              opacity={0.3}
            />
          ))}

          {/* Axis lines from center to each point */}
          {strands.map((_, index) => {
            const point = getStaticPoint(index, 100);
            return (
              <Line
                key={`axis-${index}`}
                x1={CENTER}
                y1={CENTER}
                x2={point.x}
                y2={point.y}
                stroke="#D1D5DB"
                strokeWidth={1}
              />
            );
          })}

          {/* Animated DNA shape (filled polygon) */}
          <AnimatedPolygon
            animatedProps={animatedProps}
            fill={`${THEME_COLORS.primary}30`}
            stroke={THEME_COLORS.primary}
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Data points (circles at each vertex) */}
          {strands.map((strand, index) => {
            const value = strandScores[index];
            const point = getStaticPoint(index, value);
            return (
              <Circle
                key={`point-${strand}`}
                cx={point.x}
                cy={point.y}
                r={5}
                fill={DNA_COLORS[strand]}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            );
          })}
        </Svg>

        {/* Custom Labels (React Native Views for better styling) */}
        <View style={styles.labelsContainer}>
          {strands.map((strand, index) => {
            const { x, y } = getLabelPosition(index);
            const value = strandScores[index];
            const label = DNA_STRAND_LABELS[strand];

            return (
              <View
                key={strand}
                style={[
                  styles.labelBox,
                  {
                    position: 'absolute',
                    left: x - 40,
                    top: y - 20,
                  },
                ]}
              >
                <Text style={[styles.labelText, { color: DNA_COLORS[strand] }]}>
                  {label}
                </Text>
                <Text style={styles.labelValue}>{value}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.sessions_analyzed}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(profile.total_speaking_minutes)}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    paddingBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 20,
  },
  labelsContainer: {
    position: 'absolute',
    width: CHART_SIZE,
    height: CHART_SIZE,
    top: 20,
    left: 0,
  },
  labelBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 80,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLORS.text.primary,
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: THEME_COLORS.text.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});
