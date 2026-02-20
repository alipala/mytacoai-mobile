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
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
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
}

export const TaalCoach: React.FC<TaalCoachProps> = ({
  onPress,
  visible = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  // Start Lottie animation when component mounts
  useEffect(() => {
    if (visible && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [visible]);

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
    zIndex: 1000,
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
});

export default TaalCoach;
