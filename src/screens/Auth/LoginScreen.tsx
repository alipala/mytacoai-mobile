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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { showToast, GlobalToast } from '../../components/CustomToast';
import { authService } from '../../api/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthenticationService } from '../../api/generated';
import { styles } from './LoginScreen.styles';
import { AuthResultModal } from '../../components/AuthResultModal';


export const LoginScreen = ({ navigation }: any) => {
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
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const validateSignUpForm = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError('Please enter your full name');
      isValid = false;
    } else {
      setFullNameError('');
    }

    if (!signupEmail.trim()) {
      setSignupEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(signupEmail)) {
      setSignupEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setSignupEmailError('');
    }

    if (!signupPassword) {
      setSignupPasswordError('Password is required');
      isValid = false;
    } else if (signupPassword.length < 8) {
      setSignupPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setSignupPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (signupPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
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

      // Show beautiful success modal
      setAuthModalType('success');
      setAuthModalTitle('Welcome Back!');
      setAuthModalMessage('Great to see you again! Loading your dashboard...');
      setAuthModalUserName(user.name || user.email?.split('@')[0] || '');
      setShowAuthModal(true);

      setTimeout(() => {
        navigation.replace('Main');
      }, 3000);

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const statusCode = error.status || error.response?.status;
      const errorDetail = error.response?.data?.detail || error.body?.detail || error.message;

      if (statusCode === 403) {
        setAuthModalType('error');
        setAuthModalTitle('Email Not Verified');
        setAuthModalMessage('Please check your inbox for the verification link. Redirecting...');
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
        setPasswordError('Invalid email or password');
        setAuthModalType('error');
        setAuthModalTitle('Invalid Credentials');
        setAuthModalMessage('Please check your email and password and try again.');
        setAuthModalUserName('');
        setShowAuthModal(true);
        return;
      }

      setAuthModalType('error');
      setAuthModalTitle('Login Failed');
      setAuthModalMessage(errorDetail || 'An error occurred. Please try again.');
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
        text1: 'Account Created! 🎉',
        text2: 'Please check your email to verify your account.',
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

      let errorMessage = 'Registration failed. Please try again.';

      if (error.status === 400) {
        errorMessage = 'This email is already registered';
        setSignupEmailError(errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: 'error',
        text1: 'Registration Failed',
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

      console.log('🔐 Initiating sign-in...');
      await GoogleSignin.signIn();

      console.log('🎫 Getting tokens...');
      const tokens = await GoogleSignin.getTokens();
      console.log('✅ Got tokens:', tokens.idToken ? 'idToken present' : 'NO idToken');

      console.log('📡 Calling backend API...');
      const response = await AuthenticationService.googleLoginApiAuthGoogleLoginPost({
        token: tokens.idToken,
      });
      console.log('✅ Backend response received:', response.access_token ? 'token present' : 'NO token');

      console.log('💾 Storing auth token...');
      await AsyncStorage.setItem('auth_token', response.access_token);

      console.log('👤 Fetching user info...');
      const user = await AuthenticationService.getUserMeApiAuthMeGet();
      console.log('✅ User info received:', user.email);

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_provider', 'google');

      // Show beautiful success modal
      setAuthModalType('success');
      setAuthModalTitle('Welcome!');
      setAuthModalMessage('Successfully signed in with Google. Loading your dashboard...');
      setAuthModalUserName(user.name || user.email?.split('@')[0] || '');
      setShowAuthModal(true);

      console.log('🧭 Navigating to Main screen...');
      setTimeout(() => {
        navigation.replace('Main');
        console.log('✅ Navigation complete');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User cancelled sign-in');
        // User cancelled - no error message needed
      } else {
        setAuthModalType('error');
        setAuthModalTitle('Google Sign-In Failed');
        setAuthModalMessage(error.message || 'Please try again or use email sign-in.');
        setAuthModalUserName('');
        setShowAuthModal(true);
      }
    } finally {
      console.log('🏁 Google Sign-In flow finished');
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
      setEmailError('Please enter a valid email address');
    }
  };

  /**
   * Handle Email Blur - Create Account
   */
  const handleSignupEmailBlur = () => {
    if (signupEmail.trim() && !validateEmailFormat(signupEmail)) {
      setSignupEmailError('Please enter a valid email address');
    }
  };

  // Wait for fonts to load
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D9488', '#14B8A6', '#2DD4BF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
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
                      Login
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
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Form */}
                {activeTab === 'signin' && (
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Welcome Back</Text>
                    <Text style={styles.formSubtitle}>
                      Log in to continue your language learning journey
                    </Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                        <Ionicons name="mail-outline" size={20} color={emailError ? '#EF4444' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Email"
                          placeholderTextColor="#9CA3AF"
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
                        <Ionicons name="lock-closed-outline" size={20} color={passwordError ? '#EF4444' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor="#9CA3AF"
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
                            color="#9CA3AF"
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
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
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
                          <Text style={styles.buttonText}>Login</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>Or continue with</Text>
                      <View style={styles.divider} />
                    </View>

                    {/* Google Sign-In Button */}
                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={handleGoogleSignIn}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-google" size={20} color="#DB4437" />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Create Account Form */}
                {activeTab === 'signup' && (
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Create Your Account</Text>
                    <Text style={styles.formSubtitle}>
                      Join us and start learning languages today
                    </Text>

                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                      <View style={[styles.inputWrapper, fullNameError && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color={fullNameError ? '#EF4444' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Full Name"
                          placeholderTextColor="#9CA3AF"
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
                        <Ionicons name="mail-outline" size={20} color={signupEmailError ? '#EF4444' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Email"
                          placeholderTextColor="#9CA3AF"
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
                        <Ionicons name="lock-closed-outline" size={20} color={signupPasswordError ? '#EF4444' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Password (min. 8 characters)"
                          placeholderTextColor="#9CA3AF"
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
                            color="#9CA3AF"
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
                        <Ionicons name="lock-closed-outline" size={20} color={confirmPasswordError ? '#EF4444' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Confirm Password"
                          placeholderTextColor="#9CA3AF"
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
                            color="#9CA3AF"
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
                          <Text style={styles.buttonText}>Create Account</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

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
