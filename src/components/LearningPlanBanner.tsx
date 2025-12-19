import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Language, CEFRLevel } from '../services/mockChallengeData';

interface LearningPlanBannerProps {
  language: Language;
  level: CEFRLevel;
  onExploreOther: () => void;
  totalChallenges?: number;
  completedChallenges?: number;
}

const LANGUAGE_FLAGS: Record<Language, string> = {
  english: '🇬🇧',
  spanish: '🇪🇸',
  dutch: '🇳🇱',
  german: '🇩🇪',
  french: '🇫🇷',
  portuguese: '🇵🇹',
};

const LANGUAGE_NAMES: Record<Language, string> = {
  english: 'English',
  spanish: 'Spanish',
  dutch: 'Dutch',
  german: 'German',
  french: 'French',
  portuguese: 'Portuguese',
};

export const LearningPlanBanner: React.FC<LearningPlanBannerProps> = ({
  language,
  level,
  onExploreOther,
  totalChallenges = 0,
  completedChallenges = 0,
}) => {
  const progress = totalChallenges > 0
    ? Math.round((completedChallenges / totalChallenges) * 100)
    : 0;

  const flag = LANGUAGE_FLAGS[language] || '🌍';
  const languageName = LANGUAGE_NAMES[language] || language;

  return (
    <View style={styles.container}>
      {/* Header Row with Progress */}
      <View style={styles.headerRow}>
        <Text style={styles.label}>📚 Your Learning Plan</Text>
        {progress > 0 && (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}
      </View>

      {/* Language and Level Display */}
      <View style={styles.languageRow}>
        <Text style={styles.flag}>{flag}</Text>
        <View style={styles.languageInfo}>
          <Text style={styles.languageName}>{languageName}</Text>
          <Text style={styles.level}>Level {level}</Text>
        </View>
      </View>

      {/* Progress Bar (if there's progress) */}
      {totalChallenges > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressStats}>
            {completedChallenges} / {totalChallenges} challenges completed
          </Text>
        </View>
      )}

      {/* Explore Other Languages Button */}
      <TouchableOpacity
        onPress={onExploreOther}
        style={styles.exploreButton}
        activeOpacity={0.7}
      >
        <Text style={styles.exploreButtonIcon}>🌍</Text>
        <Text style={styles.exploreButtonText}>Try Another Language?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#4ECFBF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECFBF',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flag: {
    fontSize: 36,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  level: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECFBF',
    borderRadius: 4,
  },
  progressStats: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  exploreButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
});
