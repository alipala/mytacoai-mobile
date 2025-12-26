/**
 * Horizontal Stats Carousel
 *
 * Makes the detailed stats cards scrollable horizontally with colorful backgrounds
 * Cards:
 * - Today's Progress (Daily 0-24h)
 * - Recent Performance (Weekly 7-day trend)
 * - Lifetime Progress (All-time achievements)
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import EnhancedTodaysProgressCard from './EnhancedTodaysProgressCard';
import RecentPerformanceCard from './RecentPerformanceCard';
import LifetimeProgressCard from './LifetimeProgressCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px margin on each side
const CARD_SPACING = 16;

interface HorizontalStatsCarouselProps {
  onRefresh: () => void;
}

export default function HorizontalStatsCarousel({ onRefresh }: HorizontalStatsCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Animate arrow to pulse and slide
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const arrowTranslateX = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const arrowOpacity = arrowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.swipeIndicator}>
          <Text style={styles.sectionSubtitle}>Swipe to see more</Text>
          <Animated.Text
            style={[
              styles.animatedArrow,
              {
                opacity: arrowOpacity,
                transform: [{ translateX: arrowTranslateX }],
              },
            ]}
          >
            →
          </Animated.Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Card 1: Today's Progress */}
        <View style={styles.cardWrapper}>
          <EnhancedTodaysProgressCard onRefresh={onRefresh} />
        </View>

        {/* Card 2: Recent Performance (7-day Accuracy Trend) */}
        <View style={styles.cardWrapper}>
          <RecentPerformanceCard onRefresh={onRefresh} initiallyExpanded={true} maxDays={4} />
        </View>

        {/* Card 3: Lifetime Progress (All-time achievements) */}
        <View style={styles.cardWrapper}>
          <LifetimeProgressCard onRefresh={onRefresh} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: -20, // Break out of parent's padding
  },
  header: {
    paddingHorizontal: 40, // Compensate for negative margin + add own padding
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  animatedArrow: {
    fontSize: 16,
    color: '#06B6D4',
    fontWeight: '700',
  },
  scrollView: {
    paddingLeft: 20, // 20px margin from screen edge
  },
  scrollContent: {
    paddingRight: 20, // 20px margin from screen edge
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
});
