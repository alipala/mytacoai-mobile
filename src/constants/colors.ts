/**
 * MyTaco AI Brand Colors
 *
 * Official color palette for the MyTaco AI mobile app.
 * Use these colors throughout the app for consistent branding.
 */

export const COLORS = {
  // Primary Brand Colors
  turquoise: '#4ECFBF',     // Main brand color - primary buttons, active states
  yellow: '#FFD63A',        // Accent/highlights
  coral: '#F75A5A',         // Secondary accent
  orange: '#FFA955',        // Tertiary accent

  // UI Colors
  darkNavy: '#0F1B2D',      // Buttons, dark text, primary CTAs
  white: '#FFFFFF',         // Backgrounds, button text
  lightGray: '#F5F5F5',     // Secondary backgrounds
  textDark: '#1F2937',      // Primary text
  textGray: '#6B7280',      // Secondary text, descriptions
  textLight: '#9CA3AF',     // Tertiary text (SKIP, BACK buttons)

  // Functional Colors
  background: '#FFFFFF',    // Main background
  border: '#E5E7EB',        // Borders, dividers

  // Light Background Variants (for illustrations/cards)
  turquoiseLight: '#E8F7F5',  // Light turquoise background
  yellowLight: '#FFFBEB',     // Light yellow background
  coralLight: '#FEF2F2',      // Light coral background
  orangeLight: '#FFF7ED',     // Light orange background
};

/**
 * Language Gradient Definitions
 * Used for learning plan cards to create visual distinction between languages
 */
export const LanguageGradients = {
  french: {
    colors: ['#3B82F6', '#60A5FA'],
    name: 'French Gradient (Blue to Light Blue)',
  },
  german: {
    colors: ['#F75A5A', '#FFA955'],
    name: 'German Gradient (Coral to Orange)',
  },
  portuguese: {
    colors: ['#4ECFBF', '#00D4AA'],
    name: 'Portuguese Gradient (Turquoise to Emerald)',
  },
  english: {
    colors: ['#FF6B9D', '#C239B3'],
    name: 'English Gradient (Pink to Purple)',
  },
  spanish: {
    colors: ['#FFD63A', '#FFA955'],
    name: 'Spanish Gradient (Yellow to Orange)',
  },
  dutch: {
    colors: ['#FFA955', '#FF7B7B'],
    name: 'Dutch Gradient (Orange to Coral)',
  },
  turkish: {
    colors: ['#E74C3C', '#C0392B'],
    name: 'Turkish Gradient (Red to Dark Red)',
  },
};

/**
 * Challenge Card Gradients
 * Vibrant gradients for different challenge types
 */
export const ChallengeGradients = {
  errorSpotting: {
    colors: ['#FFD63A', '#FFA955'],
    name: 'Error Spotting (Yellow)',
  },
  swipeFix: {
    colors: ['#4ECFBF', '#3B9FFF'],
    name: 'Swipe Fix (Teal)',
  },
  microQuiz: {
    colors: ['#F75A5A', '#FF6B9D'],
    name: 'Micro Quiz (Coral to Pink)',
  },
  storyBuilder: {
    colors: ['#9B59B6', '#8E44AD'],
    name: 'Story Builder (Purple)',
  },
  soundsNatural: {
    colors: ['#16A085', '#1ABC9C'],
    name: 'Sounds Natural (Emerald)',
  },
  smartFlashcard: {
    colors: ['#FFA955', '#F39C12'],
    name: 'Smart Flashcard (Orange)',
  },
  tenSecond: {
    colors: ['#E74C3C', '#FF6B6B'],
    name: '10-Second Challenge (Red)',
  },
};

/**
 * Color Usage Guide:
 *
 * - turquoise: Primary buttons (GET STARTED), active pagination dots
 * - darkNavy: Secondary CTAs (LOGIN, CREATE ACCOUNT)
 * - textLight: Text buttons (SKIP, BACK)
 * - yellow/coral/orange: Illustration accents, feature highlights
 * - turquoiseLight/yellowLight/coralLight: Illustration backgrounds
 * - LanguageGradients: Learning plan cards for visual language distinction
 * - ChallengeGradients: Challenge type cards for engaging gameplay UI
 */
