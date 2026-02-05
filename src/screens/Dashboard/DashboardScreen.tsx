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
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { setBadgeCount } from '../../services/notificationService';
import { ProgressService, LearningService, StripeService } from '../../api/generated';
import type { LearningPlan } from '../../api/generated';
import { LearningPlanCard } from '../../components/LearningPlanCard';
import { CompactLearningPlanCard } from '../../components/CompactLearningPlanCard';
import { LearningPlanDetailsModal } from '../../components/LearningPlanDetailsModal';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { PricingModal } from '../../components/PricingModal';
import { SessionTypeModal } from '../../components/SessionTypeModal';
import TransitionWrapper from '../../components/TransitionWrapper';
import { COLORS } from '../../constants/colors';
import { styles } from './styles/DashboardScreen.styles';
import { DNAProfileWidget } from '../../components/SpeakingDNA/DNAProfileWidget';
import { CollapsibleLanguageGroup } from '../../components/CollapsibleLanguageGroup';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { API_BASE_URL } from '../../api/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userLanguage, setUserLanguage] = useState<string>('english');
  const [userLevel, setUserLevel] = useState<string>('intermediate');
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [selectedAssessmentPlan, setSelectedAssessmentPlan] = useState<LearningPlan | null>(null);
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [languagesWithDNA, setLanguagesWithDNA] = useState<Set<string>>(new Set());

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPremiumBenefitsModal, setShowPremiumBenefitsModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);

  // Notifications state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

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

  const fetchNotifications = async () => {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) return { notifications: [], unread_count: 0 };

      const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      // Filter valid notifications
      const validNotifications = (data.notifications || []).filter((notif: any) => {
        return notif && (notif.id || notif.notification_id) && notif.notification;
      });

      setNotifications(validNotifications);
      const newUnreadCount = data.unread_count || 0;
      setUnreadCount(newUnreadCount);

      // Update iOS badge count
      await setBadgeCount(newUnreadCount);

      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unread_count: 0 };
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.notification_id === notificationId);
      if (notification?.is_read) {
        const swipeableRef = swipeableRefs.current[notificationId];
        if (swipeableRef) swipeableRef.close();
        return;
      }

      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) return;

      try {
        await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notification_id: notificationId }),
        });
      } catch (backendError: any) {
        if (!backendError.message?.includes('already read') && !backendError.message?.includes('not found')) {
          throw backendError;
        }
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count
      if (!notification?.is_read) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        await setBadgeCount(newUnreadCount);
      }

      const swipeableRef = swipeableRefs.current[notificationId];
      if (swipeableRef) swipeableRef.close();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const notification = notifications.find(n => n.notification_id === notificationId);
      const wasUnread = notification && !notification.is_read;

      const authToken = await AsyncStorage.getItem('auth_token');
      if (authToken) {
        try {
          await fetch(`${API_BASE_URL}/api/notifications/delete`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notification_id: notificationId }),
          });
        } catch (backendError: any) {
          console.error('Backend deletion failed:', backendError);
        }
      }

      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));

      // Update unread count
      if (wasUnread) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        await setBadgeCount(newUnreadCount);
      }

      const swipeableRef = swipeableRefs.current[notificationId];
      if (swipeableRef) swipeableRef.close();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

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

      // Load learning plans, progress stats, subscription status, notifications, and DNA profiles in parallel
      const [plansResponse, statsResponse, subscriptionResponse, notificationsResponse] = await Promise.all([
        LearningService.getUserLearningPlansApiLearningPlansGet(),
        ProgressService.getProgressStatsApiProgressStatsGet(),
        StripeService.getSubscriptionStatusApiStripeSubscriptionStatusGet(),
        fetchNotifications(),
      ]);

      // Sort learning plans by most recently interacted (updated_at) first
      // If updated_at doesn't exist, fallback to created_at
      const sortedPlans = (plansResponse as LearningPlan[]).sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || '').getTime();
        const dateB = new Date(b.updated_at || b.created_at || '').getTime();
        return dateB - dateA; // Most recently interacted first
      });

      console.log('📚 Learning plans sorted by last interaction:');
      sortedPlans.forEach((plan, index) => {
        console.log(`  ${index + 1}. ${plan.language} (${plan.proficiency_level}) - Last updated: ${plan.updated_at || plan.created_at}`);
      });

      setLearningPlans(sortedPlans);
      setProgressStats(statsResponse);
      setSubscriptionStatus(subscriptionResponse);
      console.log('📊 Subscription status loaded:', subscriptionResponse);

      // Check which languages have DNA profiles by calling the API
      // Get unique languages from learning plans
      const uniqueLanguages = [...new Set(sortedPlans.map(plan => plan.language || 'english'))];
      const dnaLanguages = new Set<string>();

      // Check DNA profile for each language (only if user is premium)
      const hasPremium = subscriptionResponse && !['try_learn', 'free'].includes(subscriptionResponse.plan);
      if (hasPremium && uniqueLanguages.length > 0) {
        console.log('🧬 Checking DNA profiles for languages:', uniqueLanguages);

        // Check each language in parallel
        const dnaCheckPromises = uniqueLanguages.map(async (language) => {
          try {
            const profile = await speakingDNAService.getProfile(language, true); // Force refresh to bypass cache
            if (profile && profile.sessions_analyzed > 0) {
              console.log(`✅ DNA profile exists for ${language} (${profile.sessions_analyzed} sessions)`);
              return language;
            }
            console.log(`❌ No DNA profile for ${language}`);
            return null;
          } catch (error) {
            console.log(`❌ Error checking DNA for ${language}:`, error);
            return null;
          }
        });

        const results = await Promise.all(dnaCheckPromises);
        results.forEach(lang => {
          if (lang) dnaLanguages.add(lang);
        });
      }

      setLanguagesWithDNA(dnaLanguages);
      console.log('🧬 Languages with DNA:', Array.from(dnaLanguages));

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

    // Check if user is already premium
    const isPremium = subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan);

    if (isPremium) {
      console.log('📱 User is premium - showing benefits modal');
      setShowPremiumBenefitsModal(true);
    } else {
      console.log('📱 User is free - showing pricing modal');
      setShowPricingModal(true);
    }
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
      greeting = t('dashboard.greeting.morning');
    } else if (hour >= 12 && hour < 17) {
      greeting = t('dashboard.greeting.afternoon');
    } else if (hour >= 17 && hour < 22) {
      greeting = t('dashboard.greeting.evening');
    } else {
      greeting = t('dashboard.greeting.night');
    }

    return `${greeting}, ${firstName}`;
  };

  // Main content render
  const renderContent = () => {
    // Error State
    if (error) {
      return (
        <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.turquoise} barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>{t('modals.error.title')}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>{t('modals.error.button_retry')}</Text>
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
            source={require('../../assets/logo-transparent.png')}
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
                <Ionicons name="sparkles" size={22} color="#14B8A6" />
                <Text style={styles.upgradeButtonText}>{t('subscription.title')}</Text>
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
          {/* Determine if user is subscribed */}
          {(() => {
            // Premium plans: fluency_builder, language_mastery (formerly team_mastery)
            // Free plan: try_learn, free
            const isSubscribed = subscriptionStatus &&
              !['try_learn', 'free'].includes(subscriptionStatus.plan);
            const sessionLimit = subscriptionStatus?.limits?.sessions_remaining || 0;
            const minutesRemaining = subscriptionStatus?.limits?.minutes_remaining || 0;

            return (
              <>
                {/* Premium User - Clear Status Badge */}
                {isSubscribed && (
                  <View style={styles.premiumStatusBadgeContainer}>
                    <LinearGradient
                      colors={['rgba(255, 214, 58, 0.15)', 'rgba(255, 214, 58, 0.08)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.premiumStatusBadge}
                    >
                      <View style={styles.premiumStatusIconCircle}>
                        <Text style={styles.crownEmoji}>👑</Text>
                      </View>
                      <View style={styles.premiumStatusTextContainer}>
                        <Text style={styles.premiumStatusTitle}>{t('dashboard.header.premium_badge')}</Text>
                        <Text style={styles.premiumStatusSubtitle}>
                          {t('dashboard.header.minutes_remaining', { minutes: minutesRemaining })}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                )}

                {/* Free User - Action Cards Only (No Header) */}
                {!isSubscribed && (
                  <View style={styles.freeUserContainer}>
                    {/* SECONDARY - Quick Practice (Smaller, above primary) */}
                    <TouchableOpacity
                      style={styles.secondaryCardNew}
                      onPress={handleSelectQuickPractice}
                      activeOpacity={0.9}
                    >
                      <View style={styles.secondaryCardIcon}>
                        <Ionicons name="mic-circle" size={32} color={COLORS.turquoise} />
                      </View>
                      <View style={styles.secondaryCardText}>
                        <Text style={styles.secondaryCardTitleNew}>{t('dashboard.quick_start.button_freestyle')}</Text>
                        <Text style={styles.secondaryCardSubtitle}>{t('practice.conversation.subtitle')}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* PRIMARY - Create Learning Plan (Larger, Turquoise) */}
                    <TouchableOpacity
                      style={styles.primaryCardNew}
                      onPress={handleCreatePlan}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['rgba(20, 184, 166, 0.15)', 'rgba(20, 184, 166, 0.08)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryCardGradientNew}
                      >
                        <View style={styles.primaryCardHeaderNew}>
                          <View style={styles.primaryIconContainerNew}>
                            <Ionicons name="pulse" size={36} color="#FFFFFF" />
                          </View>
                        </View>

                        <Text style={styles.primaryCardTitleNew}>{t('assessment.speaking.title')}</Text>
                        <Text style={styles.primaryCardDescriptionNew}>
                          {t('assessment.speaking.subtitle')}
                        </Text>

                        <View style={styles.primaryFeaturesNew}>
                          <View style={styles.featurePill}>
                            <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.featurePillText}>{t('onboarding.benefits.pill_unlimited_practice')}</Text>
                          </View>
                          <View style={styles.featurePill}>
                            <Ionicons name="list-outline" size={14} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.featurePillText}>{t('profile.dna.button_track_progress')}</Text>
                          </View>
                          <View style={styles.featurePill}>
                            <Ionicons name="trophy-outline" size={14} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.featurePillText}>{t('profile.progress.title')}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Usage Limits - Subtle Banner */}
                    <View style={styles.usageLimitsBanner}>
                      <Ionicons name="time-outline" size={18} color="#FFA955" />
                      <Text style={styles.usageLimitsText}>
                        {minutesRemaining > 0
                          ? t('units.minutes_plural', { count: Math.round(minutesRemaining) })
                          : t('units.sessions_plural', { count: sessionLimit })
                        }
                      </Text>
                    </View>

                    {/* Upgrade Link - More Noticeable */}
                    <TouchableOpacity
                      style={styles.upgradeLinkContainer}
                      onPress={handleUpgradePress}
                      activeOpacity={0.8}
                    >
                      <View style={styles.upgradeIconCircle}>
                        <Ionicons name="sparkles" size={18} color="#FFD63A" />
                      </View>
                      <Text style={styles.upgradeLinkText}>{t('subscription.title')}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#4ECFBF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Premium User - Focused Activation Flow */}
                {isSubscribed && (
                  <View style={styles.premiumUserContainer}>
                    {/* PRIMARY CTA - Speaking Assessment (Dominant, Full Focus) */}
                    <TouchableOpacity
                      style={styles.premiumPrimaryCard}
                      onPress={handleCreatePlan}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['rgba(20, 184, 166, 0.15)', 'rgba(20, 184, 166, 0.08)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.premiumPrimaryGradient}
                      >
                        <View style={styles.premiumPrimaryIconContainer}>
                          <Ionicons name="analytics" size={40} color="#FFFFFF" />
                        </View>

                        <Text style={styles.premiumPrimaryTitle}>{t('assessment.speaking.title')}</Text>
                        <Text style={styles.premiumPrimarySubtitle}>
                          {t('assessment.speaking.subtitle')}
                        </Text>

                        <View style={styles.premiumFeaturePills}>
                          <View style={styles.premiumPill}>
                            <Ionicons name="person-outline" size={13} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.premiumPillText}>{t('onboarding.benefits.pill_unlimited_practice')}</Text>
                          </View>
                          <View style={styles.premiumPill}>
                            <Ionicons name="list-outline" size={13} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.premiumPillText}>{t('profile.dna.button_track_progress')}</Text>
                          </View>
                          <View style={styles.premiumPill}>
                            <Ionicons name="trophy-outline" size={13} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.premiumPillText}>{t('profile.progress.title')}</Text>
                          </View>
                          <View style={styles.premiumPill}>
                            <Ionicons name="fitness-outline" size={13} color="rgba(255,255,255,0.95)" />
                            <Text style={styles.premiumPillText}>{t('profile.dna.title')}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Reassurance Section */}
                    <View style={styles.reassuranceSection}>
                      <View style={styles.reassuranceItem}>
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.reassuranceText}>{t('units.minutes', { count: 5 })}</Text>
                      </View>
                      <View style={styles.reassuranceItem}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6B7280" />
                        <Text style={styles.reassuranceText}>{t('practice.conversation.title')}</Text>
                      </View>
                      <View style={styles.reassuranceItem}>
                        <Ionicons name="shield-checkmark-outline" size={16} color="#6B7280" />
                        <Text style={styles.reassuranceText}>{t('common.please_wait')}</Text>
                      </View>
                    </View>

                    {/* SECONDARY CTA - Quick Practice (Optional, Clearly Secondary) */}
                    <TouchableOpacity
                      style={styles.premiumSecondaryCard}
                      onPress={handleSelectQuickPractice}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="mic-circle-outline" size={24} color="#4ECFBF" />
                      <Text style={styles.premiumSecondaryText}>{t('dashboard.quick_start.button_freestyle')}</Text>
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Tip for Premium Users */}
                {isSubscribed && (
                  <View style={styles.tipContainer}>
                    <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                    <Text style={styles.tipText}>
                      {t('toasts.info_coming_soon')}
                    </Text>
                  </View>
                )}
              </>
            );
          })()}
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

    // Main Dashboard Content
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.turquoise} barStyle="light-content" />
      {/* Header with Logo + Premium Badge + Streak Badge + Notifications */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo-minimal-transparent.png')}
          style={styles.logoMinimal}
          resizeMode="contain"
        />

        <View style={styles.headerActions}>
          {/* Premium Badge */}
          {subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan) && (
            <TouchableOpacity
              style={styles.premiumBadgeCompact}
              onPress={handleUpgradePress}
              activeOpacity={0.8}
            >
              {/* Outer glow for premium feel */}
              <View style={{
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: 14,
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                opacity: 0.5,
              }} />
              <Ionicons name="diamond-outline" size={16} color="#FBBF24" />
              <View>
                <Text style={styles.premiumTextCompact}>{t('dashboard.header.premium_badge')}</Text>
                <Text style={styles.premiumMinutesCompact}>
                  {t('dashboard.header.minutes_remaining', { minutes: subscriptionStatus?.limits?.minutes_remaining || 0 })}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Streak Badge */}
          {progressStats && (
            <TouchableOpacity
              style={styles.streakBadgeCompact}
              activeOpacity={0.8}
            >
              {/* Outer glow for streak */}
              <View style={{
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: 14,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                opacity: 0.5,
              }} />
              <Ionicons name="flame-outline" size={18} color="#EF4444" />
              <View>
                <Text style={styles.streakNumberCompact}>{progressStats.current_streak || 0}</Text>
                <Text style={styles.streakLabelCompact}>{t('units.days_plural', { count: progressStats.current_streak || 0 })}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Notifications Bell */}
          <TouchableOpacity
            style={styles.notificationBell}
            activeOpacity={0.8}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowNotificationsModal(true);
            }}
          >
            <Ionicons
              name={unreadCount > 0 ? "notifications" : "notifications-outline"}
              size={24}
              color="#14B8A6"
            />
            {/* Red Badge - Only shows when unreadCount > 0 */}
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -6,
                right: -6,
                backgroundColor: '#EF4444',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 5,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 6,
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: -0.5,
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
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
        {/* Subscription Banner - Only show for trial/expiring */}
        {subscriptionStatus && !bannerDismissed && subscriptionStatus.status === 'trialing' && (
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

        {/* Learning Plans Grouped by Language - Collapsible */}
        <View style={styles.languageGroupsContainer}>
          {(() => {
            // Group learning plans by language
            const plansByLanguage: Record<string, LearningPlan[]> = {};
            learningPlans.forEach(plan => {
              const lang = plan.language || 'english';
              if (!plansByLanguage[lang]) {
                plansByLanguage[lang] = [];
              }
              plansByLanguage[lang].push(plan);
            });

            // Get all plan IDs that have a next-level plan created
            const existingPlanIds = learningPlans
              .filter(p => p.previous_plan_id)
              .map(p => p.previous_plan_id!);

            // Get total count for dynamic height calculation
            const totalLanguageCount = Object.keys(plansByLanguage).length;

            // Render a CollapsibleLanguageGroup for each language
            return Object.entries(plansByLanguage).map(([language, plans]) => (
              <CollapsibleLanguageGroup
                key={language}
                language={language}
                plans={plans}
                progressStats={progressStats}
                isPremium={subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan)}
                onContinue={handleContinueLearning}
                onViewDetails={handleViewDetails}
                onViewAssessment={(plan) => {
                  setSelectedAssessmentPlan(plan);
                  setShowAssessmentModal(true);
                }}
                onCreateNextPlan={handleCreateNextPlan}
                onViewDNA={(lang) => navigation.navigate('SpeakingDNA', { language: lang })}
                existingPlanIds={existingPlanIds}
                totalLanguageCount={totalLanguageCount}
                hasDNAAnalysis={languagesWithDNA.has(language)}
                isExpanded={expandedLanguage === language}
                onToggleExpand={() => {
                  // Toggle: if clicking same group, collapse it; otherwise expand the new one
                  setExpandedLanguage(expandedLanguage === language ? null : language);
                }}
              />
            ));
          })()}
        </View>

        {/* Divider - Compact */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('common.or')}</Text>
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
              colors={['rgba(20, 184, 166, 0.12)', 'rgba(20, 184, 166, 0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newSessionGradient}
            >
              {/* Content */}
              <View style={styles.newSessionContent}>
                <View style={styles.newSessionIconContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="rocket" size={32} color="#14B8A6" />
                  </View>
                </View>
                <View style={styles.newSessionTextContainer}>
                  <Text style={styles.newSessionTitle}>{t('buttons.start')}</Text>
                  <Text style={styles.newSessionSubtitle}>
                    {t('dashboard.quick_start.subtitle')}
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={28} color="#14B8A6" />
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

      {/* Premium Benefits Modal */}
      <Modal
        visible={showPremiumBenefitsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPremiumBenefitsModal(false)}
      >
        <View style={styles.premiumBenefitsContainer}>
          <LinearGradient
            colors={['#0B1A1F', '#1F2937']}
            style={styles.premiumBenefitsGradient}
          >
            {/* Header */}
            <View style={styles.premiumBenefitsHeader}>
              <View style={styles.premiumBenefitsTitleRow}>
                <Ionicons name="diamond" size={32} color="#FBBF24" />
                <Text style={styles.premiumBenefitsTitle}>{t('dashboard.header.premium_badge')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPremiumBenefitsModal(false)}
                style={styles.premiumBenefitsCloseButton}
              >
                <Ionicons name="close" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.premiumBenefitsScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Subscription Info */}
              <View style={styles.premiumSubscriptionCard}>
                <Text style={styles.premiumSubscriptionPlan}>
                  {subscriptionStatus?.plan === 'annual_premium' ? t('subscription.plans.yearly') : t('subscription.plans.monthly')}
                </Text>
                <Text style={styles.premiumSubscriptionStatus}>
                  {t('dashboard.header.minutes_remaining', { minutes: subscriptionStatus?.limits?.minutes_remaining || 0 })}
                </Text>
              </View>

              {/* Benefits List */}
              <View style={styles.premiumBenefitsList}>
                <View style={styles.premiumBenefitItem}>
                  <View style={styles.premiumBenefitIconContainer}>
                    <Ionicons name="infinite" size={24} color="#14B8A6" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.unlimited_practice')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('onboarding.benefits.pill_unlimited_practice')}
                    </Text>
                  </View>
                </View>

                <View style={styles.premiumBenefitItem}>
                  <View style={styles.premiumBenefitIconContainer}>
                    <Ionicons name="mic" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('onboarding.benefits.pill_ai_tutor')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('onboarding.benefits.pill_instant_feedback')}
                    </Text>
                  </View>
                </View>

                <View style={styles.premiumBenefitItem}>
                  <View style={styles.premiumBenefitIconContainer}>
                    <Ionicons name="stats-chart" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.speaking_dna')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('subscription.features.advanced_feedback')}
                    </Text>
                  </View>
                </View>

                <View style={styles.premiumBenefitItem}>
                  <View style={styles.premiumBenefitIconContainer}>
                    <Ionicons name="flash" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.priority_support')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('subscription.features.priority_support')}
                    </Text>
                  </View>
                </View>

                <View style={styles.premiumBenefitItem}>
                  <View style={styles.premiumBenefitIconContainer}>
                    <Ionicons name="sparkles" size={24} color="#EC4899" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.custom_topics')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('explore.title')}
                    </Text>
                  </View>
                </View>

                <View style={styles.premiumBenefitItem}>
                  <View style={styles.premiumBenefitIconContainer}>
                    <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.no_ads')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('subscription.features.no_ads')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Thank You Message */}
              <View style={styles.premiumThankYouCard}>
                <Ionicons name="heart" size={32} color="#EF4444" />
                <Text style={styles.premiumThankYouText}>
                  {t('dashboard.header.premium_badge')}
                </Text>
                <Text style={styles.premiumThankYouSubtext}>
                  {t('subscription.subtitle')}
                </Text>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

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
                          {lastAttempt.passed ? t('modals.success.title') : t('modals.error.title')}
                        </Text>
                        <TouchableOpacity onPress={() => setShowAssessmentModal(false)}>
                          <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>

                      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#1F2937' }}>
                        {selectedAssessmentPlan.language.charAt(0).toUpperCase() + selectedAssessmentPlan.language.slice(1)} {selectedAssessmentPlan.proficiency_level} {t('assessment.speaking.title')}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                        {new Date(lastAttempt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>

                      <View style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 14, color: '#6B7280' }}>{t('assessment.results.score_overall')}</Text>
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{lastAttempt.overall_score}/100</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 14, color: '#6B7280' }}>{selectedAssessmentPlan.proficiency_level}</Text>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{lastAttempt.current_level_mastery}/100</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 14, color: '#6B7280' }}>{t('gamification.next_level')}</Text>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{lastAttempt.next_level_readiness}/100</Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1F2937' }}>{t('assessment.results.title')}</Text>
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
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#10B981' }}>{t('assessment.results.label_excellent')}</Text>
                          <View style={{ marginBottom: 16 }}>
                            {lastAttempt.strengths.map((strength: string, idx: number) => (
                              <Text key={idx} style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>• {strength}</Text>
                            ))}
                          </View>
                        </>
                      )}

                      {lastAttempt.areas_for_improvement && lastAttempt.areas_for_improvement.length > 0 && (
                        <>
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#F59E0B' }}>{t('assessment.results.label_needs_work')}</Text>
                          <View style={{ marginBottom: 16 }}>
                            {lastAttempt.areas_for_improvement.map((area: string, idx: number) => (
                              <Text key={idx} style={{ fontSize: 14, color: '#4B5563', marginBottom: 4 }}>• {area}</Text>
                            ))}
                          </View>
                        </>
                      )}

                      {lastAttempt.feedback && (
                        <>
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1F2937' }}>{t('onboarding.benefits.pill_instant_feedback')}</Text>
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
                  {t('buttons.start')} {(() => {
                    const levelMap: Record<string, string> = {
                      'A1': 'A2',
                      'A2': 'B1',
                      'B1': 'B2',
                      'B2': 'C1',
                      'C1': 'C2',
                    };
                    return levelMap[selectedCreatePlan.proficiency_level.toUpperCase()] || t('gamification.next_level');
                  })()}
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
                  {t('practice.conversation.subtitle')}
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
                        {months} {t('units.months_plural', { count: months })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
                  {t('dashboard.quick_start.subtitle')}
                </Text>

                {/* Predefined Goals */}
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {[t('practice.topics.business'), t('practice.topics.travel'), t('practice.topics.education'), t('practice.topics.family'), t('practice.topics.culture'), t('practice.topics.shopping')].map(goal => (
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
                  {t('practice.conversation.placeholder_type_message')}
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
                  placeholder={t('practice.conversation.placeholder_type_message')}
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
                      Alert.alert(t('modals.error.title'), t('errors.validation'));
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
                          t('modals.success.title'),
                          t('toasts.success_save'),
                          [{ text: t('buttons.ok') }]
                        );
                      } else {
                        const errorData = await response.json();
                        console.error('[CREATE_PLAN] ❌ Failed to create plan:', errorData);
                        Alert.alert(t('modals.error.title'), t('errors.validation'));
                      }
                    } catch (error) {
                      console.error('[CREATE_PLAN] Error:', error);
                      Alert.alert(t('modals.error.title'), t('errors.unknown'));
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
                    {creatingPlan ? t('common.processing') : !selectedDuration ? t('buttons.start') : t('assessment.speaking.title')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1A1F' }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(20, 184, 166, 0.2)',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="notifications" size={24} color="#14B8A6" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>
                {t('notifications.title')}
              </Text>
              {unreadCount > 0 && (
                <View style={{
                  backgroundColor: '#EF4444',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowNotificationsModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(107, 138, 132, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={24} color="#8CA5A0" />
            </TouchableOpacity>
          </View>

          {/* Notifications List with Swipe Actions */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const getNotificationIcon = (type: string) => {
                  switch (type) {
                    case 'Maintenance': return 'construct-outline';
                    case 'Special Offer': return 'gift-outline';
                    case 'Information': return 'information-circle-outline';
                    default: return 'notifications-outline';
                  }
                };

                const getNotificationColor = (type: string) => {
                  switch (type) {
                    case 'Maintenance': return '#F59E0B';
                    case 'Special Offer': return '#10B981';
                    case 'Information': return '#3B82F6';
                    default: return '#6B7280';
                  }
                };

                const notifColor = getNotificationColor(notification.notification.notification_type);
                const notificationId = notification.notification_id;

                const renderLeftActions = (dragX: Animated.AnimatedInterpolation<number>) => {
                  const trans = dragX.interpolate({
                    inputRange: [0, 100],
                    outputRange: [-100, 0],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      style={{
                        transform: [{ translateX: trans }],
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        marginBottom: 12,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#EF4444',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 90,
                          borderRadius: 12,
                          marginRight: 8,
                        }}
                        onPress={() => {
                          Alert.alert(
                            t('notifications.delete'),
                            t('modals.confirm.title'),
                            [
                              { text: t('buttons.cancel'), style: 'cancel' },
                              {
                                text: t('buttons.delete'),
                                style: 'destructive',
                                onPress: () => deleteNotification(notificationId),
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash" size={28} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                };

                const renderRightActions = (dragX: Animated.AnimatedInterpolation<number>) => {
                  const trans = dragX.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [0, 100],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      style={{
                        transform: [{ translateX: trans }],
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        marginBottom: 12,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#10B981',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 90,
                          borderRadius: 12,
                          marginLeft: 8,
                        }}
                        onPress={() => {
                          if (Platform.OS === 'ios') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }
                          markNotificationAsRead(notificationId);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                          Read
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                };

                return (
                  <Swipeable
                    key={notification.id || `notification-${notificationId || index}`}
                    ref={(ref) => {
                      if (ref) {
                        swipeableRefs.current[notificationId] = ref;
                      }
                    }}
                    renderLeftActions={(_, dragX) => renderLeftActions(dragX)}
                    renderRightActions={(_, dragX) => renderRightActions(dragX)}
                    overshootLeft={false}
                    overshootRight={false}
                  >
                    <View
                      style={{
                        backgroundColor: notification.is_read ? 'rgba(26, 47, 58, 0.3)' : 'rgba(26, 47, 58, 0.6)',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: notification.is_read ? 'rgba(107, 138, 132, 0.2)' : 'rgba(20, 184, 166, 0.3)',
                        borderLeftWidth: 4,
                        borderLeftColor: notifColor,
                      }}
                    >
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${notifColor}20`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Ionicons
                            name={getNotificationIcon(notification.notification.notification_type) as any}
                            size={22}
                            color={notifColor}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', flex: 1 }}>
                              {notification.notification.title}
                            </Text>
                            {!notification.is_read && (
                              <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#EF4444',
                                shadowColor: '#EF4444',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                              }} />
                            )}
                          </View>

                          <Text style={{
                            fontSize: 14,
                            color: '#B4E4DD',
                            lineHeight: 20,
                            marginBottom: 8,
                          }}>
                            {notification.notification.content}
                          </Text>

                          <Text style={{ fontSize: 12, color: '#6B8A84' }}>
                            {new Date(notification.notification.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Swipeable>
                );
              })
            ) : (
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 60,
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="notifications-outline" size={40} color="#6B8A84" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}>
                  {t('notifications.empty')}
                </Text>
                <Text style={{ fontSize: 14, color: '#8CA5A0', textAlign: 'center' }}>
                  {t('empty_states.no_data')}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    );
  };

  // Final render with smooth transition
  return (
    <TransitionWrapper isLoading={loading} loadingMessage={t('common.loading')}>
      {renderContent()}
    </TransitionWrapper>
  );
};

export default DashboardScreen;