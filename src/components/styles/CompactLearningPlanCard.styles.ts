import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // 20px margins on each side

export const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden', // Enable corner ribbon
  },

  // Corner Ribbon Badge (45deg rotation like original)
  assessmentRibbon: {
    position: 'absolute',
    top: 20,
    right: -30,
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

  assessmentRibbonNew: {
    backgroundColor: '#8B5CF6', // Purple for NEW
  },

  assessmentRibbonInProgress: {
    backgroundColor: '#3B82F6', // Blue for IN PROGRESS
  },

  assessmentRibbonCompleted: {
    backgroundColor: '#10B981', // Green for COMPLETED
  },

  assessmentRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Row 1: Language + Level (Horizontal)
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },

  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageInfo: {
    flex: 1,
  },

  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  languageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  levelText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Progress Section - Centered
  progressSection: {
    alignItems: 'center',
    marginVertical: 12,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },

  progressLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 6,
    fontWeight: '500',
  },

  // Row 3: Stats (3 columns)
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 14,
  },

  statColumn: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },

  // Row 4: Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  continueButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 52,
  },

  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 52,
  },

  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  detailsButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
