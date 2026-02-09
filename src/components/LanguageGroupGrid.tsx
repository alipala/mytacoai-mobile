/**
 * Language Group Grid - Minimal header + 2-column grid of learning plans
 * =======================================================================
 *
 * Design:
 * - Small language header row (flag + name + count + DNA button)
 * - 2-column grid of plan cards directly below
 * - NO big wrapper card - keep it minimal
 * - DNA Analysis is per LANGUAGE (not per plan)
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
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';
import { LearningPlanGridCard } from './LearningPlanGridCard';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (CONTAINER_PADDING * 2) - CARD_GAP) / 2;

interface LanguageGroupGridProps {
  language: string;
  plans: LearningPlan[];
  onPlanPress: (plan: LearningPlan) => void;
  onContinue: (planId: string) => void;
  onViewDNA: (language: string) => void;
  hasDNAAnalysis?: boolean;
  isPremium?: boolean;
}

// Helper Functions
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

const getLanguageName = (language: string): string => {
  const languageMap: Record<string, string> = {
    dutch: 'Dutch',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    german: 'German',
    portuguese: 'Portuguese',
    turkish: 'Turkish',
  };
  return languageMap[language.toLowerCase()] ||
    language.charAt(0).toUpperCase() + language.slice(1);
};

export const LanguageGroupGrid: React.FC<LanguageGroupGridProps> = ({
  language,
  plans,
  onPlanPress,
  onContinue,
  onViewDNA,
  hasDNAAnalysis = false,
  isPremium = false,
}) => {
  const { t } = useTranslation();
  const languageName = getLanguageName(language);
  const FlagComponent = getLanguageFlagComponent(language);

  const handleDNAPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onViewDNA(language);
  };

  return (
    <View style={styles.container}>
      {/* Language Header - Minimal */}
      <View style={styles.header}>
        {/* Left: Flag + Language Name */}
        <View style={styles.headerLeft}>
          {FlagComponent && (
            <View style={styles.flagContainer}>
              <FlagComponent width={28} height={28} />
            </View>
          )}
          <Text style={styles.languageName}>{languageName}</Text>
          <Text style={styles.planCount}>
            ({plans.length})
          </Text>
        </View>

        {/* Right: DNA Analysis Button */}
        {hasDNAAnalysis && isPremium && (
          <TouchableOpacity
            style={styles.dnaButton}
            onPress={handleDNAPress}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics" size={16} color="#14B8A6" />
            <Text style={styles.dnaButtonText}>{t('learning_plan.dna_analysis')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Plans Grid - 2 columns */}
      <View style={styles.plansGrid}>
        {plans.map((plan, index) => {
          const isLeftColumn = index % 2 === 0;

          return (
            <View
              key={plan.id || index}
              style={[
                styles.gridItem,
                isLeftColumn && styles.gridItemLeft,
                !isLeftColumn && styles.gridItemRight,
              ]}
            >
              <LearningPlanGridCard
                plan={plan}
                onPress={() => onPlanPress(plan)}
                onContinue={() => onPlanPress(plan)}
                hasDNAAnalysis={false}
                isPremium={isPremium}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: CONTAINER_PADDING,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  flagContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  languageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planCount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dnaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  dnaButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14B8A6',
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: CARD_GAP,
  },
  gridItem: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
  },
  gridItemLeft: {
    marginRight: CARD_GAP / 2,
  },
  gridItemRight: {
    marginLeft: CARD_GAP / 2,
  },
});

export default LanguageGroupGrid;
