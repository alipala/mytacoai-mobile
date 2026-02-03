import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },

  // Main Card with Enhanced Glow
  mainCard: {
    backgroundColor: 'rgba(15, 35, 40, 0.95)',
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // Timer Section with Enhanced Visuals
  timerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 5,
    borderColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  timerCircleWarning: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
      },
    }),
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#14B8A6',
    letterSpacing: -2,
  },
  timerTextWarning: {
    color: '#EF4444',
  },
  timerSubtext: {
    fontSize: 11,
    color: '#B4E4DD',
    marginTop: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Prompt Card with Modern Design
  promptCard: {
    gap: 14,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  promptBox: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderRadius: 18,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  quoteIcon: {
    marginTop: 2,
    opacity: 0.7,
  },
  promptText: {
    flex: 1,
    fontSize: 17,
    color: '#E0F2F1',
    lineHeight: 26,
    fontStyle: 'italic',
  },

  // Tips Section with Enhanced Colors
  tipsSection: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  tipCard: {
    flex: 1,
    backgroundColor: 'rgba(25, 35, 45, 0.85)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tipIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tipContent: {
    alignItems: 'center',
    gap: 4,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tipText: {
    fontSize: 12,
    color: '#B4E4DD',
    textAlign: 'center',
    opacity: 0.9,
  },

  // Recording Indicator with Enhanced Pulse
  recordingIndicatorContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  recordingPulse: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  canStopText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },

  // Progress Message with Spring Animation
  progressMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  progressMessageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.3,
  },

  // Analyzing State with Modern Loader
  analyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  analyzingSubtext: {
    fontSize: 15,
    color: '#B4E4DD',
    opacity: 0.8,
  },

  // Action Buttons with Enhanced Gradients
  actionButtonsContainer: {
    gap: 14,
    marginTop: 'auto',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B4E4DD',
    letterSpacing: 0.3,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Countdown Overlay with Dramatic Effect
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  countdownCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 6,
    borderColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.8,
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
    color: '#14B8A6',
    letterSpacing: -4,
  },
  countdownText: {
    fontSize: 20,
    color: '#B4E4DD',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Exit Modal with Modern Design
  exitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  exitModalContent: {
    backgroundColor: '#1A2B35',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  exitModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  exitModalText: {
    fontSize: 15,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  exitModalButtons: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  exitModalButton: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  exitModalButtonCancel: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  exitModalButtonCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14B8A6',
    letterSpacing: 0.3,
  },
  exitModalButtonConfirm: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  exitModalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
});
