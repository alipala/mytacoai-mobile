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
  hasBadge?: boolean; // 🆕 Show red badge notification
}

export const TaalCoach: React.FC<TaalCoachProps> = ({
  onPress,
  visible = true,
  hasBadge = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  // 🆕 Simple badge scale animation
  const badgeScale = useRef(new Animated.Value(0)).current;

  // Debug logging for badge prop changes
  useEffect(() => {
    console.log('[TAALCOACH_COMPONENT] hasBadge prop changed:', hasBadge);
  }, [hasBadge]);

  // Start Lottie animation when component mounts
  useEffect(() => {
    if (visible && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [visible]);

  // 🆕 Simple badge animation - just bounce in/out
  useEffect(() => {
    if (hasBadge) {
      console.log('[TAALCOACH_COMPONENT] ✅ Showing badge');
      // Simple spring entrance
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      console.log('[TAALCOACH_COMPONENT] ❌ Hiding badge');
      // Quick fade out
      Animated.timing(badgeScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
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

          {/* 🆕 Simple notification badge */}
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
    width: 100,
    height: 100,
    // Don't clip badge - allow it to overflow
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible', // Changed from 'hidden' to allow badge to show
  },
  lottie: {
    width: 100,
    height: 100,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30', // iOS system red
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Clean iOS-style shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default TaalCoach;
