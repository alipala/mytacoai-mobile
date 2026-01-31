/**
 * Session Summary Screen
 *
 * Displays comprehensive session statistics after completing all challenges
 * Features:
 * - Performance metrics
 * - Achievements unlocked
 * - XP earned
 * - Grade/rating
 * - Comparison with previous sessions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';
import { styles, width, height } from './styles/SessionSummary.styles';
import * as Haptics from 'expo-haptics';
import { SessionStats } from '../types/session';
import {
  formatSessionTime,
  getEncouragementMessage,
} from '../services/achievementService';
import { calculateSessionGrade, formatXP } from '../services/xpCalculator';
import { audioService } from '../services/audioService';

// Map grade to Lottie animation
const GRADE_ANIMATIONS: Record<string, any> = {
  'S': require('../assets/lottie/perfect.json'),
  'A': require('../assets/lottie/excellent.json'),
  'B': require('../assets/lottie/great.json'),
  'C': require('../assets/lottie/good.json'),
  'D': require('../assets/lottie/keep_practice.json'),
  'F': require('../assets/lottie/keep_going.json'),
};

interface SessionSummaryProps {
  stats: SessionStats;
  onContinue: () => void;
  onExit: () => void;
  onReviewMistakes?: () => void;
  previousBestXP?: number;
}

export default function SessionSummary({
  stats,
  onContinue,
  onExit,
  onReviewMistakes,
  previousBestXP,
}: SessionSummaryProps) {
  const confettiRef = useRef<any>(null);
  const lottieRef = useRef<LottieView>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const grade = calculateSessionGrade(stats.correctAnswers, stats.totalChallenges);
  const isNewRecord = previousBestXP !== undefined && stats.totalXP > previousBestXP;
  const animationSource = GRADE_ANIMATIONS[grade.grade];

  useEffect(() => {
    // Play session complete sound
    audioService.play('session_complete');

    // Haptic feedback
    if (stats.accuracy === 100) {
      // Perfect session - celebration!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (stats.accuracy >= 80) {
      // Good but not perfect - lighter feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Fire confetti ONLY for perfect sessions (100% accuracy)
    if (stats.accuracy === 100) {
      setTimeout(() => {
        confettiRef.current?.start();
      }, 500);
    }

    // Play Lottie animation
    setTimeout(() => {
      lottieRef.current?.play();
    }, 300);

    // Entrance animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get gradient colors based on grade
  const getGradientColors = () => {
    switch (grade.grade) {
      case 'S':
        return ['#FFD700', '#FFA500']; // Gold gradient
      case 'A':
        return ['#8B5CF6', '#7C3AED']; // Purple gradient
      case 'B':
        return ['#06B6D4', '#0891B2']; // Cyan gradient
      case 'C':
        return ['#10B981', '#059669']; // Green gradient
      case 'D':
        return ['#F59E0B', '#D97706']; // Orange gradient
      case 'F':
        return ['#EF4444', '#DC2626']; // Red gradient
      default:
        return ['#8B5CF6', '#7C3AED'];
    }
  };

  const [gradientColor1, gradientColor2] = getGradientColors();

  return (
    <View style={styles.container}>
      {/* Confetti - Only render for perfect sessions (100% accuracy) */}
      {stats.accuracy === 100 && (
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: width / 2, y: -10 }}
          autoStart={false}
          fadeOut={true}
          pointerEvents="none"
        />
      )}

      {/* Gradient Header Background */}
      <LinearGradient
        colors={[gradientColor1, gradientColor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeInAnim,
            },
          ]}
        >
          {/* Header with Title at Top */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Session Complete!</Text>
            <View style={styles.animationContainer}>
              <LottieView
                ref={lottieRef}
                source={animationSource}
                style={styles.lottieAnimation}
                loop={false}
                autoPlay={false}
              />
            </View>
            <View style={[styles.gradeCard, { backgroundColor: gradientColor1 }]}>
              <Text style={styles.gradeMessage}>{grade.message}</Text>
            </View>
          </View>

          {/* Main Stats Card - Big and Bold */}
          <LinearGradient
            colors={['rgba(31, 41, 55, 0.95)', 'rgba(17, 24, 39, 0.95)']}
            style={styles.mainStatsCard}
          >
            {/* XP Score - Hero stat */}
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Total Score</Text>
              <LinearGradient
                colors={[gradientColor1, gradientColor2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.xpBadge}
              >
                <Text style={styles.heroStatValue}>{formatXP(stats.totalXP)}</Text>
                <Text style={styles.xpText}>XP</Text>
              </LinearGradient>
              {isNewRecord && (
                <View style={styles.newRecordPill}>
                  <Text style={styles.newRecordText}>🏆 NEW RECORD!</Text>
                </View>
              )}
            </View>

            {/* Secondary Stats Grid */}
            <View style={styles.secondaryStatsGrid}>
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Ionicons name="target-outline" size={24} color="#10B981" />
                </View>
                <Text style={styles.miniStatValue}>{stats.accuracy.toFixed(0)}%</Text>
                <Text style={styles.miniStatLabel}>Accuracy</Text>
              </View>

              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
                  <Ionicons name="flash-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.miniStatValue}>{stats.averageTime.toFixed(1)}s</Text>
                <Text style={styles.miniStatLabel}>Avg Time</Text>
              </View>

              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <Ionicons name="flame-outline" size={24} color="#EF4444" />
                </View>
                <Text style={styles.miniStatValue}>{stats.maxCombo}x</Text>
                <Text style={styles.miniStatLabel}>Best Combo</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingLeft: 4 }}>
                <Ionicons name="trophy-outline" size={24} color="#FBBF24" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Achievements Unlocked</Text>
              </View>
              {stats.achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={styles.achievementCard}
                >
                  <View style={styles.achievementIconContainer}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  </View>
                  <View style={styles.achievementXPBadge}>
                    <Text style={styles.achievementXP}>+{achievement.xpBonus}</Text>
                    <Text style={styles.achievementXPLabel}>XP</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Performance Breakdown */}
          <View style={styles.performanceSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="bar-chart-outline" size={24} color="#14B8A6" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Performance Breakdown</Text>
            </View>

            {/* Accuracy Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarHeader}>
                <Text style={styles.progressBarLabel}>Accuracy Rate</Text>
                <Text style={styles.progressBarValue}>{stats.accuracy.toFixed(0)}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <LinearGradient
                  colors={[gradientColor1, gradientColor2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${stats.accuracy}%` }]}
                />
              </View>
            </View>

            {/* Correct vs Wrong */}
            <View style={styles.answersRow}>
              <View style={styles.answerCard}>
                <View style={[styles.answerIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Ionicons name="checkmark-circle-outline" size={28} color="#10B981" />
                </View>
                <Text style={styles.answerValue}>{stats.correctAnswers}</Text>
                <Text style={styles.answerLabel}>Correct</Text>
              </View>

              <View style={styles.answerDivider} />

              <View style={styles.answerCard}>
                <View style={[styles.answerIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <Ionicons name="close-circle-outline" size={28} color="#EF4444" />
                </View>
                <Text style={styles.answerValue}>{stats.wrongAnswers}</Text>
                <Text style={styles.answerLabel}>Wrong</Text>
              </View>
            </View>

            {/* Total Time */}
            <View style={styles.timeCard}>
              <View style={[styles.timeIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                <Ionicons name="time-outline" size={28} color="#8B5CF6" />
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Total Time</Text>
                <Text style={styles.timeValue}>{formatSessionTime(stats.totalTime)}</Text>
              </View>
            </View>
          </View>

          {/* Encouragement Message */}
          <LinearGradient
            colors={[gradientColor1 + '20', gradientColor2 + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.encouragementBox}
          >
            <Text style={styles.encouragementText}>
              {getEncouragementMessage(stats.accuracy)}
            </Text>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Review Mistakes Button - Redesigned */}
            {stats.incorrectChallenges.length > 0 && onReviewMistakes && (
              <TouchableOpacity
                style={styles.reviewButtonNew}
                onPress={onReviewMistakes}
                activeOpacity={0.8}
              >
                {/* Outer glow layer */}
                <View style={{
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: 24,
                  backgroundColor: 'rgba(245, 158, 11, 0.3)',
                  opacity: 0.6,
                }} />
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.reviewButtonTextNew}>
                    Review {stats.incorrectChallenges.length} Mistake{stats.incorrectChallenges.length > 1 ? 's' : ''}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.exitButtonNew}
              onPress={onExit}
              activeOpacity={0.8}
            >
              {/* Outer glow layer */}
              <View style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: 24,
                backgroundColor: 'rgba(6, 182, 212, 0.3)',
                opacity: 0.6,
              }} />
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.exitButtonTextNew}>Go to Challenges</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {/* Extra bottom padding to ensure nothing renders below */}
          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Detail Row Component
function DetailRow({
  label,
  value,
  valueColor = '#1F2937',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

