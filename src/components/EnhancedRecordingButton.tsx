import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ConversationState } from '../hooks/useConversationState';
import MicrophoneRipples from './MicrophoneRipples';

interface EnhancedRecordingButtonProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
  conversationState: ConversationState;
}

/**
 * Enhanced Recording Button with State-Aware Animations
 *
 * Features:
 * - Dynamic colors based on conversation state
 * - Pulsing animations
 * - Wave rings when speaking
 * - Smooth transitions
 */
const EnhancedRecordingButton: React.FC<EnhancedRecordingButtonProps> = ({
  isRecording,
  onPress,
  disabled = false,
  conversationState,
}) => {
  // Animation values
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  /**
   * Button animations based on state
   */
  useEffect(() => {
    if (isRecording) {
      // Active recording - subtle pulsing animation
      buttonScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      // Idle state - reset animations
      buttonScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording]);

  /**
   * Pulse effect when AI is speaking
   */
  useEffect(() => {
    if (conversationState === 'AI_SPEAKING') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [conversationState]);

  /**
   * Button color based on state
   */
  const getButtonColor = () => {
    if (isRecording) {
      return '#EF4444'; // Red when recording
    }

    switch (conversationState) {
      case 'AI_SPEAKING':
        return '#3B82F6'; // Blue when AI speaks
      case 'AI_LISTENING':
        return '#FB923C'; // Orange when AI listens
      case 'USER_SPEAKING':
        return '#14B8A6'; // Teal when user speaks
      default:
        return '#14B8A6'; // Default teal
    }
  };

  /**
   * Button text based on state
   */
  const getButtonText = () => {
    if (isRecording) {
      return 'Tap to stop';
    }

    switch (conversationState) {
      case 'AI_SPEAKING':
        return 'AI is speaking...';
      case 'AI_LISTENING':
        return 'AI is listening...';
      default:
        return 'Tap to speak';
    }
  };

  /**
   * Animated styles
   */
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: buttonScale.value },
        { scale: pulseScale.value },
      ],
    };
  });

  const buttonColor = getButtonColor();
  const buttonText = getButtonText();

  return (
    <View style={styles.container}>
      {/* Concentric ripples when user is speaking */}
      <MicrophoneRipples
        isActive={conversationState === 'USER_SPEAKING'}
        size={80}
        color={buttonColor}
      />

      {/* Main button */}
      <Animated.View style={buttonAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: buttonColor,
              shadowColor: buttonColor,
            },
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={32}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Button text */}
      <Text style={styles.buttonText}>{buttonText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    position: 'relative', // Ensure relative positioning for absolute children
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default EnhancedRecordingButton;
