/**
 * Breakthroughs Section Component
 *
 * Horizontal carousel of breakthrough achievement cards
 * with category-based gradients and celebration emojis
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, GRADIENTS, SHADOWS, ICON_SIZES } from '../constants';
import { BreakthroughsSectionProps, BreakthroughCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;
const CARD_GAP = 12;
const CARD_PADDING = 16;

/**
 * Get emoji for breakthrough type
 */
const getBreakthroughEmoji = (type: string): string => {
  const emojiMap: Record<string, string> = {
    confidence_jump: '🚀',
    vocabulary_expansion: '📚',
    challenge_accepted: '🏆',
    level_up: '⭐',
    perfect_session: '💯',
    milestone_reached: '🎯',
    fluency_streak: '🔥',
  };
  return emojiMap[type] || '🎉';
};

/**
 * Get gradient colors for breakthrough category
 */
const getBreakthroughGradient = (type: string): string[] => {
  if (type.includes('confidence')) return GRADIENTS.categoryConfidence;
  if (type.includes('vocabulary')) return GRADIENTS.categoryVocabulary;
  if (type.includes('challenge')) return GRADIENTS.categoryRhythm;
  if (type.includes('level')) return GRADIENTS.categoryLearning;
  if (type.includes('perfect')) return GRADIENTS.celebration;
  return GRADIENTS.primary;
};

/**
 * Breakthrough Card Component
 */
const BreakthroughCardComponent: React.FC<{
  breakthrough: BreakthroughCard;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}> = ({ breakthrough, index, scrollX, onPress }) => {
  const gradientColors = getBreakthroughGradient(breakthrough.type);

  /**
   * Card animation based on scroll position
   */
  const animatedCardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_GAP),
      index * (CARD_WIDTH + CARD_GAP),
      (index + 1) * (CARD_WIDTH + CARD_GAP),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1.05, 0.9],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolate.CLAMP
    );

    // Parallax effect - background moves slower
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [10, 0, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale: scale }, { translateY: translateY }],
      opacity,
    };
  });

  /**
   * Handle press
   */
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.cardTouchable}
      >
        <View style={[styles.card, SHADOWS.lg]}>
          {/* Gradient background */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Emoji */}
            <Text style={styles.emoji}>{breakthrough.emoji}</Text>

            {/* Title */}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {breakthrough.title}
            </Text>

            {/* Description - Format properly */}
            {breakthrough.description && (
              <Text style={styles.cardDescription} numberOfLines={3}>
                {typeof breakthrough.description === 'string'
                  ? breakthrough.description
                  : ''}
              </Text>
            )}

            {/* Tap hint - Made more subtle */}
            <View style={styles.tapHintContainer}>
              <Ionicons name="hand-left-outline" size={10} color={`${COLORS.white}60`} />
              <Text style={styles.tapHint}>Tap for details</Text>
            </View>
          </View>

          {/* Celebrated indicator */}
          {breakthrough.celebrated && (
            <View style={styles.celebratedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
            </View>
          )}

          {/* Shimmer effect overlay for uncelebrated */}
          {!breakthrough.celebrated && (
            <View style={styles.shimmerOverlay} pointerEvents="none" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Breakthroughs Section Component
 */
export const BreakthroughsSection: React.FC<BreakthroughsSectionProps> = ({
  breakthroughs,
  onBreakthroughPress,
  onSeeAll,
}) => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  /**
   * Handle scroll events
   */
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  if (!breakthroughs || breakthroughs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={ICON_SIZES.lg} color={COLORS.warning} />
          <Text style={styles.headerTitle}>Recent Breakthroughs</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Spacer at start */}
        <View style={{ width: CARD_PADDING }} />

        {/* Breakthrough cards */}
        {breakthroughs.map((breakthrough, index) => (
          <BreakthroughCardComponent
            key={breakthrough.id}
            breakthrough={breakthrough}
            index={index}
            scrollX={scrollX}
            onPress={() => onBreakthroughPress?.(breakthrough)}
          />
        ))}

        {/* Spacer at end */}
        <View style={{ width: CARD_PADDING }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[500],
  },
  scrollContent: {
    paddingVertical: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: CARD_GAP,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: `${COLORS.white}CC`,
    textAlign: 'center',
    lineHeight: 16,
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  tapHint: {
    fontSize: 9,
    fontWeight: '500',
    color: `${COLORS.white}60`,
    textAlign: 'center',
  },
  celebratedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: `${COLORS.white}30`,
    borderRadius: 12,
    padding: 4,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${COLORS.white}10`,
  },
});

export default BreakthroughsSection;
