import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LearningService } from '../api/generated';
import { styles } from './styles/CreateLearningPlanModal.styles';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import flag SVGs as components
import PortugueseFlag from '../assets/flags/portuguese.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import DutchFlag from '../assets/flags/dutch.svg';
import EnglishFlag from '../assets/flags/english.svg';

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

type Step = 'goals' | 'subgoals' | 'duration' | 'creating' | 'success';

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
  const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  console.log('📋 CreateLearningPlanModal render - visible:', visible, 'step:', step);

  // Get flag component based on language
  const getFlagComponent = () => {
    const lang = language.toLowerCase();
    switch (lang) {
      case 'portuguese':
        return PortugueseFlag;
      case 'spanish':
        return SpanishFlag;
      case 'french':
        return FrenchFlag;
      case 'german':
        return GermanFlag;
      case 'dutch':
        return DutchFlag;
      case 'english':
        return EnglishFlag;
      default:
        return null;
    }
  };

  // Get flag glow color based on language
  const getFlagGlowColor = () => {
    const lang = language.toLowerCase();
    switch (lang) {
      case 'portuguese':
        return '#D52B1E'; // Red from Portuguese flag
      case 'spanish':
        return '#F1BF00'; // Yellow from Spanish flag
      case 'french':
        return '#0055A4'; // Blue from French flag
      case 'german':
        return '#FFCE00'; // Gold from German flag
      case 'dutch':
        return '#FF4500'; // Orange from Dutch flag
      case 'english':
        return '#C8102E'; // Red from English flag
      default:
        return '#14B8A6'; // Teal fallback
    }
  };

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
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    }
  }, [visible]);

  // Animate step transitions
  useEffect(() => {
    if (visible && (step === 'goals' || step === 'subgoals' || step === 'duration')) {
      // Slide and fade in animation
      slideAnim.setValue(50);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step, visible]);

  const loadEnrichedGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📥 Fetching enriched goals...');

      const goals = await LearningService.getLearningGoalsApiLearningGoalsGet(true);

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

      const subGoalsData = await LearningService.getSubGoalsApiLearningGoalsGoalIdSubGoalsGet(goalId);

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

      const plan = await LearningService.createLearningPlanApiLearningPlanPost(planData);

      console.log('✅ Plan created successfully:', plan.id);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Show success modal
      setCreatedPlanId(plan.id);
      setStep('success');
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

    const getCurrentStepIndex = () => {
      if (step === 'goals') return 0;
      if (step === 'subgoals') return 1;
      if (step === 'duration' || step === 'creating') return 2;
      return 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
      <View style={styles.progressSteps}>
        {steps.map((s, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <React.Fragment key={s.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                      ]}
                    >
                      {s.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isCompleted && styles.stepLabelCompleted,
                  ]}
                >
                  {s.label}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    isCompleted && styles.stepConnectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
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
        {step !== 'success' && (
          <View style={styles.subheader}>
            <Text style={styles.subheaderText}>
              {language.charAt(0).toUpperCase() + language.slice(1)} • Level: {recommendedLevel}
            </Text>
            {renderProgressSteps()}
          </View>
        )}

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
            <Animated.View
              style={[
                styles.stepContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <Text style={styles.stepTitle}>What's your main learning goal?</Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#14B8A6" />
                </View>
              ) : (
                <View style={styles.goalsContainer}>
                  {mainGoals.map((goal) => {
                    // Map emoji icons to Ionicons
                    const getIconName = (emoji: string) => {
                      const iconMap: { [key: string]: string } = {
                        '💼': 'briefcase-outline',
                        '✈️': 'airplane-outline',
                        '🎓': 'school-outline',
                        '🗣️': 'chatbubbles-outline',
                        '📚': 'book-outline',
                        '🌍': 'globe-outline',
                        '💡': 'bulb-outline',
                        '🏠': 'home-outline',
                        '🎭': 'musical-notes-outline',
                        '📱': 'phone-portrait-outline',
                        '🎨': 'color-palette-outline',
                      };
                      return iconMap[emoji] || 'star-outline';
                    };

                    return (
                      <TouchableOpacity
                        key={goal.id}
                        onPress={() => handleMainGoalSelect(goal.id)}
                        style={styles.goalCard}
                        activeOpacity={0.7}
                      >
                        <View style={styles.goalIconContainer}>
                          <Ionicons name={getIconName(goal.icon) as any} size={28} color="#14B8A6" />
                        </View>
                        <View style={styles.goalInfo}>
                          <Text style={styles.goalTitle}>{goal.text}</Text>
                          <Text style={styles.goalDescription}>{goal.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Animated.View>
          )}

          {/* Step 2: Sub-Goals Selection */}
          {step === 'subgoals' && (
            <Animated.View
              style={[
                styles.stepContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color="#14B8A6" />
                <Text style={styles.backButtonText}>Back to goals</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>
                Choose up to 3 focus areas {selectedSubGoals.length > 0 && `(${selectedSubGoals.length}/3)`}
              </Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#14B8A6" />
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
            </Animated.View>
          )}

          {/* Step 3: Duration Selection */}
          {step === 'duration' && (
            <Animated.View
              style={[
                styles.stepContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color="#14B8A6" />
                <Text style={styles.backButtonText}>Back to focus areas</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>How long do you want to study?</Text>

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
                      size={22}
                      color={duration === months ? '#14B8A6' : '#9CA3AF'}
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
            </Animated.View>
          )}

          {/* Step 4: Creating */}
          {step === 'creating' && (
            <View style={styles.creatingContainer}>
              <View style={styles.creatingIconContainer}>
                <ActivityIndicator size="large" color="#14B8A6" />
              </View>
              <Text style={styles.creatingTitle}>Creating Your Personalized Plan</Text>
              <Text style={styles.creatingSubtitle}>
                Our AI is analyzing your assessment results and crafting a customized
                learning journey just for you...
              </Text>
            </View>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <LottieView
                  source={require('../assets/lottie/success_login.json')}
                  autoPlay
                  loop={false}
                  style={styles.successLottie}
                />
              </View>
              <Text style={styles.successTitle}>Plan Created Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Your personalized {duration}-month learning journey is ready to begin
              </Text>
              <View style={styles.successStatsContainer}>
                <View style={styles.successStat}>
                  <View
                    style={[
                      styles.flagWrapper,
                      Platform.select({
                        ios: {
                          shadowColor: getFlagGlowColor(),
                        },
                      })
                    ]}
                  >
                    {(() => {
                      const FlagComponent = getFlagComponent();
                      if (FlagComponent) {
                        return <FlagComponent width={52} height={52} />;
                      }
                      return <Ionicons name="globe-outline" size={36} color="#14B8A6" />;
                    })()}
                  </View>
                  <Text style={styles.successStatValueSmall}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </Text>
                  <Text style={styles.successStatLabel}>Language</Text>
                </View>
                <View style={styles.successStat}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="calendar-outline" size={36} color="#14B8A6" />
                  </View>
                  <Text style={styles.successStatValue}>{duration}</Text>
                  <Text style={styles.successStatLabel}>Months</Text>
                </View>
                <View style={styles.successStat}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="book-outline" size={36} color="#14B8A6" />
                  </View>
                  <Text style={styles.successStatValue}>{duration * 8}</Text>
                  <Text style={styles.successStatLabel}>Sessions</Text>
                </View>
                <View style={styles.successStat}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="trophy-outline" size={36} color="#14B8A6" />
                  </View>
                  <Text style={styles.successStatValue}>{recommendedLevel}</Text>
                  <Text style={styles.successStatLabel}>Level</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (createdPlanId) {
                    onCreate({ planId: createdPlanId });
                  }
                }}
                style={styles.successButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.successButtonGradient}
                >
                  <Ionicons name="rocket" size={22} color="#FFFFFF" />
                  <Text style={styles.successButtonText}>Start Learning</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

