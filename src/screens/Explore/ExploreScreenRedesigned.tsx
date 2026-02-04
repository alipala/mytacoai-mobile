import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing as ReanimatedEasing,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Language, CEFRLevel, Challenge } from '../../services/mockChallengeData';
import { ChallengeService, CHALLENGE_TYPES } from '../../services/challengeService';
import { LearningService } from '../../api/generated/services/LearningService';
import type { LearningPlan } from '../../api/generated';
import { loadTodayCompletions, markChallengeCompleted } from '../../services/completionTracker';
import { useChallengeSession } from '../../contexts/ChallengeSessionContext';
import { loadDailyStats, updateDailyStats, getAllCategoryStats, DailyStats, CategoryStats } from '../../services/dailyStatsService';
import EnhancedTodaysProgressCard from '../../components/EnhancedTodaysProgressCard';
import RecentPerformanceCard from '../../components/RecentPerformanceCard';
import ImmersiveHeader from '../../components/ImmersiveHeader';
import StatsCarousel from '../../components/StatsCarousel';
import TransitionWrapper from '../../components/TransitionWrapper';
import HorizontalStatsCarousel from '../../components/HorizontalStatsCarousel';
import PlaceholderStatsCard from '../../components/PlaceholderStatsCard';
import { useDailyStats, useRecentPerformance, useLifetimeProgress } from '../../hooks/useStats';
import { OutOfHeartsModal } from '../../components/OutOfHeartsModal';
import { PricingModal } from '../../components/PricingModal';
import { heartAPI } from '../../services/heartAPI';
import { CHALLENGE_TYPE_API_NAMES } from '../../types/hearts';

// Challenge screens
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import MicroQuizScreen from './challenges/MicroQuizScreen';
import SmartFlashcardScreen from './challenges/SmartFlashcardScreen';
import NativeCheckScreen from './challenges/NativeCheckScreen';
import BrainTicklerScreen from './challenges/BrainTicklerScreen';
import AnimatedLanguageLevelSelector from './AnimatedLanguageLevelSelector';

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

// Navigation states
type NavigationState =
  | 'mode_selection'
  | 'completed_plans'
  | 'freestyle_selection'
  | 'challenge_categories'
  | 'challenge_list';

type PracticeMode = 'completed_plans' | 'freestyle' | null;

interface ExploreScreenProps {
  navigation: any;
  route?: any;
}

// Semantic color system - colors communicate meaning with visual appeal
const getCategoryGradient = (type: string): [string, string] => {
  switch (type) {
    // 🔥 URGENCY - Time pressure (Red/Orange gradient)
    case 'brain_tickler':
      return ['#FF6B35', '#FF4757'];

    // 🎯 QUICK ACTION - Fast decisions (Coral gradient)
    case 'micro_quiz':
      return ['#F75A5A', '#E74C4C'];

    // 💧 CALM PRECISION - Language fluency (Turquoise gradient)
    case 'native_check':
      return ['#4ECFBF', '#3DB8A8'];

    // ⚠️ ATTENTION - Spotting details (Yellow gradient)
    case 'error_spotting':
      return ['#FFD63A', '#FFC700'];

    // 🧠 REFLECTION - Learning mode (Orange gradient)
    case 'smart_flashcard':
      return ['#FFA955', '#FF9635'];

    // 📖 CREATIVE - Story building (Purple/Indigo gradient)
    case 'story_builder':
      return ['#8B5CF6', '#7C3AED'];

    // 🚫 INACTIVE - Locked
    default:
      return ['#95A5A6', '#7F8C8D'];
  }
};

// Icon mapping - white Ionicons for clean game lobby feel
const getChallengeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'brain_tickler':
      return 'timer'; // Chronometer/stopwatch for timed challenge
    case 'micro_quiz':
      return 'bulb'; // Light bulb (solid)
    case 'native_check':
      return 'albums'; // Stacked cards icon for swipe-based challenge
    case 'error_spotting':
      return 'search'; // Magnifying glass (solid)
    case 'smart_flashcard':
      return 'layers'; // Layers/cards (solid)
    case 'story_builder':
      return 'book'; // Book icon for story building
    default:
      return 'help-circle'; // Default fallback
  }
};

