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
import Toast from 'react-native-toast-message';
import { authService } from '../../api/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthenticationService } from '../../api/generated';
import { styles } from './LoginScreen.styles';


export const LoginScreen = ({ navigation }: any) => {
  // Animation state
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Sign Up form state
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Toast.show({
        type: 'success',
        text1: 'Welcome Back! 🎉',
        text2: `Great to see you again, ${user.first_name || user.email}!`,
        visibilityTime: 3000,
      });

      setTimeout(() => {
        navigation.replace('Main');
      }, 500);

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const statusCode = error.status || error.response?.status;
      const errorDetail = error.response?.data?.detail || error.body?.detail || error.message;

      if (statusCode === 403) {
        Toast.show({
          type: 'error',
          text1: 'Email Not Verified',
          text2: 'Please check your inbox for the verification link.',
          visibilityTime: 4000,
        });

        setTimeout(() => {
          navigation.navigate('VerifyEmail', {
            email: email.toLowerCase().trim(),
          });
        }, 2000);
        return;
      }

      if (statusCode === 401) {
        setPasswordError('Invalid email or password');
        Toast.show({
          type: 'error',
          text1: 'Invalid Credentials',
          text2: 'Please check your email and password.',
          visibilityTime: 3000,
        });
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorDetail || 'An error occurred. Please try again.',
        visibilityTime: 4000,
      });
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
        requestBody: {
          email: signupEmail.toLowerCase().trim(),
          password: signupPassword,
          name: fullName.trim(),
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Toast.show({
        type: 'success',
        text1: 'Account Created! 🎉',
        text2: 'Please check your email to verify your account.',
        visibilityTime: 4000,
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

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
        visibilityTime: 4000,
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
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await GoogleSignin.configure({
        webClientId: '41687548204-0go9lqlnve4llpv3vdl48jujddlt2kp5.apps.googleusercontent.com',
        iosClientId: '41687548204-2gm0vhfjqub78lm5pqd7qh5drj6vmmrb.apps.googleusercontent.com',
        offlineAccess: true,
      });

      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const response = await AuthenticationService.googleLoginApiAuthGoogleLoginPost({
        requestBody: {
          token: tokens.idToken,
        },
      });

      await AsyncStorage.setItem('auth_token', response.access_token);
      const user = await AuthenticationService.getUserMeApiAuthMeGet();
      await AsyncStorage.setItem('user', JSON.stringify(user));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Toast.show({
        type: 'success',
        text1: 'Welcome! 🎉',
        text2: `Signed in as ${user.email}`,
        visibilityTime: 3000,
      });

      setTimeout(() => {
        navigation.replace('Main');
      }, 500);

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled - no error message needed
      } else {
        Toast.show({
          type: 'error',
          text1: 'Google Sign-In Failed',
          text2: 'Please try again or use email sign-in.',
          visibilityTime: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D9488', '#14B8A6', '#2DD4BF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
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
                  source={require('../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.logoTagline}>More Than a Language Coach</Text>
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
                      Sign In
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
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Form */}
                {activeTab === 'signin' && (
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Welcome Back</Text>
                    <Text style={styles.formSubtitle}>
                      Sign in to continue your language learning journey
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
                          <Text style={styles.buttonText}>Sign In</Text>
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

                {/* Sign Up Form */}
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

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>Or continue with</Text>
                      <View style={styles.divider} />
                    </View>

                    {/* Google Sign-Up Button */}
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
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </LinearGradient>

      {/* Toast Notifications */}
      <Toast />
    </SafeAreaView>
  );
};
