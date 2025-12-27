import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 420; // Optimized: 420px - Compact without banner

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
    overflow: 'hidden', // Enable corner ribbon
    justifyContent: 'space-between', // Push buttons to bottom
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
    marginVertical: 8,
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
    marginBottom: 8,
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
    marginBottom: 0,
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
  // Corner Ribbon Badge for Assessment Status
  assessmentRibbon: {
    position: 'absolute',
    top: 20,
    right: -30,
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 40,
    transform: [{ rotate: '45deg' }],
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  assessmentRibbonFailed: {
    backgroundColor: '#EF4444',
  },
  assessmentRibbonCompleted: {
    backgroundColor: '#10B981',
  },
  assessmentRibbonInProgress: {
    backgroundColor: '#3B82F6',
  },
  assessmentRibbonNew: {
    backgroundColor: '#8B5CF6', // Purple/violet for NEW
  },
  assessmentRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  continueButtonAssessment: {
    backgroundColor: '#F59E0B',
  },
  continueButtonCreatePlan: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
});
