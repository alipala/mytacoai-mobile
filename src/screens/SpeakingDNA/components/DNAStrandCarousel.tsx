/**
 * DNA Strand Carousel Component
 *
 * Horizontal scrolling carousel of DNA strand cards
 * Each card shows the strand icon, name, score, and progress
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolate,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, SPRING_CONFIGS, SHADOWS, DNA_STRAND_ICONS, ICON_SIZES } from '../constants';
import { DNAStrandCarouselProps, DNAStrandKey, DNAStrand } from '../types';
import { getStrandScore } from '../constants.OLD';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 140;
const CARD_HEIGHT = 180;
const CARD_GAP = 12;
const CARD_PADDING = 20;

/**
 * Individual Strand Card Component
 */
const StrandCard: React.FC<{
  strandKey: DNAStrandKey;
  strand: DNAStrand;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}> = ({ strandKey, strand, index, scrollX, onPress }) => {
  const color = COLORS.strand[strandKey];
  const icon = DNA_STRAND_ICONS[strandKey];

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
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  /**
   * Handle card press with haptic feedback
   */
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  /**
   * Format strand name to Title Case
   */
  const formattedName = strandKey.charAt(0).toUpperCase() + strandKey.slice(1);

  return (
    <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.cardTouchable}
      >
        <View style={[styles.card, SHADOWS.md]}>
          {/* Colored header with icon */}
          <LinearGradient
            colors={[color, `${color}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            <Ionicons name={icon} size={ICON_SIZES.lg} color={COLORS.white} />
          </LinearGradient>

          {/* Card content */}
          <View style={styles.cardContent}>
            <Text style={styles.strandName}>{formattedName}</Text>

            <Text style={[styles.score, { color }]}>
              {getStrandScore(strand)}%
            </Text>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBackground]}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: color, width: `${getStrandScore(strand)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Strand level - Format to Title Case */}
            <Text style={styles.level} numberOfLines={1}>
              {(() => {
                const rawText = typeof strand.type === 'string'
                  ? strand.type
                  : typeof strand.level === 'string'
                    ? strand.level
                    : 'Developing';
                // Convert snake_case or lowercase to Title Case
                return rawText
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
              })()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * DNA Strand Carousel Component
 */
export const DNAStrandCarousel: React.FC<DNAStrandCarouselProps> = ({
  strands,
  onStrandPress,
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

  /**
   * Convert strands object to array
   */
  const strandArray: Array<{ key: DNAStrandKey; data: DNAStrand }> = Object.entries(strands).map(
    ([key, data]) => ({
      key: key as DNAStrandKey,
      data,
    })
  );

  return (
    <View style={styles.container}>
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

        {/* Strand cards */}
        {strandArray.map((item, index) => (
          <StrandCard
            key={item.key}
            strandKey={item.key}
            strand={item.data}
            index={index}
            scrollX={scrollX}
            onPress={() => onStrandPress?.(item.key)}
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
    height: CARD_HEIGHT + 20,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strandName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[800],
    textAlign: 'center',
  },
  score: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 4,
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  level: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DNAStrandCarousel;
