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
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { SessionStats } from '../types/session';
import {
  formatSessionTime,
  getEncouragementMessage,
} from '../services/achievementService';
import { calculateSessionGrade, formatXP } from '../services/xpCalculator';
import { audioService } from '../services/audioService';

const { width, height } = Dimensions.get('window');

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
            colors={['#FFFFFF', '#F9FAFB']}
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
                <View style={[styles.miniStatIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.miniStatIcon}>🎯</Text>
                </View>
                <Text style={styles.miniStatValue}>{stats.accuracy.toFixed(0)}%</Text>
                <Text style={styles.miniStatLabel}>Accuracy</Text>
              </View>

              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={styles.miniStatIcon}>⚡</Text>
                </View>
                <Text style={styles.miniStatValue}>{stats.averageTime.toFixed(1)}s</Text>
                <Text style={styles.miniStatLabel}>Avg Time</Text>
              </View>

              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIconContainer, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={styles.miniStatIcon}>🔥</Text>
                </View>
                <Text style={styles.miniStatValue}>{stats.maxCombo}x</Text>
                <Text style={styles.miniStatLabel}>Best Combo</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
              {stats.achievements.map((achievement) => (
                <LinearGradient
                  key={achievement.id}
                  colors={['#FFFFFF', '#FFFBEB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
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
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Performance Breakdown */}
          <View style={styles.performanceSection}>
            <Text style={styles.sectionTitle}>📊 Performance Breakdown</Text>

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
                <View style={[styles.answerIconContainer, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.answerIcon}>✓</Text>
                </View>
                <Text style={styles.answerValue}>{stats.correctAnswers}</Text>
                <Text style={styles.answerLabel}>Correct</Text>
              </View>

              <View style={styles.answerDivider} />

              <View style={styles.answerCard}>
                <View style={[styles.answerIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.answerIcon}>✗</Text>
                </View>
                <Text style={styles.answerValue}>{stats.wrongAnswers}</Text>
                <Text style={styles.answerLabel}>Wrong</Text>
              </View>
            </View>

            {/* Total Time */}
            <View style={styles.timeCard}>
              <Text style={styles.timeIcon}>⏱️</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    zIndex: 1000,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    opacity: 0.15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  animationContainer: {
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  gradeCard: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gradeLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gradeMessage: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainStatsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroStat: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 4,
  },
  heroStatValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  newRecordPill: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  newRecordText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  secondaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  miniStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniStatIcon: {
    fontSize: 24,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    paddingLeft: 4,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  achievementXPBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementXP: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  achievementXPLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 2,
  },
  performanceSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  progressBarValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 100,
  },
  answersRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  answerCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  answerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  answerIcon: {
    fontSize: 24,
    fontWeight: '900',
  },
  answerValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 4,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  answerDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  timeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  encouragementBox: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  encouragementText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 16,
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  reviewButtonNew: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  reviewButtonTextNew: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  exitButtonNew: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  exitButtonTextNew: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
