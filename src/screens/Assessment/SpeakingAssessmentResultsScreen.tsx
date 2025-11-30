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
import type { SpeakingAssessmentResponse, SkillScore } from '../../api/generated';
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

  const handleCreatePlan = async (planData: { topic: string; focus: string; duration: string }) => {
    // The modal will handle creating the plan
    // After the plan is created, navigate to dashboard
    setShowCreatePlanModal(false);

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

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

  const renderSkillCard = (title: string, skill: SkillScore, icon: string) => (
    <View style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <View style={styles.skillTitleContainer}>
          <Ionicons name={icon as any} size={20} color="#4FD1C5" />
          <Text style={styles.skillTitle}>{title}</Text>
        </View>
        <View style={[styles.scoreChip, { backgroundColor: getScoreColor(skill.score) + '20' }]}>
          <Text style={[styles.scoreChipText, { color: getScoreColor(skill.score) }]}>
            {skill.score}/100
          </Text>
        </View>
      </View>
      <Text style={styles.skillFeedback}>{skill.feedback}</Text>
      {skill.examples && skill.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          {skill.examples.map((example, index) => (
            <View key={index} style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.exampleText}>{example}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

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
              {Math.round(result.confidence * 100)}% Confidence
            </Text>
          </View>
        </View>

        {/* Recognized Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Said</Text>
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptText}>{result.recognized_text}</Text>
          </View>
        </View>

        {/* Skills Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Assessment</Text>
          {renderSkillCard('Pronunciation', result.pronunciation, 'mic-outline')}
          {renderSkillCard('Grammar', result.grammar, 'create-outline')}
          {renderSkillCard('Vocabulary', result.vocabulary, 'book-outline')}
          {renderSkillCard('Fluency', result.fluency, 'speedometer-outline')}
          {renderSkillCard('Coherence', result.coherence, 'git-network-outline')}
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
  skillCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  scoreChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillFeedback: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  examplesContainer: {
    gap: 6,
    marginTop: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
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
