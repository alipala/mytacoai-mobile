import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1117',
  },
  safeArea: {
    flex: 1,
  },

  // ── Ambient color orbs ──
  orbTeal: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.06,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 50,
      },
      android: { elevation: 0 },
    }),
  },
  orbIndigo: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.12,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99, 102, 241, 0.07)',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 40,
      },
      android: { elevation: 0 },
    }),
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
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // ── Card — Solid elevated dark surface ──
  card: {
    backgroundColor: 'rgba(8, 18, 27, 0.85)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
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
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Button — Teal with glow ──
  button: {
    backgroundColor: '#14B8A6',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
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

  // ── Tip box — Teal-tinted glass with accent border ──
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
    borderWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
    borderRightColor: 'rgba(20, 184, 166, 0.15)',
    borderBottomColor: 'rgba(20, 184, 166, 0.15)',
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 20,
  },
});
