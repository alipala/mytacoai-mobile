/**
 * Speaking DNA Screen - Horizontal Paging Layout
 * ==============================================
 *
 * A modern, non-scrolling design with 2 swipeable pages:
 * - Page 1: Full-screen interactive radar chart (tap labels for detailed modal)
 * - Page 2: Key Insights, Strengths, Focus Areas, Breakthroughs
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
import { StrandDetailModal } from './components/StrandDetailModal';

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
  onStrandTapForModal: (strand: DNAStrandKey, label: string, score: number, color: string) => void;
}

const RadarPage: React.FC<RadarPageProps> = ({ profile, onStrandTapForModal }) => {
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
    const data = radarData.find(d => d.strand === strand);
    if (data) {
      setSelectedStrand(strand);
      onStrandTapForModal(strand, data.label, data.score, data.color);
    }
  };

  return (
    <View style={styles.page}>
      {/* Clean, subtle background for better chart visibility */}
      <LinearGradient
        colors={['#F9FAFB', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.2, 1]}
        style={styles.radarBackground}
      />

      {/* Radar Chart Container */}
      <View style={styles.radarContainer}>
        <View style={styles.chartWrapper}>
          <InteractiveRadarChartEnhanced
            data={radarData}
            size={SCREEN_WIDTH - 40}
            onStrandTap={handleStrandTap}
            selectedStrand={selectedStrand}
          />
        </View>
      </View>

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

      {/* Tap Hint */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>Tap labels for details • Swipe for insights</Text>
        <Ionicons name="chevron-forward" size={16} color={THEME_COLORS.text.secondary} />
      </View>
    </View>
  );
};

// ============================================================================
// PAGE 2: INSIGHTS PAGE - HELPER FUNCTIONS
// ============================================================================

interface GrowthInsight {
  title: string;
  action: string;
  icon: string;
}

interface StrengthInsight {
  title: string;
  description: string;
}

interface WeeklyFocus {
  goal: string;
  tip: string;
}

const getGrowthAreaInsights = (growthAreas: string[], strands: any): GrowthInsight[] => {
  const insights: Record<string, GrowthInsight> = {
    speaking_confidence: {
      title: 'Build Speaking Confidence',
      action: 'Start responses quickly, even if imperfect. Practice saying "I think..." to buy thinking time.',
      icon: 'trending-up',
    },
    grammar_accuracy: {
      title: 'Improve Grammar Accuracy',
      action: 'Focus on your common error patterns. Repeat corrected sentences out loud 3 times.',
      icon: 'checkmark-done',
    },
    vocabulary_variety: {
      title: 'Expand Vocabulary',
      action: 'Use one new word per session. Write it down and use it in 3 different sentences.',
      icon: 'book',
    },
    taking_challenges: {
      title: 'Accept More Challenges',
      action: 'Say YES to the next challenge offered. Growth happens outside comfort zones!',
      icon: 'flame',
    },
    accuracy_focus: {
      title: 'Balance Speed & Accuracy',
      action: 'It\'s OK to make mistakes! Focus on communicating your ideas first.',
      icon: 'speedometer',
    },
    vocabulary_exploration: {
      title: 'Use Varied Vocabulary',
      action: 'Try synonyms for common words. Replace "good" with "excellent", "great", "wonderful".',
      icon: 'bulb',
    },
  };

  return growthAreas.slice(0, 3).map(area =>
    insights[area] || {
      title: formatText(area),
      action: 'Keep practicing regularly to see improvement in this area.',
      icon: 'arrow-up',
    }
  );
};

const getStrengthInsights = (strengths: string[]): StrengthInsight[] => {
  const insights: Record<string, StrengthInsight> = {
    speaking_confidence: {
      title: 'Confident Speaker',
      description: 'You respond quickly and naturally in conversations',
    },
    accuracy_focus: {
      title: 'Accuracy Master',
      description: 'Your grammar and pronunciation are consistently strong',
    },
    vocabulary_exploration: {
      title: 'Word Explorer',
      description: 'You experiment with diverse vocabulary and expressions',
    },
    challenge_acceptance: {
      title: 'Challenge Seeker',
      description: 'You embrace difficult topics and learning opportunities',
    },
    consistency: {
      title: 'Steady Learner',
      description: 'You maintain consistent practice and steady progress',
    },
  };

  return strengths.slice(0, 3).map(strength =>
    insights[strength] || {
      title: formatText(strength),
      description: 'Keep leveraging this strength in your practice',
    }
  );
};

const getWeeklyFocus = (growthAreas: string[], strands: any): WeeklyFocus | null => {
  if (growthAreas.length === 0) return null;

  const topArea = growthAreas[0];

  const focuses: Record<string, WeeklyFocus> = {
    speaking_confidence: {
      goal: 'Reduce hesitation time',
      tip: 'Start speaking within 2 seconds of each question this week',
    },
    grammar_accuracy: {
      goal: 'Master your top error pattern',
      tip: strands?.accuracy?.common_errors?.[0]
        ? `Focus on fixing: ${formatText(strands.accuracy.common_errors[0])}`
        : 'Pay attention to corrections and repeat them',
    },
    vocabulary_variety: {
      goal: 'Learn 5 new words',
      tip: 'Pick words from your sessions and use them daily',
    },
    taking_challenges: {
      goal: 'Accept 2 challenges',
      tip: 'Say YES when the AI offers harder topics or exercises',
    },
  };

  return focuses[topArea] || {
    goal: `Improve ${formatText(topArea)}`,
    tip: 'Focus on this area during your practice sessions this week',
  };
};

