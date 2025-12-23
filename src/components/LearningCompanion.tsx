/**
 * LearningCompanion Component
 *
 * Persistent character that accompanies user through all challenges
 * Reacts to user actions with animations and expressions
 *
 * Currently using animated emoji - can be upgraded to Lottie animations
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useCharacterState, CharacterState } from '../hooks/useCharacterState';
import { createBreathingAnimation } from '../animations/UniversalFeedback';

interface LearningCompanionProps {
  state?: CharacterState;
  combo?: number;
  style?: any;
  size?: number;
}

// Emoji map for different states
const COMPANION_EMOJIS: Record<CharacterState, string> = {
  idle: '🌮', // Taco mascot
  anticipation: '👀',
  celebrate: '🎉',
  disappointed: '😔',
  nervous: '😰',
  legendary: '👑',
};

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

  // Use external state if provided, otherwise use internal hook state
  const currentState = externalState || characterState;

  // Animation shared values
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Update external state
  useEffect(() => {
    if (externalState) {
      updateState(externalState);
    }
  }, [externalState]);

  // React to state changes with animations
  useEffect(() => {
    switch (currentState) {
      case 'idle':
        // Breathing animation
        scale.value = createBreathingAnimation(1.0);
        rotateZ.value = 0;
        translateY.value = 0;
        opacity.value = 1;
        break;

      case 'anticipation':
        // Lean forward, freeze
        scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
        rotateZ.value = withSpring(5, { damping: 15, stiffness: 200 });
        break;

      case 'celebrate':
        // Jump and spin!
        scale.value = withSequence(
          withSpring(1.4, { damping: 5, stiffness: 200 }),
          withSpring(1.1, { damping: 10, stiffness: 150 }),
          withSpring(1.0, { damping: 12, stiffness: 120 })
        );

        rotateZ.value = withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(360, { duration: 400, easing: Easing.out(Easing.back(1.5)) })
        );

        translateY.value = withSequence(
          withSpring(-30, { damping: 8, stiffness: 200 }),
          withSpring(0, { damping: 10, stiffness: 150 })
        );
        break;

      case 'disappointed':
        // Shrink and droop
        scale.value = withSequence(
          withTiming(0.85, { duration: 200 }),
          withSpring(0.95, { damping: 15, stiffness: 200 })
        );

        translateY.value = withSpring(5, { damping: 15, stiffness: 200 });
        opacity.value = withSequence(
          withTiming(0.7, { duration: 200 }),
          withTiming(1.0, { duration: 300 })
        );
        break;

      case 'nervous':
        // Rapid shake
        scale.value = withRepeat(
          withSequence(
            withTiming(1.03, { duration: 100 }),
            withTiming(0.97, { duration: 100 })
          ),
          -1,
          true
        );

        rotateZ.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 150 }),
            withTiming(3, { duration: 150 })
          ),
          -1,
          true
        );
        break;

      case 'legendary':
        // Epic celebration with crown
        scale.value = withSequence(
          withSpring(1.5, { damping: 5, stiffness: 200 }),
          withSpring(1.25, { damping: 8, stiffness: 150 })
        );

        rotateZ.value = withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(360, { duration: 600, easing: Easing.out(Easing.back(2)) })
        );

        translateY.value = withSequence(
          withSpring(-40, { damping: 8, stiffness: 200 }),
          withSpring(0, { damping: 10, stiffness: 150 })
        );
        break;
    }
  }, [currentState]);

  // Scale based on combo (grows with streak)
  const comboScale = 1 + (Math.min(combo - 1, 10) * 0.05); // +5% per combo level

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * comboScale },
      { rotateZ: `${rotateZ.value}deg` },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const containerSize = size * 1.5; // Extra space for animations

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }, style]}>
      <Animated.View style={[styles.characterContainer, animatedStyle]}>
        {/* Emoji character */}
        <Text style={[styles.emoji, { fontSize: size }]}>
          {COMPANION_EMOJIS[currentState]}
        </Text>

        {/* Combo flame overlay for streaks */}
        {combo >= 3 && (
          <View style={styles.comboFlame}>
            <Text style={styles.flameEmoji}>
              {combo >= 10 ? '👑' : combo >= 7 ? '🌟' : combo >= 5 ? '⚡' : '🔥'}
            </Text>
          </View>
        )}
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
  emoji: {
    textAlign: 'center',
  },
  comboFlame: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  flameEmoji: {
    fontSize: 24,
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
