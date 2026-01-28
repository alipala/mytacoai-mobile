/**
 * Breakthroughs Tab Component
 *
 * Shows milestone achievements
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME_COLORS, DNA_COLORS } from '../../constants';
import { SpeakingBreakthrough } from '../../../../types/speakingDNA';

interface BreakthroughsTabProps {
  breakthroughs: SpeakingBreakthrough[];
}

const getCategoryColor = (category: string): string[] => {
  const colors: Record<string, string[]> = {
    confidence: ['#9B59B6', '#8E44AD'],
    vocabulary: ['#2ECC71', '#27AE60'],
    learning: ['#3498DB', '#2980B9'],
    rhythm: ['#4ECDC4', '#45B7B0'],
    accuracy: ['#E67E22', '#D35400'],
    emotional: ['#E91E63', '#C2185B'],
  };
  return colors[category] || [THEME_COLORS.primary, THEME_COLORS.secondary];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export const BreakthroughsTab: React.FC<BreakthroughsTabProps> = ({ breakthroughs }) => {
  if (breakthroughs.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.emptyContent}>
        <Ionicons name="trophy" size={80} color={THEME_COLORS.text.light} />
        <Text style={styles.emptyTitle}>No Breakthroughs Yet</Text>
        <Text style={styles.emptyText}>
          Complete more sessions to unlock achievements and celebrate your progress!
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {breakthroughs.map((breakthrough) => {
        const colors = getCategoryColor(breakthrough.category);

        return (
          <View key={breakthrough.id} style={styles.card}>
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.icon}>🏆</Text>
              <Text style={styles.title}>{breakthrough.title}</Text>
              <Text style={styles.description}>{breakthrough.description}</Text>
              <Text style={styles.date}>{formatDate(breakthrough.achieved_at)}</Text>
            </LinearGradient>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: THEME_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});
