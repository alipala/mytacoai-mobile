/**
 * Speaking DNA - Extended Color System
 *
 * A comprehensive color palette for the Speaking DNA feature
 * with semantic naming and accessibility considerations.
 */

export const COLORS = {
  // Primary (Teal family) - Main brand color
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Main primary
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // DNA Strand Colors (Semantic) - Each strand has a unique identity color
  strand: {
    rhythm: '#4ECDC4',      // Teal - Natural flow
    confidence: '#9B59B6',  // Purple - Authority and growth
    vocabulary: '#2ECC71',  // Green - Knowledge and learning
    accuracy: '#3498DB',    // Blue - Precision and correctness
    learning: '#E67E22',    // Orange - Energy and enthusiasm
    emotional: '#E91E63',   // Pink - Emotional connection
  },

  // Feedback Colors - User interface feedback
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutrals - Foundation colors for text and backgrounds
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Special purpose colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Background colors for different contexts
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors with semantic meaning
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },
};

/**
 * Gradient definitions for backgrounds and overlays
 */
export const GRADIENTS = {
  // Primary brand gradient
  primary: ['#14B8A6', '#0D9488'],

  // Hero section gradient (subtle, light)
  hero: ['#14B8A6', '#F0FDFA', '#FFFFFF'],

  // Card background gradient
  card: ['#FFFFFF', '#F9FAFB'],

  // Celebration moments
  celebration: ['#FFD700', '#FFA500'],

  // Feedback gradients
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],

  // Category-specific gradients for each DNA strand
  categoryRhythm: ['#4ECDC4', '#45B7B0'],
  categoryConfidence: ['#9B59B6', '#8E44AD'],
  categoryVocabulary: ['#2ECC71', '#27AE60'],
  categoryAccuracy: ['#3498DB', '#2980B9'],
  categoryLearning: ['#E67E22', '#D35400'],
  categoryEmotional: ['#E91E63', '#C2185B'],

  // Overlay gradients for visual depth
  overlayDark: ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0)'],
  overlayLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0)'],
};

/**
 * Shadow presets for consistent elevation
 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Opacity values for consistent transparency
 */
export const OPACITY = {
  disabled: 0.4,
  pressed: 0.7,
  overlay: 0.5,
  subtle: 0.3,
  verySubtle: 0.1,
};

/**
 * Helper function to get strand color with opacity
 */
export const getStrandColorWithOpacity = (
  strand: keyof typeof COLORS.strand,
  opacity: number
): string => {
  const color = COLORS.strand[strand];
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Duration constants (in milliseconds)
 * Moved here from animations.ts to avoid Reanimated initialization issues
 */
export const DURATION = {
  instant: 0,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
  extraSlow: 1200,
};

/**
 * Pre-configured spring animations
 * Moved here from animations.ts to avoid Reanimated initialization issues
 * These are just config objects - no runtime Reanimated code
 */
export const SPRING_CONFIGS = {
  // Gentle bounce
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },

  // Standard bounce
  bouncy: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Strong snap
  snappy: {
    damping: 25,
    stiffness: 200,
    mass: 0.8,
  },

  // Wobbly effect
  wobbly: {
    damping: 10,
    stiffness: 100,
    mass: 1.2,
  },

  // Very stiff (minimal bounce)
  stiff: {
    damping: 30,
    stiffness: 300,
    mass: 0.5,
  },
};

/**
 * Scroll interpolation ranges
 * Moved here from animations.ts to avoid Reanimated initialization issues
 */
export const SCROLL_RANGES = {
  // Header collapse range
  headerCollapse: {
    inputRange: [0, 100],
    heightOutputRange: [100, 60],
  },

  // Title scale during header collapse
  titleScale: {
    inputRange: [0, 100],
    outputRange: [1, 0.8],
  },

  // Background opacity fade
  backgroundFade: {
    inputRange: [0, 100],
    outputRange: [1, 0],
  },

  // Radar chart parallax
  radarParallax: {
    inputRange: [0, 200],
    translateYOutputRange: [0, -30],
    scaleOutputRange: [1, 0.9],
    opacityOutputRange: [1, 0.7],
  },
};

export type StrandKey = keyof typeof COLORS.strand;
export type GradientKey = keyof typeof GRADIENTS;
