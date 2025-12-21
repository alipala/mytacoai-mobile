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
import { MicroQuizChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';

interface MicroQuizScreenProps {
  challenge: MicroQuizChallenge;
  onComplete: (challengeId: string, isCorrect: boolean, details?: any) => void;
  onClose: () => void;
}

export default function MicroQuizScreen({
  challenge,
  onComplete,
  onClose,
}: MicroQuizScreenProps) {
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
      correctAnswer: correctOption?.text || '',
      explanation: challenge.explanation,
    });
  };

  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    const option = challenge.options.find((o) => o.id === selectedOption);
    return option?.isCorrect || false;
  };

  const correctOption = challenge.options.find((o) => o.isCorrect);

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

            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{challenge.question}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {challenge.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selectedOption === option.id && styles.optionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
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
                  <View style={[styles.feedbackIcon, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.feedbackEmoji}>🎯</Text>
                  </View>
                  <Text style={[styles.feedbackTitle, { color: '#2563EB' }]}>Perfect!</Text>
                  <Text style={styles.feedbackSubtitle}>You nailed it!</Text>
                </>
              ) : (
                <>
                  <View style={[styles.feedbackIcon, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.feedbackEmoji}>🤔</Text>
                  </View>
                  <Text style={[styles.feedbackTitle, { color: '#D97706' }]}>Almost there!</Text>
                  <Text style={styles.feedbackSubtitle}>Let's review together</Text>
                </>
              )}

              {/* Correct Answer Display */}
              {!isCorrectAnswer() && correctOption && (
                <View style={styles.correctAnswerBox}>
                  <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
                  <Text style={styles.correctAnswerText}>
                    {correctOption.text}
                  </Text>
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Explanation:</Text>
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
  questionContainer: {
    backgroundColor: '#FFF7ED',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
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
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
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
  correctAnswerBox: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
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
