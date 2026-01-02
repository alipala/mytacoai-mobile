import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  Animated,
  Pressable,
  Easing,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProgressService, LearningService, StripeService } from '../../api/generated';
import type { LearningPlan } from '../../api/generated';
import { LearningPlanCard } from '../../components/LearningPlanCard';
import { LearningPlanDetailsModal } from '../../components/LearningPlanDetailsModal';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { PricingModal } from '../../components/PricingModal';
import { SessionTypeModal } from '../../components/SessionTypeModal';
import ImmersiveLoader from '../../components/ImmersiveLoader';
import { COLORS } from '../../constants/colors';
import { styles } from './styles/DashboardScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = 'https://taco-voice-ai-e9b98ce8e7c5.herokuapp.com';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userLanguage, setUserLanguage] = useState<string>('english');
  const [userLevel, setUserLevel] = useState<string>('intermediate');
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [selectedAssessmentPlan, setSelectedAssessmentPlan] = useState<LearningPlan | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);

  // Create next plan modal state
  const [showCreateNextPlanModal, setShowCreateNextPlanModal] = useState(false);
  const [selectedCreatePlan, setSelectedCreatePlan] = useState<LearningPlan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoals, setCustomGoals] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);

  // Animation refs for Start New Session button
  const buttonFloatAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadDashboardData();

    // Refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    // Start button animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonFloatAnim, {
          toValue: -6,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonFloatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cleanup listener
    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated (guest users shouldn't be on dashboard)
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        console.log('⚠️ [DASHBOARD] Guest user detected - redirecting to Welcome');
        setLoading(false);
        navigation.replace('Welcome');
        return;
      }

      // Get user info from storage and determine language/level preferences
      let finalLanguage = 'english';
      let finalLevel = 'intermediate';

      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);

        // Use name and surname
        const displayName = [user.first_name, user.last_name]
          .filter(Boolean)
          .join(' ') || user.name || user.email?.split('@')[0] || 'User';

        setUserName(displayName);

        // Extract user language and level preferences
        if (user.preferred_language) {
          finalLanguage = user.preferred_language;
        }
        if (user.preferred_level) {
          finalLevel = user.preferred_level;
        }
      }

      // Load learning plans, progress stats, and subscription status in parallel
      const [plansResponse, statsResponse, subscriptionResponse] = await Promise.all([
        LearningService.getUserLearningPlansApiLearningPlansGet(),
        ProgressService.getProgressStatsApiProgressStatsGet(),
        StripeService.getSubscriptionStatusApiStripeSubscriptionStatusGet(),
      ]);

      // Sort learning plans from latest to earliest
      const sortedPlans = (plansResponse as LearningPlan[]).sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return dateB - dateA; // Latest first
      });

      setLearningPlans(sortedPlans);
      setProgressStats(statsResponse);
      setSubscriptionStatus(subscriptionResponse);
      console.log('📊 Subscription status loaded:', subscriptionResponse);

      // If user doesn't have preferences set, infer from most recent learning plan
      if ((!finalLanguage || finalLanguage === 'english') && plansResponse && plansResponse.length > 0) {
        const mostRecentPlan = plansResponse[0] as LearningPlan;
        if (mostRecentPlan.language) {
          finalLanguage = mostRecentPlan.language;
        }
        if (mostRecentPlan.proficiency_level) {
          finalLevel = mostRecentPlan.proficiency_level;
        }
      }

      // Update state with final values
      setUserLanguage(finalLanguage);
      setUserLevel(finalLevel);

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleRetry = () => {
    loadDashboardData();
  };

  const handleContinueLearning = (planId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('Conversation', { planId });
  };

  const handleViewDetails = (plan: LearningPlan) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handleStartNewSession = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowSessionTypeModal(true);
  };

  const handleSelectQuickPractice = () => {
    navigation.navigate('LanguageSelection', { mode: 'practice' });
  };

  const handleSelectAssessment = () => {
    navigation.navigate('AssessmentLanguageSelection');
  };

  const handleModalContinueLearning = () => {
    if (selectedPlan) {
      setShowDetailsModal(false);
      navigation.navigate('Conversation', { planId: selectedPlan.id });
    }
  };

  const handleUpgradePress = () => {
    console.log('📱 handleUpgradePress called in DashboardScreen');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('📱 Setting showPricingModal to true');
    setShowPricingModal(true);
    console.log('📱 showPricingModal state updated');
  };

  const handleDismissBanner = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBannerDismissed(true);
  };

  const handleSelectPlan = (planId: string, period: 'monthly' | 'annual') => {
    setShowPricingModal(false);
    // Navigate to checkout screen
    navigation.navigate('Checkout', { planId, period });
  };

  const handleCreatePlan = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    console.log('📝 Navigating to Speaking Assessment to create learning plan');

    // Navigate to speaking assessment - required to create a learning plan
    navigation.navigate('AssessmentLanguageSelection');
  };

  const handleCreateNextPlan = (plan: LearningPlan) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('📝 Opening create next plan modal for plan:', plan.id);
    setSelectedCreatePlan(plan);
    setShowCreateNextPlanModal(true);
  };


  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    const firstName = userName?.split(' ')[0] || 'there';
    let greeting = '';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      greeting = 'Good evening';
    } else {
      greeting = 'Good night';
    }

    return `${greeting}, ${firstName}`;
  };

  // Loading State
  if (loading) {
    return <ImmersiveLoader message="Loading your learning journey..." />;
  }

  // Error State
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.turquoise} barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>

        {/* Pricing Modal */}
        <PricingModal
          visible={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={handleSelectPlan}
        />

        {/* Session Type Modal */}
        <SessionTypeModal
          visible={showSessionTypeModal}
          onClose={() => setShowSessionTypeModal(false)}
          onSelectQuickPractice={handleSelectQuickPractice}
          onSelectAssessment={handleSelectAssessment}
        />

      </SafeAreaView>
    );
  }

  // Empty State
  if (learningPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.turquoise} barStyle="light-content" />
        {/* iOS-Native Header WITH USER BUTTON */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.headerActions}>
            {/* Upgrade Button - only show for free users */}
            {subscriptionStatus?.plan === 'free' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradePress}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles" size={22} color="#4FD1C5" />
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Subscription Banner for empty state */}
          {subscriptionStatus && !bannerDismissed && (
            <View style={{ width: '100%', marginBottom: 16 }}>
              <SubscriptionBanner
                plan={subscriptionStatus.plan}
                sessionsRemaining={subscriptionStatus.limits?.sessions_remaining || 0}
                onUpgradePress={handleUpgradePress}
                onDismiss={handleDismissBanner}
              />
            </View>
          )}

          <Ionicons name="book-outline" size={72} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Learning Plans Yet</Text>
          <Text style={styles.emptyMessage}>
            Start practicing right away or create a personalized learning plan!
          </Text>

          {/* Session Cards Container */}
          <View style={styles.sessionCardsContainer}>
            {/* Quick Practice Card */}
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={handleSelectQuickPractice}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.turquoise, '#3DA89D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sessionCardGradient}
              >
                <View style={styles.sessionCardContent}>
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionIconContainer}>
                      <Ionicons name="chatbubbles" size={26} color="#FFFFFF" />
                    </View>
                    <View style={styles.popularBadge}>
                      <Ionicons name="star" size={9} color="#FFD63A" />
                      <Text style={styles.popularText}>POPULAR</Text>
                    </View>
                  </View>

                  <Text style={styles.sessionCardTitle}>Quick Practice</Text>
                  <Text style={styles.sessionCardDescription}>
                    Start a real conversation to improve your skills
                  </Text>

                  <View style={styles.sessionFeatures}>
                    <View style={styles.featureBadge}>
                      <Ionicons name="time" size={12} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureBadgeText}>Flexible</Text>
                    </View>
                    <View style={styles.featureBadge}>
                      <Ionicons name="chatbox-ellipses" size={12} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureBadgeText}>Real-time</Text>
                    </View>
                    <View style={styles.featureBadge}>
                      <Ionicons name="rocket" size={12} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureBadgeText}>Instant start</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Learning Plan Card */}
            <TouchableOpacity
              style={styles.sessionCard}
              onPress={handleCreatePlan}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sessionCardGradient}
              >
                <View style={styles.sessionCardContent}>
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionIconContainer}>
                      <Ionicons name="calendar" size={26} color="#FFFFFF" />
                    </View>
                  </View>

                  <Text style={styles.sessionCardTitle}>Create Learning Plan</Text>
                  <Text style={styles.sessionCardDescription}>
                    Build a personalized plan to reach your goals
                  </Text>

                  <View style={styles.sessionFeatures}>
                    <View style={styles.featureBadge}>
                      <Ionicons name="person" size={12} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureBadgeText}>Personalized</Text>
                    </View>
                    <View style={styles.featureBadge}>
                      <Ionicons name="list" size={12} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureBadgeText}>Structured</Text>
                    </View>
                    <View style={styles.featureBadge}>
                      <Ionicons name="trophy" size={12} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureBadgeText}>Track progress</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Pricing Modal */}
        <PricingModal
          visible={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={handleSelectPlan}
        />

        {/* Session Type Modal */}
        <SessionTypeModal
          visible={showSessionTypeModal}
          onClose={() => setShowSessionTypeModal(false)}
          onSelectQuickPractice={handleSelectQuickPractice}
          onSelectAssessment={handleSelectAssessment}
        />

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.turquoise} barStyle="light-content" />
      {/* iOS-Native Header WITH USER BUTTON - THIS IS WHAT YOU WANT! */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerActions}>
          {/* Upgrade Button - only show for free users */}
          {subscriptionStatus?.plan === 'free' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradePress}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={22} color="#4FD1C5" />
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Banner */}
        {subscriptionStatus && !bannerDismissed && (
          <>
            {console.log('🎯 Rendering SubscriptionBanner with plan:', subscriptionStatus.plan)}
            <SubscriptionBanner
              plan={subscriptionStatus.plan}
              sessionsRemaining={subscriptionStatus.limits?.sessions_remaining || 0}
              onUpgradePress={handleUpgradePress}
              onDismiss={handleDismissBanner}
            />
          </>
        )}

        {/* Hero Greeting Section - Premium Design */}
        <View style={styles.titleSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getTimeBasedGreeting()}</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Ionicons name="flame" size={16} color="#D97706" />
              <Text style={styles.statBadgeText}>3 day streak</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={16} color="#1D4ED8" />
              <Text style={styles.levelBadgeText}>{userLevel.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Learning Plans Carousel - Compact Cards */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentPlanIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {learningPlans.map((plan, index) => {
              // Check if a next-level plan already exists for this plan
              const hasNextPlanCreated = learningPlans.some(
                p => p.previous_plan_id === plan.id
              );

              return (
                <View key={plan.id || index} style={styles.cardContainer}>
                  <LearningPlanCard
                    plan={plan}
                    progressStats={progressStats}
                    onContinue={() => handleContinueLearning(plan.id)}
                    onViewDetails={() => handleViewDetails(plan)}
                    onViewAssessment={() => {
                      setSelectedAssessmentPlan(plan);
                      setShowAssessmentModal(true);
                    }}
                    onCreateNextPlan={hasNextPlanCreated ? undefined : () => handleCreateNextPlan(plan)}
                  />
                </View>
              );
            })}
          </ScrollView>

          {/* Pagination Dots */}
          {learningPlans.length > 1 && (
            <View style={styles.paginationDots}>
              {learningPlans.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentPlanIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Divider - Compact */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Start New Session Button - Modern Animated Gradient Design */}
        <Animated.View
          style={[
            styles.newSessionButtonContainer,
            {
              transform: [
                { translateY: buttonFloatAnim },
                { scale: buttonScaleAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.newSessionButton}
            onPress={handleStartNewSession}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.turquoise, '#3DA89D', '#2D9E93']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newSessionGradient}
            >
              {/* Content */}
              <View style={styles.newSessionContent}>
                <View style={styles.newSessionIconContainer}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F0FDFA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradientBg}
                  >
                    <Ionicons name="add-circle" size={28} color={COLORS.turquoise} />
                  </LinearGradient>
                </View>
                <View style={styles.newSessionTextContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.newSessionTitle}>Start New Session</Text>
                    <View style={styles.newBadge}>
                      <Ionicons name="sparkles" size={10} color="#FFD63A" />
                    </View>
                  </View>
                  <Text style={styles.newSessionSubtitle}>
                    Choose Quick Practice or Assessment
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.95)" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Learning Plan Details Modal */}
      {selectedPlan && (
        <LearningPlanDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          plan={selectedPlan}
          progressStats={progressStats}
          onContinueLearning={handleModalContinueLearning}
        />
      )}

      {/* Pricing Modal */}
      <PricingModal
        visible={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Session Type Modal */}
      <SessionTypeModal
        visible={showSessionTypeModal}
        onClose={() => setShowSessionTypeModal(false)}
        onSelectQuickPractice={handleSelectQuickPractice}
        onSelectAssessment={handleSelectAssessment}
      />

      {/* Assessment Results Modal */}
      {showAssessmentModal && selectedAssessmentPlan && selectedAssessmentPlan.final_assessment?.attempts?.length > 0 && (
        <Modal
          visible={showAssessmentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAssessmentModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 500, maxHeight: '85%', backgroundColor: 'white', borderRadius: 20, padding: 24 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {(() => {
                  const lastAttempt = selectedAssessmentPlan.final_assessment.attempts[selectedAssessmentPlan.final_assessment.attempts.length - 1];
                  return (
                    <>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: lastAttempt.passed ? '#10B981' : '#EF4444' }}>
                          {lastAttempt.passed ? '🎉 Passed!' : '📚 Not Passed'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowAssessmentModal(false)}>
                          <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>

                      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#1F2937' }}>
                        {selectedAssessmentPlan.language.charAt(0).toUpperCase() + selectedAssessmentPlan.language.slice(1)} {selectedAssessmentPlan.proficiency_level} Assessment
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                        {new Date(lastAttempt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>

                      <View style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 14, color: '#6B7280' }}>Overall Score</Text>
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{lastAttempt.overall_score}/100</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 14, color: '#6B7280' }}>{selectedAssessmentPlan.proficiency_level} Mastery</Text>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{lastAttempt.current_level_mastery}/100</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 14, color: '#6B7280' }}>Next Level Readiness</Text>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{lastAttempt.next_level_readiness}/100</Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1F2937' }}>Skill Scores</Text>
                      <View style={{ marginBottom: 16 }}>
                        {Object.entries(lastAttempt.scores).map(([skill, score]) => (
                          <View key={skill} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ fontSize: 14, color: '#6B7280', textTransform: 'capitalize' }}>{skill}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{score as number}/100</Text>
                          </View>
                        ))}
                      </View>

                      {lastAttempt.strengths && lastAttempt.strengths.length > 0 && (
                        <>
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#10B981' }}>✓ Strengths</Text>
                          <View style={{ marginBottom: 16 }}>
                            {lastAttempt.strengths.map((strength: string, idx: number) => (
                              <Text key={idx} style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>• {strength}</Text>
                            ))}
                          </View>
                        </>
                      )}

                      {lastAttempt.areas_for_improvement && lastAttempt.areas_for_improvement.length > 0 && (
                        <>
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#F59E0B' }}>→ Areas for Improvement</Text>
                          <View style={{ marginBottom: 16 }}>
                            {lastAttempt.areas_for_improvement.map((area: string, idx: number) => (
                              <Text key={idx} style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>• {area}</Text>
                            ))}
                          </View>
                        </>
                      )}

                      {lastAttempt.feedback && (
                        <>
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1F2937' }}>Feedback</Text>
                          <Text style={{ fontSize: 14, color: '#4B5563', marginBottom: 16, lineHeight: 20 }}>
                            {lastAttempt.feedback}
                          </Text>
                        </>
                      )}

                      {selectedAssessmentPlan.final_assessment.attempts.length > 1 && (
                        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                          Attempt {selectedAssessmentPlan.final_assessment.attempts.length} of {selectedAssessmentPlan.final_assessment.attempts.length}
                        </Text>
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Create Next Level Plan Modal */}
      {showCreateNextPlanModal && selectedCreatePlan && (
        <Modal
          visible={showCreateNextPlanModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateNextPlanModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', flexDirection: 'column' }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937' }}>
                  Create {(() => {
                    const levelMap: Record<string, string> = {
                      'A1': 'A2',
                      'A2': 'B1',
                      'B1': 'B2',
                      'B2': 'C1',
                      'C1': 'C2',
                    };
                    return levelMap[selectedCreatePlan.proficiency_level.toUpperCase()] || 'Next Level';
                  })()} Plan
                </Text>
                <TouchableOpacity onPress={() => setShowCreateNextPlanModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#10B981' }}>
                  <Text style={{ fontSize: 14, color: '#047857' }}>
                    📚 {selectedCreatePlan.language.charAt(0).toUpperCase() + selectedCreatePlan.language.slice(1)} • {(() => {
                      const levelMap: Record<string, string> = {
                        'A1': 'A2',
                        'A2': 'B1',
                        'B1': 'B2',
                        'B2': 'C1',
                        'C1': 'C2',
                      };
                      return levelMap[selectedCreatePlan.proficiency_level.toUpperCase()] || 'Next Level';
                    })()} Level
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
                  Choose Your Plan Duration
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {[1, 2, 3, 4, 5, 6].map(months => (
                    <TouchableOpacity
                      key={months}
                      onPress={() => setSelectedDuration(months)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: selectedDuration === months ? '#10B981' : '#E5E7EB',
                        backgroundColor: selectedDuration === months ? '#ECFDF5' : 'white'
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: selectedDuration === months ? '#047857' : '#4B5563'
                      }}>
                        {months} {months === 1 ? 'Month' : 'Months'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
                  Select Your Learning Goals
                </Text>

                {/* Predefined Goals */}
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {['Business Communication', 'Travel & Tourism', 'Academic Writing', 'Daily Conversations', 'Professional Presentations', 'Job Interviews'].map(goal => (
                    <TouchableOpacity
                      key={goal}
                      onPress={() => {
                        setSelectedGoals(prev =>
                          prev.includes(goal)
                            ? prev.filter(g => g !== goal)
                            : [...prev, goal]
                        );
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: selectedGoals.includes(goal) ? '#10B981' : '#E5E7EB',
                        backgroundColor: selectedGoals.includes(goal) ? '#ECFDF5' : 'white'
                      }}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selectedGoals.includes(goal) ? '#10B981' : '#D1D5DB',
                        backgroundColor: selectedGoals.includes(goal) ? '#10B981' : 'white',
                        marginRight: 12,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedGoals.includes(goal) && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: selectedGoals.includes(goal) ? '#047857' : '#4B5563'
                      }}>
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#6B7280' }}>
                  Additional Goals (Optional)
                </Text>

                <TextInput
                  value={customGoals}
                  onChangeText={setCustomGoals}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: 14,
                    minHeight: 60,
                    textAlignVertical: 'top'
                  }}
                  placeholder="Any other specific goals..."
                  multiline
                  numberOfLines={2}
                />
              </ScrollView>

              {/* Fixed Footer with Create Button */}
              <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: 'white' }}>
                <TouchableOpacity
                  onPress={async () => {
                    // Validation: Require at least duration selection (goals are optional)
                    if (!selectedDuration) {
                      Alert.alert('Duration Required', 'Please select a plan duration before creating your learning plan.');
                      return;
                    }

                    setCreatingPlan(true);
                    try {
                      const token = await AsyncStorage.getItem('auth_token');

                      // Combine selected goals and custom goals
                      const allGoals = [...selectedGoals];
                      if (customGoals.trim()) {
                        allGoals.push(customGoals.trim());
                      }

                      console.log('[CREATE_PLAN] Creating plan with duration:', selectedDuration, 'goals:', allGoals);

                      const response = await fetch(`${API_BASE_URL}/api/learning-plans/create-next-level`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          current_plan_id: selectedCreatePlan.id,
                          duration_months: selectedDuration,
                          goals: allGoals.length > 0 ? allGoals : null,
                          custom_goal: allGoals.length > 0 ? allGoals.join(', ') : null
                        })
                      });

                      if (response.ok) {
                        console.log('[CREATE_PLAN] ✅ Next level plan created successfully');
                        setShowCreateNextPlanModal(false);
                        setSelectedGoals([]);
                        setCustomGoals('');
                        setSelectedDuration(null); // Reset - user must select again

                        // Refresh dashboard to show new plan
                        await loadDashboardData();

                        Alert.alert(
                          'Success!',
                          'Your next level learning plan has been created!',
                          [{ text: 'OK' }]
                        );
                      } else {
                        const errorData = await response.json();
                        console.error('[CREATE_PLAN] ❌ Failed to create plan:', errorData);
                        Alert.alert('Error', 'Failed to create learning plan. Please try again.');
                      }
                    } catch (error) {
                      console.error('[CREATE_PLAN] Error:', error);
                      Alert.alert('Error', 'An error occurred. Please try again.');
                    } finally {
                      setCreatingPlan(false);
                    }
                  }}
                  disabled={creatingPlan || !selectedDuration}
                  style={{
                    backgroundColor: (creatingPlan || !selectedDuration) ? '#9CA3AF' : '#10B981',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    shadowColor: selectedDuration ? '#10B981' : '#9CA3AF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: selectedDuration ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: selectedDuration ? 4 : 2
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {creatingPlan ? 'Creating...' : !selectedDuration ? 'Select Duration First' : 'Create Learning Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;