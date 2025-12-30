/**
 * Universal Feedback Animation System
 *
 * Shared animation configurations, timing, and easing for all challenge types
 * Ensures consistent emotional language across the app
 */

import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const SPRING_CONFIGS = {
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
  medium: {
    damping: 15,
    stiffness: 120,
    mass: 0.8,
  },
  bouncy: {
    damping: 8,
    stiffness: 150,
    mass: 0.5,
  },
  snappy: {
    damping: 12,
    stiffness: 300,
    mass: 0.6,
  },
  celebration: {
    damping: 8,
    stiffness: 150,
    mass: 0.5,
  },
  disappointment: {
    damping: 15,
    stiffness: 200,
    mass: 1.0,
  },
};

// ============================================================================
// TIMING CONFIGURATIONS
// ============================================================================

export const TIMING_CONFIGS = {
  instant: { duration: 100, easing: Easing.out(Easing.quad) },
  fast: { duration: 200, easing: Easing.out(Easing.quad) },
  medium: { duration: 400, easing: Easing.inOut(Easing.quad) },
  slow: { duration: 600, easing: Easing.out(Easing.cubic) },
};

// ============================================================================
// UNIVERSAL ANIMATION SEQUENCES
// ============================================================================

/**
 * Universal Success Animation
 *
 * Timeline:
 * 0.0s: Squash (anticipation)
 * 0.05s: Burst (explosion)
 * 0.35s: Overshoot (peak)
 * 0.6s: Settle (rest)
 */
export const animateSuccess = (
  scaleValue: SharedValue<number>,
  opacityValue: SharedValue<number>,
  onComplete?: () => void
) => {
  'worklet';

  scaleValue.value = withSequence(
    // Squash
    withTiming(0.95, { duration: 50 }),
    // Burst to overshoot
    withSpring(1.4, SPRING_CONFIGS.bouncy),
    // Settle to final size
    withSpring(1.1, SPRING_CONFIGS.gentle),
    // Return to normal
    withTiming(1.0, { duration: 200 }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    })
  );

  opacityValue.value = withSequence(
    withTiming(0, { duration: 50 }),
    withTiming(1, { duration: 150 })
  );
};

/**
 * Universal Failure Animation
 *
 * Timeline:
 * 0.0s: Shake starts
 * 0.3s: Recoil and dim
 * 0.5s: Settle dimmed
 */
export const animateFailure = (
  translateXValue: SharedValue<number>,
  scaleValue: SharedValue<number>,
  opacityValue?: SharedValue<number>
) => {
  'worklet';

  // Shake sequence
  translateXValue.value = withSequence(
    withTiming(-8, { duration: 50 }),
    withTiming(8, { duration: 50 }),
    withTiming(-4, { duration: 50 }),
    withTiming(4, { duration: 50 }),
    withTiming(0, { duration: 100 })
  );

  // Scale and dim
  scaleValue.value = withSequence(
    withTiming(0.9, { duration: 200 }),
    withSpring(0.95, SPRING_CONFIGS.disappointment)
  );

  if (opacityValue) {
    opacityValue.value = withSequence(
      withTiming(0.7, { duration: 200 }),
      withTiming(1.0, { duration: 300 })
    );
  }
};

/**
 * Breathing Animation (Idle State)
 *
 * Continuous subtle scale oscillation for living feel
 */
export const createBreathingAnimation = (baseScale: number = 1.0, intensity: 'subtle' | 'normal' = 'normal') => {
  'worklet';

  // Intensity determines scale factor
  const scaleFactor = intensity === 'subtle' ? 1.03 : 1.06;

  return withRepeat(
    withSequence(
      withTiming(baseScale * scaleFactor, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(baseScale, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      })
    ),
    -1, // Infinite
    false
  );
};

/**
 * Pulse Animation (Attention)
 *
 * Quick scale pulse for notifications or milestones
 */
export const createPulseAnimation = (
  scaleValue: SharedValue<number>,
  targetScale: number = 1.2,
  duration: number = 200
) => {
  'worklet';

  scaleValue.value = withSequence(
    withSpring(targetScale, SPRING_CONFIGS.snappy),
    withSpring(1.0, SPRING_CONFIGS.gentle)
  );
};

