import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { styles } from './styles/ExploreScreen.styles';
import { ChallengeCard } from '../../components/ChallengeCard';
import {
  getDailyChallenges,
  Challenge,
  CEFRLevel,
} from '../../services/mockChallengeData';

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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const isFocused = useIsFocused();

  // Load user data and challenges
  useEffect(() => {
    if (isFocused) {
      loadExploreData();
    }
  }, [isFocused]);

  // Entry animation
  useEffect(() => {
    if (!isLoading && challenges.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, challenges]);

  const loadExploreData = async () => {
    try {
      console.log('🔍 [Explore] Loading explore data...');
      // Get user data from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('👤 [Explore] User found:', user.name);
        setUserName(user.name || 'there');
        // Get user's CEFR level from preferred_level or default to B1
        const level = (user.preferred_level || 'B1') as CEFRLevel;
        console.log('📊 [Explore] User CEFR level:', level);
        setUserLevel(level);

        // Generate challenges based on user level
        const dailyChallenges = getDailyChallenges(level);
        console.log('🎯 [Explore] Generated challenges:', dailyChallenges.length);
        console.log('🎯 [Explore] Challenge types:', dailyChallenges.map(c => c.type));
        setChallenges(dailyChallenges);
      } else {
        // Guest user - default to B1
        console.log('👤 [Explore] No user found, using guest defaults');
        setUserName('there');
        const dailyChallenges = getDailyChallenges('B1');
        console.log('🎯 [Explore] Generated challenges for guest:', dailyChallenges.length);
        setChallenges(dailyChallenges);
      }
    } catch (error) {
      console.error('❌ [Explore] Error loading explore data:', error);
      // Fallback to default challenges
      const dailyChallenges = getDailyChallenges('B1');
      console.log('🔄 [Explore] Fallback challenges:', dailyChallenges.length);
      setChallenges(dailyChallenges);
    } finally {
      console.log('✅ [Explore] Loading complete, isLoading set to false');
      setIsLoading(false);
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

  const handleChallengeComplete = (challengeId: string) => {
    // Mark challenge as completed
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId ? { ...c, completed: true } : c
      )
    );
    // Close challenge screen
    setSelectedChallenge(null);
  };

  const handleChallengeClose = () => {
    setSelectedChallenge(null);
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
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading challenges...</Text>
          </View>
        )}

        {/* Challenge Cards */}
        {!isLoading && challenges.length > 0 && (
          <View style={styles.cardsContainer}>
            {console.log('📦 [Explore] Rendering', challenges.length, 'challenge cards')}
            {challenges.map((challenge, index) => {
              console.log('🎴 [Explore] Rendering card:', challenge.id, challenge.type);
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onPress={() => handleChallengePress(challenge)}
                  index={index}
                />
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && challenges.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No challenges today</Text>
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
