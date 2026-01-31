/**
 * Speaking DNA - Animation Constants
 *
 * Centralized animation configurations for consistent motion design
 * using react-native-reanimated v4
 */

import type { WithTimingConfig, WithSpringConfig } from 'react-native-reanimated';

// DURATION moved to colors.ts to avoid Reanimated initialization issues
// Components can import it from './constants/colors' or './constants'

/**
 * Easing functions for different animation types
 * Using getter pattern to avoid calling Easing at module load time
 * Easing is imported lazily when first accessed
 */
let _Easing: any = null;
const getEasing = () => {
  if (!_Easing) {
    _Easing = require('react-native-reanimated').Easing;
  }
  return _Easing;
};

export const EASINGS = {
  // Standard easings
  get linear() { return getEasing().linear; },
  get easeIn() { return getEasing().in(getEasing().ease); },
  get easeOut() { return getEasing().out(getEasing().ease); },
  get easeInOut() { return getEasing().inOut(getEasing().ease); },

  // Cubic easings (more pronounced)
  get easeInCubic() { return getEasing().in(getEasing().cubic); },
  get easeOutCubic() { return getEasing().out(getEasing().cubic); },
  get easeInOutCubic() { return getEasing().inOut(getEasing().cubic); },

  // Bounce (for playful interactions)
  get bounce() { return getEasing().bounce; },
  get easeOutBounce() { return getEasing().out(getEasing().bounce); },

  // Elastic (for emphasis)
  get elastic() { return getEasing().elastic(1); },
};

/**
 * Pre-configured timing animations
 * Using getter pattern to avoid evaluating at module load time
 */
export const TIMING_CONFIGS = {
  // Quick interactions
  get tap(): WithTimingConfig {
    return {
      duration: DURATION.fast,
      easing: EASINGS.easeOut,
    };
  },

  // Standard transitions
  get fade(): WithTimingConfig {
    return {
      duration: DURATION.normal,
      easing: EASINGS.easeInOut,
    };
  },

  // Smooth movements
  get slide(): WithTimingConfig {
    return {
      duration: DURATION.slow,
      easing: EASINGS.easeOutCubic,
    };
  },

  // Drawn animations (like radar polygon)
  get draw(): WithTimingConfig {
    return {
      duration: DURATION.verySlow,
      easing: EASINGS.easeInOut,
    };
  },

  // Counter animations
  get count(): WithTimingConfig {
    return {
      duration: DURATION.extraSlow,
      easing: EASINGS.easeOutCubic,
    };
  },
};

// SPRING_CONFIGS moved to colors.ts to avoid Reanimated initialization issues
// Components can import it from './constants/colors' or './constants'

/**
 * Entry animation sequences
 * Defines the orchestration of component appearances
 */
export const ENTRY_SEQUENCE = {
  header: {
    type: 'fade' as const,
    duration: DURATION.normal,
    delay: 0,
  },
  radarChart: {
    type: 'scale' as const,
    from: 0.8,
    duration: DURATION.slow + 100,
    delay: 200,
  },
  radarData: {
    type: 'draw' as const,
    duration: DURATION.verySlow,
    delay: 400,
  },
  strandCarousel: {
    type: 'slideIn' as const,
    direction: 'right' as const,
    duration: DURATION.slow - 100,
    delay: 600,
  },
  insights: {
    type: 'fadeUp' as const,
    duration: DURATION.normal,
    delay: 800,
  },
  timeline: {
    type: 'fadeIn' as const,
    stagger: 100,
    delay: 1000,
  },
  breakthroughs: {
    type: 'scale' as const,
    stagger: 150,
    delay: 1200,
  },
};

/**
 * Touch feedback configurations
 * Defines how elements respond to touch
 */
export const TOUCH_FEEDBACK = {
  cardTap: {
    scale: 0.98,
    duration: DURATION.fast,
    haptic: 'light' as const,
  },
  buttonPress: {
    scale: 0.95,
    duration: DURATION.fast + 50,
    haptic: 'medium' as const,
  },
  longPress: {
    scale: 1.02,
    duration: DURATION.fast,
    haptic: 'heavy' as const,
  },
  iconTap: {
    scale: 0.9,
    duration: DURATION.instant + 100,
    haptic: 'light' as const,
  },
};

/**
 * Scroll interpolation configs
 * Defines scroll-linked animation ranges
 */
// SCROLL_RANGES moved to colors.ts to avoid Reanimated initialization issues
// Components can import it from './constants/colors' or './constants'

/**
 * Stagger delays for list animations
 */
export const STAGGER_DELAY = {
  fast: 50,
  normal: 100,
  slow: 150,
  verySlow: 200,
};

/**
 * Layout animation presets
 */
export const LAYOUT_ANIMATIONS = {
  entering: {
    fade: {
      delay: 0,
      duration: DURATION.normal,
    },
    slideUp: {
      delay: 0,
      duration: DURATION.slow,
    },
    scale: {
      delay: 0,
      duration: DURATION.slow,
    },
  },
  exiting: {
    fade: {
      duration: DURATION.fast,
    },
    slideDown: {
      duration: DURATION.normal,
    },
    scale: {
      duration: DURATION.fast,
    },
  },
};

/**
 * Bottom sheet animation config
 */
export const BOTTOM_SHEET_CONFIG = {
  animationDuration: DURATION.slow,
  enablePanDownToClose: false,
  backdropOpacity: 0.5,
  handleHeight: 24,
};

/**
 * Carousel/Pager animation config
 */
export const CAROUSEL_CONFIG = {
  scrollAnimationDuration: DURATION.normal,
  snapAnimationDuration: DURATION.fast + 100,
  parallaxScrollingScale: 0.9,
  parallaxScrollingOffset: 50,
};

/**
 * Number counter animation config
 */
export const COUNTER_CONFIG = {
  duration: DURATION.extraSlow,
  easing: EASINGS.easeOutCubic,
  decimals: 0,
};

/**
 * Progress bar animation config
 */
export const PROGRESS_BAR_CONFIG = {
  duration: DURATION.verySlow,
  delay: DURATION.slow,
  easing: EASINGS.easeOut,
};

/**
 * Pulse animation config (for emphasis)
 */
export const PULSE_CONFIG = {
  duration: DURATION.extraSlow,
  scale: 1.05,
  iterations: -1, // Infinite
};

/**
 * Celebration animation config
 */
export const CELEBRATION_CONFIG = {
  confettiDuration: 3000,
  confettiCount: 100,
  lottieLoop: false,
  soundEnabled: true,
};

export type AnimationType = 'fade' | 'scale' | 'slideIn' | 'slideUp' | 'draw' | 'fadeUp' | 'fadeIn';
export type HapticType = 'light' | 'medium' | 'heavy';
