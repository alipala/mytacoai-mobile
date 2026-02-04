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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  /**
   * Handle Resend Verification Email
   */
  const handleResendVerification = async () => {
    try {
      setLoading(true);

      await AuthenticationService.resendVerificationApiAuthResendVerificationPost({
        email: email,
      });

      Alert.alert(
        t('auth.verification.alert_sent_title'),
        t('auth.verification.alert_sent_message'),
        [{ text: t('auth.verification.alert_ok') }]
      );
    } catch (error: any) {
      console.error('Resend verification error:', error);

      let errorMessage = t('auth.verification.error_resend_failed');

      if (error.status === 429) {
        errorMessage = t('auth.verification.error_rate_limit');
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(t('auth.verification.alert_error_title'), errorMessage);
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
          <Text style={styles.title}>{t('auth.verification.title')}</Text>

          <Text style={styles.message}>
            {t('auth.verification.message_part1')}{' '}
            <Text style={styles.emailText}>{email}</Text>. {t('auth.verification.message_part2')}
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
              <Text style={styles.buttonText}>{t('auth.verification.button_resend')}</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={handleBackToLogin}
            disabled={loading}
          >
            <Text style={styles.linkText}>{t('auth.verification.button_back')}</Text>
          </TouchableOpacity>

          {/* Tip Box */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipLabel}>{t('auth.verification.tip_label')} </Text>
            <Text style={styles.tipText}>
              {t('auth.verification.tip_text')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen;
