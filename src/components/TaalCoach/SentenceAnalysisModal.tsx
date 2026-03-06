/**
 * Sentence Analysis Modal - Modal Wrapper for Sentence Analysis
 * ==============================================================
 * Modal version of SentenceAnalysisScreen for displaying sentence
 * analysis from TaalCoach chat interface.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BackgroundAnalysisResponse } from '../../api/generated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SentenceAnalysisModalProps {
  visible: boolean;
  analyses: BackgroundAnalysisResponse[];
  onClose: () => void;
}

export const SentenceAnalysisModal: React.FC<SentenceAnalysisModalProps> = ({
  visible,
  analyses,
  onClose,
}) => {
  const { t } = useTranslation();
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

  const currentAnalysis = analyses[currentAnalysisIndex];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#FFD63A'; // Yellow
    if (score >= 60) return '#FFA955'; // Orange
    return '#EF4444'; // Red
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
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
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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
                    backgroundColor="#10B981"
                  />
                  <ScoreCard
                    label={t('practice.analysis.label_vocabulary')}
                    score={currentAnalysis.vocabulary_score}
                    color={getScoreColor(currentAnalysis.vocabulary_score)}
                    backgroundColor="#8B5CF6"
                  />
                  <ScoreCard
                    label={t('practice.analysis.label_complexity')}
                    score={currentAnalysis.complexity_score}
                    color={getScoreColor(currentAnalysis.complexity_score)}
                    backgroundColor="#3B82F6"
                  />
                  <ScoreCard
                    label={t('practice.analysis.label_overall')}
                    score={currentAnalysis.overall_score}
                    color={getScoreColor(currentAnalysis.overall_score)}
                    backgroundColor="#EC4899"
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
                        <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
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
                      <Ionicons name="bulb-outline" size={22} color="#FFFFFF" />
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
      </View>
    </Modal>
  );
};

// Score Card Component with colorful background
const ScoreCard: React.FC<{ label: string; score: number; color: string; backgroundColor: string }> = ({
  label,
  score,
  color,
  backgroundColor,
}) => {
  return (
    <View style={[styles.scoreCard, { backgroundColor }]}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{Math.round(score)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  closeButton: {
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
    fontWeight: '700',
    color: '#FFFFFF', // White for section titles
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sentenceCard: {
    backgroundColor: '#6366F1', // Vibrant indigo
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sentenceText: {
    fontSize: 16,
    color: '#FFFFFF', // White text
    lineHeight: 24,
    fontWeight: '500',
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 18,
    flex: 1,
    minWidth: (SCREEN_WIDTH - 56) / 2, // Account for padding and gap
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)', // White on colored background
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF', // White
  },
  issueCard: {
    backgroundColor: '#EF4444', // Vibrant red
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF', // White on red background
    flex: 1,
  },
  issueCorrection: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)', // White
    marginBottom: 4,
  },
  issueLabel: {
    fontWeight: '700',
    color: '#FFFFFF', // White
  },
  issueExplanation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)', // Light white
    fontStyle: 'italic',
  },
  suggestionCard: {
    backgroundColor: '#F59E0B', // Vibrant orange
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#FFFFFF', // White on orange background
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  alternativeCard: {
    backgroundColor: '#10B981', // Vibrant green
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  alternativeText: {
    fontSize: 14,
    color: '#FFFFFF', // White on green background
    lineHeight: 20,
    fontWeight: '500',
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

export default SentenceAnalysisModal;
