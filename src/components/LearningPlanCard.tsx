import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { styles } from './styles/LearningPlanCard.styles';

// ==================== TYPES ====================

interface LearningPlanCardProps {
  plan: any;
  progressStats?: any;
  onContinue: () => void;
  onViewDetails: () => void;
  onViewAssessment?: () => void;
  onCreateNextPlan?: () => void;
}

// ==================== HELPER FUNCTIONS ====================

const getLanguageFlag = (language: string): string => {
  const flags: Record<string, string> = {
    'english': '🇺🇸',
    'spanish': '🇪🇸',
    'french': '🇫🇷',
    'german': '🇩🇪',
    'dutch': '🇳🇱',
    'portuguese': '🇵🇹',
    'italian': '🇮🇹',
    'chinese': '🇨🇳',
    'japanese': '🇯🇵',
    'korean': '🇰🇷',
    'turkish': '🇹🇷'
  };
  return flags[language.toLowerCase()] || '🌍';
};

const getLevelColor = (level: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'A1': { bg: '#FEE2E2', text: '#DC2626' },
    'A2': { bg: '#FED7AA', text: '#EA580C' },
    'B1': { bg: '#E9D8FD', text: '#805AD5' },
    'B2': { bg: '#DBEAFE', text: '#2563EB' },
    'C1': { bg: '#D1FAE5', text: '#059669' },
    'C2': { bg: '#FEF3C7', text: '#D97706' }
  };
  return colors[level.toUpperCase()] || { bg: '#E0F2FE', text: '#0891B2' };
};

// ==================== ANIMATED PROGRESS CIRCLE ====================

