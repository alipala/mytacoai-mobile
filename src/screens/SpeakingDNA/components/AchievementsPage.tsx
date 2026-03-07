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
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get SOLID color for breakthrough category (DNA palette)
 */
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    confidence: '#6366F1', // Indigo
    vocabulary: '#8B5CF6', // Purple
    accuracy: '#EC4899',   // Pink
    rhythm: '#F59E0B',     // Amber
    learning: '#10B981',   // Green
    emotional: '#EF4444',  // Red
  };
  return colors[category] || '#14B8A6';
};

/**
 * Get icon for breakthrough category (flat white icons)
 */
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    confidence: 'shield-checkmark',
    vocabulary: 'book',
    learning: 'school',
    rhythm: 'pulse',
    accuracy: 'checkmark-circle',
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
}

const BreakthroughCard: React.FC<BreakthroughCardProps> = ({
  breakthrough,
  onPress,
}) => {
  const color = getCategoryColor(breakthrough.category);
  const icon = getCategoryIcon(breakthrough.category);

  // 🔧 FIX: Use created_at (not detected_at) and add defensive parsing
  const dateValue = breakthrough.created_at || new Date().toISOString();
  const date = new Date(dateValue);

  // Validate date - if invalid, use current date as fallback
  if (isNaN(date.getTime())) {
    console.warn('[BreakthroughCard] Invalid date:', dateValue);
    date.setTime(Date.now());
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.breakthroughCard}
    >
      {/* SOLID COLOR - Same size as milestone cards */}
      <View style={[styles.breakthroughContainer, { backgroundColor: color }]}>
        {/* FLAT WHITE ICON - Centered like milestones */}
        <View style={styles.breakthroughIcon}>
          <Ionicons name={icon as any} size={32} color="#FFFFFF" />
        </View>

        <Text style={styles.breakthroughTitle} numberOfLines={2}>
          {breakthrough.title}
        </Text>
        <Text style={styles.breakthroughDescription} numberOfLines={2}>
          {breakthrough.description}
        </Text>
      </View>
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
  color: string;
}

const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  icon,
  title,
  description,
  achieved,
  color,
}) => {
  const backgroundColor = achieved ? color : '#374151';

  return (
    <View style={[styles.milestoneBadge, !achieved && styles.milestoneBadgeLocked]}>
      {/* SOLID COLOR - No gradient */}
      <View style={[styles.milestoneContainer, { backgroundColor }]}>
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
      </View>
    </View>
  );
};

// ============================================================================
// ACHIEVEMENTS PAGE COMPONENT
// ============================================================================

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ language }) => {
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
      color: '#10B981',
    },
    {
      icon: 'flame',
      title: 'On Fire',
      description: 'Reached 5 breakthroughs',
      achieved: totalBreakthroughs >= 5,
      color: '#EF4444',
    },
    {
      icon: 'star',
      title: 'Champion',
      description: 'Achieved 10 breakthroughs',
      achieved: totalBreakthroughs >= 10,
      color: '#F59E0B',
    },
    {
      icon: 'shield-checkmark',
      title: 'Confidence Master',
      description: '3+ confidence breakthroughs',
      achieved: confidenceBreakthroughs >= 3,
      color: '#6366F1',
    },
    {
      icon: 'book',
      title: 'Word Wizard',
      description: '3+ vocabulary breakthroughs',
      achieved: vocabularyBreakthroughs >= 3,
      color: '#8B5CF6',
    },
  ];

  // Sort: Unlocked first, then locked
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.achieved && !b.achieved) return -1;
    if (!a.achieved && b.achieved) return 1;
    return 0;
  });

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

        {/* Enhanced Stats Banner */}
        <View style={styles.statsBanner}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.08)']}
            style={styles.statsBannerGradient}
          >
            {/* Trophy Icon Background */}
            <View style={styles.statsBannerIconBg}>
              <Ionicons name="trophy" size={80} color="rgba(251, 191, 36, 0.1)" />
            </View>

            <View style={styles.statsBannerContent}>
              <View style={styles.statsBannerItem}>
                <View style={styles.statsBannerIconContainer}>
                  <Ionicons name="star" size={24} color="#FCD34D" />
                </View>
                <Text style={styles.statsBannerValue}>{totalBreakthroughs}</Text>
                <Text style={styles.statsBannerLabel}>Breakthroughs</Text>
              </View>
              <View style={styles.statsBannerDivider} />
              <View style={styles.statsBannerItem}>
                <View style={styles.statsBannerIconContainer}>
                  <Ionicons name="ribbon" size={24} color="#FCD34D" />
                </View>
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
            {sortedMilestones.map((milestone, index) => (
              <MilestoneBadge key={index} {...milestone} />
            ))}
          </ScrollView>
        </View>

        {/* Breakthroughs - Horizontal Swipeable */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#14B8A6" />
            <Text style={styles.sectionTitle}>Recent Breakthroughs</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.breakthroughsScroll}
          >
            {breakthroughs.map((breakthrough) => (
              <BreakthroughCard
                key={breakthrough._id}
                breakthrough={breakthrough}
                onPress={() => handleBreakthroughPress(breakthrough)}
              />
            ))}
          </ScrollView>
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statsBannerGradient: {
    padding: 24,
    position: 'relative',
  },
  statsBannerIconBg: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.5,
  },
  statsBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBannerItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsBannerIconContainer: {
    marginBottom: 8,
  },
  statsBannerValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FCD34D',
    textShadowColor: 'rgba(251, 191, 36, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  statsBannerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  statsBannerDivider: {
    width: 2,
    height: 60,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
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
  breakthroughsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  milestoneBadge: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  milestoneBadgeLocked: {
    opacity: 0.6,
  },
  milestoneContainer: {
    padding: 14,
    alignItems: 'center',
    height: 160,
    justifyContent: 'space-between',
  },
  milestoneIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  milestoneIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  milestoneTitleLocked: {
    color: '#9CA3AF',
  },
  milestoneDescription: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 13,
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
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  breakthroughContainer: {
    padding: 14,
    alignItems: 'center',
    height: 160,
    justifyContent: 'space-between',
  },
  breakthroughIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  breakthroughTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  breakthroughDescription: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 13,
  },
});

export default AchievementsPage;
