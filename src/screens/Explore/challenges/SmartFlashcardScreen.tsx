import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SmartFlashcardChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';

interface SmartFlashcardScreenProps {
  challenge: SmartFlashcardChallenge;
  onComplete: (challengeId: string) => void;
  onClose: () => void;
}

export default function SmartFlashcardScreen({
  challenge,
  onComplete,
  onClose,
}: SmartFlashcardScreenProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;

    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);

    // Soft haptic feedback on flip
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  };

  const handleDone = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onComplete(challenge.id);
  };

  // Interpolate rotation
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>{challenge.emoji}</Text>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.context}>{challenge.context}</Text>
        </View>

        {/* Flip Hint */}
        <View style={styles.flipHint}>
          <Text style={styles.flipHintText}>
            👆 Tap card to {isFlipped ? 'flip back' : 'reveal'}
          </Text>
        </View>

        {/* Flashcard */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFlip}
          style={styles.cardContainer}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                transform: [{ rotateY: frontRotateY }],
                opacity: frontOpacity,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.wordLabel}>Word / Phrase:</Text>
              <Text style={styles.word}>{challenge.word}</Text>
            </View>
          </Animated.View>

          {/* Back of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                transform: [{ rotateY: backRotateY }],
                opacity: backOpacity,
              },
            ]}
          >
            <View style={styles.cardContent}>
              {/* Explanation */}
              <View style={styles.explanationSection}>
                <Text style={styles.explanationLabel}>💡 Meaning:</Text>
                <Text style={styles.explanationText}>
                  {challenge.explanation}
                </Text>
              </View>

              {/* Example Sentence */}
              <View style={styles.exampleSection}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.exampleText}>
                  "{challenge.exampleSentence}"
                </Text>
              </View>

              {/* Highlight the word in example */}
              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>
                  The key phrase is highlighted in context above
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Done Button (only show after flip) */}
        {isFlipped && (
          <Animated.View style={[styles.doneButtonContainer, { opacity: backOpacity }]}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  context: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333EA',
    textAlign: 'center',
  },
  flipHint: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flipHintText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    minHeight: 300,
    justifyContent: 'center',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backfaceVisibility: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  wordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
    color: '#9333EA',
    textAlign: 'center',
  },
  explanationSection: {
    marginBottom: 24,
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 18,
    color: COLORS.textGray,
    lineHeight: 28,
  },
  exampleSection: {
    backgroundColor: '#F3E8FF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  highlightBox: {
    paddingTop: 12,
  },
  highlightText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  doneButtonContainer: {
    marginTop: 20,
  },
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
