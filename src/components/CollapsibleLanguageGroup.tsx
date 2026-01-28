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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';
import { MiniLearningPlanCard } from './MiniLearningPlanCard';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLAN_CARD_WIDTH = SCREEN_WIDTH - 100; // Width for each mini card

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
  const MIN_HEIGHT = 65;  // Minimum readable height (compact)
  const MAX_HEIGHT = 120; // Maximum to prevent too tall cards (reduced from 140)

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
  const name = getLanguageName(language);
  const FlagComponent = getLanguageFlagComponent(language);
  const stats = calculateAggregateStats(plans);

  // Calculate dynamic height based on total language count
  const dynamicHeight = calculateDynamicHeight(totalLanguageCount);

  // Animation values
  const rotation = useSharedValue(isExpanded ? 180 : 0);
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
    // Animate chevron rotation
    rotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });

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
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    maxHeight: contentHeight.value === 0 ? 0 : 10000, // Large number for auto-height
  }));

  return (
    <View style={styles.container}>
      {/* Collapsible Header - Entire area is tappable, with dynamic height */}
      <TouchableOpacity
        style={[styles.header, { minHeight: dynamicHeight }]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
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
              <Text style={[styles.languageName, totalLanguageCount > 4 && styles.textSmall]}>
                {name}
              </Text>
              <Text style={[styles.planCount, totalLanguageCount > 4 && styles.textSmall]}>
                ({plans.length})
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="flash" size={totalLanguageCount > 4 ? 10 : 11} color="#F59E0B" />
                <Text style={[styles.statText, totalLanguageCount > 4 && styles.textTiny]}>
                  {stats.avgProgress}% avg
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={totalLanguageCount > 4 ? 10 : 11} color="#6B7280" />
                <Text style={[styles.statText, totalLanguageCount > 4 && styles.textTiny]}>
                  {stats.sessionText}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time" size={totalLanguageCount > 4 ? 10 : 11} color="#6B7280" />
                <Text style={[styles.statText, totalLanguageCount > 4 && styles.textTiny]}>
                  {stats.timeText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right: DNA Button + Chevron */}
        <View style={styles.rightSection}>
          {/* DNA Chip - Only show if analysis exists */}
          {hasDNAAnalysis && (
            <TouchableOpacity
              style={[styles.dnaChip, !isPremium && styles.dnaChipLocked]}
              onPress={handleDNAPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="analytics"
                size={totalLanguageCount > 4 ? 12 : 13}
                color={isPremium ? '#14B8A6' : '#9CA3AF'}
              />
              <Text style={[styles.dnaText, !isPremium && styles.dnaTextLocked]}>
                DNA
              </Text>
            </TouchableOpacity>
          )}

          {/* Animated Chevron */}
          <Animated.View style={[styles.chevronContainer, chevronStyle]}>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Expandable Content - Plan Cards Horizontal Sliding */}
      <Animated.View style={[styles.content, contentStyle]}>
        {isExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansScrollContent}
            snapToInterval={PLAN_CARD_WIDTH + 16}
            decelerationRate="fast"
            style={styles.plansScroller}
          >
            {plans.map((plan, index) => (
              <View
                key={plan.id || index}
                style={[
                  styles.planCardWrapper,
                  index === 0 && styles.firstCard,
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
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginBottom: 4,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 4,
  },
  planCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  textSmall: {
    fontSize: 14, // Smaller text for 5+ languages
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  textTiny: {
    fontSize: 10, // Even smaller for 5+ languages
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dnaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  dnaChipLocked: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  dnaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14B8A6',
  },
  dnaTextLocked: {
    color: '#9CA3AF',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    overflow: 'hidden',
  },
  plansScroller: {
    flexGrow: 0,
  },
  plansScrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  planCardWrapper: {
    width: PLAN_CARD_WIDTH,
    paddingHorizontal: 8,
  },
  firstCard: {
    paddingLeft: 12,
  },
  lastCard: {
    paddingRight: 12,
  },
});

export default CollapsibleLanguageGroup;
