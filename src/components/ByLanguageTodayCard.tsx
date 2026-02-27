/**
 * By Language Today Card
 * Displays today's language breakdown with stats
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
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { width, height } = Dimensions.get('window');
const MAX_CARD_HEIGHT = height * 0.5; // Half of screen height

const LANGUAGE_FLAGS: Record<string, React.FC<any>> = {
  'english': EnglishFlag,
  'spanish': SpanishFlag,
  'french': FrenchFlag,
  'german': GermanFlag,
  'dutch': DutchFlag,
  'portuguese': PortugueseFlag,
};

interface ByLanguageTodayCardProps {
  onRefresh?: () => void;
}

export default function ByLanguageTodayCard({ onRefresh }: ByLanguageTodayCardProps) {
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
  const STAT_COLORS = ['#14B8A6', '#F75A5A', '#8B5CF6', '#FBBF24'];

  // Format language names
  const formatLanguage = (language: string): string => {
    return language.charAt(0).toUpperCase() + language.slice(1);
  };

  // Determine what to render (all hooks must be called before this)
  let contentToRender: 'loading' | 'empty' | 'emptyToday' | 'data' = 'data';

  if (isLoading && !daily) {
    contentToRender = 'loading';
  } else if (!daily) {
    contentToRender = 'empty';
  } else if (daily.overall.total_challenges === 0 || !daily.by_language || Object.keys(daily.by_language).length === 0) {
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
            <ActivityIndicator size="small" color="#4ECFBF" />
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
          colors={['#F0FDFA', '#CCFBF1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.emptyBanner}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="globe" size={36} color="#14B8A6" />
            </View>

            <Text style={styles.emptyTitle}>No Language Practice Today</Text>

            <Text style={styles.emptyMessage}>
              Start a challenge to track your language progress!
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
                <Ionicons name="chevron-down" size={24} color="#14B8A6" />
              </Animated.View>
              <Text style={styles.scrollText}>Choose quest below</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Prepare language data
  const languageEntries = Object.entries(daily.by_language);

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
            <Ionicons name="globe" size={32} color="#5EEAD4" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>By Language Today</Text>
              <Text style={styles.headerSubtitle}>Today's practice</Text>
            </View>
          </View>
        </View>

        {/* Language Grid */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.languagesGrid}>
            {languageEntries.map(([language, stats], index) => {
              const solidColor = STAT_COLORS[index % STAT_COLORS.length];

              return (
                <View
                  key={language}
                  style={[styles.languageItem, { backgroundColor: solidColor }]}
                >
                  <View style={styles.languageIcon}>
                    {(() => {
                      const FlagComponent = LANGUAGE_FLAGS[language.toLowerCase()];
                      return FlagComponent ? <FlagComponent width={20} height={20} /> : null;
                    })()}
                  </View>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName} numberOfLines={1}>
                      {formatLanguage(language)}
                    </Text>
                    <Text style={styles.languageStats}>
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
    borderColor: 'rgba(78, 207, 191, 0.2)',
    shadowColor: '#4ECFBF',
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
    color: '#99F6E4',
    marginTop: 2,
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
  },
  languagesGrid: {
    gap: 8,
  },
  languageItem: {
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
  languageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  languageStats: {
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
    color: '#115E59',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#134E4A',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 118, 110, 0.2)',
    width: '100%',
  },
  scrollText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
    marginTop: 4,
  },
});
