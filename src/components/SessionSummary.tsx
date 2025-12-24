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
import * as Haptics from 'expo-haptics';
import { SessionStats } from '../types/session';
import {
  formatSessionTime,
  getEncouragementMessage,
} from '../services/achievementService';
import { calculateSessionGrade, formatXP } from '../services/xpCalculator';
import { audioService } from '../services/audioService';

const { width, height } = Dimensions.get('window');

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
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const grade = calculateSessionGrade(stats.correctAnswers, stats.totalChallenges);
  const isNewRecord = previousBestXP !== undefined && stats.totalXP > previousBestXP;

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

  return (
    <View style={styles.container}>
      {/* Confetti - Only render for perfect sessions (100% accuracy) */}
      {stats.accuracy === 100 && (
        <ConfettiCannon
          ref={confettiRef}
          count={80}
          origin={{ x: width / 2, y: -10 }}
          autoStart={false}
          fadeOut={true}
          pointerEvents="none"
        />
      )}

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>{grade.emoji}</Text>
            <Text style={styles.headerTitle}>Session Complete!</Text>
            <Text style={styles.headerSubtitle}>{grade.message}</Text>
          </View>

          {/* Performance Metrics */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="📊"
              label="Score"
              value={`${formatXP(stats.totalXP)} XP`}
              highlight={isNewRecord}
            />
            <StatCard
              icon="🎯"
              label="Accuracy"
              value={`${stats.accuracy.toFixed(0)}%`}
            />
            <StatCard
              icon="⚡"
              label="Avg Time"
              value={`${stats.averageTime.toFixed(1)}s`}
            />
            <StatCard
              icon="🔥"
              label="Best Combo"
              value={`${stats.maxCombo}x`}
            />
          </View>

          {/* New Record Badge */}
          {isNewRecord && (
            <View style={styles.recordBadge}>
              <Text style={styles.recordEmoji}>🏆</Text>
              <Text style={styles.recordText}>
                New Personal Best! +{stats.totalXP - (previousBestXP || 0)} XP
              </Text>
            </View>
          )}

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
              {stats.achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  </View>
                  <Text style={styles.achievementXP}>+{achievement.xpBonus} XP</Text>
                </View>
              ))}
            </View>
          )}

          {/* Encouragement Message */}
          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              {getEncouragementMessage(stats.accuracy)}
            </Text>
          </View>

          {/* Detailed Stats */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>📈 Detailed Stats</Text>
            <DetailRow label="Total Challenges" value={`${stats.totalChallenges}`} />
            <DetailRow
              label="Correct Answers"
              value={`${stats.correctAnswers}`}
              valueColor="#10B981"
            />
            <DetailRow
              label="Wrong Answers"
              value={`${stats.wrongAnswers}`}
              valueColor="#EF4444"
            />
            <DetailRow label="Total Time" value={formatSessionTime(stats.totalTime)} />
          </View>

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
    zIndex: 1000, // Ensure this is above everything else
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gradeGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradeText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardHighlight: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  recordEmoji: {
    fontSize: 20,
  },
  recordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  achievementXP: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
  encouragementBox: {
    backgroundColor: '#ECFEFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  encouragementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891B2',
    textAlign: 'center',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reviewButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exitButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  // New button styles
  reviewButtonNew: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewButtonTextNew: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  exitButtonNew: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exitButtonTextNew: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
