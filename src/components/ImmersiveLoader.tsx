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

const { width, height } = Dimensions.get('window');

interface ImmersiveLoaderProps {
  message?: string;
}

export default function ImmersiveLoader({ message = 'Loading your progress...' }: ImmersiveLoaderProps) {
  // Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim3 = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Rotating circle
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing circles (staggered)
    const pulseAnimation = (animValue: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.8,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    pulseAnimation(scaleAnim1, 0);
    pulseAnimation(scaleAnim2, 200);
    pulseAnimation(scaleAnim3, 400);

    // Animated dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Spinning rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Animated dots text
  const getDots = () => {
    const dotCount = Math.floor(dotsAnim._value);
    return '.'.repeat(dotCount);
  };

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <LinearGradient
        colors={['#FFF5F0', '#FFF9E6', '#F0FFFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated circles */}
        <View style={styles.circlesContainer}>
          <Animated.View
            style={[
              styles.circle,
              styles.circle1,
              {
                transform: [{ scale: scaleAnim1 }, { rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={['#4ECFBF', '#14B8A6']}
              style={styles.circleGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.circle,
              styles.circle2,
              {
                transform: [{ scale: scaleAnim2 }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFA955', '#F97316']}
              style={styles.circleGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.circle,
              styles.circle3,
              {
                transform: [{ scale: scaleAnim3 }],
              },
            ]}
          >
            <LinearGradient
              colors={['#F75A5A', '#EF4444']}
              style={styles.circleGradient}
            />
          </Animated.View>
        </View>

        {/* Loading text */}
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>{message}</Text>
          <Text style={styles.dots}>{getDots()}</Text>
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
  circlesContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  circle1: {
    width: 100,
    height: 100,
    opacity: 0.3,
  },
  circle2: {
    width: 70,
    height: 70,
    opacity: 0.5,
  },
  circle3: {
    width: 40,
    height: 40,
    opacity: 0.8,
  },
  circleGradient: {
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  dots: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    minWidth: 30,
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
