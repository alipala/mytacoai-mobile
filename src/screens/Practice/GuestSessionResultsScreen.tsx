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
    // Navigate directly to signup/login screen
    navigation.navigate('Login');
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
          <Ionicons name="chatbubbles-outline" size={20} color="#6366F1" />
          <Text style={styles.statValue}>{analysis.session_stats.total_messages}</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="text-outline" size={20} color="#10B981" />
          <Text style={styles.statValue}>{analysis.session_stats.user_words}</Text>
          <Text style={styles.statLabel}>Words Spoken</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer-outline" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{analysis.session_stats.speaking_speed_wpm}</Text>
          <Text style={styles.statLabel}>WPM</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={20} color="#8B5CF6" />
          <Text style={styles.statValue}>{Math.round(analysis.session_stats.duration_minutes * 10) / 10}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      {/* AI Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="sparkles" size={20} color="#6366F1" />
          <Text style={styles.summaryTitle}>MyTaco AI Summary</Text>
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

    // Filter out empty suggestions and alternatives
    const validSuggestions = currentAnalysis.improvement_suggestions?.filter(
      s => s.suggestion && s.suggestion.trim().length > 0
    ) || [];

    const validAlternatives = currentAnalysis.level_appropriate_alternatives?.filter(
      a => a.alternative && a.alternative.trim().length > 0
    ) || [];

    const validGrammarIssues = currentAnalysis.grammar_issues?.filter(
      g => g.issue && g.issue.trim().length > 0
    ) || [];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <View style={styles.modernAnalysisHeader}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {currentAnalysisIndex + 1} / {analysis.background_analyses.length}
            </Text>
          </View>
        </View>

        {/* Sentence Comparison Card */}
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonSection}>
            <View style={styles.comparisonHeader}>
              <Ionicons name="mic-outline" size={16} color="#6B7280" />
              <Text style={styles.comparisonLabel}>What you said</Text>
            </View>
            <Text style={styles.comparisonText}>{currentAnalysis.recognized_text}</Text>
          </View>

          {currentAnalysis.corrected_text !== currentAnalysis.recognized_text && (
            <>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={20} color="#10B981" />
              </View>
              <View style={[styles.comparisonSection, styles.correctedSection]}>
                <View style={styles.comparisonHeader}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                  <Text style={[styles.comparisonLabel, { color: '#10B981' }]}>Corrected version</Text>
                </View>
                <Text style={[styles.comparisonText, { color: '#166534' }]}>{currentAnalysis.corrected_text}</Text>
              </View>
            </>
          )}
        </View>

        {/* Compact Score Grid */}
        <View style={styles.compactScoreGrid}>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.overall_score}%</Text>
            <Text style={styles.scoreGridLabel}>Overall</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: getScoreColor(currentAnalysis.overall_score) }]}
                  opacity={currentAnalysis.overall_score / 100} />
          </View>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.grammatical_score}%</Text>
            <Text style={styles.scoreGridLabel}>Grammar</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: '#6366F1' }]}
                  opacity={currentAnalysis.grammatical_score / 100} />
          </View>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.vocabulary_score}%</Text>
            <Text style={styles.scoreGridLabel}>Vocabulary</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: '#8B5CF6' }]}
                  opacity={currentAnalysis.vocabulary_score / 100} />
          </View>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.appropriateness_score}%</Text>
            <Text style={styles.scoreGridLabel}>Natural</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: '#14B8A6' }]}
                  opacity={currentAnalysis.appropriateness_score / 100} />
          </View>
        </View>

        {/* Feedback Sections - Only show if has content */}
        {validGrammarIssues.length > 0 && (
          <View style={styles.modernFeedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.feedbackIconContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
              </View>
              <Text style={styles.feedbackTitle}>Grammar Issues</Text>
            </View>
            {validGrammarIssues.map((grammarIssue, idx) => (
              <View key={idx} style={styles.modernIssueItem}>
                <View style={styles.issueTopRow}>
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text style={styles.modernIssueText}>{grammarIssue.issue}</Text>
                </View>
                <View style={styles.issueCorrectionRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.modernCorrectionText}>{grammarIssue.correction}</Text>
                </View>
                {grammarIssue.explanation && (
                  <Text style={styles.modernExplanation}>{grammarIssue.explanation}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {validSuggestions.length > 0 && (
          <View style={styles.modernFeedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.feedbackIconContainer}>
                <Ionicons name="bulb" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.feedbackTitle}>How to Improve</Text>
            </View>
            {validSuggestions.map((suggestionItem, idx) => (
              <View key={idx} style={styles.modernSuggestionItem}>
                <Text style={styles.modernSuggestionText}>{suggestionItem.suggestion}</Text>
                {suggestionItem.explanation && (
                  <Text style={styles.modernExplanation}>{suggestionItem.explanation}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {validAlternatives.length > 0 && (
          <View style={styles.modernFeedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.feedbackIconContainer}>
                <Ionicons name="repeat" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.feedbackTitle}>Better Ways to Say This</Text>
            </View>
            {validAlternatives.map((altItem, idx) => (
              <View key={idx} style={styles.modernAlternativeItem}>
                <Text style={styles.modernAlternativeText}>{altItem.alternative}</Text>
                {altItem.explanation && (
                  <Text style={styles.modernExplanation}>{altItem.explanation}</Text>
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
              <Text style={[styles.flashcardLabel, { color: '#000000', textTransform: 'uppercase', letterSpacing: 1.5 }]}>Question</Text>
              <Text style={[styles.flashcardText, { color: '#000000' }]}>{currentFlashcard.front}</Text>
              <View style={styles.tapHint}>
                <Ionicons name="hand-left-outline" size={16} color="#000000" />
                <Text style={[styles.tapHintText, { color: '#000000' }]}>Tap to reveal answer</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.flashcardBack, backAnimatedStyle]}>
              <Text style={[styles.flashcardLabel, { color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1.5 }]}>Answer</Text>
              <Text style={[styles.flashcardText, { color: '#FFFFFF' }]}>{currentFlashcard.back}</Text>
              {currentFlashcard.explanation && (
                <View style={styles.explanationContainer}>
                  <Ionicons name="information-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.explanationFlashcardText}>{currentFlashcard.explanation}</Text>
                </View>
              )}
              {getHintText(currentFlashcard.hint) && (
                <View style={styles.hintContainer}>
                  <Ionicons name="bulb-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.hintText}>{getHintText(currentFlashcard.hint)}</Text>
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
            <Ionicons name="chevron-back-circle" size={40} color="#14B8A6" />
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
            <Ionicons name="chevron-forward-circle" size={40} color="#14B8A6" />
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

  const getHintText = (hint: string | { issue: string; correction: string; explanation: string } | undefined): string | null => {
    if (!hint) return null;

    // If it's already a string, return it
    if (typeof hint === 'string') {
      return hint;
    }

    // If it's a grammar issue object, extract the issue text
    if (typeof hint === 'object' && 'issue' in hint) {
      return hint.issue || hint.explanation || 'Check the grammar';
    }

    return null;
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
        <View style={{ width: 40 }} />
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
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
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
    height: 320,
    marginBottom: 24,
  },
  flashcard: {
    height: '100%',
    position: 'relative',
  },
  flashcardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD63A',
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
    backgroundColor: '#4ECFBF',
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
    color: '#000000',
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
  explanationContainer: {
    position: 'absolute',
    bottom: 64,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  explanationFlashcardText: {
    fontSize: 11,
    color: '#E0E7FF',
    flex: 1,
    lineHeight: 16,
    fontStyle: 'italic',
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
  // Modern Analysis Tab Styles
  modernAnalysisHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  comparisonSection: {
    paddingVertical: 12,
  },
  correctedSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937',
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactScoreGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  scoreGridItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  scoreGridValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  scoreGridLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  scoreGridBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  modernFeedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  feedbackIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  modernIssueItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  issueTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  issueCorrectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  modernIssueText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#EF4444',
    fontWeight: '500',
  },
  modernCorrectionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#10B981',
    fontWeight: '500',
  },
  modernExplanation: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modernSuggestionItem: {
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  modernSuggestionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  modernAlternativeItem: {
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  modernAlternativeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default GuestSessionResultsScreen;
