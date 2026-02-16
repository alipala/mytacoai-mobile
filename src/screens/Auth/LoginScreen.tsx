/**
 * Modern LoginScreen.tsx - 2025 Design
 *
 * Features:
 * - Immersive gradient background
 * - Inline form validation with visual feedback
 * - Toast notifications instead of alerts
 * - Smooth animations and micro-interactions
 * - Professional, engaging design
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Animated,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { showToast, GlobalToast } from '../../components/CustomToast';
import { authService } from '../../api/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthenticationService } from '../../api/generated';
import { styles } from './LoginScreen.styles';
import { AuthResultModal } from '../../components/AuthResultModal';
import { useTranslation } from 'react-i18next';


export const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Animation state
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Email form visibility state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSignupEmailForm, setShowSignupEmailForm] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Create Account form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [signupEmailError, setSignupEmailError] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auth result modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'success' | 'error'>('success');
  const [authModalTitle, setAuthModalTitle] = useState('');
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [authModalUserName, setAuthModalUserName] = useState('');

  /**
   * Entrance animations on mount
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /**
   * Tab switch animation
   */
  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    if (tab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
      // Reset errors when switching tabs
      clearAllErrors();
      // Reset email form visibility
      setShowEmailForm(false);
      setShowSignupEmailForm(false);
    }
  };

  const clearAllErrors = () => {
    setEmailError('');
    setPasswordError('');
    setFullNameError('');
    setSignupEmailError('');
    setSignupPasswordError('');
    setConfirmPasswordError('');
  };

  /**
   * Validation helpers
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSignInForm = (): boolean => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError(t('auth.login.error_email_required'));
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t('auth.login.error_invalid_email'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError(t('auth.login.error_password_required'));
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(t('auth.login.error_password_min_length'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const validateSignUpForm = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError(t('auth.login.error_name_required'));
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError(t('auth.login.error_name_min_length'));
      isValid = false;
    } else {
      setFullNameError('');
    }

    if (!signupEmail.trim()) {
      setSignupEmailError(t('auth.login.error_email_required'));
      isValid = false;
    } else if (!validateEmail(signupEmail)) {
      setSignupEmailError(t('auth.login.error_invalid_email'));
      isValid = false;
    } else {
      setSignupEmailError('');
    }

    if (!signupPassword) {
      setSignupPasswordError(t('auth.login.error_password_required'));
      isValid = false;
    } else if (signupPassword.length < 8) {
      setSignupPasswordError(t('auth.login.error_password_min_length'));
      isValid = false;
    } else {
      setSignupPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('auth.login.error_password_confirm_required'));
      isValid = false;
    } else if (signupPassword !== confirmPassword) {
      setConfirmPasswordError(t('auth.login.error_passwords_no_match'));
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  /**
   * Handle Email/Password Login
   */
  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!validateSignInForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setLoading(true);

      await authService.login(email, password);
      const user = await authService.getCurrentUser();

      // Store user object for stats and other features
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_provider', 'email');

      // Show beautiful success modal (just animation and userName)
      const firstName = user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
      setAuthModalType('success');
      setAuthModalTitle('');
      setAuthModalMessage('');
      setAuthModalUserName(firstName);
      setShowAuthModal(true);

      console.log('✅ Showing welcome animation (3s)...');
      setTimeout(() => {
        console.log('🧭 Navigating to Main screen...');
        setShowAuthModal(false);
        navigation.replace('Main');
      }, 3000);

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const statusCode = error.status || error.response?.status;
      const errorDetail = error.response?.data?.detail || error.body?.detail || error.message;

      if (statusCode === 403) {
        setAuthModalType('error');
        setAuthModalTitle(t('auth.login.error_email_not_verified'));
        setAuthModalMessage(t('auth.login.error_email_not_verified_message'));
        setAuthModalUserName('');
        setShowAuthModal(true);

        setTimeout(() => {
          setShowAuthModal(false);
          navigation.navigate('VerifyEmail', {
            email: email.toLowerCase().trim(),
          });
        }, 3000);
        return;
      }

      if (statusCode === 401) {
        setPasswordError(t('auth.login.error_invalid_credentials'));
        setAuthModalType('error');
        setAuthModalTitle(t('auth.login.error_invalid_credentials_title'));
        setAuthModalMessage(t('auth.login.error_invalid_credentials_message'));
        setAuthModalUserName('');
        setShowAuthModal(true);
        return;
      }

      setAuthModalType('error');
      setAuthModalTitle(t('auth.login.error_login_failed'));
      setAuthModalMessage(errorDetail || t('auth.login.error_login_message'));
      setAuthModalUserName('');
      setShowAuthModal(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Registration
   */
  const handleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!validateSignUpForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);

    try {
      await AuthenticationService.registerApiAuthRegisterPost({
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword,
        name: fullName.trim(),
      });

      // Mark as email signup
      await AsyncStorage.setItem('auth_provider', 'email');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      showToast({
        type: 'success',
        text1: t('auth.login.success_account_created'),
        text2: t('auth.login.success_account_created_message'),
        duration: 4000,
      });

      setFullName('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigation.navigate('VerifyEmail', {
          email: signupEmail.toLowerCase().trim(),
        });
      }, 1500);

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = t('auth.login.error_registration_failed');

      if (error.status === 400) {
        errorMessage = t('auth.login.error_email_exists');
        setSignupEmailError(errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: 'error',
        text1: t('auth.login.error_login_failed'),
        text2: errorMessage,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    try {
      console.log('🚀 Starting Google Sign-In...');
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('⚙️ Configuring Google Sign-In...');
      await GoogleSignin.configure({
        webClientId: '41687548204-0go9lqlnve4llpv3vdl48jujddlt2kp5.apps.googleusercontent.com',
        iosClientId: '41687548204-2gm0vhfjqub78lm5pqd7qh5drj6vmmrb.apps.googleusercontent.com',
        offlineAccess: true,
      });

      console.log('✅ Checking Play Services...');
      await GoogleSignin.hasPlayServices();

      // Sign out first to ensure fresh sign-in (prevent cached credentials auto-login)
      console.log('🔓 Signing out any cached session...');
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log('ℹ️ No cached session to sign out');
      }

      console.log('🔐 Initiating sign-in...');
      const signInResult = await GoogleSignin.signIn();

      // Log full response for debugging
      console.log('📦 Google Sign-In response type:', signInResult.type);

      // Handle v16+ API structure
      if (signInResult.type === 'cancelled') {
        console.log('ℹ️ User cancelled Google Sign-In');
        return;
      }

      if (signInResult.type !== 'success') {
        console.log('⚠️ Unknown sign-in result type:', signInResult.type);
        return;
      }

      // Extract user data from result
      const userInfo = signInResult.data;
      console.log('✅ Got user info:', userInfo.user?.email);
      console.log('🔑 Has idToken?', !!userInfo.idToken);

      // Check if we have the required token
      if (!userInfo || !userInfo.idToken) {
        console.log('⚠️ Sign-in succeeded but missing idToken');
        throw new Error(t('auth.login.error_google_token'));
      }

      // Show welcome animation IMMEDIATELY (before backend calls)
      setAuthModalType('success');
      setAuthModalTitle('');
      setAuthModalMessage('');
      setAuthModalUserName('');
      setShowAuthModal(true);
      console.log('🎬 Showing welcome animation immediately...');

      // Backend calls happen in parallel with animation
      console.log('📡 Calling backend API...');
      const response = await AuthenticationService.googleLoginApiAuthGoogleLoginPost({
        token: userInfo.idToken,
      });
      console.log('✅ Backend response received:', response.access_token ? 'token present' : 'NO token');

      console.log('💾 Storing auth token...');
      await AsyncStorage.setItem('auth_token', response.access_token);

      console.log('👤 Fetching user info...');
      const user = await AuthenticationService.getUserMeApiAuthMeGet();
      console.log('✅ User info received:', user.email);

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_provider', 'google');

      // Update modal with user's first name
      const firstName = user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
      setAuthModalUserName(firstName);
      console.log('✅ Updated welcome name:', firstName);

      console.log('✅ Backend setup complete, waiting for animation...');
      // Navigate after animation completes (3s total from when modal showed)
      setTimeout(() => {
        console.log('🧭 Navigating to Main screen...');
        setShowAuthModal(false);
        navigation.replace('Main');
        console.log('✅ Navigation complete');
      }, 3000);

    } catch (error: any) {
      // User cancelled sign-in - this is normal behavior, not an error
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User cancelled Google Sign-In');
        return;
      }

      // Real error occurred - log details
      console.error('❌ Google Sign-In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Show error modal
      setAuthModalType('error');
      setAuthModalTitle(t('auth.login.error_google_signin_failed'));
      setAuthModalMessage(error.message || t('auth.login.error_google_signin_message'));
      setAuthModalUserName('');
      setShowAuthModal(true);
    } finally {
      console.log('🏁 Google Sign-In flow finished');
      setLoading(false);
    }
  };

  /**
   * Handle Apple Sign-In
   */
  const handleAppleSignIn = async () => {
    try {
      console.log('🍎 Starting Apple Sign-In...');
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('✅ Apple credential received:', credential.user);

      // Extract user data (email and name only available on first sign-in)
      const email = credential.email;
      const fullName = credential.fullName;
      const name = fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : null;

      // Show welcome animation IMMEDIATELY (before backend calls)
      setAuthModalType('success');
      setAuthModalTitle('');
      setAuthModalMessage('');
      setAuthModalUserName('');
      setShowAuthModal(true);
      console.log('🎬 Showing welcome animation immediately...');

      // Backend calls happen in parallel with animation
      console.log('📡 Calling backend API...');

      // Send to backend
      const response = await AuthenticationService.appleLoginApiAuthAppleLoginPost({
        token: credential.identityToken!,
        user_identifier: credential.user,
        email: email || undefined,
        name: name || undefined,
      });

      console.log('✅ Backend response received:', response.access_token ? 'token present' : 'NO token');

      // Store auth token
      await AsyncStorage.setItem('auth_token', response.access_token);

      // Fetch user info
      console.log('👤 Fetching user info...');
      const user = await AuthenticationService.getUserMeApiAuthMeGet();
      console.log('✅ User info received:', user.email);

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_provider', 'apple');

      // Update modal with user's first name
      const firstName = user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
      setAuthModalUserName(firstName);
      console.log('✅ Updated welcome name:', firstName);

      console.log('✅ Backend setup complete, waiting for animation...');

      console.log('✅ Showing welcome animation (3s)...');
      setTimeout(() => {
        console.log('🧭 Navigating to Main screen...');
        setShowAuthModal(false);
        navigation.replace('Main');
        console.log('✅ Navigation complete');
      }, 3000);

    } catch (error: any) {
      // User cancelled sign-in - this is normal behavior, not an error
      if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
        console.log('ℹ️ User cancelled Apple Sign-In');
        return;
      }

      // Real error occurred - log details
      console.error('❌ Apple Sign-In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Show error modal
      setAuthModalType('error');
      setAuthModalTitle(t('auth.login.error_apple_signin_failed'));
      setAuthModalMessage(error.message || t('auth.login.error_apple_signin_message'));
      setAuthModalUserName('');
      setShowAuthModal(true);
    } finally {
      console.log('🏁 Apple Sign-In flow finished');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ForgotPassword');
  };

  /**
   * Validate Email Format
   */
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  /**
   * Handle Email Blur - Login
   */
  const handleEmailBlur = () => {
    if (email.trim() && !validateEmailFormat(email)) {
      setEmailError(t('auth.login.error_invalid_email'));
    }
  };

  /**
   * Handle Email Blur - Create Account
   */
  const handleSignupEmailBlur = () => {
    if (signupEmail.trim() && !validateEmailFormat(signupEmail)) {
      setSignupEmailError(t('auth.login.error_invalid_email'));
    }
  };

  // Wait for fonts to load
  if (!fontsLoaded) {
    return null;
  }

  // Interpolate gradient pulse for subtle color intensity shifts
  return (
    <View style={styles.container}>
      {/* Rich colored gradient background */}
      <LinearGradient
        colors={['#0F2B3C', '#0E2233', '#12182B', '#161530', '#0D1117']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient color orbs for atmospheric depth */}
      <View style={styles.orbTeal} />
      <View style={styles.orbIndigo} />
      <View style={styles.orbCyan} />

        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
            }}
          >
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo */}
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [
                      { translateY: slideAnim },
                      { scale: logoScale }
                    ]
                  }
                ]}
              >
                <Image
                  source={require('../../assets/logo-transparent.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Auth Card */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {/* Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
                    onPress={() => handleTabSwitch('signin')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'signin' && styles.activeTabText,
                      ]}
                    >
                      {t('auth.login.tab_signin')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                    onPress={() => handleTabSwitch('signup')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'signup' && styles.activeTabText,
                      ]}
                    >
                      {t('auth.login.tab_signup')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Form */}
                {activeTab === 'signin' && (
                  <View style={styles.formContainer}>
                    {!showEmailForm ? (
                      /* Social Login Options */
                      <>
                        <Text style={styles.formTitle}>
                          {t('auth.login.title_choose_signin')}
                        </Text>

                        {/* Apple Sign-In Button (iOS only) */}
                        {Platform.OS === 'ios' && (
                          <TouchableOpacity
                            style={styles.appleButton}
                            onPress={handleAppleSignIn}
                            disabled={loading}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="logo-apple" size={24} color="#000000" />
                            <Text style={styles.appleButtonText}>{t('auth.login.button_continue_apple')}</Text>
                          </TouchableOpacity>
                        )}

                        {/* Google Sign-In Button */}
                        <TouchableOpacity
                          style={styles.googleButton}
                          onPress={handleGoogleSignIn}
                          disabled={loading}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="logo-google" size={24} color="#DB4437" />
                          <Text style={styles.googleButtonText}>{t('auth.login.button_continue_google')}</Text>
                        </TouchableOpacity>

                        {/* Sign in with Email Button */}
                        <TouchableOpacity
                          style={styles.emailButton}
                          onPress={() => {
                            setShowEmailForm(true);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          disabled={loading}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="mail-outline" size={24} color="#14B8A6" />
                          <Text style={styles.emailButtonText}>{t('auth.login.button_continue_email')}</Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.signupLinkContainer}>
                          <Text style={styles.signupLinkText}>{t('auth.login.link_no_account')} </Text>
                          <TouchableOpacity
                            onPress={() => handleTabSwitch('signup')}
                            disabled={loading}
                          >
                            <Text style={styles.signupLink}>{t('auth.login.link_signup')}</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      /* Email/Password Form */
                      <>
                        <Text style={styles.formTitle}>
                          {t('auth.login.title_enter_credentials')}
                        </Text>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                          <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                            <Ionicons name="mail-outline" size={20} color={emailError ? '#EF4444' : 'rgba(255,255,255,0.5)'} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder={t('auth.login.label_email')}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              value={email}
                              onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                              }}
                              onBlur={handleEmailBlur}
                              autoCapitalize="none"
                              keyboardType="email-address"
                              editable={!loading}
                              autoComplete="email"
                            />
                          </View>
                          {emailError ? (
                            <View style={styles.errorContainer}>
                              <Ionicons name="alert-circle" size={14} color="#EF4444" />
                              <Text style={styles.errorText}>{emailError}</Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                          <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={passwordError ? '#EF4444' : 'rgba(255,255,255,0.5)'} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder={t('auth.login.label_password')}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              value={password}
                              onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError('');
                              }}
                              secureTextEntry={!showPassword}
                              editable={!loading}
                              autoComplete="password"
                            />
                            <TouchableOpacity
                              onPress={() => {
                                setShowPassword(!showPassword);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                              style={styles.eyeIcon}
                            >
                              <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="rgba(255,255,255,0.5)"
                              />
                            </TouchableOpacity>
                          </View>
                          {passwordError ? (
                            <View style={styles.errorContainer}>
                              <Ionicons name="alert-circle" size={14} color="#EF4444" />
                              <Text style={styles.errorText}>{passwordError}</Text>
                            </View>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          onPress={handleForgotPassword}
                          style={styles.forgotPasswordContainer}
                          disabled={loading}
                        >
                          <Text style={styles.forgotPasswordText}>{t('auth.login.link_forgot_password')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.button, loading && styles.buttonDisabled]}
                          onPress={handleLogin}
                          disabled={loading}
                          activeOpacity={0.8}
                        >
                          {loading ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <>
                              <Text style={styles.buttonText}>{t('auth.login.button_signin')}</Text>
                              <Ionicons name="arrow-forward" size={20} color="white" />
                            </>
                          )}
                        </TouchableOpacity>

                        {/* Quick Escape - Or continue with */}
                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <Text style={styles.dividerText}>{t('auth.login.divider_or_continue')}</Text>
                          <View style={styles.divider} />
                        </View>

                        {/* Compact Social Buttons */}
                        <View style={styles.compactSocialContainer}>
                          {Platform.OS === 'ios' && (
                            <TouchableOpacity
                              style={styles.compactAppleButton}
                              onPress={handleAppleSignIn}
                              disabled={loading}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="logo-apple" size={24} color="#000000" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.compactGoogleButton}
                            onPress={handleGoogleSignIn}
                            disabled={loading}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="logo-google" size={24} color="#DB4437" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}

                {/* Create Account Form */}
                {activeTab === 'signup' && (
                  <View style={styles.formContainer}>
                    {!showSignupEmailForm ? (
                      /* Social Sign Up Options */
                      <>
                        <Text style={styles.formTitle}>
                          {t('auth.login.title_choose_signup')}
                        </Text>

                        {/* Apple Sign-In Button (iOS only) */}
                        {Platform.OS === 'ios' && (
                          <TouchableOpacity
                            style={styles.appleButton}
                            onPress={handleAppleSignIn}
                            disabled={loading}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="logo-apple" size={24} color="#000000" />
                            <Text style={styles.appleButtonText}>{t('auth.login.button_continue_apple')}</Text>
                          </TouchableOpacity>
                        )}

                        {/* Google Sign-In Button */}
                        <TouchableOpacity
                          style={styles.googleButton}
                          onPress={handleGoogleSignIn}
                          disabled={loading}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="logo-google" size={24} color="#DB4437" />
                          <Text style={styles.googleButtonText}>{t('auth.login.button_continue_google')}</Text>
                        </TouchableOpacity>

                        {/* Sign up with Email Button */}
                        <TouchableOpacity
                          style={styles.emailButton}
                          onPress={() => {
                            setShowSignupEmailForm(true);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          disabled={loading}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="mail-outline" size={24} color="#14B8A6" />
                          <Text style={styles.emailButtonText}>{t('auth.login.button_signup_email')}</Text>
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View style={styles.signupLinkContainer}>
                          <Text style={styles.signupLinkText}>{t('auth.login.link_have_account')} </Text>
                          <TouchableOpacity
                            onPress={() => handleTabSwitch('signin')}
                            disabled={loading}
                          >
                            <Text style={styles.signupLink}>{t('auth.login.link_signin')}</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      /* Email/Password Sign Up Form */
                      <>
                        <Text style={styles.formTitle}>
                          {t('auth.login.title_fill_details')}
                        </Text>

                        {/* Full Name Input */}
                        <View style={styles.inputContainer}>
                          <View style={[styles.inputWrapper, fullNameError && styles.inputError]}>
                            <Ionicons name="person-outline" size={20} color={fullNameError ? '#EF4444' : 'rgba(255,255,255,0.5)'} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder={t('auth.login.label_name')}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              value={fullName}
                              onChangeText={(text) => {
                                setFullName(text);
                                if (fullNameError) setFullNameError('');
                              }}
                              autoCapitalize="words"
                              editable={!loading}
                            />
                          </View>
                          {fullNameError ? (
                            <View style={styles.errorContainer}>
                              <Ionicons name="alert-circle" size={14} color="#EF4444" />
                              <Text style={styles.errorText}>{fullNameError}</Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                          <View style={[styles.inputWrapper, signupEmailError && styles.inputError]}>
                            <Ionicons name="mail-outline" size={20} color={signupEmailError ? '#EF4444' : 'rgba(255,255,255,0.5)'} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder={t('auth.login.label_email')}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              value={signupEmail}
                              onChangeText={(text) => {
                                setSignupEmail(text);
                                if (signupEmailError) setSignupEmailError('');
                              }}
                              onBlur={handleSignupEmailBlur}
                              autoCapitalize="none"
                              keyboardType="email-address"
                              editable={!loading}
                              autoComplete="email"
                            />
                          </View>
                          {signupEmailError ? (
                            <View style={styles.errorContainer}>
                              <Ionicons name="alert-circle" size={14} color="#EF4444" />
                              <Text style={styles.errorText}>{signupEmailError}</Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                          <View style={[styles.inputWrapper, signupPasswordError && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={signupPasswordError ? '#EF4444' : 'rgba(255,255,255,0.5)'} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder={t('auth.login.placeholder_password_min')}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              value={signupPassword}
                              onChangeText={(text) => {
                                setSignupPassword(text);
                                if (signupPasswordError) setSignupPasswordError('');
                              }}
                              secureTextEntry={!showPassword}
                              editable={!loading}
                            />
                            <TouchableOpacity
                              onPress={() => {
                                setShowPassword(!showPassword);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                              style={styles.eyeIcon}
                            >
                              <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="rgba(255,255,255,0.5)"
                              />
                            </TouchableOpacity>
                          </View>
                          {signupPasswordError ? (
                            <View style={styles.errorContainer}>
                              <Ionicons name="alert-circle" size={14} color="#EF4444" />
                              <Text style={styles.errorText}>{signupPasswordError}</Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                          <View style={[styles.inputWrapper, confirmPasswordError && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={confirmPasswordError ? '#EF4444' : 'rgba(255,255,255,0.5)'} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder={t('auth.login.label_confirm_password')}
                              placeholderTextColor="rgba(255,255,255,0.4)"
                              value={confirmPassword}
                              onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (confirmPasswordError) setConfirmPasswordError('');
                              }}
                              secureTextEntry={!showConfirmPassword}
                              editable={!loading}
                            />
                            <TouchableOpacity
                              onPress={() => {
                                setShowConfirmPassword(!showConfirmPassword);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                              style={styles.eyeIcon}
                            >
                              <Ionicons
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="rgba(255,255,255,0.5)"
                              />
                            </TouchableOpacity>
                          </View>
                          {confirmPasswordError ? (
                            <View style={styles.errorContainer}>
                              <Ionicons name="alert-circle" size={14} color="#EF4444" />
                              <Text style={styles.errorText}>{confirmPasswordError}</Text>
                            </View>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={[styles.button, loading && styles.buttonDisabled]}
                          onPress={handleSignup}
                          disabled={loading}
                          activeOpacity={0.8}
                        >
                          {loading ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <>
                              <Text style={styles.buttonText}>{t('auth.login.button_create_account')}</Text>
                              <Ionicons name="arrow-forward" size={20} color="white" />
                            </>
                          )}
                        </TouchableOpacity>

                        {/* Quick Escape - Or continue with */}
                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <Text style={styles.dividerText}>{t('auth.login.divider_or_continue')}</Text>
                          <View style={styles.divider} />
                        </View>

                        {/* Compact Social Buttons */}
                        <View style={styles.compactSocialContainer}>
                          {Platform.OS === 'ios' && (
                            <TouchableOpacity
                              style={styles.compactAppleButton}
                              onPress={handleAppleSignIn}
                              disabled={loading}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="logo-apple" size={24} color="#000000" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.compactGoogleButton}
                            onPress={handleGoogleSignIn}
                            disabled={loading}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="logo-google" size={24} color="#DB4437" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
          </Animated.View>
        </SafeAreaView>

      {/* Toast Notifications */}
      <GlobalToast />

      {/* Auth Result Modal */}
      <AuthResultModal
        visible={showAuthModal}
        type={authModalType}
        title={authModalTitle}
        message={authModalMessage}
        userName={authModalUserName}
        onClose={() => setShowAuthModal(false)}
        autoCloseDelay={3000}
      />
    </View>
  );
};
