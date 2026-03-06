import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SessionStats, SessionComparison, OverallProgress } from '../types/progressStats';
import { styles } from './styles/SessionSummaryModal.styles';

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
  const [currentAnalyzingStep, setCurrentAnalyzingStep] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Analyzing steps to cycle through
  const analyzingSteps = [
    { icon: 'document-text', text: `Analyzing ${sentenceCount} sentence${sentenceCount !== 1 ? 's' : ''}...`, color: '#6366F1' },
    { icon: 'sparkles', text: 'Generating session summary...', color: '#8B5CF6' },
    { icon: 'albums', text: 'Creating flashcards...', color: '#EC4899' },
    { icon: 'bulb', text: 'Generating insights...', color: '#F59E0B' },
  ];

  // Rotation animation for analyzing icon
  useEffect(() => {
    if (stage === 'analyzing') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [stage]);

  // Pulse animation for analyzing icon
  useEffect(() => {
    if (stage === 'analyzing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [stage]);

  // Cycle through analyzing steps
  useEffect(() => {
    if (stage === 'analyzing') {
      const interval = setInterval(() => {
        setCurrentAnalyzingStep((prev) => (prev + 1) % analyzingSteps.length);
      }, 2000); // Change step every 2 seconds
      return () => clearInterval(interval);
    } else {
      setCurrentAnalyzingStep(0);
    }
  }, [stage, analyzingSteps.length]);

  // Confetti removed for cleaner UX

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
          iconType: 'emoji',
        };
      case 'analyzing':
        const currentStep = analyzingSteps[currentAnalyzingStep];
        return {
          icon: currentStep.icon,
          title: 'Analyzing Your Session',
          subtitle: currentStep.text,
          color: currentStep.color,
          iconType: 'animated',
        };
      case 'finalizing':
        return {
          icon: '✨',
          title: 'Finalizing Your Session...',
          subtitle: 'Almost done',
          color: '#FFD63A',
          iconType: 'emoji',
        };
      case 'success':
        return {
          icon: '🎉',
          title: 'Session Summary',
          subtitle: '',
          color: '#4ECFBF',
          iconType: 'emoji',
        };
      default:
        return {
          icon: '💾',
          title: 'Saving...',
          subtitle: 'Please wait',
          color: '#4ECFBF',
          iconType: 'emoji',
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
          {/* Confetti removed for cleaner UX */}

          {/* Header */}
          <View style={[styles.header, { backgroundColor: config.color }]}>
            {stage !== 'success' && (
              config.iconType === 'animated' ? (
                <Animated.View
                  style={[
                    styles.animatedIconContainer,
                    {
                      transform: [
                        {
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })
                        },
                        { scale: pulseAnim }
                      ],
                    },
                  ]}
                >
                  <Ionicons name={config.icon as any} size={64} color="#FFFFFF" />
                </Animated.View>
              ) : (
                <Text style={styles.icon}>{config.icon}</Text>
              )
            )}
            <Text style={styles.title}>{config.title}</Text>
            {config.subtitle !== '' && <Text style={styles.subtitle}>{config.subtitle}</Text>}
          </View>

          {/* Progress Bar - only show during processing, hide on success */}
          {stage !== 'success' && (
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
          )}

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Analysis Info Banner - show during processing */}
            {stage !== 'success' && (
              <View style={styles.infoContainer}>
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="information-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.infoTitle}>Your Analysis is in Progress</Text>
                  </View>
                  <Text style={styles.infoText}>
                    You will be notified by your language coach when your detailed sentence analysis is ready.
                  </Text>
                  <View style={styles.infoFooter}>
                    <Ionicons name="chatbubble-ellipses" size={14} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={styles.infoFooterText}>
                      You can also find it in your Language Coach chat
                    </Text>
                  </View>
                </View>
              </View>
            )}

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
                      <StatCard icon="timer-outline" label="Duration" value={duration} backgroundColor="#14B8A6" />
                      <StatCard icon="chatbox-ellipses-outline" label="Words Spoken" value={sessionStats.words_spoken.toString()} backgroundColor="#8B5CF6" />
                      <StatCard icon="speedometer-outline" label="Speaking Speed" value={`${Math.round(sessionStats.speaking_speed_wpm)} wpm`} backgroundColor="#F59E0B" />
                      <StatCard icon="book-outline" label="Vocabulary" value={`${sessionStats.unique_vocabulary} unique`} backgroundColor="#10B981" />
                      <StatCard icon="swap-horizontal-outline" label="Turns" value={sessionStats.conversation_turns.toString()} backgroundColor="#3B82F6" />
                      {sessionStats.grammar_score !== null && sessionStats.grammar_score !== undefined && (
                        <StatCard icon="create-outline" label="Grammar" value={`${Math.round(sessionStats.grammar_score)}%`} backgroundColor="#EC4899" />
                      )}
                      {sessionStats.fluency_score !== null && sessionStats.fluency_score !== undefined && (
                        <StatCard icon="flash-outline" label="Fluency" value={`${Math.round(sessionStats.fluency_score)}%`} backgroundColor="#EF4444" />
                      )}
                      <StatCard icon="analytics-outline" label="Analyzed" value={sentenceCount.toString()} backgroundColor="#6366F1" />
                    </View>
                  </>
                ) : (
                  <View style={styles.statsContainer}>
                    <StatCard icon="📊" label="Duration" value={duration} backgroundColor="#14B8A6" />
                    <StatCard icon="💬" label="Messages" value={messageCount.toString()} backgroundColor="#8B5CF6" />
                    <StatCard icon="🎯" label="Analyzed" value={sentenceCount.toString()} backgroundColor="#6366F1" />
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
                        iconColor="#FFFFFF"
                        label="Sessions"
                        value={overallProgress.plan_total_sessions
                          ? `${overallProgress.plan_completed_sessions}/${overallProgress.plan_total_sessions}`
                          : overallProgress.total_sessions.toString()}
                        subValue={overallProgress.plan_progress_percentage
                          ? `${overallProgress.plan_progress_percentage.toFixed(0)}%`
                          : undefined}
                        backgroundColor="#14B8A6"
                      />
                      <ProgressStatItemCompact
                        icon="time"
                        iconColor="#FFFFFF"
                        label={overallProgress.plan_total_minutes ? "Plan Time" : "Practice Time"}
                        value={`${Math.round(overallProgress.plan_total_minutes || overallProgress.total_minutes)}`}
                        subValue="min"
                        backgroundColor="#F59E0B"
                      />
                      <ProgressStatItemCompact
                        icon="trophy"
                        iconColor="#FFFFFF"
                        label="Best Streak"
                        value={`${overallProgress.longest_streak}`}
                        subValue={`day${overallProgress.longest_streak !== 1 ? 's' : ''}`}
                        backgroundColor="#EF4444"
                      />
                    </View>
                  </>
                )}

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onGoDashboard}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
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

