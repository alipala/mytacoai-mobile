import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface MicrophoneRipplesProps {
  isActive: boolean;
  size?: number;
  color?: string;
}

/**
 * Concentric Ripple Rings Animation
 *
 * Creates 3-4 expanding rings around the microphone
 * when the user is speaking. Provides visual feedback
 * for active voice input.
 */
const MicrophoneRipples: React.FC<MicrophoneRipplesProps> = ({
  isActive,
  size = 80,
  color = '#14B8A6',
}) => {
  // Ring animations (3 concentric rings)
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0);

  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0);

  const ring3Scale = useSharedValue(1);
  const ring3Opacity = useSharedValue(0);

  /**
   * Start/stop ripple animations based on active state
   */
  useEffect(() => {
    if (isActive) {
      // Ring 1 - fastest, smallest expansion
      ring1Scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.5, { duration: 1200, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      ring1Opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 100 }),
          withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      // Ring 2 - medium speed, medium expansion
      ring2Scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.7, { duration: 1400, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      ring2Opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 100 }),
          withTiming(0, { duration: 1300, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      // Ring 3 - slowest, largest expansion
      ring3Scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(2.0, { duration: 1600, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      ring3Opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 100 }),
          withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      // Reset animations when inactive
      ring1Scale.value = withTiming(1, { duration: 300 });
      ring1Opacity.value = withTiming(0, { duration: 300 });

      ring2Scale.value = withTiming(1, { duration: 300 });
      ring2Opacity.value = withTiming(0, { duration: 300 });

      ring3Scale.value = withTiming(1, { duration: 300 });
      ring3Opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  /**
   * Animated styles for each ring
   */
  const ring1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring1Scale.value }],
      opacity: ring1Opacity.value,
      borderColor: color,
    };
  });

  const ring2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring2Scale.value }],
      opacity: ring2Opacity.value,
      borderColor: color,
    };
  });

  const ring3Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ring3Scale.value }],
      opacity: ring3Opacity.value,
      borderColor: color,
    };
  });

  return (
    <>
      {/* Ring 3 (outermost) */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: '50%',
            left: '50%',
            marginTop: -size / 2,
            marginLeft: -size / 2,
          },
          ring3Style,
        ]}
      />

      {/* Ring 2 (middle) */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: '50%',
            left: '50%',
            marginTop: -size / 2,
            marginLeft: -size / 2,
          },
          ring2Style,
        ]}
      />

      {/* Ring 1 (innermost) */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: '50%',
            left: '50%',
            marginTop: -size / 2,
            marginLeft: -size / 2,
          },
          ring1Style,
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 3,
  },
});

export default MicrophoneRipples;
