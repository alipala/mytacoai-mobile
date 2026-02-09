/**
 * Collapsible Language Group Component
 * =====================================
 *
 * Compact accordion-style language grouping with:
 * - Collapsed state: 55-60px height with summary stats
 * - Expanded state: Shows all plan cards vertically
 * - Smooth spring animations
 * - DNA button always accessible
 * - Minimal user effort (entire header is tappable)
 * - Haptic feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { LearningPlan } from '../api/generated';
import { MiniLearningPlanCard } from './MiniLearningPlanCard';
import { Typography } from '../constants/typography';
import { getLanguageGradient, getLanguageGradientWithOpacity } from '../utils/gradientHelpers';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Calculate proper card width accounting for all paddings and margins
const LANGUAGE_GROUP_PADDING = 32; // languageGroupsContainer paddingHorizontal: 16 (left + right)
const SCROLLVIEW_PADDING = 24; // Padding inside the horizontal ScrollView (12px each side)
const BORDER_AND_SHADOW = 12; // Account for borders, shadows, and safe spacing
const PLAN_CARD_WIDTH = SCREEN_WIDTH - LANGUAGE_GROUP_PADDING - SCROLLVIEW_PADDING - BORDER_AND_SHADOW;
const CARD_SPACING = 12; // Gap between cards for snap effect

// ============================================================================
// TYPES
// ============================================================================

interface CollapsibleLanguageGroupProps {
  language: string;
  plans: LearningPlan[];
  progressStats: any;
  isPremium: boolean;
  onContinue: (planId: string) => void;
  onViewDetails: (plan: LearningPlan) => void;
  onViewAssessment: (plan: LearningPlan) => void;
  onCreateNextPlan?: (plan: LearningPlan) => void;
  onViewDNA: (language: string) => void;
  existingPlanIds: string[];
  totalLanguageCount: number; // For dynamic height calculation
  hasDNAAnalysis?: boolean; // Show DNA button only if analysis exists
  isExpanded: boolean; // Controlled expansion state
  onToggleExpand: () => void; // Callback to handle expansion
}

/**
 * Calculate dynamic height based on number of language groups
 * Goal: Fill screen properly with all groups + "Start New Session" button
 */
const calculateDynamicHeight = (totalCount: number): number => {
  // Available height = Screen height - Header (90) - Session button (140) - Padding/Margins (80)
  const availableHeight = SCREEN_HEIGHT - 90 - 140 - 80;

  // Divide by number of groups
  const calculatedHeight = availableHeight / totalCount;

  // Clamp between min and max for usability
  const MIN_HEIGHT = 80;  // Increased from 65 to extend card height
  const MAX_HEIGHT = 140; // Increased from 120 to allow taller cards

  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, calculatedHeight));
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get language display name
 */
const getLanguageName = (language: string): string => {
  const languageMap: Record<string, string> = {
    dutch: 'Dutch',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    german: 'German',
    portuguese: 'Portuguese',
  };

  return languageMap[language.toLowerCase()] ||
    language.charAt(0).toUpperCase() + language.slice(1);
};

/**
 * Get border and background colors based on language flag colors - DARK THEME
 */
const getLanguageColors = (language: string): { border: string; background: string; glow: string } => {
  const colors: Record<string, { border: string; background: string; glow: string }> = {
    'dutch': {
      border: '#FF6B35',                      // Dutch Orange (Oranje)
      background: 'rgba(255, 107, 53, 0.12)', // Translucent orange
      glow: '#FF6B35'
    },
    'english': {
      border: '#C8102E',                      // British Red
      background: 'rgba(200, 16, 46, 0.12)',  // Translucent red
      glow: '#C8102E'
    },
    'spanish': {
      border: '#FBBF24',                      // Spanish Yellow/Gold
      background: 'rgba(251, 191, 36, 0.12)', // Translucent yellow
      glow: '#FBBF24'
    },
    'french': {
      border: '#0055A4',                      // French Blue
      background: 'rgba(0, 85, 164, 0.12)',   // Translucent blue
      glow: '#0055A4'
    },
    'german': {
      border: '#DD0000',                      // German Red
      background: 'rgba(221, 0, 0, 0.12)',    // Translucent red
      glow: '#DD0000'
    },
    'portuguese': {
      border: '#006600',                      // Portuguese Green
      background: 'rgba(0, 102, 0, 0.12)',    // Translucent green
      glow: '#006600'
    },
  };
  return colors[language.toLowerCase()] || {
    border: '#14B8A6',
    background: 'rgba(20, 184, 166, 0.12)',
    glow: '#14B8A6'
  };
};