// ============================================================================
// PAGE 2: INSIGHTS PAGE
// ============================================================================

interface InsightsPageProps {
  profile: SpeakingDNAProfile;
  breakthroughs: SpeakingBreakthrough[];
}

const InsightsPage: React.FC<InsightsPageProps> = ({ profile, breakthroughs }) => {
  const { strengths, growth_areas } = profile.overall_profile;
  const strands = profile.dna_strands;

  // Get actionable insights
  const growthInsights = getGrowthAreaInsights(growth_areas, strands);
  const strengthInsights = getStrengthInsights(strengths);
  const weeklyFocus = getWeeklyFocus(growth_areas, strands);

  return (
    <View style={styles.page}>
      <View style={styles.insightsContainer}>
        {/* This Week's Focus */}
        {weeklyFocus && (
          <View style={styles.focusBanner}>
            <View style={styles.focusBannerHeader}>
              <Ionicons name="rocket" size={20} color="#FFFFFF" />
              <Text style={styles.focusBannerTitle}>This Week's Focus</Text>
            </View>
            <Text style={styles.focusBannerGoal}>{weeklyFocus.goal}</Text>
            <Text style={styles.focusBannerTip}>{weeklyFocus.tip}</Text>
          </View>
        )}

        {/* Growth Areas with Actions - Show only top 2 */}
        {growthInsights.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="trending-up" size={20} color="#3B82F6" />
              <Text style={styles.insightSectionTitle}>Areas to Improve</Text>
            </View>
            {growthInsights.slice(0, 2).map((insight, index) => (
              <View key={index} style={styles.growthCard}>
                <View style={styles.growthCardIconContainer}>
                  <Ionicons name={insight.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.growthCardContent}>
                  <Text style={styles.growthCardTitle}>{insight.title}</Text>
                  <Text style={styles.growthCardAction}>{insight.action}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Strengths - Show only top 2 */}
        {strengthInsights.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.insightSectionTitle}>Your Strengths</Text>
            </View>
            {strengthInsights.slice(0, 2).map((insight, index) => (
              <View key={index} style={styles.strengthCard}>
                <View style={styles.strengthIconContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.strengthContent}>
                  <Text style={styles.strengthTitle}>{insight.title}</Text>
                  <Text style={styles.strengthDesc}>{insight.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Breakthrough - Show only 1 */}
        {breakthroughs.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="trophy" size={20} color="#8B5CF6" />
              <Text style={styles.insightSectionTitle}>Recent Win</Text>
            </View>
            <LinearGradient
              colors={getCategoryColors(breakthroughs[0].category)}
              style={styles.breakthroughCard}
            >
              <Text style={styles.breakthroughEmoji}>{breakthroughs[0].emoji}</Text>
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

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStrand, setModalStrand] = useState<DNAStrandKey | null>(null);
  const [modalLabel, setModalLabel] = useState('');
  const [modalScore, setModalScore] = useState(0);
  const [modalColor, setModalColor] = useState('');

  // Refs
  const pagerRef = useRef<PagerView>(null);

  /**
   * Handle strand tap to open modal
   */
  const handleStrandTapForModal = useCallback((strand: DNAStrandKey, label: string, score: number, color: string) => {
    setModalStrand(strand);
    setModalLabel(label);
    setModalScore(score);
    setModalColor(color);
    setModalVisible(true);
  }, []);

  /**
   * Close modal
   */
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

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

      {/* Pager View - 2 Pages */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* Page 1: Radar Chart with Modal */}
        <View key="radar" style={styles.pageWrapper}>
          <RadarPage profile={profile} onStrandTapForModal={handleStrandTapForModal} />
        </View>

        {/* Page 2: Insights */}
        <View key="insights" style={styles.pageWrapper}>
          <InsightsPage profile={profile} breakthroughs={breakthroughs} />
        </View>
      </PagerView>

      {/* Page Indicator */}
      <PageIndicator currentPage={currentPage} totalPages={2} />

      {/* Strand Detail Modal */}
      <StrandDetailModal
        visible={modalVisible}
        strand={modalStrand}
        score={modalScore}
        label={modalLabel}
        color={modalColor}
        onClose={handleCloseModal}
      />
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
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  chartWrapper: {
    marginTop: -20,
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

  // Page 2: Insights
  insightsContainer: {
    flex: 1,
    padding: 16,
  },
  insightSection: {
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  insightSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Weekly Focus Banner
  focusBanner: {
    backgroundColor: THEME_COLORS.primary,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  focusBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  focusBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  focusBannerGoal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  focusBannerTip: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },

  // Growth Cards (Areas to Improve)
  growthCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  growthCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  growthCardContent: {
    flex: 1,
  },
  growthCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  growthCardAction: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },

  // Strength Cards
  strengthCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  strengthIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  strengthContent: {
    flex: 1,
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 3,
  },
  strengthDesc: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },

  // Breakthrough Card
  breakthroughCard: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  breakthroughEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  breakthroughTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  breakthroughDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 3,
  },
});

export default SpeakingDNAScreenHorizontal;
