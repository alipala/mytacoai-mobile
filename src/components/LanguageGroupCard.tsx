/**
 * Language Group Card Component
 * =============================
 *
 * Groups learning plans by language with:
 * - Language header with flag and name
 * - Horizontal scrollable plan cards
 * - Speaking DNA access button
 * - Premium badge for DNA feature
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';
import { CompactLearningPlanCard } from './CompactLearningPlanCard';
import { COLORS } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAN_CARD_WIDTH = SCREEN_WIDTH - 80;

// ============================================================================
// TYPES
// ============================================================================

interface LanguageGroupCardProps {
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
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get language display name and flag emoji
 */
const getLanguageInfo = (language: string): { name: string; flag: string } => {
  const languageMap: Record<string, { name: string; flag: string }> = {
    dutch: { name: 'Dutch', flag: '🇳🇱' },
    english: { name: 'English', flag: '🇬🇧' },
    spanish: { name: 'Spanish', flag: '🇪🇸' },
    french: { name: 'French', flag: '🇫🇷' },
    german: { name: 'German', flag: '🇩🇪' },
    italian: { name: 'Italian', flag: '🇮🇹' },
    portuguese: { name: 'Portuguese', flag: '🇵🇹' },
    russian: { name: 'Russian', flag: '🇷🇺' },
    chinese: { name: 'Chinese', flag: '🇨🇳' },
    japanese: { name: 'Japanese', flag: '🇯🇵' },
    korean: { name: 'Korean', flag: '🇰🇷' },
    arabic: { name: 'Arabic', flag: '🇸🇦' },
    turkish: { name: 'Turkish', flag: '🇹🇷' },
  };

  return languageMap[language.toLowerCase()] || {
    name: language.charAt(0).toUpperCase() + language.slice(1),
    flag: '🌐',
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export const LanguageGroupCard: React.FC<LanguageGroupCardProps> = ({
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
}) => {
  const { name, flag } = getLanguageInfo(language);

  const handleDNAPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onViewDNA(language);
  };

  return (
    <View style={styles.container}>
      {/* Compact Header: Flag + Name + DNA Chip (Single Line) */}
      <View style={styles.header}>
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{flag}</Text>
          <View style={styles.languageTitleContainer}>
            <Text style={styles.languageName}>{name}</Text>
            <Text style={styles.planCount}>
              {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
            </Text>
          </View>
        </View>

        {/* DNA Chip Button - Inline on right */}
        <TouchableOpacity
          style={[
            styles.dnaChip,
            !isPremium && styles.dnaChipLocked
          ]}
          onPress={handleDNAPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="analytics"
            size={14}
            color={isPremium ? '#14B8A6' : '#9CA3AF'}
          />
          <Text style={[
            styles.dnaChipText,
            !isPremium && styles.dnaChipTextLocked
          ]}>
            DNA
          </Text>
        </TouchableOpacity>
      </View>

      {/* Learning Plans Horizontal Scroll - NO FLAGS */}
      {plans.length === 1 ? (
        // Single plan - no scroll needed
        <View style={styles.singlePlanContainer}>
          <CompactLearningPlanCard
            plan={plans[0]}
            progressStats={progressStats}
            onContinue={() => onContinue(plans[0].id)}
            onViewDetails={() => onViewDetails(plans[0])}
            onViewAssessment={() => onViewAssessment(plans[0])}
            onCreateNextPlan={
              existingPlanIds.includes(plans[0].id)
                ? undefined
                : () => onCreateNextPlan?.(plans[0])
            }
            hideFlag={true}
          />
        </View>
      ) : (
        // Multiple plans - horizontal scroll
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansScrollContent}
          snapToInterval={PLAN_CARD_WIDTH + 12}
          decelerationRate="fast"
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
              <CompactLearningPlanCard
                plan={plan}
                progressStats={progressStats}
                onContinue={() => onContinue(plan.id)}
                onViewDetails={() => onViewDetails(plan)}
                onViewAssessment={() => onViewAssessment(plan)}
                onCreateNextPlan={
                  existingPlanIds.includes(plan.id)
                    ? undefined
                    : () => onCreateNextPlan?.(plan)
                }
                hideFlag={true}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 10,
  },
  languageTitleContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 1,
  },
  planCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Compact DNA Chip Button
  dnaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  dnaChipLocked: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  dnaChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
  },
  dnaChipTextLocked: {
    color: '#9CA3AF',
  },
  singlePlanContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  plansScrollContent: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  planCardWrapper: {
    width: PLAN_CARD_WIDTH,
    paddingHorizontal: 6,
  },
  firstCard: {
    paddingLeft: 16,
  },
  lastCard: {
    paddingRight: 16,
  },
});

export default LanguageGroupCard;
