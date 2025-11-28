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
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
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
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sentence Analysis</Text>
          <Text style={styles.headerSubtitle}>
            {currentAnalysisIndex + 1} of {analyses.length}
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
          <Ionicons name="home-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Session Summary (if available) */}
      {sessionSummary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="document-text-outline" size={20} color="#4ECFBF" />
            <Text style={styles.summaryTitle}>Session Summary</Text>
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
                  <Text style={styles.summaryStatText}>{messageCount} messages</Text>
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
              <Text style={styles.sectionTitle}>Your Sentence</Text>
              <View style={styles.sentenceCard}>
                <Text style={styles.sentenceText}>
                  {currentAnalysis.recognized_text}
                </Text>
              </View>
            </View>

            {/* Scores Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scores</Text>
              <View style={styles.scoresGrid}>
                <ScoreCard
                  label="Grammar"
                  score={currentAnalysis.grammatical_score}
                  color={getScoreColor(currentAnalysis.grammatical_score)}
                />
                <ScoreCard
                  label="Vocabulary"
                  score={currentAnalysis.vocabulary_score}
                  color={getScoreColor(currentAnalysis.vocabulary_score)}
                />
                <ScoreCard
                  label="Complexity"
                  score={currentAnalysis.complexity_score}
                  color={getScoreColor(currentAnalysis.complexity_score)}
                />
                <ScoreCard
                  label="Overall"
                  score={currentAnalysis.overall_score}
                  color={getScoreColor(currentAnalysis.overall_score)}
                />
              </View>
            </View>

            {/* Grammar Issues */}
            {currentAnalysis.grammar_issues.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Grammar Issues</Text>
                {currentAnalysis.grammar_issues.map((issue: any, index: number) => (
                  <View key={index} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.issueTitle}>{issue.issue}</Text>
                    </View>
                    {issue.correction && (
                      <Text style={styles.issueCorrection}>
                        <Text style={styles.issueLabel}>Correction: </Text>
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
                <Text style={styles.sectionTitle}>Improvement Tips</Text>
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
                  <Text style={styles.sectionTitle}>Alternative Ways to Say This</Text>
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
            <Ionicons name="chevron-back" size={24} color="#4ECFBF" />
            <Text style={styles.navButtonText}>Previous</Text>
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
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color="#4ECFBF" />
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.3)',
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
    color: '#1F2937',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
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
    color: '#6B7280',
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
    color: '#F75A5A',
    marginBottom: 12,
  },
  sentenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sentenceText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: (SCREEN_WIDTH - 56) / 2, // Account for padding and gap
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  issueCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
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
    color: '#991B1B',
    flex: 1,
  },
  issueCorrection: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  issueLabel: {
    fontWeight: '600',
    color: '#1F2937',
  },
  issueExplanation: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  alternativeCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.3)',
  },
  alternativeText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    color: '#4ECFBF',
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    backgroundColor: '#4ECFBF',
    width: 24,
  },
});

export default SentenceAnalysisScreen;
