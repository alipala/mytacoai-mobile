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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
  },
  icon: {
    fontSize: 44,
    marginBottom: 10,
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
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF', // White text
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)', // Light white for secondary text
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  infoContainer: {
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: '#6366F1', // Vibrant indigo
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  infoFooterText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    flex: 1,
  },
  highlightsContainer: {
    marginBottom: 16,
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
    width: '31%', // 3 columns: (100% - gaps) / 3
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 85,
  },
  statIcon: {
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.95)', // White for labels on colored background
    marginBottom: 3,
    fontWeight: '600',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF', // White for values
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#14B8A6', // Teal primary button
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    fontSize: 15,
    fontWeight: '700',
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
    marginBottom: 12,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // Subtle indigo background
    borderRadius: 14,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF', // White text
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 13,
    color: '#E0E7FF', // Light indigo/white
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF', // Light gray for section titles
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  comparisonCard: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 90,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  comparisonIcon: {
    fontSize: 22,
    marginBottom: 3,
  },
  comparisonIconComponent: {
    marginBottom: 3,
  },
  comparisonLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.95)', // White for labels on colored background
    marginBottom: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  comparisonValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF', // White for values on colored background
    textAlign: 'center',
  },
  positiveValue: {
    color: '#FFFFFF', // White (background will be green)
  },
  negativeValue: {
    color: '#FFFFFF', // White (background will be red)
  },
  progressStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 6,
  },
  progressStatItemCompact: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 75,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  progressStatLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.95)', // White for labels on colored background
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressStatValueCompact: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF', // White for values
    textAlign: 'center',
  },
  progressStatSubValueCompact: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)', // Light white
    marginTop: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
});
