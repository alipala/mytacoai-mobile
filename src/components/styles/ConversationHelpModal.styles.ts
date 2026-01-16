import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

export const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  inlineContainer: {
    width: SCREEN_WIDTH * 0.85,
    minHeight: 220, // Reduced from 300
    maxHeight: SCREEN_HEIGHT * 0.5, // Reduced from 0.6
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Reduced from 24
    marginVertical: 10, // Reduced from 12
    alignSelf: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 }, // Reduced from 4
        shadowOpacity: 0.12, // Reduced from 0.15
        shadowRadius: 10, // Reduced from 12
      },
      android: {
        elevation: 5, // Reduced from 6
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12, // Reduced from 14
    paddingVertical: 8, // Reduced from 10
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 13, // Reduced from 15
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Reduced from 16
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 12, // Reduced from 18
    paddingTop: 10, // Reduced from 12
    paddingBottom: 16, // Reduced from 24
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  contentContainer: {
    paddingBottom: 2, // Reduced from 4
  },
  section: {
    marginBottom: 4, // Reduced from 6
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Reduced from 5
    marginBottom: 4, // Reduced from 5
  },
  sectionTitle: {
    fontSize: 12, // Reduced from 13
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  responsesContainer: {
    gap: 10, // Reduced from 14
    marginTop: 3, // Reduced from 4
  },
  responseCard: {
    backgroundColor: '#FFFFFF',
    padding: 14, // Reduced from 20
    paddingTop: 12, // Reduced from 16
    paddingLeft: 18, // Reduced from 22
    borderRadius: 14, // Reduced from 16
    borderWidth: 2,
    borderColor: '#10B981',
    minHeight: 60, // Reduced from 85
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2, // Reduced from 4
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  responseCardFirst: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FEFEFE',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
      },
    }),
  },
  responseNumberBadge: {
    position: 'absolute',
    top: -8,
    left: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  responseNumberBadgeFirst: {
    backgroundColor: '#8B5CF6',
  },
  responseNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  responseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  pronunciationButton: {
    padding: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
  },
  vocabularyContainer: {
    gap: 12,
  },
  vocabularyCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  vocabularyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vocabularyWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9A3412',
  },
  vocabularyDefinition: {
    fontSize: 14,
    color: '#9A3412',
    marginBottom: 8,
  },
  vocabularyExample: {
    fontSize: 13,
    color: '#C2410C',
    fontStyle: 'italic',
  },
  grammarContainer: {
    gap: 12,
  },
  grammarCard: {
    backgroundColor: '#FAF5FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  grammarPattern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B21A8',
    marginBottom: 8,
  },
  grammarExplanation: {
    fontSize: 14,
    color: '#7C3AED',
    marginBottom: 8,
  },
  grammarExample: {
    fontSize: 13,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
  culturalCard: {
    backgroundColor: '#FDF2F8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  culturalText: {
    fontSize: 14,
    color: '#9F1239',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
  },
  debugInfo: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
});
