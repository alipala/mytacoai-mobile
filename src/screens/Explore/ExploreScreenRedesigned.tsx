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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Language, CEFRLevel, Challenge } from '../../services/mockChallengeData';
import { ChallengeService, CHALLENGE_TYPES } from '../../services/challengeService';
import { LearningService } from '../../api/generated/services/LearningService';
import type { LearningPlan } from '../../api/generated';
import { ExpandableChallengeCard } from '../../components/ExpandableChallengeCard';
import { loadTodayCompletions, markChallengeCompleted } from '../../services/completionTracker';
import { soundService } from '../../services/soundService';

// Challenge screens
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import SwipeFixScreen from './challenges/SwipeFixScreen';
import MicroQuizScreen from './challenges/MicroQuizScreen';
import SmartFlashcardScreen from './challenges/SmartFlashcardScreen';
import NativeCheckScreen from './challenges/NativeCheckScreen';
import BrainTicklerScreen from './challenges/BrainTicklerScreen';

const { width, height } = Dimensions.get('window');

// Navigation states
type NavigationState =
  | 'mode_selection'
  | 'completed_plans'
  | 'freestyle_selection'
  | 'challenge_list';

type PracticeMode = 'completed_plans' | 'freestyle' | null;

interface ExploreScreenProps {
  navigation: any;
}

