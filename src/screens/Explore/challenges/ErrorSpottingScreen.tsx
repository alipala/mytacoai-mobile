import React, { useState } from 'react';
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
  onComplete: (challengeId: string) => void;
  onClose: () => void;
}

export default function ErrorSpottingScreen({
  challenge,
  onComplete,
  onClose,
}: ErrorSpottingScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

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
    onComplete(challenge.id);
  };

  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    const option = challenge.options.find((o) => o.id === selectedOption);
    return option?.isCorrect || false;
  };

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
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>✅</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Nice catch!</Text>
                </>
              ) : (
                <>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>💡</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Let's see...</Text>
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

              {/* Done Button */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </>
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
    marginBottom: 20,
  },
  feedbackEmoji: {
    fontSize: 80,
  },
  feedbackTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 32,
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
