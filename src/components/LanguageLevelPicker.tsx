import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Language, CEFRLevel } from '../services/mockChallengeData';

interface LanguageLevelPickerProps {
  selectedLanguage: Language;
  selectedLevel: CEFRLevel;
  onLanguageChange: (language: Language) => void;
  onLevelChange: (level: CEFRLevel) => void;
  availableLanguages?: Array<{
    language: Language;
    available_challenges: number;
  }>;
  showCounts?: boolean;
}

const LANGUAGE_OPTIONS: Array<{ code: Language; name: string; flag: string }> = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'dutch', name: 'Dutch', flag: '🇳🇱' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
];

const LEVEL_OPTIONS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const LanguageLevelPicker: React.FC<LanguageLevelPickerProps> = ({
  selectedLanguage,
  selectedLevel,
  onLanguageChange,
  onLevelChange,
  availableLanguages,
  showCounts = false,
}) => {
  const { t } = useTranslation();

  const getLanguageAvailability = (languageCode: Language): number | undefined => {
    if (!availableLanguages) return undefined;
    const lang = availableLanguages.find((l) => l.language === languageCode);
    return lang?.available_challenges;
  };

  return (
    <View style={styles.container}>
      {/* Language Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Choose Language</Text>
        <View style={styles.optionsGrid}>
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            const availableCount = getLanguageAvailability(lang.code);
            const isAvailable = !availableLanguages || (availableCount !== undefined && availableCount > 0);

            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  !isAvailable && styles.optionDisabled,
                ]}
                onPress={() => isAvailable && onLanguageChange(lang.code)}
                disabled={!isAvailable}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    !isAvailable && styles.optionTextDisabled,
                  ]}
                >
                  {lang.name}
                </Text>
                {showCounts && availableCount !== undefined && (
                  <Text style={styles.countText}>
                    {availableCount} challenges
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Level Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Choose Level (CEFR)</Text>
        <View style={styles.levelGrid}>
          {LEVEL_OPTIONS.map((level) => {
            const isSelected = selectedLevel === level;

            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelOption,
                  isSelected && styles.levelOptionSelected,
                ]}
                onPress={() => onLevelChange(level)}
              >
                <Text
                  style={[
                    styles.levelText,
                    isSelected && styles.levelTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.levelDescription}>
          {getLevelDescription(selectedLevel, t)}
        </Text>
      </View>
    </View>
  );
};

function getLevelDescription(level: CEFRLevel, t: (key: string) => string): string {
  const levelKey = level.toLowerCase();
  return t(`levels.${levelKey}_picker_desc`);
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: '48%',
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: '#4ECFBF',
    backgroundColor: '#F0FDFA',
  },
  optionDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0F766E',
    fontWeight: '600',
  },
  optionTextDisabled: {
    color: '#9CA3AF',
  },
  countText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    alignItems: 'center',
  },
  levelOptionSelected: {
    borderColor: '#4ECFBF',
    backgroundColor: '#F0FDFA',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  levelTextSelected: {
    color: '#0F766E',
  },
  levelDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
