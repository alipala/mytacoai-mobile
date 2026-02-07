import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface FilterChipsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

// Learning plan status values: "in_progress", "awaiting_final_assessment", "completed", "failed_assessment"
// "new" = in_progress + completed_sessions == 0
const FILTERS = ['all', 'new', 'in_progress', 'completed'];

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedFilter,
  onFilterChange,
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
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
});
