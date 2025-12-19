import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Language, CEFRLevel } from '../services/mockChallengeData';

interface CompactLanguageSelectorProps {
  selectedLanguage: Language;
  selectedLevel: CEFRLevel;
  onPress: () => void;
  hasLearningPlan?: boolean;
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

export const CompactLanguageSelector: React.FC<CompactLanguageSelectorProps> = ({
  selectedLanguage,
  selectedLevel,
  onPress,
  hasLearningPlan = false,
}) => {
  const flag = LANGUAGE_FLAGS[selectedLanguage] || '🌍';
  const languageName = LANGUAGE_NAMES[selectedLanguage] || selectedLanguage;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        hasLearningPlan && styles.containerWithPlan
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.flag}>{flag}</Text>
        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={styles.language}>{languageName}</Text>
            <Text style={styles.level}>{selectedLevel}</Text>
            {hasLearningPlan && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>My Plan</Text>
              </View>
            )}
          </View>
          <Text style={styles.hint}>Tap to change</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  containerWithPlan: {
    borderColor: '#4ECFBF',
    borderWidth: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  language: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  level: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
  },
  planBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4ECFBF',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F766E',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    fontWeight: '300',
  },
});
