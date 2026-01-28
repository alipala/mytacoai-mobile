/**
 * Speaking DNA - Constants Index
 *
 * Central export point for all constants
 *
 * IMPORTANT: All safe constants are in colors.ts and icons.ts
 * This includes: COLORS, GRADIENTS, SHADOWS, OPACITY, SCROLL_RANGES,
 * DURATION, SPRING_CONFIGS
 *
 * animations.ts is NOT exported here to avoid loading Reanimated at app startup.
 * Components that need EASINGS or TIMING_CONFIGS should import from './constants/animations' directly.
 */

// Re-export all from colors (safe - no Reanimated runtime dependencies)
// Includes: COLORS, GRADIENTS, SHADOWS, OPACITY, SCROLL_RANGES, DURATION, SPRING_CONFIGS
export * from './colors';

// Re-export all from icons (safe - no Reanimated dependency)
export * from './icons';

// DO NOT export from animations.ts here - it will load Reanimated at startup
// Components that need animations should import directly from './constants/animations'
