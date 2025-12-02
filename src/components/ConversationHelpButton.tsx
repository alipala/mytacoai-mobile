import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConversationHelpButtonProps {
  visible: boolean;
  isLoading: boolean;
  onPress: () => void;
  helpLanguage?: string;
  isHelpReady?: boolean; // NEW: indicates help data is available
}

const ConversationHelpButton: React.FC<ConversationHelpButtonProps> = ({
  visible,
  isLoading,
  onPress,
  isHelpReady = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const badgePulseAnim = useRef(new Animated.Value(1)).current;
  const loadingPulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance/exit animation
  useEffect(() => {
    if (visible) {
      // Entrance animation with bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      if (!isLoading) {
        // Start subtle pulse and glow when not loading
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(pulseAnim, {
                toValue: 1.05,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(glowOpacity, {
                toValue: 0.6,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(glowOpacity, {
                toValue: 0.3,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      }
    } else {
      // Exit animation
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isLoading]);

  // Spinning animation for loading state
  useEffect(() => {
    if (isLoading) {
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isLoading]);

  // Badge pulse animation when help is ready
  useEffect(() => {
    if (isHelpReady && !isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      badgePulseAnim.setValue(1);
    }
  }, [isHelpReady, isLoading]);

  // Loading pulse animation - makes button pulse while loading
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingPulseAnim, {
            toValue: 1.08,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(loadingPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingPulseAnim.setValue(1);
    }
  }, [isLoading]);

  const handlePress = () => {
    if (isLoading) return; // Don't allow press while loading

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress();
    });
  };

  if (!visible) {
    return null;
  }

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Determine button color based on state
  const buttonColor = isLoading ? '#8B5CF6' : '#FBB040'; // Purple when loading, yellow when ready
  const glowColor = isLoading ? '#8B5CF6' : '#FBB040';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
            { scale: isLoading ? loadingPulseAnim : 1 }, // Add loading pulse
          ],
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            backgroundColor: glowColor,
          },
        ]}
      />

      {/* Main button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={handlePress}
        activeOpacity={isLoading ? 1 : 0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="hourglass" size={24} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <Ionicons name="bulb" size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Badge indicator - shows when help is ready */}
      {isHelpReady && !isLoading && (
        <Animated.View
          style={[
            styles.badge,
            {
              transform: [{ scale: badgePulseAnim }],
            },
          ]}
        >
          <View style={styles.badgeDot} />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Position at top-right corner of conversation area
    right: 16,
    // Below header (~60px) + timer badge (~50px) + gap (16px) = 126px
    // This ensures no overlap with End button in header
    top: 126,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  glowContainer: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    // backgroundColor set dynamically
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    // backgroundColor set dynamically based on loading state
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
});

export default ConversationHelpButton;