/**
 * Combo Badge Pulse
 *
 * Used when combo increases
 */
export const animateComboPulse = (
  scaleValue: SharedValue<number>,
  onComplete?: () => void
) => {
  'worklet';

  scaleValue.value = withSequence(
    withSpring(1.2, { damping: 3, stiffness: 200 }),
    withSpring(1.0, SPRING_CONFIGS.gentle, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    })
  );
};

/**
 * Combo Shatter Animation
 *
 * When combo streak is lost
 */
export const animateComboShatter = (
  scaleValue: SharedValue<number>,
  opacityValue: SharedValue<number>,
  translateYValue: SharedValue<number>,
  onComplete?: () => void
) => {
  'worklet';

  // Shake first
  scaleValue.value = withSequence(
    withTiming(1.1, { duration: 50 }),
    withTiming(0.9, { duration: 50 }),
    // Then break apart
    withTiming(0.5, { duration: 200 })
  );

  // Fall and fade
  opacityValue.value = withTiming(0, { duration: 400 }, (finished) => {
    if (finished && onComplete) {
      runOnJS(onComplete)();
    }
  });

  translateYValue.value = withTiming(50, {
    duration: 400,
    easing: Easing.in(Easing.quad),
  });
};

/**
 * XP Flying Animation
 *
 * Animates XP number from tap point to badge
 */
export const animateXPFlight = (
  translateXValue: SharedValue<number>,
  translateYValue: SharedValue<number>,
  opacityValue: SharedValue<number>,
  scaleValue: SharedValue<number>,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  onComplete?: () => void
) => {
  'worklet';

  // Start position
  translateXValue.value = startX;
  translateYValue.value = startY;
  opacityValue.value = 0;
  scaleValue.value = 1;

  // Appear with pop
  opacityValue.value = withTiming(1, { duration: 100 });
  scaleValue.value = withSequence(
    withTiming(1.5, { duration: 150 }),
    withTiming(1.0, { duration: 100 })
  );

  // Fly to destination
  translateXValue.value = withTiming(endX, {
    duration: 400,
    easing: Easing.out(Easing.cubic),
  });

  translateYValue.value = withTiming(endY, {
    duration: 400,
    easing: Easing.out(Easing.cubic),
  }, (finished) => {
    if (finished) {
      // Disappear
      opacityValue.value = withTiming(0, { duration: 100 });
      if (onComplete) {
        runOnJS(onComplete)();
      }
    }
  });
};

/**
 * Progress Node Light Up
 *
 * When a challenge is completed and node turns green
 */
export const animateNodeComplete = (
  scaleValue: SharedValue<number>,
  opacityValue: SharedValue<number>,
  onComplete?: () => void
) => {
  'worklet';

  scaleValue.value = withSequence(
    withSpring(1.3, { damping: 5, stiffness: 200 }),
    withSpring(1.0, { damping: 10, stiffness: 150 }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    })
  );

  opacityValue.value = withSequence(
    withTiming(0, { duration: 50 }),
    withTiming(1, { duration: 200 })
  );
};

/**
 * Current Node Pulse (Breathing)
 *
 * For the active challenge node
 */
export const createNodePulseAnimation = () => {
  'worklet';

  return withRepeat(
    withSequence(
      withTiming(1.25, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );
};

// ============================================================================
// HAPTIC FEEDBACK HELPERS
// ============================================================================

export const HAPTIC_PATTERNS = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
} as const;

// ============================================================================
// EASING CURVES
// ============================================================================

export const EASINGS = {
  // Emotional
  celebration: Easing.out(Easing.back(1.5)),
  disappointment: Easing.in(Easing.quad),

  // Mechanical
  smooth: Easing.inOut(Easing.quad),
  snappy: Easing.out(Easing.cubic),

  // Organic
  breathing: Easing.inOut(Easing.ease),
  floating: Easing.inOut(Easing.sine),

  // Physics
  bounce: Easing.out(Easing.back(2)),
  elastic: Easing.out(Easing.elastic(1.5)),
};

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const ANIMATION_DURATIONS = {
  instant: 100,
  fast: 200,
  medium: 400,
  slow: 600,
  breathing: 2000,
  celebration: 600,
  failure: 500,
};
