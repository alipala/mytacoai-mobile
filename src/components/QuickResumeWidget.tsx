import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import type { LearningPlan } from '../api/generated';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

interface QuickResumeWidgetProps {
  plan: LearningPlan;
  onPress: () => void;
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

const GOAL_NAMES: Record<string, string> = {
  business: 'Business',
  travel: 'Travel',
  academic: 'Academic',
  daily: 'Daily',
  presentations: 'Presentations',
  interviews: 'Interviews',
};

export const QuickResumeWidget: React.FC<QuickResumeWidgetProps> = ({
  plan,
  onPress,
}) => {
  const { t } = useTranslation();
  const language = plan.language || 'english';
  const level = plan.proficiency_level || 'A1';
  const goals = plan.goals || [];
  const primaryGoal = goals[0] || 'daily';
  const goalName = GOAL_NAMES[primaryGoal] || primaryGoal;

  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = plan.progress_percentage || Math.round((completedSessions / totalSessions) * 100);

  const languageName = getLanguageName(language);
  const FlagComponent = getLanguageFlagComponent(language);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          {/* Left: Flag + Text */}
          <View style={styles.leftContent}>
            {FlagComponent && (
              <View style={styles.flagContainer}>
                <FlagComponent width={32} height={32} />
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>
                Continue: {languageName} {goalName} {level}
              </Text>
              <Text style={styles.subtitleText}>
                Session {completedSessions}/{totalSessions} • {percentage}% complete
              </Text>
            </View>
          </View>

          {/* Right: Play Button */}
          <View style={styles.playButton}>
            <Ionicons name="play" size={28} color="#14B8A6" />
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: '#0B1A1F',
    borderTopWidth: 2,
    borderTopColor: '#14B8A6',
  },
  card: {
    backgroundColor: '#14B8A6',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flagContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});
