import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 480; // Increased from 420 to prevent cropping

// ==================== TYPES ====================

interface LearningPlanCardProps {
  plan: any;
  progressStats?: any;
  onContinue: () => void;
  onViewDetails: () => void;
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

// ==================== IMPROVED PROGRESS CIRCLE ====================

interface AnimatedProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedProgressCircle: React.FC<AnimatedProgressCircleProps> = ({
  percentage,
  size = 120, // Larger size
  strokeWidth = 10,
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
        
        {/* Percentage Text - CENTERED, NO OVERLAP */}
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
        </View>
        
        {/* Checkmark Badge - OUTSIDE circle, top-right */}
        {isComplete && (
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          </View>
        )}
      </View>
      
      {/* "Complete" label BELOW circle */}
      <Text style={styles.progressLabel}>
        {isComplete ? 'Completed!' : 'Complete'}
      </Text>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ==================== MAIN CARD COMPONENT ====================

export const LearningPlanCard: React.FC<LearningPlanCardProps> = ({
  plan,
  progressStats,
  onContinue,
  onViewDetails,
}) => {
  const language = plan.language || plan.target_language || 'English';
  const level = plan.proficiency_level || plan.target_cefr_level || 'B1';
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 16;
  const percentage = plan.progress_percentage || Math.round((completedSessions / totalSessions) * 100);
  const isCompleted = percentage >= 100;
  const levelColors = getLevelColor(level);

  const handleContinuePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onContinue();
  };

  const handleViewDetailsPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDetails();
  };

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.flagEmoji}>{getLanguageFlag(language)}</Text>
          <View>
            <Text style={styles.languageName}>
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
              <Text style={[styles.levelText, { color: levelColors.text }]}>
                {level} Level
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Section - WITH BETTER DESIGN */}
      <View style={styles.progressSection}>
        <AnimatedProgressCircle percentage={percentage} size={120} strokeWidth={10} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{percentage}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Plan Description */}
      <Text style={styles.planDescription} numberOfLines={1}>
        {plan.duration_weeks || 2}-Month {language.charAt(0).toUpperCase() + language.slice(1)} Learning Plan
      </Text>

      {/* Action Buttons - PROPER SPACING, NO CROPPING */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.continueButton, isCompleted && styles.continueButtonDisabled]}
          onPress={handleContinuePress}
          disabled={isCompleted}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "play"} 
            size={18} 
            color="#FFFFFF" 
          />
          <Text style={styles.continueButtonText}>
            {isCompleted ? 'Completed' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={handleViewDetailsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={18} color="#4A5568" />
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT, // 480px - prevents button cropping
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 40,
  },
  languageName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 24, // More space
  },
  progressRingWrapper: {
    alignItems: 'center',
  },
  progressRingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32, // Larger text
    fontWeight: 'bold',
    color: '#2D3748',
  },
  completeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 12, // Space between circle and label
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  planDescription: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20, // More space before buttons
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8, // Space from bottom edge
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FD1C5',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 6,
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 6,
  },
  detailsButtonText: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LearningPlanCard;