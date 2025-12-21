/**
 * Enhanced Success Screen
 *
 * Displays an animated celebration screen when user answers correctly
 * Features:
 * - Confetti animation
 * - Flying XP numbers
 * - Combo indicator
 * - Auto-advance countdown
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { XPResult } from '../types/session';
import { getComboMilestone, getXPMessage } from '../services/xpCalculator';

const { width, height } = Dimensions.get('window');

interface EnhancedSuccessScreenProps {
  xpEarned: XPResult;
  combo: number;
  correctMessage?: string;
  explanation?: string;
  autoAdvanceDelay?: number; // milliseconds
  onAdvance: () => void;
}

export default function EnhancedSuccessScreen({
  xpEarned,
  combo,
  correctMessage = 'Correct!',
  explanation,
  autoAdvanceDelay = 2000,
  onAdvance,
}: EnhancedSuccessScreenProps) {
  const [countdown, setCountdown] = useState(autoAdvanceDelay / 1000);
  const confettiRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const xpFlyAnim = useRef(new Animated.Value(0)).current;
  const comboMilestone = getComboMilestone(combo);

  useEffect(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Fire confetti
    confettiRef.current?.start();

    // Animate entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Animate flying XP
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(xpFlyAnim, {
        toValue: -50,
        useNativeDriver: true,
      }),
    ]).start();

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: height / 3 }}
        autoStart={false}
        fadeOut={true}
      />

      {/* Success content */}
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconGradient}
          >
            <Text style={styles.iconEmoji}>🎉</Text>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>{correctMessage}</Text>

        {/* XP Display */}
        <Animated.View
          style={[styles.xpContainer, { transform: [{ translateY: xpFlyAnim }] }]}
        >
          <LinearGradient
            colors={['#FBBF24', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.xpGradient}
          >
            <Text style={styles.xpText}>+{xpEarned.totalXP} XP</Text>
          </LinearGradient>
        </Animated.View>

        {/* XP Breakdown */}
        <Text style={styles.xpBreakdown}>{getXPMessage(xpEarned)}</Text>

        {/* Combo Milestone */}
        {comboMilestone && (
          <View style={styles.comboMilestone}>
            <Text style={styles.comboEmoji}>{comboMilestone.emoji}</Text>
            <Text style={styles.comboMessage}>{comboMilestone.message}</Text>
          </View>
        )}

        {/* Explanation */}
        {explanation && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationLabel}>💡 Why:</Text>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onAdvance}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Next →</Text>
          </TouchableOpacity>

          {/* Auto-advance indicator */}
          <Text style={styles.countdownText}>Auto-advancing in {countdown}s</Text>
        </View>
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
    shadowColor: '#10B981',
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
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 16,
  },
  xpContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  xpGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  xpText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpBreakdown: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  comboMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
  },
  comboEmoji: {
    fontSize: 20,
  },
  comboMessage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  explanationBox: {
    backgroundColor: '#ECFEFF',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0891B2',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
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
  skipButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countdownText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
