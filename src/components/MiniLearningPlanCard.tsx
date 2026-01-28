/**
 * Mini Learning Plan Card - Ultra Compact for Accordion View
 * ===========================================================
 *
 * Design Goals:
 * - Maximum height: 180px (fits in accordion)
 * - Horizontal button layout (Continue, Details, DNA)
 * - No flag (shown in group header)
 * - Smaller progress ring
 * - Essential info only
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface MiniLearningPlanCardProps {
  plan: any;
  onContinue: () => void;
  onViewDetails: () => void;
  onViewAssessment?: () => void;
  onCreateNextPlan?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getLevelColor = (level: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'A1': { bg: '#FEE2E2', text: '#DC2626' },
    'A2': { bg: '#FED7AA', text: '#EA580C' },
    'B1': { bg: '#E9D8FD', text: '#805AD5' },
    'B2': { bg: '#DBEAFE', text: '#2563EB' },
    'C1': { bg: '#D1FAE5', text: '#059669' },
    'C2': { bg: '#FEF3C7', text: '#D97706' }
  };
  return colors[level.toUpperCase()] || { bg: '#E0F2FE', text: '#0891B2' };
};

const getStatusBadge = (percentage: number) => {
  if (percentage === 0) {
    return { text: 'NEW', bg: '#8B5CF6', ribbonStyle: 'ribbonNew' };
  }
  if (percentage === 100) {
    return { text: 'COMPLETED', bg: '#10B981', ribbonStyle: 'ribbonCompleted' };
  }
  return { text: 'IN PROGRESS', bg: '#3B82F6', ribbonStyle: 'ribbonInProgress' };
};

// ============================================================================
// COMPONENT
// ============================================================================

export const MiniLearningPlanCard: React.FC<MiniLearningPlanCardProps> = ({
  plan,
  onContinue,
  onViewDetails,
  onViewAssessment,
  onCreateNextPlan,
}) => {
  const language = plan.language || plan.target_language || 'English';
  const languageCapitalized = language.charAt(0).toUpperCase() + language.slice(1);
  const level = plan.proficiency_level || plan.target_cefr_level || 'B1';
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = Math.round((completedSessions / totalSessions) * 100);

  const levelColors = getLevelColor(level);
  const statusBadge = getStatusBadge(percentage);

  const handleContinue = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onContinue();
  };

  const handleDetails = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDetails();
  };

  const handleAssessment = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewAssessment?.();
  };

  return (
    <View style={styles.card}>
      {/* Diagonal Corner Ribbon Badge */}
      <View style={[styles.ribbon, styles[statusBadge.ribbonStyle as keyof typeof styles]]}>
        <Text style={styles.ribbonText}>{statusBadge.text}</Text>
      </View>

      {/* Top Row: Level Badge Only (no language name - shown in group header) */}
      <View style={styles.topRow}>
        <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
          <Text style={[styles.levelText, { color: levelColors.text }]}>
            {level.toUpperCase()} Level
          </Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {/* Compact Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <View
              style={[
                styles.progressFill,
                {
                  transform: [{ rotate: `${(percentage * 3.6) - 90}deg` }],
                  borderColor: percentage >= 100 ? '#10B981' : '#4FD1C5',
                },
              ]}
            />
            <View style={styles.progressInner}>
              <Text style={styles.progressText}>{percentage}%</Text>
            </View>
          </View>
        </View>

        {/* Stats Column */}
        <View style={styles.statsColumn}>
          <View style={styles.statRow}>
            <Ionicons name="calendar" size={13} color="#6B7280" />
            <Text style={styles.statText}>
              {completedSessions}/{totalSessions} sessions
            </Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="time" size={13} color="#6B7280" />
            <Text style={styles.statText}>{completedSessions * 5} min</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row - Equal Width */}
      <View style={styles.buttonsRow}>
        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4FD1C5', '#3DA89D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Ionicons name="play" size={14} color="#FFFFFF" />
            <Text style={styles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={handleDetails}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle" size={14} color="#4FD1C5" />
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 188, // Increased from 168
    maxHeight: 198, // Increased from 178
    overflow: 'hidden',
  },
  // Diagonal Corner Ribbon - Base Style
  ribbon: {
    position: 'absolute',
    top: -3,
    right: -3,
    paddingHorizontal: 32,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }, { translateX: 30 }, { translateY: -8 }],
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonNew: {
    backgroundColor: '#8B5CF6', // Purple
  },
  ribbonInProgress: {
    backgroundColor: '#3B82F6', // Blue
  },
  ribbonCompleted: {
    backgroundColor: '#10B981', // Green
  },
  ribbonText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12, // Increased spacing
    paddingRight: 50,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14, // Increased spacing
  },
  progressContainer: {
    marginRight: 12,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: '#4FD1C5',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  statsColumn: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  continueButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  continueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#4FD1C5',
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4FD1C5',
  },
});

export default MiniLearningPlanCard;
