import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 450; // Optimized: 450px - Compact to fit assessment banner

export const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 32, // OPTIMIZED: 32px - More compact
  },
  languageName: {
    fontSize: 18, // OPTIMIZED: 18px - More compact
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  progressRingWrapper: {
    alignItems: 'center',
  },
  progressRingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 26, // OPTIMIZED: 26px - More compact
    fontWeight: 'bold',
    color: '#2D3748',
  },
  completeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 8,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  planDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
    marginTop: 2,
  },
  // Buttons INSIDE card - Premium design
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  detailsButtonText: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '600',
  },
  // NEW: Final Assessment Banner Styles
  assessmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    gap: 8,
  },
  assessmentBannerFailed: {
    backgroundColor: '#FEE2E2',
    borderLeftColor: '#EF4444',
  },
  assessmentBannerIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessmentBannerContent: {
    flex: 1,
  },
  assessmentBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 1,
  },
  assessmentBannerText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
  },
  continueButtonAssessment: {
    backgroundColor: '#F59E0B',
  },
});
