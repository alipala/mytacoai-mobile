import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B1A1F', // Dark theme background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },

  // Logo Section
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },

  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF', // White for dark theme
  },

  appNameAI: {
    color: '#14B8A6', // Teal for dark theme
  },

  // Badges Section (Right)
  badgesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Premium Badge
  premiumBadge: {
    borderRadius: 12,
    overflow: 'visible', // Allow outer glow
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },

  crownEmoji: {
    fontSize: 14,
  },

  premiumTextContainer: {
    flexDirection: 'column',
  },

  premiumLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24', // Gold for premium
    letterSpacing: 0.3,
  },

  premiumMinutes: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FCD34D', // Lighter gold
  },

  // Free Badge
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark background
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    gap: 4,
  },

  freeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray for dark theme
  },

  // Streak Badge
  streakBadge: {
    borderRadius: 12,
    overflow: 'visible', // Allow outer glow
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },

  fireEmoji: {
    fontSize: 16,
  },

  streakTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  streakNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444', // Bright red for streak
    lineHeight: 14,
  },

  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FCA5A5', // Lighter red
    lineHeight: 10,
  },
});
