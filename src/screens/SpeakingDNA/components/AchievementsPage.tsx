/**
 * Achievements Page Component
 * ============================
 *
 * New page 5 for horizontal DNA screen showing:
 * - Breakthrough celebrations
 * - Achievement timeline
 * - Milestone badges
 * - Shareable victories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { speakingDNAService } from '../../../services/SpeakingDNAService';
import { SpeakingBreakthrough } from '../../../types/speakingDNA';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface AchievementsPageProps {
  language: string;
  onShare?: (breakthrough: SpeakingBreakthrough) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get gradient colors for breakthrough category
 */
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

/**
 * Get icon for breakthrough category
 */
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    confidence: 'rocket',
    vocabulary: 'book',
    learning: 'bulb',
    rhythm: 'pulse',
    accuracy: 'checkmark-done',
    emotional: 'heart',
  };
  return icons[category] || 'trophy';
};

// ============================================================================
// BREAKTHROUGH CARD COMPONENT
// ============================================================================

interface BreakthroughCardProps {
  breakthrough: SpeakingBreakthrough;
  onPress: () => void;
  onShare?: () => void;
}

const BreakthroughCard: React.FC<BreakthroughCardProps> = ({
  breakthrough,
  onPress,
  onShare,
}) => {
  const colors = getCategoryColors(breakthrough.category);
  const icon = getCategoryIcon(breakthrough.category);
  const date = new Date(breakthrough.detected_at);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.breakthroughCard}
    >
      <LinearGradient
        colors={colors}
        style={styles.breakthroughGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.breakthroughHeader}>
          <View style={styles.breakthroughHeaderLeft}>
            <View style={styles.breakthroughIconContainer}>
              <Ionicons name={icon as any} size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.breakthroughCategory}>
                {breakthrough.category.charAt(0).toUpperCase() + breakthrough.category.slice(1)}
              </Text>
              <Text style={styles.breakthroughDate}>
                {format(date, 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
          {onShare && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onShare();
              }}
              style={styles.shareButton}
            >
              <Ionicons name="share-social" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Emoji & Title */}
        <Text style={styles.breakthroughEmoji}>{breakthrough.emoji}</Text>
        <Text style={styles.breakthroughTitle}>{breakthrough.title}</Text>
        <Text style={styles.breakthroughDescription} numberOfLines={2}>
          {breakthrough.description}
        </Text>

        {/* Impact indicator */}
        {breakthrough.significance && (
          <View style={styles.impactContainer}>
            {[...Array(Math.min(breakthrough.significance, 3))].map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#FCD34D" />
            ))}
            <Text style={styles.impactText}>
              {breakthrough.significance === 3 ? 'Major Win!' : breakthrough.significance === 2 ? 'Great Progress!' : 'Nice Work!'}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ============================================================================
// MILESTONE BADGE COMPONENT
// ============================================================================

interface MilestoneBadgeProps {
  icon: string;
  title: string;
  description: string;
  achieved: boolean;
}

