/**
 * Story Builder Screen
 *
 * Drag & drop challenge for contextual story completion
 * Features:
 * - Mini-story with gaps (2-4 sentences)
 * - Draggable word tiles
 * - Inline gap placement
 * - Validation with visual feedback
 * - Heart system integration
 * - XP rewards
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
  withDecay,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../../constants/colors';
import { LearningCompanion } from '../../../components/LearningCompanion';
import { XPFlyingNumber } from '../../../components/XPFlyingNumber';
import { SkiaParticleBurst } from '../../../components/SkiaParticleBurst';
import { useCharacterState } from '../../../hooks/useCharacterState';
import { useChallengeSession } from '../../../contexts/ChallengeSessionContext';
import { calculateXP } from '../../../services/xpCalculator';
import { useAudio } from '../../../hooks/useAudio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoryGap {
  id: string;
  correctWord: string;
  positionIndex: number;
  alternativeCorrectWords?: string[];
}

interface StoryBuilderChallenge {
  id: string;
  type: 'story_builder';
  title: string;
  emoji: string;
  description: string;
  cefrLevel: string;
  estimatedSeconds: number;
  storyText: string;
  gaps: StoryGap[];
  wordBank: string[];
  explanation: string;
  styleNote?: string | null;
  tags: string[];
  completed: boolean;
}

interface StoryBuilderScreenProps {
  challenge: StoryBuilderChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onWrongAnswerSelected?: () => void;
  onClose: () => void;
}

interface GapState {
  id: string;
  filledWord: string | null;
  layout: { x: number; y: number; width: number; height: number } | null;
}

export default function StoryBuilderScreen({
  challenge,
  onComplete,
  onWrongAnswerSelected,
  onClose,
}: StoryBuilderScreenProps) {
  const [gapStates, setGapStates] = useState<GapState[]>(
    challenge.gaps.map((gap) => ({
      id: gap.id,
      filledWord: null,
      layout: null,
    }))
  );
  const [availableWords, setAvailableWords] = useState<string[]>([...challenge.wordBank]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: SCREEN_WIDTH / 2, y: 300 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [startTime] = useState(Date.now());

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer, updateState } = useCharacterState();
  const { play } = useAudio();

  // Animation values
  const storyScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);

  // Reset state when challenge changes
  useEffect(() => {
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setGapStates(
      challenge.gaps.map((gap) => ({
        id: gap.id,
        filledWord: null,
        layout: null,
      }))
    );
    setAvailableWords([...challenge.wordBank]);
    setShowFeedback(false);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    backgroundOpacity.value = 0;
  }, [challenge.id]);

  const handleGapLayout = (gapId: string, event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setGapStates((prev) =>
      prev.map((gap) =>
        gap.id === gapId
          ? { ...gap, layout: { x, y, width, height } }
          : gap
      )
    );
  };

  const handleWordDrop = (gapId: string, word: string) => {
    // Remove word from available words
    setAvailableWords((prev) => prev.filter((w) => w !== word));

    // Fill the gap
    setGapStates((prev) =>
      prev.map((gap) =>
        gap.id === gapId ? { ...gap, filledWord: word } : gap
      )
    );

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Play soft snap sound
    play('card_flip');
  };

  const handleWordRemove = (gapId: string) => {
    const gap = gapStates.find((g) => g.id === gapId);
    if (!gap || !gap.filledWord) return;

    // Return word to available words
    setAvailableWords((prev) => [...prev, gap.filledWord as string]);

    // Clear the gap
    setGapStates((prev) =>
      prev.map((g) => (g.id === gapId ? { ...g, filledWord: null } : g))
    );

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateAnswer = () => {
    // Check if all gaps are filled
    const allFilled = gapStates.every((gap) => gap.filledWord !== null);
    if (!allFilled) return;

    let isCorrect = true;
    const incorrectGapIds: string[] = [];

    // Validate each gap
    for (const gapState of gapStates) {
      const gapDefinition = challenge.gaps.find((g) => g.id === gapState.id);
      if (!gapDefinition || !gapState.filledWord) continue;

      const correctWords = [
        gapDefinition.correctWord,
        ...(gapDefinition.alternativeCorrectWords || []),
      ];

      if (!correctWords.includes(gapState.filledWord)) {
        isCorrect = false;
        incorrectGapIds.push(gapState.id);
      }
    }

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer(incorrectGapIds);
    }
  };

  const handleCorrectAnswer = () => {
    setShowFeedback(true);
    reactToAnswer(true);

    // Calculate XP
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const combo = session?.currentCombo || 1;
    const xpResult = calculateXP(true, timeSpent, combo);

    setXPValue(xpResult.baseXP);
    setSpeedBonus(xpResult.speedBonus);

    // Show particle burst
    setShowParticleBurst(true);

    // Show XP animation
    setTimeout(() => {
      setShowXPAnimation(true);
    }, 150);

    // Background success glow
    backgroundOpacity.value = withSequence(
      withTiming(0.3, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );

    // Play correct answer sound
    play('correct_answer');

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Auto-advance with fade out
    setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)(challenge.id, true, {
            correctAnswer: 'Story completed correctly',
            explanation: challenge.explanation,
          });
        }
      });
    }, 1800);
  };

  const handleIncorrectAnswer = (incorrectGapIds: string[]) => {
    // Shake animation for story container
    storyScale.value = withSequence(
      withTiming(1.02, { duration: 50 }),
      withTiming(0.98, { duration: 50 }),
      withTiming(1.02, { duration: 50 }),
      withTiming(1, { duration: 50 })
    );

    // Trigger wrong answer animations
    if (onWrongAnswerSelected) {
      onWrongAnswerSelected();
    }

    // Show feedback after brief delay
    setTimeout(() => {
      setShowFeedback(true);
      reactToAnswer(false);
    }, 300);
  };

  const handleContinue = () => {
    screenOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)(challenge.id, false, {
          correctAnswer: 'See explanation',
          explanation: challenge.explanation,
        });
      }
    });
  };

  // Check if all gaps are filled
  const allGapsFilled = gapStates.every((gap) => gap.filledWord !== null);

  useEffect(() => {
    if (allGapsFilled && !showFeedback) {
      validateAnswer();
    }
  }, [allGapsFilled]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const storyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: storyScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  // Parse story text and create inline gaps
  const renderStory = () => {
    const parts = challenge.storyText.split('___');
    const elements: JSX.Element[] = [];

    parts.forEach((part, index) => {
      // Add text part
      if (part) {
        elements.push(
          <Text key={`text-${index}`} style={styles.storyText}>
            {part}
          </Text>
        );
      }

      // Add gap if not last part
      if (index < parts.length - 1) {
        const gap = challenge.gaps[index];
        const gapState = gapStates.find((g) => g.id === gap.id);

        elements.push(
          <View
            key={`gap-${gap.id}`}
            onLayout={(event) => handleGapLayout(gap.id, event)}
          >
            <Gap
              gapId={gap.id}
              filledWord={gapState?.filledWord || null}
              onRemove={() => handleWordRemove(gap.id)}
              showFeedback={showFeedback}
              isCorrect={
                gapState?.filledWord
                  ? [gap.correctWord, ...(gap.alternativeCorrectWords || [])].includes(
                      gapState.filledWord
                    )
                  : null
              }
            />
          </View>
        );
      }
    });

    return elements;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.container, screenAnimatedStyle]}>
        {/* Success background glow */}
        <Animated.View
          style={[styles.successBackground, backgroundAnimatedStyle]}
          pointerEvents="none"
        />

        {/* Main Content */}
        <View style={styles.content}>
          {!showFeedback ? (
            <>
              {/* Learning Companion */}
              <View style={styles.companionContainer}>
                <LearningCompanion
                  state={characterState}
                  combo={session?.currentCombo || 1}
                  size={80}
                />
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                  Drag words to complete the story
                </Text>
              </View>

              {/* Story Container with inline gaps */}
              <Animated.View style={[styles.storyContainer, storyAnimatedStyle]}>
                <View style={styles.storyTextContainer}>{renderStory()}</View>
              </Animated.View>

              {/* Word Bank */}
              <View style={styles.wordBankContainer}>
                <Text style={styles.wordBankLabel}>Word Bank:</Text>
                <View style={styles.wordBank}>
                  {availableWords.map((word, index) => (
                    <DraggableWord
                      key={`${word}-${index}`}
                      word={word}
                      gaps={gapStates}
                      onDrop={handleWordDrop}
                    />
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Feedback State */}
              <View style={styles.feedbackContainer}>
                {/* Character in celebration/disappointment */}
                <View style={styles.feedbackCharacter}>
                  <LearningCompanion
                    state={characterState}
                    combo={session?.currentCombo || 1}
                    size={96}
                  />
                </View>

                {gapStates.every((gap) => {
                  const gapDef = challenge.gaps.find((g) => g.id === gap.id);
                  return (
                    gapDef &&
                    gap.filledWord &&
                    [gapDef.correctWord, ...(gapDef.alternativeCorrectWords || [])].includes(
                      gap.filledWord
                    )
                  );
                }) ? (
                  <>
                    <Text style={[styles.feedbackTitle, { color: '#059669' }]}>
                      Perfect Story!
                    </Text>
                    <Text style={styles.feedbackSubtitle}>
                      You completed it correctly!
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>
                      Almost there!
                    </Text>
                  </>
                )}

                {/* Completed Story */}
                <View style={styles.completedStoryBox}>
                  <Text style={styles.completedStoryLabel}>✓ Complete Story:</Text>
                  <Text style={styles.completedStoryText}>
                    {challenge.storyText.split('___').reduce((acc, part, index) => {
                      if (index === 0) return part;
                      const gap = challenge.gaps[index - 1];
                      return acc + gap.correctWord + part;
                    }, '')}
                  </Text>
                </View>

                {/* Explanation */}
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>💡 Explanation:</Text>
                  <Text style={styles.explanationText}>{challenge.explanation}</Text>
                  {challenge.styleNote && (
                    <Text style={styles.styleNoteText}>📝 {challenge.styleNote}</Text>
                  )}
                </View>

                {/* Continue Button - Only for incorrect answers */}
                {!gapStates.every((gap) => {
                  const gapDef = challenge.gaps.find((g) => g.id === gap.id);
                  return (
                    gapDef &&
                    gap.filledWord &&
                    [gapDef.correctWord, ...(gapDef.alternativeCorrectWords || [])].includes(
                      gap.filledWord
                    )
                  );
                }) && (
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.continueButtonText}>Continue →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Particle Burst on Success */}
        {showParticleBurst && (
          <SkiaParticleBurst
            x={tapPosition.x}
            y={tapPosition.y}
            preset="success"
            onComplete={() => setShowParticleBurst(false)}
          />
        )}

        {/* XP Flying Animation */}
        {showXPAnimation && !showFeedback && (
          <XPFlyingNumber
            value={xpValue}
            startX={tapPosition.x}
            startY={tapPosition.y}
            endX={SCREEN_WIDTH - 80}
            endY={60}
            speedBonus={speedBonus}
            onComplete={() => setShowXPAnimation(false)}
            delay={0}
          />
        )}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

// Gap Component
interface GapProps {
  gapId: string;
  filledWord: string | null;
  onRemove: () => void;
  showFeedback: boolean;
  isCorrect: boolean | null;
}

function Gap({ gapId, filledWord, onRemove, showFeedback, isCorrect }: GapProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getGapStyle = () => {
    if (!filledWord) {
      return styles.gapEmpty;
    }
    if (showFeedback && isCorrect === true) {
      return styles.gapCorrect;
    }
    if (showFeedback && isCorrect === false) {
      return styles.gapIncorrect;
    }
    return styles.gapFilled;
  };

  return (
    <Animated.View style={[styles.gap, getGapStyle(), animatedStyle]}>
      {filledWord ? (
        <TouchableOpacity
          onPress={onRemove}
          disabled={showFeedback}
          activeOpacity={0.7}
        >
          <Text style={styles.gapWord}>{filledWord}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.gapPlaceholder}>___</Text>
      )}
    </Animated.View>
  );
}

// Draggable Word Component
interface DraggableWordProps {
  word: string;
  gaps: GapState[];
  onDrop: (gapId: string, word: string) => void;
}

function DraggableWord({ word, gaps, onDrop }: DraggableWordProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const [isDragging, setIsDragging] = useState(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.1);
      runOnJS(setIsDragging)(true);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: () => {
      scale.value = withSpring(1);
      runOnJS(setIsDragging)(false);

      // Check if dropped on a gap
      // Note: This is simplified - in production, you'd check coordinates
      const firstEmptyGap = gaps.find((g) => g.filledWord === null);
      if (firstEmptyGap) {
        runOnJS(onDrop)(firstEmptyGap.id, word);
      }

      // Reset position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging ? 1000 : 1,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.wordTile, animatedStyle]}>
        <Text style={styles.wordTileText}>{word}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  successBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1FAE5',
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    zIndex: 1,
  },
  companionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGray,
    textAlign: 'center',
  },
  storyContainer: {
    backgroundColor: '#E0F2FE',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  storyTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 32,
  },
  gap: {
    minWidth: 80,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 12,
  },
  gapEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  gapFilled: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  gapCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  gapIncorrect: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  gapWord: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  gapPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
    color: '#94A3B8',
  },
  wordBankContainer: {
    marginTop: 'auto',
  },
  wordBankLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textGray,
    marginBottom: 12,
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  wordTile: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordTileText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  feedbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  feedbackCharacter: {
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textGray,
    marginBottom: 32,
    textAlign: 'center',
  },
  completedStoryBox: {
    backgroundColor: '#E0F2FE',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  completedStoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 12,
  },
  completedStoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 28,
  },
  explanationBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: COLORS.textGray,
    lineHeight: 24,
  },
  styleNoteText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginTop: 12,
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
