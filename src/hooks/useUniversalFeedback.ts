/**
 * useUniversalFeedback Hook
 *
 * Provides consistent success/failure feedback across all challenges
 * Handles animations, haptics, and timing
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useSharedValue, runOnUI } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  animateSuccess,
  animateFailure,
  HAPTIC_PATTERNS,
} from '../animations/UniversalFeedback';

export interface FeedbackConfig {
  onSuccess?: () => void;
  onFailure?: () => void;
  enableHaptics?: boolean;
  enableSound?: boolean;
}

export function useUniversalFeedback(config: FeedbackConfig = {}) {
  const {
    onSuccess,
    onFailure,
    enableHaptics = true,
    enableSound = false, // Will implement sound later
  } = config;

  // Shared values for animations
  const successScale = useSharedValue(1);
  const successOpacity = useSharedValue(1);
  const failureTranslateX = useSharedValue(0);
  const failureScale = useSharedValue(1);
  const failureOpacity = useSharedValue(1);

  /**
   * Trigger success feedback
   */
  const triggerSuccess = useCallback(() => {
    // Haptic feedback (iOS/Android)
    if (enableHaptics && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Animate
    runOnUI(() => {
      animateSuccess(successScale, successOpacity, onSuccess);
    })();
  }, [enableHaptics, onSuccess]);

  /**
   * Trigger failure feedback
   */
  const triggerFailure = useCallback(() => {
    // Haptic feedback (iOS/Android)
    if (enableHaptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animate
    runOnUI(() => {
      animateFailure(failureTranslateX, failureScale, failureOpacity);
    })();

    // Callback after animation
    if (onFailure) {
      setTimeout(onFailure, 500); // After shake completes
    }
  }, [enableHaptics, onFailure]);

  /**
   * Trigger light haptic (for selections, taps)
   */
  const triggerLightHaptic = useCallback(() => {
    if (enableHaptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [enableHaptics]);

  /**
   * Trigger heavy haptic (for milestones, major events)
   */
  const triggerHeavyHaptic = useCallback(() => {
    if (enableHaptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [enableHaptics]);

  return {
    // Feedback triggers
    triggerSuccess,
    triggerFailure,
    triggerLightHaptic,
    triggerHeavyHaptic,

    // Shared values for animations
    successScale,
    successOpacity,
    failureTranslateX,
    failureScale,
    failureOpacity,
  };
}
