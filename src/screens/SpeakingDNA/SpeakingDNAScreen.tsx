/**
 * SpeakingDNAScreen.tsx
 * =====================
 * Main screen for viewing Speaking DNA profile.
 *
 * Displays:
 * - DNA Helix visualization
 * - 6 DNA strands with scores
 * - Speaker archetype and summary
 * - Strengths and growth areas
 * - Recent breakthroughs
 * - Evolution chart
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { StripeService } from '../../api/generated';
import {
  SpeakingDNAProfile,
  SpeakingBreakthrough,
  DNAStrandKey,
  DNA_STRAND_COLORS,
  DNA_STRAND_ICONS,
} from '../../types/speakingDNA';
import { BreakthroughModal } from '../../components/SpeakingDNA/BreakthroughModal';
import { DNAShareModal } from '../../components/SpeakingDNA/DNAShareModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface SpeakingDNAScreenProps {
  navigation: any;
  route: {
    params?: {
      language?: string;
    };
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SpeakingDNAScreen: React.FC<SpeakingDNAScreenProps> = ({ navigation, route }) => {
  const language = route.params?.language || 'english';

  // State
  const [profile, setProfile] = useState<SpeakingDNAProfile | null>(null);
  const [breakthroughs, setBreakthroughs] = useState<SpeakingBreakthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBreakthrough, setSelectedBreakthrough] = useState<SpeakingBreakthrough | null>(null);
  const [showBreakthroughModal, setShowBreakthroughModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  /**
   * Load DNA profile and breakthroughs
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);

      // Check premium access using FRESH subscription API data (not stale AsyncStorage)
      const subscriptionStatus = await StripeService.getSubscriptionStatusApiStripeSubscriptionStatusGet();
      const hasPremium = subscriptionStatus && !['try_learn', 'free'].includes(subscriptionStatus.plan);

      console.log('[SpeakingDNAScreen] Fresh subscription check:', {
        plan: subscriptionStatus?.plan,
        status: subscriptionStatus?.status,
        hasPremium,
      });

      if (!hasPremium) {
        setError('Speaking DNA is a premium feature. Please upgrade your subscription.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Load profile
      const profileData = await speakingDNAService.getProfile(language, forceRefresh);
      setProfile(profileData);

      // Load breakthroughs if profile exists
      if (profileData) {
        const breakthroughsData = await speakingDNAService.getBreakthroughs(language, {
          limit: 10,
          forceRefresh,
        });
        setBreakthroughs(breakthroughsData);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('[SpeakingDNAScreen] Error loading data:', err);
      setError(err.message || 'Failed to load DNA profile');
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  /**
   * Handle breakthrough tap
   */
  const handleBreakthroughTap = (breakthrough: SpeakingBreakthrough) => {
    setSelectedBreakthrough(breakthrough);
    setShowBreakthroughModal(true);
  };

  /**
   * Handle upgrade button tap - Go back since this screen shouldn't be shown to free users
   */
  const handleUpgrade = () => {
    console.log('[SpeakingDNAScreen] Upgrade button pressed - going back');
    navigation.goBack();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#14B8A6', '#F0FDFA', '#FAFAFA']}
          style={styles.gradient}
        >
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.loadingText}>Loading your Speaking DNA...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  /**
   * Render premium upsell
   */
  if (error && error.includes('premium')) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#14B8A6', '#F0FDFA', '#FAFAFA']}
          style={styles.gradient}
        >
          <View style={styles.centerContent}>
            <Ionicons name="lock-closed" size={80} color="#14B8A6" />
            <Text style={styles.upsellTitle}>Unlock Speaking DNA</Text>
            <Text style={styles.upsellDescription}>
              Discover your unique speaking fingerprint and track your progress with AI-powered insights.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#14B8A6', '#F0FDFA', '#FAFAFA']}
          style={styles.gradient}
        >
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

  /**
   * Render no profile state
   */
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#14B8A6', '#F0FDFA', '#FAFAFA']}
          style={styles.gradient}
        >
          <View style={styles.centerContent}>
            <Ionicons name="flask" size={80} color="#14B8A6" />
            <Text style={styles.emptyTitle}>Build Your DNA Profile</Text>
            <Text style={styles.emptyText}>
              Complete a speaking session to create your unique Speaking DNA profile.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                // Go back to dashboard where user can start a session
                navigation.goBack();
              }}
            >
              <Text style={styles.startButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const strandKeys: DNAStrandKey[] = ['rhythm', 'confidence', 'vocabulary', 'accuracy', 'learning', 'emotional'];

  /**
   * Format insight text - convert snake_case to Title Case
   */
  const formatInsightText = (text: string): string => {
    // If it's snake_case or camelCase, convert to readable format
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#14B8A6', '#F0FDFA', '#FAFAFA']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Speaking DNA</Text>
            <Text style={styles.headerLanguage}>{language.charAt(0).toUpperCase() + language.slice(1)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => profile && setShowShareModal(true)}
            style={styles.shareButton}
            disabled={!profile}
          >
            <Ionicons name="share-social" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#14B8A6" />
          }
        >
          {/* Speaker Archetype Card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              style={styles.archetypeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={48} color="#fff" />
              <Text style={styles.archetypeTitle}>{profile.overall_profile.speaker_archetype}</Text>
              <Text style={styles.archetypeSummary}>{profile.overall_profile.summary}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.sessions_analyzed}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(profile.total_speaking_minutes)}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* DNA Strands */}
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={24} color="#14B8A6" />
            <Text style={styles.sectionTitle}>DNA Strands</Text>
          </View>

          {strandKeys.map((key) => {
            const strand = profile.dna_strands[key];
            const color = DNA_STRAND_COLORS[key];
            const icon = DNA_STRAND_ICONS[key];

            // Get score from strand (varies by strand type)
            let score = 0;
            if ('score' in strand) score = strand.score;
            else if ('consistency_score' in strand) score = strand.consistency_score;

            return (
              <View key={key} style={styles.strandCard}>
                <View style={styles.strandHeader}>
                  <View style={[styles.strandIconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                  </View>
                  <View style={styles.strandInfo}>
                    <Text style={styles.strandName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                    <Text style={styles.strandType}>{(strand as any).type || (strand as any).level || (strand as any).style || (strand as any).pattern}</Text>
                  </View>
                  <View style={styles.strandScore}>
                    <Text style={[styles.scoreValue, { color }]}>{Math.round(score * 100)}%</Text>
                  </View>
                </View>
                <Text style={styles.strandDescription}>{strand.description}</Text>
              </View>
            );
          })}

          {/* Strengths & Growth Areas */}
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color="#14B8A6" />
            <Text style={styles.sectionTitle}>Insights</Text>
          </View>

          <View style={styles.insightsCard}>
            <Text style={styles.insightsSubtitle}>Strengths</Text>
            {profile.overall_profile.strengths.map((strength, idx) => (
              <View key={idx} style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.insightText}>{formatInsightText(strength)}</Text>
              </View>
            ))}

            <Text style={[styles.insightsSubtitle, { marginTop: 16 }]}>Growth Areas</Text>
            {profile.overall_profile.growth_areas.map((area, idx) => (
              <View key={idx} style={styles.insightItem}>
                <Ionicons name="arrow-up-circle" size={20} color="#F59E0B" />
                <Text style={styles.insightText}>{formatInsightText(area)}</Text>
              </View>
            ))}
          </View>

          {/* Recent Breakthroughs */}
          {breakthroughs.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy" size={24} color="#14B8A6" />
                <Text style={styles.sectionTitle}>Recent Breakthroughs</Text>
              </View>

              {breakthroughs.slice(0, 5).map((breakthrough) => {
                const categoryColors: Record<string, string[]> = {
                  confidence: ['#9B59B6', '#8E44AD'],
                  vocabulary: ['#2ECC71', '#27AE60'],
                  learning: ['#3498DB', '#2980B9'],
                  rhythm: ['#4ECDC4', '#45B7B0'],
                  accuracy: ['#E74C3C', '#C0392B'],
                  emotional: ['#F39C12', '#E67E22'],
                };
                const colors = categoryColors[breakthrough.category] || ['#34495E', '#2C3E50'];

                return (
                  <TouchableOpacity
                    key={breakthrough._id}
                    style={styles.breakthroughCard}
                    onPress={() => handleBreakthroughTap(breakthrough)}
                  >
                    <LinearGradient
                      colors={colors}
                      style={styles.breakthroughGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.breakthroughEmoji}>{breakthrough.emoji}</Text>
                      <Text style={styles.breakthroughTitle}>{breakthrough.title}</Text>
                      <Text style={styles.breakthroughDescription} numberOfLines={2}>
                        {breakthrough.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Breakthrough Modal */}
        <BreakthroughModal
          breakthrough={selectedBreakthrough}
          visible={showBreakthroughModal}
          onClose={() => {
            setShowBreakthroughModal(false);
            setSelectedBreakthrough(null);
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerLanguage: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
    color: '#6B7280',
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
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#14B8A6',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  upsellTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  upsellDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  upgradeButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  startButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  archetypeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  archetypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  archetypeSummary: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  strandCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  strandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strandIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strandInfo: {
    flex: 1,
    marginLeft: 12,
  },
  strandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  strandType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  strandScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  strandDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    lineHeight: 20,
  },
  breakthroughCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  breakthroughGradient: {
    padding: 16,
  },
  breakthroughEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  breakthroughTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  breakthroughDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
});

export default SpeakingDNAScreen;
