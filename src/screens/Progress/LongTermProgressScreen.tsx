/**
 * Long-Term Progress Screen
 *
 * Displays lifetime learning statistics and mastery progress
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useLifetimeProgress } from '../../hooks/useStats';

interface LanguageCardProps {
  language: string;
  stats: any;
  isExpanded: boolean;
  onToggle: () => void;
}

function LanguageCard({ language, stats, isExpanded, onToggle }: LanguageCardProps) {
  const languageEmojis: Record<string, string> = {
    english: '🇬🇧',
    spanish: '🇪🇸',
    dutch: '🇳🇱',
    german: '🇩🇪',
    french: '🇫🇷',
    portuguese: '🇵🇹',
  };

  const emoji = languageEmojis[language.toLowerCase()] || '🌍';
  const displayName = language.charAt(0).toUpperCase() + language.slice(1);

  // Calculate completion percentage
  const completionPercent = Math.round(
    (stats.challenges / Math.max(stats.challenges + 10, 1)) * 100
  );

  // Render mastery stars
  const renderStars = (level: string, mastery: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= mastery ? '⭐' : '☆'}
        </Text>
      );
    }
    return (
      <View style={styles.levelRow}>
        <Text style={styles.levelLabel}>{level}</Text>
        <View style={styles.starsContainer}>{stars}</View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.languageCard}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.languageGradient}
      >
        {/* Header */}
        <View style={styles.languageHeader}>
          <View style={styles.languageHeaderLeft}>
            <Text style={styles.languageEmoji}>{emoji}</Text>
            <View>
              <Text style={styles.languageName}>{displayName}</Text>
              <Text style={styles.languageSubtitle}>
                {stats.challenges} challenges · {Math.round(stats.accuracy)}% accuracy
              </Text>
            </View>
          </View>
          <View style={styles.languageProgress}>
            <AnimatedCircularProgress
              size={60}
              width={6}
              fill={completionPercent}
              tintColor="#06B6D4"
              backgroundColor="#E5E7EB"
              rotation={0}
            >
              {() => (
                <Text style={styles.progressText}>{completionPercent}%</Text>
              )}
            </AnimatedCircularProgress>
          </View>
        </View>

        {/* Expandable Content */}
        {isExpanded && (
          <View style={styles.languageDetails}>
            <View style={styles.divider} />
            <Text style={styles.detailsTitle}>CEFR Level Mastery</Text>
            {Object.entries(stats.by_level || {}).map(([level, levelStats]: [string, any]) => (
              <View key={level}>
                {renderStars(level, levelStats.mastery || 0)}
                <Text style={styles.levelStats}>
                  {levelStats.challenges} challenges · {Math.round(levelStats.accuracy)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Expand/Collapse Indicator */}
        <Text style={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function LongTermProgressScreen() {
  const { lifetime, isLoading, error, refetchLifetime } = useLifetimeProgress(false, true);
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

  const handleRefresh = async () => {
    await refetchLifetime(true);
  };

  const toggleLanguage = (language: string) => {
    setExpandedLanguage(expandedLanguage === language ? null : language);
  };

  // Format time invested
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Error state
  if (error && !lifetime) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📊</Text>
          <Text style={styles.errorTitle}>Unable to Load Progress</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading && !lifetime) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06B6D4" />
          <Text style={styles.loadingText}>Loading your learning journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (!lifetime || lifetime.total_challenges === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={styles.emptyTitle}>Your Journey Starts Here!</Text>
          <Text style={styles.emptyMessage}>
            Complete your first challenge to start tracking your progress
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Learning Journey</Text>
          <Text style={styles.headerSubtitle}>
            Member since {new Date(lifetime.member_since).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#06B6D4', '#0891B2']}
              style={styles.statGradient}
            >
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{lifetime.total_challenges}</Text>
              <Text style={styles.statLabel}>Total Challenges</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.statGradient}
            >
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={styles.statValue}>{lifetime.total_xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.statGradient}
            >
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{formatTime(lifetime.total_time_seconds)}</Text>
              <Text style={styles.statLabel}>Time Invested</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statGradient}
            >
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{lifetime.current_streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaks</Text>
          <View style={styles.streaksRow}>
            <View style={styles.streakBox}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakValue}>{lifetime.current_streak}</Text>
              <Text style={styles.streakLabel}>Current</Text>
            </View>
            <View style={styles.streakBox}>
              <Text style={styles.streakEmoji}>🏆</Text>
              <Text style={styles.streakValue}>{lifetime.longest_streak}</Text>
              <Text style={styles.streakLabel}>Longest</Text>
            </View>
          </View>
        </View>

        {/* Language Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Progress</Text>
          {Object.entries(lifetime.by_language).map(([language, stats]) => (
            <LanguageCard
              key={language}
              language={language}
              stats={stats}
              isExpanded={expandedLanguage === language}
              onToggle={() => toggleLanguage(language)}
            />
          ))}
        </View>

        {/* Challenge Type Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Strengths</Text>
          <View style={styles.typeGrid}>
            {Object.entries(lifetime.by_type).map(([type, stats]: [string, any]) => {
              const formatTypeName = (t: string) =>
                t
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

              const getTypeEmoji = (t: string) => {
                const emojis: Record<string, string> = {
                  error_spotting: '🔍',
                  swipe_fix: '👆',
                  micro_quiz: '❓',
                  smart_flashcard: '🎴',
                  native_check: '✅',
                  brain_tickler: '🧠',
                };
                return emojis[t] || '📝';
              };

              return (
                <View key={type} style={styles.typeCard}>
                  <Text style={styles.typeEmoji}>{getTypeEmoji(type)}</Text>
                  <Text style={styles.typeName}>{formatTypeName(type)}</Text>
                  <Text style={styles.typeValue}>{stats.challenges}</Text>
                  <Text style={styles.typeAccuracy}>{Math.round(stats.accuracy)}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Learning Recommendations */}
        {lifetime.recommendations && lifetime.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {lifetime.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Text style={styles.recommendationText}>💡 {rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Milestones */}
        {lifetime.next_milestones && lifetime.next_milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
            {lifetime.next_milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneCard}>
                <Text style={styles.milestoneEmoji}>🎯</Text>
                <Text style={styles.milestoneText}>{milestone}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streaksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  streakEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  languageCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  languageGradient: {
    padding: 16,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  languageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  languageProgress: {
    marginLeft: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06B6D4',
  },
  languageDetails: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginLeft: 2,
  },
  levelStats: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
  },
  expandArrow: {
    textAlign: 'center',
    fontSize: 12,
    color: '#06B6D4',
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  typeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#06B6D4',
    marginBottom: 2,
  },
  typeAccuracy: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  milestoneCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  milestoneEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  milestoneText: {
    fontSize: 14,
    color: '#0C4A6E',
    fontWeight: '600',
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});
