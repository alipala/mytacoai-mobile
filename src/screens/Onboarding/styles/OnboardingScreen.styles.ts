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

// WelcomeSlide Styles
export const welcomeStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 120,
    paddingBottom: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headlineContainer: {
    marginBottom: SPACING.elementSpacing,
  },
  headline: {
    ...FONTS.headline,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 32 : 36,
  },
  gradientText: {
    width: '100%',
    height: isSmallDevice ? 80 : 100,
  },
  subheadline: {
    ...FONTS.subheadline,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: SPACING.verticalPadding,
    lineHeight: 24,
  },
  animationContainer: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
    marginVertical: SPACING.verticalPadding,
  },
});

// FeaturesSlide Styles
export const featuresStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 120,
    paddingBottom: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: SPACING.elementSpacing,
  },
  headline: {
    ...FONTS.headline,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: SPACING.verticalPadding,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.verticalPadding,
  },
  card: {
    width: (SCREEN_WIDTH - SPACING.screenPadding * 2 - 16) / 2,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.cardRadius,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    ...FONTS.body,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardText: {
    ...FONTS.caption,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
});

// SocialProofSlide Styles
export const socialProofStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 120,
    paddingBottom: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  stars: {
    fontSize: 24,
    marginBottom: SPACING.elementSpacing,
  },
  headline: {
    ...FONTS.headline,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheadline: {
    ...FONTS.body,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: SPACING.verticalPadding,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.verticalPadding,
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.screenPadding * 2 - 32) / 3,
    backgroundColor: 'rgba(78, 207, 191, 0.1)',
    borderRadius: SPACING.borderRadius,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaButton: {
    width: '100%',
    height: SPACING.buttonHeight,
    borderRadius: SPACING.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaButtonText: {
    ...FONTS.body,
    fontWeight: '700',
    color: COLORS.background,
    fontSize: 18,
  },
  secondaryLink: {
    marginBottom: 24,
  },
  secondaryLinkText: {
    ...FONTS.body,
    color: COLORS.textMedium,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    ...FONTS.caption,
    color: COLORS.textMedium,
    marginHorizontal: 8,
  },
  footerSeparator: {
    color: COLORS.textMedium,
  },
});

export { SCREEN_WIDTH, SCREEN_HEIGHT };