export default function ExploreScreenRedesigned({ navigation, route }: ExploreScreenProps) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { startSession } = useChallengeSession();
  const { daily } = useDailyStats(true);
  const { recent } = useRecentPerformance(7, true); // Check for historical data
  const { lifetime } = useLifetimeProgress(false, true); // Check for lifetime data to show carousel

  // Navigation state
  const [navState, setNavState] = useState<NavigationState>('mode_selection');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);
  const [showAnimatedSelector, setShowAnimatedSelector] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;
  const challengeModalAnim = useRef(new Animated.Value(height)).current;
  const questCard1Scale = useRef(new Animated.Value(0.95)).current;
  const questCard2Scale = useRef(new Animated.Value(0.95)).current;

  // User data
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Completed plans mode
  const [completedPlans, setCompletedPlans] = useState<LearningPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);

  // Freestyle mode
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');
  const [levelChallengeCount, setLevelChallengeCount] = useState<Record<CEFRLevel, number>>({
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  });
  const [loadingLevelCounts, setLoadingLevelCounts] = useState(false);
  const [countCache, setCountCache] = useState<Record<string, Record<CEFRLevel, number>>>({});

  // Challenges
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [totalChallengeCount, setTotalChallengeCount] = useState<number>(0);
  const [selectedCategoryType, setSelectedCategoryType] = useState<string | null>(null);
  const [categoryCharlenges, setCategoryCharlenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Daily Stats
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Pre-session out of hearts modal
  const [showPreSessionHeartsModal, setShowPreSessionHeartsModal] = useState(false);
  const [preSessionErrorInfo, setPreSessionErrorInfo] = useState<{
    challengeType: string;
    refillInfo: any;
  } | null>(null);
  const [userSubscriptionPlan, setUserSubscriptionPlan] = useState<string>('try_learn');

  // Pricing modal state
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Upgrade success modal state
  const [showUpgradeSuccessModal, setShowUpgradeSuccessModal] = useState(false);

  // Load initial data and reload when screen is focused (e.g., returning from session)
  useEffect(() => {
    if (isFocused) {
      loadInitialData();
      animateHeaderIn();

      // Reload daily stats every time screen is focused to show updated stats
      reloadDailyStats();
    }
  }, [isFocused]);

  // Listen for tab press reset - reset to mode selection screen
  useEffect(() => {
    if (route?.params?.reset) {
      // Reset navigation state to initial screen
      setNavState('mode_selection');
      setPracticeMode(null);
      setSelectedChallenge(null);
      setShowAnimatedSelector(false);

      // Clear the reset param to avoid repeating this effect
      navigation.setParams({ reset: undefined });
    }
  }, [route?.params?.reset]);

  // Handle upgrade success notification
  useEffect(() => {
    if (route?.params?.upgradeSuccess) {
      console.log('🎉 Showing upgrade success modal');
      setShowUpgradeSuccessModal(true);

      // Reload user data to get updated subscription plan
      reloadUserSubscription();

      // Clear the param to avoid showing it again
      navigation.setParams({ upgradeSuccess: undefined });
    }
  }, [route?.params?.upgradeSuccess]);

  // Reload user subscription from AsyncStorage and API
  const reloadUserSubscription = async () => {
    try {
      console.log('🔄 Reloading user subscription after upgrade...');
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserSubscriptionPlan(user.subscription_plan || 'try_learn');
        console.log('✅ Updated subscription plan:', user.subscription_plan);
      }
    } catch (error) {
      console.error('❌ Error reloading user subscription:', error);
    }
  };

  // Reload daily stats (used when returning from a session)
  const reloadDailyStats = async () => {
    try {
      const stats = await loadDailyStats();
      setDailyStats(stats);
      console.log('🔄 Reloaded daily stats:', stats);
    } catch (error) {
      console.error('❌ Error reloading daily stats:', error);
    }
  };

  // Animate header when screen loads
  const animateHeaderIn = () => {
    Animated.parallel([
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered quest card animations
    Animated.sequence([
      Animated.delay(400),
      Animated.spring(questCard1Scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),
      Animated.spring(questCard2Scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Load user name and subscription plan
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'there');
        setUserSubscriptionPlan(user.subscription_plan || 'try_learn');
      }

      // Load completed learning plans
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          const plans = await LearningService.getUserLearningPlansApiLearningPlansGet();
          const completed = plans.filter(plan =>
            plan.progress_percentage !== undefined &&
            plan.progress_percentage === 100
          );
          setCompletedPlans(completed);
          console.log(`✅ Found ${completed.length} completed plans`);
        } catch (error) {
          console.error('❌ Error fetching plans:', error);
          setCompletedPlans([]);
        }
      }

      // Load today's completions
      const completions = await loadTodayCompletions();
      setCompletedToday(completions);

      // Load daily stats
      const stats = await loadDailyStats();
      setDailyStats(stats);
      console.log('📊 Loaded daily stats:', stats);

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    } finally {
      setIsLoading(false);
      setLoadingStats(false);
    }
  };

  // Page transition animation
  const transitionToScreen = (newState: NavigationState, callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleModeSelection = (mode: PracticeMode) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (mode === 'freestyle') {
      // Show animated selector for gaming experience
      setShowAnimatedSelector(true);
    } else {
      transitionToScreen('completed_plans', () => {
        setPracticeMode(mode);
        setNavState('completed_plans');
      });
    }
  };

  const handleAnimatedSelectorComplete = async (language: Language, level: CEFRLevel) => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSelectedLanguage(language);
    setSelectedLevel(level);
    setShowAnimatedSelector(false);
    setPracticeMode('freestyle');

    // Smooth fade-in transition to challenge categories (no slide animation)
    fadeAnim.setValue(0);
    slideAnim.setValue(0); // No slide effect - just fade
    setNavState('challenge_categories');

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Load challenge counts and category stats in the background
    setLoadingChallenges(true);
    try {
      const counts = await ChallengeService.getChallengeCounts(language, level, 'reference');
      setChallengeCounts(counts);

      // Exclude 'total' field to avoid double counting
      const total = Object.entries(counts)
        .filter(([key]) => key !== 'total')
        .reduce((sum, [, count]) => sum + count, 0);
      setTotalChallengeCount(total);

      // Load category stats for progress display
      const categoryTypes = CHALLENGE_TYPES.map(c => c.type);
      const stats = await getAllCategoryStats(language, level, categoryTypes);
      setCategoryStats(stats);

      console.log(`✅ Loaded ${total} challenges for ${language} ${level}`);
    } catch (error) {
      console.error('❌ Error loading challenges after animation:', error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleAnimatedSelectorCancel = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAnimatedSelector(false);
  };

  // Load challenge counts for all CEFR levels (optimized with caching and parallel requests)
  const loadAllLevelCounts = async (language?: Language) => {
    const lang = language || selectedLanguage;
    const cacheKey = lang;

    // Check cache first
    if (countCache[cacheKey]) {
      console.log(`📦 Using cached counts for ${cacheKey}`);
      setLevelChallengeCount(countCache[cacheKey]);
      return;
    }

    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    setLoadingLevelCounts(true);
    console.log(`📊 Fetching counts for ${lang} (parallel requests)...`);

    try {
      // Make all API calls in parallel instead of sequential
      const countPromises = levels.map(async (level) => {
        try {
          const challengeCounts = await ChallengeService.getChallengeCounts(
            lang,
            level,
            'reference'
          );
          // Exclude 'total' field to avoid double counting
          const total = Object.entries(challengeCounts)
            .filter(([key]) => key !== 'total')
            .reduce((sum, [, count]) => sum + count, 0);
          return { level, total };
        } catch (error) {
          console.error(`Error loading count for ${level}:`, error);
          return { level, total: 0 };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.all(countPromises);

      // Build counts object from results
      const counts: Record<CEFRLevel, number> = {
        A1: 0,
        A2: 0,
        B1: 0,
        B2: 0,
        C1: 0,
        C2: 0,
      };

      results.forEach(({ level, total }) => {
        counts[level] = total;
      });

      // Update state and cache
      setLevelChallengeCount(counts);
      setCountCache(prev => ({ ...prev, [cacheKey]: counts }));
      console.log(`✅ Counts loaded and cached for ${cacheKey}`);
    } catch (error) {
      console.error('❌ Error loading level counts:', error);
    } finally {
      setLoadingLevelCounts(false);
    }
  };

  const handlePlanSelection = async (plan: LearningPlan) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSelectedPlan(plan);

    // Transition to the screen immediately (optimistic UI for better UX)
    transitionToScreen('challenge_categories', () => {
      setNavState('challenge_categories');
    });

    // Load challenge counts in the background
    setLoadingChallenges(true);
    try {
      const lang = plan.language as Language;
      const level = plan.proficiency_level as CEFRLevel;

      const counts = await ChallengeService.getChallengeCounts(lang, level, 'learning_plan');
      setChallengeCounts(counts);

      // Exclude 'total' field to avoid double counting
      const total = Object.entries(counts)
        .filter(([key]) => key !== 'total')
        .reduce((sum, [, count]) => sum + count, 0);
      setTotalChallengeCount(total);
    } catch (error) {
      console.error('❌ Error loading challenges:', error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleFreestyleContinue = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Transition to the screen immediately (optimistic UI for better UX)
    transitionToScreen('challenge_categories', () => {
      setNavState('challenge_categories');
    });

    // Load challenge counts in the background
    setLoadingChallenges(true);
    try {
      const counts = await ChallengeService.getChallengeCounts(selectedLanguage, selectedLevel, 'reference');
      setChallengeCounts(counts);

      // Exclude 'total' field to avoid double counting
      const total = Object.entries(counts)
        .filter(([key]) => key !== 'total')
        .reduce((sum, [, count]) => sum + count, 0);
      setTotalChallengeCount(total);
    } catch (error) {
      console.error('❌ Error loading challenges:', error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (navState === 'completed_plans' || navState === 'freestyle_selection') {
      transitionToScreen('mode_selection', () => {
        setNavState('mode_selection');
        setPracticeMode(null);
      });
    } else if (navState === 'challenge_categories') {
      // Go back to animated selector for freestyle, or completed plans for other mode
      if (practiceMode === 'freestyle') {
        // Fade out challenge categories and show animated selector
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowAnimatedSelector(true);
          setPracticeMode(null);
          setNavState('mode_selection');
          fadeAnim.setValue(1);
        });
      } else {
        const targetState = 'completed_plans';
        transitionToScreen(targetState, () => {
          setNavState(targetState);
        });
      }
    } else if (navState === 'challenge_list') {
      transitionToScreen('challenge_categories', () => {
        setNavState('challenge_categories');
        setSelectedCategoryType(null);
        setCategoryCharlenges([]);
      });
    }
  };

  const handleCategoryPress = async (categoryType: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoadingChallenges(true);

    try {
      const lang = selectedPlan?.language as Language || selectedLanguage;
      const level = selectedPlan?.proficiency_level as CEFRLevel || selectedLevel;
      const source = practiceMode === 'completed_plans' ? 'learning_plan' : 'reference';

      // Get user ID from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : 'guest';

      console.log('🎮 Starting gamified session:', { lang, level, categoryType, source });

      // Start a gamified session with 10 challenges
      await startSession({
        userId,
        language: lang,
        level,
        challengeType: categoryType,
        source,
      });

      // Navigate to the gamified session screen
      navigation.navigate('ChallengeSession');
    } catch (error) {
      // Check if error is due to no hearts available
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('No hearts available')) {
        console.log('💔 Out of hearts before session start - showing modal');

        // Fetch current heart status to get refill info
        try {
          const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[categoryType] || categoryType;
          const heartStatus = await heartAPI.getHeartStatus(challengeTypeAPI);

          console.log('❤️  Heart status for modal:', JSON.stringify(heartStatus, null, 2));

          setPreSessionErrorInfo({
            challengeType: challengeTypeAPI,
            refillInfo: heartStatus.refillInfo,
          });
          setShowPreSessionHeartsModal(true);
        } catch (heartError) {
          console.warn('Failed to fetch heart status for modal:', heartError);
          // Show error alert as fallback
          alert('No hearts available for this challenge. Please wait for them to refill.');
        }
      } else {
        // Only log as error if it's NOT a heart-related error (to avoid error toast)
        console.error(`❌ Error starting session:`, error);
      }
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleChallengePress = (challenge: Challenge) => {
    console.log('🎯 Opening challenge:', challenge.id, challenge.type);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animate challenge screen sliding up
    challengeModalAnim.setValue(height);
    setSelectedChallenge(challenge);

    Animated.spring(challengeModalAnim, {
      toValue: 0,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleChallengeComplete = async (challengeId: string, correct?: boolean, timeSpent?: number) => {
    console.log('🎉 Challenge completed:', challengeId);

    // Mark as completed today in AsyncStorage
    await markChallengeCompleted(challengeId);
    setCompletedToday((prev) => new Set(prev).add(challengeId));

    // Send completion to backend
    try {
      await ChallengeService.completeChallenge(
        challengeId,
        correct ?? true,
        timeSpent ?? 0
      );
      console.log('✅ Challenge completion tracked on backend');
    } catch (error) {
      console.error('❌ Failed to track completion on backend:', error);
      // Don't block user - just log the error
    }

    // Animate challenge screen sliding down
    Animated.spring(challengeModalAnim, {
      toValue: height,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      setSelectedChallenge(null);
    });
  };

  const handleChallengeClose = () => {
    console.log('❌ Challenge closed without completion');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate challenge screen sliding down
    Animated.spring(challengeModalAnim, {
      toValue: height,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      setSelectedChallenge(null);
    });
  };

  // Pricing and upgrade handlers
  const handleUpgradePress = () => {
    console.log('🚀 User clicked upgrade from out of hearts modal');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowPreSessionHeartsModal(false);
    setShowPricingModal(true);
  };

  const handleSelectPlan = (planId: string, period: 'monthly' | 'annual') => {
    console.log(`💳 User selected plan: ${planId} (${period})`);
    setShowPricingModal(false);
    // Navigate to checkout screen with plan details
    navigation.navigate('Checkout', { planId, period });
  };

  // Render functions for each screen
  const renderModeSelection = () => (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0B1A1F' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Show placeholder for new users, carousel for active users */}
        {(() => {
          // Only show placeholder if user has NO lifetime data (truly new user)
          // If they have ANY lifetime challenges, show the carousel (even if recently inactive)
          const hasLifetimeData = lifetime && lifetime.summary && lifetime.summary.total_challenges > 0;
          const showPlaceholder = !hasLifetimeData;

          console.log('[ExploreScreen] Daily challenges:', daily?.overall?.total_challenges);
          console.log('[ExploreScreen] Recent total challenges:', recent?.summary?.total_challenges);
          console.log('[ExploreScreen] Lifetime total challenges:', lifetime?.summary?.total_challenges);
          console.log('[ExploreScreen] Show placeholder:', showPlaceholder);

          return showPlaceholder ? <PlaceholderStatsCard /> : <HorizontalStatsCarousel onRefresh={reloadDailyStats} />;
        })()}

        {/* Section Title */}
        <View style={{ marginBottom: 8, marginTop: 0, paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="trophy" size={24} color="#FBBF24" />
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#FFFFFF',
          }}>
            {t('explore.quest.choose_title')}
          </Text>
        </View>

        {/* Quest Cards - Side by Side */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
          {/* Completed Plans Card */}
          <Animated.View
            style={{
              flex: 1,
              transform: [{ scale: questCard1Scale }],
            }}
          >
            <TouchableOpacity
              style={{
                opacity: completedPlans.length === 0 ? 0.6 : 1,
              }}
              onPress={() => handleModeSelection('completed_plans')}
              activeOpacity={0.8}
              disabled={completedPlans.length === 0}
            >
              {/* Outer glow layer */}
              <View style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: 24,
                backgroundColor: completedPlans.length === 0 ? 'transparent' : 'rgba(220, 38, 38, 0.3)',
                opacity: completedPlans.length === 0 ? 0 : 0.6,
              }} />
              <LinearGradient
                colors={completedPlans.length === 0 ? ['#3F3F46', '#27272A'] : ['#DC2626', '#991B1B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 16,
                  minHeight: 120,
                  borderWidth: 2,
                  borderColor: completedPlans.length === 0 ? 'rgba(107, 114, 128, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                  shadowColor: completedPlans.length === 0 ? '#4B5563' : '#DC2626',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: completedPlans.length === 0 ? 0.2 : 0.6,
                  shadowRadius: 20,
                  elevation: 12,
                }}
              >
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}>
                    <Ionicons name="school" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: 4,
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}>
                    {t('explore.quest.master_plans')}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  alignSelf: 'center',
                  borderWidth: 1.5,
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    letterSpacing: 0.5,
                  }}>
                    {completedPlans.length > 0
                      ? t('explore.quest.plans_count', { count: completedPlans.length })
                      : t('explore.quest.no_plans')}
                  </Text>
                </View>
              </View>
            </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Freestyle Practice Card */}
          <Animated.View
            style={{
              flex: 1,
              transform: [{ scale: questCard2Scale }],
            }}
          >
            <TouchableOpacity
              onPress={() => handleModeSelection('freestyle')}
              activeOpacity={0.8}
            >
              {/* Outer glow layer */}
              <View style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: 24,
                backgroundColor: 'rgba(20, 184, 166, 0.3)',
                opacity: 0.6,
              }} />
              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 16,
                  minHeight: 120,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  shadowColor: '#14B8A6',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.6,
                  shadowRadius: 20,
                  elevation: 12,
                }}
              >
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}>
                    <Ionicons name="flash" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: 4,
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}>
                    {t('explore.quest.freestyle_practice')}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  alignSelf: 'center',
                  borderWidth: 1.5,
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    letterSpacing: 0.5,
                  }}>
                    {t('explore.quest.all_levels')}
                  </Text>
                </View>
              </View>
            </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderCompletedPlans = () => (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 28, color: '#A855F7' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937' }}>
          {t('explore.completed_plans.title')}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {completedPlans.map((plan, index) => {
          // Assign different gradient colors to each plan
          const gradientColors = [
            { colors: ['#10B981', '#059669'], shadow: '#10B981' }, // Green
            { colors: ['#3B82F6', '#2563EB'], shadow: '#3B82F6' }, // Blue
            { colors: ['#F59E0B', '#D97706'], shadow: '#F59E0B' }, // Amber
            { colors: ['#EF4444', '#DC2626'], shadow: '#EF4444' }, // Red
            { colors: ['#8B5CF6', '#7C3AED'], shadow: '#8B5CF6' }, // Violet
            { colors: ['#EC4899', '#DB2777'], shadow: '#EC4899' }, // Pink
          ];
          const gradient = gradientColors[index % gradientColors.length];

          return (
            <TouchableOpacity
              key={plan.id}
              style={{ marginBottom: 16 }}
              onPress={() => handlePlanSelection(plan)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradient.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: gradient.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>
                    {plan.language === 'english' ? '🇬🇧' :
                     plan.language === 'spanish' ? '🇪🇸' :
                     plan.language === 'dutch' ? '🇳🇱' :
                     plan.language === 'german' ? '🇩🇪' :
                     plan.language === 'french' ? '🇫🇷' : '🇵🇹'}
                  </Text>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}>
                    {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)} · {plan.proficiency_level}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('explore.completed_plans.sessions_info', {
                    total: plan.total_sessions || 0,
                    completed: plan.completed_sessions || 0
                  })}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const renderFreestyleSelection = () => {
    const LANGUAGES = [
      { code: 'english' as Language, name: 'English', flag: '🇬🇧' },
      { code: 'spanish' as Language, name: 'Spanish', flag: '🇪🇸' },
      { code: 'dutch' as Language, name: 'Dutch', flag: '🇳🇱' },
      { code: 'german' as Language, name: 'German', flag: '🇩🇪' },
      { code: 'french' as Language, name: 'French', flag: '🇫🇷' },
      { code: 'portuguese' as Language, name: 'Portuguese', flag: '🇵🇹' },
    ];

    const LEVELS: { level: CEFRLevel; name: string }[] = [
      { level: 'A1', name: 'Beginner' },
      { level: 'A2', name: 'Elementary' },
      { level: 'B1', name: 'Intermediate' },
      { level: 'B2', name: 'Upper Intermediate' },
      { level: 'C1', name: 'Advanced' },
      { level: 'C2', name: 'Proficient' },
    ];

    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#0B1A1F',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(20, 184, 166, 0.2)',
        }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#14B8A6" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF' }}>
            {t('explore.freestyle.choose_language_level')}
          </Text>
        </View>

        <View style={{ flex: 1, backgroundColor: '#0B1A1F' }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Selected Summary with gradient */}
            <LinearGradient
              colors={['#0D2832', '#0B1A1F']}
              style={{
                borderRadius: 16,
                padding: 20,
                marginBottom: 28,
                borderLeftWidth: 4,
                borderLeftColor: '#14B8A6',
                borderWidth: 1,
                borderColor: 'rgba(20, 184, 166, 0.3)',
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#FFFFFF',
                marginBottom: 6,
              }}>
                {t('explore.freestyle.selected', {
                  language: LANGUAGES.find(l => l.code === selectedLanguage)?.name,
                  level: selectedLevel
                })}
              </Text>
              <Text style={{ fontSize: 14, color: '#B4E4DD', fontWeight: '600' }}>
                {t('explore.freestyle.tap_continue')}
              </Text>
            </LinearGradient>

            {/* Loading Indicator */}
            {loadingLevelCounts && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(251, 191, 36, 0.3)',
              }}>
                <ActivityIndicator size="small" color="#FBBF24" style={{ marginRight: 12 }} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#FBBF24',
                }}>
                  {t('explore.freestyle.loading_counts')}
                </Text>
              </View>
            )}

            {/* Language Selection */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="language" size={18} color="#14B8A6" />
              <Text style={{
                fontSize: 13,
                fontWeight: '800',
                color: '#B4E4DD',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {t('explore.freestyle.language_label')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={{ width: (width - 52) / 2 }}
                  onPress={() => {
                    setSelectedLanguage(lang.code);
                    loadAllLevelCounts(lang.code);
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={selectedLanguage === lang.code ? ['#0D2832', '#0B1A1F'] : ['#1F2937', '#111827']}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: selectedLanguage === lang.code ? 'rgba(20, 184, 166, 0.6)' : 'rgba(107, 114, 128, 0.3)',
                      shadowColor: selectedLanguage === lang.code ? '#14B8A6' : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedLanguage === lang.code ? 0.3 : 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: 28, marginRight: 12 }}>{lang.flag}</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: selectedLanguage === lang.code ? '#FFFFFF' : '#9CA3AF',
                    }}>
                      {lang.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Level Selection */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="bar-chart" size={18} color="#8B5CF6" />
              <Text style={{
                fontSize: 13,
                fontWeight: '800',
                color: '#C4B5FD',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {t('explore.freestyle.level_label')}
              </Text>
            </View>
            <View style={{ gap: 12, marginBottom: 32 }}>
              {LEVELS.map(({ level, name }) => {
                const challengeCount = levelChallengeCount[level] || 0;
                const isDisabled = challengeCount === 0;

                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => {
                      if (!isDisabled) {
                        setSelectedLevel(level);
                        if (Platform.OS === 'ios') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }
                    }}
                    activeOpacity={isDisabled ? 1 : 0.7}
                    disabled={isDisabled}
                  >
                    <LinearGradient
                      colors={isDisabled ? ['#1F2937', '#111827'] : (selectedLevel === level ? ['#0D2832', '#0B1A1F'] : ['#1F2937', '#111827'])}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 2,
                        borderColor: isDisabled ? 'rgba(107, 114, 128, 0.2)' : (selectedLevel === level ? 'rgba(139, 92, 246, 0.6)' : 'rgba(107, 114, 128, 0.3)'),
                        opacity: isDisabled ? 0.5 : 1,
                        shadowColor: selectedLevel === level && !isDisabled ? '#8B5CF6' : '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: selectedLevel === level && !isDisabled ? 0.3 : 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '800',
                          color: isDisabled ? '#6B7280' : (selectedLevel === level ? '#FFFFFF' : '#9CA3AF'),
                          minWidth: 40,
                        }}>
                          {level}
                        </Text>
                        <Text style={{
                          fontSize: 15,
                          color: isDisabled ? '#6B7280' : (selectedLevel === level ? '#B4E4DD' : '#6B7280'),
                          marginLeft: 12,
                          flex: 1,
                        }}>
                          {name}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: isDisabled ? 'rgba(107, 114, 128, 0.2)' : (selectedLevel === level ? 'rgba(139, 92, 246, 0.3)' : 'rgba(107, 114, 128, 0.2)'),
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        minWidth: 50,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isDisabled ? 'rgba(107, 114, 128, 0.3)' : (selectedLevel === level ? 'rgba(139, 92, 246, 0.5)' : 'rgba(107, 114, 128, 0.3)'),
                      }}>
                        {loadingLevelCounts ? (
                          <ActivityIndicator
                            size="small"
                            color={selectedLevel === level ? '#8B5CF6' : '#6B7280'}
                          />
                        ) : (
                          <Text style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: isDisabled ? '#6B7280' : (selectedLevel === level ? '#FFFFFF' : '#9CA3AF'),
                          }}>
                            {challengeCount} {isDisabled ? '🔒' : ''}
                          </Text>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Continue Button at bottom */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: Platform.OS === 'ios' ? 32 : 16,
            backgroundColor: '#0B1A1F',
            borderTopWidth: 1,
            borderTopColor: 'rgba(20, 184, 166, 0.2)',
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <TouchableOpacity
              style={{ opacity: levelChallengeCount[selectedLevel] === 0 ? 0.5 : 1 }}
              onPress={handleFreestyleContinue}
              activeOpacity={0.8}
              disabled={levelChallengeCount[selectedLevel] === 0}
            >
              <LinearGradient
                colors={levelChallengeCount[selectedLevel] === 0 ? ['#1F2937', '#111827'] : ['#0D2832', '#0B1A1F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: levelChallengeCount[selectedLevel] === 0 ? 'rgba(107, 114, 128, 0.3)' : 'rgba(20, 184, 166, 0.6)',
                  shadowColor: '#14B8A6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: levelChallengeCount[selectedLevel] === 0 ? 0 : 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: '#FFFFFF',
                }}>
                  {t('explore.freestyle.continue_button')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderChallengeCategories = () => {
    const language = selectedPlan?.language || selectedLanguage;
    const level = selectedPlan?.proficiency_level || selectedLevel;
    const languageUpper = language.charAt(0).toUpperCase() + language.slice(1);

    // Determine featured challenge (Brain Tickler gets priority)
    const featuredChallenge = CHALLENGE_TYPES.find(c => c.type === 'brain_tickler') || CHALLENGE_TYPES[0];
    const featuredCount = challengeCounts[featuredChallenge.type] || 0;
    const featuredStats = categoryStats[featuredChallenge.type] || { completed: 0, total: featuredCount, accuracy: 0 };
    const [featuredColor1, featuredColor2] = getCategoryGradient(featuredChallenge.type);

    // Primary challenges (time-based and skill-based)
    const primaryChallenges = CHALLENGE_TYPES.filter(c =>
      c.type === 'micro_quiz' || c.type === 'native_check'
    );

    // Secondary challenges (learning modes)
    const secondaryChallenges = CHALLENGE_TYPES.filter(c =>
      c.type === 'error_spotting' || c.type === 'smart_flashcard'
    );

    // Story Builder - Second hero challenge at bottom
    const storyBuilderChallenge = CHALLENGE_TYPES.find(c => c.type === 'story_builder');
    const storyBuilderCount = challengeCounts['story_builder'] || 0;
    const storyBuilderStats = categoryStats['story_builder'] || { completed: 0, total: storyBuilderCount, accuracy: 0 };
    const [storyBuilderColor1, storyBuilderColor2] = getCategoryGradient('story_builder');

    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: '#0B1A1F',
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#0B1A1F',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(20, 184, 166, 0.2)',
        }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={28} color="#14B8A6" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="game-controller" size={20} color="#14B8A6" />
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF' }}>
                {languageUpper.toUpperCase()} • Level {level}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#B4E4DD', marginTop: 4 }}>
              {t('explore.categories.pick_how_to_play')}
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 🔥 HERO CARD - Featured Daily Challenge */}
          <GameLobbyHeroCard
            challenge={featuredChallenge}
            count={featuredCount}
            stats={featuredStats}
            color1={featuredColor1}
            color2={featuredColor2}
            onPress={() => handleCategoryPress(featuredChallenge.type)}
          />

          {/* 🔥 SECOND HERO CARD - Story Builder */}
          {storyBuilderChallenge && (
            <GameLobbyHeroCard
              challenge={storyBuilderChallenge}
              count={storyBuilderCount}
              stats={storyBuilderStats}
              color1={storyBuilderColor1}
              color2={storyBuilderColor2}
              onPress={() => handleCategoryPress('story_builder')}
            />
          )}

          {/* ⚡ PRIMARY MODES - Larger landscape cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            {primaryChallenges.map((category) => {
              const count = challengeCounts[category.type] || 0;
              const [color1, color2] = getCategoryGradient(category.type);
              const stats = categoryStats[category.type] || { completed: 0, total: count, accuracy: 0 };

              return (
                <GameLobbyPrimaryCard
                  key={category.type}
                  challenge={category}
                  count={count}
                  stats={stats}
                  color1={color1}
                  color2={color2}
                  onPress={() => handleCategoryPress(category.type)}
                />
              );
            })}
          </View>

          {/* 🎴 SECONDARY MODES - Smaller portrait cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            {secondaryChallenges.map((category) => {
              const count = challengeCounts[category.type] || 0;
              const [color1, color2] = getCategoryGradient(category.type);
              const stats = categoryStats[category.type] || { completed: 0, total: count, accuracy: 0 };

              return (
                <GameLobbySecondaryCard
                  key={category.type}
                  challenge={category}
                  count={count}
                  stats={stats}
                  color1={color1}
                  color2={color2}
                  onPress={() => handleCategoryPress(category.type)}
                />
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderChallengeList = () => {
    const category = CHALLENGE_TYPES.find(c => c.type === selectedCategoryType);
    if (!category) return null;

    const [color1, color2] = getCategoryGradient(selectedCategoryType!);

    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 28, color: color1 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>{category.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937' }}>
                {category.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                {t('explore.challenge_list.challenges_count', { count: categoryCharlenges.length })}
              </Text>
            </View>
          </View>
        </View>

        {/* Grid of Challenge Cards */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            {categoryCharlenges.map((challenge, index) => {
              const isCompleted = completedToday.has(challenge.id);

              return (
                <TouchableOpacity
                  key={`${challenge.id}-${index}`}
                  style={{
                    width: CARD_WIDTH,
                    marginBottom: 16,
                  }}
                  onPress={() => handleChallengePress(challenge)}
                  activeOpacity={0.8}
                >
                  <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    minHeight: 140,
                    borderWidth: 2,
                    borderColor: isCompleted ? color1 : '#E5E7EB',
                    shadowColor: isCompleted ? color1 : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isCompleted ? 0.2 : 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                  }}>
                    {/* Emoji */}
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isCompleted ? `${color1}15` : '#F5F5F5',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                      <Text style={{ fontSize: 28 }}>{category.emoji}</Text>
                    </View>

                    {/* Challenge info */}
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#1F2937',
                      marginBottom: 8,
                      lineHeight: 20,
                    }} numberOfLines={2}>
                      {t('explore.challenge_list.from_practice')}
                    </Text>

                    {/* Bottom row */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                    }}>
                      <View style={{
                        backgroundColor: `${color1}20`,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: color1,
                        }}>
                          12s
                        </Text>
                      </View>

                      {isCompleted ? (
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: '#FFD700',
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#FFD700',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.4,
                          shadowRadius: 4,
                          elevation: 3,
                        }}>
                          <Text style={{ fontSize: 18 }}>⭐</Text>
                        </View>
                      ) : (
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: color1,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ fontSize: 16, color: '#FFFFFF' }}>▶</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  // Render challenge screen based on type with slide-up animation
  const renderChallengeScreen = () => {
    if (!selectedChallenge) return null;

    const commonProps = {
      challenge: selectedChallenge,
      onComplete: handleChallengeComplete,
      onClose: handleChallengeClose,
    };

    let ChallengeComponent = null;

    switch (selectedChallenge.type) {
      case 'error_spotting':
        ChallengeComponent = <ErrorSpottingScreen {...commonProps} />;
        break;
      case 'micro_quiz':
        ChallengeComponent = <MicroQuizScreen {...commonProps} />;
        break;
      case 'smart_flashcard':
        ChallengeComponent = <SmartFlashcardScreen {...commonProps} />;
        break;
      case 'native_check':
        ChallengeComponent = <NativeCheckScreen {...commonProps} />;
        break;
      case 'brain_tickler':
        ChallengeComponent = <BrainTicklerScreen {...commonProps} />;
        break;
    }

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateY: challengeModalAnim }],
          backgroundColor: '#FFFFFF',
          zIndex: 1000,
        }}
      >
        {ChallengeComponent}
      </Animated.View>
    );
  };

  // Main render
  return (
    <TransitionWrapper isLoading={isLoading && navState === 'mode_selection'} loadingMessage={t('explore.loading.message')}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1A1F' }}>
        <StatusBar barStyle="light-content" />
      {navState === 'mode_selection' && renderModeSelection()}
      {navState === 'completed_plans' && renderCompletedPlans()}
      {navState === 'freestyle_selection' && renderFreestyleSelection()}
      {navState === 'challenge_categories' && renderChallengeCategories()}
      {navState === 'challenge_list' && renderChallengeList()}
      {selectedChallenge && renderChallengeScreen()}

      {/* Animated Language/Level Selector Modal */}
      {showAnimatedSelector && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <AnimatedLanguageLevelSelector
            onComplete={handleAnimatedSelectorComplete}
            onCancel={handleAnimatedSelectorCancel}
            initialLanguage={selectedLanguage}
            initialLevel={selectedLevel}
          />
        </View>
      )}

      {/* Pre-Session Out of Hearts Modal */}
      {showPreSessionHeartsModal && preSessionErrorInfo && (
        <OutOfHeartsModal
          visible={showPreSessionHeartsModal}
          challengeType={preSessionErrorInfo.challengeType}
          refillInfo={preSessionErrorInfo.refillInfo}
          subscriptionPlan={userSubscriptionPlan}
          onUpgrade={handleUpgradePress}
          onWait={() => {
            console.log('⏰ User chose to wait for refill');
            setShowPreSessionHeartsModal(false);
          }}
          onDismiss={() => {
            console.log('❌ User dismissed pre-session hearts modal');
            setShowPreSessionHeartsModal(false);
          }}
        />
      )}

      {/* Pricing Modal */}
      <PricingModal
        visible={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Upgrade Success Modal */}
      <Modal
        visible={showUpgradeSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeSuccessModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            maxWidth: 380,
            width: '100%',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            {/* Success Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#10B981',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#111827',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              {t('explore.upgrade.success_title')}
            </Text>

            {/* Subtitle */}
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 28,
            }}>
              {t('explore.upgrade.success_message')}
            </Text>

            {/* Benefits */}
            <View style={{
              width: '100%',
              backgroundColor: '#F0FDFA',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#4ECFBF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 18 }}>❤️</Text>
                </View>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#111827',
                  flex: 1,
                }}>
                  {t('explore.upgrade.more_hearts')}
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#4ECFBF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 18 }}>⚡</Text>
                </View>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#111827',
                  flex: 1,
                }}>
                  {t('explore.upgrade.faster_refill')}
                </Text>
              </View>
            </View>

            {/* Start Practicing Button */}
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: '#4ECFBF',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: '#4ECFBF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                setShowUpgradeSuccessModal(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                fontSize: 17,
                fontWeight: '700',
                color: '#FFFFFF',
              }}>
                {t('explore.upgrade.start_practicing')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay for Challenge Fetching */}
      {loadingChallenges && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(20, 184, 166, 0.3)',
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={{
              marginTop: 16,
              fontSize: 16,
              fontWeight: '600',
              color: '#FFFFFF',
            }}>
              {t('explore.loading.challenges')}
            </Text>
          </View>
        </View>
      )}
      </SafeAreaView>
    </TransitionWrapper>
  );
}

