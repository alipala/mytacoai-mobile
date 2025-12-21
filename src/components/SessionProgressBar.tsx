/**
 * Session Progress Bar
 *
 * Displays current session progress at the top of challenge screens
 * Shows: Current challenge number, XP earned, combo multiplier
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChallengeSession } from '../contexts/ChallengeSessionContext';
import { formatXP } from '../services/xpCalculator';

interface SessionProgressBarProps {
  showXP?: boolean;
  showCombo?: boolean;
}

export default function SessionProgressBar({
  showXP = true,
  showCombo = true,
}: SessionProgressBarProps) {
  const { session, getProgress } = useChallengeSession();
  const progress = getProgress();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const comboScaleAnim = useRef(new Animated.Value(1)).current;

  // Animate progress bar
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress.percentage,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [progress.percentage]);

  // Animate combo when it changes
  useEffect(() => {
    if (session && session.currentCombo > 1) {
      // Pulse animation
      Animated.sequence([
        Animated.spring(comboScaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(comboScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
      ]).start();
    }
  }, [session?.currentCombo]);

  if (!session) {
    return null;
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Top bar with stats */}
      <View style={styles.statsRow}>
        <Text style={styles.progressText}>
          Challenge {progress.current + 1}/{progress.total}
        </Text>

        <View style={styles.rightStats}>
          {showXP && (
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>💪</Text>
              <Text style={styles.statValue}>{formatXP(session.totalXP)} XP</Text>
            </View>
          )}

          {showCombo && session.currentCombo > 1 && (
            <Animated.View
              style={[styles.comboBadge, { transform: [{ scale: comboScaleAnim }] }]}
            >
              <LinearGradient
                colors={['#FF6B9D', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.comboGradient}
              >
                <Text style={styles.comboText}>{session.currentCombo}x 🔥</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
            <LinearGradient
              colors={['#06B6D4', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0891B2',
  },
  comboBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  comboGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comboText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
