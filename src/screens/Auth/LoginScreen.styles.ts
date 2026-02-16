import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
  },

  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoImage: {
    width: Math.min(320, SCREEN_WIDTH * 0.85),
    height: Math.min(101, (SCREEN_WIDTH * 0.85) * 0.315),
  },

  // ── Card Glow Wrapper — Outer view that emits teal glow ──
  cardGlow: {
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 30,
      },
      android: {
        elevation: 16,
      },
    }),
  },

  // ── Card Gradient — Teal gradient surface with border ──
  cardGradient: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },

  // ── Tab Navigation ──
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  activeTab: {
    borderBottomColor: '#4ECFBF',
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  activeTabText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ── Form Content ──
  formContainer: {
    // Container for form elements
  },
  formTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },

  // ── Input Fields — Recessed dark surface on teal card ──
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 4,
  },

  // ── Error Messaging ──
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 6,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },

  // ── Forgot Password ──
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#4ECFBF',
    fontWeight: '600',
  },

  // ── Primary Action Button — Bright teal, prominent on the teal card ──
  button: {
    backgroundColor: '#14B8A6',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
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
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // ── Divider ──
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  dividerText: {
    fontFamily: 'Inter_500Medium',
    marginHorizontal: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },

  // ── Apple Sign-In Button — White per Apple HIG ──
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  appleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Google Sign-In Button — Glass surface on teal card ──
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  googleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Email Button — Bright teal outline on teal card ──
  emailButton: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.5)',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emailButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#4ECFBF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Sign Up / Sign In Link ──
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  signupLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#4ECFBF',
    fontWeight: '600',
  },

  // ── Back Button ──
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#14B8A6',
    fontWeight: '600',
  },

  // ── Compact Social Buttons (inline, after email form) ──
  compactSocialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  compactAppleButton: {
    backgroundColor: '#FFFFFF',
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  compactGoogleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
