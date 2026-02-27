import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { styles } from './styles/ExploreScreen.styles';
import { ExpandableChallengeCard } from '../../components/ExpandableChallengeCard';
import {
  Challenge,
  CEFRLevel,
  Language,
} from '../../services/mockChallengeData';
import { ChallengeService, ChallengeResult, CHALLENGE_TYPES } from '../../services/challengeService';
import { isFeatureEnabled } from '../../config/features';
import { loadTodayCompletions, markChallengeCompleted, cleanupOldCompletions } from '../../services/completionTracker';
import { CompactLanguageSelector } from '../../components/CompactLanguageSelector';
import { LanguageSelectionModal } from '../../components/LanguageSelectionModal';
import { LearningService } from '../../api/generated/services/LearningService';
import type { LearningPlan } from '../../api/generated';
import { heartAPI } from '../../services/heartAPI';
import { AllHeartsStatus } from '../../types/hearts';
import { smartCache } from '../../services/smartCache';

// Import challenge screens (will be created next)
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import MicroQuizScreen from './challenges/MicroQuizScreen';
import SmartFlashcardScreen from './challenges/SmartFlashcardScreen';
import NativeCheckScreen from './challenges/NativeCheckScreen';
import BrainTicklerScreen from './challenges/BrainTicklerScreen';

interface ExploreScreenProps {
  navigation: any;
}

