/**
 * Growth Tab Component
 *
 * Shows strengths and growth areas
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../../constants.OLD';
import { SpeakingDNAProfile } from '../../../../types/speakingDNA';

interface GrowthTabProps {
  profile: SpeakingDNAProfile;
}

// Format snake_case to Title Case
const formatText = (text: string): string => {
  if (text.includes('_') || /[a-z][A-Z]/.test(text)) {
    return text
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
  return text;
};

export const GrowthTab: React.FC<GrowthTabProps> = ({ profile }) => {
  const { strengths, growth_areas } = profile.overall_profile;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Strengths Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Strengths</Text>
        </View>

        {strengths.map((strength, index) => (
          <View key={index} style={styles.card}>
            <Ionicons name="checkmark" size={20} color="#10B981" />
            <Text style={styles.cardText}>{formatText(strength)}</Text>
          </View>
        ))}
      </View>

      {/* Growth Areas Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="arrow-up-circle" size={24} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Growth Areas</Text>
        </View>

        {growth_areas.map((area, index) => (
          <View key={index} style={styles.card}>
            <Ionicons name="arrow-up" size={20} color="#F59E0B" />
            <Text style={styles.cardText}>{formatText(area)}</Text>
          </View>
        ))}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: THEME_COLORS.text.primary,
  },
});
