/**
 * DNA Card Component
 * ==================
 * Rich card displaying Speaking DNA insights.
 * Embedded within coach chat - NO redirections.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DNACardProps {
  data: {
    confidence: number;
    fluency: number;
    vocabulary: number;
    accuracy: number;
    strongest_strand: string;
    weakest_strand: string;
    has_evolution: boolean;
  };
}

export const DNACard: React.FC<DNACardProps> = ({ data }) => {
  const {
    confidence,
    fluency,
    vocabulary,
    accuracy,
    strongest_strand,
    weakest_strand,
  } = data;

  // Get strand icon
  const getStrandIcon = (strand: string): any => {
    const icons: { [key: string]: any } = {
      confidence: 'mic',
      rhythm: 'pulse',
      vocabulary: 'book',
      accuracy: 'checkmark-circle',
      learning: 'school',
      emotional: 'heart',
    };
    return icons[strand] || 'star';
  };

  // Get strand color
  const getStrandColor = (strand: string): string => {
    const colors: { [key: string]: string } = {
      confidence: '#FF6B6B',
      rhythm: '#4ECDC4',
      vocabulary: '#FFD93D',
      accuracy: '#6BCB77',
      learning: '#9D84B7',
      emotional: '#E84A5F',
    };
    return colors[strand] || '#14B8A6';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.gradient}
      >
        <Text style={styles.title}>Your Speaking DNA 🧬</Text>

        {/* Key Stats */}
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{confidence}</Text>
            <Text style={styles.miniStatLabel}>Confidence</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{fluency}</Text>
            <Text style={styles.miniStatLabel}>Fluency</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{vocabulary}</Text>
            <Text style={styles.miniStatLabel}>Vocabulary</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{accuracy}</Text>
            <Text style={styles.miniStatLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          {/* Strongest */}
          <View style={styles.insightRow}>
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: getStrandColor(strongest_strand) + '33' },
              ]}
            >
              <Ionicons
                name={getStrandIcon(strongest_strand)}
                size={20}
                color={getStrandColor(strongest_strand)}
              />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightLabel}>Strongest</Text>
              <Text style={styles.insightValue}>
                {strongest_strand.charAt(0).toUpperCase() + strongest_strand.slice(1)}
              </Text>
            </View>
          </View>

          {/* Growth Area */}
          <View style={styles.insightRow}>
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: getStrandColor(weakest_strand) + '33' },
              ]}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color={getStrandColor(weakest_strand)}
              />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightLabel}>Growth Area</Text>
              <Text style={styles.insightValue}>
                {weakest_strand.charAt(0).toUpperCase() + weakest_strand.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E0E7FF',
    marginTop: 2,
  },
  insightsContainer: {
    gap: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightText: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default DNACard;
