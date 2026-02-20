/**
 * Comparison Card Component
 * ==========================
 *
 * Shows "Initial Assessment vs Current State" comparison
 * Highlights user's progress journey over time
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { SpeakingDNAProfile, DNAHistorySnapshot, DNAStrandKey } from '../../../types/speakingDNA';
import { DNA_COLORS, getStrandScore } from '../constants.OLD';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface ComparisonCardProps {
  initialSnapshot: DNAHistorySnapshot;
  currentSnapshot: DNAHistorySnapshot;
  profile: SpeakingDNAProfile;
}

// ============================================================================
// COMPARISON CARD COMPONENT
// ============================================================================

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  initialSnapshot,
  currentSnapshot,
  profile,
}) => {
  const strands: DNAStrandKey[] = ['confidence', 'vocabulary', 'accuracy', 'rhythm'];

  // Calculate overall improvement
  const improvements = strands.map((strand) => {
    const initial = getStrandScore(initialSnapshot.strand_snapshots[strand]);
    const current = getStrandScore(currentSnapshot.strand_snapshots[strand]);
    return current - initial;
  });

  const totalImprovement = improvements.reduce((sum, delta) => sum + delta, 0);
  const averageImprovement = totalImprovement / strands.length;
  const strandImprovementCount = improvements.filter(delta => delta > 0).length;

  // Calculate time elapsed
  const weeksDifference = currentSnapshot.week_number - initialSnapshot.week_number;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(20, 184, 166, 0.15)', 'rgba(20, 184, 166, 0.05)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="trending-up" size={24} color="#14B8A6" />
            <View>
              <Text style={styles.headerTitle}>Your Progress Journey</Text>
              <Text style={styles.headerSubtitle}>
                {format(new Date(initialSnapshot.week_start), 'MMM d')} → {format(new Date(currentSnapshot.week_start), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Overall Stats */}
        <View style={styles.overallStats}>
          <View style={styles.overallStatItem}>
            <Text style={styles.overallStatValue}>{weeksDifference}</Text>
            <Text style={styles.overallStatLabel}>Weeks</Text>
          </View>
          <View style={styles.overallStatDivider} />
          <View style={styles.overallStatItem}>
            <Text style={[
              styles.overallStatValue,
              averageImprovement > 0 && styles.overallStatValuePositive,
              averageImprovement < 0 && styles.overallStatValueNegative,
            ]}>
              {averageImprovement > 0 ? '+' : ''}{averageImprovement.toFixed(1)}%
            </Text>
            <Text style={styles.overallStatLabel}>Avg Improvement</Text>
          </View>
          <View style={styles.overallStatDivider} />
          <View style={styles.overallStatItem}>
            <Text style={styles.overallStatValue}>{strandImprovementCount}/{strands.length}</Text>
            <Text style={styles.overallStatLabel}>Strands Up</Text>
          </View>
        </View>

        {/* Strand Comparisons */}
        <View style={styles.strandComparisons}>
          {strands.map((strand) => {
            const initialScore = getStrandScore(initialSnapshot.strand_snapshots[strand]);
            const currentScore = getStrandScore(currentSnapshot.strand_snapshots[strand]);
            const delta = currentScore - initialScore;
            const deltaPercentage = initialScore > 0 ? ((delta / initialScore) * 100) : 0;
            const color = DNA_COLORS[strand];

            return (
              <View key={strand} style={styles.strandComparison}>
                <View style={styles.strandComparisonHeader}>
                  <View style={[styles.strandColorDot, { backgroundColor: color }]} />
                  <Text style={styles.strandName}>
                    {strand.charAt(0).toUpperCase() + strand.slice(1)}
                  </Text>
                  {delta !== 0 && (
                    <View style={styles.deltaContainer}>
                      {delta > 0 && (
                        <Ionicons name="arrow-up" size={14} color="#10B981" />
                      )}
                      {delta < 0 && (
                        <Ionicons name="arrow-down" size={14} color="#EF4444" />
                      )}
                      <Text style={[
                        styles.deltaText,
                        delta > 0 && styles.deltaTextPositive,
                        delta < 0 && styles.deltaTextNegative,
                      ]}>
                        {delta > 0 ? '+' : ''}{delta}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* Progress visualization */}
                <View style={styles.progressComparison}>
                  {/* Initial score bar */}
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Week 1</Text>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            styles.progressBarInitial,
                            { width: `${Math.min(initialScore, 100)}%`, backgroundColor: color }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressScore}>{initialScore}%</Text>
                    </View>
                  </View>

                  {/* Current score bar */}
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Now</Text>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(currentScore, 100)}%`, backgroundColor: color }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressScore}>{currentScore}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Encouragement message */}
        {averageImprovement > 0 && (
          <View style={styles.encouragementBanner}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.encouragementText}>
              {averageImprovement >= 10
                ? "🎉 Amazing progress! You're improving rapidly!"
                : averageImprovement >= 5
                ? "✨ Great work! Keep up the momentum!"
                : "📈 Steady progress! Every session counts!"}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  cardGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  overallStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  overallStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overallStatValuePositive: {
    color: '#10B981',
  },
  overallStatValueNegative: {
    color: '#EF4444',
  },
  overallStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  overallStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  strandComparisons: {
    gap: 16,
  },
  strandComparison: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  strandComparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strandColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  strandName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deltaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deltaTextPositive: {
    color: '#10B981',
  },
  deltaTextNegative: {
    color: '#EF4444',
  },
  progressComparison: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 40,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressBarInitial: {
    opacity: 0.5,
  },
  progressScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  encouragementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  encouragementText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FCD34D',
    textAlign: 'center',
  },
});

export default ComparisonCard;
