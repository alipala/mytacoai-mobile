/**
 * Today's Progress Card
 *
 * Beautiful, animated card showing user's daily challenge statistics
 * - Challenges completed today
 * - Accuracy percentage
 * - Current streak
 *
 * Design: Modern, gaming-inspired with gradients and animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyStats } from '../services/dailyStatsService';

const { width } = Dimensions.get('window');

interface TodaysProgressCardProps {
  stats: DailyStats;
  isLoading?: boolean;
}

export default function TodaysProgressCard({ stats, isLoading }: TodaysProgressCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressBarAnim, {
      toValue: stats.accuracyToday / 100,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [stats.accuracyToday]);

  // Format accuracy with color coding
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 85) return '#10B981'; // Green - Excellent
    if (accuracy >= 70) return '#F59E0B'; // Amber - Good
    return '#EF4444'; // Red - Needs improvement
  };

  // Format streak emoji
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥'; // Legendary
    if (streak >= 14) return '🔥🔥'; // Hot
    if (streak >= 7) return '🔥'; // On fire
    if (streak >= 3) return '⭐'; // Getting there
    return '✨'; // Starting out
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F3F4F6', '#E5E7EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Show nothing if no activity today
  if (stats.challengesCompletedToday === 0) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#DBEAFE', '#BFDBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No Challenges Today</Text>
            <Text style={styles.emptySubtitle}>Complete challenges to start tracking your daily progress!</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  const accuracyColor = getAccuracyColor(stats.accuracyToday);
  const streakEmoji = getStreakEmoji(stats.currentStreak);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.whiteCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 Today's Progress</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        </View>

        {/* Stats Grid - Colorful individual cards */}
        <View style={styles.statsGrid}>
          {/* Challenges Completed - Turquoise */}
          <View style={[styles.statBox, { backgroundColor: '#F0FFFE', borderColor: '#4ECFBF' }]}>
            <Text style={[styles.statValue, { color: '#4ECFBF' }]}>{stats.challengesCompletedToday}</Text>
            <Text style={[styles.statLabel, { color: '#2C9B8B' }]}>Completed</Text>
          </View>

          {/* Accuracy - Dynamic color */}
          <View style={[styles.statBox, {
            backgroundColor: accuracyColor === '#10B981' ? '#F0FDF4' : accuracyColor === '#F59E0B' ? '#FFF9F0' : '#FFF5F5',
            borderColor: accuracyColor
          }]}>
            <Text style={[styles.statValue, { color: accuracyColor }]}>
              {Math.round(stats.accuracyToday)}%
            </Text>
            <Text style={[styles.statLabel, { color: accuracyColor }]}>Accuracy</Text>
          </View>

          {/* Streak - Orange */}
          <View style={[styles.statBox, { backgroundColor: '#FFF9F0', borderColor: '#FFA955' }]}>
            <Text style={[styles.statValue, { color: '#FFA955' }]}>
              {streakEmoji} {stats.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: '#E08B3D' }]}>Day Streak</Text>
          </View>
        </View>

        {/* Accuracy Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: accuracyColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>
            {stats.correctToday} correct • {stats.incorrectToday} incorrect
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginHorizontal: 3,
    borderWidth: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
