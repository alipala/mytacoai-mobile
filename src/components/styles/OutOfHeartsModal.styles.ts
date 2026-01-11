import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export { width };

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
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
  gradientContainer: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lottieAnimation: {
    width: 280,
    height: 280,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'transparent',
    padding: 0,
    marginBottom: 24,
    alignItems: 'center',
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  heart: {
    fontSize: 32,
  },
  infoSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(229, 231, 235, 0.6)',
  },
  upgradeCard: {
    backgroundColor: 'rgba(255, 251, 235, 0.9)',
    borderColor: '#FCD34D',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 40,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  upgradeTitle: {
    color: '#D97706',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '500',
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  highlighted: {
    color: '#D97706',
  },
  comparisonTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  comparisonArrow: {
    fontSize: 20,
    color: '#D1D5DB',
    marginHorizontal: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
});
