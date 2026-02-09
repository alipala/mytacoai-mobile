import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

// Goal icon mapping using Ionicons
const GOAL_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  business: { icon: 'briefcase', color: '#F59E0B' },
  travel: { icon: 'airplane', color: '#EF4444' },
  academic: { icon: 'book', color: '#8B5CF6' },
  daily: { icon: 'chatbubbles', color: '#3B82F6' },
  presentations: { icon: 'mic', color: '#10B981' },
  interviews: { icon: 'people', color: '#EC4899' },
};

interface SpotifyStylePlanCardProps {
  plan: LearningPlan;
  onPress: (plan: LearningPlan) => void;
}

export const SpotifyStylePlanCard: React.FC<SpotifyStylePlanCardProps> = ({
  plan,
  onPress,
}) => {
  const language = plan.language || 'english';
  const level = plan.proficiency_level || 'A1';
  const goals = plan.goals || [];
  const primaryGoal = goals[0] || 'daily';
  const goalConfig = GOAL_ICONS[primaryGoal] || { icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap, color: '#3B82F6' };

  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = plan.progress_percentage || Math.round((completedSessions / totalSessions) * 100);

  const isCompleted = percentage >= 100;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress(plan);
  };

  // Get readable goal name
  const getGoalName = (goal: string) => {
    const names: Record<string, string> = {
      business: 'Business',
      travel: 'Travel',
      academic: 'Academic',
      daily: 'Daily',
      presentations: 'Presentations',
      interviews: 'Interviews',
    };
    return names[goal] || goal.charAt(0).toUpperCase() + goal.slice(1);
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.card, { backgroundColor: goalConfig.color }]}>
        {/* Completed Badge */}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Goal Icon Container */}
        <View style={styles.iconContainer}>
          <Ionicons name={goalConfig.icon} size={48} color="#FFFFFF" />
        </View>

        {/* Plan Title */}
        <Text style={styles.planTitle} numberOfLines={1}>
          {getGoalName(primaryGoal)} {level}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(percentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{percentage}%</Text>
        </View>

        {/* Sessions Info */}
        <Text style={styles.sessionsText}>
          {completedSessions}/{totalSessions} sessions
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sessionsText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
