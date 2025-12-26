/**
 * Lifetime Progress Card
 *
 * Displays all-time statistics and achievements
 * Features:
 * - Total challenges, XP, and time
 * - Longest streak record
 * - Language distribution
 * - Milestone progress
 * - Always visible (doesn't disappear)
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
import { Ionicons } from '@expo/vector-icons';
import { useLifetimeProgress } from '../hooks/useStats';

const { width } = Dimensions.get('window');

interface LifetimeProgressCardProps {
  onRefresh?: () => void;
}

export default function LifetimeProgressCard({ onRefresh }: LifetimeProgressCardProps) {
  const { lifetime, isLoading, error, refetchLifetime } = useLifetimeProgress(false, true);

  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<'languages' | 'types' | 'levels' | null>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const expansionAnims = useRef({
    languages: new Animated.Value(0),
    types: new Animated.Value(0),
    levels: new Animated.Value(0),
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
    if (lifetime) {
      // Animate progress bar for next milestone
      const nextMilestone = lifetime.milestones.next_milestone;
      if (nextMilestone) {
        Animated.timing(progressBarAnim, {
          toValue: nextMilestone.progress_percent / 100,
          duration: 800,
          delay: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [lifetime?.milestones.next_milestone]);

  // Handle section expansion
  const toggleSection = (section: 'languages' | 'types' | 'levels') => {
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

  // Handle retry
  const handleRetry = () => {
    refetchLifetime(true);
    onRefresh?.();
  };

  // Format duration
  const formatDuration = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 100) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours)}h`;
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get level badge
  const getLevelBadge = (challenges: number): { emoji: string; title: string } => {
    if (challenges >= 1000) return { emoji: '👑', title: 'Legend' };
    if (challenges >= 500) return { emoji: '🏆', title: 'Master' };
    if (challenges >= 250) return { emoji: '💎', title: 'Expert' };
    if (challenges >= 100) return { emoji: '⭐', title: 'Advanced' };
    if (challenges >= 50) return { emoji: '🌟', title: 'Intermediate' };
    return { emoji: '✨', title: 'Beginner' };
  };

  // Calculate overall accuracy from level mastery (weighted average)
  const calculateOverallAccuracy = (): number => {
    if (!lifetime?.level_mastery) return 0;

    const levels = Object.values(lifetime.level_mastery);
    if (levels.length === 0) return 0;

    let totalChallenges = 0;
    let weightedAccuracy = 0;

    levels.forEach(level => {
      totalChallenges += level.total_challenges;
      weightedAccuracy += level.accuracy * level.total_challenges;
    });

    return totalChallenges > 0 ? weightedAccuracy / totalChallenges : 0;
  };

  // Format milestone type for display
  const formatMilestoneType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'total_challenges': 'Challenges',
      'total_xp': 'XP',
      'total_sessions': 'Sessions',
      'total_time_hours': 'Hours',
      'longest_streak': 'Streak',
    };
    return typeMap[type] || type.replace(/_/g, ' ');
  };

  // Format challenge type names
  const formatChallengeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'micro_quiz': 'Micro Quiz',
      'brain_tickler': 'Brain Tickler',
      'smart_flashcard': 'Smart Flashcard',
      'swipe_fix': 'Swipe Fix',
      'error_spotting': 'Error Spotting',
      'native_check': 'Native Check',
    };
    return typeMap[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get mastery rank emoji
  const getMasteryEmoji = (rank: string): string => {
    const emojiMap: Record<string, string> = {
      'master': '👑',
      'expert': '💎',
      'advanced': '⭐',
      'intermediate': '🌟',
      'beginner': '✨',
      'novice': '🌱',
    };
    return emojiMap[rank] || '📊';
  };

  // Loading state
  if (isLoading && !lifetime) {
    return (
      <View style={styles.container}>
        <View style={styles.whiteCard}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F75A5A" />
            <Text style={styles.loadingText}>Loading lifetime progress...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !lifetime) {
    // Check if it's a "not found" error (new user with no stats)
    const isNotFoundError =
      error.message.includes('not found') ||
      error.message.includes('404') ||
      error.message.includes('Statistics not found');

    if (isNotFoundError) {
      // Don't show card for brand new users with no stats
      return null;
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
  if (!lifetime) {
    return null;
  }

  // No lifetime progress yet (brand new user)
  if (lifetime.summary.total_challenges === 0) {
    return null;
  }

  const levelBadge = getLevelBadge(lifetime.summary.total_challenges);

  // Prepare Languages data
  const languageEntries = Object.entries(lifetime.language_progress || {});
  const topLanguages = languageEntries
    .sort((a, b) => b[1].total_challenges - a[1].total_challenges)
    .slice(0, 3);

  // Prepare Challenge Types data
  const typeEntries = Object.entries(lifetime.challenge_type_mastery || {});
  const topTypes = typeEntries
    .sort((a, b) => b[1].total_challenges - a[1].total_challenges)
    .slice(0, 5);

  // Prepare CEFR Levels data
  const levelEntries = Object.entries(lifetime.level_mastery || {});
  const sortedLevels = levelEntries
    .sort((a, b) => {
      // Sort by CEFR level order: A1, A2, B1, B2, C1, C2
      const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      return levelOrder.indexOf(a[0]) - levelOrder.indexOf(b[0]);
    });

  const overallAccuracy = calculateOverallAccuracy();

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
          <View style={styles.headerLeft}>
            <Text style={styles.headerEmoji}>🏆</Text>
            <View>
              <Text style={styles.headerTitle}>Lifetime Progress</Text>
              <Text style={styles.headerSubtitle}>All-time achievements</Text>
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{levelBadge.emoji}</Text>
            <Text style={styles.levelText}>{levelBadge.title}</Text>
          </View>
        </View>

        {/* Main Stats Grid - 2x2 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Challenges - Turquoise */}
            <View style={[styles.statBox, { backgroundColor: '#F0FFFE', borderColor: '#4ECFBF' }]}>
              <Text style={[styles.statValue, { color: '#4ECFBF' }]}>{formatNumber(lifetime.summary.total_challenges)}</Text>
              <Text style={[styles.statLabel, { color: '#2C9B8B' }]}>Challenges</Text>
            </View>

            {/* Accuracy - Coral */}
            <View style={[styles.statBox, { backgroundColor: '#FFF5F5', borderColor: '#F75A5A' }]}>
              <Text style={[styles.statValue, { color: '#F75A5A' }]}>
                {Math.round(overallAccuracy)}%
              </Text>
              <Text style={[styles.statLabel, { color: '#E04545' }]}>Accuracy</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Total XP - Yellow */}
            <View style={[styles.statBox, { backgroundColor: '#FFFBF0', borderColor: '#FFD63A' }]}>
              <Text style={[styles.statValue, { color: '#E0B91A' }]}>{formatNumber(lifetime.summary.total_xp)}</Text>
              <Text style={[styles.statLabel, { color: '#C9A518' }]}>Total XP</Text>
            </View>

            {/* Best Streak - Orange */}
            <View style={[styles.statBox, { backgroundColor: '#FFF9F0', borderColor: '#FFA955' }]}>
              <View style={styles.streakContainer}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={[styles.statValue, { color: '#FFA955' }]}>{lifetime.summary.longest_streak}</Text>
              </View>
              <Text style={[styles.statLabel, { color: '#E08B3D' }]}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Languages Section */}
        {topLanguages.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => toggleSection('languages')}
              activeOpacity={0.7}
            >
              <View style={styles.expandableHeaderLeft}>
                <Ionicons name="language-outline" size={20} color="#F75A5A" />
                <Text style={styles.expandableTitle}>Languages ({languageEntries.length})</Text>
              </View>
              <Ionicons
                name={expandedSection === 'languages' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#F75A5A"
              />
            </TouchableOpacity>

            <Animated.View
              style={{
                maxHeight: expansionAnims.languages.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
                opacity: expansionAnims.languages,
                overflow: 'hidden',
              }}
            >
              <View style={styles.expandedContent}>
                {topLanguages.map(([lang, progress]) => (
                  <View key={lang} style={styles.languageItem}>
                    <View style={styles.languageHeader}>
                      <Text style={styles.languageName}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Text>
                      <Text style={styles.languageChallenges}>
                        {progress.total_challenges} challenges
                      </Text>
                    </View>
                    <View style={styles.languageDetails}>
                      <Text style={styles.languageDetail}>
                        Level: {progress.highest_level}
                      </Text>
                      <Text style={styles.languageDetail}>
                        {formatNumber(progress.total_xp)} XP
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}

        {/* Challenge Types Section */}
        {topTypes.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => toggleSection('types')}
              activeOpacity={0.7}
            >
              <View style={styles.expandableHeaderLeft}>
                <Ionicons name="game-controller-outline" size={20} color="#F75A5A" />
                <Text style={styles.expandableTitle}>Challenge Types ({typeEntries.length})</Text>
              </View>
              <Ionicons
                name={expandedSection === 'types' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#F75A5A"
              />
            </TouchableOpacity>

            <Animated.View
              style={{
                maxHeight: expansionAnims.types.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 300],
                }),
                opacity: expansionAnims.types,
                overflow: 'hidden',
              }}
            >
              <View style={styles.expandedContent}>
                {topTypes.map(([type, mastery]) => (
                  <View key={type} style={styles.languageItem}>
                    <View style={styles.languageHeader}>
                      <View style={styles.typeNameContainer}>
                        <Text style={styles.typeEmoji}>{getMasteryEmoji(mastery.rank)}</Text>
                        <Text style={styles.languageName}>
                          {formatChallengeType(type)}
                        </Text>
                      </View>
                      <Text style={styles.languageChallenges}>
                        {mastery.total_challenges} challenges
                      </Text>
                    </View>
                    <View style={styles.languageDetails}>
                      <Text style={styles.languageDetail}>
                        {Math.round(mastery.accuracy)}% accuracy
                      </Text>
                      <Text style={styles.languageDetail}>
                        {mastery.rank.charAt(0).toUpperCase() + mastery.rank.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}

        {/* CEFR Levels Section */}
        {sortedLevels.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => toggleSection('levels')}
              activeOpacity={0.7}
            >
              <View style={styles.expandableHeaderLeft}>
                <Ionicons name="bar-chart-outline" size={20} color="#F75A5A" />
                <Text style={styles.expandableTitle}>CEFR Levels ({levelEntries.length})</Text>
              </View>
              <Ionicons
                name={expandedSection === 'levels' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#F75A5A"
              />
            </TouchableOpacity>

            <Animated.View
              style={{
                maxHeight: expansionAnims.levels.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 300],
                }),
                opacity: expansionAnims.levels,
                overflow: 'hidden',
              }}
            >
              <View style={styles.expandedContent}>
                {sortedLevels.map(([level, mastery]) => (
                  <View key={level} style={styles.languageItem}>
                    <View style={styles.languageHeader}>
                      <View style={styles.typeNameContainer}>
                        <Text style={styles.levelBadgeText}>{level}</Text>
                        <View style={styles.starsContainer}>
                          {Array.from({ length: mastery.mastery_stars }).map((_, i) => (
                            <Text key={i} style={styles.starEmoji}>⭐</Text>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.languageChallenges}>
                        {mastery.total_challenges} challenges
                      </Text>
                    </View>
                    <View style={styles.languageDetails}>
                      <Text style={styles.languageDetail}>
                        {Math.round(mastery.accuracy)}% accuracy
                      </Text>
                      <Text style={styles.languageDetail}>
                        {mastery.languages.length} {mastery.languages.length === 1 ? 'language' : 'languages'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}

        {/* Next Milestone */}
        {lifetime.milestones.next_milestone && (
          <View style={styles.milestoneSection}>
            <View style={styles.milestoneHeader}>
              <Ionicons name="trophy-outline" size={18} color="#F75A5A" />
              <Text style={styles.milestoneTitle}>Next Milestone</Text>
            </View>
            <Text style={styles.milestoneTarget}>
              {formatNumber(lifetime.milestones.next_milestone.current)} / {formatNumber(lifetime.milestones.next_milestone.target)} {formatMilestoneType(lifetime.milestones.next_milestone.type)}
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressBarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.milestoneProgress}>
              {Math.round(lifetime.milestones.next_milestone.progress_percent)}% complete
            </Text>
          </View>
        )}

        {/* Member Since */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {new Date(lifetime.summary.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 90, 90, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E04545',
  },
  statsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginHorizontal: 3,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakEmoji: {
    fontSize: 18,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  expandableHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E04545',
  },
  expandedContent: {
    gap: 8,
    paddingBottom: 8,
  },
  languageItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  languageChallenges: {
    fontSize: 12,
    color: '#6B7280',
  },
  languageDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  languageDetail: {
    fontSize: 12,
    color: '#F75A5A',
    fontWeight: '500',
  },
  typeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeEmoji: {
    fontSize: 16,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E04545',
    backgroundColor: 'rgba(247, 90, 90, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  starEmoji: {
    fontSize: 12,
  },
  milestoneSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E04545',
  },
  milestoneTarget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(247, 90, 90, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F75A5A',
    borderRadius: 3,
  },
  milestoneProgress: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F75A5A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
