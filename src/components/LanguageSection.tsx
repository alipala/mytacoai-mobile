import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, Easing } from 'react-native-reanimated';
import type { LearningPlan } from '../api/generated';
import { SpotifyStylePlanCard } from './SpotifyStylePlanCard';
import { DNAAnalysisCard } from './DNAAnalysisCard';

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
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  isExpanded,
  onToggleExpand,
}) => {
  const { t } = useTranslation();
  const languageName = getLanguageName(language);
  const FlagComponent = getLanguageFlagComponent(language);

  // Animation values
  const rotation = useSharedValue(isExpanded ? 90 : 0);
  const cardsOpacity = useSharedValue(isExpanded ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 90 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    cardsOpacity.value = withTiming(isExpanded ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [isExpanded]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  const handleDNAPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDNA?.(language);
  };

  const handleHeaderPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleExpand();
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header - Tappable to expand/collapse */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleHeaderPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {FlagComponent && (
              <View style={styles.flagContainer}>
                <FlagComponent width={32} height={32} />
              </View>
            )}
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{languageName}</Text>
              <Text style={styles.planCountText}>
                <Text style={styles.planCountNumber}>{plans.length}</Text>
                <Text style={styles.planCountRegular}>
                  {' '}{plans.length === 1 ? t('learning_plan.plan_available') : t('learning_plan.plans_available')}
                </Text>
                {hasDNAAnalysis && isPremium && (
                  <Text style={styles.dnaText}>
                    {t('learning_plan.and_dna_available')}
                  </Text>
                )}
              </Text>
            </View>
          </View>

          {/* Expand/Collapse Icon with animation */}
          <Animated.View style={chevronStyle}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#9CA3AF"
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Horizontal Scrolling Cards - Only show when expanded */}
      {isExpanded && (
        <Animated.View style={[styles.cardsWrapper, cardsStyle]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.cardsContainer,
              (plans.length + (hasDNAAnalysis && isPremium ? 1 : 0)) <= 2 && styles.cardsContainerCentered,
            ]}
            style={styles.cardsScrollView}
          >
            {/* DNA Analysis Card - Show first if available */}
            {hasDNAAnalysis && isPremium && onViewDNA && (
              <DNAAnalysisCard onPress={() => onViewDNA(language)} />
            )}

            {/* Learning Plan Cards */}
            {plans.map((plan) => (
              <SpotifyStylePlanCard
                key={plan.id}
                plan={plan}
                onPress={onPlanPress}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Separator */}
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  languageInfo: {
    flex: 1,
  },
  planCountText: {
    marginTop: 4,
    lineHeight: 18,
  },
  planCountNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.3,
  },
  planCountRegular: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  dnaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
    letterSpacing: -0.2,
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
  cardsWrapper: {
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
    marginTop: 16,
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
