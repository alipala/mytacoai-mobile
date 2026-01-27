import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { SpeakingAssessmentResponse } from '../../api/generated';
import { CreateLearningPlanModal } from '../../components/CreateLearningPlanModal';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSaveAndProceed = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowCreatePlanModal(true);
  };

  const handleCreatePlan = async (planData: { planId: string }) => {
    setShowCreatePlanModal(false);

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    console.log('✅ Learning plan created:', planData.planId);
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

  const getGradientColors = (score: number): string[] => {
    if (score >= 80) return ['#10B981', '#059669'];
    if (score >= 60) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  const skills = [
    { label: 'Pronunciation', score: result.pronunciation.score, icon: 'mic-outline', feedback: result.pronunciation.feedback },
    { label: 'Grammar', score: result.grammar.score, icon: 'create-outline', feedback: result.grammar.feedback },
    { label: 'Vocabulary', score: result.vocabulary.score, icon: 'book-outline', feedback: result.vocabulary.feedback },
    { label: 'Fluency', score: result.fluency.score, icon: 'speedometer-outline', feedback: result.fluency.feedback },
    { label: 'Coherence', score: result.coherence.score, icon: 'git-network-outline', feedback: result.coherence.feedback },
  ];

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Overview Tab
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Hero Section with Score */}
      <LinearGradient
        colors={getGradientColors(result.overall_score)}
        style={styles.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.scoreCircleWhite}>
          <Text style={styles.overallScoreText}>{result.overall_score}</Text>
          <Text style={styles.scoreOutOf}>/100</Text>
        </View>
        <Text style={styles.scoreLabel}>{getScoreLabel(result.overall_score)}</Text>
        <Text style={styles.recommendedLevel}>
          Recommended Level: <Text style={styles.levelText}>{result.recommended_level}</Text>
        </Text>
      </LinearGradient>

      {/* Skills Grid */}
      <View style={styles.skillsGrid}>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillCard}>
            <View style={[styles.skillIconContainer, { backgroundColor: getScoreColor(skill.score) + '20' }]}>
              <Ionicons name={skill.icon as any} size={24} color={getScoreColor(skill.score)} />
            </View>
            <Text style={styles.skillLabel}>{skill.label}</Text>
            <Text style={[styles.skillScore, { color: getScoreColor(skill.score) }]}>
              {skill.score}
            </Text>
          </View>
        ))}
      </View>

      {/* Transcript Card */}
      <View style={styles.transcriptCard}>
        <View style={styles.transcriptHeader}>
          <Ionicons name="chatbubble-outline" size={20} color="#4FD1C5" />
          <Text style={styles.transcriptTitle}>What You Said</Text>
        </View>
        <Text style={styles.transcriptText}>{result.recognized_text}</Text>
      </View>
    </View>
  );

  // Skills Detail Tab
  const renderSkillsDetail = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Skills Breakdown</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillDetailCard}>
            <View style={styles.skillDetailHeader}>
              <View style={[styles.skillIconContainer, { backgroundColor: getScoreColor(skill.score) + '20' }]}>
                <Ionicons name={skill.icon as any} size={24} color={getScoreColor(skill.score)} />
              </View>
              <View style={styles.skillDetailInfo}>
                <Text style={styles.skillDetailLabel}>{skill.label}</Text>
                <View style={styles.skillDetailScoreContainer}>
                  <View style={styles.skillDetailScoreBar}>
                    <View
                      style={[
                        styles.skillDetailScoreFill,
                        {
                          width: `${skill.score}%`,
                          backgroundColor: getScoreColor(skill.score),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.skillDetailScoreText, { color: getScoreColor(skill.score) }]}>
                    {skill.score}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.skillFeedback}>{skill.feedback}</Text>
            {skill.examples && skill.examples.length > 0 && (
              <View style={styles.examplesContainer}>
                {skill.examples.map((example, i) => (
                  <View key={i} style={styles.exampleItem}>
                    <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Action Plan Tab
  const renderActionPlan = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Your Action Plan</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Strengths */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.actionSectionTitle}>Your Strengths</Text>
          </View>
          {result.strengths.map((strength, index) => (
            <View key={index} style={styles.actionItem}>
              <View style={styles.strengthBullet} />
              <Text style={styles.actionText}>{strength}</Text>
            </View>
          ))}
        </View>

        {/* Areas for Improvement */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <Ionicons name="trending-up" size={24} color="#3B82F6" />
            <Text style={styles.actionSectionTitle}>Areas to Improve</Text>
          </View>
          {result.areas_for_improvement.map((area, index) => (
            <View key={index} style={styles.actionItem}>
              <View style={styles.improvementBullet} />
              <Text style={styles.actionText}>{area}</Text>
            </View>
          ))}
        </View>

        {/* Next Steps */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <Ionicons name="footsteps" size={24} color="#10B981" />
            <Text style={styles.actionSectionTitle}>Next Steps</Text>
          </View>
          {result.next_steps.map((step, index) => (
            <View key={index} style={styles.actionItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.actionText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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

      {/* Tab Navigator */}
      <View style={styles.tabNavigator}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.tabButtonActive]}
          onPress={() => handleTabPress(0)}
        >
          <Ionicons
            name="analytics-outline"
            size={20}
            color={activeTab === 0 ? '#4FD1C5' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 0 && styles.tabButtonTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.tabButtonActive]}
          onPress={() => handleTabPress(1)}
        >
          <Ionicons
            name="bar-chart-outline"
            size={20}
            color={activeTab === 1 ? '#4FD1C5' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 1 && styles.tabButtonTextActive]}>
            Skills
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 2 && styles.tabButtonActive]}
          onPress={() => handleTabPress(2)}
        >
          <Ionicons
            name="clipboard-outline"
            size={20}
            color={activeTab === 2 ? '#4FD1C5' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 2 && styles.tabButtonTextActive]}>
            Plan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveTab(newIndex);
        }}
        style={styles.tabScroll}
      >
        <View style={styles.tabPage}>{renderOverview()}</View>
        <View style={styles.tabPage}>{renderSkillsDetail()}</View>
        <View style={styles.tabPage}>{renderActionPlan()}</View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleSaveAndProceed}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4FD1C5', '#38B2AC']}
            style={styles.proceedButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.proceedButtonText}>Create Learning Plan</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
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
  tabNavigator: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#E6FFFA',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabButtonTextActive: {
    color: '#4FD1C5',
  },
  tabScroll: {
    flex: 1,
  },
  tabPage: {
    width: SCREEN_WIDTH,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  heroGradient: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircleWhite: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  overallScoreText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreOutOf: {
    fontSize: 18,
    color: '#6B7280',
  },
  scoreLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendedLevel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  levelText: {
    fontWeight: '700',
    fontSize: 18,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  skillCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  skillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  skillScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  transcriptCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transcriptText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  skillDetailCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  skillDetailInfo: {
    flex: 1,
  },
  skillDetailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  skillDetailScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillDetailScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillDetailScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillDetailScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  skillFeedback: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  examplesContainer: {
    marginTop: 12,
    gap: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 8,
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionSection: {
    marginBottom: 24,
  },
  actionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  actionSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  strengthBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  improvementBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 6,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4FD1C5',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  proceedButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  proceedButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
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
