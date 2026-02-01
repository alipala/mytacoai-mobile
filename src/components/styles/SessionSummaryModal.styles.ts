import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker overlay for dark theme
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#0B1A1F', // Dark theme background
    borderRadius: 24, // More rounded for modern look
    width: '100%',
    maxWidth: 500,
    maxHeight: SCREEN_HEIGHT < 700 ? '80%' : '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modernIconContainer: {
    marginBottom: 16,
  },
  animatedIconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF', // White text
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)', // Light white for secondary text
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressBackground: {
    height: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.3)', // Dark gray background
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  highlightsContainer: {
    marginBottom: 24,
  },
  highlightCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)', // Teal tinted dark background
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  highlightText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#B4E4DD', // Light teal text
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    minWidth: '30%',
    marginBottom: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Light gray for labels
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF', // White for values
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#14B8A6', // Teal primary button
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark secondary button
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    textAlign: 'center',
  },
  // New styles for progress tracking
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)', // Teal divider
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF', // White text
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF', // Light gray for section titles
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  comparisonCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card background
    borderRadius: 16,
    padding: 12,
    minWidth: 100,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  comparisonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#9CA3AF', // Light gray
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  positiveValue: {
    color: '#10B981', // Green for positive (keep same)
  },
  negativeValue: {
    color: '#EF4444', // Red for negative (keep same)
  },
  progressStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 12,
  },
  progressStatItemCompact: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card background
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  progressStatLabel: {
    fontSize: 11,
    color: '#9CA3AF', // Light gray
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressStatValueCompact: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF', // White for values
    textAlign: 'center',
  },
  progressStatSubValueCompact: {
    fontSize: 11,
    color: '#6B8A84', // Muted teal
    marginTop: 2,
    textAlign: 'center',
  },
});
