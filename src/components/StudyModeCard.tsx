/**
 * Study Mode Card
 *
 * Generic component for displaying challenges in study mode.
 * Shows the correct answer, explanation, and a "Got it!" button.
 * No hearts consumed, purely educational.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Challenge } from '../services/mockChallengeData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StudyModeCardProps {
  challenge: Challenge;
  currentIndex: number;
  totalChallenges: number;
  onNext: () => void;
}

export function StudyModeCard({
  challenge,
  currentIndex,
  totalChallenges,
  onNext,
}: StudyModeCardProps) {
  // Extract correct answer based on challenge type
  const getCorrectAnswer = () => {
    switch (challenge.type) {
      case 'error_spotting':
        return (challenge as any).correctedSentence || 'N/A';
      case 'micro_quiz':
      case 'brain_tickler':
        const correctOption = (challenge as any).options?.find((o: any) => o.isCorrect);
        return correctOption?.text || 'N/A';
      case 'native_check':
        return (challenge as any).isNatural ? 'Natural ✓' : 'Sounds Odd ✗';
      case 'smart_flashcard':
        return (challenge as any).definition || 'N/A';
      case 'story_builder':
        return 'See completed story above';
      default:
        return 'N/A';
    }
  };

  // Get challenge question/content
  const getQuestionContent = () => {
    switch (challenge.type) {
      case 'error_spotting':
        return (challenge as any).sentence;
      case 'micro_quiz':
      case 'brain_tickler':
        return (challenge as any).question;
      case 'native_check':
        return (challenge as any).sentence;
      case 'smart_flashcard':
        return (challenge as any).targetWord || (challenge as any).word;
      case 'story_builder':
        return (challenge as any).storyText || 'Story';
      default:
        return challenge.description || 'Challenge';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.studyBadge}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.studyBadgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="book-outline" size={20} color="#FFF" />
            <Text style={styles.studyBadgeText}>STUDY MODE</Text>
          </LinearGradient>
        </View>

        <Text style={styles.progress}>
          {currentIndex + 1} / {totalChallenges}
        </Text>
      </View>

      {/* Challenge Card */}
      <View style={styles.card}>
        <View style={styles.cardGradient}>
          {/* Challenge Type */}
          <View style={styles.typeContainer}>
            <Text style={styles.typeEmoji}>{challenge.emoji || '📚'}</Text>
            <Text style={styles.typeText}>{challenge.title || challenge.type}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Question:</Text>
            <Text style={styles.questionText}>{getQuestionContent()}</Text>
          </View>

          {/* Correct Answer */}
          <View style={styles.answerContainer}>
            <View style={styles.answerHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.answerLabel}>Correct Answer</Text>
            </View>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{getCorrectAnswer()}</Text>
            </View>
          </View>

          {/* Explanation */}
          <View style={styles.explanationContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Ionicons name="bulb-outline" size={18} color="#FBBF24" />
              <Text style={styles.explanationLabel}>Explanation:</Text>
            </View>
            <Text style={styles.explanationText}>
              {(challenge as any).explanation || 'No explanation available'}
            </Text>
          </View>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={onNext}
        activeOpacity={0.8}
      >
        {/* Outer glow layer */}
        <View style={{
          position: 'absolute',
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderRadius: 20,
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          opacity: 0.6,
        }} />
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex + 1 === totalChallenges ? 'Finish Review' : 'Got it!'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={18} color="#9CA3AF" />
        <Text style={styles.footerText}>
          No hearts consumed in Study Mode
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  studyBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  studyBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  studyBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB', // Light gray for dark theme
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGradient: {
    padding: 24,
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // Dark card background
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  typeEmoji: {
    fontSize: 28,
  },
  typeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White for dark theme
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray for dark theme
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E5E7EB', // Light text for dark theme
    lineHeight: 28,
  },
  answerContainer: {
    marginBottom: 24,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  answerBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Green tinted dark background
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  answerText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#10B981', // Keep green but brighter for dark theme
    lineHeight: 26,
  },
  explanationContainer: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Dark background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  explanationLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D1D5DB', // Light gray for dark theme
    marginBottom: 0, // Removed since we moved it to parent container
  },
  explanationText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF', // Medium gray for dark theme
    lineHeight: 24,
  },
  nextButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'visible', // Allow outer glow
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF', // Light gray for dark theme
  },
});
