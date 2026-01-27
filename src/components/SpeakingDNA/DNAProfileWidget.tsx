/**
 * DNA Profile Widget
 * ==================
 * Compact dashboard widget showing Speaking DNA profile preview.
 *
 * Features:
 * - Shows speaker archetype
 * - Top 2 DNA strands preview
 * - Session count and speaking time
 * - Tap to view full profile
 * - Loading and error states
 * - Premium access check
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import {
  SpeakingDNAProfile,
  DNAStrandKey,
  DNA_STRAND_COLORS,
  DNA_STRAND_ICONS,
} from '../../types/speakingDNA';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface DNAProfileWidgetProps {
  /** Language for DNA profile */
  language?: string;
  /** Navigation prop for navigating to full screen */
  onPress?: () => void;
  /** Refresh trigger */
  onRefresh?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DNAProfileWidget: React.FC<DNAProfileWidgetProps> = ({
  language = 'english',
  onPress,
  onRefresh,
}) => {
  const [profile, setProfile] = useState<SpeakingDNAProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPremium, setHasPremium] = useState(false);

  /**
   * Load DNA profile
   */
  useEffect(() => {
    loadProfile();
  }, [language]);

  const loadProfile = async () => {
    try {
      setError(null);

      // Check premium access
      const premium = await speakingDNAService.hasPremiumAccess();
      setHasPremium(premium);

      if (!premium) {
        setLoading(false);
        return;
      }

      // Load profile
      const profileData = await speakingDNAService.getProfile(language);
      setProfile(profileData);
      setLoading(false);
    } catch (err: any) {
      console.error('[DNAProfileWidget] Error loading profile:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Get top 2 DNA strands by score
   */
  const getTopStrands = (): Array<{ key: DNAStrandKey; score: number; label: string }> => {
    if (!profile) return [];

    const strandKeys: DNAStrandKey[] = ['rhythm', 'confidence', 'vocabulary', 'accuracy', 'learning', 'emotional'];
    const strandsWithScores = strandKeys.map((key) => {
      const strand = profile.dna_strands[key];
      let score = 0;

      // Extract score based on strand structure
      if ('score' in strand) score = strand.score;
      else if ('consistency_score' in strand) score = strand.consistency_score;

      // Get type/level label
      let label = '';
      if ('type' in strand) label = strand.type;
      else if ('level' in strand) label = strand.level;
      else if ('style' in strand) label = strand.style;
      else if ('pattern' in strand) label = strand.pattern;

      return { key, score, label };
    });

    // Sort by score descending and take top 2
    return strandsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  };

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  /**
   * Loading state
   */
  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading DNA...</Text>
        </View>
      </View>
    );
  }

  /**
   * Premium upsell
   */
  if (!hasPremium) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={['#14B8A6', '#0D9488']}
          style={styles.upsellGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.upsellContent}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
            <Text style={styles.upsellTitle}>Unlock Speaking DNA</Text>
            <Text style={styles.upsellSubtitle}>
              Discover your unique speaking fingerprint
            </Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  /**
   * Error state
   */
  if (error && !profile) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={40} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * Empty state - no profile yet
   */
  if (!profile) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.emptyContent}>
          <Ionicons name="flask" size={48} color="#14B8A6" />
          <Text style={styles.emptyTitle}>Build Your DNA</Text>
          <Text style={styles.emptyText}>
            Complete a speaking session to create your unique profile
          </Text>
          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ============================================================================
  // MAIN RENDER - Profile exists
  // ============================================================================

  const topStrands = getTopStrands();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#14B8A6', '#0D9488']}
        style={styles.profileGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="person" size={24} color="#fff" />
            <Text style={styles.headerTitle}>Speaking DNA</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>

        {/* Speaker Archetype */}
        <Text style={styles.archetype}>{profile.overall_profile.speaker_archetype}</Text>

        {/* Stats */}
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

        {/* Top 2 Strands */}
        <View style={styles.strandsContainer}>
          <Text style={styles.strandsTitle}>Top Strengths</Text>
          <View style={styles.strandsRow}>
            {topStrands.map((strand, idx) => {
              const color = DNA_STRAND_COLORS[strand.key];
              const icon = DNA_STRAND_ICONS[strand.key];

              return (
                <View key={strand.key} style={styles.strandItem}>
                  <View style={[styles.strandIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Ionicons name={icon as any} size={20} color="#fff" />
                  </View>
                  <View style={styles.strandInfo}>
                    <Text style={styles.strandName}>
                      {strand.key.charAt(0).toUpperCase() + strand.key.slice(1)}
                    </Text>
                    <Text style={styles.strandScore}>{Math.round(strand.score * 100)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Call to action */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap to view full profile</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  centerContent: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  upsellGradient: {
    padding: 24,
  },
  upsellContent: {
    alignItems: 'center',
  },
  upsellTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  upsellSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  premiumBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  profileGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  archetype: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  strandsContainer: {
    marginTop: 8,
  },
  strandsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
    marginBottom: 12,
  },
  strandsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  strandItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  strandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strandInfo: {
    flex: 1,
    marginLeft: 8,
  },
  strandName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  strandScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
});

export default DNAProfileWidget;
