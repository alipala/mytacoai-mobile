import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export { width, height };

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
    zIndex: 1000,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    opacity: 0.08, // Reduced opacity for dark theme
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF', // White for dark theme
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  animationContainer: {
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  gradeCard: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gradeLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gradeMessage: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainStatsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  heroStat: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF', // Lighter gray for dark theme
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 4,
  },
  heroStatValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  newRecordPill: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  newRecordText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  secondaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Dark card background
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  miniStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniStatIcon: {
    fontSize: 24,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF', // White for dark theme
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray for dark theme
    textAlign: 'center',
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF', // White for dark theme
    marginBottom: 0, // Removed because parent container has marginBottom
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Dark card background
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 184, 166, 0.15)', // Teal tinted background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF', // White for dark theme
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    color: '#D1D5DB', // Light gray for dark theme
    lineHeight: 18,
  },
  achievementXPBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)', // Gold tinted background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementXP: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  achievementXPLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 2,
  },
  performanceSection: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark card background
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF', // Light gray for dark theme
  },
  progressBarValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF', // White for dark theme
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.3)', // Dark track
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 100,
  },
  answersRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  answerCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  answerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  answerIcon: {
    fontSize: 24,
    fontWeight: '900',
  },
  answerValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF', // White for dark theme
    marginBottom: 4,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray for dark theme
  },
  answerDivider: {
    width: 1,
    backgroundColor: 'rgba(107, 114, 128, 0.3)', // Dark divider
    marginHorizontal: 8,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Dark background
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  timeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray for dark theme
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF', // White for dark theme
  },
  encouragementBox: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  encouragementText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // White for dark theme
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 16,
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  reviewButtonNew: {
    borderRadius: 20,
    overflow: 'visible', // Changed to visible for outer glow
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  reviewButtonTextNew: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  exitButtonNew: {
    borderRadius: 20,
    overflow: 'visible', // Changed to visible for outer glow
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  exitButtonTextNew: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