// Stat Card Component with colorful background
const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  backgroundColor?: string;
}> = ({
  icon,
  label,
  value,
  iconColor = '#FFFFFF', // White icons on colored backgrounds
  backgroundColor = '#14B8A6', // Default teal background
}) => {
  // Check if icon is an Ionicon name or emoji
  const isIonicon = icon.includes('-');

  return (
    <View style={[styles.statCard, { backgroundColor }]}>
      {isIonicon ? (
        <Ionicons name={icon as any} size={22} color={iconColor} style={styles.statIcon} />
      ) : (
        <Text style={styles.statIcon}>{icon}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

// Comparison Card Component with colorful background
const ComparisonCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  isPositive: boolean;
}> = ({ icon, label, value, isPositive }) => {
  // Green for positive improvements, Red for negative
  const backgroundColor = isPositive ? '#10B981' : '#EF4444';

  // Map emoji icons to Ionicons
  const getIconName = () => {
    if (icon === '📈' || icon === '📉') return 'trending-up';
    if (icon === '🚀' || icon === '🐌') return 'speedometer';
    if (icon === '📚' || icon === '📖') return 'book';
    return 'trending-up'; // fallback
  };

  return (
    <View style={[styles.comparisonCard, { backgroundColor }]}>
      <Ionicons name={getIconName() as any} size={24} color="#FFFFFF" style={styles.comparisonIconComponent} />
      <Text style={styles.comparisonLabel}>{label}</Text>
      <Text style={[styles.comparisonValue, isPositive ? styles.positiveValue : styles.negativeValue]}>
        {value}
      </Text>
    </View>
  );
};

// Compact Progress Stat Item Component (3-column layout) with colorful background
const ProgressStatItemCompact: React.FC<{
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  backgroundColor?: string;
}> = ({ icon, iconColor, label, value, subValue, backgroundColor = '#14B8A6' }) => {
  return (
    <View style={[styles.progressStatItemCompact, { backgroundColor }]}>
      <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      <Text style={styles.progressStatLabel}>{label}</Text>
      <Text style={styles.progressStatValueCompact}>{value}</Text>
      {subValue && <Text style={styles.progressStatSubValueCompact}>{subValue}</Text>}
    </View>
  );
};

export default SessionSummaryModal;
