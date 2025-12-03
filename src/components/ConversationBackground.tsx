import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ConversationState } from '../hooks/useConversationState';

interface ConversationBackgroundProps {
  state: ConversationState;
}

/**
 * Animated gradient background that responds to conversation state
 *
 * State colors:
 * - AI_SPEAKING: Vibrant blue gradient with subtle pulsing
 * - AI_LISTENING: Warm gradient (yellow/orange/coral) with breathing animation
 * - AI_IDLE: Neutral light-blue/grey with minimal motion
 * - USER_SPEAKING: Light turquoise with micro-pulse
 * - USER_IDLE: Clean neutral background
 */
const ConversationBackground: React.FC<ConversationBackgroundProps> = ({ state }) => {
  // Animation progress (0-1 loop)
  const animationProgress = useSharedValue(0);

  // Color transition progress (0-1)
  const colorTransition = useSharedValue(0);

  // Scale animation for breathing effect
  const breathingScale = useSharedValue(1);

  // Opacity animation for subtle glow
  const glowOpacity = useSharedValue(0.3);

  /**
   * State color definitions
   */
  const getStateColors = (currentState: ConversationState) => {
    switch (currentState) {
      case 'AI_SPEAKING':
        return {
          start: '#1E40AF', // Deep blue
          middle: '#3B82F6', // Bright blue
          end: '#60A5FA', // Light blue
          animationType: 'pulse', // Pulsing animation
        };

      case 'AI_LISTENING':
        return {
          start: '#F59E0B', // Amber
          middle: '#FB923C', // Orange
          end: '#FBBF24', // Yellow
          animationType: 'breathing', // Slow breathing animation
        };

      case 'USER_SPEAKING':
        return {
          start: '#06B6D4', // Cyan
          middle: '#14B8A6', // Teal
          end: '#10B981', // Emerald
          animationType: 'micro-pulse', // Small pulse
        };

      case 'AI_IDLE':
      case 'USER_IDLE':
      default:
        return {
          start: '#E0F2FE', // Very light blue
          middle: '#F0F9FF', // Almost white
          end: '#F9FAFB', // Neutral grey
          animationType: 'subtle', // Very minimal motion
        };
    }
  };

  /**
   * Update animations when state changes
   */
  useEffect(() => {
    const { animationType } = getStateColors(state);

    console.log('[CONVERSATION_BG] State changed to:', state, '- Animation:', animationType);

    // Smooth color transition
    colorTransition.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });

    // Start appropriate animation based on state
    switch (animationType) {
      case 'pulse':
        // Vibrant pulsing for AI speaking
        animationProgress.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite
          false
        );

        breathingScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;

      case 'breathing':
        // Slow, calm breathing for AI listening
        animationProgress.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        breathingScale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.2, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;

      case 'micro-pulse':
        // Quick, subtle pulse for user speaking
        animationProgress.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        breathingScale.value = withRepeat(
          withSequence(
            withTiming(1.01, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        glowOpacity.value = withTiming(0.25);
        break;

      case 'subtle':
      default:
        // Very minimal motion for idle states
        animationProgress.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        breathingScale.value = withTiming(1, { duration: 500 });
        glowOpacity.value = withTiming(0.15);
        break;
    }
  }, [state]);

  /**
   * Animated styles
   */
  const animatedContainerStyle = useAnimatedStyle(() => {
    const colors = getStateColors(state);

    return {
      transform: [{ scale: breathingScale.value }],
      opacity: 1,
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const colors = getStateColors(state);

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Base gradient */}
      <LinearGradient
        colors={[colors.start, colors.middle, colors.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Animated glow overlay */}
      <Animated.View style={[styles.glowOverlay, animatedGlowStyle]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.3)', 'transparent', 'rgba(255, 255, 255, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ConversationBackground;
