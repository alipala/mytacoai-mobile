import { LanguageGradients, ChallengeGradients } from '../constants/colors';

/**
 * Get gradient colors for a specific language
 * @param language - Language name (e.g., 'french', 'spanish')
 * @returns Array of two colors for gradient
 */
export const getLanguageGradient = (language: string): string[] => {
  const normalizedLanguage = language.toLowerCase().trim();

  const gradientKey = normalizedLanguage as keyof typeof LanguageGradients;

  if (LanguageGradients[gradientKey]) {
    return LanguageGradients[gradientKey].colors;
  }

  // Default fallback to turquoise gradient
  return LanguageGradients.english.colors;
};

/**
 * Get gradient colors for a specific challenge type
 * @param challengeType - Challenge type (e.g., 'error_spotting', 'swipe_fix')
 * @returns Array of two colors for gradient
 */
export const getChallengeGradient = (challengeType: string): string[] => {
  // Convert snake_case to camelCase for lookup
  const camelCase = challengeType.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  const gradientKey = camelCase as keyof typeof ChallengeGradients;

  if (ChallengeGradients[gradientKey]) {
    return ChallengeGradients[gradientKey].colors;
  }

  // Default fallback
  return ChallengeGradients.errorSpotting.colors;
};

/**
 * Create CSS linear gradient string
 * @param colors - Array of colors for gradient
 * @param angle - Gradient angle in degrees (default: 135)
 * @returns CSS linear-gradient string
 */
export const createLinearGradient = (colors: string[], angle: number = 135): string => {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
};

/**
 * Create gradient style for React Native components
 * Used with expo-linear-gradient or similar
 * @param language - Language name
 * @returns Object with colors array for LinearGradient component
 */
export const getLanguageGradientStyle = (language: string) => {
  const colors = getLanguageGradient(language);
  return {
    colors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 1],
  };
};

/**
 * Create semi-transparent gradient overlay
 * @param colors - Base gradient colors
 * @param opacity - Opacity value (0-1)
 * @returns Array of colors with opacity applied
 */
export const createGradientOverlay = (colors: string[], opacity: number = 0.2): string[] => {
  return colors.map(color => {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  });
};

/**
 * Get gradient colors with specified opacity
 * Useful for subtle background overlays on cards
 */
export const getLanguageGradientWithOpacity = (language: string, opacity: number = 0.2) => {
  const colors = getLanguageGradient(language);
  return createGradientOverlay(colors, opacity);
};
