import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4ECFBF', // Solid turquoise background
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

  // Card Design - Clean White with Strong Shadow
  card: {
    backgroundColor: '#FFFFFF', // Solid white
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -2,
  },
  activeTab: {
    borderBottomColor: '#4ECFBF',
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#4ECFBF',
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
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },

  // Modern Input Styling
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
    color: '#4ECFBF',
    fontWeight: '600',
  },

  // Primary Button
  button: {
    backgroundColor: '#4ECFBF',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontFamily: 'Inter_500Medium',
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Apple Sign-In Button
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },

  // Google Sign-In Button
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },

  // Email Button (Outlined)
  emailButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4ECFBF',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  emailButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#4ECFBF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Sign Up Link Container
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B7280',
  },
  signupLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#4ECFBF',
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
    color: '#4ECFBF',
    fontWeight: '600',
  },

  // Compact Social Buttons (Horizontal)
  compactSocialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  compactAppleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactGoogleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
