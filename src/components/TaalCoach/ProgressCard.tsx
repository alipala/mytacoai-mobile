/**
 * Progress Card Component
 * =======================
 * Rich card displaying user progress stats (streak, sessions, etc.)
 * Embedded within coach chat - NO redirections.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressCardProps {
  data: {
    streak: number;
    total_sessions: number;
    last_7_days?: any[];
  };
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ data }) => {
  const { streak, total_sessions, last_7_days = [] } = data;

  // Calculate total XP from last 7 days
  const totalXP = last_7_days.reduce((sum, day) => sum + (day.xp_earned || 0), 0);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.gradient}
      >
        <Text style={styles.title}>Your Progress 📈</Text>

        <View style={styles.statsGrid}>
          {/* Streak */}
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="flame" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          {/* Sessions */}
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{total_sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>

          {/* XP */}
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
            </View>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP (7d)</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1FAE5',
  },
});

export default ProgressCard;
