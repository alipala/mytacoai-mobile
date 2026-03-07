/**
 * Victories Share Card Component
 * ================================
 *
 * Shareable card for Speaking DNA victories (Page 2)
 * Displays: Breakthroughs count, Milestones, Latest breakthrough, Unlocked achievements
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SpeakingBreakthrough } from '../../types/speakingDNA';

// Instagram Story dimensions
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

// Flag components
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface VictoriesShareCardProps {
  language: string;
  totalBreakthroughs: number;
  achievedMilestones: number;
  totalMilestones: number;
  latestBreakthrough?: SpeakingBreakthrough;
  unlockedMilestones?: Array<{
    icon: string;
    title: string;
    color: string;
  }>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    confidence: '#6366F1',
    vocabulary: '#8B5CF6',
    accuracy: '#EC4899',
    rhythm: '#F59E0B',
    learning: '#10B981',
    emotional: '#EF4444',
  };
  return colors[category] || '#14B8A6';
};

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
// MAIN COMPONENT
// ============================================================================

export const VictoriesShareCard: React.FC<VictoriesShareCardProps> = ({
  language,
  totalBreakthroughs,
  achievedMilestones,
  totalMilestones,
  latestBreakthrough,
  unlockedMilestones = [],
}) => {
  const FlagComponent = getLanguageFlagComponent(language);

  return (
    <View style={styles.card}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0B1A1F', '#0D2832']}
        style={styles.background}
      >
        {/* Header - Language Badge Only */}
        <View style={styles.header}>
          <View style={styles.languageBadge}>
            {FlagComponent && (
              <View style={styles.flagIcon}>
                <FlagComponent width={60} height={60} />
              </View>
            )}
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
          </View>
        </View>

        {/* Victories Title */}
        <View style={styles.victoriesHeader}>
          <Ionicons name="trophy" size={80} color="#F59E0B" />
          <Text style={styles.victoriesTitle}>Your Victories</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star" size={60} color="#FCD34D" />
            </View>
            <Text style={styles.statValue}>{totalBreakthroughs}</Text>
            <Text style={styles.statLabel}>Breakthroughs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="ribbon" size={60} color="#FCD34D" />
            </View>
            <Text style={styles.statValue}>{achievedMilestones}/{totalMilestones}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
        </View>

        {/* Latest Breakthrough - Reduced Size */}
        {latestBreakthrough && (
          <View style={styles.latestSection}>
            <Text style={styles.sectionTitle}>Latest Breakthrough</Text>
            <View style={[styles.breakthroughCard, {
              backgroundColor: getCategoryColor(latestBreakthrough.category)
            }]}>
              <View style={styles.breakthroughIconLarge}>
                <Ionicons
                  name={getCategoryIcon(latestBreakthrough.category) as any}
                  size={60}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.breakthroughTitle}>{latestBreakthrough.title}</Text>
              <Text style={styles.breakthroughDescription} numberOfLines={2}>
                {latestBreakthrough.description}
              </Text>
            </View>
          </View>
        )}

        {/* Unlocked Milestones */}
        {unlockedMilestones.length > 0 && (
          <View style={styles.milestonesSection}>
            <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
            <View style={styles.milestonesRow}>
              {unlockedMilestones.map((milestone, index) => (
                <View
                  key={index}
                  style={[styles.miniMilestone, { backgroundColor: milestone.color }]}
                >
                  <Ionicons name={milestone.icon as any} size={70} color="#FFFFFF" />
                  <Text style={styles.miniMilestoneTitle} numberOfLines={2}>
                    {milestone.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Download MyTacoAI for Your Voice DNA</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#0B1A1F',
  },
  background: {
    flex: 1,
    padding: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
    gap: 16,
    borderWidth: 3,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  flagIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  languageText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#B4E4DD',
    letterSpacing: 2,
  },
  victoriesHeader: {
    alignItems: 'center',
    marginBottom: 50,
  },
  victoriesTitle: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 50,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 40,
    padding: 40,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  statIconContainer: {
    marginBottom: 20,
  },
  statValue: {
    fontSize: 96,
    fontWeight: '800',
    color: '#FCD34D',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  latestSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 20,
    textAlign: 'center',
  },
  breakthroughCard: {
    borderRadius: 40,
    padding: 40,
    alignItems: 'center',
  },
  breakthroughIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  breakthroughTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  breakthroughDescription: {
    fontSize: 28,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 40,
    textAlign: 'center',
  },
  milestonesSection: {
    marginBottom: 50,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  miniMilestone: {
    width: 220,
    height: 240,
    borderRadius: 36,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMilestoneTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 36,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 40,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default VictoriesShareCard;
