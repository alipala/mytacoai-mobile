import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width - 40; // Assuming 20px padding on each side

export const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    padding: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  insightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  insightLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  expandText: {
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '600',
    marginRight: 4,
  },
  expandArrow: {
    fontSize: 10,
    color: '#06B6D4',
  },
  detailsContainer: {
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  dailyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  dailyItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dailyDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  dailyChallenges: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  dailyAccuracy: {
    fontSize: 11,
    color: '#06B6D4',
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
