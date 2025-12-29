/**
 * Immersive Loader Component
 *
 * Custom loading animation matching the app's design language
 * Inspired by Duolingo's engaging loading states
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface ImmersiveLoaderProps {
  message?: string;
}

export default function ImmersiveLoader({ message = 'Loading your progress...' }: ImmersiveLoaderProps) {
  // Animations
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <LinearGradient
        colors={['#FFF5F0', '#FFF9E6', '#F0FFFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Lottie Animation */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../assets/lottie/loading.json')}
            autoPlay
            loop
            style={{ width: 240, height: 240 }}
          />
        </View>

        {/* Loading text */}
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>{message}</Text>
        </View>

        {/* Fun motivational messages */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipEmoji}>✨</Text>
          <Text style={styles.tipText}>Get ready for your learning adventure!</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: width * 0.8,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
});
