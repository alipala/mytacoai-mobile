/**
 * WelcomeBackCard Dark Theme Styles
 * Beautiful, engaging design for returning users
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  waveContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  lastActiveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B4E4DD',
    opacity: 0.8,
  },

  // Achievement Badge
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderWidth: 1.5,
    marginBottom: 14,
    alignSelf: 'center',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  statCardGradient: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B4E4DD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Motivational Banner
  motivationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
    lineHeight: 20,
  },

  // CTA Text (replaced button)
  ctaTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
    letterSpacing: -0.2,
  },

  // Bottom Hint
  bottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B8A84',
    letterSpacing: 0.2,
  },
});
