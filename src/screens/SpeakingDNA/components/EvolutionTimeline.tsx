/**
 * Evolution Timeline Component
 *
 * Horizontal scrollable timeline showing DNA evolution over weeks
 * with mini radar charts for each week
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

import { COLORS, SHADOWS, ICON_SIZES } from '../constants';
import { EvolutionTimelineProps, TimelineWeek } from '../types';
import { getStrandScore } from '../constants.OLD';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MINI_RADAR_SIZE = 80;
const CARD_WIDTH = 120;
const CARD_GAP = 16;

/**
 * Mini Radar Chart Component
 */
const MiniRadarChart: React.FC<{
  data: Array<{ x: string; y: number }>;
  isCurrent: boolean;
}> = ({ data, isCurrent }) => {
  const opacity = isCurrent ? 1 : 0.6;
  const strokeColor = isCurrent ? COLORS.primary[500] : COLORS.primary[300];
  const fillColor = isCurrent ? `${COLORS.primary[500]}40` : `${COLORS.primary[300]}30`;

  // Calculate radar points
  const center = MINI_RADAR_SIZE / 2;
  const maxRadius = center - 10;
  const angleStep = (2 * Math.PI) / data.length;

  const points = data.map((point, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const value = point.y / 100;
    const x = center + maxRadius * value * Math.cos(angle);
    const y = center + maxRadius * value * Math.sin(angle);
    return { x, y };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.miniRadarContainer}>
      <Svg width={MINI_RADAR_SIZE} height={MINI_RADAR_SIZE}>
        <G opacity={opacity}>
          {/* Grid circles */}
          {[50, 100].map((level) => {
            const radius = (level / 100) * maxRadius;
            return (
              <Circle
                key={level}
                cx={center}
                cy={center}
                r={radius}
                stroke={COLORS.gray[200]}
                strokeWidth={0.5}
                fill="none"
              />
            );
          })}

          {/* Data polygon */}
          <Polygon
            points={polygonPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </G>
      </Svg>

      {/* Pulsing glow for current week */}
      {isCurrent && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.pulsingGlow]} />
        </View>
      )}
    </View>
  );
};

/**
 * Timeline Week Card Component
 */
const TimelineWeekCard: React.FC<{
  week: TimelineWeek;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}> = ({ week, index, scrollX, onPress }) => {
  /**
   * Card animation based on scroll position
   */
  const animatedCardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_GAP),
      index * (CARD_WIDTH + CARD_GAP),
      (index + 1) * (CARD_WIDTH + CARD_GAP),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  /**
   * Prepare radar data
   */
  const radarData = [
    { x: 'R', y: getStrandScore(week.strands.rhythm) },
    { x: 'C', y: getStrandScore(week.strands.confidence) },
    { x: 'V', y: getStrandScore(week.strands.vocabulary) },
    { x: 'A', y: getStrandScore(week.strands.accuracy) },
    { x: 'L', y: getStrandScore(week.strands.learning) },
    { x: 'E', y: getStrandScore(week.strands.emotional) },
  ];

  /**
   * Handle press
   */
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[styles.weekCard, animatedCardStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.weekCardTouchable}
      >
        <View style={[styles.weekCardContent, SHADOWS.sm, week.isCurrent && styles.currentWeekCard]}>
          {/* Week label */}
          <Text style={[styles.weekLabel, week.isCurrent && styles.currentWeekLabel]}>
            {week.isCurrent ? 'This Week' : `Week ${week.weekNumber}`}
          </Text>

          {/* Date */}
          <Text style={styles.weekDate}>
            {format(week.weekStart, 'MMM d')}
          </Text>

          {/* Mini radar */}
          <MiniRadarChart data={radarData} isCurrent={week.isCurrent} />

          {/* Stats */}
          <View style={styles.weekStats}>
            <View style={styles.statRow}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.gray[500]} />
              <Text style={styles.statText}>{week.sessions} sessions</Text>
            </View>
            {week.minutes > 0 && (
              <View style={styles.statRow}>
                <Ionicons name="time" size={12} color={COLORS.gray[500]} />
                <Text style={styles.statText}>{week.minutes} min</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Connecting line to next card */}
      {!week.isCurrent && (
        <View style={styles.connectingLine}>
          <LinearGradient
            colors={[COLORS.primary[300], COLORS.primary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Evolution Timeline Component
 */
export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({ weeks, onWeekPress }) => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  /**
   * Handle scroll events
   */
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Ionicons name="analytics" size={ICON_SIZES.lg} color={COLORS.primary[500]} />
        <Text style={styles.headerTitle}>DNA Evolution</Text>
      </View>

      {/* Timeline */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Spacer at start */}
        <View style={{ width: 16 }} />

        {/* Week cards */}
        {weeks.map((week, index) => (
          <TimelineWeekCard
            key={`week-${week.weekNumber}`}
            week={week}
            index={index}
            scrollX={scrollX}
            onPress={() => onWeekPress?.(week)}
          />
        ))}

        {/* Spacer at end */}
        <View style={{ width: 16 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  scrollContent: {
    paddingVertical: 10,
  },
  weekCard: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    position: 'relative',
  },
  weekCardTouchable: {
    flex: 1,
  },
  weekCardContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  currentWeekCard: {
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  weekLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[700],
    marginBottom: 2,
  },
  currentWeekLabel: {
    color: COLORS.primary[600],
  },
  weekDate: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray[500],
    marginBottom: 8,
  },
  miniRadarContainer: {
    width: MINI_RADAR_SIZE,
    height: MINI_RADAR_SIZE,
    marginBottom: 8,
    position: 'relative',
  },
  pulsingGlow: {
    width: '100%',
    height: '100%',
    borderRadius: MINI_RADAR_SIZE / 2,
    backgroundColor: COLORS.primary[500],
    opacity: 0.1,
  },
  weekStats: {
    gap: 4,
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  connectingLine: {
    position: 'absolute',
    right: -CARD_GAP,
    top: '50%',
    width: CARD_GAP,
    height: 2,
    marginTop: -1,
  },
});

export default EvolutionTimeline;
