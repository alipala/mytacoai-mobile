import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.15)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  mainCard: {
    backgroundColor: 'rgba(15, 35, 40, 0.9)', // Darker, distinct background with slight teal-green tint
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.4)', // Much more visible teal border
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 4,
    borderColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#14B8A6',
  },
  timerTextWarning: {
    color: '#EF4444',
  },
  timerSubtext: {
    fontSize: 12,
    color: '#B4E4DD',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topicCard: {
    gap: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  topicLabel: {
    fontSize: 14,
    color: '#B4E4DD',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  promptBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle neutral background
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(148, 163, 184, 0.6)', // Subtle gray-blue accent
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // Very subtle border
  },
  quoteIcon: {
    marginTop: 2,
  },
  promptText: {
    flex: 1,
    fontSize: 16,
    color: '#B4E4DD',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  tipsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tipCard: {
    flex: 1,
    backgroundColor: 'rgba(25, 35, 45, 0.8)', // Slightly lighter base for better color tint visibility
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // Subtle border (will be overridden by color variants)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tipIconContainer: {
    width: 40, // Slightly larger
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.2)', // Keep base color, will be customized per card
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipContent: {
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tipText: {
    fontSize: 11,
    color: '#B4E4DD',
    textAlign: 'center',
  },
  recordingIndicatorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  recordingPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '700',
    marginBottom: 4,
  },
  recordingSubtext: {
    fontSize: 14,
    color: '#B4E4DD',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
  },
  recordButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stopButtonContainer: {
    gap: 12,
  },
  progressMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#B4E4DD',
    fontWeight: '600',
  },
  progressTextSuccess: {
    color: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  stopButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.7,
    shadowOpacity: 0,
  },
  stopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stopButtonTextDisabled: {
    color: '#B4E4DD',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#0B1A1F',
  },
  analyzingLottie: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 24,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 26, 31, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countdownContent: {
    alignItems: 'center',
    gap: 32,
  },
  countdownCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  countdownNumber: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
  },
  // Custom Exit Modal Styles
  exitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exitModalContainer: {
    backgroundColor: 'rgba(20, 30, 40, 0.98)',
    borderRadius: 24,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  exitModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  exitModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  exitModalMessage: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  exitModalButtons: {
    gap: 14,
    width: '100%',
  },
  exitModalCancelButton: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  exitModalCancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  exitModalExitButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  exitModalExitGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  exitModalExitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Individual tip card styles for color variety
  tipCardTime: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)', // RED tinted background - urgency/time!
    borderColor: 'rgba(239, 68, 68, 0.35)', // Red border
    borderWidth: 1.5,
  },
  tipIconContainerTime: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)', // Red background
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  tipCardMic: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)', // BLUE tinted background - trust/clarity!
    borderColor: 'rgba(59, 130, 246, 0.35)', // Blue border
    borderWidth: 1.5,
  },
  tipIconContainerMic: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)', // Blue background
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  tipCardStar: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)', // GREEN tinted background - success/encouragement!
    borderColor: 'rgba(16, 185, 129, 0.35)', // Green border
    borderWidth: 1.5,
  },
  tipIconContainerStar: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)', // Green background
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
});
