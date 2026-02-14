/**
 * By Challenge Type Today Card
 * Displays today's challenge type breakdown with stats
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

interface ByChallengeTypeTodayCardProps {
  onRefresh?: () => void;
}

export default function ByChallengeTypeTodayCard({ onRefresh }: ByChallengeTypeTodayCardProps) {
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
  const STAT_COLORS = ['#8B5CF6', '#FBBF24', '#F75A5A', '#14B8A6'];

  // Get challenge type icon
  const getChallengeTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'native_check': 'checkmark-circle',
      'story_builder': 'book',
      'brain_tickler': 'bulb',
      'micro_quiz': 'help-circle',
      'error_spotting': 'search',
      'smart_flashcard': 'flash',
      'swipe_fix': 'hand-left',
    };
    return iconMap[type] || 'game-controller';
  };

  // Format challenge type names
  const formatChallengeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'micro_quiz': 'Micro Quiz',
      'brain_tickler': 'Brain Tickler',
      'smart_flashcard': 'Smart Flashcard',
      'swipe_fix': 'Swipe Fix',
      'error_spotting': 'Error Spotting',
      'native_check': 'Native Check',
    };
    return typeMap[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Debug logging - MUST be called before any early returns
  useEffect(() => {
    if (daily) {
      console.log('[ByChallengeTypeTodayCard] Daily data:', {
        total_challenges: daily.overall?.total_challenges,
        by_type_exists: !!daily.by_type,
        by_type_keys: daily.by_type ? Object.keys(daily.by_type) : [],
        by_type_data: daily.by_type,
      });
    }
  }, [daily]);

  // Determine what to render (all hooks must be called before this)
  let contentToRender: 'loading' | 'empty' | 'emptyToday' | 'data' = 'data';

  if (isLoading && !daily) {
    contentToRender = 'loading';
  } else if (!daily) {
    contentToRender = 'empty';
  } else if (daily.overall.total_challenges === 0 || !daily.by_type || Object.keys(daily.by_type).length === 0) {
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
            <ActivityIndicator size="small" color="#8B5CF6" />
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
          colors={['#F5F3FF', '#EDE9FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.emptyBanner}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="game-controller" size={36} color="#8B5CF6" />
            </View>

            <Text style={styles.emptyTitle}>No Challenge Types Today</Text>

            <Text style={styles.emptyMessage}>
              Try different challenge types to boost your skills!
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
                <Ionicons name="chevron-down" size={24} color="#8B5CF6" />
              </Animated.View>
              <Text style={styles.scrollText}>Choose quest below</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Prepare challenge type data
  const typeEntries = Object.entries(daily.by_type);

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
            <Ionicons name="game-controller" size={32} color="#A78BFA" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>By Challenge Type Today</Text>
              <Text style={styles.headerSubtitle}>Today's practice</Text>
            </View>
          </View>
        </View>

        {/* Challenge Types Grid */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.typesGrid}>
            {typeEntries.map(([type, stats], index) => {
              const typeIconName = getChallengeTypeIcon(type);
              const solidColor = STAT_COLORS[index % STAT_COLORS.length];

              return (
                <View
                  key={type}
                  style={[styles.typeItem, { backgroundColor: solidColor }]}
                >
                  <View style={styles.typeIcon}>
                    <Ionicons name={typeIconName as any} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeName} numberOfLines={1}>
                      {formatChallengeType(type)}
                    </Text>
                    <Text style={styles.typeStats}>
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
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
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
    color: '#C4B5FD',
    marginTop: 2,
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
  },
  typesGrid: {
    gap: 8,
  },
  typeItem: {
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
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  typeStats: {
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
    color: '#5B21B6',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6D28D9',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(91, 33, 182, 0.2)',
    width: '100%',
  },
  scrollText: {
    fontSize: 12,
    color: '#6D28D9',
    fontWeight: '500',
    marginTop: 4,
  },
});
