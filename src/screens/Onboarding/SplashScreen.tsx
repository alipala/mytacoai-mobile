/**
 * SplashScreen.tsx
 *
 * Initial splash screen shown when the app starts.
 * Displays the MyTaco AI logo with a fade-in animation
 * and automatically navigates to onboarding after 2 seconds.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { COLORS } from '../../constants/colors';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  // Animated value for fade-in effect
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds fade-in
      useNativeDriver: true,
    }).start();

    // Navigate to onboarding after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>MyTaco AI</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Speak Confidently</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.darkNavy,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginTop: 24,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textGray,
    marginTop: 8,
  },
});
