/**
 * History Tab Component
 *
 * Shows trends for each DNA strand
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS, DNA_COLORS, DNA_STRAND_LABELS, getStrandScore } from '../../constants';
import { SpeakingDNAProfile, DNAStrandKey } from '../../../../types/speakingDNA';

interface HistoryTabProps {
  profile: SpeakingDNAProfile;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ profile }) => {
  const strands = Object.keys(DNA_STRAND_LABELS) as DNAStrandKey[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>DNA Evolution</Text>
      <Text style={styles.subtitle}>Track your progress over time</Text>

      {strands.map((strand) => {
        const strandData = profile.dna_strands[strand];
        const value = getStrandScore(strandData);
        const color = DNA_COLORS[strand];
        const label = DNA_STRAND_LABELS[strand];

        return (
          <View key={strand} style={styles.trendRow}>
            <View style={styles.trendHeader}>
              <Text style={[styles.trendLabel, { color }]}>{label}</Text>
              <Text style={styles.trendValue}>{value}%</Text>
            </View>

            {/* Simple progress bar as trend indicator */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={THEME_COLORS.primary} />
        <Text style={styles.infoText}>
          Complete more sessions to see detailed trend analysis with sparklines!
        </Text>
      </View>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME_COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME_COLORS.text.secondary,
    marginBottom: 24,
  },
  trendRow: {
    marginBottom: 20,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${THEME_COLORS.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: THEME_COLORS.text.secondary,
    lineHeight: 20,
  },
});
