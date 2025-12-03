import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { ConversationState } from '../hooks/useConversationState';

interface AIVisualizationProps {
  state: ConversationState;
  size?: number;
}

/**
 * Central AI Orb Visualization
 *
 * An abstract, animated visualization that represents the AI's state
 * Inspired by premium voice AI apps
 */
const AIVisualization: React.FC<AIVisualizationProps> = ({
  state,
  size = 140,
}) => {
  // Animation progress
  const animationProgress = useSharedValue(0);

  // Scale animation
  const scaleAnim = useSharedValue(1);

  // Rotation animation
  const rotationAnim = useSharedValue(0);

  // Opacity animation
  const opacityAnim = useSharedValue(0.7);

  // Ring animations (3 concentric rings)
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);
  const ring3Scale = useSharedValue(1);

  const ring1Opacity = useSharedValue(0.6);
  const ring2Opacity = useSharedValue(0.4);
  const ring3Opacity = useSharedValue(0.2);

  /**
   * Update animations based on state
   */
  useEffect(() => {
    console.log('[AI_VIZ] State changed to:', state);

    switch (state) {
      case 'AI_SPEAKING':
        // Vibrant, active animation
        animationProgress.value = withRepeat(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );

        scaleAnim.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 500, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 500, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );

        rotationAnim.value = withRepeat(
          withTiming(360, { duration: 8000, easing: Easing.linear }),
          -1,
          false
        );

        // Rings pulse outward
        ring1Scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );

        ring2Scale.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 1200, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 1200, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );

        ring3Scale.value = withRepeat(
          withSequence(
            withTiming(1.7, { duration: 1400, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 1400, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );

        ring1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 1000 }),
            withTiming(0.3, { duration: 1000 })
          ),
          -1,
          false
        );

        ring2Opacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 1200 }),
            withTiming(0.2, { duration: 1200 })
          ),
          -1,
          false
        );

        ring3Opacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 1400 }),
            withTiming(0.1, { duration: 1400 })
          ),
          -1,
          false
        );

        opacityAnim.value = withTiming(1);
        break;

      case 'AI_LISTENING':
        // Calm, breathing animation
        animationProgress.value = withRepeat(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );

        scaleAnim.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        rotationAnim.value = withRepeat(
          withTiming(360, { duration: 15000, easing: Easing.linear }),
          -1,
          false
        );

        // Gentle ring pulsing
        ring1Scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 2500 }),
            withTiming(1, { duration: 2500 })
          ),
          -1,
          false
        );

        ring2Scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 3000 }),
            withTiming(1, { duration: 3000 })
          ),
          -1,
          false
        );

        ring3Scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 3500 }),
            withTiming(1, { duration: 3500 })
          ),
          -1,
          false
        );

        ring1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 2500 }),
            withTiming(0.3, { duration: 2500 })
          ),
          -1,
          false
        );

        ring2Opacity.value = withTiming(0.3);
        ring3Opacity.value = withTiming(0.2);

        opacityAnim.value = withTiming(0.85);
        break;

      case 'USER_SPEAKING':
        // Quick, responsive animation
        animationProgress.value = withRepeat(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );

        scaleAnim.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        );

        rotationAnim.value = withRepeat(
          withTiming(360, { duration: 10000, easing: Easing.linear }),
          -1,
          false
        );

        // Minimal ring animation
        ring1Scale.value = withTiming(1.05);
        ring2Scale.value = withTiming(1.08);
        ring3Scale.value = withTiming(1.1);

        ring1Opacity.value = withTiming(0.4);
        ring2Opacity.value = withTiming(0.25);
        ring3Opacity.value = withTiming(0.15);

        opacityAnim.value = withTiming(0.75);
        break;

      case 'AI_IDLE':
      case 'USER_IDLE':
      default:
        // Very subtle, almost static
        animationProgress.value = withRepeat(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );

        scaleAnim.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 3000 }),
            withTiming(1, { duration: 3000 })
          ),
          -1,
          false
        );

        rotationAnim.value = withRepeat(
          withTiming(360, { duration: 20000, easing: Easing.linear }),
          -1,
          false
        );

        ring1Scale.value = withTiming(1);
        ring2Scale.value = withTiming(1);
        ring3Scale.value = withTiming(1);

        ring1Opacity.value = withTiming(0.3);
        ring2Opacity.value = withTiming(0.2);
        ring3Opacity.value = withTiming(0.1);

        opacityAnim.value = withTiming(0.6);
        break;
    }
  }, [state]);

  /**
   * Color based on state
   */
  const getStateColor = () => {
    switch (state) {
      case 'AI_SPEAKING':
        return '#3B82F6'; // Blue
      case 'AI_LISTENING':
        return '#FB923C'; // Orange
      case 'USER_SPEAKING':
        return '#14B8A6'; // Teal
      case 'AI_IDLE':
      case 'USER_IDLE':
      default:
        return '#94A3B8'; // Slate
    }
  };

  /**
   * Animated styles
   */
  const orbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleAnim.value },
        { rotate: `${rotationAnim.value}deg` },
      ],
      opacity: opacityAnim.value,
    };
  });

  const ring1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring1Scale.value }],
      opacity: ring1Opacity.value,
    };
  });

  const ring2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring2Scale.value }],
      opacity: ring2Opacity.value,
    };
  });

  const ring3Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring3Scale.value }],
      opacity: ring3Opacity.value,
    };
  });

  const stateColor = getStateColor();

  return (
    <View style={styles.container}>
      {/* Outer ring (largest, most subtle) */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size * 0.9,
            borderColor: stateColor,
          },
          ring3Style,
        ]}
      />

      {/* Middle ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            borderColor: stateColor,
          },
          ring2Style,
        ]}
      />

      {/* Inner ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.15,
            height: size * 1.15,
            borderRadius: size * 0.575,
            borderColor: stateColor,
          },
          ring1Style,
        ]}
      />

      {/* Central orb */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: stateColor,
          },
          orbStyle,
        ]}
      >
        {/* Inner glow */}
        <View
          style={[
            styles.innerGlow,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  innerGlow: {
    width: '60%',
    height: '60%',
    borderRadius: 1000,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
});

export default AIVisualization;
