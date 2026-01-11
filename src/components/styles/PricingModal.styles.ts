import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Detect iPad (tablets have width > 768)
export const isTablet = SCREEN_WIDTH >= 768;

// Card dimensions optimized for both iPhone and iPad
export const CARD_WIDTH = isTablet
  ? SCREEN_WIDTH * 0.45
  : SCREEN_WIDTH < 400
    ? SCREEN_WIDTH - 32  // Smaller margin on small phones
    : SCREEN_WIDTH - 60;
export const CARD_SPACING = isTablet ? 30 : (SCREEN_WIDTH < 400 ? 16 : 20);
export const CARD_MARGIN = isTablet ? 40 : (SCREEN_WIDTH < 400 ? 16 : 30);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  toggleSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    position: 'relative',
  },
  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleOptionTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  carouselContent: {
    paddingVertical: 14,
  },
  carouselContentTablet: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH < 400 ? 16 : 40,
  },
  planCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SCREEN_WIDTH < 400 ? 14 : 16,
    marginHorizontal: CARD_SPACING / 2,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    // Removed fixed height to allow dynamic content
  },
  planCardPopular: {
    borderColor: '#4ECFBF',
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECFBF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 6,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  highlightContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  pricingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: SCREEN_WIDTH < 400 ? 32 : 38,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  monthlyEquivalent: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
  savingsTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  featuresGrid: {
    marginBottom: 14,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4ECFBF',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonPopular: {
    backgroundColor: '#4ECFBF',
    borderColor: '#4ECFBF',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4ECFBF',
    marginRight: 8,
  },
  ctaButtonTextPopular: {
    color: '#FFFFFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4ECFBF',
    width: 24,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  legalLinkText: {
    fontSize: 11,
    color: '#6B7280',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  maybeLaterButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  maybeLaterText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
