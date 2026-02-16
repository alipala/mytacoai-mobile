/**
 * ForgotPasswordScreen.tsx
 * Password reset request screen
 * 
 * Features:
 * - Email input for password reset
 * - Send reset link to email
 * - Success/error feedback
 * - Back to login navigation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthenticationService } from '../../api/generated';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ForgotPasswordScreen.styles';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetLink = async () => {
    // Validation
    if (!email) {
      Alert.alert(t('auth.forgot_password.error_title'), t('auth.forgot_password.error_email_required'));
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(t('auth.forgot_password.error_title'), t('auth.forgot_password.error_email_invalid'));
      return;
    }

    setLoading(true);

    try {
      // Call backend API
      await AuthenticationService.forgotPasswordApiAuthForgotPasswordPost({
        email: email.toLowerCase().trim(),
      });

      setEmailSent(true);

    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // Show generic message for security (don't reveal if email exists)
      Alert.alert(
        t('auth.forgot_password.alert_submitted_title'),
        t('auth.forgot_password.alert_submitted_message')
      );
      
      setEmailSent(true); // Still show success screen for security
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          {/* White Card Container */}
          <View style={styles.successCard}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={48} color="#14B8A6" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.successTitle}>{t('auth.forgot_password.success_title')}</Text>

            {/* Message */}
            <Text style={styles.successMessage}>
              {t('auth.forgot_password.success_message')}
            </Text>

            {/* Email */}
            <Text style={styles.emailText}>{email}</Text>

            {/* Instructions */}
            <Text style={styles.instructionsText}>
              {t('auth.forgot_password.success_instructions')}
            </Text>

            {/* Back to Login Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.primaryButtonText}>{t('auth.forgot_password.button_back')}</Text>
            </TouchableOpacity>

            {/* Resend Link */}
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}
            >
              <Text style={styles.resendButtonText}>{t('auth.forgot_password.button_resend')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLogin}
        >
          <Ionicons name="arrow-back" size={24} color="#14B8A6" />
          <Text style={styles.backButtonText}>{t('auth.forgot_password.button_back')}</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color="#14B8A6" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auth.forgot_password.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.forgot_password.subtitle')}
          </Text>

          {/* White Card Container */}
          <View style={styles.card}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.forgot_password.label_email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.forgot_password.placeholder_email')}
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                editable={!loading}
              />
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSendResetLink}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('auth.forgot_password.button_send')}</Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.35)" />
              <Text style={styles.helpText}>
                {t('auth.forgot_password.help_text')}{' '}
                <Text style={styles.loginLink} onPress={handleBackToLogin}>
                  {t('auth.forgot_password.link_signin')}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;