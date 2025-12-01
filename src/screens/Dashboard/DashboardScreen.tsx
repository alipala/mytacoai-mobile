import React, { useState, useEffect } from 'react';
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
} from 'react-native';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

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

      setLearningPlans(plansResponse as LearningPlan[]);
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


  const handleLogoutPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowLogoutModal(false);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const handleCancelLogout = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowLogoutModal(false);
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
                <Ionicons name="sparkles" size={20} color="#4FD1C5" />
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}

            {/* EXIT Button - Premium Design */}
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
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
              <Ionicons name="sparkles" size={20} color="#4FD1C5" />
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}

          {/* EXIT Button - Premium Design */}
          <TouchableOpacity
            style={styles.exitButton}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.greetingText}>Welcome back</Text>
              <Text style={styles.greetingEmoji}>👋</Text>
            </View>
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

        {/* Start New Session Button - Premium Design */}
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={handleStartNewSession}
          activeOpacity={0.8}
        >
          <View style={styles.newSessionContent}>
            <View style={styles.newSessionIconContainer}>
              <Ionicons name="add-circle" size={24} color="#4FD1C5" />
            </View>
            <View style={styles.newSessionTextContainer}>
              <Text style={styles.newSessionTitle}>Start New Session</Text>
              <Text style={styles.newSessionSubtitle}>Quick Practice or Assessment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
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

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <Pressable style={styles.logoutModalOverlay} onPress={handleCancelLogout}>
          <Pressable style={styles.logoutModalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.logoutModalHeader}>
              <View style={styles.logoutIconContainer}>
                <Ionicons name="log-out" size={32} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.logoutModalTitle}>Sign Out?</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to sign out? You'll need to log in again to access your learning progress.
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={handleCancelLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutConfirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;