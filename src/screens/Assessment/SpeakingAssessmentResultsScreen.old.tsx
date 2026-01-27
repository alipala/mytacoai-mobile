import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RadarChart } from '../../components/RadarChart';
import type { SpeakingAssessmentResponse } from '../../api/generated';
import { CreateLearningPlanModal } from '../../components/CreateLearningPlanModal';

interface SpeakingAssessmentResultsScreenProps {
  navigation: any;
  route: any;
}

const SpeakingAssessmentResultsScreen: React.FC<SpeakingAssessmentResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { language, topicName, assessmentResult } = route.params;
  const result: SpeakingAssessmentResponse = assessmentResult;

  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  const handleSaveAndProceed = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowCreatePlanModal(true);
  };

  const handleCreatePlan = async (planData: { planId: string }) => {
    // The modal has created the plan
    setShowCreatePlanModal(false);

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    console.log('✅ Learning plan created:', planData.planId);

    // Navigate to Main dashboard
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  const handleGoToDashboard = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  // Prepare radar chart data
  const radarData = [
    result.pronunciation.score,
    result.grammar.score,
    result.vocabulary.score,
    result.fluency.score,
    result.coherence.score,
  ];

  const radarLabels = ['Pronunciation', 'Grammar', 'Vocabulary', 'Fluency', 'Coherence'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Assessment Results</Text>
        <TouchableOpacity
          onPress={handleGoToDashboard}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Score Section */}
        <View style={styles.overallScoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.overallScoreText}>{result.overall_score}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          <Text style={styles.scoreLabel}>{getScoreLabel(result.overall_score)}</Text>
          <Text style={styles.recommendedLevel}>
            Recommended Level: <Text style={styles.levelText}>{result.recommended_level}</Text>
          </Text>
          <View style={styles.confidenceBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#4FD1C5" />
            <Text style={styles.confidenceText}>
              {Math.round(result.confidence)}% Confidence
            </Text>
          </View>
        </View>

        {/* Radar Chart - Skills Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Assessment</Text>
          <View style={styles.radarContainer}>
            <RadarChart
              data={radarData}
              labels={radarLabels}
              size={280}
              color="#4FD1C5"
            />
          </View>

          {/* Skills Legend */}
          <View style={styles.legendContainer}>
            {[
              { label: 'Pronunciation', score: result.pronunciation.score, icon: 'mic-outline' },
              { label: 'Grammar', score: result.grammar.score, icon: 'create-outline' },
              { label: 'Vocabulary', score: result.vocabulary.score, icon: 'book-outline' },
              { label: 'Fluency', score: result.fluency.score, icon: 'speedometer-outline' },
              { label: 'Coherence', score: result.coherence.score, icon: 'git-network-outline' },
            ].map((skill, index) => (
              <View key={index} style={styles.legendItem}>
                <Ionicons name={skill.icon as any} size={16} color="#4FD1C5" />
                <Text style={styles.legendLabel}>{skill.label}</Text>
                <View style={[styles.legendScore, { backgroundColor: getScoreColor(skill.score) + '20' }]}>
                  <Text style={[styles.legendScoreText, { color: getScoreColor(skill.score) }]}>
                    {skill.score}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recognized Text - Compact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Said</Text>
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptText}>{result.recognized_text}</Text>
          </View>
        </View>

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Strengths</Text>
          <View style={styles.listContainer}>
            {result.strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.strengthIcon}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Areas for Improvement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          <View style={styles.listContainer}>
            {result.areas_for_improvement.map((area, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.improvementIcon}>
                  <Ionicons name="trending-up" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.listText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          <View style={styles.listContainer}>
            {result.next_steps.map((step, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleSaveAndProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>Save & Proceed</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Create Learning Plan Modal */}
      <CreateLearningPlanModal
        visible={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onCreate={handleCreatePlan}
        language={language}
        recommendedLevel={result.recommended_level}
        assessmentFocus={result.areas_for_improvement}
        assessmentData={assessmentResult}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  overallScoreContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 32,
    marginBottom: 32,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#4FD1C5',
  },
  overallScoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreOutOf: {
    fontSize: 16,
    color: '#6B7280',
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recommendedLevel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  levelText: {
    fontWeight: '600',
    color: '#4FD1C5',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  confidenceText: {
    fontSize: 14,
    color: '#4FD1C5',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  transcriptContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  transcriptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  radarContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 16,
  },
  legendContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  legendScore: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  legendScoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  strengthIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  improvementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4FD1C5',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  proceedButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SpeakingAssessmentResultsScreen;
