import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles/LearningPlanDetailsModal.styles';
import { getLanguageGradient } from '../utils/gradientHelpers';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== TYPES ====================

interface LearningPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: any;
  language?: string;
  progressStats?: any;
  onContinueLearning: () => void;
}

// ==================== HELPER FUNCTIONS ====================

const getLanguageFlagComponent = (language: string): React.FC<any> | null => {
  const flags: Record<string, React.FC<any>> = {
    'english': EnglishFlag,
    'spanish': SpanishFlag,
    'french': FrenchFlag,
    'german': GermanFlag,
    'dutch': DutchFlag,
    'portuguese': PortugueseFlag,
  };
  return flags[language.toLowerCase()] || null;
};

const getLevelColor = (level: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'A1': { bg: 'rgba(220, 38, 38, 0.15)', text: '#FCA5A5' },
    'A2': { bg: 'rgba(234, 88, 12, 0.15)', text: '#FED7AA' },
    'B1': { bg: 'rgba(128, 90, 213, 0.15)', text: '#C4B5FD' },
    'B2': { bg: 'rgba(37, 99, 235, 0.15)', text: '#93C5FD' },
    'C1': { bg: 'rgba(5, 150, 105, 0.15)', text: '#6EE7B7' },
    'C2': { bg: 'rgba(217, 119, 6, 0.15)', text: '#FCD34D' }
  };
  return colors[level.toUpperCase()] || { bg: 'rgba(8, 145, 178, 0.15)', text: '#67E8F9' };
};

// ==================== ANIMATED PROGRESS RING ====================

