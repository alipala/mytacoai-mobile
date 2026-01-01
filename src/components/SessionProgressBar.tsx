/**
 * Session Progress Bar (Redesigned)
 *
 * Displays current session progress with spatial journey visualization
 * Shows: Hearts (left), Node-based progress path, XP earned, combo streak (right)
 *
 * Uses new game-feel components for immersive experience
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useChallengeSession } from '../contexts/ChallengeSessionContext';
import { formatXP } from '../services/xpCalculator';
import { ProgressPath } from './ProgressPath';
import { ComboBadge } from './ComboBadge';
import { HeartDisplay } from './HeartDisplay';
import { HeartPool } from '../types/hearts';

interface SessionProgressBarProps {
  showXP?: boolean;
  showCombo?: boolean;
  showHearts?: boolean;
  heartPool?: HeartPool | null;
  onComboMilestone?: (combo: number, message: string) => void;
  onComboLost?: () => void;
}

export default function SessionProgressBar({
  showXP = true,
  showCombo = true,
  showHearts = true,
  heartPool = null,
  onComboMilestone,
  onComboLost,
}: SessionProgressBarProps) {
  const { session, getProgress } = useChallengeSession();
  const progress = getProgress();
  const [previousHearts, setPreviousHearts] = useState<number | undefined>(undefined);
  const previousHeartsRef = React.useRef<number | undefined>(undefined);

  // Track heart changes for animation - use ref to avoid double triggers
  useEffect(() => {
    if (heartPool && previousHeartsRef.current !== heartPool.currentHearts) {
      // Store current value for next comparison
      const oldValue = previousHeartsRef.current;
      previousHeartsRef.current = heartPool.currentHearts;

      // Only update state if we have a previous value (not first render)
      if (oldValue !== undefined) {
        setPreviousHearts(oldValue);
      }
    }
  }, [heartPool?.currentHearts]);

  if (!session) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Single Card Container for All Stats */}
      <View style={styles.statsCard}>
        {/* Left: Hearts + Shield */}
        {showHearts && heartPool && (
          <View style={styles.heartsSection}>
            <HeartDisplay
              heartPool={heartPool}
              size="medium"
              showShield={true}
              showCount={false}
              previousHearts={previousHearts}
              separateShield={true}
            />
          </View>
        )}

        {/* Vertical Divider */}
        {showHearts && heartPool && showXP && (
          <View style={styles.verticalDivider} />
        )}

        {/* Right: XP Only */}
        {showXP && (
          <View style={styles.rightStats}>
            {/* XP Badge (no emoji) */}
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{formatXP(session.totalXP)} XP</Text>
            </View>
          </View>
        )}
      </View>

      {/* Progress Path (replaces progress bar) */}
      <View style={styles.progressSection}>
        <View style={styles.progressCard}>
          <ProgressPath />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingTop: 12,
    paddingBottom: 8,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginRight: 60, // Add right margin to create space for the X button notch
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderTopRightRadius: 0, // Remove top-right radius to create notch effect
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 64, // Increased for 2 rows of hearts
    overflow: 'visible', // Prevent clipping of hearts
  },
  heartsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    flexShrink: 0, // Prevent shrinking
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    minWidth: 70,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0891B2',
    letterSpacing: -0.2,
  },
  progressSection: {
    marginTop: 12,
  },
  progressCard: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
