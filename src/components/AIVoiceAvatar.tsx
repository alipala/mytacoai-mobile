import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ConversationState } from '../hooks/useConversationState';

interface AIVoiceAvatarProps {
  voice: string;
  state: ConversationState;
  size?: number;
}

/**
 * Voice color mapping based on voice personality
 */
const VOICE_COLORS: Record<string, string> = {
  alloy: '#8B5CF6', // Purple
  ash: '#F59E0B', // Amber
  ballad: '#EC4899', // Pink
  coral: '#F97316', // Orange
  echo: '#14B8A6', // Teal
  sage: '#10B981', // Emerald
  shimmer: '#3B82F6', // Blue
  verse: '#6366F1', // Indigo
};

/**
 * Voice avatar image mapping
 */
const VOICE_AVATARS: Record<string, any> = {
  alloy: require('../assets/tutor/alloy.png'),
  ash: require('../assets/tutor/ash.png'),
  ballad: require('../assets/tutor/ballad.png'),
  coral: require('../assets/tutor/coral.png'),
  echo: require('../assets/tutor/echo.png'),
  sage: require('../assets/tutor/sage.png'),
  shimmer: require('../assets/tutor/shimmer.png'),
  verse: require('../assets/tutor/verse.png'),
  nova: require('../assets/tutor/nova.png'),
  onyx: require('../assets/tutor/onyx.png'),
};

/**
 * AI Voice Avatar with Animated Rings
 *
 * Shows the selected AI voice avatar with animated concentric rings
 * that respond to conversation state
 */
const AIVoiceAvatar: React.FC<AIVoiceAvatarProps> = ({
  voice,
  state,
  size = 40,
}) => {
  // Ring animations (2 rings for header - simpler than orb)
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.4);

  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.2);

  // Avatar pulse animation
  const avatarScale = useSharedValue(1);

  /**
   * Update animations based on conversation state
   */
  useEffect(() => {
    switch (state) {
      case 'AI_SPEAKING':
        // Active pulsing when AI speaks
        ring1Scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 800, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );

        ring2Scale.value = withRepeat(
          withSequence(
            withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );

        ring1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 800 }),
            withTiming(0.2, { duration: 800 })
          ),
          -1,
          false
        );

        ring2Opacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 1000 }),
            withTiming(0.1, { duration: 1000 })
          ),
          -1,
          false
        );

        avatarScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          false
        );
        break;

      case 'AI_LISTENING':
        // Gentle breathing when listening
        ring1Scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        ring2Scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );

        ring1Opacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 2000 }),
            withTiming(0.3, { duration: 2000 })
          ),
          -1,
          false
        );

        ring2Opacity.value = withTiming(0.2);

        avatarScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
          ),
          -1,
          false
        );
        break;

      case 'USER_SPEAKING':
        // Minimal animation when user speaks
        ring1Scale.value = withTiming(1.1);
        ring2Scale.value = withTiming(1.2);

        ring1Opacity.value = withTiming(0.3);
        ring2Opacity.value = withTiming(0.15);

        avatarScale.value = withTiming(1);
        break;

      case 'AI_IDLE':
      case 'USER_IDLE':
      default:
        // Very subtle idle state
        ring1Scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 3000 }),
            withTiming(1, { duration: 3000 })
          ),
          -1,
          false
        );

        ring2Scale.value = withTiming(1);

        ring1Opacity.value = withTiming(0.25);
        ring2Opacity.value = withTiming(0.1);

        avatarScale.value = withTiming(1);
        break;
    }
  }, [state]);

  /**
   * Animated styles
   */
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

  const avatarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: avatarScale.value }],
    };
  });

  const voiceColor = VOICE_COLORS[voice] || '#8B5CF6';
  const avatarImage = VOICE_AVATARS[voice] || VOICE_AVATARS.alloy;

  return (
    <View style={styles.container}>
      {/* Outer ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size * 0.9,
            borderColor: voiceColor,
          },
          ring2Style,
        ]}
      />

      {/* Inner ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            borderColor: voiceColor,
          },
          ring1Style,
        ]}
      />

      {/* Avatar circle with actual tutor image */}
      <Animated.View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
          },
          avatarStyle,
        ]}
      >
        <Image
          source={avatarImage}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
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
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  avatar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default AIVoiceAvatar;
