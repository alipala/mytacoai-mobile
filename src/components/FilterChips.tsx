import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LanguageFilterSelector } from './LanguageFilterSelector';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

interface FilterChipsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedLanguage?: string | null;
  onLanguageChange?: (language: string | null) => void;
  availableLanguages?: string[];
  showLanguageSelector?: boolean;
}

// Learning plan status values: "in_progress", "awaiting_final_assessment", "completed", "failed_assessment"
// "new" = in_progress + completed_sessions == 0
const FILTERS = ['all', 'new', 'in_progress', 'completed'];

const LANGUAGE_FLAGS: Record<string, React.FC<any>> = {
  'english': EnglishFlag,
  'spanish': SpanishFlag,
  'french': FrenchFlag,
  'german': GermanFlag,
  'dutch': DutchFlag,
  'portuguese': PortugueseFlag,
};

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedFilter,
  onFilterChange,
  selectedLanguage = null,
  onLanguageChange,
  availableLanguages = [],
  showLanguageSelector = true,
}) => {
  const { t } = useTranslation();

  const getFilterLabel = (filter: string) => {
    const labels: Record<string, string> = {
      all: t('learning_plan.filters.all'),
      new: t('learning_plan.filters.new'),
      in_progress: t('learning_plan.filters.in_progress'),
      completed: t('learning_plan.filters.completed'),
    };
    return labels[filter] || filter;
  };

  return (
    <View style={styles.container}>
      {/* Language Filter - Flag-sized dropdown */}
      {showLanguageSelector && onLanguageChange && (
        <LanguageFilterSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          availableLanguages={availableLanguages}
        />
      )}

      {/* Status Filters */}
      {FILTERS.map((filter) => {
        const isSelected = selectedFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
            ]}
            onPress={() => onFilterChange(filter)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
              ]}
            >
              {getFilterLabel(filter)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipSelected: {
    backgroundColor: '#10B981',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  languageChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  languageChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  flagIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
