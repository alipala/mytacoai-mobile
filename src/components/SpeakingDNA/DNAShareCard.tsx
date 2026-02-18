/**
 * DNA Share Card Component - VIRAL EDITION 🔥
 *
 * Dark, bold, Instagram-Story optimized shareable card
 * Designed for maximum visual impact and shareability
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon, Circle, Line, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import type { SpeakingDNAProfile } from '../../types/speakingDNA';

// Import SVG flags
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';

// Instagram Story dimensions (9:16 aspect ratio)
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

// Vibrant color palette for dark mode - matching app theme
const VIRAL_COLORS = {
  background: {
    dark: '#0B1A1F',  // Deep teal-dark
    darkBlue: '#0D2832', // Darker teal
    accent: '#14B8A6',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B4E4DD',
    tertiary: '#7BA5A0',
  },
  neon: {
    cyan: '#14B8A6',  // Primary teal from app
    purple: '#9B59B6',
    pink: '#E91E63',
    yellow: '#FFD63A',
    green: '#2ECC71',
  },
  strand: {
    rhythm: '#4ECDC4',     // Match main screen colors
    confidence: '#9B59B6',
    vocabulary: '#2ECC71',
    accuracy: '#3498DB',
    learning: '#E67E22',
    emotional: '#E91E63',
  },
};

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

interface DNAShareCardProps {
  profile: SpeakingDNAProfile;
  language: string;
  variant?: 'story' | 'post' | 'wide';
}

/**
 * Vibrant Radar Chart with Glow Effects
 */
const ViralRadarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  size: number;
}> = ({ data, size }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.32;

  // Calculate polygon points for data
  const dataPoints = data.map((point, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const distance = radius * (point.value / 100);
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  });

  const dataPointsString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Calculate label positions (further out)
  const labelPoints = data.map((point, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const distance = radius * 1.35;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      label: point.label,
      value: Math.round(point.value),
      color: point.color,
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#00F5FF" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#00F5FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Glow background */}
      <Circle cx={centerX} cy={centerY} r={radius * 1.2} fill="url(#glowGradient)" />

      {/* Concentric hexagons (grid) */}
      {Array.from({ length: 5 }).map((_, levelIndex) => {
        const levelRadius = radius * ((levelIndex + 1) / 5);
        const hexPoints = data
          .map((_, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * levelRadius;
            const y = centerY + Math.sin(angle) * levelRadius;
            return `${x},${y}`;
          })
          .join(' ');

        return (
          <Polygon
            key={`hex-${levelIndex}`}
            points={hexPoints}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={2}
            fill="none"
          />
        );
      })}

      {/* Axis lines */}
      {data.map((_, index) => {
        const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return (
          <Line
            key={`axis-${index}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={2}
          />
        );
      })}

      {/* Data polygon with gradient fill */}
      <Polygon
        points={dataPointsString}
        fill="#00F5FF"
        fillOpacity={0.2}
        stroke="#00F5FF"
        strokeWidth={4}
      />

      {/* Data points with glow */}
      {dataPoints.map((point, index) => (
        <React.Fragment key={`point-${index}`}>
          {/* Glow circle */}
          <Circle cx={point.x} cy={point.y} r={20} fill={data[index].color} opacity={0.3} />
          {/* Main point */}
          <Circle
            cx={point.x}
            cy={point.y}
            r={12}
            fill={data[index].color}
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        </React.Fragment>
      ))}

      {/* Labels with values */}
      {labelPoints.map((point, index) => (
        <React.Fragment key={`label-${index}`}>
          {/* Label text */}
          <SvgText
            x={point.x}
            y={point.y - 15}
            fontSize={32}
            fontWeight="700"
            fill={point.color}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
          {/* Value text */}
          <SvgText
            x={point.x}
            y={point.y + 20}
            fontSize={28}
            fontWeight="600"
            fill="rgba(255, 255, 255, 0.7)"
            textAnchor="middle"
          >
            {point.value}
          </SvgText>
        </React.Fragment>
      ))}

    </Svg>
  );
};

/**
 * Colored DNA Strand Cards
 */
const StrandCard: React.FC<{
  label: string;
  value: number;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description: string;
}> = ({ label, value, color, iconName, description }) => (
  <View style={[styles.strandCard, { backgroundColor: color + '20', borderColor: color }]}>
    <View style={[styles.strandIconContainer, { backgroundColor: color }]}>
      <Ionicons name={iconName} size={32} color="#FFFFFF" />
    </View>
    <Text style={styles.strandLabel}>{label}</Text>
    <Text style={styles.strandDescription}>{description}</Text>
  </View>
);

/**
 * Extract numeric score (0-100) from DNA strand object
 * Same logic as main DNA screen for consistency
 */
const getStrandScore = (strand: any): number => {
  if (!strand) return 0;

  // Try different score fields based on strand type
  if ('score' in strand) return Math.round(strand.score * 100);
  if ('consistency_score' in strand) return Math.round(strand.consistency_score * 100);
  if ('grammar_accuracy' in strand) return Math.round(strand.grammar_accuracy * 100);
  if ('new_word_attempt_rate' in strand) return Math.round(strand.new_word_attempt_rate * 100);
  if ('challenge_acceptance' in strand) return Math.round(strand.challenge_acceptance * 100);
  if ('session_end_confidence' in strand) return Math.round(strand.session_end_confidence * 100);

  return 0;
};

/**
 * Main Share Card Component - VIRAL EDITION
 */
export const DNAShareCard = React.forwardRef<View, DNAShareCardProps>(
  ({ profile, language }, ref) => {
    console.log('[DNAShareCard] Rendering VIRAL card for language:', language);

    // Extract strand data using same logic as main screen
    const strandData = [
      {
        label: 'Rhythm',
        value: getStrandScore(profile.dna_strands.rhythm),
        color: VIRAL_COLORS.strand.rhythm,
        iconName: 'water' as const,
      },
      {
        label: 'Confidence',
        value: getStrandScore(profile.dna_strands.confidence),
        color: VIRAL_COLORS.strand.confidence,
        iconName: 'flame' as const,
      },
      {
        label: 'Vocab',
        value: getStrandScore(profile.dna_strands.vocabulary),
        color: VIRAL_COLORS.strand.vocabulary,
        iconName: 'library' as const,
      },
      {
        label: 'Accuracy',
        value: getStrandScore(profile.dna_strands.accuracy),
        color: VIRAL_COLORS.strand.accuracy,
        iconName: 'checkmark-circle' as const,
      },
      {
        label: 'Learning',
        value: getStrandScore(profile.dna_strands.learning),
        color: VIRAL_COLORS.strand.learning,
        iconName: 'rocket' as const,
      },
      {
        label: 'Emotional',
        value: getStrandScore(profile.dna_strands.emotional),
        color: VIRAL_COLORS.strand.emotional,
        iconName: 'heart' as const,
      },
    ];

    // Featured strands: Rhythm, Emotional, Confidence (most interesting for sharing)
    const featuredStrands = [
      strandData.find(s => s.label === 'Rhythm'),
      strandData.find(s => s.label === 'Emotional'),
      strandData.find(s => s.label === 'Confidence'),
    ]
      .filter(Boolean)
      .map(strand => ({
        ...strand!,
        description: getStrandDescription(strand!.label, profile.dna_strands),
      }));

    // Helper to get strand description from profile
    function getStrandDescription(label: string, strands: any): string {
      const strandMap: Record<string, string> = {
        'Rhythm': strands.rhythm?.pattern?.replace(/_/g, ' ') || strands.rhythm?.type?.replace(/_/g, ' ') || 'Natural flow',
        'Confidence': strands.confidence?.level?.replace(/_/g, ' ') || 'Building strong',
        'Vocab': strands.vocabulary?.style?.replace(/_/g, ' ') || 'Expanding',
        'Accuracy': strands.accuracy?.pattern || 'Improving',
        'Learning': strands.learning?.type || 'Growing',
        'Emotional': strands.emotional?.pattern?.replace(/_/g, ' ') || strands.emotional?.trend?.replace(/_/g, ' ') || 'Growing resilience',
      };
      return strandMap[label] || 'Developing';
    }

    // Derive CEFR level from vocabulary complexity
    const complexityLevel = profile.dna_strands?.vocabulary?.complexity_level;
    const cefrLevel =
      complexityLevel === 'advanced' ? 'C1' :
      complexityLevel === 'intermediate' ? 'B1' :
      complexityLevel === 'beginner' ? 'A2' : null;

    // Get archetype info
    const archetype = profile.overall_profile || {};
    const archetypeName =
      archetype.name || archetype.speaker_archetype || 'The Unique Learner';
    const archetypeSummary =
      archetype.summary ||
      archetype.description ||
      'A distinctive learner with their own approach';

    // Get flag component
    const FlagComponent = getLanguageFlagComponent(language);

    return (
      <View ref={ref} style={styles.cardContainer}>
        <LinearGradient
          colors={[VIRAL_COLORS.background.dark, VIRAL_COLORS.background.darkBlue]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>MY SPEAKING DNA</Text>
            <View style={styles.languagePill}>
              {FlagComponent && (
                <View style={styles.flagWrapper}>
                  <FlagComponent width={32} height={32} />
                </View>
              )}
              <Text style={styles.languageText}>{language.toUpperCase()}</Text>
            </View>
          </View>

          {/* Archetype Hero Section */}
          <View style={styles.archetypeHero}>
            <LinearGradient
              colors={[VIRAL_COLORS.neon.cyan, '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.archetypeBadge}
            >
              <Text style={styles.archetypeName}>{archetypeName}</Text>
            </LinearGradient>
            <Text style={styles.archetypeSummary}>"{archetypeSummary}"</Text>
          </View>

          {/* Radar Chart Section */}
          <View style={styles.radarSection}>
            <ViralRadarChart data={strandData} size={650} />
          </View>

          {/* Featured Strand Cards: Rhythm, Emotional, Confidence */}
          <View style={styles.strandsGrid}>
            {featuredStrands.map((strand, index) => (
              <StrandCard
                key={strand.label}
                label={strand.label}
                value={Math.round(strand.value)}
                color={strand.color}
                iconName={strand.iconName}
                description={strand.description}
              />
            ))}
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
              <Text style={styles.statValue}>{cefrLevel || '—'}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <LinearGradient
              colors={[VIRAL_COLORS.neon.cyan, VIRAL_COLORS.neon.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBadge}
            >
              <Text style={styles.ctaText}>Discover Your Speaking DNA</Text>
            </LinearGradient>
            <Text style={styles.footerSubtext}>mytaco.ai</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

DNAShareCard.displayName = 'DNAShareCard';

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: VIRAL_COLORS.background.dark,
  },
  gradient: {
    flex: 1,
    padding: 60,
    paddingTop: 80,
    paddingBottom: 80,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 68,
    fontWeight: '900',
    color: VIRAL_COLORS.text.primary,
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: VIRAL_COLORS.neon.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    gap: 12,
  },
  flagWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  languageText: {
    fontSize: 26,
    fontWeight: '700',
    color: VIRAL_COLORS.text.primary,
    letterSpacing: 2,
  },
  // Archetype Hero
  archetypeHero: {
    alignItems: 'center',
    marginBottom: 50,
  },
  archetypeBadge: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 35,
    marginBottom: 20,
    shadowColor: VIRAL_COLORS.neon.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  archetypeName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  archetypeSummary: {
    fontSize: 28,
    fontWeight: '500',
    color: VIRAL_COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 38,
    paddingHorizontal: 40,
  },
  // Radar
  radarSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  // Strand Cards
  strandsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 16,
  },
  strandCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
  },
  strandIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  strandLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: VIRAL_COLORS.text.primary,
    marginBottom: 8,
  },
  strandDescription: {
    fontSize: 18,
    fontWeight: '500',
    color: VIRAL_COLORS.text.secondary,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 44,
    fontWeight: '900',
    color: VIRAL_COLORS.neon.cyan,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: VIRAL_COLORS.text.tertiary,
  },
  // Footer
  footer: {
    alignItems: 'center',
  },
  ctaBadge: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerSubtext: {
    fontSize: 24,
    fontWeight: '600',
    color: VIRAL_COLORS.text.tertiary,
  },
});
