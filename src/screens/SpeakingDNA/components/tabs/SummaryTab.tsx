/**
 * Summary Tab Component
 *
 * Shows animated progress rings for all 6 DNA strands
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { THEME_COLORS, DNA_STRAND_LABELS, getStrandScore } from '../../constants.OLD';
import { SpeakingDNAProfile, DNAStrandKey } from '../../../../types/speakingDNA';
import { DNAProgressRing } from '../DNAProgressRing';

interface SummaryTabProps {
  profile: SpeakingDNAProfile;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ profile }) => {
  const strands = Object.keys(DNA_STRAND_LABELS) as DNAStrandKey[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {strands.map((strand, index) => {
          const strandData = profile.dna_strands[strand];
          const value = getStrandScore(strandData);

          return (
            <View key={strand} style={styles.gridItem}>
              <DNAProgressRing
                strand={strand}
                value={value}
                size={100}
                delay={index * 100}
              />
            </View>
          );
        })}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridItem: {
    width: '45%',
    marginBottom: 16,
  },
});