interface AnimatedProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedProgressCircle: React.FC<AnimatedProgressCircleProps> = ({
  percentage,
  size = 110, // OPTIMIZED: 110px (was 120px)
  strokeWidth = 10, // OPTIMIZED: 10px (was 12px)
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
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
  const progressColor = isComplete ? '#10B981' : '#4FD1C5';

  return (
    <View style={styles.progressRingWrapper}>
      <View style={[styles.progressRingContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Animated Progress Circle */}
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
        
        {/* Percentage Text - CENTERED */}
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
      </View>

      {/* "Complete" label BELOW circle */}
      <Text style={styles.progressLabel}>
        {isComplete ? 'Completed!' : 'Complete'}
      </Text>
    </View>
  );
};

// ==================== MAIN CARD COMPONENT ====================

export const LearningPlanCard: React.FC<LearningPlanCardProps> = ({
  plan,
  progressStats,
  onContinue,
  onViewDetails,
  onViewAssessment,
  onCreateNextPlan,
}) => {
  const language = plan.language || plan.target_language || 'English';
  const level = plan.proficiency_level || plan.target_cefr_level || 'B1';
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const rawPercentage = plan.progress_percentage || (completedSessions / totalSessions) * 100;
  const percentage = Math.round(rawPercentage);

  // NEW: Check final assessment status
  const status = plan.status || 'in_progress';
  const isAwaitingAssessment = status === 'awaiting_final_assessment';
  const isAssessmentFailed = status === 'failed_assessment';
  const isCompleted = status === 'completed';
  const finalAssessment = plan.final_assessment || {};
  const lastAttempt = finalAssessment.attempts?.length > 0
    ? finalAssessment.attempts[finalAssessment.attempts.length - 1]
    : null;

  const levelColors = getLevelColor(level);

  // Check if this is a next level plan (created after passing previous level assessment)
  const isNextLevelPlan = plan.from_final_assessment === true || plan.previous_plan_id;

  // Check if user passed assessment and can create next level plan
  const canCreateNextPlan = isCompleted && lastAttempt && lastAttempt.passed && onCreateNextPlan;

  // Get next level for display (A1 -> A2, B1 -> B2, etc.)
  const getNextLevel = (currentLevel: string): string => {
    const levelMap: Record<string, string> = {
      'A1': 'A2',
      'A2': 'B1',
      'B1': 'B2',
      'B2': 'C1',
      'C1': 'C2',
    };
    return levelMap[currentLevel.toUpperCase()] || 'Next Level';
  };

  const handleContinuePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // If completed and passed, create next plan
    if (canCreateNextPlan) {
      onCreateNextPlan();
    } else {
      onContinue();
    }
  };

  const handleViewDetailsPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDetails();
  };

  return (
    <View style={styles.card}>
      {/* Corner Ribbon for Assessment Status */}
      {isAwaitingAssessment && (
        <View style={styles.assessmentRibbon}>
          <Text style={styles.assessmentRibbonText}>ASSESSMENT</Text>
        </View>
      )}

      {isAssessmentFailed && (
        <View style={[styles.assessmentRibbon, styles.assessmentRibbonFailed]}>
          <Text style={styles.assessmentRibbonText}>RETRY</Text>
        </View>
      )}

      {isCompleted && (
        <View style={[styles.assessmentRibbon, styles.assessmentRibbonCompleted]}>
          <Text style={styles.assessmentRibbonText}>COMPLETED</Text>
        </View>
      )}

      {!isAwaitingAssessment && !isAssessmentFailed && !isCompleted && (
        <>
          {completedSessions === 0 ? (
            <View style={[styles.assessmentRibbon, styles.assessmentRibbonNew]}>
              <Text style={styles.assessmentRibbonText}>NEW</Text>
            </View>
          ) : (
            <View style={[styles.assessmentRibbon, styles.assessmentRibbonInProgress]}>
              <Text style={styles.assessmentRibbonText}>IN PROGRESS</Text>
            </View>
          )}
        </>
      )}

      {/* Main Content Area */}
      <View>
        {/* Header Section - Premium */}
        <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.flagEmoji}>{getLanguageFlag(language)}</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.languageName}>
                {language.charAt(0).toUpperCase() + language.slice(1)}
              </Text>
              {isNextLevelPlan && (
                <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#1E40AF' }}>🎓 UPGRADED</Text>
                </View>
              )}
            </View>
            <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
              <Text style={[styles.levelText, { color: levelColors.text }]}>
                {level} Level
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Section - Premium */}
      <View style={styles.progressSection}>
        <AnimatedProgressCircle percentage={percentage} size={95} strokeWidth={9} />
      </View>

      {/* Stats Row - Premium */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Plan Description */}
      <Text style={styles.planDescription} numberOfLines={1}>
        {plan.duration_months || 2}-Month {language.charAt(0).toUpperCase() + language.slice(1)} Learning Plan
      </Text>

        {/* Show last score for failed assessments */}
        {isAssessmentFailed && lastAttempt && (
          <Text style={[styles.planDescription, { color: '#EF4444', fontSize: 11, marginTop: 4 }]}>
            Last score: {lastAttempt.overall_score}/100
          </Text>
        )}
      </View>

      {/* Action Buttons - Premium Design INSIDE Card */}
      <View style={styles.buttonsContainer}>
        {/* Main Action Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            isCompleted && !canCreateNextPlan && styles.continueButtonDisabled,
            (isAwaitingAssessment || isAssessmentFailed) && styles.continueButtonAssessment,
            canCreateNextPlan && styles.continueButtonCreatePlan
          ]}
          onPress={handleContinuePress}
          disabled={isCompleted && !canCreateNextPlan}
          activeOpacity={0.8}
        >
          <Ionicons
            name={
              canCreateNextPlan
                ? "add-circle"
                : isCompleted
                ? "checkmark-circle"
                : isAwaitingAssessment || isAssessmentFailed
                ? "clipboard"
                : "play-circle"
            }
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.continueButtonText}>
            {canCreateNextPlan
              ? `Create ${getNextLevel(level)} Plan`
              : isCompleted
              ? 'Completed'
              : isAwaitingAssessment || isAssessmentFailed
              ? 'Take Assessment'
              : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* View Assessment or Details Button */}
        {isCompleted && finalAssessment?.attempts?.length > 0 && onViewAssessment ? (
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onViewAssessment();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="stats-chart" size={20} color="#4A5568" />
            <Text style={styles.detailsButtonText}>Assessment</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleViewDetailsPress}
            activeOpacity={0.8}
          >
            <Ionicons name="information-circle-outline" size={20} color="#4A5568" />
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LearningPlanCard;