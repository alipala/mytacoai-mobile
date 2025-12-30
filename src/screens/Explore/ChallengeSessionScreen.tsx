/**
 * Challenge Session Screen
 *
 * Main orchestrator for the gamified challenge session
 * Manages the flow between:
 * - Individual challenges
 * - Success/fail feedback screens
 * - Auto-progression
 * - Session summary
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useChallengeSession } from '../../contexts/ChallengeSessionContext';
import SessionProgressBar from '../../components/SessionProgressBar';
import SessionSummary from '../../components/SessionSummary';
import { SessionStats } from '../../types/session';
import { updateDailyStats, updateCategoryStats } from '../../services/dailyStatsService';
import { OutOfHeartsModal } from '../../components/OutOfHeartsModal';
import { WrongAnswerFeedback } from '../../components/WrongAnswerFeedback';
import { CHALLENGE_TYPE_API_NAMES } from '../../types/hearts';
import { heartAPI } from '../../services/heartAPI';

// Import individual challenge screens
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import SwipeFixScreen from './challenges/SwipeFixScreen';
import MicroQuizScreen from './challenges/MicroQuizScreen';
import SmartFlashcardScreen from './challenges/SmartFlashcardScreen';
import NativeCheckScreen from './challenges/NativeCheckScreen';
import BrainTicklerScreen from './challenges/BrainTicklerScreen';

interface ChallengeSessionScreenProps {
  navigation: any;
  route: any;
}

export default function ChallengeSessionScreen({
  navigation,
  route,
}: ChallengeSessionScreenProps) {
  const {
    session,
    startSession,
    answerChallenge,
    nextChallenge,
    endSession,
    getCurrentChallenge,
    isSessionComplete,
  } = useChallengeSession();

  const [showSummary, setShowSummary] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [savedSessionInfo, setSavedSessionInfo] = useState<{
    userId: string;
    language: any;
    level: any;
    challengeType: string;
    source: 'reference' | 'learning_plan';
  } | null>(null);
  const [showOutOfHeartsModal, setShowOutOfHeartsModal] = useState(false);
  const [userSubscriptionPlan, setUserSubscriptionPlan] = useState<string>('try_learn');
  const [showWrongAnswerFeedback, setShowWrongAnswerFeedback] = useState(false);

  const currentChallenge = getCurrentChallenge();

  // Get background color - clean whitish for all challenge types
  const getBackgroundColor = () => {
    return '#FAFAFA'; // Clean whitish background
  };

  // Load user subscription plan
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserSubscriptionPlan(user.subscription_plan || 'try_learn');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Watch for out-of-hearts
  useEffect(() => {
    if (session?.lastHeartResponse?.outOfHearts) {
      setShowOutOfHeartsModal(true);

      // Log modal shown
      if (session.challengeType) {
        const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[session.challengeType] || session.challengeType;
        heartAPI.logModalInteraction(
          challengeTypeAPI,
          'shown',
          session.id,
          {
            completed: session.completedChallenges,
            total: session.challenges.length
          }
        );
      }
    }
  }, [session?.lastHeartResponse]);

  // Check if session is complete (but NOT if ended early due to no hearts)
  useEffect(() => {
    if (isSessionComplete() && !session?.endedEarly) {
      handleSessionComplete();
    }
  }, [session?.isActive, session?.endedEarly]);

  /**
   * Handle wrong answer selection (separate from completion)
   * Triggers animations immediately when wrong answer is selected
   */
  const handleWrongAnswerSelected = () => {
    console.log('💔 Wrong answer selected - triggering animations');
    setShowWrongAnswerFeedback(true);
  };

  /**
   * Handle challenge answer and advance
   */
  const handleChallengeAnswer = async (
    challengeId: string,
    isCorrect: boolean,
    details?: any
  ) => {
    if (!session) return;

    console.log(`📝 Challenge answered:`, { challengeId, isCorrect, details });

    // Update daily stats
    try {
      await updateDailyStats(isCorrect);
      console.log('✅ Daily stats updated');
    } catch (error) {
      console.error('❌ Error updating daily stats:', error);
    }

    // Update category stats if we have session info
    if (savedSessionInfo) {
      try {
        const totalChallenges = session.challenges.length;
        await updateCategoryStats(
          savedSessionInfo.language,
          savedSessionInfo.level,
          savedSessionInfo.challengeType,
          isCorrect,
          totalChallenges
        );
        console.log('✅ Category stats updated');
      } catch (error) {
        console.error('❌ Error updating category stats:', error);
      }
    }

    // Check if this is the last challenge BEFORE advancing
    const isLastChallenge = session.completedChallenges + 1 >= session.challenges.length;

    // Record answer in session
    answerChallenge(challengeId, isCorrect);

    if (isLastChallenge) {
      // This was the last challenge - show summary
      console.log('🎊 Last challenge completed, showing summary');
      // ⏱️ Wait for state update to complete before ending session
      // This prevents a race condition where the last answer isn't counted
      setTimeout(() => {
        handleSessionComplete();
      }, 0);
    } else {
      // Advance to next challenge
      nextChallenge();
    }
  };

  /**
   * Handle session completion
   */
  const handleSessionComplete = async () => {
    // Show loading animation
    setShowLoading(true);

    // Save session info before it gets cleared by endSession
    if (session) {
      setSavedSessionInfo({
        userId: session.userId,
        language: session.language,
        level: session.level,
        challengeType: session.challengeType,
        source: session.source,
      });
    }

    try {
      const stats = await endSession();
      console.log('📈 Session stats:', stats);
      setSessionStats(stats);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        setShowLoading(false);
        setShowSummary(true);
      }, 500);
    } catch (error) {
      console.error('❌ Error ending session:', error);
      // Show summary anyway with default values
      setTimeout(() => {
        setShowLoading(false);
        setShowSummary(true);
      }, 500);
    }
  };

  /**
   * Continue with new session
   */
  const handleContinue = () => {
    setShowSummary(false);
    // Navigate back to challenge selection
    navigation.goBack();
  };

  /**
   * Review mistakes - start new session with only incorrect challenges
   */
  const handleReviewMistakes = async () => {
    if (!sessionStats || sessionStats.incorrectChallenges.length === 0) {
      console.warn('No session stats or no incorrect challenges to review');
      return;
    }

    // Get session data from saved info or fallback to route params
    const firstChallenge = sessionStats.incorrectChallenges[0];
    const userId = savedSessionInfo?.userId || route.params?.userId || 'default_user';
    const language = savedSessionInfo?.language || firstChallenge.language || route.params?.language || 'english';
    const level = savedSessionInfo?.level || firstChallenge.cefrLevel || route.params?.level || 'B1';
    const challengeType = savedSessionInfo?.challengeType || firstChallenge.type;
    const source = savedSessionInfo?.source || route.params?.source || 'reference';

    setShowSummary(false);

    // Start new review session with only incorrect challenges
    try {
      await startSession({
        userId,
        language,
        level,
        challengeType,
        source,
        specificChallenges: sessionStats.incorrectChallenges,
      });
      console.log(`🔄 Starting review session with ${sessionStats.incorrectChallenges.length} incorrect challenges`);
    } catch (error) {
      console.error('❌ Error starting review session:', error);
    }
  };

  /**
   * Exit to explore screen
   */
  const handleExit = () => {
    setShowSummary(false);
    navigation.goBack();
  };

  /**
   * Handle quit/back button
   */
  const handleQuit = () => {
    if (!session) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Quit Session?',
      `You've completed ${session.completedChallenges}/${session.challenges.length} challenges. Your progress will be saved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            // Save progress and exit
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Render current challenge based on type
  const renderChallenge = () => {
    if (!currentChallenge) {
      return null;
    }

    const challengeProps = {
      challenge: currentChallenge,
      onComplete: handleChallengeAnswer,
      onWrongAnswerSelected: handleWrongAnswerSelected,
      onClose: handleQuit,
    };

    switch (currentChallenge.type) {
      case 'error_spotting':
        return <ErrorSpottingScreen key={currentChallenge.id} {...challengeProps} />;
      case 'swipe_fix':
        return <SwipeFixScreen key={currentChallenge.id} {...challengeProps} />;
      case 'micro_quiz':
        return <MicroQuizScreen key={currentChallenge.id} {...challengeProps} />;
      case 'smart_flashcard':
        return <SmartFlashcardScreen key={currentChallenge.id} {...challengeProps} />;
      case 'native_check':
        return <NativeCheckScreen key={currentChallenge.id} {...challengeProps} />;
      case 'brain_tickler':
        return <BrainTicklerScreen key={currentChallenge.id} {...challengeProps} />;
      default:
        return null;
    }
  };

  // Allow rendering if showing summary even if session is null
  if (!session && !showSummary) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        {/* Session Progress Bar - Only show if session exists */}
        {session && !showLoading && <SessionProgressBar heartPool={session.heartPool} />}
      </SafeAreaView>

      {/* Loading Screen - Show while calculating stats */}
      {showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06B6D4" />
          <Text style={styles.loadingText}>Calculating results...</Text>
        </View>
      )}

      {/* Main Content - Show current challenge */}
      {session && !showLoading && (
        <View style={styles.content}>
          {renderChallenge()}
        </View>
      )}

      {/* Session Summary Modal */}
      <Modal
        visible={showSummary}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          {sessionStats && (
            <SessionSummary
              stats={sessionStats}
              onContinue={handleContinue}
              onReviewMistakes={handleReviewMistakes}
              onExit={handleExit}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Wrong Answer Feedback - Synchronized animations */}
      <WrongAnswerFeedback
        visible={showWrongAnswerFeedback}
        intensity="medium"
        onAnimationComplete={() => {
          setShowWrongAnswerFeedback(false);
        }}
      />

      {/* Out of Hearts Modal */}
      {session && showOutOfHeartsModal && session.lastHeartResponse && (
        <OutOfHeartsModal
          visible={showOutOfHeartsModal}
          challengeType={CHALLENGE_TYPE_API_NAMES[session.challengeType] || session.challengeType}
          refillInfo={session.lastHeartResponse.refillInfo!}
          subscriptionPlan={userSubscriptionPlan}
          onUpgrade={() => {
            // Log upgrade click
            const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[session.challengeType] || session.challengeType;
            heartAPI.logModalInteraction(
              challengeTypeAPI,
              'upgrade',
              session.id,
              { completed: session.completedChallenges, total: session.challenges.length }
            );
            setShowOutOfHeartsModal(false);
            navigation.navigate('Checkout');
          }}
          onWait={() => {
            // Log wait click
            const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[session.challengeType] || session.challengeType;
            heartAPI.logModalInteraction(
              challengeTypeAPI,
              'wait',
              session.id,
              { completed: session.completedChallenges, total: session.challenges.length }
            );
            setShowOutOfHeartsModal(false);
            navigation.goBack();
          }}
          onDismiss={() => {
            // Log dismiss
            const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[session.challengeType] || session.challengeType;
            heartAPI.logModalInteraction(
              challengeTypeAPI,
              'dismissed',
              session.id,
              { completed: session.completedChallenges, total: session.challenges.length }
            );
            setShowOutOfHeartsModal(false);
            navigation.goBack();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden', // Hide anything that extends beyond bounds
  },
});
