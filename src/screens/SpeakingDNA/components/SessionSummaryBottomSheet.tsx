/**
 * Session Summary Bottom Sheet Component
 *
 * Redesigned session summary using @gorhom/bottom-sheet
 * with immersive layout, animated stats, and comparisons
 */

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, GRADIENTS, SHADOWS, SPRING_CONFIGS } from '../constants';
import { StatCard } from './StatCard';
import { ComparisonBar } from './ComparisonBar';
import { SessionStats, SessionComparison, OverallProgress } from '../../../types/progressStats';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type SavingStage = 'saving' | 'analyzing' | 'finalizing' | 'success';

interface SessionSummaryBottomSheetProps {
  visible: boolean;
  stage: SavingStage;
  sentenceCount: number;
  conversationHighlights: string[];
  duration: string;
  messageCount: number;
  onComplete: () => void;
  onViewAnalysis: () => void;
  onGoDashboard: () => void;
  sessionStats?: SessionStats;
  comparison?: SessionComparison;
  overallProgress?: OverallProgress;
  hasAnalyses?: boolean;
}

/**
 * Processing stage configuration
 */
const getStageConfig = (stage: SavingStage, sentenceCount: number) => {
  switch (stage) {
    case 'saving':
      return {
        icon: 'cloud-upload' as const,
        title: 'Saving Your Session',
        subtitle: 'Preserving your progress...',
        gradient: GRADIENTS.primary,
      };
    case 'analyzing':
      return {
        icon: 'sparkles' as const,
        title: 'Analyzing Your Performance',
        subtitle: `Processing ${sentenceCount} sentence${sentenceCount !== 1 ? 's' : ''}...`,
        gradient: GRADIENTS.categoryLearning,
      };
    case 'finalizing':
      return {
        icon: 'checkmark-circle' as const,
        title: 'Finalizing Results',
        subtitle: 'Almost there...',
        gradient: GRADIENTS.categoryVocabulary,
      };
    case 'success':
      return {
        icon: 'trophy' as const,
        title: 'Session Complete!',
        subtitle: 'Great work on your practice',
        gradient: GRADIENTS.celebration,
      };
  }
};

/**
 * Loading Spinner Component
 */
const LoadingSpinner: React.FC<{ color: string }> = ({ color }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="sync" size={48} color={color} />
    </Animated.View>
  );
};

/**
 * Session Summary Bottom Sheet Component
 */
