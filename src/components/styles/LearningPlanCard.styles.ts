import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 400; // OPTIMIZED: 400px (was 480px)

export const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT, // OPTIMIZED: 400px
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18, // OPTIMIZED: 18px (was 20px)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18, // OPTIMIZED: 18px (was 24px)
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 36, // OPTIMIZED: 36px (was 40px)
  },
  languageName: {
    fontSize: 20, // OPTIMIZED: 20px (was 22px)
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
    marginVertical: 16, // OPTIMIZED: 16px (was 24px)
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
    fontSize: 28, // OPTIMIZED: 28px (was 32px)
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
    fontSize: 13, // OPTIMIZED: 13px (was 14px)
    color: '#718096',
    marginTop: 10, // OPTIMIZED: 10px (was 12px)
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12, // OPTIMIZED: 12px (was 16px)
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 12, // OPTIMIZED: 12px (was 16px)
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
    fontSize: 12, // OPTIMIZED: 12px (was 13px)
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 14, // OPTIMIZED: 14px (was 20px)
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4, // Minimal bottom margin
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FD1C5',
    borderRadius: 10,
    paddingVertical: 12, // OPTIMIZED: 12px (was 14px)
    gap: 6,
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14, // OPTIMIZED: 14px (was 15px)
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 12, // OPTIMIZED: 12px (was 14px)
    gap: 6,
  },
  detailsButtonText: {
    color: '#4A5568',
    fontSize: 14, // OPTIMIZED: 14px (was 15px)
    fontWeight: '600',
  },
});
