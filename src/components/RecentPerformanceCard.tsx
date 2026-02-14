/**
 * Recent Performance Card
 *
 * Displays 7-day performance trends with sparkline chart and insights
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Polyline, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRecentPerformance } from '../hooks/useStats';
import { styles, CARD_WIDTH } from './styles/RecentPerformanceCard.styles';

interface RecentPerformanceCardProps {
  onRefresh?: () => void;
  initiallyExpanded?: boolean;
  maxDays?: number;
}

export default function RecentPerformanceCard({ onRefresh, initiallyExpanded = false, maxDays = 7 }: RecentPerformanceCardProps) {
  const { t } = useTranslation();
  const { recent, isLoading, error, refetchRecent } = useRecentPerformance(7, true);
  const [showDetails, setShowDetails] = useState(initiallyExpanded);
  const [forceRender, setForceRender] = useState(0);
  const expansionAnim = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  // Force refresh on component mount to bypass cache
  React.useEffect(() => {
    console.log('[RecentPerformanceCard] Force refreshing recent performance data...');
    refetchRecent(true).then(() => {
      setForceRender(prev => prev + 1);
    });
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log('[RecentPerformanceCard] 🔍 DEBUG - recent data:', {
      hasRecent: !!recent,
      isLoading,
      hasError: !!error
    });
  }, [recent, isLoading, error]);

  const handleRefresh = async () => {
    await refetchRecent(true);
    onRefresh?.();
  };

  const toggleDetails = () => {
    const toValue = showDetails ? 0 : 1;
    Animated.spring(expansionAnim, {
      toValue,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
    setShowDetails(!showDetails);
  };

  // Determine what to render (all hooks must be called before this)
  let contentToRender: 'error' | 'loading' | 'empty' | 'data' = 'data';
  let isNotFoundError = false;

  if (error && !recent) {
    isNotFoundError =
      error.message.includes('not found') ||
      error.message.includes('404') ||
      error.message.includes('Statistics not found');
    contentToRender = isNotFoundError ? 'empty' : 'error';
  } else if (isLoading && !recent) {
    contentToRender = 'loading';
  } else if (!recent || recent.daily_breakdown.length < 3) {
    contentToRender = 'empty';
  }

  // Render based on state (no early returns)
  if (contentToRender === 'empty') {
    return (
      <View style={styles.card}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📈</Text>
          <Text style={styles.emptyTitle}>
            {isNotFoundError ? 'Start Your Journey!' : 'Not Enough Data Yet'}
          </Text>
          <Text style={styles.emptyMessage}>
            Complete a few {isNotFoundError ? '' : 'more '}challenges to see your performance trends
          </Text>
        </View>
      </View>
    );
  }

  if (contentToRender === 'error') {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📊</Text>
          <Text style={styles.errorTitle}>Unable to Load Trends</Text>
          <Text style={styles.errorMessage}>{error?.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (contentToRender === 'loading') {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading your performance trends...</Text>
        </View>
      </View>
    );
  }

  // Calculate sparkline points for accuracy trend
  const accuracyData = recent.daily_breakdown.map((day) => day.accuracy ?? 0);
  const maxAccuracy = Math.max(...accuracyData, 100);
  const minAccuracy = Math.min(...accuracyData, 0);
  const range = maxAccuracy - minAccuracy || 1;

  const chartWidth = CARD_WIDTH - 80;
  const chartHeight = 60;
  const stepX = chartWidth / Math.max(accuracyData.length - 1, 1);

  const sparklinePoints = accuracyData
    .map((accuracy, index) => {
      const x = 40 + index * stepX;
      const y = chartHeight - ((accuracy - minAccuracy) / range) * chartHeight + 10;
      return `${x},${y}`;
    })
    .join(' ');

  // Determine trend based on both accuracy AND practice consistency
  const firstAccuracy = accuracyData[0];
  const lastAccuracy = accuracyData[accuracyData.length - 1];
  const trendDiff = lastAccuracy - firstAccuracy;

  // Count days with actual practice (challenges > 0)
  const daysWithPractice = recent.daily_breakdown.filter(day => day.challenges > 0).length;

  // Check when last practiced (breakdown goes from oldest to newest, so reverse to find most recent)
  const reversedBreakdown = [...recent.daily_breakdown].reverse();
  const lastPracticeDayIndex = reversedBreakdown.findIndex(day => day.challenges > 0);
  const daysSinceLastPractice = lastPracticeDayIndex >= 0 ? lastPracticeDayIndex : 7;

  // Determine trend based on practice pattern
  let trendIcon: string;
  let trendColor: string;
  let trendText: string;

  // Check if user practiced TODAY (last item in breakdown is today)
  const todayChallenges = recent.daily_breakdown[recent.daily_breakdown.length - 1]?.challenges || 0;
  const didPracticeToday = todayChallenges > 0;

  console.log('[RecentPerformanceCard] Today challenges:', todayChallenges);
  console.log('[RecentPerformanceCard] Did practice today:', didPracticeToday);
  console.log('[RecentPerformanceCard] Breakdown length:', recent.daily_breakdown.length);

  if (!didPracticeToday) {
    // No challenges today - motivate them to start!
    console.log('[RecentPerformanceCard] Setting badge: No Challenges Today');
    trendIcon = 'fitness-outline';
    trendColor = '#F59E0B';
    trendText = 'No Challenges Today';
  } else if (daysWithPractice === 0) {
    // No practice at all in 7 days (shouldn't happen if didPracticeToday is true, but keep as fallback)
    trendIcon = 'fitness-outline';
    trendColor = '#F59E0B';
    trendText = 'No Challenges Today';
  } else if (daysSinceLastPractice >= 3) {
    // Haven't practiced in 3+ days
    trendIcon = 'hand-left-outline';
    trendColor = '#F59E0B';
    trendText = 'Come Back';
  } else if (daysWithPractice === 1) {
    // Just started
    trendIcon = 'rocket-outline';
    trendColor = '#14B8A6';
    trendText = 'Just Started';
  } else if (daysWithPractice >= 5) {
    // Practicing consistently
    trendIcon = 'flame-outline';
    trendColor = '#EF4444';
    trendText = 'On Fire';
  } else if (trendDiff > 5) {
    // Accuracy improving
    trendIcon = 'trending-up-outline';
    trendColor = '#10B981';
    trendText = 'Improving';
  } else if (trendDiff < -5) {
    // Accuracy declining
    trendIcon = 'trending-down-outline';
    trendColor = '#EF4444';
    trendText = 'Needs Focus';
  } else {
    // Regular practice, stable accuracy
    trendIcon = 'barbell-outline';
    trendColor = '#8B5CF6';
    trendText = 'Keep Going';
  }

  // Get most practiced language and type (with safety checks)
  const languageEntries = Object.entries(recent.by_language || {}).filter(
    ([lang]) => lang !== 'unknown'
  );
  const mostPracticedLanguage = languageEntries.length > 0
    ? languageEntries.reduce((max, [lang, stats]) =>
        (stats?.challenges || 0) > (recent.by_language[max]?.challenges || 0) ? lang : max
      , languageEntries[0][0])
    : '-';

  const typeEntries = Object.entries(recent.by_type || {}).filter(
    ([type]) => type !== 'unknown'
  );
  const mostPracticedType = typeEntries.length > 0
    ? typeEntries.reduce((max, [type, stats]) =>
        (stats?.challenges || 0) > (recent.by_type[max]?.challenges || 0) ? type : max
      , typeEntries[0][0])
    : '-';

  // Format challenge type name
  const formatTypeName = (type: string): string => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get weakest CEFR level (with safety checks)
  const levelEntries = Object.entries(recent.by_level || {});
  const weakestLevel = levelEntries.length > 1 // Need at least 2 levels to compare
    ? levelEntries.reduce((min, [level, stats]) => {
        const minAccuracy = recent.by_level[min]?.accuracy || 100;
        return (stats?.accuracy || 0) < minAccuracy ? level : min;
      }, levelEntries[0][0])
    : levelEntries.length === 1
    ? levelEntries[0][0] // Single level - show it
    : '-'; // No levels

  const detailsHeight = expansionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  const detailsOpacity = expansionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.card}>
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="trending-up-outline" size={32} color="#06B6D4" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>{t('explore.stats.accuracy_trend')}</Text>
              <Text style={styles.headerSubtitle}>{t('explore.stats.last_7_days')}</Text>
            </View>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
            <Ionicons name={trendIcon as any} size={16} color={trendColor} style={{ marginRight: 4 }} />
            <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
          </View>
        </View>

        {/* Sparkline Chart */}
        <View style={styles.chartContainer}>
          <Svg width={chartWidth + 80} height={chartHeight + 40}>
            {/* Gradients definition */}
            <Defs>
              <SvgLinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                <Stop offset="33%" stopColor="#14B8A6" stopOpacity="1" />
                <Stop offset="66%" stopColor="#3B82F6" stopOpacity="1" />
                <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
                <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>

            {/* Grid lines */}
            <Line x1="40" y1="10" x2={chartWidth + 40} y2="10" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <Line x1="40" y1={chartHeight / 2 + 10} x2={chartWidth + 40} y2={chartHeight / 2 + 10} stroke="rgba(107, 114, 128, 0.2)" strokeWidth="1" strokeDasharray="4,4" />
            <Line x1="40" y1={chartHeight + 10} x2={chartWidth + 40} y2={chartHeight + 10} stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />

            {/* Area fill under graph */}
            <Polygon
              points={`${sparklinePoints} ${chartWidth + 40},${chartHeight + 10} 40,${chartHeight + 10}`}
              fill="url(#areaGradient)"
            />

            {/* Sparkline glow layer */}
            <Polyline
              points={sparklinePoints}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            {/* Sparkline with gradient */}
            <Polyline
              points={sparklinePoints}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points with color coding and glow */}
            {accuracyData.map((accuracy, index) => {
              const x = 40 + index * stepX;
              const y = chartHeight - ((accuracy - minAccuracy) / range) * chartHeight + 10;
              const isToday = index === accuracyData.length - 1;
              const isMilestone = accuracy >= 85;

              // Color code by accuracy
              let pointColor = '#FFD63A'; // Gold for medium
              if (accuracy >= 85) pointColor = '#10B981'; // Green for excellent
              else if (accuracy < 70) pointColor = '#EF4444'; // Red for needs work

              return (
                <React.Fragment key={index}>
                  {/* Outer glow effect */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={isToday ? "14" : "10"}
                    fill={pointColor}
                    opacity="0.2"
                  />
                  {/* Mid glow effect */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={isToday ? "10" : "7"}
                    fill={pointColor}
                    opacity="0.4"
                  />
                  {/* Main point */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={isToday ? "6" : "5"}
                    fill={pointColor}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                </React.Fragment>
              );
            })}

            {/* Y-axis labels */}
            <SvgText
              x="5"
              y="15"
              fontSize="10"
              fill="#D1D5DB"
              fontWeight="600"
            >
              {Math.round(maxAccuracy)}%
            </SvgText>
            <SvgText
              x="5"
              y={chartHeight + 15}
              fontSize="10"
              fill="#D1D5DB"
              fontWeight="600"
            >
              {Math.round(minAccuracy)}%
            </SvgText>

            {/* X-axis date labels - show all 7 days */}
            {recent.daily_breakdown.map((day, index) => {
              const x = 40 + index * stepX;
              const date = new Date(day.date);
              const dayLabel = date.getDate().toString(); // Just the day number (e.g., "19", "22", "25")

              return (
                <SvgText
                  key={`date-${index}`}
                  x={x}
                  y={chartHeight + 30}
                  fontSize="9"
                  fill="#9CA3AF"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {dayLabel}
                </SvgText>
              );
            })}
          </Svg>
        </View>

        {/* Quick Insights */}
        <View style={styles.insightsRow}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Most Practiced</Text>
            <Text style={styles.insightValue}>
              {mostPracticedLanguage.charAt(0).toUpperCase() + mostPracticedLanguage.slice(1)}
            </Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Favorite Type</Text>
            <Text style={styles.insightValue}>{formatTypeName(mostPracticedType)}</Text>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Needs Work</Text>
            <Text style={styles.insightValue}>{weakestLevel}</Text>
          </View>
        </View>

        {/* Detailed Breakdown (Always Visible) */}
        <View style={styles.detailsContainer}>
          <View style={styles.divider} />

          {/* Daily Breakdown */}
          <Text style={styles.detailsTitle}>📅 Daily Breakdown</Text>
          <View style={styles.dailyGrid}>
            {recent.daily_breakdown.slice(-maxDays).map((day, index, arr) => {
              const isToday = index === arr.length - 1; // Last item is today
              const accuracy = day.accuracy ?? 0;
              const challenges = day.challenges ?? 0;

              // Determine color based on accuracy and activity
              let backgroundColor: string;
              if (challenges === 0) {
                // No activity - dark gray
                backgroundColor = '#374151';
              } else if (accuracy === 100) {
                // Perfect - green
                backgroundColor = '#10B981';
              } else if (accuracy >= 75) {
                // Great - teal
                backgroundColor = '#14B8A6';
              } else if (accuracy >= 50) {
                // Good - yellow
                backgroundColor = '#FFD63A';
              } else {
                // Needs work - red
                backgroundColor = '#EF4444';
              }

              return (
                <View
                  key={index}
                  style={[
                    styles.dailyCalendarBox,
                    { backgroundColor },
                    isToday && styles.dailyCalendarBoxToday,
                  ]}
                >
                  <Text style={styles.dailyCalendarDay}>
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                    })}
                  </Text>
                  <Text style={styles.dailyCalendarDate}>
                    {new Date(day.date).getDate()}
                  </Text>
                  <Text style={styles.dailyCalendarAccuracy}>
                    {challenges > 0 ? `${Math.round(accuracy)}%` : '-'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
