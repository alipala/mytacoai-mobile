import { StyleSheet, Dimensions } from 'react-native';

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
    marginBottom: 40,
  },
  logoImage: {
    width: Math.min(320, SCREEN_WIDTH * 0.85),
    height: Math.min(101, (SCREEN_WIDTH * 0.85) * 0.315),
  },

  // Card — Dark glassmorphic surface
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    borderBottomColor: '#14B8A6',
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  activeTabText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#14B8A6',
    fontWeight: '600',
  },

  // Form Content
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

  // Input Styling — Dark glass fields
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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

  // Error Messaging
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

  // Forgot Password
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },

  // Primary Action Button — Teal with glow
  button: {
    backgroundColor: '#14B8A6',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
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

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontFamily: 'Inter_500Medium',
    marginHorizontal: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '500',
  },

  // Apple Sign-In Button — White per Apple HIG
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  appleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },

  // Google Sign-In Button — Dark glass
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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

  // Email Button — Teal outlined
  emailButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.4)',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  emailButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },

  // Sign Up / Sign In Link
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  signupLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#14B8A6',
    fontWeight: '600',
  },

  // Back Button
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

  // Compact Social Buttons (inline, after email form)
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
  },
  compactGoogleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
