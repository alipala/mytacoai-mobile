import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LearningService } from '../../api/generated';
import type { LearningPlan } from '../../api/generated';
import { styles } from './styles/LearningPathScreen.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LearningPathScreenProps {
  navigation: any;
}

interface SessionNode {
  id: string;
  sessionNumber: number;
  weekNumber: number;
  focus: string;
  status: 'completed' | 'current' | 'locked';
  completedAt: string | null;
  position: 'left' | 'right' | 'center';
  yPosition: number;
}

const LearningPathScreen: React.FC<LearningPathScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [sessionNodes, setSessionNodes] = useState<SessionNode[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const glowOpacity = useSharedValue(0.3);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    loadLearningPlans();

    // Start glow animation for current lesson
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Start pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const loadLearningPlans = async () => {
    try {
      setLoading(true);
      const plans = await LearningService.getUserLearningPlansApiLearningPlansGet();

      // Sort plans by creation date (latest first)
      const sortedPlans = (plans as LearningPlan[]).sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return dateB - dateA;
      });

      setLearningPlans(sortedPlans);

      // Auto-select the most recent plan
      if (sortedPlans.length > 0) {
        setSelectedPlanId(sortedPlans[0].id);
        generateSessionNodes(sortedPlans[0]);
      }
    } catch (error) {
      console.error('Error loading learning plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSessionNodes = (plan: LearningPlan) => {
    const nodes: SessionNode[] = [];
    const weeklySchedule = plan.plan_content?.weekly_schedule || [];

    let globalSessionNumber = 0;
    let yPos = 200; // Start position
    const ySpacing = 180; // Space between sessions

    weeklySchedule.forEach((week, weekIndex) => {
      const sessionDetails = week.session_details || [];

      sessionDetails.forEach((session, sessionIndex) => {
        globalSessionNumber++;

        // Determine status
        let status: 'completed' | 'current' | 'locked' = 'locked';
        if (session.status === 'completed') {
          status = 'completed';
        } else if (session.status === 'pending' && globalSessionNumber === (plan.completed_sessions || 0) + 1) {
          status = 'current';
        }

        // Zigzag positioning
        let position: 'left' | 'right' | 'center' = 'center';
        if (globalSessionNumber % 3 === 1) position = 'left';
        else if (globalSessionNumber % 3 === 2) position = 'right';
        else position = 'center';

        nodes.push({
          id: `${plan.id}-week${week.week}-session${session.session_number}`,
          sessionNumber: globalSessionNumber,
          weekNumber: week.week,
          focus: session.focus || week.focus,
          status,
          completedAt: session.completed_at || null,
          position,
          yPosition: yPos,
        });

        yPos += ySpacing;
      });
    });

    setSessionNodes(nodes);

    // Auto-scroll to current session
    setTimeout(() => {
      const currentNode = nodes.find(n => n.status === 'current');
      if (currentNode && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: currentNode.yPosition - 200,
          animated: true,
        });
      }
    }, 500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLearningPlans();
    setRefreshing(false);
  };

  const handlePlanChange = (planId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlanId(planId);
    const plan = learningPlans.find(p => p.id === planId);
    if (plan) {
      generateSessionNodes(plan);
    }
    setShowPlanPicker(false);
  };

  const handleSessionPress = (node: SessionNode) => {
    if (node.status === 'locked') {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (node.status === 'current') {
      // Navigate to conversation with plan context
      navigation.navigate('Conversation', {
        planId: selectedPlanId,
        weekNumber: node.weekNumber,
        sessionNumber: node.sessionNumber,
      });
    } else if (node.status === 'completed') {
      // Show session summary/details (could open a modal)
      console.log('Show completed session details:', node);
    }
  };

  const renderSessionNode = (node: SessionNode, index: number) => {
    const isLast = index === sessionNodes.length - 1;
    const nextNode = !isLast ? sessionNodes[index + 1] : null;

    // Calculate positions
    const getXPosition = (position: 'left' | 'right' | 'center') => {
      if (position === 'left') return SCREEN_WIDTH * 0.25;
      if (position === 'right') return SCREEN_WIDTH * 0.75;
      return SCREEN_WIDTH * 0.5;
    };

    const nodeX = getXPosition(node.position);
    const nextNodeX = nextNode ? getXPosition(nextNode.position) : nodeX;

    // Animated styles for current node
    const glowAnimatedStyle = useAnimatedStyle(() => ({
      opacity: node.status === 'current' ? glowOpacity.value : 0,
    }));

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: node.status === 'current' ? pulseScale.value : 1 }],
    }));

    // Colors based on status
    const getNodeColors = () => {
      switch (node.status) {
        case 'completed':
          return {
            primary: '#10B981',
            secondary: '#34D399',
            bg: '#ECFDF5',
            icon: 'checkmark-circle',
          };
        case 'current':
          return {
            primary: '#4FD1C5',
            secondary: '#7DE3D8',
            bg: '#F0FDFA',
            icon: 'play-circle',
          };
        case 'locked':
        default:
          return {
            primary: '#D1D5DB',
            secondary: '#E5E7EB',
            bg: '#F9FAFB',
            icon: 'lock-closed',
          };
      }
    };

    const colors = getNodeColors();

    return (
      <View key={node.id}>
        {/* Connector Line to Next Node */}
        {!isLast && nextNode && (
          <View style={[styles.connectorContainer, { top: node.yPosition }]}>
            <Svg height={nextNode.yPosition - node.yPosition} width={SCREEN_WIDTH}>
              <Defs>
                <SvgGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
                  <Stop offset="100%" stopColor={getNodeColors().primary} stopOpacity="0.3" />
                </SvgGradient>
              </Defs>
              <Path
                d={`M ${nodeX} 0 Q ${(nodeX + nextNodeX) / 2} ${(nextNode.yPosition - node.yPosition) / 2} ${nextNodeX} ${nextNode.yPosition - node.yPosition}`}
                stroke={node.status === 'locked' ? '#E5E7EB' : 'url(#lineGradient)'}
                strokeWidth="3"
                strokeDasharray={node.status === 'locked' ? '8,8' : '0'}
                fill="none"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}

        {/* Session Node */}
        <TouchableOpacity
          style={[
            styles.sessionNodeContainer,
            {
              top: node.yPosition,
              left: nodeX - 40,
            },
          ]}
          onPress={() => handleSessionPress(node)}
          activeOpacity={node.status === 'locked' ? 1 : 0.7}
          disabled={node.status === 'locked'}
        >
          {/* Glow effect for current node */}
          {node.status === 'current' && (
            <Animated.View style={[styles.glowCircle, glowAnimatedStyle]}>
              <LinearGradient
                colors={[`${colors.primary}40`, `${colors.secondary}20`, 'transparent']}
                style={styles.glowGradient}
              />
            </Animated.View>
          )}

          {/* Main node circle */}
          <Animated.View style={[pulseAnimatedStyle]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sessionNode}
            >
              <View style={[styles.nodeInner, { backgroundColor: colors.bg }]}>
                <Ionicons
                  name={colors.icon as any}
                  size={36}
                  color={colors.primary}
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Session number badge */}
          <View style={[styles.sessionBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.sessionBadgeText}>{node.sessionNumber}</Text>
          </View>

          {/* Session label */}
          <View style={styles.sessionLabel}>
            <Text style={styles.sessionLabelText} numberOfLines={2}>
              {node.focus}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Week Header */}
        {(index === 0 || node.weekNumber !== sessionNodes[index - 1].weekNumber) && (
          <View style={[styles.weekHeader, { top: node.yPosition - 120 }]}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.weekHeaderGradient}
            >
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              <Text style={styles.weekHeaderText}>Week {node.weekNumber}</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  };

  const selectedPlan = learningPlans.find(p => p.id === selectedPlanId);
  const progressPercentage = selectedPlan?.progress_percentage || 0;

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FD1C5" />
          <Text style={styles.loadingText}>Loading your learning path...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (learningPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Learning Path Yet</Text>
          <Text style={styles.emptyMessage}>
            Create a learning plan to see your personalized journey!
          </Text>
          <TouchableOpacity
            style={styles.createPlanButton}
            onPress={() => navigation.navigate('AssessmentLanguageSelection')}
          >
            <LinearGradient
              colors={['#4FD1C5', '#3DA89D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createPlanGradient}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.createPlanButtonText}>Create Learning Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Path</Text>
      </View>

      {/* Plan Selector & Progress Bar */}
      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.planSelector}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowPlanPicker(!showPlanPicker);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.planSelectorLeft}>
            <Ionicons name="book" size={24} color="#4FD1C5" />
            <View style={styles.planSelectorInfo}>
              <Text style={styles.planSelectorLabel}>Current Plan</Text>
              <Text style={styles.planSelectorValue} numberOfLines={1}>
                {selectedPlan?.language} • {selectedPlan?.proficiency_level}
              </Text>
            </View>
          </View>
          <Ionicons
            name={showPlanPicker ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#9CA3AF"
          />
        </TouchableOpacity>

        {/* Plan Picker Dropdown */}
        {showPlanPicker && (
          <View style={styles.planPickerDropdown}>
            {learningPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planPickerItem,
                  plan.id === selectedPlanId && styles.planPickerItemActive,
                ]}
                onPress={() => handlePlanChange(plan.id)}
                activeOpacity={0.7}
              >
                <View style={styles.planPickerItemLeft}>
                  <Ionicons
                    name={plan.id === selectedPlanId ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={plan.id === selectedPlanId ? '#4FD1C5' : '#9CA3AF'}
                  />
                  <View style={styles.planPickerItemInfo}>
                    <Text style={styles.planPickerItemTitle}>
                      {plan.language} • {plan.proficiency_level}
                    </Text>
                    <Text style={styles.planPickerItemSubtitle}>
                      {plan.duration_months} months • {plan.completed_sessions || 0}/{plan.total_sessions || 0} sessions
                    </Text>
                  </View>
                </View>
                <Text style={styles.planPickerItemProgress}>
                  {Math.round(plan.progress_percentage || 0)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={['#4FD1C5', '#3DA89D', '#2D9E93']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Learning Path */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.pathScrollView}
        contentContainerStyle={[
          styles.pathContent,
          { height: sessionNodes.length > 0 ? sessionNodes[sessionNodes.length - 1].yPosition + 200 : SCREEN_HEIGHT },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4FD1C5"
          />
        }
      >
        {sessionNodes.map((node, index) => renderSessionNode(node, index))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LearningPathScreen;
