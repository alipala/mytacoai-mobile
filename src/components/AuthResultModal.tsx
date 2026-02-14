/**
 * AuthResultModal - Beautiful centered modal for login/signup results
 *
 * Features:
 * - Lottie animations for success/failure
 * - Smooth fade-in/scale animations
 * - Auto-dismiss with progress indicator
 * - Haptic feedback
 * - Modern, immersive design
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuthResultModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  userName?: string;
  onClose?: () => void;
  autoCloseDelay?: number; // milliseconds
}

export const AuthResultModal: React.FC<AuthResultModalProps> = ({
  visible,
  type,
  title,
  message,
  userName,
  onClose,
  autoCloseDelay = 3000,
}) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close only for error state
      if (type === 'error') {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(30);
    }
  }, [visible, type, autoCloseDelay]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };


  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <Animated.View
          style={[
            styles.immersiveContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Large Lottie Animation - Floating */}
          <View style={styles.floatingAnimationContainer}>
            {type === 'success' ? (
              <LottieView
                source={require('../assets/lottie/Welcome.json')}
                autoPlay
                loop={false}
                style={styles.largeLottie}
              />
            ) : (
              <LottieView
                source={require('../assets/lottie/invalid_credential.json')}
                autoPlay
                loop={false}
                style={styles.largeLottie}
              />
            )}
          </View>

          {/* Welcome Name - Under animation with consistent design */}
          {userName && type === 'success' && (
            <Text style={styles.welcomeName}>Welcome, {userName}!</Text>
          )}

          {/* Floating Title - Only show if not empty */}
          {title && (
            <Text style={[styles.floatingTitle, { color: type === 'success' ? '#10B981' : '#EF4444' }]}>
              {title}
            </Text>
          )}

          {/* Message - Directly on blur background - Only show if not empty */}
          {message && (
            <Text style={styles.floatingMessage}>{message}</Text>
          )}

          {/* Try Again Button - Only for error state */}
          {type === 'error' && (
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.floatingButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  immersiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  floatingAnimationContainer: {
    width: 350,
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  largeLottie: {
    width: 350,
    height: 350,
  },
  floatingTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },
  floatingMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    paddingHorizontal: 30,
  },
  floatingButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
