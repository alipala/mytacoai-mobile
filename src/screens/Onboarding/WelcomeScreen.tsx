/**
 * WelcomeScreen.tsx
 *
 * Final screen after onboarding completion.
 * Provides options to login or create a new account.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for hero icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale in animation on mount
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5F5']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
          {/* Content */}
          <View style={styles.content}>
            {/* Hero Icon Section */}
            <View style={styles.heroSection}>
              <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Animated.View style={[styles.iconPulse, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="mic-outline" size={64} color="#F75A5A" />
                  </View>
                </Animated.View>
              </Animated.View>
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              {/* Tagline */}
              <Text style={styles.tagline}>Practice Languages Naturally</Text>

              {/* Title */}
              <Text style={styles.title}>Start Speaking with Confidence</Text>

              {/* Benefit Pills */}
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitPill}>
                  <Ionicons name="time-outline" size={16} color="#F75A5A" />
                  <Text style={styles.benefitText}>2-Min Sessions</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="sparkles-outline" size={16} color="#F75A5A" />
                  <Text style={styles.benefitText}>AI Feedback</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="gift-outline" size={16} color="#F75A5A" />
                  <Text style={styles.benefitText}>100% Free</Text>
                </View>
              </View>
            </View>

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

              {/* Reassurance Text */}
              <Text style={styles.reassurance}>No credit card required</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradient: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F75A5A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  textContent: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F75A5A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 36,
  },
  benefitsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  benefitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
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
  reassurance: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
