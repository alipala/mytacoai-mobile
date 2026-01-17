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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useChallengeSession } from '../../contexts/ChallengeSessionContext';
import SessionProgressBar from '../../components/SessionProgressBar';
import SessionSummary from '../../components/SessionSummary';
import { SessionStats } from '../../types/session';
import { updateDailyStats, updateCategoryStats } from '../../services/dailyStatsService';
import { OutOfHeartsModal } from '../../components/OutOfHeartsModal';
import { PricingModal } from '../../components/PricingModal';
import { WrongAnswerFeedback } from '../../components/WrongAnswerFeedback';
import { CHALLENGE_TYPE_API_NAMES } from '../../types/hearts';
import { heartAPI } from '../../services/heartAPI';

// Import individual challenge screens
import ErrorSpottingScreen from './challenges/ErrorSpottingScreen';
import MicroQuizScreen from './challenges/MicroQuizScreen';
import SmartFlashcardScreen from './challenges/SmartFlashcardScreen';
import NativeCheckScreen from './challenges/NativeCheckScreen';
import BrainTicklerScreen from './challenges/BrainTicklerScreen';
import StoryBuilderScreen from './challenges/StoryBuilderScreen';

// Study Mode component
import { StudyModeCard } from '../../components/StudyModeCard';

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
    quitSession,
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

  // Pricing modal state
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Quit confirmation modal state
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isQuitting, setIsQuitting] = useState(false);

  // Ref to track if we're currently showing the quit modal
  const isShowingQuitModalRef = React.useRef(false);

  // Ref to always have the latest session (fixes closure stale state in setTimeout callbacks)
  const sessionRef = React.useRef(session);

  const currentChallenge = getCurrentChallenge();

  // Update sessionRef whenever session changes
  React.useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Get background color - clean whitish for all challenge types
  const getBackgroundColor = () => {
    return '#FAFAFA'; // Clean whitish background
  };

  // Disable swipe-back gesture when session is active
  React.useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: !session?.isActive,
    });
  }, [navigation, session?.isActive]);

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

    // Record answer in session - MUST AWAIT to prevent race condition with progress indicator
    await answerChallenge(challengeId, isCorrect);

    // IMPORTANT: Check if out of hearts after answering
    // We need to wait a tick for React state to update after answerChallenge completes
    setTimeout(() => {
      // Use ref to get the latest session state (avoids stale closure)
      const latestSession = sessionRef.current;

      // If out of hearts, don't advance - let the OutOfHeartsModal show
      if (latestSession?.lastHeartResponse?.outOfHearts || latestSession?.endedEarly) {
        console.log('❤️  Out of hearts detected - stopping challenge advancement');
        return;
      }

      // NATIVE_CHECK EXCEPTION: Don't auto-advance (challenge screen handles timing for undo)
      // The challenge screen will call nextChallenge directly after undo window expires
      const currentChallenge = latestSession?.challenges[latestSession?.currentIndex];
      if (currentChallenge?.type === 'native_check') {
        console.log('⏸️  Native check - challenge screen will handle advancement after undo window');
        return;
      }

      if (isLastChallenge) {
        // This was the last challenge - show summary
        console.log('🎊 Last challenge completed, showing summary');
        handleSessionComplete();
      } else {
        // Advance to next challenge
        nextChallenge();
      }
    }, 0);
  };

  /**
   * Handle session completion
   */
  const handleSessionComplete = async () => {
    // Study Mode: Skip summary and go straight back to explore
    if (session?.isStudyMode) {
      console.log('📖 Study Mode complete - returning to explore');
      try {
        await endSession(); // Clean up session
      } catch (error) {
        console.error('❌ Error ending study session:', error);
      }
      navigation.goBack(); // Return to explore
      return;
    }

    // Regular Mode: Show loading and summary
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
        isStudyMode: true, // Enable study mode for learning-focused review
      });
      console.log(`📖 Starting STUDY MODE with ${sessionStats.incorrectChallenges.length} incorrect challenges`);
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
   * Shows custom confirmation modal before allowing navigation
   * Note: Swipe gestures are disabled during active session (gestureEnabled: false)
   */
  const handleQuit = () => {
    if (!session || !session.isActive) {
      navigation.goBack();
      return;
    }

    // Show custom quit modal
    setShowQuitModal(true);
  };

  /**
   * Handle quit confirmation
   */
  const handleConfirmQuit = async () => {
    try {
      // Show loading immediately for feedback
      setIsQuitting(true);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      console.log('🚪 Quitting session and saving progress...');
      await quitSession();
      console.log('✅ Quit complete, navigating back...');

      // Close modal and navigate
      setShowQuitModal(false);
      setIsQuitting(false);
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error during quit:', error);
      setIsQuitting(false);
      setShowQuitModal(false);
    }
  };

  /**
   * Handle quit cancellation
   */
  const handleCancelQuit = () => {
    console.log('❌ User cancelled quit');
    setShowQuitModal(false);
  };

  // Pricing and upgrade handlers
  const handleUpgradePress = () => {
    console.log('🚀 User clicked upgrade from out of hearts modal');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Log upgrade click
    if (session?.challengeType) {
      const challengeTypeAPI = CHALLENGE_TYPE_API_NAMES[session.challengeType] || session.challengeType;
      heartAPI.logModalInteraction(
        challengeTypeAPI,
        'upgrade_clicked',
        session.id,
        {
          completed: session.completedChallenges,
          total: session.challenges.length
        }
      );
    }

    setShowOutOfHeartsModal(false);
    setShowPricingModal(true);
  };

  const handleSelectPlan = (planId: string, period: 'monthly' | 'annual') => {
    console.log(`💳 User selected plan: ${planId} (${period})`);
    setShowPricingModal(false);
    // Navigate to checkout screen with plan details
    navigation.navigate('Checkout', { planId, period });
  };

  // Render current challenge based on type
  const renderChallenge = () => {
    if (!currentChallenge || !session) {
      return null;
    }

    // Study Mode - Show educational review card
    if (session.isStudyMode) {
      return (
        <StudyModeCard
          key={currentChallenge.id}
          challenge={currentChallenge}
          currentIndex={session.currentIndex}
          totalChallenges={session.challenges.length}
          onNext={() => {
            // Mark as "reviewed" (no XP, no heart consumption)
            answerChallenge(currentChallenge.id, true); // Mark as correct to avoid heart loss
            nextChallenge();
          }}
        />
      );
    }

    // Regular Challenge Mode
    const challengeProps = {
      challenge: currentChallenge,
      onComplete: handleChallengeAnswer,
      onWrongAnswerSelected: handleWrongAnswerSelected,
      onClose: handleQuit,
      onAdvance: nextChallenge, // For Native Check undo mechanic
    };

    switch (currentChallenge.type) {
      case 'error_spotting':
        return <ErrorSpottingScreen key={currentChallenge.id} {...challengeProps} />;
      case 'micro_quiz':
        return <MicroQuizScreen key={currentChallenge.id} {...challengeProps} />;
      case 'smart_flashcard':
        return <SmartFlashcardScreen key={currentChallenge.id} {...challengeProps} />;
      case 'native_check':
        return <NativeCheckScreen key={currentChallenge.id} {...challengeProps} />;
      case 'brain_tickler':
        return <BrainTicklerScreen key={currentChallenge.id} {...challengeProps} />;
      case 'story_builder':
        return <StoryBuilderScreen key={currentChallenge.id} challenge={currentChallenge as any} onComplete={challengeProps.onComplete} onWrongAnswerSelected={challengeProps.onWrongAnswerSelected} onClose={challengeProps.onClose} />;
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

      {/* Close Button - Floating in top-left corner */}
      {session && !showLoading && !showSummary && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleQuit}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#6B7280" />
        </TouchableOpacity>
      )}

      {/* Loading Screen - Show while calculating stats */}
      {showLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../assets/lottie/calculating.json')}
            autoPlay
            loop
            style={styles.calculatingAnimation}
          />
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
          onUpgrade={handleUpgradePress}
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

      {/* Pricing Modal */}
      <PricingModal
        visible={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Custom Quit Confirmation Modal */}
      <Modal
        visible={showQuitModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.quitModalOverlay}>
          <View style={styles.quitModalContent}>
            {/* Icon */}
            <View style={styles.quitModalIcon}>
              <Ionicons name="alert-circle" size={56} color="#F59E0B" />
            </View>

            {/* Title */}
            <Text style={styles.quitModalTitle}>Quit Session?</Text>

            {/* Message */}
            {session && (
              <View style={styles.quitModalMessage}>
                {session.completedChallenges > 0 ? (
                  <>
                    <Text style={styles.quitModalText}>
                      You've completed <Text style={styles.quitModalTextBold}>{session.completedChallenges}/{session.challenges.length}</Text> challenges.
                    </Text>
                    <View style={styles.quitModalInfoRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.quitModalInfoText}>Your progress will be saved</Text>
                    </View>
                    <View style={styles.quitModalInfoRow}>
                      <Ionicons name="warning" size={20} color="#F59E0B" />
                      <Text style={styles.quitModalInfoText}>Hearts used will NOT be refunded</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.quitModalText}>
                      You haven't completed any challenges yet.
                    </Text>
                    <View style={styles.quitModalInfoRow}>
                      <Ionicons name="warning" size={20} color="#F59E0B" />
                      <Text style={styles.quitModalInfoText}>Hearts used will NOT be refunded</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Buttons */}
            <View style={styles.quitModalButtons}>
              <TouchableOpacity
                style={[styles.quitModalButton, styles.quitModalButtonCancel]}
                onPress={handleCancelQuit}
                activeOpacity={0.8}
                disabled={isQuitting}
              >
                <Text style={styles.quitModalButtonTextCancel}>Keep Playing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quitModalButton,
                  styles.quitModalButtonQuit,
                  isQuitting && styles.quitModalButtonDisabled
                ]}
                onPress={handleConfirmQuit}
                activeOpacity={0.8}
                disabled={isQuitting}
              >
                {isQuitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.quitModalButtonTextQuit}>Quit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  calculatingAnimation: {
    width: 200,
    height: 200,
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
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 12, // Positioned to sit in the notch
    right: 8, // Right side with small margin
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001, // Higher z-index to sit above stats card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  // Custom Quit Modal Styles
  quitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quitModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  quitModalIcon: {
    marginBottom: 20,
  },
  quitModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  quitModalMessage: {
    width: '100%',
    marginBottom: 28,
  },
  quitModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  quitModalTextBold: {
    fontWeight: '700',
    color: '#111827',
  },
  quitModalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  quitModalInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    flex: 1,
  },
  quitModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  quitModalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitModalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quitModalButtonQuit: {
    backgroundColor: '#EF4444',
  },
  quitModalButtonDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.7,
  },
  quitModalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  quitModalButtonTextQuit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
