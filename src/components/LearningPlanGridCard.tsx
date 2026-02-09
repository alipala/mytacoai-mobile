/**
 * Learning Plan Grid Card - Compact 2-Column Layout
 * =================================================
 *
 * Design Goals:
 * - Fits in 2-column grid
 * - Vibrant gradient background (FULLY OPAQUE)
 * - Shows essential info: Flag, Language, Level, Progress
 * - Tap card to open details
 * - Continue button for quick access
 * - DNA Analysis button if available
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
import { Typography } from '../constants/typography';
import { getLanguageGradient } from '../utils/gradientHelpers';
import Svg, { Circle } from 'react-native-svg';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_PADDING * 2) - CARD_GAP) / 2;

interface LearningPlanGridCardProps {
  plan: any;
  onPress: () => void;
  onContinue: () => void;
  onViewDNA?: () => void;
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

const getLevelColor = (level: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'A1': { bg: 'rgba(220, 38, 38, 0.9)', text: '#FFFFFF' },
    'A2': { bg: 'rgba(234, 88, 12, 0.9)', text: '#FFFFFF' },
    'B1': { bg: 'rgba(128, 90, 213, 0.9)', text: '#FFFFFF' },
    'B2': { bg: 'rgba(37, 99, 235, 0.9)', text: '#FFFFFF' },
    'C1': { bg: 'rgba(5, 150, 105, 0.9)', text: '#FFFFFF' },
    'C2': { bg: 'rgba(217, 119, 6, 0.9)', text: '#FFFFFF' }
  };
  return colors[level.toUpperCase()] || { bg: 'rgba(8, 145, 178, 0.9)', text: '#FFFFFF' };
};

export const LearningPlanGridCard: React.FC<LearningPlanGridCardProps> = ({
  plan,
  onPress,
  onContinue,
  onViewDNA,
  hasDNAAnalysis = false,
  isPremium = false,
}) => {
  const { t } = useTranslation();
  const language = plan.language || plan.target_language || 'English';
  const level = plan.proficiency_level || plan.target_cefr_level || 'B1';
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = Math.round((completedSessions / totalSessions) * 100);

  const FlagComponent = getLanguageFlagComponent(language);
  const levelColors = getLevelColor(level);
  const gradientColors = getLanguageGradient(language);

  const handleContinue = (e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onContinue();
  };

  const handleDNA = (e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDNA?.();
  };

  const handleCardPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* DNA Button - Top Right Corner */}
        {hasDNAAnalysis && isPremium && (
          <TouchableOpacity
            style={styles.dnaButton}
            onPress={handleDNA}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Header: Flag + Language */}
        <View style={styles.header}>
          {FlagComponent && (
            <View style={styles.flagContainer}>
              <FlagComponent width={36} height={36} />
            </View>
          )}
          <Text style={styles.languageName} numberOfLines={1}>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </Text>
        </View>

        {/* Level Badge */}
        <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
          <Text style={[styles.levelText, { color: levelColors.text }]}>
            {level.toUpperCase()}
          </Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Svg width={60} height={60}>
            <Circle
              cx={30}
              cy={30}
              r={25}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={5}
              fill="none"
            />
            <Circle
              cx={30}
              cy={30}
              r={25}
              stroke="#FFFFFF"
              strokeWidth={5}
              fill="none"
              strokeDasharray={`${2 * Math.PI * 25}`}
              strokeDashoffset={`${2 * Math.PI * 25 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressPercentage}>{percentage}%</Text>
          </View>
        </View>

        {/* Session Count */}
        <Text style={styles.sessionCount}>
          {completedSessions}/{totalSessions} {t('learning_plan.details.sessions')}
        </Text>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.continueText}>{t('learning_plan.continue')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
  },
  gradientCard: {
    borderRadius: 14,
    padding: 10,
    paddingTop: 8,
    minHeight: 165,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  dnaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  flagContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 17,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '700',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sessionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.9,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  continueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default LearningPlanGridCard;
