import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    color: '#1F2937',
  },

  appNameAI: {
    color: '#4FD1C5',
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
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
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
    color: '#92400E',
    letterSpacing: 0.3,
  },

  premiumMinutes: {
    fontSize: 9,
    fontWeight: '600',
    color: '#B45309',
  },

  // Free Badge
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },

  freeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Streak Badge
  streakBadge: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
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
    color: '#92400E',
    lineHeight: 14,
  },

  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#B45309',
    lineHeight: 10,
  },
});
