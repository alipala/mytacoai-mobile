import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message = "Your taalcoach knowledge is being extended. Hold on please!",
}) => {
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Pulsing rings animation
      const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1.5,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      // Rotation animation
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Progress bar animation
      const progressAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );

      // Bouncing dots animation
      const createDotAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: -10,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      };

      // Start all animations
      createPulseAnimation(pulseAnim1, 0).start();
      createPulseAnimation(pulseAnim2, 400).start();
      createPulseAnimation(pulseAnim3, 800).start();
      rotationAnimation.start();
      progressAnimation.start();
      createDotAnimation(dotAnim1, 0).start();
      createDotAnimation(dotAnim2, 150).start();
      createDotAnimation(dotAnim3, 300).start();
    }
  }, [isOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Content */}
          <View style={styles.content}>
            {/* Animated Brain Icon with Pulsing Rings */}
            <View style={styles.iconContainer}>
              {/* Outer pulsing ring */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRingOuter,
                  {
                    transform: [{ scale: pulseAnim1 }],
                    opacity: pulseAnim1.interpolate({
                      inputRange: [1, 1.5],
                      outputRange: [0.3, 0],
                    }),
                  },
                ]}
              />

              {/* Middle pulsing ring */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRingMiddle,
                  {
                    transform: [{ scale: pulseAnim2 }],
                    opacity: pulseAnim2.interpolate({
                      inputRange: [1, 1.5],
                      outputRange: [0.4, 0],
                    }),
                  },
                ]}
              />

              {/* Inner pulsing ring */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRingInner,
                  {
                    transform: [{ scale: pulseAnim3 }],
                    opacity: pulseAnim3.interpolate({
                      inputRange: [1, 1.5],
                      outputRange: [0.5, 0],
                    }),
                  },
                ]}
              />

              {/* Brain icon container with rotation */}
              <Animated.View
                style={[
                  styles.brainIconContainer,
                  {
                    transform: [{ rotate }],
                  },
                ]}
              >
                <Ionicons name="bulb" size={48} color="#FFFFFF" />
              </Animated.View>
            </View>

            {/* Loading Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Loading Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Loading Dots */}
            <View style={styles.dotsContainer}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    backgroundColor: COLORS.turquoise,
                    transform: [{ translateY: dotAnim1 }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    backgroundColor: COLORS.yellow,
                    transform: [{ translateY: dotAnim2 }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    backgroundColor: COLORS.orange,
                    transform: [{ translateY: dotAnim3 }],
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 24,
    width: width * 0.85,
    maxWidth: 400,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
  },
  pulseRingOuter: {
    width: 120,
    height: 120,
    borderColor: `${COLORS.turquoise}40`,
  },
  pulseRingMiddle: {
    width: 96,
    height: 96,
    borderColor: `${COLORS.yellow}60`,
  },
  pulseRingInner: {
    width: 72,
    height: 72,
    borderColor: `${COLORS.orange}80`,
  },
  brainIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.turquoise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.5)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.turquoise,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default LoadingModal;
