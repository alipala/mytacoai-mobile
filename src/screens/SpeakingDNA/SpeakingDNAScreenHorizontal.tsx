/**
 * Speaking DNA Screen - Horizontal Paging Layout
 * ==============================================
 *
 * A modern, non-scrolling design with 3 swipeable pages:
 * - Page 1: Full-screen interactive radar chart with colorful gradient
 * - Page 2: All 6 DNA strand skill cards
 * - Page 3: Key Insights, Strengths, Focus Areas, Breakthroughs
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { speakingDNAService } from '../../services/SpeakingDNAService';
import { StripeService } from '../../api/generated';
import { SpeakingDNAProfile, SpeakingBreakthrough, DNAStrandKey } from '../../types/speakingDNA';

// Components
import { InteractiveRadarChartEnhanced } from './components/InteractiveRadarChartEnhanced';

// Constants
import { DNA_COLORS, DNA_STRAND_LABELS, THEME_COLORS, getStrandScore } from './constants.OLD';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface SpeakingDNAScreenHorizontalProps {
  navigation: any;
  route: {
    params?: {
      language?: string;
    };
  };
}

// ============================================================================
// PAGE INDICATOR COMPONENT
// ============================================================================

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ currentPage, totalPages }) => {
  return (
    <View style={styles.pageIndicatorContainer}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pageIndicatorDot,
            currentPage === index && styles.pageIndicatorDotActive,
          ]}
        />
      ))}
    </View>
  );
};

// ============================================================================
// PAGE 1: RADAR CHART PAGE
// ============================================================================

interface RadarPageProps {
  profile: SpeakingDNAProfile;
}

const RadarPage: React.FC<RadarPageProps> = ({ profile }) => {
  const [selectedStrand, setSelectedStrand] = useState<DNAStrandKey | null>(null);

  // Prepare radar data
  const strands = Object.keys(DNA_STRAND_LABELS) as DNAStrandKey[];
  const radarData = strands.map((strand) => ({
    strand,
    label: DNA_STRAND_LABELS[strand],
    score: getStrandScore(profile.dna_strands[strand]),
    color: DNA_COLORS[strand],
  }));

  const handleStrandTap = (strand: DNAStrandKey) => {
    setSelectedStrand(selectedStrand === strand ? null : strand);
  };

  const selectedStrandData = selectedStrand
    ? radarData.find(d => d.strand === selectedStrand)
    : null;

  return (
    <View style={styles.page}>
      {/* Colorful Gradient Background */}
      <LinearGradient
        colors={['#14B8A6', '#0D9488', '#F0FDFA', '#FFFFFF']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.radarBackground}
      />

      {/* Radar Chart Container */}
      <View style={styles.radarContainer}>
        <InteractiveRadarChartEnhanced
          data={radarData}
          size={SCREEN_WIDTH - 40}
          onStrandTap={handleStrandTap}
          selectedStrand={selectedStrand}
        />
      </View>

      {/* Selected Strand Tooltip */}
      {selectedStrandData && (
        <Animated.View style={styles.tooltip}>
          <View style={[styles.tooltipHeader, { backgroundColor: selectedStrandData.color }]}>
            <Text style={styles.tooltipTitle}>{selectedStrandData.label}</Text>
            <Text style={styles.tooltipScore}>{selectedStrandData.score}%</Text>
          </View>
          <View style={styles.tooltipBody}>
            <Text style={styles.tooltipDescription}>
              {getStrandDescription(selectedStrand, selectedStrandData.score)}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.sessions_analyzed}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(profile.total_speaking_minutes)}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="school" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.statLabel}>{profile.overall_profile.speaker_archetype.split(' ')[1] || 'Learner'}</Text>
        </View>
      </View>

      {/* Swipe Hint */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>Swipe for details</Text>
        <Ionicons name="chevron-forward" size={16} color={THEME_COLORS.text.secondary} />
      </View>
    </View>
  );
};

// ============================================================================
// PAGE 2: SKILL CARDS PAGE
// ============================================================================

interface SkillCardsPageProps {
  profile: SpeakingDNAProfile;
}

