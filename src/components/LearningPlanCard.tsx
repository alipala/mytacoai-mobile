/**
 * LearningPlanCard.tsx
 * Individual learning plan card component
 * Matches web app design and functionality
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LearningPlan } from '../../api/generated';
import { useNavigation } from '@react-navigation/native';

interface LearningPlanCardProps {
  plan: LearningPlan;
  progressStats?: {
    total_sessions: number;
    total_minutes: number;
    current_streak: number;
    longest_streak: number;
    sessions_this_week: number;
    sessions_this_month: number;
  } | null;
  onViewDetails?: (plan: LearningPlan) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LearningPlanCard: React.FC<LearningPlanCardProps> = ({
  plan,
  progressStats,
  onViewDetails,
}) => {
  const navigation = useNavigation();

  // Calculate progress
  const progressPercentage = plan.progress_percentage || 0;
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const isCompleted = progressPercentage === 100;

  // Get language flag
  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      english: '🇺🇸',
      dutch: '🇳🇱',
      spanish: '🇪🇸',
      french: '🇫🇷',
      german: '🇩🇪',
      italian: '🇮🇹',
      portuguese: '🇵🇹',
      turkish: '🇹🇷',
    };
    return flags[language.toLowerCase()] || '🌍';
  };

  // Get level color
  const getLevelColor = (level: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      A1: { bg: '#FEE2E2', text: '#DC2626' },
      A2: { bg: '#FED7AA', text: '#EA580C' },
      B1: { bg: '#E9D8FD', text: '#805AD5' },
      B2: { bg: '#DBEAFE', text: '#2563EB' },
      C1: { bg: '#D1FAE5', text: '#059669' },
      C2: { bg: '#FEF3C7', text: '#D97706' },
    };
    return colors[level] || { bg: '#E5E7EB', text: '#6B7280' };
  };

  const levelColors = getLevelColor(plan.proficiency_level);

  const handleContinueLearning = () => {
    // Navigate to conversation with this plan
    navigation.navigate('Conversation' as never, { planId: plan.id } as never);
  };

  const handleViewDetails = () => {
    // Use onViewDetails prop if provided, otherwise fallback to navigation
    if (onViewDetails) {
      onViewDetails(plan);
    } else {
      navigation.navigate('LearningPlanDetails' as never, { plan } as never);
    }
  };

  return (
    <View style={styles.card}>
      {/* Language Header */}
      <View style={styles.header}>
        <View style={styles.languageInfo}>
          <Text style={styles.flagEmoji}>{getLanguageFlag(plan.language)}</Text>
          <View>
            <Text style={styles.languageName}>
              {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)}
            </Text>
            <View
              style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}
            >
              <Text style={[styles.levelText, { color: levelColors.text }]}>
                {plan.proficiency_level} Level
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={56} color="#10B981" />
          ) : (
            <View style={styles.percentageContainer}>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.progressLabel}>
          {isCompleted ? '🎉 Completed!' : 'Complete'}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="radio-button-on" size={20} color="#4FD1C5" />
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color="#4FD1C5" />
          <Text style={styles.statValue}>{Math.round(progressPercentage)}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={20} color="#4FD1C5" />
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Plan Title */}
      <Text style={styles.planTitle}>
        {plan.duration_months}-Month{' '}
        {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)} Learning
        Plan for {plan.proficiency_level} Level
      </Text>

      {/* Action Buttons */}
      {isCompleted ? (
        <View style={styles.completedButton}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.completedButtonText}>Plan Completed</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueLearning}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </TouchableOpacity>
      )}

      {/* View Details Button */}
      <TouchableOpacity style={styles.detailsButton} onPress={handleViewDetails}>
        <Ionicons name="eye-outline" size={20} color="#4A5568" />
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>

      {/* Progress Footer */}
      <View style={styles.progressFooter}>
        <Text style={styles.progressFooterText}>Progress</Text>
        <Text style={styles.progressFooterValue}>
          {completedSessions}/{totalSessions} sessions
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: SCREEN_WIDTH - 40, // 20px padding on each side
  },
  header: {
    marginBottom: 20,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 36,
  },
  languageName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  progressCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  percentageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  planTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedButton: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  completedButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  detailsButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },
  progressFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressFooterValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4FD1C5',
    borderRadius: 5,
  },
});
