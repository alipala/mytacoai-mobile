import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LearningService } from '../api/generated';

interface CreateLearningPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (planData: { planId: string }) => void;
  language: string;
  recommendedLevel?: string;
  assessmentFocus?: string[];
  assessmentData?: any; // Full assessment result
}

interface MainGoal {
  id: string;
  text: string;
  category: string;
  icon: string;
  description: string;
  sub_goal_count?: number;
}

interface SubGoal {
  id: string;
  text: string;
  description: string;
  icon?: string;
  main_goal?: string;
}

type Step = 'goals' | 'subgoals' | 'duration' | 'creating';

export const CreateLearningPlanModal: React.FC<CreateLearningPlanModalProps> = ({
  visible,
  onClose,
  onCreate,
  language,
  recommendedLevel = 'intermediate',
  assessmentFocus = [],
  assessmentData,
}) => {
  const [step, setStep] = useState<Step>('goals');
  const [mainGoals, setMainGoals] = useState<MainGoal[]>([]);
  const [selectedMainGoal, setSelectedMainGoal] = useState<string | null>(null);
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [selectedSubGoals, setSelectedSubGoals] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('📋 CreateLearningPlanModal render - visible:', visible, 'step:', step);

  // Load enriched goals when modal opens
  useEffect(() => {
    if (visible && step === 'goals') {
      console.log('🚀 Modal opened, loading enriched goals...');
      loadEnrichedGoals();
    }
  }, [visible, step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      console.log('🔒 Modal closed, resetting state...');
      setStep('goals');
      setSelectedMainGoal(null);
      setSelectedSubGoals([]);
      setDuration(3);
      setError(null);
    }
  }, [visible]);

  const loadEnrichedGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📥 Fetching enriched goals...');

      const goals = await LearningService.getLearningGoalsApiLearningGoalsGet({
        enriched: true,
      });

      console.log('✅ Enriched goals loaded:', goals);
      setMainGoals(goals as MainGoal[]);
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ Error loading enriched goals:', err);
      setError('Failed to load learning goals');
      setIsLoading(false);
    }
  };

  const handleMainGoalSelect = async (goalId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedMainGoal(goalId);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📥 Fetching sub-goals for:', goalId);

      const subGoalsData = await LearningService.getSubGoalsApiLearningGoalsGoalIdSubGoalsGet({
        goalId,
      });

      console.log('✅ Sub-goals loaded:', subGoalsData);
      setSubGoals(subGoalsData as SubGoal[]);
      setStep('subgoals');
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ Error loading sub-goals:', err);
      setError('Failed to load sub-goals');
      setIsLoading(false);
    }
  };

  const handleSubGoalToggle = (subGoalId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedSubGoals((prev) => {
      if (prev.includes(subGoalId)) {
        return prev.filter((id) => id !== subGoalId);
      } else {
        // Limit to 3 sub-goals
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, subGoalId];
      }
    });
  };

  const handleCreatePlan = async () => {
    if (!selectedMainGoal) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setStep('creating');
    setIsLoading(true);

    try {
      const planData: any = {
        language,
        proficiency_level: recommendedLevel,
        goals: [selectedMainGoal],
        sub_goals: selectedSubGoals,
        duration_months: duration,
      };

      // Only include assessment_data if it exists (from speaking assessment)
      if (assessmentData) {
        planData.assessment_data = assessmentData;
      }

      console.log('📤 Creating plan with data:', planData);

      const plan = await LearningService.createLearningPlanApiLearningPlanPost({
        requestBody: planData,
      });

      console.log('✅ Plan created successfully:', plan.id);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Success!',
        'Your personalized learning plan has been created.',
        [
          {
            text: 'Great!',
            onPress: () => {
              onCreate({ planId: plan.id });
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('❌ Error creating plan:', err);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setError(err.message || 'Failed to create learning plan');
      setIsLoading(false);
      setStep('duration');

      Alert.alert(
        'Error',
        err.message || 'Failed to create learning plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (step === 'subgoals') {
      setStep('goals');
      setSelectedMainGoal(null);
      setSubGoals([]);
    } else if (step === 'duration') {
      setStep('subgoals');
      setSelectedSubGoals([]);
    }
  };

  const renderProgressSteps = () => {
    const steps = [
      { key: 'goals', label: 'Goal', number: 1 },
      { key: 'subgoals', label: 'Focus', number: 2 },
      { key: 'duration', label: 'Duration', number: 3 },
    ];

    return (
      <View style={styles.progressSteps}>
        {steps.map((s, index) => (
          <React.Fragment key={s.key}>
            <View
              style={[
                styles.stepCircle,
                (step === s.key || (s.key === 'duration' && step === 'creating')) &&
                  styles.stepCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (step === s.key || (s.key === 'duration' && step === 'creating')) &&
                    styles.stepNumberActive,
                ]}
              >
                {s.number}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#D1D5DB"
                style={styles.stepChevron}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Create Learning Plan</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            disabled={isLoading}
          >
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Subheader */}
        <View style={styles.subheader}>
          <Text style={styles.subheaderText}>
            {language.charAt(0).toUpperCase() + language.slice(1)} • Level: {recommendedLevel}
          </Text>
          {renderProgressSteps()}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Step 1: Main Goal Selection */}
          {step === 'goals' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>What's your main learning goal?</Text>
              <Text style={styles.stepSubtitle}>
                Choose the primary reason you're learning {language}
              </Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4FD1C5" />
                </View>
              ) : (
                <View style={styles.goalsContainer}>
                  {mainGoals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() => handleMainGoalSelect(goal.id)}
                      style={styles.goalCard}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.goalIcon}>{goal.icon}</Text>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>{goal.text}</Text>
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Step 2: Sub-Goals Selection */}
          {step === 'subgoals' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color="#4FD1C5" />
                <Text style={styles.backButtonText}>Back to goals</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>What specific areas to focus on?</Text>
              <Text style={styles.stepSubtitle}>
                Select up to 3 focus areas (optional - you can skip this step)
              </Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4FD1C5" />
                </View>
              ) : (
                <>
                  <View style={styles.subGoalsContainer}>
                    {subGoals.map((subGoal) => {
                      const isSelected = selectedSubGoals.includes(subGoal.id);
                      const isDisabled = !isSelected && selectedSubGoals.length >= 3;

                      return (
                        <TouchableOpacity
                          key={subGoal.id}
                          onPress={() => !isDisabled && handleSubGoalToggle(subGoal.id)}
                          disabled={isDisabled}
                          style={[
                            styles.subGoalCard,
                            isSelected && styles.subGoalCardSelected,
                            isDisabled && styles.subGoalCardDisabled,
                          ]}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            )}
                          </View>
                          <View style={styles.subGoalInfo}>
                            <Text style={styles.subGoalTitle}>{subGoal.text}</Text>
                            <Text style={styles.subGoalDescription}>
                              {subGoal.description}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.selectionCount}>
                      {selectedSubGoals.length} of 3 selected
                    </Text>
                    <TouchableOpacity
                      onPress={() => setStep('duration')}
                      style={styles.continueButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Step 3: Duration Selection */}
          {step === 'duration' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color="#4FD1C5" />
                <Text style={styles.backButtonText}>Back to focus areas</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>How long do you want to study?</Text>
              <Text style={styles.stepSubtitle}>
                Choose a duration that fits your schedule and goals
              </Text>

              <View style={styles.durationContainer}>
                {[1, 2, 3, 6].map((months) => (
                  <TouchableOpacity
                    key={months}
                    onPress={() => setDuration(months)}
                    style={[
                      styles.durationCard,
                      duration === months && styles.durationCardSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar"
                      size={32}
                      color={duration === months ? '#4FD1C5' : '#9CA3AF'}
                    />
                    <Text style={styles.durationNumber}>{months}</Text>
                    <Text style={styles.durationLabel}>
                      {months === 1 ? 'Month' : 'Months'}
                    </Text>
                    <Text style={styles.durationSessions}>
                      {months * 8} sessions
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Your Learning Plan Summary</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Language:</Text>
                  <Text style={styles.summaryValue}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Level:</Text>
                  <Text style={styles.summaryValue}>{recommendedLevel}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Main Goal:</Text>
                  <Text style={styles.summaryValue}>
                    {mainGoals.find((g) => g.id === selectedMainGoal)?.text}
                  </Text>
                </View>
                {selectedSubGoals.length > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Focus Areas:</Text>
                    <View style={styles.summarySubGoals}>
                      {selectedSubGoals.map((id) => {
                        const subGoal = subGoals.find((sg) => sg.id === id);
                        return (
                          <Text key={id} style={styles.summarySubGoalItem}>
                            • {subGoal?.text}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                )}
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Duration:</Text>
                  <Text style={styles.summaryValue}>{duration} months</Text>
                </View>
                <View style={[styles.summaryItem, styles.summaryItemHighlight]}>
                  <Text style={styles.summaryLabel}>Total Sessions:</Text>
                  <Text style={styles.summaryValueHighlight}>{duration * 8}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCreatePlan}
                disabled={isLoading}
                style={styles.createButton}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create My Learning Plan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 4: Creating */}
          {step === 'creating' && (
            <View style={styles.creatingContainer}>
              <View style={styles.creatingIconContainer}>
                <ActivityIndicator size="large" color="#4FD1C5" />
              </View>
              <Text style={styles.creatingTitle}>Creating Your Personalized Plan</Text>
              <Text style={styles.creatingSubtitle}>
                Our AI is analyzing your assessment results and crafting a customized
                learning journey just for you...
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subheaderText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#4FD1C5',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepChevron: {
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  stepContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#4FD1C5',
    marginLeft: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  subGoalsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  subGoalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subGoalCardSelected: {
    backgroundColor: '#E6FFFA',
    borderColor: '#4FD1C5',
  },
  subGoalCardDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#4FD1C5',
    borderColor: '#4FD1C5',
  },
  subGoalInfo: {
    flex: 1,
  },
  subGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subGoalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  durationCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationCardSelected: {
    backgroundColor: '#E6FFFA',
    borderColor: '#4FD1C5',
  },
  durationNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  durationSessions: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryItemHighlight: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summarySubGoals: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summarySubGoalItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4FD1C5',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  creatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  creatingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  creatingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  creatingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});
