/**
 * useComboSystem Hook
 *
 * Manages combo state, animations, and milestones
 * Integrates with session context for combo tracking
 */

import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useSharedValue, runOnUI } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  getComboLevel,
  isComboMilestone,
  getComboMilestoneMessage,
  COMBO_LOST_CONFIG,
} from '../animations/ComboSystem';
import {
  animateComboPulse,
  animateComboShatter,
} from '../animations/UniversalFeedback';
import { useChallengeSession } from '../contexts/ChallengeSessionContext';

export interface ComboSystemConfig {
  onMilestone?: (combo: number, message: string) => void;
  onComboLost?: () => void;
  enableHaptics?: boolean;
}

export function useComboSystem(config: ComboSystemConfig = {}) {
  const { onMilestone, onComboLost, enableHaptics = true } = config;
  const { session } = useChallengeSession();

  // Shared values for animations
  const comboScale = useSharedValue(1);
  const comboOpacity = useSharedValue(1);
  const comboTranslateY = useSharedValue(0);

  // Current combo level
  const currentCombo = session?.currentCombo || 1;
  const previousCombo = useSharedValue(currentCombo);

  // Get combo configuration
  const comboConfig = getComboLevel(currentCombo);

  /**
   * Handle combo increase
   */
  useEffect(() => {
    if (currentCombo > previousCombo.value && currentCombo > 1) {
      // Combo increased - pulse animation
      runOnUI(() => {
        animateComboPulse(comboScale);
      })();

      // Check for milestone
      if (isComboMilestone(currentCombo)) {
        const message = getComboMilestoneMessage(currentCombo);
        if (message && onMilestone) {
          onMilestone(currentCombo, message);
        }

        // Milestone haptic
        if (enableHaptics && Platform.OS !== 'web') {
          const pattern = comboConfig.milestone?.hapticPattern;
          switch (pattern) {
            case 'heavy':
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              break;
            case 'sequence':
              // Special sequence for legendary (10x)
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }, 100);
              break;
            default:
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      } else {
        // Regular combo increase haptic
        if (enableHaptics && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }

    // Check for combo loss
    if (currentCombo === 1 && previousCombo.value > 1) {
      // Combo was lost - shatter animation
      runOnUI(() => {
        animateComboShatter(
          comboScale,
          comboOpacity,
          comboTranslateY,
          onComboLost
        );
      })();

      // Combo lost haptic
      if (enableHaptics && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }

    previousCombo.value = currentCombo;
  }, [currentCombo, onMilestone, onComboLost, enableHaptics]);

  /**
   * Get display text for combo badge
   */
  const getComboDisplayText = useCallback(() => {
    return comboConfig.badgeText;
  }, [comboConfig]);

  /**
   * Check if badge should be visible
   */
  const shouldShowBadge = useCallback(() => {
    return comboConfig.displayBadge;
  }, [comboConfig]);

  /**
   * Get character scale for current combo
   */
  const getCharacterScale = useCallback(() => {
    return comboConfig.characterScale;
  }, [comboConfig]);

  /**
   * Get background tint for current combo
   */
  const getBackgroundTint = useCallback(() => {
    return comboConfig.backgroundTint;
  }, [comboConfig]);

  return {
    // Current combo state
    currentCombo,
    comboConfig,

    // Display helpers
    getComboDisplayText,
    shouldShowBadge,
    getCharacterScale,
    getBackgroundTint,

    // Animation shared values
    comboScale,
    comboOpacity,
    comboTranslateY,

    // Milestone check
    isMilestone: isComboMilestone(currentCombo),
    milestoneMessage: getComboMilestoneMessage(currentCombo),
  };
}