/**
 * Get SVG flag component for language
 */
const getLanguageFlagComponent = (language: string): React.FC<any> | null => {
  const flags: Record<string, React.FC<any>> = {
    'english': EnglishFlag,
    'spanish': SpanishFlag,
    'french': FrenchFlag,
    'german': GermanFlag,
    'dutch': DutchFlag,
    'portuguese': PortugueseFlag,
  };
  return flags[language.toLowerCase()] || null;
};

/**
 * Calculate aggregate statistics for collapsed state
 */
const calculateAggregateStats = (plans: LearningPlan[]) => {
  let totalCompleted = 0;
  let totalSessions = 0;
  let totalMinutes = 0;

  plans.forEach(plan => {
    const completed = plan.completed_sessions || 0;
    const total = plan.total_sessions || 16;
    totalCompleted += completed;
    totalSessions += total;
    totalMinutes += completed * 5; // 5 min per session
  });

  const avgProgress = totalSessions > 0
    ? Math.round((totalCompleted / totalSessions) * 100)
    : 0;

  return {
    avgProgress,
    sessionText: `${totalCompleted}/${totalSessions}`,
    timeText: totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes} min`,
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CollapsibleLanguageGroup: React.FC<CollapsibleLanguageGroupProps> = ({
  language,
  plans,
  progressStats,
  isPremium,
  onContinue,
  onViewDetails,
  onViewAssessment,
  onCreateNextPlan,
  onViewDNA,
  existingPlanIds,
  totalLanguageCount,
  hasDNAAnalysis = false,
  isExpanded,
  onToggleExpand,
}) => {
  const { t } = useTranslation();
  const name = getLanguageName(language);
  const FlagComponent = getLanguageFlagComponent(language);
  const stats = calculateAggregateStats(plans);
  const languageColors = getLanguageColors(language);

  // Calculate dynamic height based on total language count
  const dynamicHeight = calculateDynamicHeight(totalLanguageCount);

  // Animation values
  const contentHeight = useSharedValue(isExpanded ? 1 : 0);

  /**
   * Toggle expand/collapse with animations
   */
  const toggleExpand = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onToggleExpand();
  };

  /**
   * Sync animation values with isExpanded prop
   */
  React.useEffect(() => {
    // Animate content height
    contentHeight.value = withTiming(isExpanded ? 1 : 0, {
      duration: 300,
    });
  }, [isExpanded]);

  /**
   * Handle DNA button press
   */
  const handleDNAPress = (e: any) => {
    e.stopPropagation(); // Don't trigger expand/collapse
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onViewDNA(language);
  };

  // Animated styles
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    maxHeight: contentHeight.value === 0 ? 0 : 10000, // Large number for auto-height
  }));

  // Get gradient colors for this language
  const gradientColors = getLanguageGradient(language);
  const gradientOverlay = getLanguageGradientWithOpacity(language, isExpanded ? 0.25 : 0.15);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientOverlay as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientContainer,
          {
            borderWidth: isExpanded ? 2 : 1.5,
            borderColor: `${gradientColors[0]}${isExpanded ? 'FF' : '80'}`,
            shadowColor: gradientColors[0],
            shadowOpacity: isExpanded ? 0.4 : 0.15,
            shadowRadius: isExpanded ? 12 : 6,
            elevation: isExpanded ? 8 : 3,
          }
        ]}
      >
        {/* DNA Button - Positioned in top-right corner */}
        {hasDNAAnalysis && (
          <TouchableOpacity
            style={[styles.dnaButtonAbsolute, !isPremium && styles.dnaButtonLocked]}
            onPress={handleDNAPress}
            activeOpacity={0.7}
          >
            {isPremium ? (
              <LinearGradient
                colors={gradientColors as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dnaButtonGradient}
              >
                <Ionicons name="analytics" size={14} color="#FFFFFF" />
                <Text style={styles.dnaButtonText}>
                  {t('learning_plan.dna_analysis')}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.dnaButtonGradient}>
                <Ionicons name="analytics" size={14} color="#9CA3AF" />
                <Text style={[styles.dnaButtonText, styles.dnaButtonTextLocked]}>
                  {t('learning_plan.dna_analysis')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

      {/* Collapsible Header - Entire area is tappable, with dynamic height */}
      <TouchableOpacity
        style={[styles.headerContainer, { minHeight: dynamicHeight }]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {/* Main Content Row */}
        <View style={styles.header}>
          {/* Left: SVG Flag + Language Info */}
          <View style={styles.leftSection}>
            {FlagComponent && (
              <View style={[styles.flagContainer, totalLanguageCount > 4 && styles.flagContainerSmall]}>
                <FlagComponent
                  width={totalLanguageCount > 4 ? 32 : 36}
                  height={totalLanguageCount > 4 ? 32 : 36}
                />
              </View>
            )}
            <View style={styles.languageInfo}>
              <View style={styles.topRow}>
                <Text style={styles.languageName}>
                  {name}
                </Text>
                <Text style={styles.planCount}>
                  ({plans.length})
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="flash" size={14} color="#F59E0B" />
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statNumber}>{stats.avgProgress}%</Text>
                    <Text style={styles.statLabel}>avg</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={14} color="#14B8A6" />
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statNumber}>{stats.sessionText}</Text>
                    <Text style={styles.statLabel}>sessions</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="time" size={14} color="#14B8A6" />
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statNumber}>{stats.timeText}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom: Tap to Expand/Collapse Text */}
        <View style={styles.expandHintContainer}>
          <View style={styles.expandHintDivider} />
          <View style={styles.expandHintTextContainer}>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={12}
              color="#14B8A6"
            />
            <Text style={styles.expandHintText}>
              {isExpanded ? t('learning_plan.tap_to_collapse') : t('learning_plan.tap_to_expand')}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={12}
              color="#14B8A6"
            />
          </View>
        </View>
      </TouchableOpacity>

        {/* Expandable Content - Plan Cards Horizontal Sliding */}
        <Animated.View style={[styles.content, contentStyle]}>
          {isExpanded && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.plansScrollContent}
              snapToInterval={PLAN_CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              snapToAlignment="center"
              style={styles.plansScroller}
              pagingEnabled={false}
            >
              {plans.map((plan, index) => (
                <View
                  key={plan.id || index}
                  style={[
                    styles.planCardWrapper,
                    index === plans.length - 1 && styles.lastCard,
                  ]}
                >
                  <MiniLearningPlanCard
                    plan={plan}
                    onContinue={() => onContinue(plan.id)}
                    onViewDetails={() => onViewDetails(plan)}
                    onViewAssessment={() => onViewAssessment(plan)}
                    onCreateNextPlan={
                      existingPlanIds.includes(plan.id)
                        ? undefined
                        : () => onCreateNextPlan?.(plan)
                    }
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'visible',
  },
  gradientContainer: {
    borderRadius: 14,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContainer: {
    // Outer container for entire touchable area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagContainer: {
    marginRight: 12,
  },
  flagContainerSmall: {
    marginRight: 10,
  },
  languageInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  languageName: {
    ...Typography.title.medium,
    color: '#FFFFFF',
    marginRight: 6,
  },
  planCount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Bottom Expand/Collapse Hint Section
  expandHintContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  expandHintDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 8,
  },
  expandHintTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  // DNA Button - Positioned Absolutely in Top-Right Corner
  dnaButtonAbsolute: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  dnaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dnaButtonLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  dnaButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dnaButtonTextLocked: {
    color: '#9CA3AF',
  },
  content: {
    overflow: 'hidden',
  },
  plansScroller: {
    flexGrow: 0,
  },
  plansScrollContent: {
    paddingTop: 2, // Reduced from 4 to bring cards closer to divider
    paddingBottom: 2, // Reduced from 8 to bring cards closer to "Tap to collapse"
    paddingHorizontal: 12,
  },
  planCardWrapper: {
    width: PLAN_CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  lastCard: {
    marginRight: 0, // No spacing after last card
  },
});

export default CollapsibleLanguageGroup;
