import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuestAnalysisResponse } from '../../api/generated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GuestSessionResultsScreenProps {
  navigation: any;
  route: {
    params: {
      analysis: GuestAnalysisResponse;
    };
  };
}

type TabType = 'summary' | 'analysis' | 'flashcards' | 'insights';

const GuestSessionResultsScreen: React.FC<GuestSessionResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { analysis } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSignUp = () => {
    // Navigate to signup screen
    navigation.navigate('Welcome');
  };

  const handleFlipFlashcard = () => {
    const toValue = isFlashcardFlipped ? 0 : 180;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlashcardFlipped(!isFlashcardFlipped);
  };

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < analysis.flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setIsFlashcardFlipped(false);
      flipAnim.setValue(0);
    } else {
      setCurrentFlashcardIndex(0);
      setIsFlashcardFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const handlePreviousFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setIsFlashcardFlipped(false);
      flipAnim.setValue(0);
    } else {
      setCurrentFlashcardIndex(analysis.flashcards.length - 1);
      setIsFlashcardFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Summary Tab Content
  const renderSummaryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Session Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="chatbubbles-outline" size={24} color="#6366F1" />
          <Text style={styles.statValue}>{analysis.session_stats.total_messages}</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="text-outline" size={24} color="#10B981" />
          <Text style={styles.statValue}>{analysis.session_stats.user_words}</Text>
          <Text style={styles.statLabel}>Words Spoken</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer-outline" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{analysis.session_stats.speaking_speed_wpm}</Text>
          <Text style={styles.statLabel}>WPM</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{Math.round(analysis.session_stats.duration_minutes * 10) / 10}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      {/* AI Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="sparkles" size={20} color="#6366F1" />
          <Text style={styles.summaryTitle}>AI Summary</Text>
        </View>
        <Text style={styles.summaryText}>{analysis.session_summary}</Text>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaCard}>
        <Ionicons name="star" size={32} color="#FFD63A" />
        <Text style={styles.ctaTitle}>Love what you see?</Text>
        <Text style={styles.ctaText}>
          Sign up to save your progress, track your improvement, and unlock unlimited practice sessions!
        </Text>
      </View>
    </ScrollView>
  );

  // Analysis Tab Content
  const renderAnalysisTab = () => {
    if (analysis.background_analyses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
          <Text style={styles.emptyStateTitle}>Great job!</Text>
          <Text style={styles.emptyStateText}>
            Your sentences were well-formed. Keep up the excellent work!
          </Text>
        </View>
      );
    }

    const currentAnalysis = analysis.background_analyses[currentAnalysisIndex];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Header with pagination */}
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Sentence Analysis</Text>
          <Text style={styles.analysisPagination}>
            {currentAnalysisIndex + 1} of {analysis.background_analyses.length}
          </Text>
        </View>

        {/* Your Sentence */}
        <View style={styles.sentenceCard}>
          <Text style={styles.sentenceLabel}>Your Sentence</Text>
          <Text style={styles.sentenceText}>{currentAnalysis.recognized_text}</Text>
        </View>

        {/* Corrected Version (if different) */}
        {currentAnalysis.corrected_text !== currentAnalysis.recognized_text && (
          <View style={[styles.sentenceCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Text style={[styles.sentenceLabel, { color: '#166534' }]}>Corrected Version</Text>
            <Text style={[styles.sentenceText, { color: '#166534' }]}>{currentAnalysis.corrected_text}</Text>
          </View>
        )}

        {/* Quality Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Overall Score</Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${currentAnalysis.overall_score}%` },
                { backgroundColor: getScoreColor(currentAnalysis.overall_score) },
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>{currentAnalysis.overall_score}%</Text>
        </View>

        {/* Detailed Scores */}
        <View style={styles.detailedScoresCard}>
          <Text style={styles.cardTitle}>Detailed Breakdown</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>Grammar</Text>
            <Text style={styles.scoreRowValue}>{currentAnalysis.grammatical_score}%</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>Vocabulary</Text>
            <Text style={styles.scoreRowValue}>{currentAnalysis.vocabulary_score}%</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>Complexity</Text>
            <Text style={styles.scoreRowValue}>{currentAnalysis.complexity_score}%</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>Appropriateness</Text>
            <Text style={styles.scoreRowValue}>{currentAnalysis.appropriateness_score}%</Text>
          </View>
        </View>

        {/* Grammar Issues */}
        {currentAnalysis.grammar_issues.length > 0 && (
          <View style={styles.issuesCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.cardTitle}>Grammar Issues</Text>
            </View>
            {currentAnalysis.grammar_issues.map((grammarIssue, idx) => (
              <View key={idx} style={styles.issueItem}>
                <Text style={styles.issueLabel}>Issue:</Text>
                <Text style={styles.issueText}>{grammarIssue.issue}</Text>
                <Text style={styles.issueCorrectionLabel}>Correction:</Text>
                <Text style={styles.issueCorrectionText}>{grammarIssue.correction}</Text>
                {grammarIssue.explanation && (
                  <>
                    <Text style={styles.issueExplanationLabel}>Explanation:</Text>
                    <Text style={styles.issueExplanationText}>{grammarIssue.explanation}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Improvement Suggestions */}
        {currentAnalysis.improvement_suggestions && currentAnalysis.improvement_suggestions.length > 0 && (
          <View style={styles.explanationCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb-outline" size={20} color="#6366F1" />
              <Text style={styles.cardTitle}>Improvement Suggestions</Text>
            </View>
            {currentAnalysis.improvement_suggestions.map((suggestionItem, idx) => (
              <View key={idx} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>• {suggestionItem.suggestion}</Text>
                {suggestionItem.explanation && (
                  <Text style={styles.suggestionExplanation}>  {suggestionItem.explanation}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Level-Appropriate Alternatives */}
        {currentAnalysis.level_appropriate_alternatives && currentAnalysis.level_appropriate_alternatives.length > 0 && (
          <View style={styles.alternativesCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="repeat-outline" size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Alternative Ways to Say This</Text>
            </View>
            {currentAnalysis.level_appropriate_alternatives.map((altItem, idx) => (
              <View key={idx} style={styles.alternativeItem}>
                <Text style={styles.alternativeText}>✓ {altItem.alternative}</Text>
                {altItem.explanation && (
                  <Text style={styles.alternativeExplanation}>  {altItem.explanation}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Navigation */}
        {analysis.background_analyses.length > 1 && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                setCurrentAnalysisIndex(
                  currentAnalysisIndex > 0
                    ? currentAnalysisIndex - 1
                    : analysis.background_analyses.length - 1
                )
              }
            >
              <Ionicons name="chevron-back" size={24} color="#6366F1" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            <View style={styles.paginationDots}>
              {analysis.background_analyses.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentAnalysisIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                setCurrentAnalysisIndex(
                  currentAnalysisIndex < analysis.background_analyses.length - 1
                    ? currentAnalysisIndex + 1
                    : 0
                )
              }
            >
              <Text style={styles.navButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  // Flashcards Tab Content
  const renderFlashcardsTab = () => {
    if (analysis.flashcards.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={64} color="#8B5CF6" />
          <Text style={styles.emptyStateTitle}>No flashcards yet</Text>
          <Text style={styles.emptyStateText}>
            Complete more practice sessions to generate personalized flashcards!
          </Text>
        </View>
      );
    }

    const currentFlashcard = analysis.flashcards[currentFlashcardIndex];

    return (
      <View style={styles.flashcardContainer}>
        {/* Flashcard counter */}
        <View style={styles.flashcardHeader}>
          <Text style={styles.flashcardCounter}>
            Card {currentFlashcardIndex + 1} of {analysis.flashcards.length}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentFlashcard.difficulty) }]}>
            <Text style={styles.difficultyText}>{currentFlashcard.difficulty}</Text>
          </View>
        </View>

        {/* Flashcard */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFlipFlashcard}
          style={styles.flashcardTouchable}
        >
          <View style={styles.flashcard}>
            <Animated.View style={[styles.flashcardFront, frontAnimatedStyle]}>
              <Text style={styles.flashcardLabel}>Question</Text>
              <Text style={[styles.flashcardText, { color: '#1F2937' }]}>{currentFlashcard.front}</Text>
              <View style={styles.tapHint}>
                <Ionicons name="hand-left-outline" size={16} color="#9CA3AF" />
                <Text style={styles.tapHintText}>Tap to reveal answer</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.flashcardBack, backAnimatedStyle]}>
              <Text style={[styles.flashcardLabel, { color: '#E0E7FF' }]}>Answer</Text>
              <Text style={[styles.flashcardText, { color: '#FFFFFF' }]}>{currentFlashcard.back}</Text>
              {currentFlashcard.hint && (
                <View style={styles.hintContainer}>
                  <Ionicons name="bulb-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.hintText}>{currentFlashcard.hint}</Text>
                </View>
              )}
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Navigation */}
        <View style={styles.flashcardNavigation}>
          <TouchableOpacity
            style={styles.flashcardNavButton}
            onPress={handlePreviousFlashcard}
          >
            <Ionicons name="chevron-back-circle" size={40} color="#6366F1" />
          </TouchableOpacity>

          <View style={styles.paginationDots}>
            {analysis.flashcards.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentFlashcardIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.flashcardNavButton}
            onPress={handleNextFlashcard}
          >
            <Ionicons name="chevron-forward-circle" size={40} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.flashcardInfo}>
          Swipe through your personalized flashcards to reinforce learning
        </Text>
      </View>
    );
  };

  // Insights Tab Content
  const renderInsightsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Confidence Level */}
      <View style={styles.confidenceCard}>
        <View style={styles.confidenceHeader}>
          <Ionicons name="analytics-outline" size={24} color="#6366F1" />
          <Text style={styles.confidenceTitle}>Confidence Level</Text>
        </View>
        <Text style={styles.confidenceLevel}>{analysis.insights.confidence_level}</Text>
      </View>

      {/* Breakthrough Moments */}
      {analysis.insights.breakthrough_moments.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="trophy-outline" size={24} color="#10B981" />
            <Text style={styles.insightTitle}>Breakthrough Moments</Text>
          </View>
          {analysis.insights.breakthrough_moments.map((moment, idx) => (
            <View key={idx} style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.insightText}>{moment}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Struggle Points */}
      {analysis.insights.struggle_points.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="fitness-outline" size={24} color="#F59E0B" />
            <Text style={styles.insightTitle}>Areas to Improve</Text>
          </View>
          {analysis.insights.struggle_points.map((point, idx) => (
            <View key={idx} style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Ionicons name="arrow-up-circle" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.insightText}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Immediate Actions */}
      {analysis.insights.immediate_actions.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="flash-outline" size={24} color="#6366F1" />
            <Text style={styles.insightTitle}>Next Steps</Text>
          </View>
          {analysis.insights.immediate_actions.map((action, idx) => (
            <View key={idx} style={styles.actionItem}>
              <View style={styles.actionNumber}>
                <Text style={styles.actionNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Encouragement */}
      <View style={styles.encouragementCard}>
        <Ionicons name="heart" size={32} color="#EF4444" />
        <Text style={styles.encouragementText}>
          Keep practicing to unlock your full potential!
        </Text>
      </View>
    </ScrollView>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'a1':
      case 'a2':
        return '#10B981';
      case 'b1':
      case 'b2':
        return '#F59E0B';
      case 'c1':
      case 'c2':
        return '#EF4444';
      default:
        return '#6366F1';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Welcome')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Results</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => handleTabChange('summary')}
        >
          <Ionicons
            name="bar-chart-outline"
            size={20}
            color={activeTab === 'summary' ? '#6366F1' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => handleTabChange('analysis')}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={activeTab === 'analysis' ? '#6366F1' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
            Analysis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]}
          onPress={() => handleTabChange('flashcards')}
        >
          <Ionicons
            name="albums-outline"
            size={20}
            color={activeTab === 'flashcards' ? '#6366F1' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>
            Flashcards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => handleTabChange('insights')}
        >
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={activeTab === 'insights' ? '#6366F1' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'flashcards' && renderFlashcardsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </View>

      {/* Sign Up CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.signUpButtonText}>Sign Up to Save Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
  activeTabText: {
    color: '#6366F1',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  ctaCard: {
    backgroundColor: '#6366F1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  ctaText: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  analysisPagination: {
    fontSize: 14,
    color: '#6B7280',
  },
  sentenceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sentenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  sentenceText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailedScoresCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scoreRowLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  issuesCard: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  issueItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  issueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    marginBottom: 8,
  },
  issueCorrectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  issueCorrectionText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    marginBottom: 8,
  },
  issueExplanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  issueExplanationText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  explanationCard: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  explanationText: {
    fontSize: 14,
    color: '#3730A3',
    lineHeight: 20,
  },
  suggestionItem: {
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#3730A3',
    lineHeight: 20,
    fontWeight: '500',
  },
  suggestionExplanation: {
    fontSize: 13,
    color: '#6366F1',
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  alternativesCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  alternativeItem: {
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    fontWeight: '500',
  },
  alternativeExplanation: {
    fontSize: 13,
    color: '#10B981',
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  vocabularyCard: {
    backgroundColor: '#F5F3FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  vocabularyItem: {
    marginBottom: 8,
  },
  vocabularyText: {
    fontSize: 14,
    color: '#5B21B6',
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginHorizontal: 4,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#6366F1',
    width: 24,
  },
  flashcardContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  flashcardCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  flashcardTouchable: {
    flex: 1,
    marginBottom: 24,
  },
  flashcard: {
    flex: 1,
    position: 'relative',
  },
  flashcardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flashcardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flashcardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  flashcardText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  flashcardNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flashcardNavButton: {
    padding: 8,
  },
  flashcardInfo: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  confidenceCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  confidenceLevel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6366F1',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  encouragementCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  encouragementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 12,
    textAlign: 'center',
  },
  ctaContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GuestSessionResultsScreen;
