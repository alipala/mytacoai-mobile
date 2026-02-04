/**
 * Welcome Back Card
 *
 * Engaging card for returning users who have been inactive
 * Celebrates their achievements and motivates them to return
 * Features:
 * - Personalized welcome message
 * - Achievement highlights (total challenges, best streak)
 * - Last active date
 * - Motivational call-to-action
 * - Beautiful dark theme design with gradients
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles/WelcomeBackCard.styles';

const { width } = Dimensions.get('window');

interface WelcomeBackCardProps {
  userName?: string;
  totalChallenges: number;
  totalXP: number;
  longestStreak: number;
  currentStreak: number;
  lastActiveDate: string; // e.g., "Jan 24"
  daysSinceActive: number;
  onResumePractice: () => void;
}

export default function WelcomeBackCard({
  userName,
  totalChallenges,
  totalXP,
  longestStreak,
  currentStreak,
  lastActiveDate,
  daysSinceActive,
  onResumePractice,
}: WelcomeBackCardProps) {
  const { t } = useTranslation();
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const statsSlideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(statsSlideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get achievement badge based on challenges
  const getAchievementBadge = () => {
    if (totalChallenges >= 1000) return { emoji: '👑', title: 'Legend', color: '#FFD700' };
    if (totalChallenges >= 500) return { emoji: '🏆', title: 'Master', color: '#14B8A6' };
    if (totalChallenges >= 250) return { emoji: '💎', title: 'Expert', color: '#06B6D4' };
    if (totalChallenges >= 100) return { emoji: '⭐', title: 'Advanced', color: '#8B5CF6' };
    if (totalChallenges >= 50) return { emoji: '🌟', title: 'Intermediate', color: '#10B981' };
    return { emoji: '✨', title: 'Rising Star', color: '#14B8A6' };
  };

  const badge = getAchievementBadge();

  // Get motivational message based on streak context
  const getMotivationalMessage = () => {
    if (currentStreak > 0) {
      return `Your ${currentStreak}-day streak is active! Keep it going!`;
    }
    if (longestStreak > 0) {
      return `Your best streak: ${longestStreak} days. Let's beat that record!`;
    }
    return "Start today and build your streak!";
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#0D2832', '#0B1A1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header with wave icon and welcome */}
        <View style={styles.header}>
          <View style={styles.waveContainer}>
            <Ionicons name="hand-right" size={24} color="#14B8A6" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>{t('explore.stats.welcome_back')}{userName ? `, ${userName}` : ''}!</Text>
            <Text style={styles.lastActiveText}>
              {t('explore.stats.last_active')} {lastActiveDate} ({daysSinceActive} {daysSinceActive !== 1 ? t('explore.stats.days_ago') : t('explore.stats.day_ago')})
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Animated.View
          style={[
            styles.statsGrid,
            { transform: [{ translateY: statsSlideAnim }] },
          ]}
        >
          {/* Total Challenges */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(20, 184, 166, 0.15)', 'rgba(20, 184, 166, 0.05)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="trophy" size={20} color="#14B8A6" />
              <Text style={styles.statValue}>{formatNumber(totalChallenges)}</Text>
              <Text style={styles.statLabel}>{t('explore.stats.challenges')}</Text>
            </LinearGradient>
          </View>

          {/* Total XP */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="flash" size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>{formatNumber(totalXP)}</Text>
              <Text style={styles.statLabel}>{t('explore.stats.total_xp')}</Text>
            </LinearGradient>
          </View>

          {/* Best Streak */}
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="flame" size={20} color="#FBBF24" />
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>{t('explore.stats.best_streak')}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Call to Action Text (instead of button) */}
        <View style={styles.ctaTextContainer}>
          <Ionicons name="arrow-down-circle" size={18} color="#14B8A6" />
          <Text style={styles.ctaText}>{t('explore.stats.choose_quest_continue')}</Text>
        </View>

        {/* Bottom hint */}
        <View style={styles.bottomHint}>
          <Ionicons name="arrow-forward" size={12} color="#6B8A84" />
          <Text style={styles.hintText}>{t('explore.stats.swipe_detailed_stats')}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
