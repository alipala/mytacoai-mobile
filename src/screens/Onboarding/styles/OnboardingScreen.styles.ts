import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device size detection
const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414; // iPhone 13/14
const isLargeDevice = SCREEN_WIDTH >= 414; // iPhone Pro Max

// Color Palette
export const COLORS = {
  primary: '#4ECFBF',
  primaryDark: '#3a9e92',
  background: '#FFFFFF',
  textDark: '#1F2937',
  textMedium: '#6B7280',
  accent: '#FBBF24',
  overlay: 'rgba(0,0,0,0.5)',
};

// Typography
export const FONTS = {
  headline: { fontWeight: '700' as const, fontSize: isSmallDevice ? 24 : 28 },
  subheadline: { fontWeight: '400' as const, fontSize: isSmallDevice ? 16 : 18 },
  body: { fontWeight: '400' as const, fontSize: isSmallDevice ? 14 : 16 },
  caption: { fontWeight: '400' as const, fontSize: isSmallDevice ? 12 : 14 },
};

// Spacing & Layout
export const SPACING = {
  screenPadding: 24,
  verticalPadding: 40,
  elementSpacing: 16,
  buttonHeight: 56,
  borderRadius: 12,
  cardRadius: 16,
};

// Lottie Animation Size
export const LOTTIE_SIZE = isSmallDevice ? 200 : 250;

// Main Onboarding Container Styles
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.verticalPadding,
    justifyContent: 'space-between',
  },

  // Skip Button
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  skipText: {
    ...FONTS.body,
    color: COLORS.textMedium,
  },

  // Bottom Controls
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Next Button
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  nextButtonText: {
    ...FONTS.body,
    fontWeight: '700',
    color: COLORS.background,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});

// WelcomeSlide Styles - Professional & Clean
export const welcomeStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 100,
    paddingBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: LOTTIE_SIZE * 1.2,
    height: LOTTIE_SIZE * 1.2,
    marginBottom: 40,
  },
  headline: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 36 : 42,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '400',
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
});

// FeaturesSlide Styles - Modern & Immersive
export const featuresStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 80,
    paddingBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 34 : 38,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  animationContainer: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(78, 207, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '400',
    color: COLORS.textMedium,
    lineHeight: 20,
  },
});

// SocialProofSlide Styles - Professional & Clean
export const socialProofStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 80,
    paddingBottom: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
    marginBottom: 32,
  },
  headline: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 34 : 38,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '400',
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 36,
  },
  // Stats Row - Horizontal Layout with Dividers
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(78, 207, 191, 0.05)',
    borderRadius: 16,
    marginBottom: 40,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    marginHorizontal: 8,
  },
  // Buttons Container
  buttonsContainer: {
    width: '100%',
  },
  // Primary CTA Button
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.background,
    letterSpacing: -0.3,
  },
  // Secondary Button (Sign In)
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textMedium,
  },
  secondaryButtonLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export { SCREEN_WIDTH, SCREEN_HEIGHT };
