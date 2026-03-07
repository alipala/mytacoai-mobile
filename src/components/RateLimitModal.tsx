/**
 * Rate Limit Modal Component
 * ===========================
 *
 * Beautiful, user-friendly modal shown when users hit API rate limits.
 * Features countdown timer, category-specific messaging, and calming design.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export interface RateLimitInfo {
  category: string;
  retryAfter: number; // seconds
  limit: number;
  window: number; // seconds
  message?: string;
}

interface RateLimitModalProps {
  visible: boolean;
  info: RateLimitInfo;
  onDismiss: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user-friendly message based on category
 */
const getCategoryMessage = (category: string, retryAfter: number): { title: string; message: string; icon: string; emoji: string } => {
  const minutes = Math.ceil(retryAfter / 60);

  switch (category.toLowerCase()) {
    case 'realtime':
      return {
        title: 'Take a Break',
        message: `You've practiced a lot today! Your voice needs some rest. Come back in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} to continue your learning journey.`,
        icon: 'cafe',
        emoji: '☕',
      };

    case 'gpt4o':
    case 'chat':
      return {
        title: 'Slow Down',
        message: `You're learning so fast! Let's give your brain a moment to process. Try again in ${retryAfter < 60 ? `${retryAfter} seconds` : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}.`,
        icon: 'bulb',
        emoji: '💡',
      };

    case 'challenge':
      return {
        title: 'Pace Yourself',
        message: `You're on fire with challenges! Take a ${minutes}-minute break to stay sharp and focused.`,
        icon: 'flame',
        emoji: '🔥',
      };

    case 'auth':
      return {
        title: 'Security Timeout',
        message: `For your account's safety, please wait ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} before trying again.`,
        icon: 'shield-checkmark',
        emoji: '🔒',
      };

    default:
      return {
        title: 'Please Wait',
        message: `You're making requests too quickly. Please wait ${retryAfter < 60 ? `${retryAfter} seconds` : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`} and try again.`,
        icon: 'time',
        emoji: '⏱️',
      };
  }
};

/**
 * Format time remaining
 */
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (secs === 0) {
    return `${mins}m`;
  }

  return `${mins}m ${secs}s`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RateLimitModal: React.FC<RateLimitModalProps> = ({
  visible,
  info,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState(info.retryAfter);
  const pulseAnimation = useSharedValue(1);

  // Pulse animation for icon
  useEffect(() => {
    if (visible) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  // Countdown timer
  useEffect(() => {
    if (!visible) {
      setCountdown(info.retryAfter);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-dismiss when countdown reaches 0
          setTimeout(() => onDismiss(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, info.retryAfter, onDismiss]);

  const categoryInfo = getCategoryMessage(info.category, info.retryAfter);
  const progress = ((info.retryAfter - countdown) / info.retryAfter) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />

      {/* Blur overlay */}
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>

          {/* Modal card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#0B1A1F', '#0D2832']}
              style={styles.cardGradient}
            >
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Animated icon */}
              <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                <LinearGradient
                  colors={['rgba(20, 184, 166, 0.2)', 'rgba(20, 184, 166, 0.05)']}
                  style={styles.iconGradient}
                >
                  <Ionicons name={categoryInfo.icon as any} size={48} color="#14B8A6" />
                </LinearGradient>
              </Animated.View>

              {/* Title */}
              <Text style={styles.title}>{categoryInfo.title}</Text>

              {/* Message */}
              <Text style={styles.message}>{categoryInfo.message}</Text>

              {/* Countdown */}
              <View style={styles.countdownContainer}>
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownText}>{formatTime(countdown)}</Text>
                </View>
                <Text style={styles.countdownLabel}>Time remaining</Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progress}%` }
                    ]}
                  />
                </View>
              </View>

              {/* Info card */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="information-circle" size={16} color="#9CA3AF" />
                  <Text style={styles.infoText}>
                    Limit: {info.limit} requests per {info.window < 3600 ? `${info.window / 60} minutes` : `${info.window / 3600} hour`}
                  </Text>
                </View>
              </View>

              {/* Got it button */}
              <TouchableOpacity
                style={styles.button}
                onPress={onDismiss}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(20, 184, 166, 0.15)', 'rgba(20, 184, 166, 0.08)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Got it</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    borderRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderWidth: 3,
    borderColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#14B8A6',
  },
  countdownLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 3,
  },
  infoCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    flex: 1,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#14B8A6',
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#14B8A6',
  },
});

export default RateLimitModal;
