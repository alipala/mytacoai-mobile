import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)', // Teal border
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Dark semi-transparent
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  subheader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Dark background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  subheaderText: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
    marginBottom: 12,
    textAlign: 'center',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    borderColor: '#14B8A6',
    borderWidth: 2.5,
  },
  stepCircleCompleted: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#14B8A6',
    fontSize: 15,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepLabelActive: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: '#9CA3AF',
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    marginHorizontal: 4,
    marginBottom: 18,
  },
  stepConnectorCompleted: {
    backgroundColor: '#14B8A6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Red tinted dark
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#FCA5A5', // Light red
    fontSize: 14,
  },
  stepContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#14B8A6', // Teal
    marginLeft: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF', // Light gray
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
  },
  selectionCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  selectionCounterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  selectionCounterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14B8A6',
    letterSpacing: 0.3,
  },
  maxReachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  maxReachedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  subGoalsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  subGoalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  subGoalCardSelected: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal tinted
    borderColor: '#14B8A6', // Teal border
  },
  subGoalCardDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B7280', // Gray border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#14B8A6', // Teal
    borderColor: '#14B8A6',
  },
  subGoalInfo: {
    flex: 1,
  },
  subGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    marginBottom: 4,
  },
  subGoalDescription: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6', // Teal
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  durationCard: {
    width: '48%',
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.2)', // Teal border
    minHeight: 85,
  },
  durationCardSelected: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal tinted
    borderColor: '#14B8A6', // Teal border
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginTop: 2,
  },
  durationLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Light gray
    marginTop: 1,
  },
  durationSessions: {
    fontSize: 10,
    color: '#6B8A84', // Muted teal
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)', // Teal border
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryItemHighlight: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.3)', // Teal border
    marginTop: 6,
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#9CA3AF', // Light gray
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  summarySubGoals: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summarySubGoalItem: {
    fontSize: 11,
    color: '#9CA3AF', // Light gray
    marginBottom: 1,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14B8A6', // Teal accent
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6', // Teal
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  creatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  creatingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal tinted dark
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  creatingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginBottom: 12,
    textAlign: 'center',
  },
  creatingSubtitle: {
    fontSize: 16,
    color: '#9CA3AF', // Light gray
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successLottie: {
    width: 200,
    height: 200,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#9CA3AF', // Light gray
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  successStat: {
    alignItems: 'center',
    flex: 1,
  },
  flagWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 8,
    paddingBottom: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  successStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginTop: 8,
  },
  successStatValueSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    marginTop: 8,
  },
  successStatLabel: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
    marginTop: 4,
  },
  successButton: {
    width: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  successButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  successButtonText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
