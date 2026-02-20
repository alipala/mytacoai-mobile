/**
 * Progress Page Component
 * =======================
 *
 * New page 4 for horizontal DNA screen showing:
 * - Evolution timeline with weekly snapshots
 * - Initial vs Current comparison
 * - Progress metrics
 * - Trend indicators
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { speakingDNAService } from '../../../services/SpeakingDNAService';
import { SpeakingDNAProfile, DNAHistorySnapshot, DNAStrandKey } from '../../../types/speakingDNA';
import { DNA_COLORS, getStrandScore } from '../constants.OLD';
import { EvolutionTimeline } from './EvolutionTimeline';
import { ComparisonCard } from './ComparisonCard';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface ProgressPageProps {
  profile: SpeakingDNAProfile;
  language: string;
}

// ============================================================================
// PROGRESS PAGE COMPONENT
// ============================================================================

export const ProgressPage: React.FC<ProgressPageProps> = ({ profile, language }) => {
  const [evolution, setEvolution] = useState<DNAHistorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  /**
   * Load evolution data
   */
  useEffect(() => {
    async function fetchEvolution() {
      try {
        setLoading(true);
        // Fetch last 12 weeks of evolution
        const data = await speakingDNAService.getEvolution(language, 12);
        setEvolution(data);
      } catch (error) {
        console.error('[ProgressPage] Error fetching evolution:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvolution();
  }, [language]);

  /**
   * Prepare timeline data from evolution snapshots
   */
  const timelineWeeks = evolution.map((snapshot, index) => ({
    weekNumber: snapshot.week_number,
    weekStart: new Date(snapshot.week_start),
    sessions: snapshot.week_stats?.sessions_completed || 0,
    minutes: Math.round(snapshot.week_stats?.total_minutes || 0),
    strands: snapshot.strand_snapshots,
    isCurrent: index === evolution.length - 1, // Last week is current
  }));

  /**
   * Get initial (first) snapshot
   */
  const initialSnapshot = evolution.length > 0 ? evolution[0] : null;

  /**
   * Get current (latest) snapshot
   */
  const currentSnapshot = evolution.length > 0 ? evolution[evolution.length - 1] : null;

  /**
   * Handle week selection from timeline
   */
  const handleWeekPress = (week: any) => {
    setSelectedWeek(week.weekNumber);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <View style={styles.page}>
        <LinearGradient colors={['#0B1A1F', '#0D2832']} style={styles.background} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </View>
    );
  }

  if (evolution.length === 0) {
    return (
      <View style={styles.page}>
        <LinearGradient colors={['#0B1A1F', '#0D2832']} style={styles.background} />
        <View style={styles.centerContent}>
          <Ionicons name="bar-chart-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete more sessions to see your DNA evolution over time!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Dark gradient background matching other pages */}
      <LinearGradient colors={['#0B1A1F', '#0D2832']} style={styles.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.header}>
          <Ionicons name="trending-up" size={28} color="#14B8A6" />
          <Text style={styles.headerTitle}>Progress & Growth</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Track your DNA evolution from Week 1 to now
        </Text>

        {/* Initial vs Current Comparison - Always visible */}
        {initialSnapshot && currentSnapshot && (
          <ComparisonCard
            initialSnapshot={initialSnapshot}
            currentSnapshot={currentSnapshot}
            profile={profile}
          />
        )}

        {/* Progress Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Learning Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.sessions_analyzed}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(profile.total_speaking_minutes)}</Text>
              <Text style={styles.statLabel}>Speaking Minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{evolution.length}</Text>
              <Text style={styles.statLabel}>Weeks Tracked</Text>
            </View>
          </View>
        </View>

        {/* DNA Evolution Timeline */}
        {timelineWeeks.length > 1 && (
          <View style={styles.evolutionSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="git-network-outline" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>DNA Evolution</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Swipe through your weekly DNA snapshots
            </Text>
            <EvolutionTimeline weeks={timelineWeeks} onWeekPress={handleWeekPress} />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    marginLeft: 40,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14B8A6',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  evolutionSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
    marginLeft: 32,
  },
});

export default ProgressPage;
