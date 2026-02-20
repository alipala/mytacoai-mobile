/**
 * Speaking DNA Screen - Horizontal Paging Layout
 * ==============================================
 *
 * A modern, non-scrolling design with swipeable pages:
 * - Page 1: Full-screen interactive radar chart (tap labels for detailed modal)
 * - Page 2: Achievements (breakthroughs and milestones)
 * - Page 3: Voice Signature (acoustic metrics with progress tracking - conditional)
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

import { speakingDNAService } from '../../services/SpeakingDNAService';
import { StripeService } from '../../api/generated';
import { SpeakingDNAProfile, SpeakingBreakthrough, DNAStrandKey } from '../../types/speakingDNA';

// Import SVG flags
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';

// Components
import { InteractiveRadarChartEnhanced } from './components/InteractiveRadarChartEnhanced';
import { StrandDetailModal } from './components/StrandDetailModal';
import { DNAShareModal } from '../../components/SpeakingDNA/DNAShareModal';
import { VoiceSignatureCarousel } from './components/VoiceSignatureCarousel';
import { AchievementsPage } from './components/AchievementsPage';

// Constants
import { DNA_COLORS, DNA_STRAND_LABELS, THEME_COLORS, getStrandScore } from './constants.OLD';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get SVG flag component for language
 */
const getLanguageFlagComponent = (language: string): React.FC<any> | null => {
  const flags: Record<string, React.FC<any>> = {
    'english': EnglishFlag,
    'spanish': SpanishFlag,
    'french': FrenchFlag,
    'german': GermanFlag,
    'dutch': DutchFlag,
    'portuguese': PortugueseFlag,
  };
  return flags[language.toLowerCase()] || null;
};

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
  language: string;
  onStrandTapForModal: (strand: DNAStrandKey, label: string, score: number, color: string) => void;
  t: (key: string) => string;
}

