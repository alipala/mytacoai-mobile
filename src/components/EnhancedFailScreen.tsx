/**
 * Enhanced Fail Screen
 *
 * Displays an animated feedback screen when user answers incorrectly
 * Features:
 * - Shake animation
 * - Encouraging message
 * - Show correct answer
 * - Combo reset indicator
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface EnhancedFailScreenProps {
  incorrectMessage?: string;
  correctAnswer: string;
  explanation?: string;
  encouragement?: string;
  onAdvance: () => void;
}

export default function EnhancedFailScreen({
  incorrectMessage = 'Not quite!',
  correctAnswer,
  explanation,
  encouragement = "Don't worry, you'll get the next one!",
  onAdvance,
}: EnhancedFailScreenProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in content
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX: shakeAnim }],
            opacity: fadeInAnim,
          },
        ]}
      >
        {/* Fail Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.iconGradient}
          >
            <Text style={styles.iconEmoji}>💭</Text>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>{incorrectMessage}</Text>

        {/* Encouragement */}
        <Text style={styles.encouragement}>{encouragement}</Text>

        {/* Correct Answer Box */}
        <View style={styles.answerBox}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerHeaderText}>✅ Correct Answer:</Text>
          </View>
          <Text style={styles.answerText}>{correctAnswer}</Text>
        </View>

        {/* Explanation */}
        {explanation && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationLabel}>💡 Why:</Text>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        )}

        {/* Combo Reset Indicator */}
        <View style={styles.comboResetBox}>
          <Text style={styles.comboResetEmoji}>🔄</Text>
          <Text style={styles.comboResetText}>Combo reset to 1x</Text>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={onAdvance}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 12,
  },
  encouragement: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  answerBox: {
    width: '100%',
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  answerHeader: {
    marginBottom: 8,
  },
  answerHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  answerText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 16,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  comboResetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  comboResetEmoji: {
    fontSize: 16,
  },
  comboResetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  nextButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
