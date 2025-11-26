/**
 * VerifyEmailScreen.tsx
 * Email verification screen shown after successful signup
 * Matches the mytacoai.com design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthenticationService } from '../../api/generated';
import { styles } from './VerifyEmailScreen.styles';

interface VerifyEmailScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
    };
  };
}

export const VerifyEmailScreen = ({ navigation, route }: VerifyEmailScreenProps) => {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  /**
   * Handle Resend Verification Email
   */
  const handleResendVerification = async () => {
    try {
      setLoading(true);

      await AuthenticationService.resendVerificationApiAuthResendVerificationPost({
        requestBody: {
          email: email,
        },
      });

      Alert.alert(
        'Email Sent',
        'Verification email has been resent. Please check your inbox.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Resend verification error:', error);

      let errorMessage = 'Failed to resend verification email. Please try again.';

      if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={64} color="#4FD1C5" />
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Check Your Email</Text>

          <Text style={styles.message}>
            We've sent a verification link to{' '}
            <Text style={styles.emailText}>{email}</Text>. Please check your
            email and click the link to verify your account.
          </Text>

          {/* Resend Verification Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResendVerification}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Resend Verification Email</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={handleBackToLogin}
            disabled={loading}
          >
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Tip Box */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipLabel}>Tip: </Text>
            <Text style={styles.tipText}>
              Check your spam folder if you don't see the email within a few minutes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen;
