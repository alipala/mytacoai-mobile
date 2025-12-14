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
import { NativeCheckChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';

interface NativeCheckScreenProps {
  challenge: NativeCheckChallenge;
  onComplete: (challengeId: string) => void;
  onClose: () => void;
}

export default function NativeCheckScreen({
  challenge,
  onComplete,
  onClose,
}: NativeCheckScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (answer: boolean) => {
    if (showFeedback) return; // Prevent selection after answer

    setSelectedAnswer(answer);
    setShowFeedback(true);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      if (answer === challenge.isNatural) {
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
    return selectedAnswer === challenge.isNatural;
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
            <Text style={styles.question}>
              Would a native speaker say this?
            </Text>

            {/* Answer Buttons */}
            <View style={styles.answerContainer}>
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  styles.yesButton,
                  selectedAnswer === true && styles.answerSelected,
                ]}
                onPress={() => handleAnswer(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.answerEmoji}>✓</Text>
                <Text style={styles.answerText}>Yes, sounds natural</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.answerButton,
                  styles.noButton,
                  selectedAnswer === false && styles.answerSelected,
                ]}
                onPress={() => handleAnswer(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.answerEmoji}>✗</Text>
                <Text style={styles.answerText}>No, sounds odd</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Feedback State */}
            <View style={styles.feedbackContainer}>
              {isCorrectAnswer() ? (
                <>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>🎯</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Spot on!</Text>
                </>
              ) : (
                <>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackEmoji}>💡</Text>
                  </View>
                  <Text style={styles.feedbackTitle}>Let's see...</Text>
                </>
              )}

              {/* Original Sentence */}
              <View style={styles.sentenceFeedbackBox}>
                <Text style={styles.sentenceFeedbackLabel}>
                  {challenge.isNatural ? '✓ Natural' : '✗ Unnatural'}
                </Text>
                <Text style={styles.sentenceFeedbackText}>
                  "{challenge.sentence}"
                </Text>
              </View>

              {/* Corrected Version (if not natural) */}
              {!challenge.isNatural && challenge.correctedVersion && (
                <View style={styles.correctedBox}>
                  <Text style={styles.correctedLabel}>✓ Better:</Text>
                  <Text style={styles.correctedText}>
                    "{challenge.correctedVersion}"
                  </Text>
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>💡 Why:</Text>
                <Text style={styles.explanationText}>
                  {challenge.explanation}
                </Text>
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
    backgroundColor: '#FFFBEB',
    padding: 28,
    borderRadius: 20,
    marginBottom: 28,
  },
  sentence: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 34,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 28,
    textAlign: 'center',
  },
  answerContainer: {
    gap: 16,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 3,
    gap: 12,
  },
  yesButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  noButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  answerSelected: {
    borderWidth: 3,
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  answerEmoji: {
    fontSize: 28,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
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
  sentenceFeedbackBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
  },
  sentenceFeedbackLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textGray,
    marginBottom: 8,
  },
  sentenceFeedbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  correctedBox: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  correctedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  correctedText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
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
