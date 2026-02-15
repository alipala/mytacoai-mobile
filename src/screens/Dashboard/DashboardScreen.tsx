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
import { LearningPlanDetailsModal } from '../../components/LearningPlanDetailsModal';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { PricingModal } from '../../components/PricingModal';
import { SessionTypeModal } from '../../components/SessionTypeModal';
import TransitionWrapper from '../../components/TransitionWrapper';
import { COLORS } from '../../constants/colors';
import { styles } from './styles/DashboardScreen.styles';
import { DNAProfileWidget } from '../../components/SpeakingDNA/DNAProfileWidget';
import { FilterChips } from '../../components/FilterChips';
import { QuickResumeWidget } from '../../components/QuickResumeWidget';
import { MasonryGrid } from '../../components/MasonryGrid';
import { MasonryPlanCard } from '../../components/MasonryPlanCard';
import { MasonrySessionCard } from '../../components/MasonrySessionCard';
import { StartSessionCard } from '../../components/StartSessionCard';
import { DNAAnalysisCard } from '../../components/DNAAnalysisCard';
import { PracticeSessionDetailsModal } from '../../components/PracticeSessionDetailsModal';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { API_BASE_URL } from '../../api/config';
import LottieView from 'lottie-react-native';

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
  const [selectedPlanColor, setSelectedPlanColor] = useState<string>('#14B8A6');
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);

  // Filter state for masonry grid layout
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string | null>(null);

  // Practice sessions state
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]);
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedSessionColor, setSelectedSessionColor] = useState<string>('#14B8A6');

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

  // Masonry grid doesn't need expanded language state

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

      // Fetch recent practice sessions (conversation history)
      try {
        console.log('📡 Fetching conversation history...');
        const conversationsResponse = await ProgressService.getConversationHistoryApiProgressConversationsGet(20);
        console.log('📡 Conversation API Response:', conversationsResponse);

        if (conversationsResponse && Array.isArray(conversationsResponse)) {
          console.log(`💬 Loaded ${conversationsResponse.length} recent practice sessions`);
          if (conversationsResponse.length > 0) {
            console.log('📝 First session:', conversationsResponse[0]);
          }
          setPracticeSessions(conversationsResponse);
        } else if (conversationsResponse && conversationsResponse.sessions) {
          // Handle if response is wrapped in object
          console.log(`💬 Loaded ${conversationsResponse.sessions.length} sessions (wrapped response)`);
          setPracticeSessions(conversationsResponse.sessions);
        } else {
          console.log('⚠️ Unexpected conversation response format:', typeof conversationsResponse);
          setPracticeSessions([]);
        }
      } catch (sessionsError: any) {
        console.error('❌ Error fetching practice sessions:', sessionsError);
        console.error('Error details:', sessionsError.message, sessionsError.status);
        // Don't fail the whole dashboard if sessions fail to load
        setPracticeSessions([]);
      }

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

  const handleContinueLearning = (planId: string, cardColor?: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('Conversation', { planId, cardColor });
  };

  const handleViewDetails = (plan: LearningPlan, color: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(plan);
    setSelectedPlanColor(color);
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

  const handleSessionPress = (session: any, color: string) => {
    console.log('🎯 handleSessionPress called with session:', JSON.stringify(session, null, 2));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedSession(session);
    setSelectedSessionColor(color);
    setShowSessionDetailsModal(true);
    console.log('✅ Modal state set to true');
  };

  const handleSelectAssessment = () => {
    navigation.navigate('AssessmentLanguageSelection');
  };

  const handleModalContinueLearning = () => {
    if (selectedPlan) {
      setShowDetailsModal(false);
      navigation.navigate('Conversation', { planId: selectedPlan.id, cardColor: selectedPlanColor });
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

  // Filter and group learning plans for masonry grid layout
  const getFilteredAndGroupedPlans = () => {
    // Filter plans based on selected filter and language
    // Status values: "in_progress" (default), "awaiting_final_assessment", "completed", "failed_assessment"
    const filteredPlans = learningPlans.filter(plan => {
      // Language filter
      if (selectedLanguageFilter) {
        const planLanguage = (plan.language || 'english').toLowerCase();
        if (planLanguage !== selectedLanguageFilter.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedFilter === 'all') return true;

      const status = plan.status?.toLowerCase() || 'in_progress';
      const progressPercentage = plan.progress_percentage || 0;
      const completedSessions = plan.completed_sessions || 0;

      if (selectedFilter === 'new') {
        // New = in_progress with no sessions completed
        return (status === 'in_progress' || !plan.status) && completedSessions === 0;
      }
      if (selectedFilter === 'in_progress') {
        // In Progress = in_progress with at least 1 session completed
        return (status === 'in_progress' || status === 'awaiting_final_assessment') && completedSessions > 0;
      }
      if (selectedFilter === 'completed') {
        return status === 'completed' || progressPercentage >= 100;
      }

      return true;
    });

    // Group plans by language
    const plansByLanguage = filteredPlans.reduce((acc, plan) => {
      const language = (plan.language || 'english').toLowerCase();
      if (!acc[language]) {
        acc[language] = [];
      }
      acc[language].push(plan);
      return acc;
    }, {} as Record<string, LearningPlan[]>);

    // Find most recent plan for Quick Resume (from all plans, not just filtered)
    const mostRecentPlan = learningPlans.length > 0 ? [...learningPlans].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || '').getTime();
      const dateB = new Date(b.updated_at || b.created_at || '').getTime();
      return dateB - dateA;
    })[0] : null;

    // Determine which language should be expanded by default (most recent)
    const mostRecentLanguage = mostRecentPlan ? (mostRecentPlan.language || 'english').toLowerCase() : null;

    return { plansByLanguage, mostRecentPlan, mostRecentLanguage };
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
    // True new user: no plans AND no practice sessions
    const isNewUser = practiceSessions.length === 0;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.turquoise} barStyle="light-content" />
        {/* iOS-Native Header - Consistent with main dashboard */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo-minimal-transparent.png')}
            style={styles.logoMinimal}
            resizeMode="contain"
          />

          <View style={styles.headerActions}>
            {/* Hide badges and streak for brand-new users — show after first session */}
            {!isNewUser && (
              <>
                {/* Free User Badge - Show for non-premium users */}
                {subscriptionStatus && ['try_learn', 'free'].includes(subscriptionStatus.plan) && (
                  <TouchableOpacity
                    style={styles.freeBadgeCompact}
                    onPress={handleUpgradePress}
                    activeOpacity={0.8}
                  >
                    <View style={styles.badgeGlowFree} />
                    <Ionicons name="sparkles-outline" size={16} color="#6B8A84" />
                    <View>
                      <Text style={styles.freeTextCompact}>{t('profile.settings.subscription.free_badge')}</Text>
                      <Text style={styles.freeMinutesCompact}>
                        {t('dashboard.header.minutes_remaining', { minutes: subscriptionStatus?.limits?.minutes_remaining || 0 })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Premium Badge - Show for premium users */}
                {subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan) && (
                  <TouchableOpacity
                    style={styles.premiumBadgeCompact}
                    onPress={handleUpgradePress}
                    activeOpacity={0.8}
                  >
                    <View style={styles.badgeGlowPremium} />
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
                    <View style={styles.badgeGlowStreak} />
                    <Ionicons name="flame-outline" size={18} color="#EF4444" />
                    <View>
                      <Text style={styles.streakNumberCompact}>{progressStats.current_streak || 0}</Text>
                      <Text style={styles.streakLabelCompact}>{t('units.days_plural', { count: progressStats.current_streak || 0 })}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Notifications Bell - always visible */}
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
              {unreadCount > 0 && (
                <View style={styles.notificationCountBadge}>
                  <Text style={styles.notificationCountText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {isNewUser ? (
            <>
              {/* ========== NEW USER GUIDED ACTIVATION ========== */}

              {/* Section 1: Personalized Welcome */}
              <View style={styles.newUserWelcomeSection}>
                <Text style={styles.newUserGreeting}>
                  {getTimeBasedGreeting()}
                </Text>
                <Text style={styles.newUserSubtitle}>
                  {t('dashboard.new_user.subtitle')}
                </Text>
              </View>

              {/* Section 2: Primary CTA - Speaking Assessment */}
              <TouchableOpacity
                style={styles.newUserPrimaryCard}
                onPress={handleCreatePlan}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#1A103C', '#0F1B2E', '#0B1420']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.newUserPrimaryGradient}
                >
                  <LottieView
                    source={require('../../assets/lottie/companion_idle2.json')}
                    autoPlay
                    loop
                    resizeMode="contain"
                    renderMode="AUTOMATIC"
                    style={styles.newUserPrimaryLottie}
                  />
                  <Text style={styles.newUserPrimaryTitle}>
                    {t('dashboard.new_user.assessment_title')}
                  </Text>
                  <Text style={styles.newUserPrimarySubtitle}>
                    {t('dashboard.new_user.assessment_subtitle')}
                  </Text>

                  <TouchableOpacity
                    style={styles.newUserPrimaryButton}
                    onPress={handleCreatePlan}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.newUserPrimaryButtonText}>
                      {t('dashboard.new_user.assessment_button')} →
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>

              {/* Section 3: How It Works - Horizontal Colored Cards */}
              <View style={styles.newUserHowItWorks}>
                <Text style={styles.newUserHowItWorksTitle}>
                  {t('dashboard.new_user.how_it_works_title')}
                </Text>
                <View style={styles.newUserStepsRow}>
                  {/* Step 1: Speak */}
                  <LinearGradient
                    colors={['#F59E0B', '#D97706', '#1F2937']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.newUserStepCard}
                  >
                    <View style={styles.newUserStepCardIconWrap}>
                      <Ionicons name="mic" size={26} color="#FFFFFF" />
                    </View>
                    <Text style={styles.newUserStepCardTitle}>
                      {t('dashboard.new_user.step1_title')}
                    </Text>
                    <Text style={styles.newUserStepCardDesc}>
                      {t('dashboard.new_user.step1_desc')}
                    </Text>
                  </LinearGradient>

                  {/* Step 2: Get Feedback */}
                  <LinearGradient
                    colors={['#EF4444', '#DC2626', '#1F2937']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.newUserStepCard}
                  >
                    <View style={styles.newUserStepCardIconWrap}>
                      <Ionicons name="analytics" size={26} color="#FFFFFF" />
                    </View>
                    <Text style={styles.newUserStepCardTitle}>
                      {t('dashboard.new_user.step2_title')}
                    </Text>
                    <Text style={styles.newUserStepCardDesc}>
                      {t('dashboard.new_user.step2_desc')}
                    </Text>
                  </LinearGradient>

                  {/* Step 3: Improve */}
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB', '#1F2937']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.newUserStepCard}
                  >
                    <View style={styles.newUserStepCardIconWrap}>
                      <Ionicons name="rocket" size={26} color="#FFFFFF" />
                    </View>
                    <Text style={styles.newUserStepCardTitle}>
                      {t('dashboard.new_user.step3_title')}
                    </Text>
                    <Text style={styles.newUserStepCardDesc}>
                      {t('dashboard.new_user.step3_desc')}
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Section 4: Secondary Option - Quick Practice Link */}
              <TouchableOpacity
                style={styles.newUserSecondaryLink}
                onPress={handleSelectQuickPractice}
                activeOpacity={0.7}
              >
                <Text style={styles.newUserSecondaryLinkText}>
                  {t('dashboard.new_user.quick_practice_link')} →
                </Text>
              </TouchableOpacity>

              {/* Section 5: Minutes Fuel Gauge + Upgrade CTA */}
              {(() => {
                const totalMinutes = 15;
                const minutesLeft = subscriptionStatus?.limits?.minutes_remaining ?? totalMinutes;
                const fraction = Math.max(0, Math.min(1, minutesLeft / totalMinutes));
                const isLow = minutesLeft <= 5 && minutesLeft > 0;
                const isEmpty = minutesLeft <= 0;

                const barColor = isEmpty
                  ? '#EF4444'
                  : isLow
                    ? '#F59E0B'
                    : '#14B8A6';
                const borderColor = isEmpty
                  ? 'rgba(239, 68, 68, 0.25)'
                  : isLow
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'rgba(20, 184, 166, 0.15)';
                const bgColor = isEmpty
                  ? 'rgba(239, 68, 68, 0.06)'
                  : isLow
                    ? 'rgba(245, 158, 11, 0.06)'
                    : 'rgba(20, 184, 166, 0.05)';

                const minutesText = isEmpty
                  ? t('dashboard.new_user.minutes_empty')
                  : isLow
                    ? t('dashboard.new_user.minutes_low', { minutes: minutesLeft })
                    : t('dashboard.new_user.minutes_gauge', { minutes: minutesLeft });

                return (
                  <TouchableOpacity
                    style={[styles.newUserUpgradeBanner, { backgroundColor: bgColor, borderColor }]}
                    onPress={handleUpgradePress}
                    activeOpacity={0.8}
                  >
                    {/* Header row: status left, fraction right */}
                    <View style={styles.fuelGaugeHeader}>
                      <View style={styles.fuelGaugeHeaderLeft}>
                        <Ionicons
                          name={isEmpty ? 'alert-circle' : isLow ? 'flash' : 'time-outline'}
                          size={14}
                          color={barColor}
                        />
                        <Text style={[styles.fuelGaugeMinutesText, { color: barColor }]}>
                          {minutesText}
                        </Text>
                      </View>
                      {!isEmpty && (
                        <Text style={styles.fuelGaugeFractionText}>
                          {minutesLeft}/{totalMinutes}
                        </Text>
                      )}
                    </View>

                    {/* Progress bar */}
                    <View style={styles.fuelGaugeBarTrack}>
                      <View
                        style={[
                          styles.fuelGaugeBarFill,
                          {
                            width: `${Math.max(fraction * 100, 2)}%`,
                            backgroundColor: barColor,
                            shadowColor: barColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 4,
                            elevation: 3,
                          },
                        ]}
                      />
                    </View>

                    {/* CTA text */}
                    <Text style={styles.newUserUpgradeText}>
                      {t('dashboard.new_user.upgrade_banner')} →
                    </Text>
                  </TouchableOpacity>
                );
              })()}
            </>
          ) : (
            <>
              {/* ========== RETURNING USER EMPTY STATE (has sessions but no plans) ========== */}
              {(() => {
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
                        {/* SECONDARY - Freestyle Chat (Turquoise) */}
                        <TouchableOpacity
                          style={styles.secondaryCardNew}
                          onPress={handleSelectQuickPractice}
                          activeOpacity={0.9}
                        >
                          <View style={styles.secondaryCardIcon}>
                            <Ionicons name="mic-circle" size={36} color="#FFFFFF" />
                          </View>
                          <View style={styles.secondaryCardText}>
                            <Text style={styles.secondaryCardTitleNew}>{t('dashboard.quick_start.button_freestyle')}</Text>
                            <Text style={styles.secondaryCardSubtitle}>{t('practice.conversation.subtitle')}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={22} color="rgba(255, 255, 255, 0.8)" />
                        </TouchableOpacity>

                        {/* PRIMARY - Speaking Assessment (Coral Hero Card) */}
                        <TouchableOpacity
                          style={styles.primaryCardNew}
                          onPress={handleCreatePlan}
                          activeOpacity={0.9}
                        >
                          <View style={styles.primaryCardGradientNew}>
                            <View style={styles.primaryCardHeaderNew}>
                              <View style={styles.primaryIconContainerNew}>
                                <Ionicons name="pulse" size={32} color="#FFFFFF" />
                              </View>
                            </View>

                            <Text style={styles.primaryCardTitleNew}>{t('assessment.speaking.title')}</Text>
                            <Text style={styles.primaryCardDescriptionNew}>
                              {t('assessment.speaking.subtitle')}
                            </Text>

                            <View style={styles.primaryFeaturesNew}>
                              <View style={styles.featurePill}>
                                <Ionicons name="person-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.featurePillText}>{t('onboarding.benefits.pill_unlimited_practice')}</Text>
                              </View>
                              <View style={styles.featurePill}>
                                <Ionicons name="list-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.featurePillText}>{t('profile.dna.button_track_progress')}</Text>
                              </View>
                              <View style={styles.featurePill}>
                                <Ionicons name="trophy-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.featurePillText}>{t('profile.progress.title')}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* Usage Limits - Amber Banner with Minutes */}
                        <View style={styles.usageLimitsBanner}>
                          <Ionicons name="time-outline" size={20} color="#F59E0B" />
                          <Text style={styles.usageLimitsText}>
                            {Math.round(minutesRemaining || 0)} minutes remaining
                          </Text>
                        </View>

                        {/* Upgrade Link - Premium Gold Gradient */}
                        <LinearGradient
                          colors={['#F59E0B', '#FBBF24', '#FCD34D']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.upgradeLinkContainer}
                        >
                          <TouchableOpacity
                            style={styles.upgradeLinkInner}
                            onPress={handleUpgradePress}
                            activeOpacity={0.8}
                          >
                            <View style={styles.upgradeIconCircle}>
                              <Ionicons name="sparkles" size={20} color="#F59E0B" />
                            </View>
                            <Text style={styles.upgradeLinkText}>{t('subscription.title')}</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                        </LinearGradient>
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
            </>
          )}
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
              <View style={styles.badgeGlowPremium} />
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
              <View style={styles.badgeGlowStreak} />
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
              <View style={styles.notificationCountBadge}>
                <Text style={styles.notificationCountText}>
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

        {/* Masonry Grid Layout with Learning Plans and Practice Sessions */}
        {(() => {
          const { plansByLanguage, mostRecentPlan } = getFilteredAndGroupedPlans();
          const isPremium = subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan);

          // Get all available languages from learning plans
          const availableLanguages = [...new Set(learningPlans.map(plan =>
            (plan.language || 'english').toLowerCase()
          ))].sort();

          // Get all filtered plans (not grouped)
          const allFilteredPlans = Object.values(plansByLanguage).flat();

          // Smart sort: Priority based on activity
          const sortedPlans = [...allFilteredPlans].sort((a, b) => {
            const aCompletedSessions = a.completed_sessions || 0;
            const bCompletedSessions = b.completed_sessions || 0;
            const aStatus = a.status?.toLowerCase() || 'in_progress';
            const bStatus = b.status?.toLowerCase() || 'in_progress';

            // Priority 1: In-progress with sessions > completed
            const aIsActive = (aStatus === 'in_progress' || aStatus === 'awaiting_final_assessment') && aCompletedSessions > 0;
            const bIsActive = (bStatus === 'in_progress' || bStatus === 'awaiting_final_assessment') && bCompletedSessions > 0;

            if (aIsActive && !bIsActive) return -1;
            if (!aIsActive && bIsActive) return 1;

            // Priority 2: Recent activity (updated_at)
            const dateA = new Date(a.updated_at || a.created_at || '').getTime();
            const dateB = new Date(b.updated_at || b.created_at || '').getTime();

            return dateB - dateA;
          });

          // Filter practice sessions by language if selected
          const filteredSessions = selectedLanguageFilter
            ? practiceSessions.filter(session => {
                const sessionLang = (session.language || session.target_language || 'english').toLowerCase();
                return sessionLang === selectedLanguageFilter.toLowerCase();
              })
            : practiceSessions;

          // Build masonry grid items array with intelligent mixing
          const gridItems: React.ReactNode[] = [];

          // Combine ALL sessions (learning plans + practice sessions) with timestamps
          const allSessions = [
            ...sortedPlans.map((plan) => ({
              type: 'plan' as const,
              data: plan,
              timestamp: new Date(plan.updated_at || plan.created_at || '').getTime(),
            })),
            ...filteredSessions.map((session) => ({
              type: 'practice' as const,
              data: session,
              timestamp: new Date(session.created_at || '').getTime(),
            })),
          ].sort((a, b) => b.timestamp - a.timestamp); // Most recent first

          console.log('🎯 All Sessions Combined & Sorted:', {
            totalSessions: allSessions.length,
            first: allSessions[0] ? `${allSessions[0].type} at ${new Date(allSessions[0].timestamp).toISOString()}` : 'none',
            second: allSessions[1] ? `${allSessions[1].type} at ${new Date(allSessions[1].timestamp).toISOString()}` : 'none',
          });

          // First 2 cards are ALWAYS the most recent SESSIONS (practice OR plan) - LARGE (Hero cards)
          let colorIndex = 0;
          let cardIndex = 0; // Track card index for size calculation

          // Helper function to get card size based on position
          const getCardSize = (index: number): 'small' | 'medium' | 'large' => {
            if (index < 2) {
              return 'medium'; // Hero cards use isLarge prop instead
            }
            // Pattern: [large, medium, small, small, medium, large, medium, small] repeating
            const position = (index - 2) % 8;
            switch (position) {
              case 0:
                return 'large';
              case 1:
                return 'medium';
              case 2:
              case 3:
                return 'small';
              case 4:
                return 'medium';
              case 5:
                return 'large';
              case 6:
                return 'medium';
              case 7:
                return 'small';
              default:
                return 'medium';
            }
          };

          const first = allSessions[0];
          const second = allSessions[1];

          if (first) {
            if (first.type === 'plan') {
              gridItems.push(
                <MasonryPlanCard
                  key={`plan-${first.data.id}`}
                  plan={first.data}
                  onPress={handleViewDetails}
                  isLarge={true}
                  colorIndex={colorIndex++}
                  size={getCardSize(cardIndex++)}
                />
              );
            } else {
              gridItems.push(
                <MasonrySessionCard
                  key={`session-${first.data.id || 'first'}`}
                  session={first.data}
                  onPress={handleSessionPress}
                  isLarge={true}
                  colorIndex={colorIndex++}
                  size={getCardSize(cardIndex++)}
                />
              );
            }
          }

          if (second) {
            if (second.type === 'plan') {
              gridItems.push(
                <MasonryPlanCard
                  key={`plan-${second.data.id}`}
                  plan={second.data}
                  onPress={handleViewDetails}
                  isLarge={true}
                  colorIndex={colorIndex++}
                  size={getCardSize(cardIndex++)}
                />
              );
            } else {
              gridItems.push(
                <MasonrySessionCard
                  key={`session-${second.data.id || 'second'}`}
                  session={second.data}
                  onPress={handleSessionPress}
                  isLarge={true}
                  colorIndex={colorIndex++}
                  size={getCardSize(cardIndex++)}
                />
              );
            }
          }

          // Filter out the first 2 sessions that were already added
          const remainingPlans = sortedPlans.filter((plan) => {
            const isFirst = first?.type === 'plan' && first.data.id === plan.id;
            const isSecond = second?.type === 'plan' && second.data.id === plan.id;
            return !isFirst && !isSecond;
          });

          const remainingSessions = filteredSessions.filter((session) => {
            const isFirst = first?.type === 'practice' && first.data.id === session.id;
            const isSecond = second?.type === 'practice' && second.data.id === session.id;
            return !isFirst && !isSecond;
          });

          console.log('🎯 Remaining Items:', {
            remainingPlans: remainingPlans.length,
            remainingSessions: remainingSessions.length,
          });

          // Mix remaining plans and practice sessions
          let planIndex = 0;
          let sessionIndex = 0;

          // Add items in an interleaved pattern
          while (planIndex < remainingPlans.length || sessionIndex < remainingSessions.length) {
            // Add 2 plans
            for (let i = 0; i < 2 && planIndex < remainingPlans.length; i++, planIndex++) {
              gridItems.push(
                <MasonryPlanCard
                  key={`plan-${remainingPlans[planIndex].id}`}
                  plan={remainingPlans[planIndex]}
                  onPress={handleViewDetails}
                  isLarge={false}
                  colorIndex={colorIndex++}
                  size={getCardSize(cardIndex++)}
                />
              );
            }

            // Add 2-3 practice sessions
            for (let i = 0; i < 3 && sessionIndex < remainingSessions.length; i++, sessionIndex++) {
              gridItems.push(
                <MasonrySessionCard
                  key={`session-${remainingSessions[sessionIndex].id || sessionIndex}`}
                  session={remainingSessions[sessionIndex]}
                  onPress={handleSessionPress}
                  isLarge={false}
                  colorIndex={colorIndex++}
                  size={getCardSize(cardIndex++)}
                />
              );
            }
          }

          // Debug logging
          console.log('🎨 Masonry Grid Debug:', {
            totalPlans: sortedPlans.length,
            allPracticeSessions: practiceSessions.length,
            filteredSessions: filteredSessions.length,
            dnaLanguages: Array.from(languagesWithDNA),
            totalGridItems: gridItems.length,
            selectedLanguageFilter,
            sessionSample: filteredSessions[0] || null,
          });

          // Log sessions data structure for debugging
          if (practiceSessions.length > 0) {
            console.log('📝 Sample Practice Session:', JSON.stringify(practiceSessions[0], null, 2));
          } else {
            console.log('⚠️ No practice sessions loaded - check API response');
          }

          return (
            <>
              {/* Combined Language + Status Filters */}
              <FilterChips
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                selectedLanguage={selectedLanguageFilter}
                onLanguageChange={setSelectedLanguageFilter}
                availableLanguages={availableLanguages}
                showLanguageSelector={true}
              />

              {/* Masonry Grid */}
              {gridItems.length > 0 ? (
                <MasonryGrid>
                  {gridItems}
                </MasonryGrid>
              ) : (
                <View style={styles.emptyGridContainer}>
                  <Text style={styles.emptyGridText}>
                    No learning plans or sessions found
                  </Text>
                </View>
              )}
            </>
          );
        })()}

        {/* Start New Session Card - Dashed Rectangle */}
        <StartSessionCard onPress={handleStartNewSession} />
      </ScrollView>

      {/* Quick Resume Widget - Removed per user request */}

      {/* Learning Plan Details Modal */}
      {selectedPlan && (
        <LearningPlanDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          plan={selectedPlan}
          language={selectedPlan.language || selectedPlan.target_language || 'english'}
          progressStats={progressStats}
          onContinueLearning={handleModalContinueLearning}
          cardColor={selectedPlanColor}
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
              <View style={[styles.premiumSubscriptionCard, {
                backgroundColor: '#FBBF24',
                borderColor: '#F59E0B',
              }]}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Ionicons name="diamond" size={24} color="#FBBF24" />
                </View>
                <Text style={styles.premiumSubscriptionPlan}>
                  {subscriptionStatus?.plan === 'annual_premium' ? t('subscription.plans.yearly') : t('subscription.plans.monthly')}
                </Text>
                <Text style={styles.premiumSubscriptionStatus}>
                  {t('dashboard.header.minutes_remaining', { minutes: subscriptionStatus?.limits?.minutes_remaining || 0 })}
                </Text>
              </View>

              {/* Benefits List */}
              <View style={styles.premiumBenefitsList}>
                <View style={[styles.premiumBenefitItem, {
                  backgroundColor: '#14B8A6',
                  borderColor: '#0D9488',
                }]}>
                  <View style={[styles.premiumBenefitIconContainer, {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 0,
                  }]}>
                    <Ionicons name="infinite" size={24} color="#14B8A6" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.unlimited_practice')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('onboarding.benefits.pill_unlimited_practice')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.premiumBenefitItem, {
                  backgroundColor: '#8B5CF6',
                  borderColor: '#7C3AED',
                }]}>
                  <View style={[styles.premiumBenefitIconContainer, {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 0,
                  }]}>
                    <Ionicons name="mic" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('onboarding.benefits.pill_ai_tutor')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('onboarding.benefits.pill_instant_feedback')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.premiumBenefitItem, {
                  backgroundColor: '#EF4444',
                  borderColor: '#DC2626',
                }]}>
                  <View style={[styles.premiumBenefitIconContainer, {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 0,
                  }]}>
                    <Ionicons name="stats-chart" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.speaking_dna')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('subscription.features.advanced_feedback')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.premiumBenefitItem, {
                  backgroundColor: '#F59E0B',
                  borderColor: '#D97706',
                }]}>
                  <View style={[styles.premiumBenefitIconContainer, {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 0,
                  }]}>
                    <Ionicons name="flash" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.priority_support')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('subscription.features.priority_support')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.premiumBenefitItem, {
                  backgroundColor: '#EC4899',
                  borderColor: '#DB2777',
                }]}>
                  <View style={[styles.premiumBenefitIconContainer, {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 0,
                  }]}>
                    <Ionicons name="sparkles" size={24} color="#EC4899" />
                  </View>
                  <View style={styles.premiumBenefitTextContainer}>
                    <Text style={styles.premiumBenefitTitle}>{t('subscription.features.custom_topics')}</Text>
                    <Text style={styles.premiumBenefitDescription}>
                      {t('explore.title')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Thank You Message */}
              <View style={[styles.premiumThankYouCard, {
                backgroundColor: '#EF4444',
                borderColor: '#DC2626',
              }]}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  borderWidth: 0,
                }}>
                  <Ionicons name="heart" size={32} color="#EF4444" />
                </View>
                <Text style={styles.premiumThankYouText}>
                  Thank you for being Premium!
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

      {/* Practice Session Details Modal */}
      <PracticeSessionDetailsModal
        visible={showSessionDetailsModal}
        session={selectedSession}
        onClose={() => setShowSessionDetailsModal(false)}
        cardColor={selectedSessionColor}
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