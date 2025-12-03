import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { styles } from './styles/LearningPlanDetailsModal.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== TYPES ====================

interface LearningPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: any;
  progressStats?: any;
  onContinueLearning: () => void;
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

// ==================== ANIMATED PROGRESS RING ====================

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  percentage, 
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
  const progressColor = isComplete ? '#10B981' : '#4FD1C5';
  
  return (
    <View style={[styles.progressRingWrapper, { width: size, height: size }]}>
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
        <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
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
  progressStats,
  onContinueLearning,
}) => {
  // CRITICAL: Use timing instead of spring for reliability
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Calculate progress
  const completedSessions = plan?.completed_sessions || 0;
  const totalSessions = plan?.total_sessions || 16;
  const percentage = plan?.progress_percentage || Math.round((completedSessions / totalSessions) * 100);
  const isCompleted = percentage >= 100;

  const planContent = plan?.plan_content || {};
  const goals = plan?.goals || [];
  const language = plan?.language || plan?.target_language || 'English';
  const level = plan?.proficiency_level || plan?.target_cefr_level || 'B1';
  const levelColors = getLevelColor(level);

  // Calculate estimated practice time for this specific learning plan
  // Using average session duration based on typical conversation length
  const avgMinutesPerSession = 15; // Increased to be more realistic
  const practiceTimeMinutes = completedSessions * avgMinutesPerSession;

  // Calculate current week based on sessions completed (assuming 3 sessions per week)
  const currentWeek = Math.max(1, Math.ceil(completedSessions / 3));

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
      {/* Backdrop - Press to close */}
      <View style={styles.backdrop}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        {/* Modal Container - Slides up */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerFlag}>{getLanguageFlag(language)}</Text>
                <View>
                  <Text style={styles.headerTitle}>
                    {language.charAt(0).toUpperCase() + language.slice(1)} Learning Plan
                  </Text>
                  <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
                    <Text style={[styles.levelText, { color: levelColors.text }]}>
                      {level} Level
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Progress Section */}
              <View style={styles.progressSection}>
                <ProgressRing percentage={percentage} size={140} strokeWidth={12} />
                <Text style={styles.overallProgressLabel}>Overall Progress</Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="calendar-outline" size={24} color="#4FD1C5" />
                    <Text style={styles.statCardLabel}>Sessions</Text>
                  </View>
                  <Text style={styles.statCardValue}>{completedSessions}/{totalSessions}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="time-outline" size={24} color="#3B82F6" />
                    <Text style={styles.statCardLabel}>Est. Time</Text>
                  </View>
                  <Text style={styles.statCardValue}>
                    ~{practiceTimeMinutes} min
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="trending-up" size={24} color="#8B5CF6" />
                    <Text style={styles.statCardLabel}>Current Week</Text>
                  </View>
                  <Text style={styles.statCardValue}>
                    Week {currentWeek}
                  </Text>
                </View>
              </View>

              {/* Continue Learning Button */}
              <TouchableOpacity
                style={[styles.continueButton, isCompleted && styles.continueButtonDisabled]}
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
                  {isCompleted ? 'Plan Completed' : 'Continue Learning'}
                </Text>
              </TouchableOpacity>

              {/* Plan Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Plan Overview</Text>
                <Text style={styles.planOverview}>
                  {plan?.duration_weeks || 2}-Month {language.charAt(0).toUpperCase() + language.slice(1)} Learning Plan for {level} Level
                </Text>
                <Text style={styles.planDescription}>
                  This comprehensive plan is designed based on your speaking assessment results. 
                  You demonstrated a {level} level proficiency with an overall score of {plan?.assessment_data?.overall_score || 65}/100. 
                  The plan spans {plan?.duration_weeks || 2} months with {Math.ceil((totalSessions) / 4)} weeks of structured learning.
                </Text>
              </View>

              {/* Learning Goals */}
              {goals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Learning Goals</Text>
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
                  Created {new Date(plan?.created_at || Date.now()).toLocaleDateString('en-US', { 
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