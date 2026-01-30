/**
 * Immersive Loader Component - Dark Theme
 *
 * Custom loading animation matching the app's dark theme design language
 * Features elegant glassmorphic elements and teal accents
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface ImmersiveLoaderProps {
  message?: string;
  isVisible?: boolean;
  onFadeOutComplete?: () => void;
}

// Sparkle positions for random AI sparkle effect
const SPARKLE_POSITIONS = [
  { top: '15%', left: '10%' },
  { top: '20%', right: '15%' },
  { top: '70%', left: '20%' },
  { top: '75%', right: '10%' },
  { top: '40%', left: '5%' },
  { top: '50%', right: '8%' },
];

export default function ImmersiveLoader({
  message = 'Loading your progress...',
  isVisible = true,
  onFadeOutComplete
}: ImmersiveLoaderProps) {
  // Animations
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [sparkles, setSparkles] = useState<Array<{ id: number; position: any; anim: Animated.Value }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Create random sparkles
      const sparkleInterval = setInterval(() => {
        const randomPosition = SPARKLE_POSITIONS[Math.floor(Math.random() * SPARKLE_POSITIONS.length)];
        const sparkleAnim = new Animated.Value(0);
        const sparkleId = Date.now();

        setSparkles(prev => [...prev, { id: sparkleId, position: randomPosition, anim: sparkleAnim }]);

        // Animate sparkle: fade in, scale up, fade out
        Animated.sequence([
          Animated.parallel([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Remove sparkle after animation
          setSparkles(prev => prev.filter(s => s.id !== sparkleId));
        });
      }, 800); // New sparkle every 800ms

      return () => clearInterval(sparkleInterval);
    } else {
      // Fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onFadeOutComplete) {
          onFadeOutComplete();
        }
      });
    }
  }, [isVisible]);

  return (
    <Animated.View
      style={[styles.container, { opacity: opacityAnim }]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <LinearGradient
        colors={['#0B1A1F', '#0F2832', '#0B1A1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Random AI Sparkles */}
        {sparkles.map((sparkle) => (
          <Animated.View
            key={sparkle.id}
            style={[
              styles.sparkle,
              sparkle.position,
              {
                opacity: sparkle.anim,
                transform: [
                  {
                    scale: sparkle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="sparkles" size={24} color="#14B8A6" />
          </Animated.View>
        ))}

        {/* Lottie Animation with Glow Effect */}
        <View style={styles.lottieWrapper}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../assets/lottie/loading.json')}
              autoPlay
              loop
              style={{ width: 260, height: 260 }}
            />
          </View>
        </View>

        {/* Loading text */}
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>{message}</Text>
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
    position: 'relative',
  },
  // Random AI Sparkles
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
  // Lottie Animation Wrapper with Glow
  lottieWrapper: {
    marginBottom: 60,
  },
  lottieContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 30,
  },
  // Text Container
  textContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
