/**
 * Speaking DNA Screen V2
 *
 * Complete redesign of the Speaking DNA feature
 * with immersive vertical scroll experience
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  InteractiveRadarChart,
  DNAStickyHeader,
  DNAStrandCarousel,
  InsightsHub,
  EvolutionTimeline,
  BreakthroughsSection,
} from './components';
import { BreakthroughModal } from '../../components/SpeakingDNA/BreakthroughModal';
import { COLORS, SHADOWS, SCROLL_RANGES } from './constants';
import {
  RadarDataPoint,
  TimelineWeek,
  BreakthroughCard,
} from './types';
import type { DNAStrandKey } from '../../types/speakingDNA';
import type { SpeakingDNAProfile, DNAHistorySnapshot, SpeakingBreakthrough } from '../../types/speakingDNA';
import { speakingDNAService as SpeakingDNAService } from '../../services/SpeakingDNAService';
import { getStrandScore } from './constants.OLD';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Speaking DNA Screen V2
 */
export const SpeakingDNAScreenV2: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<SpeakingDNAProfile | null>(null);
  const [evolution, setEvolution] = useState<DNAHistorySnapshot[]>([]);
  const [breakthroughs, setBreakthroughs] = useState<SpeakingBreakthrough[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<DNAStrandKey | null>(null);
  const [selectedBreakthrough, setSelectedBreakthrough] = useState<SpeakingBreakthrough | null>(null);
  const [breakthroughModalVisible, setBreakthroughModalVisible] = useState(false);

  // Get language from route or default to 'dutch'
  const language = route.params?.language || 'dutch';

  /**
   * Fetch DNA data
   */
  const fetchDNAData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Fetch all data in parallel
      const [profileData, evolutionData, breakthroughsData] = await Promise.all([
        SpeakingDNAService.getProfile(language, isRefresh),
        SpeakingDNAService.getEvolution(language, 12, isRefresh),
        SpeakingDNAService.getBreakthroughs(language, { limit: 20, uncelebratedOnly: false, forceRefresh: isRefresh }),
      ]);

      console.log('[SpeakingDNAScreenV2] Profile loaded:', {
        archetype: profileData?.overall_profile?.speaker_archetype,
        sessions: profileData?.sessions_analyzed,
        minutes: profileData?.total_speaking_minutes,
        strands: Object.keys(profileData?.dna_strands || {}).map(key => ({
          key,
          score: getStrandScore((profileData?.dna_strands as any)[key]),
        })),
      });

      setProfile(profileData);
      setEvolution(evolutionData);
      setBreakthroughs(breakthroughsData);
    } catch (err) {
      console.error('Error fetching DNA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load DNA data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchDNAData();
  }, [fetchDNAData]);

  /**
   * Scroll handler
   */
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  /**
   * Prepare radar data
   */
  const radarData: RadarDataPoint[] = useMemo(() => {
    if (!profile) return [];

    return [
      {
        strand: 'rhythm',
        score: getStrandScore(profile.dna_strands.rhythm),
        label: 'Rhythm',
      },
      {
        strand: 'confidence',
        score: getStrandScore(profile.dna_strands.confidence),
        label: 'Confidence',
      },
      {
        strand: 'vocabulary',
        score: getStrandScore(profile.dna_strands.vocabulary),
        label: 'Vocabulary',
      },
      {
        strand: 'accuracy',
        score: getStrandScore(profile.dna_strands.accuracy),
        label: 'Accuracy',
      },
      {
        strand: 'learning',
        score: getStrandScore(profile.dna_strands.learning),
        label: 'Learning',
      },
      {
        strand: 'emotional',
        score: getStrandScore(profile.dna_strands.emotional),
        label: 'Emotional',
      },
    ];
  }, [profile]);

  /**
   * Prepare timeline data
   */
  const timelineWeeks: TimelineWeek[] = useMemo(() => {
    return evolution.map((snapshot, index) => ({
      weekNumber: index + 1,
      weekStart: new Date(snapshot.week_start),
      sessions: snapshot.week_stats.sessions_completed,
      minutes: snapshot.week_stats.total_minutes,
      strands: snapshot.strand_snapshots,
      isCurrent: index === evolution.length - 1,
    }));
  }, [evolution]);

  /**
   * Prepare breakthrough cards
   */
  const breakthroughCards: BreakthroughCard[] = useMemo(() => {
    return breakthroughs.map((breakthrough) => ({
      id: breakthrough._id,
      title: formatBreakthroughTitle(breakthrough.breakthrough_type),
      description: formatBreakthroughDescription(breakthrough),
      emoji: getBreakthroughEmoji(breakthrough.breakthrough_type),
      type: breakthrough.breakthrough_type,
      gradient: getBreakthroughGradient(breakthrough.breakthrough_type),
      celebrated: breakthrough.celebrated,
      createdAt: new Date(breakthrough.created_at),
    }));
  }, [breakthroughs]);

  /**
   * Animated hero section style (radar chart with parallax)
   */
  const animatedHeroStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      SCROLL_RANGES.radarParallax.inputRange,
      SCROLL_RANGES.radarParallax.translateYOutputRange,
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      SCROLL_RANGES.radarParallax.inputRange,
      SCROLL_RANGES.radarParallax.scaleOutputRange,
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      SCROLL_RANGES.radarParallax.inputRange,
      SCROLL_RANGES.radarParallax.opacityOutputRange,
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY }, { scale: scale }],
      opacity,
    };
  });

  /**
   * Handle strand tap
   */
  const handleStrandTap = useCallback((strand: DNAStrandKey) => {
    setSelectedStrand(strand);
    // TODO: Show strand detail bottom sheet
    console.log('Strand tapped:', strand);
  }, []);

  /**
   * Handle strand long press
   */
  const handleStrandLongPress = useCallback((strand: DNAStrandKey) => {
    // TODO: Show strand evolution overlay
    console.log('Strand long pressed:', strand);
  }, []);

  /**
   * Handle week press
   */
  const handleWeekPress = useCallback((week: TimelineWeek) => {
    // TODO: Show week comparison overlay
    console.log('Week pressed:', week);
  }, []);

  /**
   * Handle breakthrough press
   */
  const handleBreakthroughPress = useCallback((breakthrough: BreakthroughCard) => {
    // Find the full breakthrough data from the breakthroughs array
    const fullBreakthrough = breakthroughs.find(b => b._id === breakthrough.id);
    if (fullBreakthrough) {
      setSelectedBreakthrough(fullBreakthrough);
      setBreakthroughModalVisible(true);
    }
  }, [breakthroughs]);

  /**
   * Handle see all breakthroughs
   * Removed: BreakthroughsList screen doesn't exist yet
   */
  // const handleSeeAllBreakthroughs = useCallback(() => {
  //   navigation.navigate('BreakthroughsList', { language });
  // }, [navigation, language]);

  /**
   * Handle header actions
   */
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share DNA profile');
  }, []);

  const handleSettings = useCallback(() => {
    // TODO: Navigate to DNA settings
    console.log('Open DNA settings');
  }, []);

  /**
   * Loading state
   */
  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={styles.loadingText}>Loading your Speaking DNA...</Text>
      </View>
    );
  }

  /**
   * Error state
   */
  if (error && !profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>Pull down to refresh</Text>
      </View>
    );
  }

  /**
   * Empty state (no profile yet)
   */
  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="flask" size={64} color={COLORS.primary[500]} />
        <Text style={styles.emptyTitle}>Build Your Speaking DNA</Text>
        <Text style={styles.emptyDescription}>
          Complete your first session to see your unique speaking profile
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <DNAStickyHeader
        scrollY={scrollY}
        title="Your Speaking DNA"
        onBack={handleBack}
        onShare={handleShare}
        onSettings={handleSettings}
      />

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 100 + insets.top }, // Account for sticky header
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDNAData(true)}
            tintColor={COLORS.primary[500]}
            progressViewOffset={100 + insets.top}
          />
        }
      >
        {/* Hero Section - Radar Chart First! */}
        <Animated.View style={[styles.heroSection, animatedHeroStyle]}>
          {/* Language Badge - Floating */}
          <View style={styles.floatingLanguageBadge}>
            <Ionicons name="globe-outline" size={12} color={COLORS.primary[600]} />
            <Text style={styles.languageBadgeText}>{language.toUpperCase()}</Text>
          </View>

          {/* Large Radar Chart - HERO */}
          <View style={styles.radarContainer}>
            <InteractiveRadarChart
              data={radarData}
              onStrandTap={handleStrandTap}
              onStrandLongPress={handleStrandLongPress}
              animated={true}
            />
          </View>

          {/* Compact Stats Bar Below Radar */}
          <View style={styles.compactStatsBar}>
            <View style={styles.compactStatItem}>
              <Text style={styles.compactStatValue}>{profile.sessions_analyzed}</Text>
              <Text style={styles.compactStatLabel}>Sessions</Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <Text style={styles.compactStatValue}>{Math.round(profile.total_speaking_minutes)}</Text>
              <Text style={styles.compactStatLabel}>Minutes</Text>
            </View>
            <View style={styles.compactStatDivider} />
            <View style={styles.compactStatItem}>
              <Ionicons name="person-circle" size={16} color={COLORS.primary[500]} />
              <Text style={styles.compactArchetype} numberOfLines={1}>
                {String(profile.overall_profile.speaker_archetype || 'Unique Speaker')
                  .replace('The ', '')}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* DNA Strand Carousel */}
        <DNAStrandCarousel
          strands={profile.dna_strands}
          onStrandPress={handleStrandTap}
        />

        {/* Insights Hub */}
        <InsightsHub
          strengths={Array.isArray(profile.overall_profile.strengths)
            ? profile.overall_profile.strengths.map(s => typeof s === 'string' ? s : JSON.stringify(s))
            : []}
          growthAreas={Array.isArray(profile.overall_profile.growth_areas)
            ? profile.overall_profile.growth_areas.map(g => typeof g === 'string' ? g : JSON.stringify(g))
            : []}
        />

        {/* Evolution Timeline */}
        {timelineWeeks.length > 0 && (
          <EvolutionTimeline
            weeks={timelineWeeks}
            onWeekPress={handleWeekPress}
          />
        )}

        {/* Breakthroughs Section */}
        {breakthroughCards.length > 0 && (
          <BreakthroughsSection
            breakthroughs={breakthroughCards}
            onBreakthroughPress={handleBreakthroughPress}
          />
        )}

        {/* Bottom spacing */}
        <View style={{ height: insets.bottom + 40 }} />
      </Animated.ScrollView>

      {/* Breakthrough Modal */}
      <BreakthroughModal
        breakthrough={selectedBreakthrough}
        visible={breakthroughModalVisible}
        onClose={() => {
          setBreakthroughModalVisible(false);
          setSelectedBreakthrough(null);
        }}
      />
    </View>
  );
};

