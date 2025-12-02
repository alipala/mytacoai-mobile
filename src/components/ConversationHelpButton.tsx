import React, { useEffect, useRef } from 'react';
import {
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
}

const ConversationHelpButton: React.FC<ConversationHelpButtonProps> = ({
  visible,
  isLoading,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
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
          },
        ]}
      />

      {/* Main button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={isLoading ? 1 : 0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="hourglass" size={32} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <Ionicons name="bulb" size={32} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Small indicator badge - only show when not loading */}
      {!isLoading && (
        <Animated.View style={styles.badge}>
          <Ionicons name="sparkles" size={10} color="#FFF" />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Position to the right of the microphone button (centered at screen center)
    // Microphone is centered, radius 40px, gap 10px, help button starts 50px from center
    left: SCREEN_WIDTH / 2 + 50,
    // Align vertically with microphone button center
    // Footer paddingBottom(24) + text height(~26) + button half height(40) = 90px from bottom to button center
    bottom: 90,
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FBB040',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBB040',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FBB040',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default ConversationHelpButton;
