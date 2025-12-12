import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SessionStats, SessionComparison, OverallProgress } from '../types/progressStats';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type SavingStage = 'saving' | 'analyzing' | 'finalizing' | 'success';

interface SessionSummaryModalProps {
  visible: boolean;
  stage: SavingStage;
  sentenceCount: number;
  conversationHighlights: string[];
  duration: string;
  messageCount: number;
  onComplete: () => void;
  onViewAnalysis: () => void;
  onGoDashboard: () => void;
  // New progress tracking props
  sessionStats?: SessionStats;
  comparison?: SessionComparison;
  overallProgress?: OverallProgress;
  // Analysis availability
  hasAnalyses?: boolean;
}

const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
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
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));
  const confettiRef = useRef<any>(null);

  // Trigger confetti with delay when success stage is reached
  useEffect(() => {
    if (stage === 'success' && confettiRef.current) {
      console.log('[SESSION_MODAL] 🎉 Success stage reached - triggering confetti');
      // Delay confetti by 300ms to ensure modal is visible
      const timer = setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Rotate conversation highlights
  useEffect(() => {
    if (conversationHighlights.length > 0 && stage !== 'success') {
      const interval = setInterval(() => {
        setCurrentHighlightIndex((prev) => (prev + 1) % conversationHighlights.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [conversationHighlights.length, stage]);

  // Animate progress bar
  useEffect(() => {
    const progress = getStageProgress();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [stage]);

  const getStageProgress = () => {
    switch (stage) {
      case 'saving':
        return 33;
      case 'analyzing':
        return 66;
      case 'finalizing':
        return 90;
      case 'success':
        return 100;
      default:
        return 0;
    }
  };

  const getStageConfig = () => {
    switch (stage) {
      case 'saving':
        return {
          icon: '💾',
          title: 'Saving Your Conversation...',
          subtitle: 'Preserving your progress',
          color: '#FFA955',
        };
      case 'analyzing':
        return {
          icon: '🔍',
          title: 'Analyzing Your Speech...',
          subtitle: `Processing ${sentenceCount} sentences`,
          color: '#4ECFBF',
        };
      case 'finalizing':
        return {
          icon: '✨',
          title: 'Finalizing Your Session...',
          subtitle: 'Almost done',
          color: '#FFD63A',
        };
      case 'success':
        return {
          icon: '🎉',
          title: 'Session Summary',
          subtitle: '',
          color: '#4ECFBF',
        };
      default:
        return {
          icon: '💾',
          title: 'Saving...',
          subtitle: 'Please wait',
          color: '#4ECFBF',
        };
    }
  };

  const config = getStageConfig();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={stage === 'success' ? onComplete : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Confetti Animation - render inside modal container */}
          {stage === 'success' && (
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{x: SCREEN_WIDTH / 2, y: -100}}
              autoStart={false}
              fadeOut={true}
              fallSpeed={2500}
            />
          )}

          {/* Header */}
          <View style={[styles.header, { backgroundColor: config.color }]}>
            {stage !== 'success' && <Text style={styles.icon}>{config.icon}</Text>}
            <Text style={styles.title}>{config.title}</Text>
            {config.subtitle !== '' && <Text style={styles.subtitle}>{config.subtitle}</Text>}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Conversation Highlights - show during processing */}
            {stage !== 'success' && conversationHighlights.length > 0 && (
              <View style={styles.highlightsContainer}>
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightText}>
                    "{conversationHighlights[currentHighlightIndex]}"
                  </Text>
                </View>
              </View>
            )}

            {/* Success Stats */}
            {stage === 'success' && (
              <>
                {/* Learning Plan Session Header */}
                {sessionStats?.week_focus && (
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionSubtitle} numberOfLines={2}>
                      Week {sessionStats.week_number}: {sessionStats.week_focus}
                    </Text>
                  </View>
                )}

                {/* Session Statistics */}
                {sessionStats ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>SESSION STATS</Text>
                    </View>
                    <View style={styles.statsGrid}>
                      <StatCard icon="timer-outline" label="Duration" value={duration} iconColor="#4ECFBF" />
                      <StatCard icon="chatbox-ellipses-outline" label="Words Spoken" value={sessionStats.words_spoken.toString()} iconColor="#8B5CF6" />
                      <StatCard icon="speedometer-outline" label="Speaking Speed" value={`${Math.round(sessionStats.speaking_speed_wpm)} wpm`} iconColor="#F59E0B" />
                      <StatCard icon="book-outline" label="Vocabulary" value={`${sessionStats.unique_vocabulary} unique`} iconColor="#10B981" />
                      <StatCard icon="swap-horizontal-outline" label="Turns" value={sessionStats.conversation_turns.toString()} iconColor="#3B82F6" />
                      {sessionStats.grammar_score !== null && sessionStats.grammar_score !== undefined && (
                        <StatCard icon="create-outline" label="Grammar" value={`${Math.round(sessionStats.grammar_score)}%`} iconColor="#EC4899" />
                      )}
                      {sessionStats.fluency_score !== null && sessionStats.fluency_score !== undefined && (
                        <StatCard icon="flash-outline" label="Fluency" value={`${Math.round(sessionStats.fluency_score)}%`} iconColor="#EF4444" />
                      )}
                      <StatCard icon="analytics-outline" label="Analyzed" value={sentenceCount.toString()} iconColor="#6366F1" />
                    </View>
                  </>
                ) : (
                  <View style={styles.statsContainer}>
                    <StatCard icon="📊" label="Duration" value={duration} />
                    <StatCard icon="💬" label="Messages" value={messageCount.toString()} />
                    <StatCard icon="🎯" label="Analyzed" value={sentenceCount.toString()} />
                  </View>
                )}

                {/* Comparison Stats */}
                {comparison && comparison.has_previous_session && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>VS PREVIOUS SESSION</Text>
                    </View>
                    <View style={styles.comparisonContainer}>
                      {comparison.words_improvement !== undefined && comparison.words_improvement !== 0 && (
                        <ComparisonCard
                          icon={comparison.words_improvement > 0 ? '📈' : '📉'}
                          label="Words"
                          value={`${comparison.words_improvement > 0 ? '+' : ''}${comparison.words_improvement}`}
                          isPositive={comparison.words_improvement > 0}
                        />
                      )}
                      {comparison.speed_improvement !== undefined && comparison.speed_improvement !== 0 && (
                        <ComparisonCard
                          icon={comparison.speed_improvement > 0 ? '🚀' : '🐌'}
                          label="Speed"
                          value={`${comparison.speed_improvement > 0 ? '+' : ''}${comparison.speed_improvement.toFixed(1)} wpm`}
                          isPositive={comparison.speed_improvement > 0}
                        />
                      )}
                      {comparison.vocabulary_growth !== undefined && comparison.vocabulary_growth !== 0 && (
                        <ComparisonCard
                          icon={comparison.vocabulary_growth > 0 ? '📚' : '📖'}
                          label="Vocabulary"
                          value={`${comparison.vocabulary_growth > 0 ? '+' : ''}${comparison.vocabulary_growth}`}
                          isPositive={comparison.vocabulary_growth > 0}
                        />
                      )}
                    </View>
                  </>
                )}

                {/* Overall Progress */}
                {overallProgress && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>YOUR PROGRESS</Text>
                    </View>
                    <View style={styles.progressStatsGrid}>
                      <ProgressStatItemCompact
                        icon="checkmark-circle"
                        iconColor="#4ECFBF"
                        label="Sessions"
                        value={overallProgress.plan_total_sessions
                          ? `${overallProgress.plan_completed_sessions}/${overallProgress.plan_total_sessions}`
                          : overallProgress.total_sessions.toString()}
                        subValue={overallProgress.plan_progress_percentage
                          ? `${overallProgress.plan_progress_percentage.toFixed(0)}%`
                          : undefined}
                      />
                      <ProgressStatItemCompact
                        icon="time"
                        iconColor="#F59E0B"
                        label="Total Time"
                        value={`${Math.round(overallProgress.total_minutes)}`}
                        subValue="min"
                      />
                      <ProgressStatItemCompact
                        icon="trophy"
                        iconColor="#EF4444"
                        label="Best Streak"
                        value={`${overallProgress.longest_streak}`}
                        subValue={`day${overallProgress.longest_streak !== 1 ? 's' : ''}`}
                      />
                    </View>
                  </>
                )}

                <View style={styles.buttonsContainer}>
                  {hasAnalyses && (
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={onViewAnalysis}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="clipboard-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>View Analysis</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={hasAnalyses ? styles.secondaryButton : styles.primaryButton}
                    onPress={onGoDashboard}
                    activeOpacity={0.8}
                  >
                    <Text style={hasAnalyses ? styles.secondaryButtonText : styles.primaryButtonText}>
                      Go Dashboard
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}> = ({
  icon,
  label,
  value,
  iconColor = '#4ECFBF',
}) => {
  // Check if icon is an Ionicon name or emoji
  const isIonicon = icon.includes('-');

  return (
    <View style={styles.statCard}>
      {isIonicon ? (
        <Ionicons name={icon as any} size={28} color={iconColor} style={styles.statIcon} />
      ) : (
        <Text style={styles.statIcon}>{icon}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

// Comparison Card Component
const ComparisonCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  isPositive: boolean;
}> = ({ icon, label, value, isPositive }) => {
  return (
    <View style={styles.comparisonCard}>
      <Text style={styles.comparisonIcon}>{icon}</Text>
      <Text style={styles.comparisonLabel}>{label}</Text>
      <Text style={[styles.comparisonValue, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {value}
      </Text>
    </View>
  );
};

// Compact Progress Stat Item Component (3-column layout)
const ProgressStatItemCompact: React.FC<{
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
}> = ({ icon, iconColor, label, value, subValue }) => {
  return (
    <View style={styles.progressStatItemCompact}>
      <Ionicons name={icon as any} size={32} color={iconColor} />
      <Text style={styles.progressStatLabel}>{label}</Text>
      <Text style={styles.progressStatValueCompact}>{value}</Text>
      {subValue && <Text style={styles.progressStatSubValueCompact}>{subValue}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  highlightsContainer: {
    marginBottom: 24,
  },
  highlightCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.3)',
  },
  highlightText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    minWidth: '30%',
    marginBottom: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4ECFBF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  // New styles for progress tracking
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  comparisonCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
    marginBottom: 8,
  },
  comparisonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  positiveValue: {
    color: '#10B981',
  },
  negativeValue: {
    color: '#EF4444',
  },
  progressStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 12,
  },
  progressStatItemCompact: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  progressStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressStatValueCompact: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  progressStatSubValueCompact: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default SessionSummaryModal;
