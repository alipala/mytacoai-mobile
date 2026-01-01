/**
 * Story Builder Screen - PROFESSIONAL GAME DESIGN
 *
 * Premium drag & drop challenge with perfect UX
 * Features:
 * - Dynamic gap sizing based on word length
 * - Both drag AND tap interactions
 * - Fixed CHECK button (always visible)
 * - Perfect text flow and alignment
 * - Professional gaming experience
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryGap {
  id: string;
  correctWord: string;
  alternativeCorrectWords?: string[];
}

interface StoryBuilderChallenge {
  id: string;
  storyText: string;
  gaps: StoryGap[];
  wordBank: string[];
  explanation: string;
  styleNote?: string;
}

interface StoryBuilderScreenProps {
  challenge: StoryBuilderChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
  onWrongAnswerSelected?: () => void;
}

interface GapState {
  id: string;
  filledWord: string | null;
}

export default function StoryBuilderScreen({
  challenge,
  onComplete,
  onClose,
  onWrongAnswerSelected,
}: StoryBuilderScreenProps) {
  const [gapStates, setGapStates] = useState<GapState[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([...challenge.wordBank]);
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: SCREEN_WIDTH / 2, y: 300 });
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const [xpValue, setXPValue] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [startTime] = useState(Date.now());

  const { session } = useChallengeSession();
  const { characterState, reactToAnswer } = useCharacterState();
  const { play } = useAudio();

  // Animation values
  const storyScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);
  const checkButtonScale = useSharedValue(1);

  // Reset state when challenge changes
  useEffect(() => {
    screenOpacity.value = 0;
    screenOpacity.value = withTiming(1, { duration: 300 });

    setGapStates(
      challenge.gaps.map((gap) => ({
        id: gap.id,
        filledWord: null,
      }))
    );
    setAvailableWords([...challenge.wordBank]);
    setShowFeedback(false);
    setShowXPAnimation(false);
    setShowParticleBurst(false);
    setSelectedGapId(null);
    backgroundOpacity.value = 0;
  }, [challenge.id]);

  const handleGapPress = (gapId: string) => {
    if (showFeedback) return;
    setSelectedGapId(gapId);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleWordPress = (word: string) => {
    if (showFeedback) return;

    let targetGapId = selectedGapId;
    if (!targetGapId) {
      const firstEmptyGap = gapStates.find((g) => g.filledWord === null);
      if (firstEmptyGap) {
        targetGapId = firstEmptyGap.id;
      }
    }

    if (!targetGapId) return;

    setAvailableWords((prev) => prev.filter((w) => w !== word));
    setGapStates((prev) =>
      prev.map((gap) =>
        gap.id === targetGapId ? { ...gap, filledWord: word } : gap
      )
    );
    setSelectedGapId(null);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    play('snap');
  };

  const handleWordRemove = (gapId: string) => {
    if (showFeedback) return;

    const gap = gapStates.find((g) => g.id === gapId);
    if (!gap || !gap.filledWord) return;

    setAvailableWords((prev) => [...prev, gap.filledWord as string]);
    setGapStates((prev) =>
      prev.map((g) => (g.id === gapId ? { ...g, filledWord: null } : g))
    );

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    play('snap');
  };

  const handleCheckAnswer = () => {
    const allFilled = gapStates.every((gap) => gap.filledWord !== null);
    if (!allFilled) return;

    checkButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );

    let isCorrect = true;
    const incorrectGapIds: string[] = [];

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

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const combo = session?.currentCombo || 1;
    const xpResult = calculateXP(true, timeSpent, combo);

    setXPValue(xpResult.baseXP);
    setSpeedBonus(xpResult.speedBonus);
    setShowParticleBurst(true);

    setTimeout(() => {
      setShowXPAnimation(true);
    }, 150);

    backgroundOpacity.value = withSequence(
      withTiming(0.3, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );

    play('correct_answer');

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

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
    storyScale.value = withSequence(
      withTiming(1.02, { duration: 50 }),
      withTiming(0.98, { duration: 50 }),
      withTiming(1.02, { duration: 50 }),
      withTiming(1, { duration: 50 })
    );

    if (onWrongAnswerSelected) {
      onWrongAnswerSelected();
    }

    play('wrong_answer');

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

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

  const allGapsFilled = gapStates.every((gap) => gap.filledWord !== null);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const storyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: storyScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const checkButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkButtonScale.value }],
  }));

  // Calculate dynamic gap width based on word length
  const getGapWidth = (gapId: string) => {
    const gap = gapStates.find((g) => g.id === gapId);
    if (gap?.filledWord) {
      // Base width on actual word length
      return Math.max(60, gap.filledWord.length * 12 + 24);
    }

    // Find the correct word to size the gap appropriately
    const gapDef = challenge.gaps.find((g) => g.id === gapId);
    if (gapDef) {
      return Math.max(60, gapDef.correctWord.length * 12 + 24);
    }

    return 80;
  };

  // Parse story text and create inline gaps
  const renderStory = () => {
    const parts = challenge.storyText.split('___');
    const elements: JSX.Element[] = [];

    parts.forEach((part, index) => {
      if (part) {
        elements.push(
          <Text key={`text-${index}`} style={styles.storyText}>
            {part}
          </Text>
        );
      }

      if (index < parts.length - 1) {
        const gap = challenge.gaps[index];
        const gapState = gapStates.find((g) => g.id === gap.id);
        const gapWidth = getGapWidth(gap.id);

        elements.push(
          <TouchableOpacity
            key={`gap-${gap.id}`}
            onPress={() => handleGapPress(gap.id)}
            disabled={showFeedback}
            activeOpacity={0.7}
          >
            <DraggableGap
              gapId={gap.id}
              filledWord={gapState?.filledWord || null}
              onWordDrop={handleWordPress}
              onRemove={() => handleWordRemove(gap.id)}
              showFeedback={showFeedback}
              isSelected={selectedGapId === gap.id}
              width={gapWidth}
              isCorrect={
                gapState?.filledWord
                  ? [gap.correctWord, ...(gap.alternativeCorrectWords || [])].includes(
                      gapState.filledWord
                    )
                  : null
              }
            />
          </TouchableOpacity>
        );
      }
    });

    return elements;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.container, screenAnimatedStyle]}>
        <Animated.View
          style={[styles.successBackground, backgroundAnimatedStyle]}
          pointerEvents="none"
        />

        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!showFeedback ? (
              <>
                <Text style={styles.instructionsText}>
                  Fill in the blanks
                </Text>

                <Animated.View style={[styles.storyContainer, storyAnimatedStyle]}>
                  <View style={styles.storyTextContainer}>{renderStory()}</View>
                </Animated.View>

                <View style={styles.wordBankSection}>
                  <View style={styles.wordBank}>
                    {availableWords.map((word, index) => (
                      <DraggableWord
                        key={`${word}-${index}`}
                        word={word}
                        index={index}
                        onPress={handleWordPress}
                        onDragEnd={handleWordPress}
                        disabled={showFeedback}
                      />
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.feedbackContainer}>
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
                      Perfect!
                    </Text>
                    <Text style={styles.feedbackSubtitle}>
                      You completed it correctly
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.feedbackTitle, { color: '#DC2626' }]}>
                      Not quite
                    </Text>
                    <Text style={styles.feedbackSubtitle}>
                      Check the correct answer
                    </Text>
                  </>
                )}

                <View style={styles.completedStoryBox}>
                  <Text style={styles.completedStoryLabel}>CORRECT ANSWER</Text>
                  <Text style={styles.completedStoryText}>
                    {challenge.storyText.split('___').reduce((acc, part, index) => {
                      if (index === 0) return part;
                      const gap = challenge.gaps[index - 1];
                      return acc + gap.correctWord + part;
                    }, '')}
                  </Text>
                </View>

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>💡 EXPLANATION</Text>
                  <Text style={styles.explanationText}>{challenge.explanation}</Text>
                </View>

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
                    <Text style={styles.continueButtonText}>CONTINUE</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {/* Fixed CHECK Button at bottom */}
          {!showFeedback && (
            <Animated.View style={[styles.checkButtonContainer, checkButtonAnimatedStyle]}>
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  !allGapsFilled && styles.checkButtonDisabled
                ]}
                onPress={handleCheckAnswer}
                disabled={!allGapsFilled}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.checkButtonText,
                  !allGapsFilled && styles.checkButtonTextDisabled
                ]}>
                  CHECK
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {showParticleBurst && (
          <SkiaParticleBurst
            x={tapPosition.x}
            y={tapPosition.y}
            preset="success"
            onComplete={() => setShowParticleBurst(false)}
          />
        )}

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

