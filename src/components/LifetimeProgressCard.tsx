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

  // Debug logging
  React.useEffect(() => {
    console.log('[LifetimeProgressCard] 🔍 DEBUG - lifetime data:', JSON.stringify({
      hasLifetime: !!lifetime,
      summary: lifetime?.summary,
      totalChallenges: lifetime?.summary?.total_challenges,
      isLoading,
      hasError: !!error,
      errorMessage: error?.message
    }, null, 2));
  }, [lifetime, isLoading, error]);

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

  // Get challenge type icon
  const getChallengeTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'native_check': 'checkmark-circle',
      'story_builder': 'book',
      'brain_tickler': 'bulb',
      'micro_quiz': 'help-circle',
      'error_spotting': 'search',
      'smart_flashcard': 'flash',
      'swipe_fix': 'hand-left',
    };
    return iconMap[type] || 'game-controller';
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
        <LinearGradient
          colors={['#0D2832', '#0B1A1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.whiteCard}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.loadingText}>Loading lifetime progress...</Text>
          </View>
        </LinearGradient>
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
        <LinearGradient
          colors={['#0D2832', '#0B1A1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.whiteCard}
        >
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color="#F75A5A" style={{ marginBottom: 12 }} />
            <Text style={styles.errorTitle}>Could not load stats</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // No data state
  if (!lifetime) {
    return null;
  }

  // For truly new users with NO lifetime data, show encouraging empty state
  if (lifetime.summary.total_challenges === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0D2832', '#0B1A1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.whiteCard}
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="star" size={48} color="#FBBF24" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Start Your Journey!</Text>
            <Text style={styles.emptyMessage}>
              Complete your first challenges to unlock your lifetime progress stats and achievements!
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ✅ If user has ANY lifetime data, ALWAYS show it (even if inactive recently)

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
      <LinearGradient
        colors={['#0D2832', '#0B1A1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.whiteCard}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="trophy" size={24} color="#FBBF24" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.headerTitle}>Lifetime Progress</Text>
              <Text style={styles.headerSubtitle}>All-time achievements</Text>
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Ionicons name="medal" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.levelText}>{levelBadge.title}</Text>
          </View>
        </View>

        {/* Main Stats Grid - 2x2 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Challenges - Turquoise */}
            <View style={[styles.statBox, { backgroundColor: 'rgba(20, 184, 166, 0.12)', borderColor: 'rgba(20, 184, 166, 0.4)' }]}>
              <Text style={[styles.statValue, { color: '#14B8A6' }]}>{formatNumber(lifetime.summary.total_challenges)}</Text>
              <Text style={[styles.statLabel, { color: '#B4E4DD' }]}>Challenges</Text>
            </View>

            {/* Accuracy - Coral */}
            <View style={[styles.statBox, { backgroundColor: 'rgba(247, 90, 90, 0.12)', borderColor: 'rgba(247, 90, 90, 0.4)' }]}>
              <Text style={[styles.statValue, { color: '#F75A5A' }]}>
                {Math.round(overallAccuracy)}%
              </Text>
              <Text style={[styles.statLabel, { color: '#FFB4B4' }]}>Accuracy</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Total XP - Yellow */}
            <View style={[styles.statBox, { backgroundColor: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.4)' }]}>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{formatNumber(lifetime.summary.total_xp)}</Text>
              <Text style={[styles.statLabel, { color: '#C4B5FD' }]}>Total XP</Text>
            </View>

            {/* Best Streak - Orange */}
            <View style={[styles.statBox, { backgroundColor: 'rgba(251, 191, 36, 0.12)', borderColor: 'rgba(251, 191, 36, 0.4)' }]}>
              <Text style={[styles.statValue, { color: '#FBBF24' }]}>{lifetime.summary.longest_streak}</Text>
              <Text style={[styles.statLabel, { color: '#FDE68A' }]}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Languages Section - Horizontal Top 2 */}
        {topLanguages.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="language" size={16} color="#14B8A6" />
              <Text style={styles.sectionTitle}>Top Languages</Text>
            </View>
            <View style={styles.languagesGridHorizontal}>
              {topLanguages.slice(0, 2).map(([lang, progress]) => {
                const totalChallenges = lifetime.summary.total_challenges;
                const percentage = (progress.total_challenges / totalChallenges) * 100;

                return (
                  <View key={lang} style={styles.languageCompactItem}>
                    <View style={styles.languageCompactHeader}>
                      <Text style={styles.languageCompactName}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Text>
                      <Text style={styles.languageCompactCount}>
                        {progress.total_challenges}
                      </Text>
                    </View>
                    <View style={styles.languageProgressBar}>
                      <View
                        style={[
                          styles.languageProgressFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.languageCompactLevel}>
                      {progress.highest_level} • {Math.round(percentage)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Challenge Types Section - Top 2 */}
        {topTypes.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="game-controller" size={16} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Top Challenge Types</Text>
            </View>
            <View style={styles.typesGrid}>
              {topTypes.slice(0, 2).map(([type, mastery]) => {
                const typeIconName = getChallengeTypeIcon(type);

                return (
                  <View key={type} style={styles.typeCompactItem}>
                    <View style={styles.typeCompactIcon}>
                      <Ionicons name={typeIconName as any} size={16} color="#8B5CF6" />
                    </View>
                    <View style={styles.typeCompactInfo}>
                      <Text style={styles.typeCompactName} numberOfLines={1}>
                        {formatChallengeType(type)}
                      </Text>
                      <Text style={styles.typeCompactStats}>
                        {mastery.total_challenges} • {Math.round(mastery.accuracy)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* CEFR Levels Section - Removed for cleaner UI */}
        {false && sortedLevels.length > 0 && (
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

        {/* Next Milestone - Hidden to save space */}
        {false && lifetime.milestones.next_milestone && (
          <View style={styles.milestoneCompactSection}>
            <View style={styles.milestoneCompactHeader}>
              <View style={styles.milestoneHeaderLeft}>
                <Ionicons name="trophy" size={16} color="#FBBF24" />
                <Text style={styles.milestoneCompactTitle}>Next Milestone</Text>
              </View>
              <Text style={styles.milestonePercentage}>
                {Math.round(lifetime.milestones.next_milestone.progress_percent)}%
              </Text>
            </View>
            <Text style={styles.milestoneCompactTarget}>
              {formatNumber(lifetime.milestones.next_milestone.current)} / {formatNumber(lifetime.milestones.next_milestone.target)} Challenges
            </Text>
            <View style={styles.milestoneProgressBar}>
              <Animated.View
                style={[
                  styles.milestoneProgressFill,
                  {
                    width: progressBarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Member Since */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {new Date(lifetime.summary.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40, // Match CARD_WIDTH for consistent sizing
  },
  whiteCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#B4E4DD',
    marginTop: 2,
    opacity: 0.8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 90, 90, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    gap: 6,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
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
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#6B8A84',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#B4E4DD',
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#B4E4DD',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
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
  // Empty state (reuse error container styles)
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#B4E4DD',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  // New compact section styles
  sectionContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Languages Grid - Horizontal Layout
  languagesGridHorizontal: {
    flexDirection: 'row',
    gap: 8,
  },
  languagesGrid: {
    gap: 8,
  },
  languageCompactItem: {
    flex: 1,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  languageCompactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  languageCompactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  languageCompactCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14B8A6',
  },
  languageProgressBar: {
    height: 5,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  languageProgressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 3,
  },
  languageCompactLevel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B4E4DD',
  },

  // Challenge Types Grid - Compact Always Visible
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCompactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 8,
    flex: 1,
  },
  typeCompactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCompactInfo: {
    flex: 1,
  },
  typeCompactName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  typeCompactStats: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Milestone - Compact & Prominent
  milestoneCompactSection: {
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  milestoneCompactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneCompactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  milestonePercentage: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FBBF24',
  },
  milestoneCompactTarget: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B4E4DD',
    marginBottom: 10,
  },
  milestoneProgressBar: {
    height: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
});
