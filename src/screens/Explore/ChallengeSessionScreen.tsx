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
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChallengeSession } from '../../contexts/ChallengeSessionContext';
import SessionProgressBar from '../../components/SessionProgressBar';
import SessionSummary from '../../components/SessionSummary';
import { SessionStats } from '../../types/session';
import { updateDailyStats, updateCategoryStats } from '../../services/dailyStatsService';

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
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [savedSessionInfo, setSavedSessionInfo] = useState<{
    userId: string;
    language: any;
    level: any;
    challengeType: string;
    source: 'reference' | 'learning_plan';
  } | null>(null);

  const currentChallenge = getCurrentChallenge();

  // Check if session is complete
  useEffect(() => {
    if (isSessionComplete()) {
      handleSessionComplete();
    }
  }, [session?.isActive]);

  /**
   * Handle challenge answer and advance
   */
  const handleChallengeAnswer = async (challengeId: string, isCorrect: boolean, details?: any) => {
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
      handleSessionComplete();
    } else {
      // Advance to next challenge
      nextChallenge();
    }
  };

  /**
   * Handle session completion
   */
  const handleSessionComplete = async () => {
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
      setShowSummary(true);
    } catch (error) {
      console.error('❌ Error ending session:', error);
      // Show summary anyway with default values
      setShowSummary(true);
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Session Progress Bar - Only show if session exists */}
      {session && <SessionProgressBar />}

      {/* Main Content - Show current challenge */}
      {session && (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
