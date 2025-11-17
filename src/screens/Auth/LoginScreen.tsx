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

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { authService } from '../../api/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthenticationService } from '../../api/generated';


export const LoginScreen = ({ navigation }: any) => {
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
      
      // Navigate to main app (Dashboard)
      navigation.replace('Dashboard'); // Update this to match your navigation
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || 'Please check your credentials and try again';
      
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
            name: fullName.trim(), // ✅ Use 'name' instead of 'full_name'
        },
        });

      Alert.alert(
        'Success',
        'Account created successfully! Please sign in.',
        [
          {
            text: 'OK',
            onPress: () => {
              setActiveTab('signin');
              setEmail(signupEmail);
              // Clear signup form
              setFullName('');
              setSignupEmail('');
              setSignupPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );

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
        navigation.replace('Dashboard');

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
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Title */}
          <View style={styles.logoContainer}>
            <Text style={styles.title}>MyTaco AI</Text>
            <Text style={styles.subtitle}>Language Learning</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#4FD1C5', // Changed from orange to teal
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#718096',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4FD1C5',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#4FD1C5',
    fontWeight: '600',
  },
  formContainer: {
    // Form content
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#4FD1C5', // Changed to teal
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2D3748',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4FD1C5',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4FD1C5', // Changed from orange to teal
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#718096',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '500',
  },
});