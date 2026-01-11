import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.9;
export const CARD_SPACING = 16;

export const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  scrollView: {
    paddingLeft: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 24,
    minHeight: 240,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  trendEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  trendText: {
    fontSize: 15,
    fontWeight: '700',
  },
  questSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  questButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questButtonDisabled: {
    opacity: 0.5,
  },
  questButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questIconEmoji: {
    fontSize: 24,
  },
  questInfo: {
    flex: 1,
  },
  questButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  questButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
