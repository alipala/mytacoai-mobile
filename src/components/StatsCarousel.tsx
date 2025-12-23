/**
 * Stats Carousel Component
 *
 * Horizontal scrolling stats cards inspired by fitness apps
 * Combines Today's Progress + Recent Performance in compact format
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDailyStats, useRecentPerformance } from '../hooks/useStats';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 12;

interface CompactStatCardProps {
  title: string;
  emoji: string;
  value: string | number;
  subtitle: string;
  colors: string[];
  onPress?: () => void;
}

function CompactStatCard({ title, emoji, value, subtitle, colors, onPress }: CompactStatCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function StatsCarousel({ navigation }: any) {
  const { daily } = useDailyStats(true);
  const { recent } = useRecentPerformance(7, true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate values
  const challengesToday = daily?.challenges || 0;
  const accuracyToday = daily?.accuracy ? Math.round(daily.accuracy) : 0;
  const streak = daily?.current_streak || 0;
  const totalXP = daily?.xp || 0;

  const weekChallenges = recent?.total_challenges || 0;
  const weekAccuracy = recent?.average_accuracy ? Math.round(recent.average_accuracy) : 0;

  // Determine trend
  const getTrend = () => {
    if (!recent || !recent.daily_breakdown) return { emoji: '🌟', text: 'Start Your Journey' };

    const daysWithPractice = recent.daily_breakdown.filter((d: any) => d.challenges > 0).length;

    if (daysWithPractice === 0) return { emoji: '🌟', text: 'Start Today' };
    if (daysWithPractice === 1) return { emoji: '🚀', text: 'Just Started!' };
    if (daysWithPractice >= 5) return { emoji: '🔥', text: 'On Fire!' };
    if (daysWithPractice >= 3) return { emoji: '💪', text: 'Keep Going!' };
    return { emoji: '👋', text: 'Come Back Soon' };
  };

  const trend = getTrend();

  const cards = [
    {
      title: "Today's Mission",
      emoji: '🎯',
      value: `${challengesToday} / 10`,
      subtitle: challengesToday === 0 ? 'Start your first challenge!' : `${accuracyToday}% accuracy · ${totalXP} XP earned`,
      colors: ['#DBEAFE', '#BFDBFE', '#93C5FD'],
    },
    {
      title: '7-Day Progress',
      emoji: trend.emoji,
      value: `${weekChallenges} completed`,
      subtitle: trend.text + (weekChallenges > 0 ? ` · ${weekAccuracy}% avg` : ''),
      colors: ['#FEF3C7', '#FDE68A', '#FCD34D'],
    },
    {
      title: 'Current Streak',
      emoji: streak > 0 ? '🔥' : '⭐',
      value: streak === 0 ? 'Start' : `${streak} day${streak !== 1 ? 's' : ''}`,
      subtitle: streak === 0 ? 'Practice today to start!' : 'Keep it alive!',
      colors: ['#FED7AA', '#FDBA74', '#FB923C'],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <Text style={styles.sectionSubtitle}>Swipe to see more →</Text>
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
        {cards.map((card, index) => (
          <CompactStatCard
            key={index}
            {...card}
            onPress={() => {
              // Could navigate to detailed stats
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  scrollView: {
    paddingLeft: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
