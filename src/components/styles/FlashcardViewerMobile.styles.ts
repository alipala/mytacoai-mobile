import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  cardContainer: {
    height: SCREEN_HEIGHT < 700 ? 300 : 350,
    marginBottom: 24,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#FFD63A', // Yellow for Question
  },
  cardBack: {
    backgroundColor: '#4ECFBF', // Turquoise for Answer
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
  },
  cardLabelFront: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000', // Black text on yellow
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  cardLabelBack: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF', // White text on turquoise
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  cardTextFront: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000', // Black text on yellow
    textAlign: 'center',
    lineHeight: 32,
  },
  cardTextBack: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // White text on turquoise
    textAlign: 'center',
    lineHeight: 32,
  },
  flipHintFront: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  flipHintBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  flipHintTextFront: {
    fontSize: 14,
    color: '#000000', // Black text on yellow
    fontWeight: '500',
  },
  flipHintTextBack: {
    fontSize: 14,
    color: '#FFFFFF', // White text on turquoise
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  masteryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  masteryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  masteryBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  masteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
