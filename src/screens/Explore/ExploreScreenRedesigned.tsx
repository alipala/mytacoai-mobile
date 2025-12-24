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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
import ImmersiveLoader from '../../components/ImmersiveLoader';
import HorizontalStatsCarousel from '../../components/HorizontalStatsCarousel';
import PlaceholderStatsCard from '../../components/PlaceholderStatsCard';
import { useDailyStats } from '../../hooks/useStats';

// Challenge screens
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import SwipeFixScreen from './challenges/SwipeFixScreen';
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

// Challenge category colors (inspired by Kahoot/Duolingo)
const getCategoryGradient = (type: string): [string, string] => {
  switch (type) {
    case 'error_spotting':
      return ['#FF6B9D', '#C44569']; // Pink
    case 'swipe_fix':
      return ['#4ECFBF', '#0D9488']; // Turquoise
    case 'micro_quiz':
      return ['#FFA726', '#FB8C00']; // Orange
    case 'smart_flashcard':
      return ['#AB47BC', '#8E24AA']; // Purple
    case 'native_check':
      return ['#FFCA28', '#FFB300']; // Yellow
    case 'brain_tickler':
      return ['#EF5350', '#E53935']; // Red
    default:
      return ['#78909C', '#546E7A']; // Gray
  }
};

export default function ExploreScreenRedesigned({ navigation, route }: ExploreScreenProps) {
  const isFocused = useIsFocused();
  const { startSession } = useChallengeSession();
  const { daily } = useDailyStats(true);

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

      // Load user name
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'there');
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
      console.error(`❌ Error starting session:`, error);
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
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Immersive Header */}
        <ImmersiveHeader
          userName={userName || 'Learner'}
          streak={daily?.streak?.current || 0}
          totalXP={daily?.overall?.total_xp || 0}
          challengesToday={daily?.overall?.total_challenges || 0}
        />

        {/* Show placeholder for new users, carousel for active users */}
        {(!daily || daily?.overall?.total_challenges === 0) ? (
          <PlaceholderStatsCard />
        ) : (
          <HorizontalStatsCarousel onRefresh={reloadDailyStats} />
        )}

        {/* Section Title */}
        <View style={{ marginBottom: 12, marginTop: 0, paddingHorizontal: 0 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#1F2937',
          }}>
            🏆 Choose Your Quest
          </Text>
        </View>

        {/* Quest Cards - Side by Side */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
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
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  minHeight: 140,
                  borderWidth: 2.5,
                  borderColor: completedPlans.length === 0 ? '#E5E7EB' : '#F75A5A',
                  shadowColor: '#F75A5A',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: completedPlans.length === 0 ? 0 : 0.12,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#FFF5F5',
                    borderWidth: 2,
                    borderColor: '#F75A5A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 28 }}>👑</Text>
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#1F2937',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}>
                    Master Your Plans
                  </Text>
                </View>

                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#F75A5A',
                  textAlign: 'center',
                }}>
                  {completedPlans.length > 0
                    ? `${completedPlans.length} plan${completedPlans.length > 1 ? 's' : ''} →`
                    : 'No plans yet'}
                </Text>
              </View>
            </View>
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
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  minHeight: 140,
                  borderWidth: 2.5,
                  borderColor: '#4ECFBF',
                  shadowColor: '#4ECFBF',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#F0FFFE',
                    borderWidth: 2,
                    borderColor: '#4ECFBF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 28 }}>🚀</Text>
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#1F2937',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}>
                    Freestyle Practice
                  </Text>
                </View>

                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#4ECFBF',
                  textAlign: 'center',
                }}>
                  All levels →
                </Text>
              </View>
            </View>
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
          Completed Plans
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
                  {plan.total_sessions || 0} sessions · {plan.completed_sessions || 0} completed
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
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 28, color: '#06B6D4' }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937' }}>
            Choose Language & Level
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Selected Summary with gradient */}
            <LinearGradient
              colors={['#F0FDFA', '#E8F7F5']}
              style={{
                borderRadius: 16,
                padding: 20,
                marginBottom: 28,
                borderLeftWidth: 5,
                borderLeftColor: '#06B6D4',
                shadowColor: '#06B6D4',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#0E7490',
                marginBottom: 6,
              }}>
                Selected: {LANGUAGES.find(l => l.code === selectedLanguage)?.name} · {selectedLevel}
              </Text>
              <Text style={{ fontSize: 14, color: '#0891B2', fontWeight: '600' }}>
                Tap Continue to see challenges
              </Text>
            </LinearGradient>

            {/* Loading Indicator */}
            {loadingLevelCounts && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FEF3C7',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}>
                <ActivityIndicator size="small" color="#D97706" style={{ marginRight: 12 }} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#92400E',
                }}>
                  Loading challenge counts...
                </Text>
              </View>
            )}

            {/* Language Selection */}
            <Text style={{
              fontSize: 13,
              fontWeight: '800',
              color: '#6B7280',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              🌍 LANGUAGE
            </Text>
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
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: selectedLanguage === lang.code ? '#ECFEFF' : '#F9FAFB',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: selectedLanguage === lang.code ? '#06B6D4' : '#E5E7EB',
                    shadowColor: selectedLanguage === lang.code ? '#06B6D4' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedLanguage === lang.code ? 0.2 : 0.05,
                    shadowRadius: 4,
                  }}>
                    <Text style={{ fontSize: 28, marginRight: 12 }}>{lang.flag}</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: selectedLanguage === lang.code ? '#0E7490' : '#6B7280',
                    }}>
                      {lang.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Level Selection */}
            <Text style={{
              fontSize: 13,
              fontWeight: '800',
              color: '#6B7280',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              📊 CEFR LEVEL
            </Text>
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
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isDisabled ? '#F3F4F6' : (selectedLevel === level ? '#ECFEFF' : '#F9FAFB'),
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: isDisabled ? '#D1D5DB' : (selectedLevel === level ? '#06B6D4' : '#E5E7EB'),
                      opacity: isDisabled ? 0.5 : 1,
                      shadowColor: selectedLevel === level && !isDisabled ? '#06B6D4' : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedLevel === level && !isDisabled ? 0.2 : 0.05,
                      shadowRadius: 4,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '800',
                          color: isDisabled ? '#9CA3AF' : (selectedLevel === level ? '#0E7490' : '#6B7280'),
                          minWidth: 40,
                        }}>
                          {level}
                        </Text>
                        <Text style={{
                          fontSize: 15,
                          color: isDisabled ? '#9CA3AF' : (selectedLevel === level ? '#0891B2' : '#9CA3AF'),
                          marginLeft: 12,
                          flex: 1,
                        }}>
                          {name}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: isDisabled ? '#E5E7EB' : (selectedLevel === level ? '#06B6D4' : '#D1D5DB'),
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        minWidth: 50,
                        alignItems: 'center',
                      }}>
                        {loadingLevelCounts ? (
                          <ActivityIndicator
                            size="small"
                            color={selectedLevel === level ? '#FFFFFF' : '#6B7280'}
                          />
                        ) : (
                          <Text style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: isDisabled ? '#9CA3AF' : (selectedLevel === level ? '#FFFFFF' : '#6B7280'),
                          }}>
                            {challengeCount} {isDisabled ? '🔒' : ''}
                          </Text>
                        )}
                      </View>
                    </View>
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
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
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
                colors={levelChallengeCount[selectedLevel] === 0 ? ['#9CA3AF', '#6B7280'] : ['#06B6D4', '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  shadowColor: '#06B6D4',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: levelChallengeCount[selectedLevel] === 0 ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: '#FFFFFF',
                }}>
                  Continue to Challenges
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
            <Text style={{ fontSize: 28, color: '#06B6D4' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937' }}>
              🎯 {languageUpper.toUpperCase()} • Level {level}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Choose your challenge type
            </Text>
          </View>
        </View>

        {/* Grid of Challenge Category Cards */}
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
            {CHALLENGE_TYPES.map((category) => {
              const count = challengeCounts[category.type] || 0;
              const [color1, color2] = getCategoryGradient(category.type);
              const stats = categoryStats[category.type] || { completed: 0, total: count, accuracy: 0 };

              return (
                <TouchableOpacity
                  key={category.type}
                  style={{
                    width: CARD_WIDTH,
                    marginBottom: 16,
                  }}
                  onPress={() => handleCategoryPress(category.type)}
                  activeOpacity={0.8}
                  disabled={count === 0}
                >
                  <LinearGradient
                    colors={count === 0 ? ['#E5E7EB', '#D1D5DB'] : [color1, color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 24,
                      padding: 20,
                      height: 200,
                      opacity: count === 0 ? 0.5 : 1,
                      shadowColor: count === 0 ? '#000' : color1,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: count === 0 ? 0.05 : 0.3,
                      shadowRadius: 12,
                      elevation: 6,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      {/* Emoji Icon */}
                      <View style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                      }}>
                        <Text style={{ fontSize: 32 }}>{category.emoji}</Text>
                      </View>

                      {/* Title */}
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '800',
                          color: '#FFFFFF',
                          marginBottom: 6,
                          textShadowColor: 'rgba(0, 0, 0, 0.15)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                          lineHeight: 21,
                        }}
                        numberOfLines={2}
                      >
                        {category.title}
                      </Text>

                      {/* Description */}
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'rgba(255, 255, 255, 0.9)',
                          lineHeight: 16,
                        }}
                        numberOfLines={2}
                      >
                        {category.description}
                      </Text>
                    </View>

                    {/* Progress Badge - shows completion and accuracy */}
                    <View>
                      {stats.completed > 0 ? (
                        <View>
                          {/* Completion */}
                          <View style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 10,
                            alignSelf: 'flex-start',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            marginBottom: 6,
                          }}>
                            <Text style={{
                              fontSize: 13,
                              fontWeight: '800',
                              color: '#FFFFFF',
                            }}>
                              ✅ {stats.completed}/{count}
                            </Text>
                          </View>
                          {/* Accuracy */}
                          <View style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 10,
                            alignSelf: 'flex-start',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}>
                            <Text style={{
                              fontSize: 13,
                              fontWeight: '800',
                              color: '#FFFFFF',
                            }}>
                              🎯 {Math.round(stats.accuracy)}%
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 12,
                          alignSelf: 'flex-start',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '800',
                            color: '#FFFFFF',
                          }}>
                            {count} {count === 0 ? '🔒' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
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
                {categoryCharlenges.length} challenges
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
                      From your recent practice
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
      case 'swipe_fix':
        ChallengeComponent = <SwipeFixScreen {...commonProps} />;
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
  if (isLoading && navState === 'mode_selection') {
    return <ImmersiveLoader message="Loading your adventures..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
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
    </SafeAreaView>
  );
}
