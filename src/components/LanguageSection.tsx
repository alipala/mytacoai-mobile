import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';
import { SpotifyStylePlanCard } from './SpotifyStylePlanCard';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

interface LanguageSectionProps {
  language: string;
  plans: LearningPlan[];
  onPlanPress: (plan: LearningPlan) => void;
  onViewDNA?: (language: string) => void;
  hasDNAAnalysis?: boolean;
  isPremium?: boolean;
}

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

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  language,
  plans,
  onPlanPress,
  onViewDNA,
  hasDNAAnalysis = false,
  isPremium = false,
}) => {
  const { t } = useTranslation();
  const languageName = getLanguageName(language);
  const FlagComponent = getLanguageFlagComponent(language);

  const handleDNAPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDNA?.(language);
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {FlagComponent && (
            <View style={styles.flagContainer}>
              <FlagComponent width={32} height={32} />
            </View>
          )}
          <Text style={styles.languageName}>{languageName}</Text>
        </View>

        {/* DNA Analysis Button */}
        {hasDNAAnalysis && isPremium && onViewDNA && (
          <TouchableOpacity
            style={styles.dnaButton}
            onPress={handleDNAPress}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics" size={16} color="#14B8A6" />
            <Text style={styles.dnaButtonText}>DNA</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scrolling Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.cardsContainer,
          plans.length <= 2 && styles.cardsContainerCentered,
        ]}
        style={styles.cardsScrollView}
      >
        {plans.map((plan) => (
          <SpotifyStylePlanCard
            key={plan.id}
            plan={plan}
            onPress={onPlanPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  flagContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  dnaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  dnaButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14B8A6',
  },
  cardsScrollView: {
    flexGrow: 0,
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  cardsContainerCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