// ========================================
// 🎮 GAME LOBBY CARD COMPONENTS
// ========================================

interface CardProps {
  challenge: { type: string; title: string; emoji: string; description: string };
  count: number;
  stats: { completed: number; total: number; accuracy: number };
  color1: string;
  color2: string;
  onPress: () => void;
}

// 🔥 HERO CARD - Featured Daily Challenge
function GameLobbyHeroCard({ challenge, count, stats, color1, color2, onPress }: CardProps) {
  // Pulsing glow animation
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    shadowRadius: interpolate(pulseAnim.value, [0, 1], [12, 20]),
  }));

  // Icon rotation for urgency
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    iconRotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 800 }),
        withTiming(-10, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const isDisabled = count === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      disabled={isDisabled}
      style={{ marginBottom: 20 }}
    >
      <ReanimatedAnimated.View style={[pulseStyle]}>
        <LinearGradient
          colors={isDisabled ? ['#E5E7EB', '#D1D5DB'] : [color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 24,
            minHeight: 160,
            shadowColor: isDisabled ? '#000' : color1,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDisabled ? 0.05 : 0.35,
            elevation: 8,
          }}
        >
          {/* Daily Badge */}
          <View style={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}>
            <Ionicons name="flame-outline" size={12} color="#FFFFFF" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
              {t('explore.categories.featured_badge')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {/* Animated White Icon */}
            <ReanimatedAnimated.View style={[iconStyle]}>
              <Ionicons
                name={getChallengeIcon(challenge.type)}
                size={56}
                color="#FFFFFF"
                style={{ marginRight: 16 }}
              />
            </ReanimatedAnimated.View>

            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: '#FFFFFF',
                marginBottom: 4,
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
                {challenge.title}
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: '600',
              }}>
                {challenge.description}
              </Text>
            </View>
          </View>

          {/* Progress & Start Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            {stats.completed > 0 ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                    {t('explore.categories.progress_done', { completed: stats.completed, count })}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                    {t('explore.categories.accuracy', { accuracy: Math.round(stats.accuracy) })}
                  </Text>
                </View>
              </View>
            ) : (
              <View />
            )}

            {/* Arrow Button */}
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name="arrow-forward" size={20} color={color1} />
            </View>
          </View>
        </LinearGradient>
      </ReanimatedAnimated.View>
    </TouchableOpacity>
  );
}

