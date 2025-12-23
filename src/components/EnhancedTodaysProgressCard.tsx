/**
 * Enhanced Today's Progress Card
 *
 * Connected to the new gamification stats API
 * Features:
 * - Real-time daily statistics
 * - Expandable breakdowns (language, type, level)
 * - Streak tracking with milestones
 * - Beautiful animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDailyStats } from '../hooks/useStats';
import type { DailyStatsBreakdown } from '../types/stats';

const { width } = Dimensions.get('window');

interface EnhancedTodaysProgressCardProps {
  onRefresh?: () => void;
}

export default function EnhancedTodaysProgressCard({ onRefresh }: EnhancedTodaysProgressCardProps) {
  const { daily, isLoading, error, refetchDaily } = useDailyStats(true);

  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<'language' | 'type' | 'level' | null>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const expansionAnims = useRef({
    language: new Animated.Value(0),
    type: new Animated.Value(0),
    level: new Animated.Value(0),
  }).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (daily) {
      // Animate progress bar
      Animated.timing(progressBarAnim, {
        toValue: daily.overall.accuracy / 100,
        duration: 800,
        delay: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [daily?.overall.accuracy]);

  // Handle section expansion
  const toggleSection = (section: 'language' | 'type' | 'level') => {
    const isExpanding = expandedSection !== section;
    const newExpandedSection = isExpanding ? section : null;

    // Animate all sections
    Object.keys(expansionAnims).forEach((key) => {
      Animated.spring(expansionAnims[key as keyof typeof expansionAnims], {
        toValue: key === section && isExpanding ? 1 : 0,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }).start();
    });

    setExpandedSection(newExpandedSection);
  };

  // Format accuracy with color coding
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 85) return '#10B981'; // Green - Excellent
    if (accuracy >= 70) return '#F59E0B'; // Amber - Good
    return '#EF4444'; // Red - Needs improvement
  };

  // Format streak emoji
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥'; // Legendary
    if (streak >= 14) return '🔥🔥'; // Hot
    if (streak >= 7) return '🔥'; // On fire
    if (streak >= 3) return '⭐'; // Getting there
    return '✨'; // Starting out
  };

  // Handle retry
  const handleRetry = () => {
    refetchDaily(true);
    onRefresh?.();
  };

  // Loading state
  if (isLoading && !daily) {
    return (
      <View style={styles.container}>
        <View style={styles.whiteCard}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECFBF" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Error state (but show empty state for "not found" errors)
  if (error && !daily) {
    // Check if it's a "not found" error (new user with no stats)
    const isNotFoundError =
      error.message.includes('not found') ||
      error.message.includes('404') ||
      error.message.includes('Statistics not found');

    if (isNotFoundError) {
      // Show empty state for new users
      return (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#DBEAFE', '#BFDBFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyTitle}>Ready to Start?</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first challenge to start tracking your progress!
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      );
    }

    // Show error state for actual errors
    return (
      <View style={styles.container}>
        <View style={styles.whiteCard}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Could not load stats</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // No data state
  if (!daily) {
    return null;
  }

  // Empty state (no activity today)
  if (daily.overall.total_challenges === 0) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#DBEAFE', '#BFDBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>Ready to Start?</Text>
            <Text style={styles.emptySubtitle}>
              Complete challenges to see your progress here!
            </Text>
            {daily.streak.current > 0 && (
              <Text style={styles.emptyStreakInfo}>
                Keep your {daily.streak.current}-day streak alive! 🔥
              </Text>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  const accuracyColor = getAccuracyColor(daily.overall.accuracy);
  const streakEmoji = getStreakEmoji(daily.streak.current);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.whiteCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 Today's Progress</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Challenges Completed */}
          <View style={[styles.statBox, { backgroundColor: '#F0FFFE', borderColor: '#4ECFBF' }]}>
            <Text style={[styles.statValue, { color: '#4ECFBF' }]}>
              {daily.overall.total_challenges}
            </Text>
            <Text style={[styles.statLabel, { color: '#2C9B8B' }]}>Completed</Text>
          </View>

          {/* Accuracy */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor:
                  accuracyColor === '#10B981'
                    ? '#F0FDF4'
                    : accuracyColor === '#F59E0B'
                    ? '#FFF9F0'
                    : '#FFF5F5',
                borderColor: accuracyColor,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: accuracyColor }]}>
              {Math.round(daily.overall.accuracy)}%
            </Text>
            <Text style={[styles.statLabel, { color: accuracyColor }]}>Accuracy</Text>
          </View>

          {/* Streak */}
          <View style={[styles.statBox, { backgroundColor: '#FFF9F0', borderColor: '#FFA955' }]}>
            <Text style={[styles.statValue, { color: '#FFA955' }]}>
              {streakEmoji} {daily.streak.current}
            </Text>
            <Text style={[styles.statLabel, { color: '#E08B3D' }]}>Day Streak</Text>
          </View>
        </View>

        {/* Accuracy Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: accuracyColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>
            {daily.overall.correct} correct • {daily.overall.incorrect} incorrect
          </Text>
        </View>

        {/* Expandable Breakdowns */}
        {Object.keys(daily.by_language).length > 0 && (
          <ExpandableSection
            title="By Language"
            icon="🌍"
            items={daily.by_language}
            expanded={expandedSection === 'language'}
            onToggle={() => toggleSection('language')}
            animValue={expansionAnims.language}
          />
        )}

        {Object.keys(daily.by_type).length > 0 && (
          <ExpandableSection
            title="By Challenge Type"
            icon="🎯"
            items={daily.by_type}
            expanded={expandedSection === 'type'}
            onToggle={() => toggleSection('type')}
            animValue={expansionAnims.type}
            formatKey={formatChallengeType}
          />
        )}

        {Object.keys(daily.by_level).length > 0 && (
          <ExpandableSection
            title="By CEFR Level"
            icon="📊"
            items={daily.by_level}
            expanded={expandedSection === 'level'}
            onToggle={() => toggleSection('level')}
            animValue={expansionAnims.level}
          />
        )}

        {/* Streak Milestone */}
        {daily.streak.next_milestone && (
          <View style={styles.milestoneContainer}>
            <Text style={styles.milestoneText}>
              🎯 {daily.streak.next_milestone - daily.streak.current} days until {daily.streak.next_milestone}-day milestone!
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// Expandable Section Component
interface ExpandableSectionProps {
  title: string;
  icon: string;
  items: Record<string, DailyStatsBreakdown>;
  expanded: boolean;
  onToggle: () => void;
  animValue: Animated.Value;
  formatKey?: (key: string) => string;
}

function ExpandableSection({
  title,
  icon,
  items,
  expanded,
  onToggle,
  animValue,
  formatKey = (k) => k.charAt(0).toUpperCase() + k.slice(1),
}: ExpandableSectionProps) {
  const maxHeight = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 85) return '#10B981';
    if (accuracy >= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.expandableSection}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionIcon}>{icon}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionChevron}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.sectionContent, { maxHeight, overflow: 'hidden' }]}>
        {Object.entries(items)
          .filter(([key]) => key !== 'unknown') // Filter out "unknown" entries
          .map(([key, data]) => {
          // Safety check: ensure data object exists and has required fields
          if (!data || typeof data !== 'object') {
            return null;
          }

          const accuracy = data.accuracy ?? 0;
          const correct = data.correct ?? 0;
          const challenges = data.challenges ?? 0;
          const xp = data.xp ?? 0;
          const accuracyColor = getAccuracyColor(accuracy);

          return (
            <View key={key} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <Text style={styles.breakdownKey}>{formatKey(key)}</Text>
                <Text style={styles.breakdownDetail}>
                  {correct}/{challenges} correct
                </Text>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownAccuracy, { color: accuracyColor }]}>
                  {Math.round(accuracy)}%
                </Text>
                <View style={styles.breakdownXP}>
                  <Text style={styles.breakdownXPText}>{xp} XP</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

// Helper function to format challenge type names
function formatChallengeType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 20,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginHorizontal: 3,
    borderWidth: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBarContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  expandableSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sectionChevron: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionContent: {
    overflow: 'hidden',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginTop: 8,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownKey: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  breakdownDetail: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownAccuracy: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  breakdownXP: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  breakdownXPText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  milestoneContainer: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4ECFBF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyStreakInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
