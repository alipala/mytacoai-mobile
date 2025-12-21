import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ErrorSpottingChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';

interface ErrorSpottingScreenProps {
  challenge: ErrorSpottingChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function ErrorSpottingScreen({
  challenge,
  onComplete,
  onClose,
}: ErrorSpottingScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset state when challenge changes
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
  }, [challenge.id]);

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Prevent selection after answer

    const option = challenge.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelectedOption(optionId);
    setShowFeedback(true);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      if (option.isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
    }
  };

  const handleDone = () => {
    const isCorrect = isCorrectAnswer();
    const correctOption = challenge.options.find((o) => o.isCorrect);

    onComplete(challenge.id, isCorrect, {
      correctAnswer: correctOption?.text || challenge.correctedSentence,
      explanation: challenge.explanation,
    });
  };

  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    const option = challenge.options.find((o) => o.id === selectedOption);
    return option?.isCorrect || false;
  };

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {!showFeedback ? (
          <>
            {/* Challenge Title */}
            <View style={styles.titleSection}>
              <Text style={styles.emoji}>{challenge.emoji}</Text>
              <Text style={styles.title}>{challenge.title}</Text>
            </View>

            {/* Sentence */}
            <View style={styles.sentenceContainer}>
              <Text style={styles.sentence}>"{challenge.sentence}"</Text>
            </View>

            {/* Question */}
            <Text style={styles.question}>What's wrong here?</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {challenge.options.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selectedOption === option.id && styles.optionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Feedback State */}
            <View style={styles.feedbackContainer}>
              {isCorrectAnswer() ? (
                <>
                  <View style={[styles.feedbackIcon, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.feedbackEmoji}>🎉</Text>
                  </View>
                  <Text style={[styles.feedbackTitle, { color: '#059669' }]}>Excellent!</Text>
                  <Text style={styles.feedbackSubtitle}>You spotted the mistake!</Text>
                </>
              ) : (
                <>
                  <View style={[styles.feedbackIcon, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.feedbackEmoji}>🤔</Text>
                  </View>
                  <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>Almost there!</Text>
                  <Text style={styles.feedbackSubtitle}>Let's learn from this</Text>
                </>
              )}

              {/* Corrected Sentence */}
              <View style={styles.correctedSentenceContainer}>
                <Text style={styles.correctedSentence}>
                  "{challenge.correctedSentence}"
                </Text>
              </View>

              {/* Explanation */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Why:</Text>
                <Text style={styles.explanationText}>{challenge.explanation}</Text>
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
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
  },
  sentenceContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  sentence: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 32,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: COLORS.turquoise,
    backgroundColor: COLORS.turquoiseLight,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  feedbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  feedbackIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  feedbackEmoji: {
    fontSize: 64,
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
  correctedSentenceContainer: {
    backgroundColor: '#E8F7F5',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
  },
  correctedSentence: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.turquoise,
    textAlign: 'center',
    lineHeight: 32,
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
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