const RadarPage: React.FC<RadarPageProps> = ({ profile, language, onStrandTapForModal, t }) => {
  const [selectedStrand, setSelectedStrand] = useState<DNAStrandKey | null>(null);
  const [evolution, setEvolution] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(true); // Toggle for baseline comparison

  // 🧪 TEMPORARY: Set to true to test comparison with mock baseline data
  const TEST_MODE = false;

  // Fetch evolution data for trend calculation
  useEffect(() => {
    async function fetchEvolution() {
      try {
        const data = await speakingDNAService.getEvolution(language, 12);
        console.log('[RadarPage] Evolution data fetched:', {
          weeksCount: data.length,
          firstWeek: data[0]?.week_number,
          lastWeek: data[data.length - 1]?.week_number,
          hasData: data.length > 0,
        });
        setEvolution(data);
      } catch (error) {
        console.error('[RadarPage] Error fetching evolution:', error);
      }
    }
    fetchEvolution();
  }, [language]);

  // Get Week 1 baseline scores
  const getBaselineScore = (strand: DNAStrandKey): number | null => {
    if (evolution.length === 0) return null;

    const week1 = evolution[0]; // First week snapshot
    if (!week1 || !week1.strand_snapshots) return null;

    return getStrandScore(week1.strand_snapshots[strand]);
  };

  // Calculate trend deltas
  const getTrendDelta = (strand: DNAStrandKey, currentScore: number): number | null => {
    if (evolution.length < 2) return null; // Need at least 2 weeks for trend

    // Get previous week's score (second to last in array)
    const previousWeek = evolution[evolution.length - 2];
    if (!previousWeek || !previousWeek.strand_snapshots) return null;

    const previousScore = getStrandScore(previousWeek.strand_snapshots[strand]);
    const delta = Math.round(currentScore - previousScore);

    return delta;
  };

  // Prepare radar data with baseline scores and trend indicators
  const strands: DNAStrandKey[] = ['rhythm', 'confidence', 'vocabulary', 'accuracy', 'learning', 'emotional'];
  const radarData = strands.map((strand) => {
    const currentScore = getStrandScore(profile.dna_strands[strand]);
    const delta = getTrendDelta(strand, currentScore);
    const baselineScore = getBaselineScore(strand);

    // 🧪 TEMPORARY: Mock baseline data for testing (subtract 10-20% from current)
    const mockBaselineScore = TEST_MODE
      ? Math.max(0, currentScore - (Math.random() * 20 + 10))
      : undefined;

    return {
      strand,
      label: t(`profile.dna.strand_${strand}`),
      score: currentScore,
      color: DNA_COLORS[strand],
      baselineScore: TEST_MODE
        ? mockBaselineScore
        : (baselineScore !== null ? baselineScore : undefined),
      trend: delta !== null ? { delta } : undefined,
    };
  });

  const handleStrandTap = (strand: DNAStrandKey) => {
    const data = radarData.find(d => d.strand === strand);
    if (data) {
      setSelectedStrand(strand);
      onStrandTapForModal(strand, data.label, data.score, data.color);
    }
  };

  // Check if we have baseline data
  const hasBaseline = evolution.length > 0 && radarData.some(d => d.baselineScore !== undefined && d.baselineScore !== d.score);

  // Debug logging
  useEffect(() => {
    if (radarData.length > 0) {
      console.log('[RadarPage] Baseline Check:', {
        evolutionWeeks: evolution.length,
        hasBaseline,
        showComparison,
        sampleData: radarData.slice(0, 2).map(d => ({
          strand: d.strand,
          current: d.score,
          baseline: d.baselineScore,
          different: d.baselineScore !== d.score,
        })),
      });
    }
  }, [radarData, evolution, hasBaseline]);

  return (
    <View style={styles.page}>
      {/* Dark gradient background matching share card */}
      <LinearGradient
        colors={['#0B1A1F', '#0D2832']}
        style={styles.radarBackground}
      />

      {/* Comparison Toggle - Only show if we have baseline data */}
      {hasBaseline && (
        <View style={styles.comparisonToggleContainer}>
          <TouchableOpacity
            style={[styles.comparisonToggle, showComparison && styles.comparisonToggleActive]}
            onPress={() => setShowComparison(!showComparison)}
          >
            <Ionicons
              name={showComparison ? 'eye' : 'eye-off'}
              size={16}
              color={showComparison ? '#14B8A6' : '#9CA3AF'}
            />
            <Text style={[styles.comparisonToggleText, showComparison && styles.comparisonToggleTextActive]}>
              {showComparison ? t('profile.dna.hide_week1_comparison') : t('profile.dna.show_week1_comparison')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Radar Chart Container - Centered */}
      <View style={styles.radarContainer}>
        <InteractiveRadarChartEnhanced
          data={radarData}
          size={SCREEN_WIDTH - 40}
          onStrandTap={handleStrandTap}
          selectedStrand={selectedStrand}
          showComparison={showComparison && hasBaseline}
        />
      </View>

      {/* Legend - Only show when comparison is active */}
      {showComparison && hasBaseline && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={styles.legendDotBaseline} />
            <Text style={styles.legendText}>{t('profile.dna.week1_baseline')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotCurrent} />
            <Text style={styles.legendText}>{t('profile.dna.current_state')}</Text>
          </View>
        </View>
      )}

      {/* Tap Hint - Redesigned */}
      <View style={styles.swipeHint}>
        <View style={styles.swipeHintBadge}>
          <Ionicons name="hand-left-outline" size={14} color="#14B8A6" />
          <Text style={styles.swipeHintText}>{t('profile.dna.hint_tap_strands')}</Text>
        </View>
        <View style={styles.swipeHintBadge}>
          <Ionicons name="chevron-forward" size={14} color="#14B8A6" />
          <Text style={styles.swipeHintText}>{t('profile.dna.hint_swipe_voice')}</Text>
        </View>
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

// ============================================================================
// VOICE SIGNATURE PAGE
// ============================================================================

interface VoiceSignaturePageProps {
  profile: SpeakingDNAProfile;
  language: string;
  t: (key: string) => string;
}

const VoiceSignaturePage: React.FC<VoiceSignaturePageProps> = ({ profile, language, t }) => {
  const acousticMetrics = profile.baseline_assessment?.acoustic_metrics;
  const [acousticEvolution, setAcousticEvolution] = useState<any[]>([]);
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(true);

  // Fetch acoustic evolution data for progress tracking
  useEffect(() => {
    async function fetchAcousticEvolution() {
      try {
        setIsLoadingEvolution(true);
        const data = await speakingDNAService.getAcousticEvolution(language, 12);
        console.log('[VoiceSignaturePage] Acoustic evolution data fetched:', {
          weeksCount: data.length,
          firstWeek: data[0]?.week_number,
          lastWeek: data[data.length - 1]?.week_number,
          hasData: data.length > 0,
        });
        setAcousticEvolution(data);
      } catch (error) {
        console.error('[VoiceSignaturePage] Error fetching acoustic evolution:', error);
      } finally {
        setIsLoadingEvolution(false);
      }
    }
    fetchAcousticEvolution();
  }, [language]);

  if (!acousticMetrics) {
    return (
      <View style={styles.page}>
        <LinearGradient
          colors={['#0B1A1F', '#0D2832']}
          style={styles.radarBackground}
        />
        <View style={styles.emptyPageContainer}>
          <Ionicons name="mic-off-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyPageTitle}>{t('profile.dna.voice_unavailable_title')}</Text>
          <Text style={styles.emptyPageSubtitle}>
            {t('profile.dna.voice_unavailable_subtitle')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={['#0B1A1F', '#0D2832']}
        style={styles.radarBackground}
      />
      <View style={styles.voiceSignaturePageContainer}>
        <VoiceSignatureCarousel
          acousticMetrics={acousticMetrics}
          acousticEvolution={acousticEvolution}
          isLoadingEvolution={isLoadingEvolution}
        />
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SpeakingDNAScreenHorizontal: React.FC<SpeakingDNAScreenHorizontalProps> = ({
  navigation,
  route
}) => {
  const { t } = useTranslation();
  const language = route.params?.language || 'english';

  // State
  const [profile, setProfile] = useState<SpeakingDNAProfile | null>(null);
  const [breakthroughs, setBreakthroughs] = useState<SpeakingBreakthrough[]>([]);
  const [evolution, setEvolution] = useState<any[]>([]); // Evolution data for progress
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStrand, setModalStrand] = useState<DNAStrandKey | null>(null);
  const [modalLabel, setModalLabel] = useState('');
  const [modalScore, setModalScore] = useState(0);
  const [modalColor, setModalColor] = useState('');

  // Share modal state
  const [shareModalVisible, setShareModalVisible] = useState(false);

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
   * Handle share button
   */
  const handleShare = useCallback(() => {
    console.log('[DNA_SHARE_HORIZONTAL] Share button pressed, profile:', !!profile);
    if (!profile) {
      console.log('[DNA_SHARE_HORIZONTAL] No profile available');
      return;
    }
    console.log('[DNA_SHARE_HORIZONTAL] Opening share modal...');
    setShareModalVisible(true);
  }, [profile]);

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
        setError(t('profile.dna.error_premium_required'));
        setLoading(false);
        return;
      }

      // Load profile
      const profileData = await speakingDNAService.getProfile(language, forceRefresh);
      setProfile(profileData);

      // Load breakthroughs and evolution if profile exists
      if (profileData) {
        const [breakthroughsData, evolutionData] = await Promise.all([
          speakingDNAService.getBreakthroughs(language, {
            limit: 5,
            forceRefresh,
          }),
          speakingDNAService.getEvolution(language, 12, forceRefresh),
        ]);
        setBreakthroughs(breakthroughsData);
        setEvolution(evolutionData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('[SpeakingDNAScreenHorizontal] Error loading data:', err);
      setError(err.message || t('profile.dna.error_failed_to_load'));
      setLoading(false);
    }
  }, [language, t]);

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

  // Build pages array to avoid conditional rendering issues in PagerView
  // MUST be before early returns to satisfy React Hooks rules
  const pages = useMemo(() => {
    if (!profile) return [];

    const pagesArray = [];

    // Page 1: Radar Chart with Trend Indicators
    pagesArray.push(
      <View key="radar" style={styles.pageWrapper}>
        <RadarPage
          profile={profile}
          language={language}
          onStrandTapForModal={handleStrandTapForModal}
          t={t}
        />
      </View>
    );

    // Page 2: Achievements (Breakthroughs, Milestones)
    pagesArray.push(
      <View key="achievements" style={styles.pageWrapper}>
        <AchievementsPage language={language} onShare={(breakthrough) => {
          console.log('[DNA_HORIZONTAL] Share breakthrough:', breakthrough.title);
          // Could open share modal with breakthrough-specific content
        }} />
      </View>
    );

    // Page 3: Voice Signature (only if acoustic metrics exist)
    if (profile?.baseline_assessment?.acoustic_metrics) {
      pagesArray.push(
        <View key="voice" style={styles.pageWrapper}>
          <VoiceSignaturePage profile={profile} language={language} t={t} />
        </View>
      );
    }

    return pagesArray;
  }, [profile, breakthroughs, t, language]);

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0B1A1F', '#0D2832']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.dna.title')}</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.loadingText}>{t('profile.dna.loading_analyzing')}</Text>
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
          colors={['#0B1A1F', '#0D2832']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.dna.title')}</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle" size={80} color="#EF4444" />
            <Text style={styles.errorTitle}>{t('profile.dna.error_oops')}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData(true)}>
              <Text style={styles.retryButtonText}>{t('profile.dna.button_try_again')}</Text>
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
          colors={['#0B1A1F', '#0D2832']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.dna.title')}</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centerContent}>
            <Ionicons name="flask" size={80} color="#14B8A6" />
            <Text style={styles.emptyTitle}>{t('profile.dna.empty_title')}</Text>
            <Text style={styles.emptyText}>
              {t('profile.dna.empty_subtitle')}
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.goBack()}>
              <Text style={styles.startButtonText}>{t('profile.dna.button_go_to_dashboard')}</Text>
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

      {/* Header - Dark Minimalist Design */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('profile.dna.title')}</Text>
            <View style={styles.languageBadge}>
              {(() => {
                const FlagComponent = getLanguageFlagComponent(language);
                return FlagComponent ? (
                  <View style={styles.flagIcon}>
                    <FlagComponent width={20} height={20} />
                  </View>
                ) : (
                  <View style={styles.languageDot} />
                );
              })()}
              <Text style={styles.languageText}>{language.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-social" size={26} color="#14B8A6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pager View - Dynamic Pages */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {pages}
      </PagerView>

      {/* Page Indicator */}
      <PageIndicator
        currentPage={currentPage}
        totalPages={pages.length}
      />

      {/* Strand Detail Modal */}
      <StrandDetailModal
        visible={modalVisible}
        strand={modalStrand}
        score={modalScore}
        label={modalLabel}
        color={modalColor}
        onClose={handleCloseModal}
      />

      {/* Share Modal */}
      <DNAShareModal
        visible={shareModalVisible}
        onClose={() => {
          console.log('[DNA_SHARE_HORIZONTAL] Closing share modal');
          setShareModalVisible(false);
        }}
        profile={profile}
        language={language}
        evolution={evolution}
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
    backgroundColor: '#0B1A1F', // Dark background
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'rgba(11, 26, 31, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  headerRight: {
    width: 40,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  languageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
  },
  flagIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  languageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B4E4DD',
    letterSpacing: 1,
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
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  startButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
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
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  pageIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  pageIndicatorDotActive: {
    width: 20,
    backgroundColor: '#14B8A6',
  },

  // Page 1: Radar
  radarBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  comparisonToggleContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.3)',
  },
  comparisonToggleActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  comparisonToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  comparisonToggleTextActive: {
    color: '#14B8A6',
  },
  radarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDotBaseline: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
  },
  legendDotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#14B8A6',
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B4E4DD',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    gap: 8,
  },
  swipeHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  swipeHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B4E4DD',
  },

  // Page 2: Voice Signature
  voiceSignaturePageContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  emptyPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },
  emptyPageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyPageSubtitle: {
    fontSize: 14,
    color: '#B4E4DD',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SpeakingDNAScreenHorizontal;