export const SessionSummaryBottomSheet: React.FC<SessionSummaryBottomSheetProps> = ({
  visible,
  stage,
  sentenceCount,
  conversationHighlights,
  duration,
  messageCount,
  onComplete,
  onViewAnalysis,
  onGoDashboard,
  sessionStats,
  comparison,
  overallProgress,
  hasAnalyses = true,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const confettiScale = useSharedValue(0);

  const config = getStageConfig(stage, sentenceCount);
  const snapPoints = useMemo(() => ['65%', '90%'], []);

  /**
   * Show/hide bottom sheet based on visibility
   */
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  /**
   * Confetti animation for success stage
   */
  useEffect(() => {
    if (stage === 'success') {
      confettiScale.value = withSequence(
        withSpring(1.2, SPRING_CONFIGS.bouncy),
        withSpring(1, SPRING_CONFIGS.gentle)
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      confettiScale.value = 0;
    }
  }, [stage]);

  /**
   * Rotate conversation highlights
   */
  useEffect(() => {
    if (conversationHighlights.length > 0 && stage !== 'success') {
      const interval = setInterval(() => {
        setCurrentHighlightIndex((prev) => (prev + 1) % conversationHighlights.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationHighlights.length, stage]);

  /**
   * Backdrop component
   */
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  /**
   * Handle sheet close
   */
  const handleSheetClose = useCallback(() => {
    if (stage === 'success') {
      onComplete();
    }
  }, [stage, onComplete]);

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={stage === 'success'}
      backdropComponent={renderBackdrop}
      onClose={handleSheetClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {stage !== 'success' ? (
            <LoadingSpinner color={COLORS.white} />
          ) : (
            <Animated.View style={confettiAnimatedStyle}>
              <Ionicons name={config.icon} size={64} color={COLORS.white} />
            </Animated.View>
          )}
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </LinearGradient>

        {/* Processing: Show conversation highlights */}
        {stage !== 'success' && conversationHighlights.length > 0 && (
          <View style={styles.highlightsSection}>
            <View style={styles.highlightCard}>
              <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary[500]} />
              <Text style={styles.highlightText}>
                "{conversationHighlights[currentHighlightIndex]}"
              </Text>
            </View>
          </View>
        )}

        {/* Success: Show stats and comparisons */}
        {stage === 'success' && (
          <>
            {/* Learning Plan Session Header */}
            {sessionStats?.week_focus && (
              <View style={styles.sessionHeader}>
                <Ionicons name="calendar" size={20} color={COLORS.primary[500]} />
                <Text style={styles.sessionHeaderText}>
                  Week {sessionStats.week_number}: {sessionStats.week_focus}
                </Text>
              </View>
            )}

            {/* Session Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SESSION STATS</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="timer-outline"
                  label="Duration"
                  value={duration}
                  iconColor={COLORS.primary[500]}
                  delay={0}
                />
                <StatCard
                  icon="chatbox-ellipses-outline"
                  label="Words"
                  value={sessionStats?.words_spoken || messageCount}
                  iconColor={COLORS.strand.vocabulary}
                  delay={100}
                />
                <StatCard
                  icon="speedometer-outline"
                  label="Speed"
                  value={sessionStats?.speaking_speed_wpm ? `${Math.round(sessionStats.speaking_speed_wpm)} wpm` : '-'}
                  iconColor={COLORS.strand.rhythm}
                  delay={200}
                />
                <StatCard
                  icon="book-outline"
                  label="Vocabulary"
                  value={sessionStats?.unique_vocabulary ? `${sessionStats.unique_vocabulary}` : '-'}
                  iconColor={COLORS.strand.learning}
                  delay={300}
                />
              </View>

              {/* Additional stats row */}
              {sessionStats && (
                <View style={[styles.statsGrid, { marginTop: 12 }]}>
                  <StatCard
                    icon="swap-horizontal-outline"
                    label="Turns"
                    value={sessionStats.conversation_turns}
                    iconColor={COLORS.strand.confidence}
                    delay={400}
                  />
                  {sessionStats.grammar_score != null && (
                    <StatCard
                      icon="create-outline"
                      label="Grammar"
                      value={`${Math.round(sessionStats.grammar_score)}%`}
                      iconColor={COLORS.strand.accuracy}
                      delay={500}
                    />
                  )}
                  {sessionStats.fluency_score != null && (
                    <StatCard
                      icon="flash-outline"
                      label="Fluency"
                      value={`${Math.round(sessionStats.fluency_score)}%`}
                      iconColor={COLORS.strand.emotional}
                      delay={600}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Comparison with Previous Session */}
            {comparison && comparison.has_previous_session && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>VS PREVIOUS SESSION</Text>
                {comparison.words_improvement !== undefined && comparison.words_improvement !== 0 && (
                  <ComparisonBar
                    icon="💬"
                    label="Words Spoken"
                    value={`${comparison.words_improvement > 0 ? '+' : ''}${comparison.words_improvement}`}
                    isPositive={comparison.words_improvement > 0}
                    delay={0}
                    maxWidth={Math.min(Math.abs(comparison.words_improvement) * 2, 100)}
                  />
                )}
                {comparison.speed_improvement !== undefined && comparison.speed_improvement !== 0 && (
                  <ComparisonBar
                    icon="🚀"
                    label="Speaking Speed"
                    value={`${comparison.speed_improvement > 0 ? '+' : ''}${comparison.speed_improvement.toFixed(1)} wpm`}
                    isPositive={comparison.speed_improvement > 0}
                    delay={100}
                    maxWidth={Math.min(Math.abs(comparison.speed_improvement) * 5, 100)}
                  />
                )}
                {comparison.vocabulary_growth !== undefined && comparison.vocabulary_growth !== 0 && (
                  <ComparisonBar
                    icon="📚"
                    label="Vocabulary Growth"
                    value={`${comparison.vocabulary_growth > 0 ? '+' : ''}${comparison.vocabulary_growth}`}
                    isPositive={comparison.vocabulary_growth > 0}
                    delay={200}
                    maxWidth={Math.min(Math.abs(comparison.vocabulary_growth) * 3, 100)}
                  />
                )}
              </View>
            )}

            {/* Overall Progress */}
            {overallProgress && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>YOUR PROGRESS</Text>
                <View style={styles.progressGrid}>
                  <View style={styles.progressCard}>
                    <Ionicons name="checkmark-circle" size={32} color={COLORS.primary[500]} />
                    <Text style={styles.progressLabel}>Sessions</Text>
                    <Text style={styles.progressValue}>
                      {overallProgress.plan_total_sessions
                        ? `${overallProgress.plan_completed_sessions}/${overallProgress.plan_total_sessions}`
                        : overallProgress.total_sessions}
                    </Text>
                    {overallProgress.plan_progress_percentage && (
                      <Text style={styles.progressSubValue}>
                        {overallProgress.plan_progress_percentage.toFixed(0)}%
                      </Text>
                    )}
                  </View>
                  <View style={styles.progressCard}>
                    <Ionicons name="time" size={32} color={COLORS.warning} />
                    <Text style={styles.progressLabel}>Practice Time</Text>
                    <Text style={styles.progressValue}>
                      {Math.round(overallProgress.plan_total_minutes || overallProgress.total_minutes)}
                    </Text>
                    <Text style={styles.progressSubValue}>min</Text>
                  </View>
                  <View style={styles.progressCard}>
                    <Ionicons name="trophy" size={32} color={COLORS.error} />
                    <Text style={styles.progressLabel}>Best Streak</Text>
                    <Text style={styles.progressValue}>{overallProgress.longest_streak}</Text>
                    <Text style={styles.progressSubValue}>
                      day{overallProgress.longest_streak !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {hasAnalyses && (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onViewAnalysis();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="clipboard-outline" size={20} color={COLORS.white} />
                  <Text style={styles.primaryButtonText}>View Analysis</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, hasAnalyses ? styles.secondaryButton : styles.primaryButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onGoDashboard();
                }}
                activeOpacity={0.8}
              >
                <Text style={hasAnalyses ? styles.secondaryButtonText : styles.primaryButtonText}>
                  Go to Dashboard
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: COLORS.gray[300],
    width: 40,
    height: 4,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: `${COLORS.white}CC`,
    marginTop: 8,
    textAlign: 'center',
  },
  highlightsSection: {
    padding: 16,
  },
  highlightCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...SHADOWS.md,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray[700],
    lineHeight: 22,
    fontStyle: 'italic',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${COLORS.primary[500]}10`,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sessionHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[500],
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray[600],
    marginTop: 8,
    textAlign: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginTop: 4,
  },
  progressSubValue: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray[500],
    marginTop: 2,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    marginTop: 32,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[500],
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary[500],
  },
});

export default SessionSummaryBottomSheet;
