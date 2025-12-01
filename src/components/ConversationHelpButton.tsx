import React, { useEffect, useRef, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ConversationHelpButtonProps {
  visible: boolean;
  isLoading: boolean;
  onPress: () => void;
  helpLanguage?: string;
}

// Button text translations
const getButtonText = (language: string) => {
  const texts: Record<string, string> = {
    english: 'Need Help?',
    spanish: '¿Ayuda?',
    french: 'Besoin d\'aide?',
    german: 'Hilfe?',
    italian: 'Aiuto?',
    portuguese: 'Ajuda?',
    dutch: 'Hulp?',
    turkish: 'Yardım?',
  };

  return texts[language] || texts.english;
};

const ConversationHelpButton: React.FC<ConversationHelpButtonProps> = ({
  visible,
  isLoading,
  onPress,
  helpLanguage = 'english',
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  const buttonText = getButtonText(helpLanguage);

  // Entrance/exit animation
  useEffect(() => {
    if (visible && !isLoading) {
      // Entrance animation with bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Start pulsing and glowing
      startPulseAnimation();
      startGlowAnimation();
    } else {
      // Exit animation
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isLoading]);

  // Pulse animation (continuous)
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Glow animation (continuous)
  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Button press animation
    setIsPressed(true);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
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
      setIsPressed(false);
      onPress();
    });
  };

  if (!visible || isLoading) {
    return null;
  }

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(251, 191, 36, 0.3)', 'rgba(251, 191, 36, 0.7)'],
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
            backgroundColor: glowColor,
            transform: [{ scale: glowAnim }],
          },
        ]}
      />

      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.button,
          isPressed && styles.buttonPressed,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="bulb" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.buttonText}>{buttonText}</Text>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={12} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Animated indicator dots */}
      <View style={styles.indicatorDots}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBB040',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#FBB040',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonPressed: {
    backgroundColor: '#F59E0B',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  indicatorDots: {
    position: 'absolute',
    top: -8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dot1: {
    backgroundColor: '#10B981',
  },
  dot2: {
    backgroundColor: '#3B82F6',
  },
  dot3: {
    backgroundColor: '#8B5CF6',
  },
});

export default ConversationHelpButton;
