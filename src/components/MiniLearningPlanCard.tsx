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
import { useTranslation } from 'react-i18next';
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
    'A1': { bg: 'rgba(220, 38, 38, 0.15)', text: '#FCA5A5' },
    'A2': { bg: 'rgba(234, 88, 12, 0.15)', text: '#FED7AA' },
    'B1': { bg: 'rgba(128, 90, 213, 0.15)', text: '#C4B5FD' },
    'B2': { bg: 'rgba(37, 99, 235, 0.15)', text: '#93C5FD' },
    'C1': { bg: 'rgba(5, 150, 105, 0.15)', text: '#6EE7B7' },
    'C2': { bg: 'rgba(217, 119, 6, 0.15)', text: '#FCD34D' }
  };
  return colors[level.toUpperCase()] || { bg: 'rgba(8, 145, 178, 0.15)', text: '#67E8F9' };
};

const getStatusBadge = (percentage: number, t: any) => {
  if (percentage === 0) {
    return { text: t('learning_plan.status_new'), bg: '#8B5CF6', ribbonStyle: 'ribbonNew' };
  }
  if (percentage === 100) {
    return { text: t('learning_plan.status_completed'), bg: '#10B981', ribbonStyle: 'ribbonCompleted' };
  }
  return { text: t('learning_plan.status_in_progress'), bg: '#3B82F6', ribbonStyle: 'ribbonInProgress' };
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
  const { t } = useTranslation();
  const language = plan.language || plan.target_language || 'English';
  const languageCapitalized = language.charAt(0).toUpperCase() + language.slice(1);
  const level = plan.proficiency_level || plan.target_cefr_level || 'B1';
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = Math.round((completedSessions / totalSessions) * 100);

  const levelColors = getLevelColor(level);
  const statusBadge = getStatusBadge(percentage, t);

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
            {level.toUpperCase()}{t('learning_plan.details.level_suffix')}
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
            colors={['#14B8A6', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Ionicons name="play" size={14} color="#FFFFFF" />
            <Text style={styles.continueText}>{t('learning_plan.continue')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={handleDetails}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle" size={14} color="#14B8A6" />
          <Text style={styles.detailsText}>{t('learning_plan.details_button')}</Text>
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
    backgroundColor: 'rgba(11, 26, 31, 0.8)',
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
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
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
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
    borderColor: '#14B8A6',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(11, 26, 31, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14B8A6',
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
    color: '#B4E4DD',
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
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
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
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
  },
});

export default MiniLearningPlanCard;
