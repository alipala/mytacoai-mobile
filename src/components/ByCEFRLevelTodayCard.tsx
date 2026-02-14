/**
 * By CEFR Level Today Card
 * Displays today's CEFR level breakdown with stats
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDailyStats } from '../hooks/useStats';

const { width, height } = Dimensions.get('window');
const MAX_CARD_HEIGHT = height * 0.5; // Half of screen height

interface ByCEFRLevelTodayCardProps {
  onRefresh?: () => void;
}

export default function ByCEFRLevelTodayCard({ onRefresh }: ByCEFRLevelTodayCardProps) {
  const { t } = useTranslation();
  const { daily, isLoading } = useDailyStats(true);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Bouncing arrow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Color rotation matching main stat boxes
  const STAT_COLORS = ['#F75A5A', '#FBBF24', '#14B8A6', '#8B5CF6'];

  // Get CEFR level icon
  const getLevelIcon = (level: string): string => {
    const iconMap: Record<string, string> = {
      'a1': 'star-outline',
      'a2': 'star',
      'b1': 'medal-outline',
      'b2': 'medal',
      'c1': 'trophy-outline',
      'c2': 'trophy',
    };
    return iconMap[level.toLowerCase()] || 'ribbon';
  };

  // Format CEFR level names
  const formatLevel = (level: string): string => {
    return level.toUpperCase();
  };

  // Get level description
  const getLevelDescription = (level: string): string => {
    const descMap: Record<string, string> = {
      'a1': 'Beginner',
      'a2': 'Elementary',
      'b1': 'Intermediate',
      'b2': 'Upper Intermediate',
      'c1': 'Advanced',
      'c2': 'Proficient',
    };
    return descMap[level.toLowerCase()] || '';
  };

  // Debug logging - MUST be called before any early returns
  useEffect(() => {
    if (daily) {
      console.log('[ByCEFRLevelTodayCard] Daily data:', {
        total_challenges: daily.overall?.total_challenges,
        by_level_exists: !!daily.by_level,
        by_level_keys: daily.by_level ? Object.keys(daily.by_level) : [],
        by_level_data: daily.by_level,
      });
    }
  }, [daily]);

  // Determine what to render (all hooks must be called before this)
  let contentToRender: 'loading' | 'empty' | 'emptyToday' | 'data' = 'data';

  if (isLoading && !daily) {
    contentToRender = 'loading';
  } else if (!daily) {
    contentToRender = 'empty';
  } else if (daily.overall.total_challenges === 0 || !daily.by_level || Object.keys(daily.by_level).length === 0) {
    contentToRender = 'emptyToday';
  }

  // Loading state
  if (contentToRender === 'loading') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0D2832', '#0B1A1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F75A5A" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  // No data state
  if (contentToRender === 'empty') {
    return null;
  }

  // Empty state (no challenges today)
  if (contentToRender === 'emptyToday') {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FEF2F2', '#FEE2E2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.emptyBanner}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="ribbon" size={36} color="#DC2626" />
            </View>

            <Text style={styles.emptyTitle}>No CEFR Levels Today</Text>

            <Text style={styles.emptyMessage}>
              Challenge yourself at different difficulty levels!
            </Text>

            <View style={styles.scrollIndicator}>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons name="chevron-down" size={24} color="#DC2626" />
              </Animated.View>
              <Text style={styles.scrollText}>Choose quest below</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Prepare CEFR level data (sort by level: A1, A2, B1, B2, C1, C2)
  const levelOrder = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  const levelEntries = Object.entries(daily.by_level).sort((a, b) => {
    const indexA = levelOrder.indexOf(a[0].toLowerCase());
    const indexB = levelOrder.indexOf(b[0].toLowerCase());
    return indexA - indexB;
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#0D2832', '#0B1A1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="ribbon" size={32} color="#FCA5A5" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>By CEFR Level Today</Text>
              <Text style={styles.headerSubtitle}>Today's practice</Text>
            </View>
          </View>
        </View>

        {/* CEFR Levels Grid */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.levelsGrid}>
            {levelEntries.map(([level, stats], index) => {
              const levelIconName = getLevelIcon(level);
              const solidColor = STAT_COLORS[index % STAT_COLORS.length];

              return (
                <View
                  key={level}
                  style={[styles.levelItem, { backgroundColor: solidColor }]}
                >
                  <View style={styles.levelIcon}>
                    <Ionicons name={levelIconName as any} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.levelInfo}>
                    <View style={styles.levelNameRow}>
                      <Text style={styles.levelName}>{formatLevel(level)}</Text>
                      <Text style={styles.levelDescription}>• {getLevelDescription(level)}</Text>
                    </View>
                    <Text style={styles.levelStats}>
                      {stats.total_challenges} • {Math.round(stats.accuracy)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: MAX_CARD_HEIGHT,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(247, 90, 90, 0.2)',
    shadowColor: '#F75A5A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    height: MAX_CARD_HEIGHT,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FCA5A5',
    marginTop: 2,
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
  },
  levelsGrid: {
    gap: 8,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  levelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  levelName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelDescription: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: 4,
  },
  levelStats: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  emptyBanner: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(153, 27, 27, 0.2)',
    width: '100%',
  },
  scrollText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '500',
    marginTop: 4,
  },
});
