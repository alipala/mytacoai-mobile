/**
 * Card Motion Animations for Game Lobby
 *
 * Reusable animation patterns for challenge cards
 */

import { withRepeat, withSequence, withTiming, withDelay, Easing } from 'react-native-reanimated';

/**
 * Gentle breathing animation for idle cards
 */
export const createBreathingAnimation = (baseScale = 1.0) => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(baseScale * 1.02, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      withTiming(baseScale, { duration: 2500, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    false
  );
};

/**
 * Pulsing glow for hero/featured cards
 */
export const createPulseGlow = (baseShadow = 12, maxShadow = 20) => {
  'worklet';
  return withRepeat(
    withTiming(maxShadow, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true
  );
};

/**
 * Subtle rotation for icon motion
 */
export const createIconRotation = (maxRotation = 10) => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(maxRotation, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      withTiming(-maxRotation, { duration: 800, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );
};

/**
 * Card flip preview for flashcard
 */
export const createFlipPreview = () => {
  'worklet';
  return withRepeat(
    withSequence(
      withDelay(2000, withTiming(5, { duration: 600, easing: Easing.inOut(Easing.ease) })),
      withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      withDelay(2000, withTiming(0, { duration: 0 }))
    ),
    -1,
    false
  );
};

/**
 * Subtle tilt for primary cards
 */
export const createCardTilt = (maxTilt = 2) => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(maxTilt, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      withTiming(-maxTilt, { duration: 3000, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    false
  );
};

/**
 * Gentle bounce for icons
 */
export const createIconBounce = () => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(-3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 1200, easing: Easing.bounce })
    ),
    -1,
    false
  );
};
