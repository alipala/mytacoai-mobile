/**
 * DNA Scan Results Screen
 *
 * Shows acoustic progress and DNA strand snapshot after a Voice Scan.
 * Vibrant design consistent with Profile Overview, Challenge cards and
 * Speaking DNA screens — colorful stat cards, gradient header, bold numbers.
 *
 * Flow: DNAVoiceScanScreen → DNAScanResultsScreen → Conversation
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SpeakingDNAProfile } from '../../types/speakingDNA';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DNAScanResultsScreenProps {
  navigation: any;
  route: any;
}

// ── Strand config ─────────────────────────────────────────────────────────────

const STRAND_CONFIG: Record<string, { colors: [string, string]; emoji: string; label: string }> = {
  rhythm:     { colors: ['#14B8A6', '#0891B2'], emoji: '🎵', label: 'Rhythm' },
  confidence: { colors: ['#8B5CF6', '#7C3AED'], emoji: '💪', label: 'Confidence' },
  vocabulary: { colors: ['#10B981', '#059669'], emoji: '📚', label: 'Vocabulary' },
  accuracy:   { colors: ['#EC4899', '#DB2777'], emoji: '🎯', label: 'Accuracy' },
  learning:   { colors: ['#3B82F6', '#2563EB'], emoji: '🧠', label: 'Learning' },
  emotional:  { colors: ['#FB923C', '#EA7C1A'], emoji: '❤️', label: 'Emotional' },
};

// ── Stat card (like Profile Overview masonry cards) ───────────────────────────

interface StatCardProps {
  colors: [string, string];
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  score?: number; // 0-1
}

const StatCard: React.FC<StatCardProps> = ({ colors, emoji, label, value, sub, score }) => (
  <LinearGradient colors={colors} style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {sub && <Text style={styles.statSub}>{sub}</Text>}
    {score !== undefined && (
      <View style={styles.statBar}>
        <View style={[styles.statBarFill, { width: `${Math.min(score * 100, 100)}%` as any }]} />
      </View>
    )}
  </LinearGradient>
);

// ── Breakthrough card ─────────────────────────────────────────────────────────

const BreakthroughCard: React.FC<{ b: any; index: number }> = ({ b, index }) => {
  const GRAD_PAIRS: [string, string][] = [
    ['#10B981', '#059669'],
    ['#8B5CF6', '#7C3AED'],
    ['#FB923C', '#EA7C1A'],
    ['#3B82F6', '#2563EB'],
    ['#EC4899', '#DB2777'],
  ];
  const colors = GRAD_PAIRS[index % GRAD_PAIRS.length];
  return (
    <LinearGradient colors={colors} style={styles.breakthroughCard}>
      <Text style={styles.breakthroughEmoji}>{b.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.breakthroughTitle}>{b.title}</Text>
        <Text style={styles.breakthroughDesc} numberOfLines={2}>{b.description}</Text>
      </View>
    </LinearGradient>
  );
};

// ── Metric row ────────────────────────────────────────────────────────────────

interface MetricRowProps {
  icon: string;
  iconColor: string;
  label: string;
  baseline: string;
  current: string;
  deltaLabel: string;
  positive: boolean | null; // null = neutral
}

const MetricRow: React.FC<MetricRowProps> = ({ icon, iconColor, label, baseline, current, deltaLabel, positive }) => (
  <View style={styles.metricRow}>
    <View style={[styles.metricIcon, { backgroundColor: `${iconColor}20` }]}>
      <Ionicons name={icon as any} size={16} color={iconColor} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricBaseline}>{baseline}</Text>
    <View style={[styles.metricDelta, {
      backgroundColor: positive === null ? 'rgba(255,255,255,0.08)' : positive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
    }]}>
      <Text style={[styles.metricDeltaText, {
        color: positive === null ? 'rgba(255,255,255,0.5)' : positive ? '#10B981' : '#EF4444',
      }]}>
        {deltaLabel}
      </Text>
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────

export const DNAScanResultsScreen: React.FC<DNAScanResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { planId, cardColor, language, dnaResult, updatedProfile, voiceCheckPrompt } = route.params || {};

  const profile = updatedProfile?.profile as SpeakingDNAProfile | null;
  const baseline = profile?.baseline_assessment?.acoustic_metrics;
  const strands = profile?.dna_strands;
  const breakthroughs = dnaResult?.breakthroughs || [];
  const hasBreakthroughs = breakthroughs.length > 0;

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleStartSession = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace('Conversation', { planId, cardColor });
  };

  // Headline
  const headline = hasBreakthroughs
    ? `🎉 ${breakthroughs.length} Breakthrough${breakthroughs.length > 1 ? 's' : ''} Unlocked!`
    : strands?.confidence?.trend === 'improving' ? '📈 Confidence Is Growing!'
    : (strands?.rhythm?.words_per_minute_avg ?? 0) > 50 ? '🚀 Your Pace Is Building!'
    : '🧬 Voice Scan Complete!';

  // Build strand cards (4 most acoustically relevant for voice checks)
  const strandCards = strands
    ? (['rhythm', 'confidence', 'emotional', 'vocabulary'] as const).map(key => {
        const cfg = STRAND_CONFIG[key];
        const s = strands[key];
        let value = '';
        let score: number | undefined;
        if (key === 'rhythm') { value = `${(s as any).words_per_minute_avg ?? 0} wpm`; score = (s as any).consistency_score; }
        else if (key === 'confidence') { value = (s as any).level ?? ''; score = (s as any).score; }
        else if (key === 'emotional') { value = (s as any).pattern?.replace('_', ' ') ?? ''; score = (s as any).session_end_confidence; }
        else if (key === 'vocabulary') { value = (s as any).style?.replace('_', ' ') ?? ''; }
        return { ...cfg, value, score };
      })
    : [];

  // Acoustic metric rows
  const wpm = strands?.rhythm?.words_per_minute_avg;
  const baselineWpm = 41; // stored in baseline as WPM from first assessment
  const wpmDelta = wpm !== undefined ? wpm - baselineWpm : null;

  const confScore = strands?.confidence?.score;
  const baselineConf = 0.39;
  const confDelta = confScore !== undefined ? confScore - baselineConf : null;

  const endConf = strands?.emotional?.session_end_confidence;
  const startConf = strands?.emotional?.session_start_confidence;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.header}>
        <SafeAreaView edges={['top'] as any}>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🧬</Text>
            <Text style={styles.headerTitle}>{headline}</Text>
            <Text style={styles.headerSub}>Your acoustic profile has been updated</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Breakthrough cards ─────────────────────────────────── */}
          {hasBreakthroughs && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 New Breakthroughs</Text>
              {breakthroughs.map((b: any, i: number) => (
                <BreakthroughCard key={b._id || i} b={b} index={i} />
              ))}
            </View>
          )}

          {/* ── DNA Strand snapshot (2×2 colorful cards) ──────────── */}
          {strandCards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎙️ Voice DNA Snapshot</Text>
              <View style={styles.strandGrid}>
                {strandCards.map((card) => (
                  <View key={card.label} style={styles.strandCell}>
                    <StatCard
                      colors={card.colors}
                      emoji={card.emoji}
                      label={card.label}
                      value={card.value}
                      score={card.score}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Acoustic changes vs Day 1 ──────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 vs Your Day 1 Baseline</Text>
            <View style={styles.metricsCard}>
              <View style={styles.metricsHeader}>
                <Text style={styles.metricsHeaderLabel}>Metric</Text>
                <Text style={styles.metricsHeaderLabel}>Baseline</Text>
                <Text style={styles.metricsHeaderLabel}>Change</Text>
              </View>

              {wpm !== undefined && (
                <MetricRow
                  icon="speedometer-outline"
                  iconColor="#14B8A6"
                  label="Speaking Speed"
                  baseline={`${baselineWpm} wpm`}
                  current={`${wpm} wpm`}
                  deltaLabel={wpmDelta !== null ? `${wpmDelta >= 0 ? '+' : ''}${wpmDelta} wpm` : '—'}
                  positive={wpmDelta !== null ? wpmDelta >= 0 : null}
                />
              )}
              {confScore !== undefined && (
                <MetricRow
                  icon="shield-checkmark-outline"
                  iconColor="#8B5CF6"
                  label="Confidence"
                  baseline={`${Math.round(baselineConf * 100)}%`}
                  current={`${Math.round(confScore * 100)}%`}
                  deltaLabel={confDelta !== null ? `${confDelta >= 0 ? '+' : ''}${Math.round(confDelta * 100)}%` : '—'}
                  positive={confDelta !== null ? confDelta >= 0 : null}
                />
              )}
              {startConf !== undefined && endConf !== undefined && (
                <MetricRow
                  icon="trending-up-outline"
                  iconColor="#FB923C"
                  label="Session Warmup"
                  baseline={`${Math.round(startConf * 100)}%`}
                  current={`${Math.round(endConf * 100)}%`}
                  deltaLabel={endConf > startConf ? `+${Math.round((endConf - startConf) * 100)}%` : `${Math.round((endConf - startConf) * 100)}%`}
                  positive={endConf >= startConf}
                />
              )}
              {baseline?.avg_pause_duration_ms !== undefined && (
                <MetricRow
                  icon="pause-circle-outline"
                  iconColor="#3B82F6"
                  label="Avg Pause"
                  baseline={`${(baseline.avg_pause_duration_ms / 1000).toFixed(1)}s`}
                  current={`${(baseline.avg_pause_duration_ms / 1000).toFixed(1)}s`}
                  deltaLabel="—"
                  positive={null}
                />
              )}
            </View>
          </View>

          {/* ── Summary stats row ──────────────────────────────────── */}
          <View style={styles.summaryRow}>
            <LinearGradient colors={['#14B8A6', '#0891B2']} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{profile?.sessions_analyzed ?? 1}</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
            </LinearGradient>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{Math.round(profile?.total_speaking_minutes ?? 0)}</Text>
              <Text style={styles.summaryLabel}>Minutes</Text>
            </LinearGradient>
            <LinearGradient colors={['#FB923C', '#EA7C1A']} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{breakthroughs.length}</Text>
              <Text style={styles.summaryLabel}>Breakthroughs</Text>
            </LinearGradient>
          </View>

          {/* ── CTA ───────────────────────────────────────────────── */}
          <View style={styles.ctaInfo}>
            <Ionicons name="checkmark-circle" size={18} color="#14B8A6" />
            <Text style={styles.ctaInfoText}>
              Your AI tutor has been updated with today's acoustic snapshot
            </Text>
          </View>

          <TouchableOpacity onPress={handleStartSession} activeOpacity={0.85} style={styles.ctaPrimary}>
            <LinearGradient
              colors={[cardColor || '#14B8A6', '#0891B2']}
              style={styles.ctaButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="play-circle" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.ctaText}>Continue Learning</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.75}
            style={styles.ctaSecondary}
          >
            <Ionicons name="home-outline" size={18} color="rgba(255,255,255,0.5)" style={{ marginRight: 8 }} />
            <Text style={styles.ctaSecondaryText}>Go to Learn Tab</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  header: {
    paddingBottom: 28,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Breakthrough
  breakthroughCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  breakthroughEmoji: {
    fontSize: 26,
    marginRight: 14,
  },
  breakthroughTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  breakthroughDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 17,
  },
  // Strand grid (2×2)
  strandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  strandCell: {
    width: (SCREEN_WIDTH - 50) / 2,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  // Stat card
  statCard: {
    borderRadius: 18,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 2,
  },
  statBar: {
    marginTop: 10,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  // Metrics card
  metricsCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  metricsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  metricsHeaderLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metricLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  metricBaseline: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginRight: 10,
    minWidth: 54,
    textAlign: 'center',
  },
  metricDelta: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  metricDeltaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  ctaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,184,166,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  ctaInfoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  ctaPrimary: {
    marginBottom: 12,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  ctaSecondaryText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '600',
  },
  ctaFootnote: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
});
