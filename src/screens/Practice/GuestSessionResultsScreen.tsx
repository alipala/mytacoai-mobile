import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { styles, SCREEN_WIDTH } from './styles/GuestSessionResultsScreen.styles';

interface GuestSessionResultsScreenProps {
  navigation: any;
  route: {
    params: {
      analysis: any;
    };
  };
}

type TabType = 'summary' | 'analysis' | 'flashcards' | 'insights';

const GuestSessionResultsScreen: React.FC<GuestSessionResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
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
          <Text style={styles.statLabel}>{t('practice.results.stat_messages')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="text-outline" size={20} color="#10B981" />
          <Text style={styles.statValue}>{analysis.session_stats.user_words}</Text>
          <Text style={styles.statLabel}>{t('practice.results.stat_words_spoken')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer-outline" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{analysis.session_stats.speaking_speed_wpm}</Text>
          <Text style={styles.statLabel}>{t('practice.results.stat_wpm')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={20} color="#8B5CF6" />
          <Text style={styles.statValue}>{Math.round(analysis.session_stats.duration_minutes * 10) / 10}</Text>
          <Text style={styles.statLabel}>{t('practice.results.stat_minutes')}</Text>
        </View>
      </View>

      {/* AI Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="sparkles" size={20} color="#6366F1" />
          <Text style={styles.summaryTitle}>{t('practice.results.ai_summary_title')}</Text>
        </View>
        <Text style={styles.summaryText}>{analysis.session_summary}</Text>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaCard}>
        <Ionicons name="star" size={32} color="#FFD63A" />
        <Text style={styles.ctaTitle}>{t('practice.results.cta_title')}</Text>
        <Text style={styles.ctaText}>
          {t('practice.results.cta_text')}
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
          <Text style={styles.emptyStateTitle}>{t('practice.results.empty_analysis_title')}</Text>
          <Text style={styles.emptyStateText}>
            {t('practice.results.empty_analysis_text')}
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
              <Text style={styles.comparisonLabel}>{t('practice.results.label_what_you_said')}</Text>
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
                  <Text style={[styles.comparisonLabel, { color: '#10B981' }]}>{t('practice.results.label_corrected_version')}</Text>
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
            <Text style={styles.scoreGridLabel}>{t('practice.results.label_overall')}</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: getScoreColor(currentAnalysis.overall_score) }]}
                  opacity={currentAnalysis.overall_score / 100} />
          </View>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.grammatical_score}%</Text>
            <Text style={styles.scoreGridLabel}>{t('practice.results.label_grammar')}</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: '#6366F1' }]}
                  opacity={currentAnalysis.grammatical_score / 100} />
          </View>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.vocabulary_score}%</Text>
            <Text style={styles.scoreGridLabel}>{t('practice.results.label_vocabulary')}</Text>
            <View style={[styles.scoreGridBar, { backgroundColor: '#8B5CF6' }]}
                  opacity={currentAnalysis.vocabulary_score / 100} />
          </View>
          <View style={styles.scoreGridItem}>
            <Text style={styles.scoreGridValue}>{currentAnalysis.appropriateness_score}%</Text>
            <Text style={styles.scoreGridLabel}>{t('practice.results.label_natural')}</Text>
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
              <Text style={styles.feedbackTitle}>{t('practice.results.section_grammar_issues')}</Text>
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
              <Text style={styles.feedbackTitle}>{t('practice.results.section_how_to_improve')}</Text>
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
              <Text style={styles.feedbackTitle}>{t('practice.results.section_better_ways')}</Text>
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
              <Text style={styles.navButtonText}>{t('practice.results.button_previous')}</Text>
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
              <Text style={styles.navButtonText}>{t('practice.results.button_next')}</Text>
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
          <Text style={styles.emptyStateTitle}>{t('practice.results.empty_flashcards_title')}</Text>
          <Text style={styles.emptyStateText}>
            {t('practice.results.empty_flashcards_text')}
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
            {t('practice.results.flashcard_count', { current: currentFlashcardIndex + 1, total: analysis.flashcards.length })}
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
              <Text style={[styles.flashcardLabel, { color: '#000000', textTransform: 'uppercase', letterSpacing: 1.5 }]}>{t('practice.results.flashcard_question')}</Text>
              <Text style={[styles.flashcardText, { color: '#000000' }]}>{currentFlashcard.front}</Text>
              <View style={styles.tapHint}>
                <Ionicons name="hand-left-outline" size={16} color="#000000" />
                <Text style={[styles.tapHintText, { color: '#000000' }]}>{t('practice.results.flashcard_tap_hint')}</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.flashcardBack, backAnimatedStyle]}>
              <Text style={[styles.flashcardLabel, { color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1.5 }]}>{t('practice.results.flashcard_answer')}</Text>
              <Text style={[styles.flashcardText, { color: '#FFFFFF' }]}>{currentFlashcard.back}</Text>
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
          {t('practice.results.flashcard_info')}
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
          <Text style={styles.confidenceTitle}>{t('practice.results.insight_confidence')}</Text>
        </View>
        <Text style={styles.confidenceLevel}>{analysis.insights.confidence_level}</Text>
      </View>

      {/* Breakthrough Moments */}
      {analysis.insights.breakthrough_moments.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="trophy-outline" size={24} color="#10B981" />
            <Text style={styles.insightTitle}>{t('practice.results.insight_breakthrough')}</Text>
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
            <Text style={styles.insightTitle}>{t('practice.results.insight_struggle')}</Text>
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
            <Text style={styles.insightTitle}>{t('practice.results.insight_next_steps')}</Text>
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
          {t('practice.results.encouragement')}
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
        <Text style={styles.headerTitle}>{t('practice.results.title')}</Text>
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
            {t('practice.results.tab_summary')}
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
            {t('practice.results.tab_analysis')}
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
            {t('practice.results.tab_flashcards')}
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
            {t('practice.results.tab_insights')}
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
          <Text style={styles.signUpButtonText}>{t('practice.results.button_signup')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GuestSessionResultsScreen;
