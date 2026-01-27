/**
 * Compact Learning Plan Card - Optimized for Dashboard
 *
 * Design Goals:
 * - Show all info without scrolling (compact height: ~200px)
 * - Beautiful, professional UI following 2026 trends
 * - All elements visible: Flag, Level, Badge, Progress, Duration, Buttons
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { styles } from './styles/CompactLearningPlanCard.styles';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

interface CompactLearningPlanCardProps {
  plan: any;
  progressStats?: any;
  onContinue: () => void;
  onViewDetails: () => void;
  onViewAssessment?: () => void;
  onCreateNextPlan?: () => void;
}

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
    'A1': { bg: '#FEE2E2', text: '#DC2626' },
    'A2': { bg: '#FED7AA', text: '#EA580C' },
    'B1': { bg: '#E9D8FD', text: '#805AD5' },
    'B2': { bg: '#DBEAFE', text: '#2563EB' },
    'C1': { bg: '#D1FAE5', text: '#059669' },
    'C2': { bg: '#FEF3C7', text: '#D97706' }
  };
  return colors[level.toUpperCase()] || { bg: '#E0F2FE', text: '#0891B2' };
};

const getStatusBadge = (percentage: number, completedSessions: number, totalSessions: number) => {
  if (percentage === 0) {
    return { text: 'NEW', color: '#FFFFFF', bg: '#8B5CF6', icon: 'sparkles' as const, ribbonStyle: 'assessmentRibbonNew' };
  }
  if (percentage === 100) {
    return { text: 'COMPLETED', color: '#FFFFFF', bg: '#10B981', icon: 'checkmark-circle' as const, ribbonStyle: 'assessmentRibbonCompleted' };
  }
  return { text: 'IN PROGRESS', color: '#FFFFFF', bg: '#3B82F6', icon: 'trending-up' as const, ribbonStyle: 'assessmentRibbonInProgress' };
};

// Animated Progress Circle Component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedProgressCircle: React.FC<AnimatedProgressCircleProps> = ({
  percentage,
  size = 95,
  strokeWidth = 9,
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
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
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
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
      </View>
      <Text style={styles.progressLabel}>
        {isComplete ? 'Completed!' : 'Complete'}
      </Text>
    </View>
  );
};

export const CompactLearningPlanCard: React.FC<CompactLearningPlanCardProps> = ({
  plan,
  progressStats,
  onContinue,
  onViewDetails,
  onViewAssessment,
  onCreateNextPlan,
}) => {
  const language = plan.language || plan.target_language || 'English';
  const languageCapitalized = language.charAt(0).toUpperCase() + language.slice(1);
  const level = plan.proficiency_level || plan.target_cefr_level || 'B1';
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = Math.round((completedSessions / totalSessions) * 100);
  const duration = plan.duration_months || 1;

  const FlagComponent = getLanguageFlagComponent(language);
  const levelColors = getLevelColor(level);
  const statusBadge = getStatusBadge(percentage, completedSessions, totalSessions);

  const handleContinue = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onContinue();
  };

  const handleDetails = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDetails();
  };

  // Calculate total minutes from sessions
  const totalMinutes = completedSessions * 5; // Assuming 5 min per session

  return (
    <View style={styles.card}>
      {/* Corner Ribbon Badge (Like Original Design) */}
      <View style={[styles.assessmentRibbon, styles[statusBadge.ribbonStyle as keyof typeof styles]]}>
        <Text style={styles.assessmentRibbonText}>{statusBadge.text}</Text>
      </View>

      {/* Row 1: Language + Level Badge (Horizontal) */}
      <View style={styles.topRow}>
        {FlagComponent && (
          <View style={styles.flagContainer}>
            <FlagComponent width={36} height={36} />
          </View>
        )}
        <View style={styles.languageInfo}>
          <View style={styles.languageRow}>
            <Text style={styles.languageName}>{languageCapitalized}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
              <Text style={[styles.levelText, { color: levelColors.text }]}>
                {level.toUpperCase()} Level
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Row 2: Progress Circle (Centered) */}
      <View style={styles.progressSection}>
        <AnimatedProgressCircle percentage={percentage} size={95} strokeWidth={9} />
      </View>

      {/* Row 3: Stats (3 columns: Duration - Sessions - Time) */}
      <View style={styles.statsRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>{duration} Month</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>{completedSessions}/{totalSessions} Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>{totalMinutes} min</Text>
        </View>
      </View>

      {/* Row 4: Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4FD1C5', '#38B2AC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={handleDetails}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
