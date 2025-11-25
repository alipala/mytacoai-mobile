import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

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
                    <Text style={styles.statCardLabel}>Practice Time</Text>
                  </View>
                  <Text style={styles.statCardValue}>
                    {Math.round((progressStats?.total_minutes || 140))} min
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statCardLeft}>
                    <Ionicons name="trending-up" size={24} color="#8B5CF6" />
                    <Text style={styles.statCardLabel}>This Week</Text>
                  </View>
                  <Text style={styles.statCardValue}>
                    {progressStats?.sessions_this_week || 2}
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

// ==================== STYLES ====================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // CRITICAL!
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9, // CRITICAL: Fixed height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4FD1C5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerFlag: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F7FAFC',
  },
  progressRingWrapper: {
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  completeBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  overallProgressLabel: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statCardLabel: {
    fontSize: 15,
    color: '#4A5568',
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FD1C5',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  planOverview: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default LearningPlanDetailsModal;