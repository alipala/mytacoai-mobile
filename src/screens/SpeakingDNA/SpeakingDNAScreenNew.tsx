/**
 * Speaking DNA Screen (New Design)
 * ================================
 * Immersive animated DNA profile with:
 * - Radar chart overview
 * - Swipeable tabs (Summary, Growth, History, Breakthroughs)
 * - Interactive animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { StripeService } from '../../api/generated';
import { SpeakingDNAProfile, SpeakingBreakthrough } from '../../types/speakingDNA';

// Components
import { DNAHeader } from './components/DNAHeader';
import { DNARadarChart } from './components/DNARadarChart';
import { DNATabBar } from './components/DNATabBar';
import { SummaryTab } from './components/tabs/SummaryTab';
import { GrowthTab } from './components/tabs/GrowthTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { BreakthroughsTab } from './components/tabs/BreakthroughsTab';

// Constants
import { THEME_COLORS, TABS } from './constants.OLD';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface SpeakingDNAScreenNewProps {
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

export const SpeakingDNAScreenNew: React.FC<SpeakingDNAScreenNewProps> = ({ navigation, route }) => {
  const language = route.params?.language || 'english';

  // State
  const [profile, setProfile] = useState<SpeakingDNAProfile | null>(null);
  const [breakthroughs, setBreakthroughs] = useState<SpeakingBreakthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(TABS.SUMMARY);

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

      console.log('[SpeakingDNAScreenNew] Subscription check:', {
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
      console.error('[SpeakingDNAScreenNew] Error loading data:', err);
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
   * Handle tab change
   */
  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  /**
   * Handle page scroll
   */
  const handlePageSelected = (event: any) => {
    setActiveTab(event.nativeEvent.position);
  };

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]} style={styles.gradient}>
          <DNAHeader language={language} onBack={() => navigation.goBack()} />
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>Loading your Speaking DNA...</Text>
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
        <LinearGradient colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]} style={styles.gradient}>
          <DNAHeader language={language} onBack={() => navigation.goBack()} />
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
        <LinearGradient colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]} style={styles.gradient}>
          <DNAHeader language={language} onBack={() => navigation.goBack()} />
          <View style={styles.centerContent}>
            <Ionicons name="flask" size={80} color={THEME_COLORS.primary} />
            <Text style={styles.emptyTitle}>Build Your DNA Profile</Text>
            <Text style={styles.emptyText}>Complete a speaking session to create your unique Speaking DNA profile.</Text>
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.goBack()}>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[THEME_COLORS.gradient.start, THEME_COLORS.gradient.mid, THEME_COLORS.gradient.end]} style={styles.gradient}>
        <DNAHeader language={language} onBack={() => navigation.goBack()} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={THEME_COLORS.primary} />}
        >
          {/* Animated Radar Chart */}
          <DNARadarChart profile={profile} />

          {/* Tab Bar */}
          <DNATabBar activeTab={activeTab} onTabPress={handleTabPress} />

          {/* Pager View */}
          <View style={styles.pagerContainer}>
            <PagerView
              ref={pagerRef}
              style={styles.pager}
              initialPage={TABS.SUMMARY}
              onPageSelected={handlePageSelected}
            >
              <View key="summary" style={styles.page}>
                <SummaryTab profile={profile} />
              </View>
              <View key="growth" style={styles.page}>
                <GrowthTab profile={profile} />
              </View>
              <View key="history" style={styles.page}>
                <HistoryTab profile={profile} />
              </View>
              <View key="breakthroughs" style={styles.page}>
                <BreakthroughsTab breakthroughs={breakthroughs} />
              </View>
            </PagerView>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    color: THEME_COLORS.text.secondary,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.text.primary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: THEME_COLORS.text.secondary,
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
    color: THEME_COLORS.text.white,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: THEME_COLORS.text.secondary,
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
    color: THEME_COLORS.text.white,
  },
  pagerContainer: {
    height: 400,
    marginHorizontal: 16,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

export default SpeakingDNAScreenNew;
