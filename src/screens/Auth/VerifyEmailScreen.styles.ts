import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: SCREEN_WIDTH < 400 ? Math.min(100, SCREEN_WIDTH * 0.27) : 120,
    height: SCREEN_WIDTH < 400 ? Math.min(100, SCREEN_WIDTH * 0.27) : 120,
    borderRadius: SCREEN_WIDTH < 400 ? Math.min(50, SCREEN_WIDTH * 0.135) : 60,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 0,
  },

  // Dark glassmorphic card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#14B8A6',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#14B8A6',
    fontWeight: '600',
  },

  // Tip box — dark glass with teal accent
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 20,
  },
});
