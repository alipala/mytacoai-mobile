/**
 * OutOfHeartsModal Component
 *
 * Empathetic modal shown when user runs out of hearts
 * - Soft approach (not punishment)
 * - Shows refill time
 * - Subtle upgrade CTA with comparison
 * - Smooth animations matching existing patterns
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { RefillInfo, HEART_CONFIG, CHALLENGE_TYPE_NAMES } from '../types/hearts';
import { styles } from './styles/OutOfHeartsModal.styles';

interface OutOfHeartsModalProps {
  visible: boolean;
  challengeType: string;
  refillInfo: RefillInfo;
  subscriptionPlan: string;
  onUpgrade: () => void;
  onWait: () => void;
  onDismiss: () => void;
}

export function OutOfHeartsModal({
  visible,
  challengeType,
  refillInfo,
  subscriptionPlan,
  onUpgrade,
  onWait,
  onDismiss,
}: OutOfHeartsModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Entrance animation - spring scale
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
        overshootClamping: false,
      });
    } else {
      // Exit animation
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
    }
  }, [visible]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Calculate refill time display
  const getRefillTimeDisplay = () => {
    if (!refillInfo) return 'Calculating...';

    // Use nextHeartInMinutes for the wait time display
    const nextHeartMinutes = refillInfo.nextHeartInMinutes;

    if (nextHeartMinutes === undefined || nextHeartMinutes === null || isNaN(nextHeartMinutes)) {
      // Fallback to subscription plan default refill time
      const defaultRefillMinutes = HEART_CONFIG[subscriptionPlan as keyof typeof HEART_CONFIG]?.refillMinutes || 180;
      const hours = Math.floor(defaultRefillMinutes / 60);
      const minutes = defaultRefillMinutes % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }

    const hours = Math.floor(nextHeartMinutes / 60);
    const minutes = Math.round(nextHeartMinutes % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get next tier info
  const getNextTierInfo = () => {
    if (subscriptionPlan === 'try_learn') {
      return {
        name: 'Fluency Builder',
        hearts: 10,
        refillTime: '1 hour',
        price: '$19.99/mo'
      };
    } else if (subscriptionPlan === 'fluency_builder') {
      return {
        name: 'Language Mastery',
        hearts: '∞',
        refillTime: 'No wait',
        price: '$39.99/mo'
      };
    }
    return null;
  };

  const nextTier = getNextTierInfo();
  const currentTierHearts = HEART_CONFIG[subscriptionPlan as keyof typeof HEART_CONFIG]?.maxHearts || 5;
  const challengeTypeName = CHALLENGE_TYPE_NAMES[challengeType] || challengeType;

  if (!visible) return null;

  // Generate visual hearts display
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < currentTierHearts; i++) {
      hearts.push(
        <Text key={i} style={styles.heart}>
          {'🤍'}
        </Text>
      );
    }
    return hearts;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // We handle animation ourselves
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, containerAnimatedStyle]}>
          <LinearGradient
            colors={['#FFF5F0', '#FFF9E6', '#F0FFFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            {/* Title and Subtitle */}
            <View style={styles.header}>
              <Text style={styles.title}>Your Focus Needs a Break</Text>
              <Text style={styles.subtitle}>
                Mistakes help you learn! Take a moment to recharge.
              </Text>
            </View>

            {/* Lottie Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../assets/lottie/wait.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </View>

            {/* Visual Hearts */}
            <View style={styles.infoBox}>
              <View style={styles.heartsContainer}>
                {renderHearts()}
              </View>
              <Text style={styles.infoSubtext}>Your first heart refills in {getRefillTimeDisplay()}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>

              {/* Upgrade Option (only if not Language Mastery) */}
              {nextTier && (
                <TouchableOpacity
                  style={[styles.optionCard, styles.upgradeCard]}
                  onPress={onUpgrade}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionEmoji}>⭐</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, styles.upgradeTitle]}>
                      {nextTier.hearts === '∞' ? 'Upgrade for unlimited' : 'Upgrade for more hearts'}
                    </Text>
                    <View style={styles.comparisonContainer}>
                      <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>Your plan</Text>
                        <Text style={styles.comparisonValue}>{currentTierHearts} ❤️</Text>
                        <Text style={styles.comparisonTime}>
                          {HEART_CONFIG[subscriptionPlan as keyof typeof HEART_CONFIG]?.refillMinutes / 60}h refill
                        </Text>
                      </View>
                      <Text style={styles.comparisonArrow}>→</Text>
                      <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>{nextTier.name}</Text>
                        <Text style={[styles.comparisonValue, styles.highlighted]}>{nextTier.hearts} ❤️</Text>
                        <Text style={styles.comparisonTime}>{nextTier.refillTime}</Text>
                      </View>
                    </View>
                    <Text style={styles.price}>{nextTier.price}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
              activeOpacity={0.6}
            >
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
