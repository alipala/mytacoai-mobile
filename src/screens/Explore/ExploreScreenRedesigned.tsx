import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Language, CEFRLevel, Challenge } from '../../services/mockChallengeData';
import { ChallengeService, CHALLENGE_TYPES } from '../../services/challengeService';
import { LearningService } from '../../api/generated/services/LearningService';
import type { LearningPlan } from '../../api/generated';
import { ExpandableChallengeCard } from '../../components/ExpandableChallengeCard';
import { loadTodayCompletions } from '../../services/completionTracker';

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

  // User data
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Completed plans mode
  const [completedPlans, setCompletedPlans] = useState<LearningPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);

  // Freestyle mode
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');

  // Challenges
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});
  const [totalChallengeCount, setTotalChallengeCount] = useState<number>(0);
  const [expandedCardType, setExpandedCardType] = useState<string | null>(null);
  const [cachedChallenges, setCachedChallenges] = useState<Record<string, Challenge[]>>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Load initial data
  useEffect(() => {
    if (isFocused) {
      loadInitialData();
    }
  }, [isFocused]);

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

  const handleModeSelection = (mode: PracticeMode) => {
    setPracticeMode(mode);
    if (mode === 'completed_plans') {
      setNavState('completed_plans');
    } else {
      setNavState('freestyle_selection');
    }
  };

  const handlePlanSelection = async (plan: LearningPlan) => {
    setSelectedPlan(plan);
    setIsLoading(true);

    try {
      // Load challenges for this plan
      const lang = plan.language as Language;
      const level = plan.proficiency_level as CEFRLevel;

      const counts = await ChallengeService.getChallengeCounts(lang, level);
      setChallengeCounts(counts);

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalChallengeCount(total);

      setNavState('challenge_list');
    } catch (error) {
      console.error('❌ Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreestyleContinue = async () => {
    setIsLoading(true);

    try {
      const counts = await ChallengeService.getChallengeCounts(selectedLanguage, selectedLevel);
      setChallengeCounts(counts);

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalChallengeCount(total);

      setNavState('challenge_list');
    } catch (error) {
      console.error('❌ Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (navState === 'completed_plans' || navState === 'freestyle_selection') {
      setNavState('mode_selection');
      setPracticeMode(null);
    } else if (navState === 'challenge_list') {
      if (practiceMode === 'completed_plans') {
        setNavState('completed_plans');
      } else {
        setNavState('freestyle_selection');
      }
      setExpandedCardType(null);
      setCachedChallenges({});
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

      const result = await ChallengeService.getChallengesByType(challengeType, 50, lang, level);

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
    setSelectedChallenge(challenge);
  };

  // Render functions for each screen
  const renderModeSelection = () => (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 }}>
        Explore
      </Text>
      <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 32 }}>
        👋 Hi {userName}, choose your practice mode
      </Text>

      {/* Completed Plans Card */}
      <TouchableOpacity
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: '#14B8A6',
          shadowColor: '#14B8A6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
        onPress={() => handleModeSelection('completed_plans')}
        activeOpacity={0.7}
        disabled={completedPlans.length === 0}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 32, marginRight: 12 }}>🎓</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F766E', flex: 1 }}>
            Review Completed Plans
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: '#14B8A6', marginBottom: 16, lineHeight: 20 }}>
          Practice from learning plans you've finished (100% complete)
        </Text>
        <View style={{
          backgroundColor: '#F0FDFA',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F766E' }}>
            {completedPlans.length > 0
              ? `${completedPlans.length} completed plan${completedPlans.length > 1 ? 's' : ''} available`
              : 'No completed plans yet'}
          </Text>
          {completedPlans.length > 0 && (
            <Text style={{ fontSize: 16, color: '#14B8A6' }}>→</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Freestyle Practice Card */}
      <TouchableOpacity
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          borderWidth: 2,
          borderColor: '#4ECFBF',
          shadowColor: '#4ECFBF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
        onPress={() => handleModeSelection('freestyle')}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 32, marginRight: 12 }}>🌍</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F766E', flex: 1 }}>
            Freestyle Practice
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: '#14B8A6', marginBottom: 16, lineHeight: 20 }}>
          Choose any language and level from our challenge library
        </Text>
        <View style={{
          backgroundColor: '#F0FDFA',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F766E' }}>
            6 languages · All CEFR levels
          </Text>
          <Text style={{ fontSize: 16, color: '#14B8A6' }}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCompletedPlans = () => (
    <View style={{ flex: 1 }}>
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
          <Text style={{ fontSize: 24, color: '#4ECFBF' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937' }}>
          Completed Plans
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        {completedPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1.5,
              borderColor: '#14B8A6',
              shadowColor: '#14B8A6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => handlePlanSelection(plan)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>
                {plan.language === 'english' ? '🇬🇧' :
                 plan.language === 'spanish' ? '🇪🇸' :
                 plan.language === 'dutch' ? '🇳🇱' :
                 plan.language === 'german' ? '🇩🇪' :
                 plan.language === 'french' ? '🇫🇷' : '🇵🇹'}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F766E' }}>
                {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)} · {plan.proficiency_level}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, marginRight: 6 }}>✅</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#14B8A6' }}>
                100% Complete
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              {plan.total_sessions || 0} sessions · {plan.completed_sessions || 0} completed
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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

    const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    return (
      <View style={{ flex: 1 }}>
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
            <Text style={{ fontSize: 24, color: '#4ECFBF' }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937' }}>
            Choose Language & Level
          </Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Selected Summary */}
          <View style={{
            backgroundColor: '#F0FDFA',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: '#14B8A6',
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F766E', marginBottom: 4 }}>
              Selected: {LANGUAGES.find(l => l.code === selectedLanguage)?.name} · {selectedLevel}
            </Text>
            <Text style={{ fontSize: 13, color: '#14B8A6' }}>
              Tap Continue to see challenges
            </Text>
          </View>

          {/* Language Selection */}
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' }}>
            🌍 LANGUAGE
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  width: '48%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: selectedLanguage === lang.code ? '#F0FDFA' : '#F9FAFB',
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1.5,
                  borderColor: selectedLanguage === lang.code ? '#4ECFBF' : '#E5E7EB',
                }}
                onPress={() => setSelectedLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 24, marginRight: 10 }}>{lang.flag}</Text>
                <Text style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: selectedLanguage === lang.code ? '#0F766E' : '#6B7280',
                }}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Level Selection */}
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' }}>
            📊 CEFR LEVEL
          </Text>
          <View style={{ gap: 10, marginBottom: 24 }}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: selectedLevel === level ? '#F0FDFA' : '#F9FAFB',
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1.5,
                  borderColor: selectedLevel === level ? '#4ECFBF' : '#E5E7EB',
                }}
                onPress={() => setSelectedLevel(level)}
                activeOpacity={0.7}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: selectedLevel === level ? '#0F766E' : '#6B7280',
                  minWidth: 36,
                }}>
                  {level}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: selectedLevel === level ? '#14B8A6' : '#9CA3AF',
                  flex: 1,
                }}>
                  {level === 'A1' ? 'Beginner' :
                   level === 'A2' ? 'Elementary' :
                   level === 'B1' ? 'Intermediate' :
                   level === 'B2' ? 'Upper Intermediate' :
                   level === 'C1' ? 'Advanced' : 'Proficient'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#4ECFBF',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 32,
              shadowColor: '#4ECFBF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleFreestyleContinue}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
              Continue to Challenges
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderChallengeList = () => {
    const title = selectedPlan
      ? `${selectedPlan.language.charAt(0).toUpperCase() + selectedPlan.language.slice(1)} ${selectedPlan.proficiency_level}`
      : `${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} ${selectedLevel}`;

    return (
      <View style={{ flex: 1 }}>
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
            <Text style={{ fontSize: 24, color: '#4ECFBF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937' }}>
              {title} Challenges
            </Text>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              {totalChallengeCount} challenges available
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
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
      </View>
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

      {/* Challenge Modals (if needed) */}
      {/* Add your challenge screen modals here */}
    </SafeAreaView>
  );
}
