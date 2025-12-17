import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
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
import { LanguageLevelPicker } from '../../components/LanguageLevelPicker';

// Import challenge screens (will be created next)
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import SwipeFixScreen from './challenges/SwipeFixScreen';
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

  // Language/Level selection state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');
  const [totalChallengeCount, setTotalChallengeCount] = useState<number>(0);

  // Accordion state
  const [expandedCardType, setExpandedCardType] = useState<string | null>(null);
  const [cachedChallenges, setCachedChallenges] = useState<Record<string, Challenge[]>>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Completion tracking
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

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

  // Load user data and challenge counts
  useEffect(() => {
    if (isFocused) {
      checkForLevelChange();
    }
  }, [isFocused]);

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

  // Check if user changed their level in settings
  const checkForLevelChange = async () => {
    const levelChanged = await AsyncStorage.getItem('levelChanged');

    if (levelChanged === 'true') {
      const newLevel = await AsyncStorage.getItem('newLevel');
      console.log('🔄 Level change detected! Reloading challenges with level:', newLevel);

      // Clear the flags
      await AsyncStorage.removeItem('levelChanged');
      await AsyncStorage.removeItem('newLevel');

      // Clear cached challenges to force fresh fetch
      setCachedChallenges({});
      setExpandedCardType(null);

      // Force reload
      setIsLoading(true);
      await loadExploreData();
    } else {
      // Normal load
      await loadExploreData();
    }
  };

  const loadExploreData = async () => {
    try {
      setErrorMessage(null); // Clear any previous errors

      // Get user data from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      let level: CEFRLevel = 'B1';
      let language: Language = 'english';

      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'there');
        // Get user's CEFR level from preferred_level or default to B1
        level = (user.preferred_level || 'B1') as CEFRLevel;
        setUserLevel(level);

        // Try to get language from learning plan if available
        if (user.active_learning_plan?.language) {
          language = user.active_learning_plan.language as Language;
        }
      } else {
        // Guest user - default to B1 and english
        setUserName('there');
        setUserLevel('B1');
      }

      // Initialize selected language and level
      setSelectedLanguage(language);
      setSelectedLevel(level);

      console.log('📚 Loading challenge pool for level:', level, 'language:', language);

      // Load challenge counts for categories (pool system)
      // Pass language/level directly to avoid state synchronization issues
      await loadChallengeCounts(language, level);

    } catch (error) {
      console.error('❌ Error loading explore data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load challenge pool');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChallengeCounts = async (language?: Language, level?: CEFRLevel) => {
    try {
      // Use provided params or fall back to state
      const lang = language || selectedLanguage;
      const lvl = level || selectedLevel;

      const counts = await ChallengeService.getChallengeCounts(lang, lvl);
      setChallengeCounts(counts);

      // Calculate total challenge count
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalChallengeCount(total);

      console.log('📊 Challenge counts loaded:', counts, 'Total:', total);
    } catch (error) {
      console.error('Failed to load challenge counts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExploreData();
    setRefreshing(false);
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
      case 'swipe_fix':
        return <SwipeFixScreen {...commonProps} />;
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

          {/* Total Challenge Count */}
          {!isLoading && totalChallengeCount > 0 && (
            <View style={{
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#F0FDFA',
              borderRadius: 6,
              borderLeftWidth: 3,
              borderLeftColor: '#4ECFBF',
            }}>
              <Text style={{ fontSize: 13, color: '#0F766E', fontWeight: '600' }}>
                🎯 {totalChallengeCount} challenges available for {selectedLanguage} {selectedLevel}!
              </Text>
            </View>
          )}

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

        {/* Language/Level Picker */}
        {!isLoading && (
          <LanguageLevelPicker
            selectedLanguage={selectedLanguage}
            selectedLevel={selectedLevel}
            onLanguageChange={setSelectedLanguage}
            onLevelChange={setSelectedLevel}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {isFeatureEnabled('USE_CHALLENGE_API')
                ? '🎯 Generating your personalized challenges...'
                : '📚 Loading challenges...'}
            </Text>
            {isFeatureEnabled('USE_CHALLENGE_API') && (
              <Text style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' }}>
                First time may take up to 30 seconds
              </Text>
            )}
          </View>
        )}

        {/* Expandable Challenge Categories */}
        {!isLoading && Object.keys(challengeCounts).length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: 4,
            }}>
              📚 Practice Challenges
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              marginBottom: 16,
            }}>
              Tap to expand and start practicing
            </Text>

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
    </SafeAreaView>
  );
}