const SkillCardsPage: React.FC<SkillCardsPageProps> = ({ profile }) => {
  const strands = Object.keys(DNA_STRAND_LABELS) as DNAStrandKey[];

  return (
    <View style={styles.page}>
      <View style={styles.skillCardsContainer}>
        <Text style={styles.pageTitle}>Your DNA Strands</Text>
        <Text style={styles.pageSubtitle}>Tap any card for details</Text>

        <View style={styles.skillCardsGrid}>
          {strands.map((strand, index) => {
            const score = getStrandScore(profile.dna_strands[strand]);
            const color = DNA_COLORS[strand];
            const label = DNA_STRAND_LABELS[strand];
            const level = getScoreLevel(score);

            return (
              <TouchableOpacity
                key={strand}
                style={styles.skillCard}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[color, adjustColor(color, -20)]}
                  style={styles.skillCardGradient}
                >
                  <View style={styles.skillCardIcon}>
                    <Ionicons name={getStrandIcon(strand)} size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.skillCardLabel}>{label}</Text>
                  <Text style={styles.skillCardScore}>{score}%</Text>
                  <View style={styles.skillCardProgressBg}>
                    <View
                      style={[
                        styles.skillCardProgress,
                        { width: `${score}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.skillCardLevel}>{level}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// PAGE 3: INSIGHTS PAGE
// ============================================================================

interface InsightsPageProps {
  profile: SpeakingDNAProfile;
  breakthroughs: SpeakingBreakthrough[];
}

const InsightsPage: React.FC<InsightsPageProps> = ({ profile, breakthroughs }) => {
  const { strengths, growth_areas } = profile.overall_profile;

  return (
    <View style={styles.page}>
      <View style={styles.insightsContainer}>
        <Text style={styles.pageTitle}>Key Insights</Text>

        {/* Top Strengths */}
        <View style={styles.insightSection}>
          <View style={styles.insightHeader}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.insightSectionTitle}>Top Strengths</Text>
          </View>
          <View style={styles.insightCards}>
            {strengths.slice(0, 3).map((strength, index) => (
              <View key={index} style={styles.strengthCard}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.strengthText}>{formatText(strength)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Focus Areas */}
        <View style={styles.insightSection}>
          <View style={styles.insightHeader}>
            <Ionicons name="trending-up" size={20} color="#3B82F6" />
            <Text style={styles.insightSectionTitle}>Focus Areas</Text>
          </View>
          <View style={styles.insightCards}>
            {growth_areas.slice(0, 3).map((area, index) => (
              <View key={index} style={styles.focusCard}>
                <Ionicons name="arrow-up" size={18} color="#F59E0B" />
                <Text style={styles.focusText}>{formatText(area)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Breakthrough */}
        {breakthroughs.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="trophy" size={20} color="#8B5CF6" />
              <Text style={styles.insightSectionTitle}>Recent Breakthrough</Text>
            </View>
            <LinearGradient
              colors={getCategoryColors(breakthroughs[0].category)}
              style={styles.breakthroughCard}
            >
              <Text style={styles.breakthroughEmoji}>🎉</Text>
              <Text style={styles.breakthroughTitle}>{breakthroughs[0].title}</Text>
              <Text style={styles.breakthroughDesc}>{breakthroughs[0].description}</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatText = (text: string): string => {
  if (text.includes('_') || /[a-z][A-Z]/.test(text)) {
    return text
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
  return text;
};

const getStrandDescription = (strand: DNAStrandKey, score: number): string => {
  const descriptions: Record<DNAStrandKey, Record<string, string>> = {
    rhythm: {
      low: 'Work on maintaining a steady speaking pace',
      mid: 'Your speaking rhythm is developing well',
      high: 'Excellent flow and natural pacing!',
    },
    confidence: {
      low: 'Building your speaking confidence',
      mid: 'Growing more comfortable speaking',
      high: 'You speak with great confidence!',
    },
    vocabulary: {
      low: 'Expanding your word choices',
      mid: 'Good variety in vocabulary use',
      high: 'Rich and diverse vocabulary!',
    },
    accuracy: {
      low: 'Focus on grammar and pronunciation',
      mid: 'Solid accuracy in your speech',
      high: 'Excellent precision and correctness!',
    },
    learning: {
      low: 'Taking on new challenges',
      mid: 'Actively learning and improving',
      high: 'Amazing learning momentum!',
    },
    emotional: {
      low: 'Developing emotional expression',
      mid: 'Good emotional connection',
      high: 'Expressive and engaging speaker!',
    },
  };

  const level = score < 40 ? 'low' : score < 70 ? 'mid' : 'high';
  return descriptions[strand][level];
};

const getScoreLevel = (score: number): string => {
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Comfortable';
  if (score >= 40) return 'Developing';
  return 'Building';
};

const getStrandIcon = (strand: DNAStrandKey): keyof typeof Ionicons.glyphMap => {
  const icons: Record<DNAStrandKey, keyof typeof Ionicons.glyphMap> = {
    rhythm: 'pulse',
    confidence: 'trending-up',
    vocabulary: 'book',
    accuracy: 'checkmark-done',
    learning: 'school',
    emotional: 'heart',
  };
  return icons[strand];
};

const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const getCategoryColors = (category: string): string[] => {
  const colors: Record<string, string[]> = {
    confidence: ['#9B59B6', '#8E44AD'],
    vocabulary: ['#2ECC71', '#27AE60'],
    learning: ['#3498DB', '#2980B9'],
    rhythm: ['#4ECDC4', '#45B7B0'],
    accuracy: ['#E67E22', '#D35400'],
    emotional: ['#E91E63', '#C2185B'],
  };
  return colors[category] || ['#14B8A6', '#0D9488'];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SpeakingDNAScreenHorizontal: React.FC<SpeakingDNAScreenHorizontalProps> = ({
  navigation,
  route
}) => {
  const language = route.params?.language || 'english';

  // State
  const [profile, setProfile] = useState<SpeakingDNAProfile | null>(null);
  const [breakthroughs, setBreakthroughs] = useState<SpeakingBreakthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Refs
  const pagerRef = useRef<PagerView>(null);

  /**
   * Load DNA profile and breakthroughs
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);

      // Check premium access
      const subscriptionStatus = await StripeService.getSubscriptionStatusApiStripeSubscriptionStatusGet();
      const hasPremium = subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan);

      if (!hasPremium) {
        setError('Speaking DNA is a premium feature. Please upgrade your subscription.');
        setLoading(false);
        return;
      }

      // Load profile
      const profileData = await speakingDNAService.getProfile(language, forceRefresh);
      setProfile(profileData);

      // Load breakthroughs if profile exists
      if (profileData) {
        const breakthroughsData = await speakingDNAService.getBreakthroughs(language, {
          limit: 5,
          forceRefresh,
        });
        setBreakthroughs(breakthroughsData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('[SpeakingDNAScreenHorizontal] Error loading data:', err);
      setError(err.message || 'Failed to load DNA profile');
      setLoading(false);
    }
  }, [language]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle page change
   */
  const handlePageSelected = (event: any) => {
    setCurrentPage(event.nativeEvent.position);
  };

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Speaking DNA</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Analyzing your speaking patterns...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // RENDER ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Speaking DNA</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle" size={80} color="#EF4444" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData(true)}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // RENDER NO PROFILE STATE
  // ============================================================================

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Speaking DNA</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerContent}>
            <Ionicons name="flask" size={80} color={THEME_COLORS.primary} />
            <Text style={styles.emptyTitle}>Build Your DNA Profile</Text>
            <Text style={styles.emptyText}>
              Complete a speaking session to create your unique Speaking DNA profile.
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.goBack()}>
              <Text style={styles.startButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // MAIN RENDER - Horizontal Paging
  // ============================================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Speaking DNA</Text>
          <View style={styles.languageBadge}>
            <Ionicons name="globe" size={14} color="#FFFFFF" />
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Pager View - 3 Pages */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* Page 1: Radar Chart */}
        <View key="radar" style={styles.pageWrapper}>
          <RadarPage profile={profile} />
        </View>

        {/* Page 2: Skill Cards */}
        <View key="skills" style={styles.pageWrapper}>
          <SkillCardsPage profile={profile} />
        </View>

        {/* Page 3: Insights */}
        <View key="insights" style={styles.pageWrapper}>
          <InsightsPage profile={profile} breakthroughs={breakthroughs} />
        </View>
      </PagerView>

      {/* Page Indicator */}
      <PageIndicator currentPage={currentPage} totalPages={3} />
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  startButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pagerView: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Page Indicator
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  pageIndicatorDotActive: {
    width: 24,
    backgroundColor: THEME_COLORS.primary,
  },

  // Page 1: Radar
  radarBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  radarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  tooltip: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tooltipScore: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tooltipBody: {
    padding: 16,
  },
  tooltipDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    gap: 4,
  },
  swipeHintText: {
    fontSize: 13,
    color: THEME_COLORS.text.secondary,
  },

  // Page 2: Skill Cards
  skillCardsContainer: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  skillCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  skillCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  skillCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  skillCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  skillCardScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  skillCardProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  skillCardProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  skillCardLevel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Page 3: Insights
  insightsContainer: {
    flex: 1,
    padding: 20,
  },
  insightSection: {
    marginBottom: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  insightSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  insightCards: {
    gap: 8,
  },
  strengthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    gap: 10,
  },
  strengthText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    gap: 10,
  },
  focusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  breakthroughCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  breakthroughEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  breakthroughTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  breakthroughDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SpeakingDNAScreenHorizontal;
