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
import { COLORS } from '../../constants/colors';
import { styles } from './styles/DashboardScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);

  // Animation refs for Start New Session button
  const buttonFloatAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadDashboardData();

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
  }, []);

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
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FD1C5" />
          <Text style={styles.loadingText}>Loading your learning journey...</Text>
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

  // Error State
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
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
            <View style={{ width: '100%', paddingBottom: 20 }}>
              <SubscriptionBanner
                plan={subscriptionStatus.plan}
                sessionsRemaining={subscriptionStatus.limits?.sessions_remaining || 0}
                onUpgradePress={handleUpgradePress}
                onDismiss={handleDismissBanner}
              />
            </View>
          )}

          <Ionicons name="book-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Learning Plans Yet</Text>
          <Text style={styles.emptyMessage}>
            Start practicing right away or create a personalized learning plan!
          </Text>

          {/* Quick Practice Button */}
          <TouchableOpacity
            style={styles.quickPracticeButton}
            onPress={() => navigation.navigate('LanguageSelection', { mode: 'practice' })}
          >
            <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
            <Text style={styles.quickPracticeButtonText}>Start Quick Practice</Text>
          </TouchableOpacity>

          {/* Create Plan Button */}
          <TouchableOpacity
            style={styles.createPlanButton}
            onPress={handleCreatePlan}
          >
            <Ionicons name="add-circle" size={20} color="#4FD1C5" />
            <Text style={styles.createPlanButtonText}>Create Learning Plan</Text>
          </TouchableOpacity>
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
            {learningPlans.map((plan, index) => (
              <View key={plan.id || index} style={styles.cardContainer}>
                <LearningPlanCard
                  plan={plan}
                  progressStats={progressStats}
                  onContinue={() => handleContinueLearning(plan.id)}
                  onViewDetails={() => handleViewDetails(plan)}
                />
              </View>
            ))}
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
    </SafeAreaView>
  );
};

export default DashboardScreen;