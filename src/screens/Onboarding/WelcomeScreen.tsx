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
import { COLORS } from '../../constants/colors';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
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
        colors={['#FFFFFF', '#F0FDFC']}
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
              <Text style={styles.tagline}>Practice Languages Naturally</Text>

              {/* Title */}
              <Text style={styles.title}>Start Speaking with Confidence</Text>

              {/* Benefit Pills */}
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitPill}>
                  <Ionicons name="albums-outline" size={16} color="#4ECFBF" />
                  <Text style={styles.benefitText}>Smart Flashcards</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="ribbon-outline" size={16} color="#4ECFBF" />
                  <Text style={styles.benefitText}>Personalised Learning</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="analytics-outline" size={16} color="#4ECFBF" />
                  <Text style={styles.benefitText}>Adaptive AI</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="list-outline" size={16} color="#4ECFBF" />
                  <Text style={styles.benefitText}>Custom Topics</Text>
                </View>
                <View style={styles.benefitPill}>
                  <Ionicons name="trending-up-outline" size={16} color="#4ECFBF" />
                  <Text style={styles.benefitText}>Progress Tracking</Text>
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
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  chatBubblesContainer: {
    width: 80,
    height: 60,
    position: 'relative',
  },
  chatBubble: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#4ECFBF',
  },
  textContent: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECFBF',
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
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  benefitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitText: {
    fontSize: 12,
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
    backgroundColor: '#4ECFBF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#4ECFBF',
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
    borderColor: '#4ECFBF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ECFBF',
  },
  reassurance: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
