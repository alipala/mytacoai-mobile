import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  ActionSheetIOS,
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
import { CreateLearningPlanModal } from '../../components/CreateLearningPlanModal';
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
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from storage
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        
        // Use name and surname
        const displayName = [user.first_name, user.last_name]
          .filter(Boolean)
          .join(' ') || user.name || user.email?.split('@')[0] || 'User';
        
        setUserName(displayName);
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

    // iOS-native ActionSheet
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Choose Session Type',
          message: 'Select how you want to practice',
          options: ['Cancel', 'Quick Practice', 'Speaking Assessment'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Navigate to practice flow
            navigation.navigate('LanguageSelection', { mode: 'practice' });
          } else if (buttonIndex === 2) {
            // Navigate to assessment flow
            navigation.navigate('AssessmentLanguageSelection');
          }
        }
      );
    } else {
      // Android fallback
      Alert.alert(
        'Choose Session Type',
        'Select how you want to practice',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Quick Practice',
            onPress: () => navigation.navigate('LanguageSelection', { mode: 'practice' }),
          },
          {
            text: 'Speaking Assessment',
            onPress: () => navigation.navigate('AssessmentLanguageSelection'),
          },
        ]
      );
    }
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
    setShowCreatePlanModal(true);
  };

  const handlePlanCreated = async () => {
    setShowCreatePlanModal(false);
    // Reload dashboard data to show the new plan
    await loadDashboardData();
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
          },
        },
      ]
    );
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
                <Ionicons name="sparkles" size={18} color="#4FD1C5" />
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}

            {/* iOS-Standard Text Button */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleLogout}
              activeOpacity={0.6}
            >
              <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.profileText}>{userName}</Text>
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
              <Ionicons name="sparkles" size={18} color="#4FD1C5" />
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}

          {/* iOS-Standard Text Button (not rounded pill) */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleLogout}
            activeOpacity={0.6}
          >
            <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.profileText}>{userName}</Text>
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

        {/* Title Section - Compact */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Your Learning Journey</Text>
          <Text style={styles.subtitle}>
            Continue your progress and achieve your language goals
          </Text>
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

        {/* Start New Session Button - NOW VISIBLE! */}
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={handleStartNewSession}
          activeOpacity={0.7}
        >
          <View style={styles.newSessionContent}>
            <Ionicons name="add-circle-outline" size={24} color="#4FD1C5" />
            <View style={styles.newSessionTextContainer}>
              <Text style={styles.newSessionTitle}>Start New Session</Text>
              <Text style={styles.newSessionSubtitle}>Practice or Assessment</Text>
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

      {/* Create Learning Plan Modal */}
      <CreateLearningPlanModal
        visible={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onCreate={handlePlanCreated}
        language="english"
        recommendedLevel="intermediate"
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;