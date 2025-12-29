/**
 * HeartDisplay Component
 *
 * Displays current hearts for a challenge type with refill timer
 * Features:
 * - Visual heart meter (filled/empty hearts)
 * - Refill countdown timer
 * - Pulse animation when hearts update
 * - Subscription tier styling
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeType } from '../services/mockChallengeData';
import { useFocus } from '../contexts/FocusContext';
import { COLORS } from '../constants/colors';

interface HeartDisplayProps {
  challengeType: ChallengeType;
  showTimer?: boolean;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
}

export function HeartDisplay({
  challengeType,
  showTimer = true,
  size = 'small',
  layout = 'horizontal',
}: HeartDisplayProps) {
  const { getHeartsForType, config, subscriptionTier } = useFocus();
  const heartState = getHeartsForType(challengeType);

  const scale = useSharedValue(1);

  // Pulse animation when hearts change
  useEffect(() => {
    if (heartState) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 8, stiffness: 150 })
      );
    }
  }, [heartState?.current]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!heartState) return null;

  // Unlimited hearts (premium)
  if (config.unlimitedHearts) {
    return (
      <View style={[styles.container, layout === 'vertical' && styles.verticalContainer]}>
        <View style={styles.unlimitedBadge}>
          <Ionicons name="heart" size={getSizeValue(size)} color="#FF6B9D" />
          <Text style={styles.unlimitedText}>∞</Text>
        </View>
        <Text style={styles.premiumLabel}>Unlimited</Text>
      </View>
    );
  }

  const { current, max, nextRefillTime } = heartState;

  // Calculate time until next refill
  const getRefillTimeRemaining = (): string => {
    if (!nextRefillTime || current >= max) return '';

    const now = new Date().getTime();
    const refillTime = new Date(nextRefillTime).getTime();
    const diff = refillTime - now;

    if (diff <= 0) return 'Refilling...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Render individual hearts
  const renderHearts = () => {
    const hearts = [];
    const heartSize = getSizeValue(size);

    for (let i = 0; i < max; i++) {
      const isFilled = i < current;
      hearts.push(
        <Ionicons
          key={i}
          name={isFilled ? 'heart' : 'heart-outline'}
          size={heartSize}
          color={isFilled ? '#FF6B9D' : '#E5E7EB'}
          style={styles.heart}
        />
      );
    }

    return hearts;
  };

  const refillText = getRefillTimeRemaining();

  return (
    <Animated.View
      style={[
        styles.container,
        layout === 'vertical' && styles.verticalContainer,
        animatedStyle,
      ]}
    >
      <View style={[styles.heartsContainer, layout === 'vertical' && styles.heartsVertical]}>
        {renderHearts()}
      </View>

      {showTimer && refillText && (
        <Text style={[styles.timerText, getTimerStyle(size)]}>
          {refillText}
        </Text>
      )}
    </Animated.View>
  );
}

/**
 * Get heart icon size based on size prop
 */
function getSizeValue(size: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'small':
      return 16;
    case 'medium':
      return 20;
    case 'large':
      return 24;
    default:
      return 16;
  }
}

/**
 * Get timer text style based on size
 */
function getTimerStyle(size: 'small' | 'medium' | 'large'): object {
  switch (size) {
    case 'small':
      return { fontSize: 10 };
    case 'medium':
      return { fontSize: 12 };
    case 'large':
      return { fontSize: 14 };
    default:
      return { fontSize: 10 };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  heartsVertical: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heart: {
    marginHorizontal: 1,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  unlimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  unlimitedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B9D',
  },
  premiumLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B9D',
  },
});
