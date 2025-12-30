/**
 * Session Progress Bar (Redesigned)
 *
 * Displays current session progress with spatial journey visualization
 * Shows: Node-based progress path, XP earned, combo streak
 *
 * Uses new game-feel components for immersive experience
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useChallengeSession } from '../contexts/ChallengeSessionContext';
import { useFocus } from '../contexts/FocusContext';
import { formatXP } from '../services/xpCalculator';
import { ProgressPath } from './ProgressPath';
import { ComboBadge } from './ComboBadge';
import { HeartDisplay } from './HeartDisplay';
import { StreakShieldIndicator } from './StreakShieldIndicator';

interface SessionProgressBarProps {
  showXP?: boolean;
  showCombo?: boolean;
  showHearts?: boolean;
  onComboMilestone?: (combo: number, message: string) => void;
  onComboLost?: () => void;
}

export default function SessionProgressBar({
  showXP = true,
  showCombo = true,
  showHearts = true,
  onComboMilestone,
  onComboLost,
}: SessionProgressBarProps) {
  const { session, getProgress } = useChallengeSession();
  const { config } = useFocus();
  const progress = getProgress();

  if (!session) {
    return null;
  }

  // Get the challenge type from the session
  const challengeType = session.challengeType;

  return (
    <View style={styles.container}>
      {/* Top stats bar */}
      <View style={styles.statsRow}>
        <View style={styles.rightStats}>
          {/* Hearts Display - Only show if not unlimited */}
          {showHearts && !config.unlimitedHearts && (
            <View style={styles.statBadge}>
              <HeartDisplay
                challengeType={challengeType}
                showTimer={false}
                size="small"
                layout="horizontal"
              />
            </View>
          )}

          {/* Streak Shield Indicator - Only show if not unlimited */}
          {!config.unlimitedHearts && (
            <StreakShieldIndicator size="small" showLabel={true} />
          )}

          {/* XP Badge */}
          {showXP && (
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>💪</Text>
              <Text style={styles.statValue}>{formatXP(session.totalXP)} XP</Text>
            </View>
          )}

          {/* Combo Badge (using new component) */}
          {showCombo && (
            <ComboBadge
              onMilestone={onComboMilestone}
              onComboLost={onComboLost}
            />
          )}
        </View>
      </View>

      {/* Progress Path (replaces progress bar) */}
      <ProgressPath />

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0891B2',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