export default function ExploreScreenRedesigned({ navigation }: ExploreScreenProps) {
  const isFocused = useIsFocused();

  // Navigation state
  const [navState, setNavState] = useState<NavigationState>('mode_selection');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;
  const challengeModalAnim = useRef(new Animated.Value(height)).current;

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

  // Challenges
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [totalChallengeCount, setTotalChallengeCount] = useState<number>(0);
  const [expandedCardType, setExpandedCardType] = useState<string | null>(null);
  const [cachedChallenges, setCachedChallenges] = useState<Record<string, Challenge[]>>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Initialize sound service
  useEffect(() => {
    soundService.initialize();
  }, []);

  // Load initial data
  useEffect(() => {
    if (isFocused) {
      loadInitialData();
      animateHeaderIn();
    }
  }, [isFocused]);

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

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Page transition animation
  const transitionToScreen = (newState: NavigationState, callback: () => void) => {
    soundService.play('swoosh');

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
    soundService.play('tap');

    transitionToScreen(
      mode === 'completed_plans' ? 'completed_plans' : 'freestyle_selection',
      () => {
        setPracticeMode(mode);
        if (mode === 'completed_plans') {
          setNavState('completed_plans');
        } else {
          setNavState('freestyle_selection');
          // Preload challenge counts for all levels
          loadAllLevelCounts();
        }
      }
    );
  };

  // Load challenge counts for all CEFR levels
  const loadAllLevelCounts = async () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const counts: Record<CEFRLevel, number> = {
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
      C1: 0,
      C2: 0,
    };

    for (const level of levels) {
      try {
        const challengeCounts = await ChallengeService.getChallengeCounts(
          selectedLanguage,
          level,
          'reference'
        );
        const total = Object.values(challengeCounts).reduce((sum, count) => sum + count, 0);
        counts[level] = total;
      } catch (error) {
        console.error(`Error loading count for ${level}:`, error);
        counts[level] = 0;
      }
    }

    setLevelChallengeCount(counts);
  };

  const handlePlanSelection = async (plan: LearningPlan) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    soundService.play('tap');

    setSelectedPlan(plan);
    setIsLoading(true);

    try {
      // Load challenges for this plan using learning_plan source (personalized)
      const lang = plan.language as Language;
      const level = plan.proficiency_level as CEFRLevel;

      const counts = await ChallengeService.getChallengeCounts(lang, level, 'learning_plan');
      setChallengeCounts(counts);

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalChallengeCount(total);

      transitionToScreen('challenge_list', () => {
        setNavState('challenge_list');
      });
    } catch (error) {
      console.error('❌ Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreestyleContinue = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    soundService.play('tap');

    setIsLoading(true);

    try {
      // Use 'reference' source for freestyle - fetches from reference_challenges collection
      const counts = await ChallengeService.getChallengeCounts(selectedLanguage, selectedLevel, 'reference');
      setChallengeCounts(counts);

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalChallengeCount(total);

      transitionToScreen('challenge_list', () => {
        setNavState('challenge_list');
      });
    } catch (error) {
      console.error('❌ Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    soundService.play('tap');

    if (navState === 'completed_plans' || navState === 'freestyle_selection') {
      transitionToScreen('mode_selection', () => {
        setNavState('mode_selection');
        setPracticeMode(null);
      });
    } else if (navState === 'challenge_list') {
      const targetState = practiceMode === 'completed_plans' ? 'completed_plans' : 'freestyle_selection';
      transitionToScreen(targetState, () => {
        setNavState(targetState);
        setExpandedCardType(null);
        setCachedChallenges({});
      });
    }
  };

  const handleCardToggle = async (challengeType: string) => {
    if (expandedCardType === challengeType) {
      setExpandedCardType(null);
      return;
    }

    setExpandedCardType(challengeType);

    if (cachedChallenges[challengeType]) {
      return;
    }

    setLoadingType(challengeType);

    try {
      const lang = selectedPlan?.language as Language || selectedLanguage;
      const level = selectedPlan?.proficiency_level as CEFRLevel || selectedLevel;

      // Use appropriate source based on practice mode
      const source = practiceMode === 'completed_plans' ? 'learning_plan' : 'reference';

      const result = await ChallengeService.getChallengesByType(challengeType, 50, lang, level, source);

      setCachedChallenges(prev => ({
        ...prev,
        [challengeType]: result.challenges,
      }));
    } catch (error) {
      console.error(`❌ Error loading ${challengeType}:`, error);
    } finally {
      setLoadingType(null);
    }
  };

  const handleChallengePress = (challenge: Challenge) => {
    console.log('🎯 Opening challenge:', challenge.id, challenge.type);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    soundService.play('tap');

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

    // Play appropriate sound
    if (correct !== undefined) {
      soundService.play(correct ? 'correct' : 'wrong');
    } else {
      soundService.play('complete');
    }

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
        {/* Animated Header with Gradient */}
        <Animated.View
          style={{
            marginBottom: 40,
            opacity: headerOpacityAnim,
            transform: [{ scale: headerScaleAnim }],
          }}
        >
          <LinearGradient
            colors={['#4ECFBF', '#14B8A6', '#0F766E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 20,
              paddingHorizontal: 24,
              borderRadius: 24,
              marginBottom: 16,
            }}
          >
            <Text style={{
              fontSize: 36,
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: 8,
              textShadowColor: 'rgba(0, 0, 0, 0.15)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}>
              Explore
            </Text>
            <Text style={{
              fontSize: 18,
              color: '#F0FDFA',
              fontWeight: '600',
            }}>
              👋 Hi {userName}, choose your practice mode
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Completed Plans Card - Full width immersive design */}
        <TouchableOpacity
          style={{
            marginBottom: 20,
            opacity: completedPlans.length === 0 ? 0.6 : 1,
          }}
          onPress={() => handleModeSelection('completed_plans')}
          activeOpacity={0.8}
          disabled={completedPlans.length === 0}
        >
          <LinearGradient
            colors={completedPlans.length === 0 ? ['#E5E7EB', '#D1D5DB'] : ['#14B8A6', '#0F766E', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              minHeight: 180,
              shadowColor: '#14B8A6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: completedPlans.length === 0 ? 0 : 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}>
                  <Text style={{ fontSize: 36 }}>🎓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    marginBottom: 4,
                    textShadowColor: 'rgba(0, 0, 0, 0.15)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Review Completed Plans
                  </Text>
                </View>
              </View>

              <Text style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 20,
                lineHeight: 22,
              }}>
                Practice from learning plans you've finished (100% complete)
              </Text>

              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}>
                  {completedPlans.length > 0
                    ? `${completedPlans.length} plan${completedPlans.length > 1 ? 's' : ''} available`
                    : 'No completed plans yet'}
                </Text>
                {completedPlans.length > 0 && (
                  <Text style={{ fontSize: 20, color: '#FFFFFF' }}>→</Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Freestyle Practice Card - Full width immersive design */}
        <TouchableOpacity
          style={{ marginBottom: 20 }}
          onPress={() => handleModeSelection('freestyle')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4ECFBF', '#14B8A6', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              minHeight: 180,
              shadowColor: '#4ECFBF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}>
                  <Text style={{ fontSize: 36 }}>🌍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    marginBottom: 4,
                    textShadowColor: 'rgba(0, 0, 0, 0.15)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Freestyle Practice
                  </Text>
                </View>
              </View>

              <Text style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 20,
                lineHeight: 22,
              }}>
                Choose any language and level from our challenge library
              </Text>

              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}>
                  6 languages · All CEFR levels
                </Text>
                <Text style={{ fontSize: 20, color: '#FFFFFF' }}>→</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
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
          <Text style={{ fontSize: 28, color: '#4ECFBF' }}>←</Text>
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
        {completedPlans.map((plan, index) => (
          <TouchableOpacity
            key={plan.id}
            style={{ marginBottom: 16 }}
            onPress={() => handlePlanSelection(plan)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#14B8A6', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 20,
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 6 }}>✅</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>
                  100% Complete
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' }}>
                {plan.total_sessions || 0} sessions · {plan.completed_sessions || 0} completed
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
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
            <Text style={{ fontSize: 28, color: '#4ECFBF' }}>←</Text>
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
                borderLeftColor: '#14B8A6',
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#0F766E',
                marginBottom: 6,
              }}>
                Selected: {LANGUAGES.find(l => l.code === selectedLanguage)?.name} · {selectedLevel}
              </Text>
              <Text style={{ fontSize: 14, color: '#14B8A6', fontWeight: '600' }}>
                Tap Continue to see challenges
              </Text>
            </LinearGradient>

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
                  style={{
                    width: (width - 52) / 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: selectedLanguage === lang.code ? '#F0FDFA' : '#F9FAFB',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: selectedLanguage === lang.code ? '#4ECFBF' : '#E5E7EB',
                    shadowColor: selectedLanguage === lang.code ? '#4ECFBF' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedLanguage === lang.code ? 0.2 : 0.05,
                    shadowRadius: 4,
                  }}
                  onPress={() => {
                    setSelectedLanguage(lang.code);
                    loadAllLevelCounts();
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    soundService.play('tap');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 28, marginRight: 12 }}>{lang.flag}</Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: selectedLanguage === lang.code ? '#0F766E' : '#6B7280',
                  }}>
                    {lang.name}
                  </Text>
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
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isDisabled ? '#F3F4F6' : (selectedLevel === level ? '#F0FDFA' : '#F9FAFB'),
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: isDisabled ? '#D1D5DB' : (selectedLevel === level ? '#4ECFBF' : '#E5E7EB'),
                      opacity: isDisabled ? 0.5 : 1,
                      shadowColor: selectedLevel === level && !isDisabled ? '#4ECFBF' : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedLevel === level && !isDisabled ? 0.2 : 0.05,
                      shadowRadius: 4,
                    }}
                    onPress={() => {
                      if (!isDisabled) {
                        setSelectedLevel(level);
                        if (Platform.OS === 'ios') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        soundService.play('tap');
                      }
                    }}
                    activeOpacity={isDisabled ? 1 : 0.7}
                    disabled={isDisabled}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '800',
                        color: isDisabled ? '#9CA3AF' : (selectedLevel === level ? '#0F766E' : '#6B7280'),
                        minWidth: 40,
                      }}>
                        {level}
                      </Text>
                      <Text style={{
                        fontSize: 15,
                        color: isDisabled ? '#9CA3AF' : (selectedLevel === level ? '#14B8A6' : '#9CA3AF'),
                        marginLeft: 12,
                        flex: 1,
                      }}>
                        {name}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: isDisabled ? '#E5E7EB' : (selectedLevel === level ? '#4ECFBF' : '#D1D5DB'),
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: isDisabled ? '#9CA3AF' : (selectedLevel === level ? '#FFFFFF' : '#6B7280'),
                      }}>
                        {challengeCount} {isDisabled ? '🔒' : ''}
                      </Text>
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
                colors={levelChallengeCount[selectedLevel] === 0 ? ['#9CA3AF', '#6B7280'] : ['#4ECFBF', '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  shadowColor: '#4ECFBF',
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

  const renderChallengeList = () => {
    const title = selectedPlan
      ? `${selectedPlan.language.charAt(0).toUpperCase() + selectedPlan.language.slice(1)} ${selectedPlan.proficiency_level}`
      : `${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} ${selectedLevel}`;

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
            <Text style={{ fontSize: 28, color: '#4ECFBF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937' }}>
              {title} Challenges
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {totalChallengeCount} challenges available
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {CHALLENGE_TYPES.map((category) => {
            const count = challengeCounts[category.type] || 0;
            const isExpanded = expandedCardType === category.type;
            const isLoading = loadingType === category.type;
            const challenges = cachedChallenges[category.type] || [];

            return (
              <ExpandableChallengeCard
                key={category.type}
                type={category.type as any}
                title={category.title}
                emoji={category.emoji}
                description={category.description}
                totalCount={count}
                challenges={challenges}
                isExpanded={isExpanded}
                isLoading={isLoading}
                completedToday={completedToday}
                onToggle={() => handleCardToggle(category.type)}
                onChallengePress={handleChallengePress}
              />
            );
          })}
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
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4ECFBF" />
          <Text style={{ marginTop: 16, fontSize: 14, color: '#6B7280' }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      {navState === 'mode_selection' && renderModeSelection()}
      {navState === 'completed_plans' && renderCompletedPlans()}
      {navState === 'freestyle_selection' && renderFreestyleSelection()}
      {navState === 'challenge_list' && renderChallengeList()}
      {selectedChallenge && renderChallengeScreen()}
    </SafeAreaView>
  );
}
