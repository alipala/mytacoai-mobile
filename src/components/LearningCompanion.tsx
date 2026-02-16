/**
 * LearningCompanion Component
 *
 * Persistent character that accompanies user through all challenges
 * Reacts to user actions with Lottie animations
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useCharacterState, CharacterState } from '../hooks/useCharacterState';

interface LearningCompanionProps {
  state?: CharacterState;
  combo?: number;
  style?: any;
  size?: number;
}

// Lottie animation sources
const COMPANION_ANIMATIONS: Record<CharacterState, any> = {
  idle: require('../assets/lottie/companion_idle2.json'),
  anticipation: require('../assets/lottie/companion_anticipation.json'),
  celebrate: require('../assets/lottie/companion_celebrate.json'),
  disappointed: require('../assets/lottie/companion_disappointed.json'),
  nervous: require('../assets/lottie/companion_anticipation.json'), // Use anticipation for now
  legendary: require('../assets/lottie/companion_legendary.json'),
};

// Animation should loop for these states
const LOOPING_STATES: CharacterState[] = ['idle', 'nervous', 'disappointed'];

export function LearningCompanion({
  state: externalState,
  combo = 1,
  style,
  size = 56,
}: LearningCompanionProps) {
  const { characterState, updateState } = useCharacterState({
    autoReturnToIdle: true,
    idleDelay: 600,
  });

  const lottieRef = useRef<LottieView>(null);

  // Use external state if provided, otherwise use internal hook state
  const currentState = externalState || characterState;

  // Animation shared values for additional effects
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Update external state
  useEffect(() => {
    if (externalState) {
      updateState(externalState);
    }
  }, [externalState]);

  // Play animation when state changes
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.reset();
      lottieRef.current.play();
    }

    // Keep all animations in the same position - no extra transforms
    // Reset to default position for all states
    scale.value = withSpring(1.0);
    translateY.value = withSpring(0);
    opacity.value = withTiming(1.0);
  }, [currentState]);

  // Scale based on combo (grows with streak)
  const comboScale = 1 + (Math.min(combo - 1, 10) * 0.05); // +5% per combo level

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * comboScale },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const containerSize = size * 1.5; // Extra space for animations
  const shouldLoop = LOOPING_STATES.includes(currentState);

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }, style]}>
      <Animated.View style={[styles.characterContainer, animatedStyle]}>
        {/* Lottie Animation */}
        <LottieView
          ref={lottieRef}
          source={COMPANION_ANIMATIONS[currentState]}
          style={{ width: size, height: size }}
          autoPlay
          loop={shouldLoop}
          speed={1}
        />
      </Animated.View>

      {/* Glow effect for high combos */}
      {combo >= 5 && (
        <View style={[styles.glow, { shadowColor: combo >= 10 ? '#FFD700' : '#3B82F6' }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboOverlay: {
    position: 'absolute',
    top: -15,
    right: -15,
  },
  comboAnimation: {
    width: 32,
    height: 32,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    zIndex: -1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
