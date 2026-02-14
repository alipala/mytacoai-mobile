/**
 * Comprehensive Carousel Component
 *
 * 3 colorful sliding cards: Today's Progress, Recent Performance, Choose Your Quest
 * All-in-one carousel for the Challenges screen
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDailyStats, useRecentPerformance } from '../hooks/useStats';
import { styles, CARD_WIDTH, CARD_SPACING } from './styles/ComprehensiveCarousel.styles';

interface ComprehensiveCarouselProps {
  navigation: any;
  onMasterPlansPress: () => void;
  onFreestylePress: () => void;
  completedPlansCount: number;
}

export default function ComprehensiveCarousel({
  navigation,
  onMasterPlansPress,
  onFreestylePress,
  completedPlansCount,
}: ComprehensiveCarouselProps) {
  const { daily } = useDailyStats(true);
  const { recent } = useRecentPerformance(7, true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate values for Today's Progress
  const challengesToday = daily?.challenges || 0;
  const accuracyToday = daily?.accuracy ? Math.round(daily.accuracy) : 0;
  const totalXP = daily?.xp || 0;
  const correctToday = daily?.correct || 0;
  const incorrectToday = daily?.incorrect || 0;

  // Calculate values for Recent Performance
  const weekChallenges = recent?.total_challenges || 0;
  const weekAccuracy = recent?.average_accuracy ? Math.round(recent.average_accuracy) : 0;
  const streak = daily?.current_streak || 0;

  // Determine trend
  const getTrend = () => {
    if (!recent || !recent.daily_breakdown) return { emoji: '🌟', text: 'Start Today', color: '#9CA3AF' };

    const daysWithPractice = recent.daily_breakdown.filter((d: any) => d.challenges > 0).length;

    if (daysWithPractice === 0) return { emoji: '🌟', text: 'Start Today', color: '#9CA3AF' };
    if (daysWithPractice === 1) return { emoji: '🚀', text: 'Just Started!', color: '#06B6D4' };
    if (daysWithPractice >= 5) return { emoji: '🔥', text: 'On Fire!', color: '#EF4444' };
    if (daysWithPractice >= 3) return { emoji: '💪', text: 'Keep Going!', color: '#8B5CF6' };
    return { emoji: '👋', text: 'Come Back Soon', color: '#F59E0B' };
  };

  const trend = getTrend();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionSubtitle}>Swipe to explore →</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Card 1: Today's Progress */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#DBEAFE', '#BFDBFE', '#93C5FD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🎯</Text>
              <Text style={styles.cardTitle}>Today's Progress</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{challengesToday}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{accuracyToday}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalXP}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
            </View>

            {challengesToday > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>
                  ✓ {correctToday} correct · ✗ {incorrectToday} incorrect
                </Text>
              </View>
            )}

            {challengesToday === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Start your first challenge! 🚀</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Card 2: Recent Performance */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>📊</Text>
              <Text style={styles.cardTitle}>Recent Performance</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{weekChallenges}</Text>
                <Text style={styles.statLabel}>7-Day Total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{weekAccuracy}%</Text>
                <Text style={styles.statLabel}>Avg Accuracy</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{streak > 0 ? `${streak}🔥` : '0'}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.trendBadge}>
              <Text style={styles.trendEmoji}>{trend.emoji}</Text>
              <Text style={[styles.trendText, { color: trend.color }]}>
                {trend.text}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Card 3: Choose Your Quest */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#E9D5FF', '#D8B4FE', '#C084FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🏆</Text>
              <Text style={styles.cardTitle}>Choose Your Quest</Text>
            </View>

            <Text style={styles.questSubtitle}>Pick your learning adventure!</Text>

            {/* Master Your Plans Option - DISABLED (Coming Soon) */}
            <TouchableOpacity
              style={[styles.questButton, styles.questButtonDisabled]}
              activeOpacity={1}
              disabled={true}
            >
              <View style={styles.questButtonContent}>
                <View style={styles.questIcon}>
                  <Text style={styles.questIconEmoji}>👑</Text>
                </View>
                <View style={styles.questInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.questButtonTitle}>📚 Master Your Plans</Text>
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>COMING SOON</Text>
                    </View>
                  </View>
                  <Text style={styles.questButtonSubtitle}>
                    Practice your completed learning plans
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Freestyle Practice Option */}
            <TouchableOpacity
              style={styles.questButton}
              onPress={onFreestylePress}
              activeOpacity={0.8}
            >
              <View style={styles.questButtonContent}>
                <View style={styles.questIcon}>
                  <Text style={styles.questIconEmoji}>🚀</Text>
                </View>
                <View style={styles.questInfo}>
                  <Text style={styles.questButtonTitle}>⚡ Freestyle Practice</Text>
                  <Text style={styles.questButtonSubtitle}>
                    6 languages · All levels
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
