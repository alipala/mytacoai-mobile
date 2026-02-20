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
    backgroundColor: 'rgba(11, 26, 31, 0.98)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
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
    backgroundColor: 'rgba(11, 26, 31, 0.98)',
    borderRadius: 20, // Reduced from 24
    marginVertical: 10, // Reduced from 12
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 3 }, // Reduced from 4
        shadowOpacity: 0.4, // Reduced from 0.15
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
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: {
    fontSize: 13, // Reduced from 15
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    borderRadius: 14, // Reduced from 16
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#B4E4DD',
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
    color: '#FFFFFF',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#93C5FD',
    lineHeight: 16,
  },
  responsesContainer: {
    gap: 10, // Reduced from 14
    marginTop: 3, // Reduced from 4
  },
  responseCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    minHeight: 60,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  responseCardFirst: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.4,
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
    borderColor: 'rgba(11, 26, 31, 0.98)',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
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
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: 0.2,
    flex: 1,
  },
  responseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  translateIconButton: {
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  translationContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    padding: 12,
    paddingTop: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    marginTop: 6,
    marginBottom: 4,
  },
  translationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  translationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4B5FD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  translationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E9D5FF',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  pronunciationButton: {
    padding: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  vocabularyContainer: {
    gap: 12,
  },
  vocabularyCard: {
    backgroundColor: 'rgba(251, 146, 60, 0.18)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 146, 60, 0.4)',
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
    color: '#FED7AA',
  },
  vocabularyDefinition: {
    fontSize: 14,
    color: '#FDE68A',
    marginBottom: 8,
  },
  vocabularyExample: {
    fontSize: 13,
    color: '#FCA5A5',
    fontStyle: 'italic',
  },
  grammarContainer: {
    gap: 12,
  },
  grammarCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  grammarPattern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C4B5FD',
    marginBottom: 8,
  },
  grammarExplanation: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 8,
  },
  grammarExample: {
    fontSize: 13,
    color: '#DDD6FE',
    fontStyle: 'italic',
  },
  culturalCard: {
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  culturalText: {
    fontSize: 14,
    color: '#FBCFE8',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#B4E4DD',
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
