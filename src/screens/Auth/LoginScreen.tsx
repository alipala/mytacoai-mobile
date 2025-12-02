/**
 * Enhanced LoginScreen.tsx
 * Updated to match mytacoai.com design with tabs and Google Sign-In
 * 
 * CHANGES FROM ORIGINAL:
 * - Added tab navigation (Sign In / Sign Up)
 * - Updated colors to match mytacoai.com (teal instead of orange)
 * - Added Google Sign-In button
 * - Added Forgot Password link
 * - Improved styling to match website
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { authService } from '../../api/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthenticationService } from '../../api/generated';
import { styles } from './LoginScreen.styles';


export const LoginScreen = ({ navigation }: any) => {
  // Animation state
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  /**
   * Entrance animation on mount
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /**
   * Handle Email/Password Login
   */
  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔐 Attempting login...');
      
      // Call API using your existing authService
      await authService.login(email, password);
      
      // Get user data
      const user = await authService.getCurrentUser();
      
      console.log('✅ Login successful:', user.email);
      
      // Success - navigate to main app
      Alert.alert('Success', `Welcome back, ${user.email}!`);
      
      // Navigate to main app (Main)
      navigation.replace('Main'); // Update this to match your navigation
      
    } catch (error: any) {
      // Get status code from error
      const statusCode = error.status || error.response?.status;
      const errorDetail = error.response?.data?.detail || error.body?.detail || error.message;

      // 403 Forbidden = Email not verified (correct credentials but blocked)
      if (statusCode === 403) {
        console.log('ℹ️ Login attempt with unverified email:', email);
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Check your inbox for the verification link.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Resend Email',
              onPress: () => {
                // Navigate to verify email screen
                navigation.navigate('VerifyEmail', {
                  email: email.toLowerCase().trim(),
                });
              },
            },
          ]
        );
        return;
      }

      // 401 Unauthorized = Wrong credentials
      if (statusCode === 401) {
        console.log('ℹ️ Login attempt with invalid credentials');
        Alert.alert(
          'Invalid Credentials',
          'The email or password you entered is incorrect. Please try again.'
        );
        return;
      }

      // Other errors - these are unexpected, so log them
      console.error('❌ Unexpected login error:', error);
      const errorMessage = errorDetail || 'An error occurred. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Registration
   */
  const handleSignup = async () => {
    // Validation
    if (!fullName || !signupEmail || !signupPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!signupEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (signupPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (signupPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Register user
      await AuthenticationService.registerApiAuthRegisterPost({
        requestBody: {
          email: signupEmail.toLowerCase().trim(),
          password: signupPassword,
          name: fullName.trim(),
        },
      });

      console.log('✅ Registration successful:', signupEmail);

      // Clear signup form
      setFullName('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');

      // Navigate to email verification screen
      navigation.navigate('VerifyEmail', {
        email: signupEmail.toLowerCase().trim(),
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.status === 400) {
        errorMessage = 'This email is already registered';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Registration Failed', errorMessage);
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

        await GoogleSignin.configure({
        webClientId: '41687548204-0go9lqlnve4llpv3vdl48jujddlt2kp5.apps.googleusercontent.com',
        iosClientId: '41687548204-2gm0vhfjqub78lm5pqd7qh5drj6vmmrb.apps.googleusercontent.com',
        offlineAccess: true,
        });

        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();

        // Send token to backend
        const response = await AuthenticationService.googleLoginApiAuthGoogleLoginPost({
        requestBody: {
            token: tokens.idToken,
        },
        });

        // ✅ CORRECT - Store token directly from Google login response
        await AsyncStorage.setItem('auth_token', response.access_token);
        
        // Get user details
        const user = await AuthenticationService.getUserMeApiAuthMeGet();
        await AsyncStorage.setItem('user', JSON.stringify(user));

        console.log('✅ Google Sign-In successful:', user.email);

        // Navigate to Dashboard
        navigation.replace('Main');

    } catch (error: any) {
        console.error('Google Sign-In error:', error);
        
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
        } else {
        Alert.alert('Error', 'Google Sign-In failed. Please try again.');
        }
    } finally {
        setLoading(false);
    }
    };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Auth Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
                onPress={() => setActiveTab('signin')}
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
                onPress={() => setActiveTab('signup')}
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

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  autoComplete="email"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  autoComplete="password"
                />

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
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
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
                >
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
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

                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  autoComplete="email"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  secureTextEntry
                  editable={!loading}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                />

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
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
                >
                  <Text style={styles.googleButtonText}>Sign up with Google</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};
