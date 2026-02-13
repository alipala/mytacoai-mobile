/**
 * Horizontal Stats Carousel
 *
 * Smart carousel that shows different cards based on user activity:
 * - Active users: Daily → Recent → Lifetime (3 cards)
 * - Inactive users with history: WelcomeBack → Lifetime (2 cards)
 * - New users: Shown via placeholder in parent
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
import { useNavigation } from '@react-navigation/native';
import EnhancedTodaysProgressCard from './EnhancedTodaysProgressCard';
import RecentPerformanceCard from './RecentPerformanceCard';
import LifetimeProgressCard from './LifetimeProgressCard';
import WelcomeBackCard from './WelcomeBackCard';
import TopLanguagesCard from './TopLanguagesCard';
import TopChallengeTypesCard from './TopChallengeTypesCard';
import ByLanguageTodayCard from './ByLanguageTodayCard';
import ByChallengeTypeTodayCard from './ByChallengeTypeTodayCard';
import ByCEFRLevelTodayCard from './ByCEFRLevelTodayCard';
import TodaysSeparatorCard from './TodaysSeparatorCard';
import AccuracyTrendSeparatorCard from './AccuracyTrendSeparatorCard';
import LifetimeSeparatorCard from './LifetimeSeparatorCard';
import { useDailyStats, useRecentPerformance, useLifetimeProgress } from '../hooks/useStats';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px margin on each side
const CARD_SPACING = 16;

interface HorizontalStatsCarouselProps {
  onRefresh: () => void;
}

export default function HorizontalStatsCarousel({ onRefresh }: HorizontalStatsCarouselProps) {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const [isAtEnd, setIsAtEnd] = React.useState(false);

  // Fetch user stats
  const { daily } = useDailyStats(true);
  const { recent } = useRecentPerformance(7, true);
  const { lifetime } = useLifetimeProgress(false, true);

  // Determine user activity state
  const hasRecentActivity = recent && recent.summary && recent.summary.total_challenges > 0;
  const hasLifetimeData = lifetime && lifetime.summary && lifetime.summary.total_challenges > 0;

  // Calculate days since last activity
  const calculateDaysSince = () => {
    if (!recent || !recent.daily_breakdown) return 7;

    // Find last day with activity
    const lastActiveDay = recent.daily_breakdown
      .reverse()
      .find((day: any) => day.challenges > 0);

    if (!lastActiveDay) return 7;

    const today = new Date();
    const lastActive = new Date(lastActiveDay.date);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysSinceActive = calculateDaysSince();
  const isInactive = !hasRecentActivity && hasLifetimeData;

  // Debug logging
  console.log('[HorizontalStatsCarousel] 🔍 State:', {
    hasRecentActivity,
    hasLifetimeData,
    isInactive,
    daysSinceActive,
    recentChallenges: recent?.summary?.total_challenges,
    lifetimeChallenges: lifetime?.summary?.total_challenges,
  });

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

  // Format last active date
  const getLastActiveDate = () => {
    if (!recent || !recent.daily_breakdown) return 'Recently';

    const lastActiveDay = recent.daily_breakdown
      .reverse()
      .find((day: any) => day.challenges > 0);

    if (!lastActiveDay) return 'Recently';

    const date = new Date(lastActiveDay.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle resume practice navigation
  const handleResumePractice = () => {
    // Navigate to practice/challenge selection
    // This will be handled by parent navigation
    onRefresh();
  };

  // Handle scroll to detect when at end
  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const scrollViewWidth = layoutMeasurement.width;
    const contentWidth = contentSize.width;

    // Check if scrolled close to the end (within 50px threshold)
    const isNearEnd = scrollX + scrollViewWidth >= contentWidth - 50;
    setIsAtEnd(isNearEnd);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isAtEnd && styles.headerLeft]}>
        <View style={styles.swipeIndicator}>
          {isAtEnd && (
            <Animated.Text
              style={[
                styles.animatedArrow,
                {
                  opacity: arrowOpacity,
                  transform: [{
                    translateX: arrowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8],
                    })
                  }],
                },
              ]}
            >
              ←
            </Animated.Text>
          )}
          <Text style={styles.sectionSubtitle}>
            {isInactive ? 'Swipe for detailed stats' : 'Swipe to see more'}
          </Text>
          {!isAtEnd && (
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
          )}
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {isInactive ? (
          // Inactive user with history: Show WelcomeBack + Lifetime (2 cards)
          <>
            <View style={styles.cardWrapper}>
              <WelcomeBackCard
                userName={undefined} // Can pass from parent if needed
                totalChallenges={lifetime?.summary?.total_challenges || 0}
                totalXP={lifetime?.summary?.total_xp || 0}
                longestStreak={lifetime?.summary?.longest_streak || 0}
                currentStreak={lifetime?.summary?.current_streak || 0}
                lastActiveDate={getLastActiveDate()}
                daysSinceActive={daysSinceActive}
                onResumePractice={handleResumePractice}
              />
            </View>

            <View style={styles.cardWrapper}>
              <LifetimeProgressCard onRefresh={onRefresh} />
            </View>
          </>
        ) : (
          // Active user: Show all cards with separators (Separator → Daily → By Language → By Type → By Level → Separator → Accuracy → Separator → Top Languages → Top Types → Lifetime)
          <>
            {/* TODAY'S PROGRESS SECTION */}
            <View style={styles.cardWrapper}>
              <TodaysSeparatorCard />
            </View>

            <View style={styles.cardWrapper}>
              <EnhancedTodaysProgressCard onRefresh={onRefresh} />
            </View>

            <View style={styles.cardWrapper}>
              <ByLanguageTodayCard onRefresh={onRefresh} />
            </View>

            <View style={styles.cardWrapper}>
              <ByChallengeTypeTodayCard onRefresh={onRefresh} />
            </View>

            <View style={styles.cardWrapper}>
              <ByCEFRLevelTodayCard onRefresh={onRefresh} />
            </View>

            {/* ACCURACY TREND SECTION */}
            <View style={styles.cardWrapper}>
              <AccuracyTrendSeparatorCard />
            </View>

            <View style={styles.cardWrapper}>
              <RecentPerformanceCard onRefresh={onRefresh} initiallyExpanded={true} maxDays={5} />
            </View>

            {/* LIFETIME PROGRESS SECTION */}
            <View style={styles.cardWrapper}>
              <LifetimeSeparatorCard />
            </View>

            <View style={styles.cardWrapper}>
              <TopLanguagesCard onRefresh={onRefresh} />
            </View>

            <View style={styles.cardWrapper}>
              <TopChallengeTypesCard onRefresh={onRefresh} />
            </View>

            <View style={styles.cardWrapper}>
              <LifetimeProgressCard onRefresh={onRefresh} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // Spacing above "Choose Your Quest" buttons
    marginHorizontal: -20, // Break out of parent's padding
  },
  header: {
    paddingHorizontal: 40, // Compensate for negative margin + add own padding
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#B4E4DD',
    fontWeight: '500',
  },
  animatedArrow: {
    fontSize: 16,
    color: '#06B6D4',
    fontWeight: '700',
  },
  scrollView: {
    // No padding - handled by cardWrapper margins
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 20 + CARD_SPACING, // Compensate for last card's marginRight
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    // No fixed height - let content determine card height naturally
  },
});
