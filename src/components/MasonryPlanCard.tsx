import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';

interface MasonryPlanCardProps {
  plan: LearningPlan;
  onPress: (plan: LearningPlan, color: string) => void;
  isLarge?: boolean; // For the 2 most recent plans (hero cards)
  colorIndex?: number; // For varied colors
  size?: 'small' | 'medium' | 'large'; // For masonry height variation
}

// Colorful palette like Challenges screen
const CARD_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Deep Orange
];

const GOAL_COLORS: Record<string, string> = {
  business: '#F59E0B',
  travel: '#EF4444',
  academic: '#8B5CF6',
  daily: '#3B82F6',
  presentations: '#10B981',
  interviews: '#EC4899',
  default: '#14B8A6',
};

const GOAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  business: 'briefcase',
  travel: 'airplane',
  academic: 'book',
  daily: 'chatbubbles',
  presentations: 'mic',
  interviews: 'people',
};

export const MasonryPlanCard: React.FC<MasonryPlanCardProps> = ({
  plan,
  onPress,
  isLarge = false,
  colorIndex = 0,
  size = 'medium',
}) => {
  // Use colorIndex for varied colors, fallback to goal-based color
  const goalType = plan.learning_goal?.toLowerCase() || 'default';
  const goalColor = GOAL_COLORS[goalType] || GOAL_COLORS.default;
  const color = colorIndex !== undefined ? CARD_COLORS[colorIndex % CARD_COLORS.length] : goalColor;
  const icon = GOAL_ICONS[goalType] || 'school';

  const progressPercentage = plan.progress_percentage || 0;
  const completedSessions = plan.completed_sessions || 0;
  const status = plan.status?.toLowerCase() || 'in_progress';

  // Determine badge to show
  const isNew = (status === 'in_progress' || !plan.status) && completedSessions === 0;
  const isInProgress = (status === 'in_progress' || status === 'awaiting_final_assessment') && completedSessions > 0;
  const isCompleted = status === 'completed' || progressPercentage >= 100;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress(plan, color);
  };

  // Get size-specific styles
  const getSizeStyle = () => {
    if (isLarge) return styles.cardLarge;
    switch (size) {
      case 'small':
        return styles.cardSmall;
      case 'large':
        return styles.cardLargeNonHero;
      default:
        return styles.cardMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        getSizeStyle(),
        { backgroundColor: color },
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Learning Plan Tag - Top Right Corner */}
      <View style={styles.planTag}>
        <Ionicons name="school" size={10} color="#FFFFFF" />
        <Text style={styles.planTagText}>LEARNING PLAN</Text>
      </View>

      {/* Content Container - Prevents overflow */}
      <View style={[styles.contentContainer, isLarge && styles.contentContainerLarge]}>
        <View style={styles.topRow}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={isLarge ? 32 : 24} color="#FFFFFF" />
          </View>
        </View>

        {/* Language name - Full width to prevent cutoff */}
        <View style={styles.languageContainer}>
          <Text style={[styles.language, isLarge && styles.languageLarge]} numberOfLines={1}>
            {plan.language || plan.target_language}
          </Text>
          <Text style={[styles.level, isLarge && styles.levelLarge]} numberOfLines={1}>
            {plan.proficiency_level || 'A1'} · {(() => {
              // Try multiple fields for learning goal
              const goal = plan.learning_goal || plan.goal || plan.goals?.[0] || plan.custom_goal;
              if (goal) {
                // Capitalize first letter
                return goal.charAt(0).toUpperCase() + goal.slice(1);
              }
              return 'General';
            })()}
          </Text>
        </View>

        {/* Progress Bar - Always visible */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
        </View>

        {/* Sessions and Duration - Show for all cards */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={isLarge ? 14 : 12} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.statsText, isLarge && styles.statsTextLarge]} numberOfLines={1}>
              {plan.completed_sessions || 0}/{plan.total_sessions || 24} sessions
            </Text>
          </View>
          {plan.duration_months && (
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={isLarge ? 14 : 12} color="rgba(255,255,255,0.9)" />
              <Text style={[styles.statsText, isLarge && styles.statsTextLarge]} numberOfLines={1}>
                {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}
              </Text>
            </View>
          )}
        </View>

        {/* Additional info for hero cards - removed as requested */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  cardSmall: {
    minHeight: 180,
    padding: 16,
  },
  cardMedium: {
    minHeight: 180,
    padding: 16,
  },
  cardLargeNonHero: {
    minHeight: 180,
    padding: 16,
  },
  cardLarge: {
    // Hero cards (first 2) - full width
    minHeight: 180,
    padding: 18,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 12,
  },
  contentContainerLarge: {
    paddingTop: 16,
  },
  planTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  planTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    flexShrink: 0,
  },
  languageContainer: {
    width: '100%',
    marginBottom: 8,
    paddingRight: 100, // Space for LEARNING PLAN tag
  },
  language: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  languageLarge: {
    fontSize: 18,
    marginBottom: 3,
  },
  level: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 0,
  },
  levelLarge: {
    fontSize: 13,
    marginBottom: 0,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 35,
    textAlign: 'right',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsTextLarge: {
    fontSize: 12,
  },
  heroStats: {
    marginTop: 10,
    gap: 8,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
