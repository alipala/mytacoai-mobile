/**
 * Taal Coach - Floating Button Component
 * ========================================
 * AI language learning coach that appears as a floating button
 * in the bottom-right corner of the Learn tab.
 *
 * Features:
 * - Lottie animated button (companion_idle.json)
 * - Opens full-screen coach modal on tap
 * - Pulse animation to attract attention
 * - Haptic feedback on interaction
 * - Red badge notification for unread sentence analysis
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

// Import Lottie animation
const CompanionIdle = require('../../assets/lottie/companion_idle2.json');

interface TaalCoachProps {
  onPress: () => void;
  visible?: boolean;
  hasBadge?: boolean; // 🆕 NEW: Show red badge notification
}

export const TaalCoach: React.FC<TaalCoachProps> = ({
  onPress,
  visible = true,
  hasBadge = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  // 🆕 Badge animation
  const badgeScale = useRef(new Animated.Value(1)).current;

  // Start Lottie animation when component mounts
  useEffect(() => {
    if (visible && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [visible]);

  // 🆕 Badge pulse animation
  useEffect(() => {
    if (hasBadge) {
      // Continuous pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeScale, {
            toValue: 1.3,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(badgeScale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Reset scale when badge is removed
      badgeScale.setValue(1);
    }
  }, [hasBadge, badgeScale]);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    onPress();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: isPressed ? 0.95 : 1 }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {/* Lottie Animation */}
          <LottieView
            ref={lottieRef}
            source={CompanionIdle}
            autoPlay
            loop
            style={styles.lottie}
            speed={1}
          />

          {/* 🆕 Badge Overlay */}
          {hasBadge && (
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScale }],
                },
              ]}
            >
              <Text style={styles.badgeText}>1</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 9999,
  },
  buttonWrapper: {
    position: 'relative',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottie: {
    width: 100,
    height: 100,
  },
  // 🆕 Badge styles
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TaalCoach;
