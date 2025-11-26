import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { onboardingStorage } from '../Onboarding/utils/onboardingStorage';

const COLORS = {
  primary: '#4ECFBF',
  primaryDark: '#3a9e92',
  background: '#FFFFFF',
  textDark: '#1F2937',
  textMedium: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

export default function AuthChoiceScreen() {
  const navigation = useNavigation();
  const [tapCount, setTapCount] = useState(0);

  // Hidden feature: Triple-tap logo to reset onboarding (for testing)
  const handleLogoPress = async () => {
    setTapCount(prev => prev + 1);

    if (tapCount >= 2) {
      // Triple tap detected
      try {
        await onboardingStorage.resetOnboarding();
        Alert.alert(
          'Onboarding Reset',
          'Onboarding has been reset. Please restart the app to see the onboarding flow again.',
          [{ text: 'OK' }]
        );
        setTapCount(0);
      } catch (error) {
        console.error('Error resetting onboarding:', error);
      }
    }

    // Reset tap count after 1 second
    setTimeout(() => setTapCount(0), 1000);
  };

  const handleCreateAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // @ts-ignore - Navigate to Login screen with signup mode
    navigation.navigate('Login', { mode: 'signup' });
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // @ts-ignore - Navigate to Login screen
    navigation.navigate('Login');
  };

  const handleContinueAsGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // @ts-ignore - Navigate to Main app
    navigation.navigate('Main');
  };

  const handleGoogleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement Google Sign In
    console.log('Google Sign In pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo (Triple-tap to reset onboarding for testing) */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={handleLogoPress}
          activeOpacity={1}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Welcome Text */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome to{'\n'}Your Learning Journey</Text>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
            <Text style={styles.primaryButtonSubtext}>Start learning in 30 seconds</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSignIn}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
          <Text style={styles.secondaryButtonSubtext}>Already have an account?</Text>
        </TouchableOpacity>

        {/* Continue as Guest */}
        <TouchableOpacity
          style={styles.textButton}
          onPress={handleContinueAsGuest}
          activeOpacity={0.7}
        >
          <Text style={styles.textButtonText}>Continue as Guest</Text>
          <Text style={styles.textButtonSubtext}>Try one conversation first</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 40,
  },

  // Primary Button (Create Account)
  primaryButton: {
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Secondary Button (Sign In)
  secondaryButton: {
    height: 72,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMedium,
  },

  // Text Button (Guest)
  textButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  textButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMedium,
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  textButtonSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textLight,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textMedium,
  },

  // Google Button
  googleButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 12,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
