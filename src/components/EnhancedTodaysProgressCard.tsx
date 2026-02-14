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
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDailyStats } from '../hooks/useStats';
import type { DailyStatsBreakdown } from '../types/stats';
import { styles, width } from './styles/EnhancedTodaysProgressCard.styles';

interface EnhancedTodaysProgressCardProps {
  onRefresh?: () => void;
}

export default function EnhancedTodaysProgressCard({ onRefresh }: EnhancedTodaysProgressCardProps) {
  const { t } = useTranslation();
  const { daily, isLoading, error, refetchDaily } = useDailyStats(true);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

    // Bouncing arrow animation - continuous loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
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

  // Get streak icon - returns empty string now since we'll use Ionicons directly in JSX
  const getStreakIcon = (streak: number): { name: string; count: number } => {
    if (streak >= 30) return { name: 'flame', count: 3 }; // Legendary
    if (streak >= 14) return { name: 'flame', count: 2 }; // Hot
    if (streak >= 7) return { name: 'flame', count: 1 }; // On fire
    if (streak >= 3) return { name: 'star', count: 1 }; // Getting there
    return { name: 'sparkles', count: 1 }; // Starting out
  };

  // Handle retry
  const handleRetry = () => {
    refetchDaily(true);
    onRefresh?.();
  };

  // Determine what to render (all hooks must be called before this)
  let contentToRender: 'loading' | 'error' | 'empty' | 'emptyToday' | 'data' = 'data';
  let isNotFoundError = false;

  if (isLoading && !daily) {
    contentToRender = 'loading';
  } else if (error && !daily) {
    isNotFoundError =
      error.message.includes('not found') ||
      error.message.includes('404') ||
      error.message.includes('Statistics not found');
    contentToRender = isNotFoundError ? 'empty' : 'error';
  } else if (!daily) {
    contentToRender = 'empty';
  } else if (daily.overall.total_challenges === 0) {
    contentToRender = 'emptyToday';
  }

  // Loading state
  if (contentToRender === 'loading') {
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

  // Empty state for new users
  if (contentToRender === 'empty') {
    if (isNotFoundError) {
      // Show motivational banner for new users
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
            colors={['#F0FFFE', '#CCFBF1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.motivationalBanner}>
              <View style={styles.bannerHeader}>
                <Ionicons name="trophy" size={36} color="#14B8A6" />
              </View>

              <Text style={styles.bannerTitle}>Start Your First Challenge!</Text>

              <Text style={styles.bannerSubtitle}>
                Choose a quest below to begin your learning journey
              </Text>

              <View style={styles.bannerPerks}>
                <View style={styles.perkItem}>
                  <Ionicons name="flash" size={14} color="#0F766E" />
                  <Text style={styles.perkText}>+50 XP</Text>
                </View>
                <View style={styles.perkDivider} />
                <View style={styles.perkItem}>
                  <Ionicons name="star" size={14} color="#0F766E" />
                  <Text style={styles.perkText}>Build Streak</Text>
                </View>
                <View style={styles.perkDivider} />
                <View style={styles.perkItem}>
                  <Ionicons name="ribbon" size={14} color="#0F766E" />
                  <Text style={styles.perkText}>Earn Badges</Text>
                </View>
              </View>

              <View style={styles.scrollIndicator}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        translateY: bounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 8],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons name="chevron-down" size={24} color="#14B8A6" />
                </Animated.View>
                <Text style={styles.scrollText}>Choose quest below</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      );
    }

    // No data fallback
    return null;
  }

  // Error state
  if (contentToRender === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.whiteCard}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Could not load stats</Text>
            <Text style={styles.errorMessage}>{error?.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Empty state (no activity today) - Motivational banner with streak urgency
  if (contentToRender === 'emptyToday') {
    const hasStreak = daily.streak.current > 0;

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
          colors={hasStreak ? ['#FEE2E2', '#FECACA'] : ['#F0FFFE', '#CCFBF1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.motivationalBanner}>
            <View style={styles.bannerHeader}>
              <Ionicons
                name={hasStreak ? "flame" : "trophy"}
                size={40}
                color={hasStreak ? "#DC2626" : "#14B8A6"}
              />
              {hasStreak && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakNumber}>{daily.streak.current}</Text>
                </View>
              )}
            </View>

            <Text style={[styles.bannerTitle, { color: hasStreak ? "#991B1B" : "#115E59" }]}>
              {hasStreak ? t('explore.stats.day_streak_active', { count: daily.streak.current }) : t('explore.stats.start_your_journey')}
            </Text>

            <Text style={[styles.bannerSubtitle, { color: hasStreak ? "#7F1D1D" : "#134E4A" }]}>
              {hasStreak
                ? t('explore.stats.complete_quest_keep_streak')
                : t('explore.stats.choose_quest_earn_rewards')
              }
            </Text>

            <View style={styles.bannerPerks}>
              <View style={styles.perkItem}>
                <Ionicons
                  name={hasStreak ? "shield-checkmark" : "flash"}
                  size={14}
                  color={hasStreak ? "#991B1B" : "#0F766E"}
                />
                <Text style={[styles.perkText, { color: hasStreak ? "#991B1B" : "#0F766E" }]}>
                  {hasStreak ? t('explore.stats.save_streak') : '+50 XP'}
                </Text>
              </View>
              <View style={styles.perkDivider} />
              <View style={styles.perkItem}>
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={hasStreak ? "#991B1B" : "#0F766E"}
                />
                <Text style={[styles.perkText, { color: hasStreak ? "#991B1B" : "#0F766E" }]}>
                  {t('explore.stats.boost_stats')}
                </Text>
              </View>
              <View style={styles.perkDivider} />
              <View style={styles.perkItem}>
                <Ionicons
                  name="star"
                  size={14}
                  color={hasStreak ? "#991B1B" : "#0F766E"}
                />
                <Text style={[styles.perkText, { color: hasStreak ? "#991B1B" : "#0F766E" }]}>
                  {t('explore.stats.earn_badges')}
                </Text>
              </View>
            </View>

            <View style={[styles.scrollIndicator, { borderTopColor: hasStreak ? 'rgba(153, 27, 27, 0.2)' : 'rgba(15, 118, 110, 0.2)' }]}>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons name="chevron-down" size={24} color={hasStreak ? "#DC2626" : "#14B8A6"} />
              </Animated.View>
              <Text style={[styles.scrollText, { color: hasStreak ? "#991B1B" : "#0F766E" }]}>
                {t('explore.stats.choose_quest_below')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  const accuracyColor = getAccuracyColor(daily.overall.accuracy);
  const streakIcon = getStreakIcon(daily.streak.current);

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="flame-outline" size={20} color="#14B8A6" />
            <Text style={styles.headerTitle}>Today's Progress</Text>
          </View>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Challenges Completed */}
          <View style={[styles.statBox, { backgroundColor: '#10B981', borderWidth: 0 }]}>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {daily.overall.total_challenges}
            </Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>Completed</Text>
          </View>

          {/* Accuracy */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: '#8B5CF6',
                borderWidth: 0,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {Math.round(daily.overall.accuracy)}%
            </Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>Accuracy</Text>
          </View>

          {/* Streak */}
          <View style={[styles.statBox, { backgroundColor: '#FFD63A', borderWidth: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: streakIcon.count }).map((_, i) => (
                <Ionicons key={i} name={streakIcon.name as any} size={16} color="#0F1B2D" />
              ))}
              <Text style={[styles.statValue, { color: '#0F1B2D' }]}>
                {daily.streak.current}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: '#0F1B2D' }]}>Day Streak</Text>
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

        {/* Streak Milestone */}
        {daily.streak.next_milestone && (
          <View style={styles.milestoneContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Ionicons name="trophy-outline" size={14} color="#FCD34D" />
              <Text style={styles.milestoneText}>
                {daily.streak.next_milestone - daily.streak.current} days until {daily.streak.next_milestone}-day milestone!
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

