/**
 * WelcomeScreen.tsx
 *
 * Final screen after onboarding completion.
 * Provides options to login or create a new account.
 */

import React, { useRef, useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  // Greeting pairs for 6 languages
  const greetingPairs = [
    { first: 'Hello!', second: '¡Hola!' },      // English / Spanish
    { first: 'Bonjour!', second: 'Olá!' },      // French / Portuguese
    { first: 'Hallo!', second: 'Hoi!' },        // German / Dutch
  ];

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

    // Cycle through greeting pairs
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Change text
        setCurrentPairIndex((prev) => (prev + 1) % greetingPairs.length);

        // Fade in
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  /**
   * Navigate to Login screen with smooth cross-fade transition
   */
  const handleLogin = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Login');
    });
  };

  /**
   * Navigate to Signup (Login screen with signup tab active) with smooth cross-fade transition
   */
  const handleCreateAccount = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
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
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to language selection to start practice flow
      navigation.replace('LanguageSelection');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0B1A1F', '#0D2832', '#0B1A1F']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
          {/* Ambient glow — teal radial behind hero */}
          <View style={styles.ambientGlow} />

          {/* Content */}
          <View style={styles.content}>
            {/* Hero Icon Section */}
            <View style={styles.heroSection}>
              <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Animated.View style={[styles.iconPulse, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.iconCircle}>
                    {/* Chat Bubbles */}
                    <View style={styles.chatBubblesContainer}>
                      {/* First bubble - cycling greeting */}
                      <Animated.View style={[styles.chatBubble, styles.chatBubble1, { opacity: textFadeAnim }]}>
                        <Text style={styles.chatBubbleText}>{greetingPairs[currentPairIndex].first}</Text>
                      </Animated.View>
                      {/* Second bubble - cycling greeting */}
                      <Animated.View style={[styles.chatBubble, styles.chatBubble2, { opacity: textFadeAnim }]}>
                        <Text style={styles.chatBubbleText}>{greetingPairs[currentPairIndex].second}</Text>
                      </Animated.View>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              {/* Tagline */}
              <Text style={styles.tagline}>{t('onboarding.welcome.tagline')}</Text>

              {/* Title */}
              <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>

              {/* Benefit Pills */}
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitPill}>
                  <Ionicons name="albums-outline" size={16} color="#14B8A6" />
                  <Text style={styles.benefitText}>{t('onboarding.benefits.pill_smart_flashcards')}</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="ribbon-outline" size={16} color="#14B8A6" />
                  <Text style={styles.benefitText}>{t('onboarding.benefits.pill_personalised_learning')}</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="analytics-outline" size={16} color="#14B8A6" />
                  <Text style={styles.benefitText}>{t('onboarding.benefits.pill_adaptive_ai')}</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="list-outline" size={16} color="#14B8A6" />
                  <Text style={styles.benefitText}>{t('onboarding.benefits.pill_custom_topics')}</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="trending-up-outline" size={16} color="#14B8A6" />
                  <Text style={styles.benefitText}>{t('onboarding.benefits.pill_progress_tracking')}</Text>
                </View>
              </View>
            </View>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Buttons Container */}
            <View style={styles.buttonContainer}>
              {/* Start Free Practice Button — Teal gradient with glow */}
              <TouchableOpacity style={styles.guestButton} onPress={handleTryAsGuest} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#5EEAD4', '#14B8A6', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.guestButtonGradient}
                >
                  <Ionicons name="play-circle" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.guestButtonText}>{t('onboarding.welcome.button_start_free_practice')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Button — Dark glass with teal border */}
              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={handleCreateAccount}
                activeOpacity={0.8}
              >
                <Text style={styles.createAccountButtonText}>{t('onboarding.welcome.button_login')}</Text>
              </TouchableOpacity>

              {/* Reassurance Text */}
              <Text style={styles.reassurance}>{t('onboarding.welcome.reassurance')}</Text>
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
    backgroundColor: '#0B1A1F',
  },
  gradient: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // Ambient teal glow behind hero — atmospheric depth
  ambientGlow: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 50,
    elevation: 0,
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
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  chatBubblesContainer: {
    width: 80,
    height: 60,
    position: 'relative',
  },
  chatBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  chatBubble1: {
    top: 0,
    left: 0,
    transform: [{ rotate: '-5deg' }],
  },
  chatBubble2: {
    bottom: 0,
    right: 0,
    transform: [{ rotate: '5deg' }],
  },
  chatBubbleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5EEAD4',
  },
  textContent: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14B8A6',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 36,
  },
  benefitsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  benefitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B4E4DD',
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  // Outer wrapper with teal glow shadow
  guestButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  // Inner gradient fill
  guestButtonGradient: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  // Login button — dark glassmorphic with teal border
  createAccountButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14B8A6',
  },
  reassurance: {
    fontSize: 12,
    color: '#6B8A84',
    textAlign: 'center',
    marginTop: 4,
  },
});