export default function ExploreScreen({ navigation }: ExploreScreenProps) {
  const [userName, setUserName] = useState<string>('');
  const [userLevel, setUserLevel] = useState<CEFRLevel>('B1');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [progressStats, setProgressStats] = useState<{
    completed_by_type: Record<string, number>;
    total_completed: number;
  } | null>(null);

  // Language/Level selection state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');
  const [totalChallengeCount, setTotalChallengeCount] = useState<number>(0);

  // Learning Plan state
  const [userLearningPlans, setUserLearningPlans] = useState<LearningPlan[]>([]);
  const [activeLearningPlan, setActiveLearningPlan] = useState<LearningPlan | null>(null);
  const [isInLearningPlanMode, setIsInLearningPlanMode] = useState(true); // Default to plan mode if user has plans

  // Modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Accordion state
  const [expandedCardType, setExpandedCardType] = useState<string | null>(null);
  const [cachedChallenges, setCachedChallenges] = useState<Record<string, Challenge[]>>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Completion tracking
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  // Heart system state
  const [heartsStatus, setHeartsStatus] = useState<AllHeartsStatus | null>(null);

  const isFocused = useIsFocused();

  // Load completions on mount and cleanup old data
  useEffect(() => {
    const initCompletions = async () => {
      await cleanupOldCompletions();
      const completions = await loadTodayCompletions();
      setCompletedToday(completions);
    };
    initCompletions();
  }, []);

  // Fetch hearts status
  const fetchHeartsStatus = useCallback(async () => {
    try {
      console.log('🔍 Fetching hearts status from API...');
      const status = await smartCache.get('hearts_status', () => heartAPI.getAllHeartsStatus());
      console.log('✅ Hearts status received:', JSON.stringify(status));
      setHeartsStatus(status);
      console.log('❤️  Hearts status loaded:', status);
    } catch (error) {
      console.error('❌ Failed to fetch hearts status:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  }, []);

  // Load user data and challenge counts
  useEffect(() => {
    console.log('🔍 [ExploreScreen] useEffect running, isFocused:', isFocused);
    if (isFocused) {
      console.log('🔍 [ExploreScreen] Calling checkForLevelChange and fetchHeartsStatus');
      checkForLevelChange();
      fetchHeartsStatus();
    }
  }, [isFocused, fetchHeartsStatus]);

  // Check if user changed their level in settings
  const checkForLevelChange = async () => {
    const levelChanged = await AsyncStorage.getItem('levelChanged');

    if (levelChanged === 'true') {
      const newLevel = await AsyncStorage.getItem('newLevel');
      console.log('🔄 Level change detected! Reloading challenges with level:', newLevel);

      await AsyncStorage.removeItem('levelChanged');
      await AsyncStorage.removeItem('newLevel');

      setCachedChallenges({});
      setExpandedCardType(null);

      setIsLoading(true);
      await loadExploreData();
    } else {
      await loadExploreData();
    }
  };

  const loadExploreData = async () => {
    try {
      setErrorMessage(null);

      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('auth_token');
      let level: CEFRLevel = 'B1';
      let language: Language = 'english';

      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'there');
        level = (user.preferred_level || 'B1') as CEFRLevel;
        setUserLevel(level);

        console.log('🔍 Checking for learning plans... Token exists:', !!token);
        if (token) {
          try {
            console.log('📡 Fetching learning plans from API...');
            const plans = await smartCache.get('learning_plans', () => LearningService.getUserLearningPlansApiLearningPlansGet());
            console.log(`✅ Found ${plans.length} learning plan(s) for user`);
            setUserLearningPlans(plans);

            if (plans.length > 0) {
              const sortedPlans = [...plans].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              const defaultActivePlan = activeLearningPlan || sortedPlans[0];
              setActiveLearningPlan(defaultActivePlan);
              console.log(`🎯 Active plan set to: ${defaultActivePlan.language} ${defaultActivePlan.proficiency_level}`);

              if (isInLearningPlanMode && defaultActivePlan) {
                language = defaultActivePlan.language as Language;
                level = defaultActivePlan.proficiency_level as CEFRLevel;
                console.log(`📚 Using active learning plan: ${language} ${level}`);
              }
            } else {
              setActiveLearningPlan(null);
              setIsInLearningPlanMode(false);
              console.log('ℹ️ No learning plans found, using freestyle mode');
            }
          } catch (planError: any) {
            console.error('❌ Error fetching learning plans:', planError);
            setUserLearningPlans([]);
            setActiveLearningPlan(null);
            setIsInLearningPlanMode(false);
          }
        } else {
          console.log('⚠️ No token found, skipping learning plan fetch');
          setUserLearningPlans([]);
          setActiveLearningPlan(null);
          setIsInLearningPlanMode(false);
        }
      } else {
        setUserName('there');
        setUserLevel('B1');
        setUserLearningPlans([]);
        setActiveLearningPlan(null);
        setIsInLearningPlanMode(false);
      }

      setSelectedLanguage(language);
      setSelectedLevel(level);

      console.log('📚 Loading challenge pool for level:', level, 'language:', language);

      await loadChallengeCounts(language, level);

    } catch (error) {
      console.error('❌ Error loading explore data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load challenge pool');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload challenges when language or level changes
  useEffect(() => {
    if (!isLoading) {
      console.log('🔄 Language/Level changed, reloading challenges...');
      // Clear cached challenges to force fresh fetch
      setCachedChallenges({});
      setExpandedCardType(null);
      // Reload challenge counts
      loadChallengeCounts();
    }
  }, [selectedLanguage, selectedLevel]);

  const loadChallengeCounts = async (language?: Language, level?: CEFRLevel) => {
    try {
      // Use provided params or fall back to state
      const lang = language || selectedLanguage;
      const lvl = level || selectedLevel;

      const counts = await ChallengeService.getChallengeCounts(lang, lvl);
      setChallengeCounts(counts);

      // Calculate total challenge count (exclude 'total' field to avoid double counting)
      const total = Object.entries(counts)
        .filter(([key]) => key !== 'total')
        .reduce((sum, [, count]) => sum + count, 0);
      setTotalChallengeCount(total);

      console.log('📊 Challenge counts loaded:', counts, 'Total:', total);

      // Load user progress stats
      try {
        const { getChallengeProgress } = await import('../../services/progressAPI');
        const progress = await getChallengeProgress(lang, lvl);
        setProgressStats({
          completed_by_type: progress.completed_by_type,
          total_completed: progress.completed_count,
        });
        console.log('📈 Progress loaded:', progress.completed_count, '/', progress.total_available);
      } catch (progressError) {
        console.warn('Failed to load progress stats:', progressError);
        // Continue without progress - not critical
        setProgressStats(null);
      }
    } catch (error) {
      console.error('Failed to load challenge counts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExploreData();
    setRefreshing(false);
  };

  const handleLanguageChange = (language: Language) => {
    console.log('🌍 Language changed to:', language);
    setSelectedLanguage(language);

    // Check if this matches the active learning plan
    if (activeLearningPlan &&
        language === activeLearningPlan.language &&
        selectedLevel === activeLearningPlan.proficiency_level) {
      setIsInLearningPlanMode(true);
    } else {
      setIsInLearningPlanMode(false);
    }
  };

  const handleLevelChange = (level: CEFRLevel) => {
    console.log('📊 Level changed to:', level);
    setSelectedLevel(level);

    // Check if this matches the active learning plan
    if (activeLearningPlan &&
        selectedLanguage === activeLearningPlan.language &&
        level === activeLearningPlan.proficiency_level) {
      setIsInLearningPlanMode(true);
    } else {
      setIsInLearningPlanMode(false);
    }
  };

  const handleSelectLearningPlan = (plan: LearningPlan) => {
    console.log('📚 Selected learning plan:', plan.language, plan.proficiency_level);
    setActiveLearningPlan(plan);
    setIsInLearningPlanMode(true);
    setSelectedLanguage(plan.language as Language);
    setSelectedLevel(plan.proficiency_level as CEFRLevel);
    // Modal will close automatically, challenges will reload via useEffect
  };

  const handleChallengePress = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleChallengeComplete = async (challengeId: string, correct?: boolean, timeSpent?: number) => {
    // Mark as completed today in AsyncStorage
    await markChallengeCompleted(challengeId);
    setCompletedToday((prev) => new Set(prev).add(challengeId));
    console.log('🎉 Challenge completed and tracked for today!');

    // Send completion to backend if tracking is enabled
    if (isFeatureEnabled('ENABLE_COMPLETION_TRACKING')) {
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
    }

    // Close challenge screen
    setSelectedChallenge(null);
  };

  const handleChallengeClose = () => {
    setSelectedChallenge(null);
  };

  const handleCardToggle = async (type: string) => {
    if (expandedCardType === type) {
      // Collapse
      setExpandedCardType(null);
    } else {
      // Expand
      setExpandedCardType(type);

      // Lazy load challenges if not cached
      if (!cachedChallenges[type]) {
        try {
          setLoadingType(type);
          console.log(`📚 Fetching challenges for type: ${type}, language: ${selectedLanguage}, level: ${selectedLevel}`);
          const result: ChallengeResult = await ChallengeService.getChallengesByType(
            type,
            10,
            selectedLanguage,
            selectedLevel
          );
          setCachedChallenges((prev) => ({ ...prev, [type]: result.challenges }));
          console.log(`✅ Cached ${result.challenges.length} ${type} challenges`);
        } catch (error) {
          console.error(`❌ Failed to fetch ${type} challenges:`, error);
        } finally {
          setLoadingType(null);
        }
      }
    }
  };

  // Render challenge screen based on type
  const renderChallengeScreen = () => {
    if (!selectedChallenge) return null;

    const commonProps = {
      challenge: selectedChallenge,
      onComplete: handleChallengeComplete,
      onClose: handleChallengeClose,
    };

    switch (selectedChallenge.type) {
      case 'error_spotting':
        return <ErrorSpottingScreen {...commonProps} />;
      case 'micro_quiz':
        return <MicroQuizScreen {...commonProps} />;
      case 'smart_flashcard':
        return <SmartFlashcardScreen {...commonProps} />;
      case 'native_check':
        return <NativeCheckScreen {...commonProps} />;
      case 'brain_tickler':
        return <BrainTicklerScreen {...commonProps} />;
      default:
        return null;
    }
  };

  // Show challenge screen if one is selected
  if (selectedChallenge) {
    return renderChallengeScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4ECFBF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>
            👋 Hi {userName}, quick wins today
          </Text>

          {/* Error Message (if any) */}
          {errorMessage && (
            <View style={{
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#FFF3CD',
              borderRadius: 6,
              borderLeftWidth: 3,
              borderLeftColor: '#FFA500',
            }}>
              <Text style={{ fontSize: 12, color: '#856404' }}>
                ⚠️ {errorMessage}
              </Text>
            </View>
          )}
        </View>

        {/* Compact Language Selector */}
        {!isLoading && (
          <>
            <CompactLanguageSelector
              selectedLanguage={selectedLanguage}
              selectedLevel={selectedLevel}
              onPress={() => setShowLanguageModal(true)}
              hasLearningPlan={activeLearningPlan !== null && isInLearningPlanMode}
            />

            {/* Empty Challenges Warning */}
            {totalChallengeCount === 0 && (
              <View style={{
                marginHorizontal: 20,
                marginTop: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: activeLearningPlan && isInLearningPlanMode ? '#FEF2F2' : '#FFF7ED',
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: activeLearningPlan && isInLearningPlanMode ? '#EF4444' : '#F59E0B',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>
                    {activeLearningPlan && isInLearningPlanMode ? '⚠️' : '⏳'}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: activeLearningPlan && isInLearningPlanMode ? '#991B1B' : '#92400E',
                    fontWeight: '700'
                  }}>
                    {activeLearningPlan && isInLearningPlanMode
                      ? 'No Learning Plan Challenges'
                      : 'No Challenges Available Yet'}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: activeLearningPlan && isInLearningPlanMode ? '#DC2626' : '#B45309',
                  lineHeight: 20,
                  marginBottom: 8,
                }}>
                  {activeLearningPlan && isInLearningPlanMode
                    ? `Your ${activeLearningPlan.language} ${activeLearningPlan.proficiency_level} learning plan doesn't have any challenges yet. The AI is generating personalized exercises for you.`
                    : 'Challenges for this combination are being generated by AI. This usually takes 10-30 seconds.'}
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: activeLearningPlan && isInLearningPlanMode ? '#DC2626' : '#B45309',
                  fontWeight: '600',
                }}>
                  {activeLearningPlan && isInLearningPlanMode
                    ? '💡 Try exploring freestyle mode or check back in a minute!'
                    : '💡 You can explore other language/level combinations while waiting.'}
                </Text>
              </View>
            )}

            {/* Challenge Count Info */}
            {totalChallengeCount > 0 && (
              <View style={{
                marginHorizontal: 20,
                marginTop: 4,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  🎯 {totalChallengeCount} challenges available
                </Text>
              </View>
            )}
          </>
        )}

        {/* Loading State - Modern Design */}
        {isLoading && (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
            paddingTop: 60,
          }}>
            {/* Lottie Loading Animation */}
            <LottieView
              source={require('../../assets/lottie/loading.json')}
              autoPlay
              loop
              style={{ width: 200, height: 200, marginBottom: 32 }}
            />

            {/* Main Text */}
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: 12,
            }}>
              {isFeatureEnabled('USE_CHALLENGE_API')
                ? 'Crafting Your Challenges'
                : 'Loading Challenges'}
            </Text>

            {/* Subtitle */}
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 8,
            }}>
              {isFeatureEnabled('USE_CHALLENGE_API')
                ? 'Preparing personalized exercises\njust for you...'
                : 'Almost there...'}
            </Text>

            {/* Timer hint */}
            {isFeatureEnabled('USE_CHALLENGE_API') && (
              <View style={{
                marginTop: 24,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: '#FFF7ED',
                borderRadius: 10,
                borderLeftWidth: 3,
                borderLeftColor: '#F59E0B',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#92400E',
                  textAlign: 'center',
                }}>
                  ⏱️ First time setup: up to 30 seconds
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Expandable Challenge Categories */}
        {!isLoading && Object.keys(challengeCounts).length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            {/* Section Header - Learning Plan vs Freestyle */}
            {isInLearningPlanMode && activeLearningPlan ? (
              <View style={{
                marginBottom: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: '#F0FDFA',
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#14B8A6',
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#0F766E',
                  marginBottom: 4,
                }}>
                  📚 Your Learning Plan
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#14B8A6',
                }}>
                  Practicing {activeLearningPlan.language} · {activeLearningPlan.proficiency_level}
                </Text>
              </View>
            ) : (
              <View style={{
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: 4,
                }}>
                  🌍 Freestyle Practice
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                }}>
                  Tap to expand and start practicing
                </Text>
              </View>
            )}

            {/* Challenge Cards */}
            {CHALLENGE_TYPES.map((category) => {
              const count = challengeCounts[category.type] || 0;
              const completed = progressStats?.completed_by_type[category.type] || 0;
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
                  completedCount={completed}
                  challenges={challenges}
                  isExpanded={isExpanded}
                  isLoading={isLoading}
                  completedToday={completedToday}
                  heartPool={heartsStatus?.[category.type as keyof AllHeartsStatus] || null}
                  onToggle={() => handleCardToggle(category.type)}
                  onChallengePress={handleChallengePress}
                />
              );
            })}

            {/* Freestyle Practice Separator - Only show when in Learning Plan mode */}
            {isInLearningPlanMode && activeLearningPlan && (
              <View style={{
                marginTop: 32,
                paddingTop: 24,
                borderTopWidth: 2,
                borderTopColor: '#E5E7EB',
              }}>
                <View style={{
                  marginBottom: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#9CA3AF',
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#4B5563',
                    marginBottom: 4,
                  }}>
                    🌍 Want to Explore More?
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#6B7280',
                    marginBottom: 12,
                  }}>
                    Practice other languages and levels outside your learning plan
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4ECFBF',
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      shadowColor: '#4ECFBF',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={() => setShowLanguageModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#FFFFFF',
                    }}>
                      🚀 Explore Freestyle Practice
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && Object.keys(challengeCounts).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No challenges available</Text>
            <Text style={styles.emptyText}>
              Pull down to refresh and get new challenges
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={showLanguageModal}
        selectedLanguage={selectedLanguage}
        selectedLevel={selectedLevel}
        onLanguageChange={handleLanguageChange}
        onLevelChange={handleLevelChange}
        onClose={() => setShowLanguageModal(false)}
        learningPlans={userLearningPlans}
        activePlan={activeLearningPlan}
        onSelectPlan={handleSelectLearningPlan}
        totalChallenges={totalChallengeCount}
      />
    </SafeAreaView>
  );
}