/**
 * Helper functions
 */
function formatBreakthroughTitle(type: string): string {
  const typeString = typeof type === 'string' ? type : String(type);
  return typeString
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatBreakthroughDescription(breakthrough: SpeakingBreakthrough): string {
  // If description exists and is a string, use it
  if (breakthrough.description && typeof breakthrough.description === 'string') {
    return breakthrough.description;
  }

  // Otherwise, create a description from context
  const context = breakthrough.context;
  if (!context || typeof context !== 'object') {
    return 'Great progress! Keep up the amazing work.';
  }

  // Extract meaningful info from context
  const parts: string[] = [];

  if (context.session_type) {
    const sessionType = context.session_type === 'learning' ? 'practice session' : context.session_type;
    parts.push(`During your ${sessionType}`);
  }

  if (context.improvement_percent != null) {
    parts.push(`you improved by ${Math.round(context.improvement_percent)}%`);
  }

  if (context.new_level) {
    parts.push(`and reached ${context.new_level} level`);
  }

  if (context.metric_name) {
    parts.push(`in ${context.metric_name}`);
  }

  if (parts.length > 0) {
    return parts.join(' ') + '!';
  }

  return 'You achieved an important milestone in your learning journey!';
}

function getBreakthroughEmoji(type: string): string {
  const typeString = typeof type === 'string' ? type : String(type);
  const emojiMap: Record<string, string> = {
    confidence_jump: '🚀',
    vocabulary_expansion: '📚',
    challenge_accepted: '🏆',
    level_up: '⭐',
  };
  return emojiMap[typeString] || '🎉';
}

function getBreakthroughGradient(type: string): string[] {
  const typeString = typeof type === 'string' ? type : String(type);
  if (typeString.includes('confidence')) return ['#9B59B6', '#8E44AD'];
  if (typeString.includes('vocabulary')) return ['#2ECC71', '#27AE60'];
  return ['#14B8A6', '#0D9488'];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  floatingLanguageBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    ...SHADOWS.sm,
    zIndex: 10,
  },
  languageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary[600],
    letterSpacing: 0.5,
  },
  radarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    width: '100%',
    ...SHADOWS.sm,
  },
  compactStatItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  compactStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary[500],
  },
  compactStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  compactArchetype: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray[700],
    maxWidth: 80,
  },
  compactStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.gray[200],
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray[600],
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    marginTop: 16,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[600],
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

export default SpeakingDNAScreenV2;