const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  icon,
  title,
  description,
  achieved,
}) => {
  return (
    <View style={[styles.milestoneBadge, !achieved && styles.milestoneBadgeLocked]}>
      <LinearGradient
        colors={achieved ? ['#14B8A6', '#0D9488'] : ['#374151', '#1F2937']}
        style={styles.milestoneGradient}
      >
        <View style={[styles.milestoneIcon, !achieved && styles.milestoneIconLocked]}>
          <Ionicons name={icon as any} size={32} color={achieved ? '#FFFFFF' : '#6B7280'} />
        </View>
        <Text style={[styles.milestoneTitle, !achieved && styles.milestoneTitleLocked]}>
          {title}
        </Text>
        <Text style={[styles.milestoneDescription, !achieved && styles.milestoneDescriptionLocked]}>
          {description}
        </Text>
        {!achieved && (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color="#6B7280" />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

// ============================================================================
// ACHIEVEMENTS PAGE COMPONENT
// ============================================================================

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ language, onShare }) => {
  const [breakthroughs, setBreakthroughs] = useState<SpeakingBreakthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreakthrough, setSelectedBreakthrough] = useState<SpeakingBreakthrough | null>(null);

  /**
   * Load breakthroughs
   */
  useEffect(() => {
    async function fetchBreakthroughs() {
      try {
        setLoading(true);
        const data = await speakingDNAService.getBreakthroughs(language, {
          limit: 20,
          forceRefresh: false,
        });
        setBreakthroughs(data);
      } catch (error) {
        console.error('[AchievementsPage] Error fetching breakthroughs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBreakthroughs();
  }, [language]);

  /**
   * Handle breakthrough press
   */
  const handleBreakthroughPress = (breakthrough: SpeakingBreakthrough) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBreakthrough(breakthrough);
    // Could open a detail modal here
  };

  /**
   * Handle breakthrough share
   */
  const handleBreakthroughShare = (breakthrough: SpeakingBreakthrough) => {
    onShare?.(breakthrough);
  };

  /**
   * Calculate milestones
   */
  const totalBreakthroughs = breakthroughs.length;
  const confidenceBreakthroughs = breakthroughs.filter(b => b.category === 'confidence').length;
  const vocabularyBreakthroughs = breakthroughs.filter(b => b.category === 'vocabulary').length;

  const milestones = [
    {
      icon: 'trophy',
      title: 'First Win',
      description: 'Achieved your first breakthrough',
      achieved: totalBreakthroughs >= 1,
    },
    {
      icon: 'flame',
      title: 'On Fire',
      description: 'Reached 5 breakthroughs',
      achieved: totalBreakthroughs >= 5,
    },
    {
      icon: 'star',
      title: 'Champion',
      description: 'Achieved 10 breakthroughs',
      achieved: totalBreakthroughs >= 10,
    },
    {
      icon: 'chatbubble',
      title: 'Confidence Master',
      description: '3+ confidence breakthroughs',
      achieved: confidenceBreakthroughs >= 3,
    },
    {
      icon: 'book',
      title: 'Word Wizard',
      description: '3+ vocabulary breakthroughs',
      achieved: vocabularyBreakthroughs >= 3,
    },
  ];

  const achievedMilestones = milestones.filter(m => m.achieved).length;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <View style={styles.page}>
        <LinearGradient colors={['#0B1A1F', '#0D2832']} style={styles.background} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      </View>
    );
  }

  if (breakthroughs.length === 0) {
    return (
      <View style={styles.page}>
        <LinearGradient colors={['#0B1A1F', '#0D2832']} style={styles.background} />
        <View style={styles.centerContent}>
          <Ionicons name="trophy-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Breakthroughs Yet</Text>
          <Text style={styles.emptyText}>
            Keep practicing! Breakthroughs are detected when you make significant improvements in your speaking skills.
          </Text>
          <View style={styles.emptyHint}>
            <Ionicons name="information-circle" size={20} color="#14B8A6" />
            <Text style={styles.emptyHintText}>
              Tip: Improvements of 15%+ in any DNA strand trigger a breakthrough!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Dark gradient background */}
      <LinearGradient colors={['#0B1A1F', '#0D2832']} style={styles.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.header}>
          <Ionicons name="trophy" size={28} color="#F59E0B" />
          <Text style={styles.headerTitle}>Your Victories</Text>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
            style={styles.statsBannerGradient}
          >
            <View style={styles.statsBannerContent}>
              <View style={styles.statsBannerItem}>
                <Text style={styles.statsBannerValue}>{totalBreakthroughs}</Text>
                <Text style={styles.statsBannerLabel}>Breakthroughs</Text>
              </View>
              <View style={styles.statsBannerDivider} />
              <View style={styles.statsBannerItem}>
                <Text style={styles.statsBannerValue}>{achievedMilestones}/{milestones.length}</Text>
                <Text style={styles.statsBannerLabel}>Milestones</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon" size={20} color="#14B8A6" />
            <Text style={styles.sectionTitle}>Milestones</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestonesScroll}
          >
            {milestones.map((milestone, index) => (
              <MilestoneBadge key={index} {...milestone} />
            ))}
          </ScrollView>
        </View>

        {/* Breakthroughs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#14B8A6" />
            <Text style={styles.sectionTitle}>Recent Breakthroughs</Text>
          </View>
          {breakthroughs.map((breakthrough) => (
            <BreakthroughCard
              key={breakthrough._id}
              breakthrough={breakthrough}
              onPress={() => handleBreakthroughPress(breakthrough)}
              onShare={() => handleBreakthroughShare(breakthrough)}
            />
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    flex: 1,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
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
    color: '#9CA3AF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  emptyHintText: {
    flex: 1,
    fontSize: 13,
    color: '#14B8A6',
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsBanner: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  statsBannerGradient: {
    padding: 20,
  },
  statsBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBannerItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsBannerValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FCD34D',
  },
  statsBannerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsBannerDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  milestonesScroll: {
    paddingRight: 16,
    gap: 12,
  },
  milestoneBadge: {
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  milestoneBadgeLocked: {
    opacity: 0.6,
  },
  milestoneGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 160,
  },
  milestoneIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  milestoneIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  milestoneTitleLocked: {
    color: '#9CA3AF',
  },
  milestoneDescription: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 14,
  },
  milestoneDescriptionLocked: {
    color: '#6B7280',
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  breakthroughCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  breakthroughGradient: {
    padding: 16,
  },
  breakthroughHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakthroughHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakthroughIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakthroughCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breakthroughDate: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakthroughEmoji: {
    fontSize: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  breakthroughTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  breakthroughDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    textAlign: 'center',
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCD34D',
    marginLeft: 4,
  },
});

export default AchievementsPage;
