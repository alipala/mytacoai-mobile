/**
 * WelcomeScreen.tsx
 *
 * Final screen after onboarding completion.
 * Provides options to login or create a new account.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  /**
   * Navigate to Login screen with smooth transition
   */
  const handleLogin = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Login');
    });
  };

  /**
   * Navigate to Signup (Login screen with signup tab active) with smooth transition
   */
  const handleCreateAccount = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Login');
    });
  };

  /**
   * Start practice session as guest (no login required)
   */
  const handleTryAsGuest = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to language selection to start practice flow
      navigation.replace('LanguageSelection');
    });
  };

  /**
   * Go back to onboarding (optional - allows users to review)
   */
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Welcome to MyTaco AI</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Start your free 2-minute practice session or create an account to save your progress
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons Container */}
        <View style={styles.buttonContainer}>
          {/* Try as Guest Button */}
          <TouchableOpacity style={styles.guestButton} onPress={handleTryAsGuest}>
            <Ionicons name="play-circle" size={24} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.guestButtonText}>START FREE PRACTICE</Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={handleCreateAccount}
          >
            <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  animatedContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  guestButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#F75A5A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#F75A5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createAccountButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F75A5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F75A5A',
  },
});
