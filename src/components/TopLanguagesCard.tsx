/**
 * Top Languages Card
 * Displays top 3 practiced languages with stats
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
import { useLifetimeProgress } from '../hooks/useStats';

const { width, height } = Dimensions.get('window');
const MAX_CARD_HEIGHT = height * 0.5; // Half of screen height

interface TopLanguagesCardProps {
  onRefresh?: () => void;
}

export default function TopLanguagesCard({ onRefresh }: TopLanguagesCardProps) {
  const { t } = useTranslation();
  const { lifetime, isLoading } = useLifetimeProgress(false, true);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  // Color rotation matching main stat boxes
  const STAT_COLORS = ['#14B8A6', '#F75A5A', '#8B5CF6'];

  // Loading state
  if (isLoading && !lifetime) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0D2832', '#0B1A1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#14B8A6" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  // No data state
  if (!lifetime || !lifetime.language_progress) {
    return null;
  }

  // Prepare Languages data
  const languageEntries = Object.entries(lifetime.language_progress || {});
  const topLanguages = languageEntries
    .sort((a, b) => b[1].total_challenges - a[1].total_challenges)
    .slice(0, 3);

  if (topLanguages.length === 0) {
    return null;
  }

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
            <Ionicons name="language" size={32} color="#4ECFBF" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>{t('explore.stats.top_languages')}</Text>
              <Text style={styles.headerSubtitle}>Most practiced</Text>
            </View>
          </View>
        </View>

        {/* Languages Grid */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.languagesGrid}>
            {topLanguages.map(([lang, progress], index) => {
              const totalChallenges = lifetime.summary.total_challenges;
              const percentage = (progress.total_challenges / totalChallenges) * 100;
              const solidColor = STAT_COLORS[index % STAT_COLORS.length];

              return (
                <View
                  key={lang}
                  style={[styles.languageItem, { backgroundColor: solidColor }]}
                >
                  <View style={styles.languageHeader}>
                    <Text style={styles.languageName}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                    <Text style={styles.languageCount}>
                      {progress.total_challenges}
                    </Text>
                  </View>
                  <View style={styles.languageProgressBar}>
                    <View
                      style={[
                        styles.languageProgressFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.languageLevel}>
                    {progress.highest_level} • {Math.round(percentage)}%
                  </Text>
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
    color: '#B4E4DD',
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
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  languageCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  languageProgressBar: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  languageProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  languageLevel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
