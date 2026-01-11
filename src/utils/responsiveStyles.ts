import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Responsive design utilities for supporting iPhone 11+ (375px - 440px width)
 * ONLY adjusts dimensions - preserves all colors, fonts, and design elements
 */

export const responsive = {
  // Screen size detection
  isSmallPhone: SCREEN_WIDTH < 400,
  isTallPhone: SCREEN_HEIGHT > 800,
  isCompactPhone: SCREEN_HEIGHT < 700,

  // Responsive padding values
  padding: {
    xs: SCREEN_WIDTH < 400 ? 8 : 12,
    sm: SCREEN_WIDTH < 400 ? 12 : 16,
    base: SCREEN_WIDTH < 400 ? 16 : 20,
    lg: SCREEN_WIDTH < 400 ? 20 : 24,
    xl: SCREEN_WIDTH < 400 ? 24 : 32,
    xxl: SCREEN_WIDTH < 400 ? 32 : 40,
    huge: SCREEN_WIDTH < 400 ? 16 : 48,  // For extreme cases like challenge screens
    extreme: SCREEN_WIDTH < 400 ? 12 : 60,  // For AnimatedLanguageLevelSelector
  },

  // Responsive font sizes (scales existing sizes down on small phones)
  fontSize: {
    xs: SCREEN_WIDTH < 400 ? 11 : 12,
    sm: SCREEN_WIDTH < 400 ? 13 : 14,
    base: SCREEN_WIDTH < 400 ? 14 : 16,
    md: SCREEN_WIDTH < 400 ? 15 : 17,
    lg: SCREEN_WIDTH < 400 ? 16 : 18,
    xl: SCREEN_WIDTH < 400 ? 18 : 20,
    xxl: SCREEN_WIDTH < 400 ? 20 : 22,
    xxxl: SCREEN_WIDTH < 400 ? 22 : 24,
    huge: SCREEN_HEIGHT < 700 ? 22 : 28,  // For greetings
    massive: SCREEN_WIDTH < 400 ? 28 : 38,  // For prices
  },

  // Responsive dimensions
  dimensions: {
    logoWidth: Math.min(300, SCREEN_WIDTH * 0.85),
    logoHeight: Math.min(100, (SCREEN_WIDTH * 0.85) * 0.315),
    iconCircle: SCREEN_WIDTH < 400 ? Math.min(100, SCREEN_WIDTH * 0.27) : 120,
    cardHeight: SCREEN_HEIGHT < 700 ? 320 : 350,
    modalMaxHeight: SCREEN_HEIGHT < 700 ? 0.85 : 0.9,
  },

  // Helper function to scale values
  scale: (size: number, factor: number = 0.85): number => {
    return SCREEN_WIDTH < 400 ? Math.round(size * factor) : size;
  },

  // Screen dimensions for reference
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
};

// Export for direct use
export const { isSmallPhone, isCompactPhone, isTallPhone } = responsive;
export const { width: screenWidth, height: screenHeight } = responsive.screen;