// ⚡ PRIMARY CARD - Landscape, Medium Size
function GameLobbyPrimaryCard({ challenge, count, stats, color1, color2, onPress }: CardProps) {
  // Gentle breathing animation (same as Secondary cards)
  const breatheAnim = useSharedValue(1);

  useEffect(() => {
    breatheAnim.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2500 }),
        withTiming(1.0, { duration: 2500 })
      ),
      -1,
      false
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheAnim.value }],
  }));

  const isDisabled = count === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      disabled={isDisabled}
      style={{ flex: 1 }}
    >
      <ReanimatedAnimated.View style={[breatheStyle]}>
        <LinearGradient
          colors={isDisabled ? ['#E5E7EB', '#D1D5DB'] : [color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 18,
            minHeight: 140,
            shadowColor: isDisabled ? '#000' : color1,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDisabled ? 0.05 : 0.25,
            shadowRadius: 10,
            elevation: 5,
            justifyContent: 'space-between',
          }}
        >
          {/* White Icon */}
          <Ionicons
            name={getChallengeIcon(challenge.type)}
            size={42}
            color="#FFFFFF"
            style={{ marginBottom: 8 }}
          />

          <View>
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: 4,
              textShadowColor: 'rgba(0, 0, 0, 0.15)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}>
              {challenge.title}
            </Text>
            <Text style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: 12,
            }}>
              {challenge.description}
            </Text>
          </View>

          {/* Stats Badge */}
          {stats.completed > 0 ? (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                {t('explore.categories.stats_short', {
                  completed: stats.completed,
                  count,
                  accuracy: Math.round(stats.accuracy)
                })}
              </Text>
            </View>
          ) : (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                {count} {isDisabled ? '🔒' : ''}
              </Text>
            </View>
          )}
        </LinearGradient>
      </ReanimatedAnimated.View>
    </TouchableOpacity>
  );
}

