import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BackgroundAnalysisResponse } from '../../api/generated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SentenceAnalysisScreenProps {
  navigation: any;
  route: {
    params: {
      analyses: BackgroundAnalysisResponse[];
      sessionSummary?: string;
      duration?: string;
      messageCount?: number;
    };
  };
}

const SentenceAnalysisScreen: React.FC<SentenceAnalysisScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { analyses, sessionSummary, duration, messageCount } = route.params;
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

  const currentAnalysis = analyses[currentAnalysisIndex];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#FFD63A'; // Yellow
    if (score >= 60) return '#FFA955'; // Orange
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return t('practice.analysis.label_excellent');
    if (score >= 75) return t('practice.analysis.label_good');
    if (score >= 60) return t('practice.analysis.label_fair');
    return t('practice.analysis.label_needs_work');
  };

  const handlePrevious = () => {
    if (currentAnalysisIndex > 0) {
      setCurrentAnalysisIndex(currentAnalysisIndex - 1);
    } else {
      setCurrentAnalysisIndex(analyses.length - 1);
    }
  };

  const handleNext = () => {
    if (currentAnalysisIndex < analyses.length - 1) {
      setCurrentAnalysisIndex(currentAnalysisIndex + 1);
    } else {
      setCurrentAnalysisIndex(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
          })}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('practice.analysis.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('practice.analysis.subtitle', { current: currentAnalysisIndex + 1, total: analyses.length })}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
          })}
          style={styles.homeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Session Summary (if available) */}
      {sessionSummary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="document-text-outline" size={20} color="#14B8A6" />
            <Text style={styles.summaryTitle}>{t('practice.analysis.section_summary')}</Text>
          </View>
          <Text style={styles.summaryText}>{sessionSummary}</Text>
          {(duration || messageCount) && (
            <View style={styles.summaryStats}>
              {duration && (
                <View style={styles.summaryStatItem}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.summaryStatText}>{duration}</Text>
                </View>
              )}
              {messageCount && (
                <View style={styles.summaryStatItem}>
                  <Ionicons name="chatbubbles-outline" size={16} color="#6B7280" />
                  <Text style={styles.summaryStatText}>{t('practice.analysis.stat_messages', { count: messageCount })}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Analysis Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentAnalysis && (
          <>
            {/* Your Sentence */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('practice.analysis.section_sentence')}</Text>
              <View style={styles.sentenceCard}>
                <Text style={styles.sentenceText}>
                  {currentAnalysis.recognized_text}
                </Text>
              </View>
            </View>

            {/* Scores Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('practice.analysis.section_scores')}</Text>
              <View style={styles.scoresGrid}>
                <ScoreCard
                  label={t('practice.analysis.label_grammar')}
                  score={currentAnalysis.grammatical_score}
                  color={getScoreColor(currentAnalysis.grammatical_score)}
                />
                <ScoreCard
                  label={t('practice.analysis.label_vocabulary')}
                  score={currentAnalysis.vocabulary_score}
                  color={getScoreColor(currentAnalysis.vocabulary_score)}
                />
                <ScoreCard
                  label={t('practice.analysis.label_complexity')}
                  score={currentAnalysis.complexity_score}
                  color={getScoreColor(currentAnalysis.complexity_score)}
                />
                <ScoreCard
                  label={t('practice.analysis.label_overall')}
                  score={currentAnalysis.overall_score}
                  color={getScoreColor(currentAnalysis.overall_score)}
                />
              </View>
            </View>

            {/* Grammar Issues */}
            {currentAnalysis.grammar_issues.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('practice.analysis.section_grammar_issues')}</Text>
                {currentAnalysis.grammar_issues.map((issue: any, index: number) => (
                  <View key={index} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.issueTitle}>{issue.issue}</Text>
                    </View>
                    {issue.correction && (
                      <Text style={styles.issueCorrection}>
                        <Text style={styles.issueLabel}>{t('practice.analysis.label_correction')}</Text>
                        {issue.correction}
                      </Text>
                    )}
                    {issue.explanation && (
                      <Text style={styles.issueExplanation}>{issue.explanation}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Improvement Suggestions */}
            {currentAnalysis.improvement_suggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('practice.analysis.section_improvement_tips')}</Text>
                {currentAnalysis.improvement_suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionCard}>
                    <Ionicons name="bulb-outline" size={20} color="#FFD63A" />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Alternative Ways to Say This */}
            {currentAnalysis.level_appropriate_alternatives &&
              currentAnalysis.level_appropriate_alternatives.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('practice.analysis.section_alternatives')}</Text>
                  {currentAnalysis.level_appropriate_alternatives.map((alt, index) => (
                    <View key={index} style={styles.alternativeCard}>
                      <Text style={styles.alternativeText}>{alt}</Text>
                    </View>
                  ))}
                </View>
              )}
          </>
        )}
      </ScrollView>

      {/* Navigation Footer */}
      {analyses.length > 1 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#14B8A6" />
            <Text style={styles.navButtonText}>{t('practice.analysis.button_previous')}</Text>
          </TouchableOpacity>

          <View style={styles.pagination}>
            {analyses.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentAnalysisIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>{t('practice.analysis.button_next')}</Text>
            <Ionicons name="chevron-forward" size={24} color="#14B8A6" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// Score Card Component
const ScoreCard: React.FC<{ label: string; score: number; color: string }> = ({
  label,
  score,
  color,
}) => {
  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, { color }]}>{Math.round(score)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // Dark header
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  backButton: {
    padding: 8,
  },
  homeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF', // White text
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)', // Teal tinted dark
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  summaryText: {
    fontSize: 14,
    color: '#B4E4DD', // Light teal
    lineHeight: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  summaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryStatText: {
    fontSize: 12,
    color: '#9CA3AF', // Light gray
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6', // Teal for section titles
    marginBottom: 12,
  },
  sentenceCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark card
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  sentenceText: {
    fontSize: 16,
    color: '#FFFFFF', // White text
    lineHeight: 24,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark card
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: (SCREEN_WIDTH - 56) / 2, // Account for padding and gap
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  issueCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Red tinted dark
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FCA5A5', // Light red
    flex: 1,
  },
  issueCorrection: {
    fontSize: 14,
    color: '#D1D5DB', // Light gray
    marginBottom: 4,
  },
  issueLabel: {
    fontWeight: '600',
    color: '#FFFFFF', // White
  },
  issueExplanation: {
    fontSize: 13,
    color: '#9CA3AF', // Light gray
    fontStyle: 'italic',
  },
  suggestionCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark card
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  suggestionText: {
    fontSize: 14,
    color: '#D1D5DB', // Light gray
    flex: 1,
    lineHeight: 20,
  },
  alternativeCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)', // Teal tinted dark
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  alternativeText: {
    fontSize: 14,
    color: '#B4E4DD', // Light teal
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // Dark footer
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6', // Teal
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.5)', // Dark gray
  },
  paginationDotActive: {
    backgroundColor: '#14B8A6', // Teal
    width: 24,
  },
});

export default SentenceAnalysisScreen;