interface ProgressRingProps {
  percentage: number;
  accentColor: string;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  accentColor,
  size = 140,
  strokeWidth = 12
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const isComplete = percentage >= 100;
  const progressColor = isComplete ? '#10B981' : accentColor;

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`;
    }
    return `rgba(20, 184, 166, ${opacity})`;
  };

  return (
    <View style={[styles.progressRingWrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={hexToRgba(accentColor, 0.15)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.progressTextContainer}>
        <Text style={[styles.progressPercentage, { color: progressColor }]}>
          {Math.round(percentage)}%
        </Text>
      </View>

      {isComplete && (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
        </View>
      )}
    </View>
  );
};

// ==================== MAIN MODAL COMPONENT ====================

export const LearningPlanDetailsModal: React.FC<LearningPlanDetailsModalProps> = ({
  visible,
  onClose,
  plan,
  language: languageProp,
  progressStats,
  onContinueLearning,
}) => {
  const { t } = useTranslation();
  // CRITICAL: Use timing instead of spring for reliability
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Calculate progress
  const completedSessions = plan?.completed_sessions || 0;
  const totalSessions = plan?.total_sessions || 16;
  const percentage = plan?.progress_percentage || Math.round((completedSessions / totalSessions) * 100);
  const isCompleted = percentage >= 100;

  const planContent = plan?.plan_content || {};
  const goals = plan?.goals || [];
  const language = languageProp || plan?.language || plan?.target_language || 'English';
  const level = plan?.proficiency_level || plan?.target_cefr_level || 'B1';
  const levelColors = getLevelColor(level);
  const FlagComponent = getLanguageFlagComponent(language);

  // Get language-specific gradient colors
  const gradientColors = getLanguageGradient(language);
  const accentColor = gradientColors[0]; // Use first gradient color as primary accent
  const secondaryColor = gradientColors[1]; // Secondary gradient color

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`;
    }
    return `rgba(20, 184, 166, ${opacity})`;
  };

  // Get actual practice minutes used from the plan (tracked by backend)
  // Fallback to estimated calculation if not available
  const actualMinutesUsed = plan?.practice_minutes_used || 0;
  const avgMinutesPerSession = 15;
  const estimatedMinutes = completedSessions * avgMinutesPerSession;
  const practiceTimeMinutes = actualMinutesUsed > 0 ? actualMinutesUsed : estimatedMinutes;

  console.log(`📊 [LearningPlanDetailsModal] Practice time calculation:
    - Plan has practice_minutes_used field: ${plan?.practice_minutes_used !== undefined}
    - Actual minutes from backend: ${actualMinutesUsed}
    - Estimated (${completedSessions} sessions × 15 min): ${estimatedMinutes}
    - Displaying: ${practiceTimeMinutes} min
    - Plan ID: ${plan?.id}
    - Language: ${language} (${level})
  `);

  // Calculate current week from weekly_schedule (find the last week with completed sessions)
  const weeklySchedule = planContent?.weekly_schedule || [];
  let currentWeek = 1;

  // Find the last week that has completed sessions
  for (let i = 0; i < weeklySchedule.length; i++) {
    const week = weeklySchedule[i];
    const sessionsInWeek = week?.sessions_completed || 0;
    if (sessionsInWeek > 0) {
      currentWeek = i + 1; // Week numbers start at 1
    }
  }

  console.log(`📅 Current week calculation: Week ${currentWeek} (from weekly_schedule)`);

  // CRITICAL: Simple, reliable animation
  useEffect(() => {
    if (visible) {
      console.log('🚀 Opening modal...');
      // Reset to bottom
      slideAnim.setValue(SCREEN_HEIGHT);
      
      // Slide up with timing (more reliable than spring)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        console.log('✅ Modal opened');
      });
    } else {
      console.log('🔽 Closing modal...');
      // Slide down
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        console.log('✅ Modal closed');
      });
    }
  }, [visible]);

  const handleClose = () => {
    console.log('🔽 Close button pressed');
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  console.log('📱 Rendering modal, visible:', visible);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        {/* Backdrop Touchable - Behind modal */}
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Modal Container - Slides up - On top */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              borderColor: hexToRgba(accentColor, 0.3),
              shadowColor: accentColor,
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header with Gradient */}
            <LinearGradient
              colors={[hexToRgba(accentColor, 0.25), hexToRgba(secondaryColor, 0.15)] as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.header,
                {
                  backgroundColor: 'transparent',
                  borderBottomColor: hexToRgba(accentColor, 0.2),
                }
              ]}
            >
              <View style={styles.headerLeft}>
                {FlagComponent && (
                  <View style={styles.headerFlagContainer}>
                    <FlagComponent width={44} height={44} />
                  </View>
                )}
                <View>
                  <Text style={styles.headerTitle}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}{t('learning_plan.details.learning_plan_suffix')}
                  </Text>
                  <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
                    <Text style={[styles.levelText, { color: levelColors.text }]}>
                      {level}{t('learning_plan.details.level_suffix')}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Progress Section */}
              <View style={[styles.progressSection, { backgroundColor: hexToRgba(accentColor, 0.05) }]}>
                <ProgressRing percentage={percentage} accentColor={accentColor} size={140} strokeWidth={12} />
                <Text style={[styles.overallProgressLabel, { color: hexToRgba(accentColor, 0.7) }]}>
                  {t('learning_plan.details.overall_progress')}
                </Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={[
                  styles.statCard,
                  {
                    backgroundColor: hexToRgba(accentColor, 0.08),
                    borderColor: hexToRgba(accentColor, 0.2),
                  }
                ]}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="calendar-outline" size={24} color={accentColor} />
                    <Text style={[styles.statCardLabel, { color: hexToRgba(accentColor, 0.8) }]}>
                      {t('learning_plan.details.sessions')}
                    </Text>
                  </View>
                  <Text style={[styles.statCardValue, { color: accentColor }]}>
                    {completedSessions}/{totalSessions}
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  {
                    backgroundColor: hexToRgba(secondaryColor, 0.08),
                    borderColor: hexToRgba(secondaryColor, 0.2),
                  }
                ]}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="time-outline" size={24} color={secondaryColor} />
                    <Text style={[styles.statCardLabel, { color: hexToRgba(secondaryColor, 0.8) }]}>
                      {actualMinutesUsed > 0 ? t('learning_plan.details.spoken_time') : t('learning_plan.details.est_time')}
                    </Text>
                  </View>
                  <Text style={[styles.statCardValue, { color: secondaryColor }]}>
                    {actualMinutesUsed > 0 ? `${Math.round(practiceTimeMinutes)} min` : `~${practiceTimeMinutes} min`}
                  </Text>
                </View>

                <View style={[
                  styles.statCard,
                  {
                    backgroundColor: hexToRgba(accentColor, 0.08),
                    borderColor: hexToRgba(accentColor, 0.2),
                  }
                ]}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="trending-up" size={24} color={accentColor} />
                    <Text style={[styles.statCardLabel, { color: hexToRgba(accentColor, 0.8) }]}>
                      {t('learning_plan.details.current_week')}
                    </Text>
                  </View>
                  <Text style={[styles.statCardValue, { color: accentColor }]}>
                    {t('learning_plan.details.week_prefix')}{currentWeek}
                  </Text>
                </View>
              </View>

              {/* Continue Learning Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isCompleted && styles.continueButtonDisabled,
                  !isCompleted && {
                    backgroundColor: accentColor,
                    shadowColor: accentColor,
                    borderColor: hexToRgba(accentColor, 0.4),
                  }
                ]}
                onPress={() => {
                  handleClose();
                  setTimeout(() => onContinueLearning(), 400);
                }}
                disabled={isCompleted}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isCompleted ? "checkmark-circle" : "play"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.continueButtonText}>
                  {isCompleted ? t('learning_plan.details.plan_completed') : t('learning_plan.details.continue_learning')}
                </Text>
              </TouchableOpacity>

              {/* Plan Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('learning_plan.details.plan_overview')}</Text>
                <Text style={[styles.planOverview, { color: accentColor }]}>
                  {plan?.duration_weeks || 2}{t('learning_plan.details.month_suffix')} {language.charAt(0).toUpperCase() + language.slice(1)} {t('learning_plan.details.learning_plan_for')} {level} {t('learning_plan.details.level_text')}
                </Text>
                <Text style={[styles.planDescription, { color: hexToRgba(accentColor, 0.7) }]}>
                  {t('learning_plan.details.plan_description', {
                    level,
                    score: plan?.assessment_data?.overall_score || 65,
                    weeks: plan?.duration_weeks || 2,
                    weeksCount: Math.ceil((totalSessions) / 4)
                  })}
                </Text>
              </View>

              {/* Learning Goals */}
              {goals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('learning_plan.details.learning_goals')}</Text>
                  {goals.map((goal: string, index: number) => (
                    <View key={index} style={styles.goalItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.goalText}>{goal}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {t('learning_plan.details.created_prefix')}{new Date(plan?.created_at || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LearningPlanDetailsModal;