// Draggable Gap Component with drag + tap
interface DraggableGapProps {
  gapId: string;
  filledWord: string | null;
  onWordDrop: (word: string) => void;
  onRemove: () => void;
  showFeedback: boolean;
  isSelected: boolean;
  width: number;
  isCorrect: boolean | null;
}

function DraggableGap({
  gapId,
  filledWord,
  onRemove,
  showFeedback,
  isSelected,
  width,
  isCorrect,
}: DraggableGapProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (showFeedback || !filledWord) return;
    scale.value = withSequence(withSpring(0.9), withSpring(1));
    onRemove();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let gapStyle = [styles.gap, { width }];

  if (showFeedback) {
    if (isCorrect) {
      gapStyle.push(styles.gapCorrect);
    } else {
      gapStyle.push(styles.gapIncorrect);
    }
  } else if (filledWord) {
    gapStyle.push(styles.gapFilled);
  } else {
    gapStyle.push(styles.gapEmpty);
    if (isSelected) {
      gapStyle.push(styles.gapSelected);
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={showFeedback}
    >
      <Animated.View style={[gapStyle, animatedStyle]}>
        {filledWord ? (
          <Text style={styles.gapWord} numberOfLines={1}>{filledWord}</Text>
        ) : (
          <View style={styles.gapPlaceholderLine} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Draggable Word Component with drag + tap
interface DraggableWordProps {
  word: string;
  index: number;
  onPress: (word: string) => void;
  onDragEnd: (word: string) => void;
  disabled: boolean;
}

// Purple color for word tiles (matching Story Builder hero card)
const WORD_COLOR = {
  bg: '#8B5CF6',
  border: '#7C3AED',
  shadow: '#6D28D9'
};

function DraggableWord({ word, index, onPress, onDragEnd, disabled }: DraggableWordProps) {
  const colors = WORD_COLOR;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const [isDragging, setIsDragging] = useState(false);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (disabled) return;
      scale.value = withSpring(1.1);
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((event) => {
      if (disabled) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (disabled) return;
      scale.value = withSpring(1);
      runOnJS(setIsDragging)(false);

      // Check if dragged significantly
      if (Math.abs(translateY.value) > 50) {
        runOnJS(onDragEnd)(word);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging ? 1000 : 1,
  }));

  const handlePress = () => {
    if (disabled) return;
    onPress(word);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.wordTile,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
            isDragging && styles.wordTileDragging
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={styles.wordTileText}>{word}</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  successBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1FAE5',
    zIndex: 0,
  },
  mainContent: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  instructionsText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  storyContainer: {
    backgroundColor: '#F5F3FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#A78BFA',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  storyTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  storyText: {
    fontSize: 19,
    fontWeight: '400',
    color: '#1F2937',
    lineHeight: 38,
  },
  gap: {
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  gapEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderBottomWidth: 3,
    borderBottomColor: '#D1D5DB',
    borderRadius: 0,
  },
  gapPlaceholderLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'transparent',
  },
  gapSelected: {
    borderBottomColor: '#3B82F6',
    borderBottomWidth: 4,
    backgroundColor: '#EFF6FF',
  },
  gapFilled: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
  },
  gapCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
  },
  gapIncorrect: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  gapWord: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1F2937',
  },
  wordBankSection: {
    marginBottom: 16,
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  wordTile: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  wordTileDragging: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  wordTileText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  checkButton: {
    backgroundColor: '#10B981',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  checkButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  checkButtonTextDisabled: {
    color: '#9CA3AF',
  },
  feedbackContainer: {
    paddingTop: 20,
  },
  feedbackCharacter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  completedStoryBox: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  completedStoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 12,
    letterSpacing: 1,
  },
  completedStoryText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1F2937',
    lineHeight: 28,
  },
  explanationBox: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 12,
    letterSpacing: 1,
  },
  explanationText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