// 🎴 SECONDARY CARD - Portrait, Smaller Size
function GameLobbySecondaryCard({ challenge, count, stats, color1, color2, onPress }: CardProps) {
  // Gentle breathing animation
  const breatheAnim = useSharedValue(1);

  useEffect(() => {
    breatheAnim.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2500 }),
        withTiming(1.0, { duration: 2500 })
      ),
      -1,
      false
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheAnim.value }],
  }));

  // Flip preview for Smart Flashcard
  const flipAnim = useSharedValue(0);

  useEffect(() => {
    if (challenge.type === 'smart_flashcard') {
      flipAnim.value = withRepeat(
        withSequence(
          withDelay(2000, withTiming(5, { duration: 600 })),
          withTiming(0, { duration: 600 }),
          withDelay(2000, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      );
    }
  }, []);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipAnim.value}deg` }],
  }));

  const isDisabled = count === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      disabled={isDisabled}
      style={{ flex: 1 }}
    >
      <ReanimatedAnimated.View style={[breatheStyle]}>
        <LinearGradient
          colors={isDisabled ? ['#E5E7EB', '#D1D5DB'] : [color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 14,
            minHeight: 130,
            shadowColor: isDisabled ? '#000' : color1,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: isDisabled ? 0.05 : 0.2,
            shadowRadius: 8,
            elevation: 4,
            justifyContent: 'space-between',
          }}
        >
          {/* White Icon with flip animation for flashcard */}
          <ReanimatedAnimated.View style={[flipStyle]}>
            <Ionicons
              name={getChallengeIcon(challenge.type)}
              size={36}
              color="#FFFFFF"
              style={{ marginBottom: 8 }}
            />
          </ReanimatedAnimated.View>

          <View>
            <Text style={{
              fontSize: 14,
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: 6,
              textShadowColor: 'rgba(0, 0, 0, 0.15)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }} numberOfLines={2}>
              {challenge.title}
            </Text>
          </View>

          {/* Compact Stats */}
          {stats.completed > 0 ? (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>
                {stats.completed}/{count}
              </Text>
            </View>
          ) : (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>
                {count}{isDisabled ? ' 🔒' : ''}
              </Text>
            </View>
          )}
        </LinearGradient>
      </ReanimatedAnimated.View>
    </TouchableOpacity>
  );
}
