/**
 * OutOfHeartsModal Component
 *
 * Shown when user runs out of hearts for a challenge type
 * Features:
 * - Empathetic messaging (not punitive!)
 * - Alternative challenge suggestions
 * - Refill timer countdown
 * - Soft premium upgrade option
 * - Learning companion character
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocus } from '../contexts/FocusContext';
import { OutOfHeartsData, AlternativeChallenge } from '../types/focus';
import { LearningCompanion } from './LearningCompanion';
import { COLORS } from '../constants/colors';

interface OutOfHeartsModalProps {
  visible: boolean;
  data: OutOfHeartsData | null;
  onClose: () => void;
  onSelectAlternative: (challengeType: string) => void;
  onUpgrade: () => void;
}

export function OutOfHeartsModal({
  visible,
  data,
  onClose,
  onSelectAlternative,
  onUpgrade,
}: OutOfHeartsModalProps) {
  const { config } = useFocus();
  const [timeRemaining, setTimeRemaining] = useState('');

  // Update timer every second
  useEffect(() => {
    if (!visible || !data) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const refillTime = new Date(data.nextHeartRefillTime).getTime();
      const diff = refillTime - now;

      if (diff <= 0) {
        setTimeRemaining('Refilling now...');
        // Close modal after a moment to let hearts refill
        setTimeout(() => {
          onClose();
        }, 1000);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [visible, data, onClose]);

  if (!data) return null;

  const handleAlternativePress = (challenge: AlternativeChallenge) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectAlternative(challenge.type);
  };

  const handleUpgradePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onUpgrade();
  };

  // Completely blocked (all types depleted) - RARE!
  if (data.isCompletelyBlocked) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Character */}
          <View style={styles.characterContainer}>
            <LearningCompanion state="resting" combo={1} size={96} />
          </View>

          {/* Title */}
          <Text style={styles.titleBlocked}>You've Mastered Today! 🏆</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your dedication is incredible! All challenges completed.
          </Text>

          {/* Stats could go here */}

          {/* Refill Info */}
          <View style={styles.refillCard}>
            <View style={styles.refillRow}>
              <Ionicons name="time-outline" size={24} color={COLORS.turquoise} />
              <View style={styles.refillTextContainer}>
                <Text style={styles.refillLabel}>Next heart in</Text>
                <Text style={styles.refillTime}>{timeRemaining}</Text>
              </View>
            </View>

            {data.allHeartsRefillTime && (
              <View style={[styles.refillRow, { marginTop: 12 }]}>
                <Ionicons name="moon-outline" size={24} color="#6366F1" />
                <View style={styles.refillTextContainer}>
                  <Text style={styles.refillLabel}>All hearts refill at midnight</Text>
                </View>
              </View>
            )}
          </View>

          {/* Upgrade Option */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
            activeOpacity={0.8}
          >
            <View style={styles.upgradeContent}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.upgradeText}>Practice unlimited anytime</Text>
            </View>
            <Text style={styles.upgradeSubtext}>Upgrade to Language Mastery</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>Got it 👍</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // Normal case: Has alternatives
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character */}
        <View style={styles.characterContainer}>
          <LearningCompanion state="resting" combo={1} size={80} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{data.challengeTitle} Focus Depleted 🎯</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Great practice! While your Focus recharges, keep learning with:
        </Text>

        {/* Alternative Challenges */}
        <View style={styles.alternativesContainer}>
          {data.remainingTypes.map((challenge, index) => (
            <TouchableOpacity
              key={challenge.type}
              style={styles.alternativeCard}
              onPress={() => handleAlternativePress(challenge)}
              activeOpacity={0.7}
            >
              <View style={styles.alternativeHeader}>
                <Text style={styles.alternativeEmoji}>{challenge.emoji}</Text>
                <View style={styles.alternativeInfo}>
                  <Text style={styles.alternativeTitle}>{challenge.title}</Text>
                  <View style={styles.heartsRow}>
                    {Array.from({ length: Math.min(challenge.availableHearts, 5) }).map((_, i) => (
                      <Ionicons key={i} name="heart" size={14} color="#FF6B9D" />
                    ))}
                    {challenge.availableHearts > 5 && (
                      <Text style={styles.moreHearts}>+{challenge.availableHearts - 5}</Text>
                    )}
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Refill Info */}
        <View style={styles.refillCard}>
          <View style={styles.refillRow}>
            <Ionicons name="time-outline" size={24} color={COLORS.turquoise} />
            <View style={styles.refillTextContainer}>
              <Text style={styles.refillLabel}>Next {data.challengeTitle} heart in</Text>
              <Text style={styles.refillTime}>{timeRemaining}</Text>
            </View>
          </View>

          {data.allHeartsRefillTime && (
            <View style={[styles.refillRow, { marginTop: 12 }]}>
              <Ionicons name="moon-outline" size={24} color="#6366F1" />
              <View style={styles.refillTextContainer}>
                <Text style={styles.refillLabel}>All hearts refill at midnight</Text>
              </View>
            </View>
          )}
        </View>

        {/* Scientific Note */}
        <View style={styles.scienceNote}>
          <Text style={styles.scienceText}>
            💡 Spaced practice beats cramming by 200%!
          </Text>
        </View>

        {/* Upgrade Option (Subtle) */}
        <TouchableOpacity
          style={styles.upgradeButtonSubtle}
          onPress={handleUpgradePress}
          activeOpacity={0.8}
        >
          <Ionicons name="star-outline" size={18} color={COLORS.turquoise} />
          <Text style={styles.upgradeTextSubtle}>Never wait with Language Mastery</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 24,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleBlocked: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  alternativesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.turquoise,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alternativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alternativeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreHearts: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  refillCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  refillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refillTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  refillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 2,
  },
  refillTime: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.turquoise,
  },
  scienceNote: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  scienceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: COLORS.turquoise,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.turquoise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  upgradeSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  upgradeButtonSubtle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: COLORS.turquoise,
    marginBottom: 12,
  },
  upgradeTextSubtle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.turquoise,
    marginLeft: 6,
  },
  closeButton: {
    padding: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textGray,
  },
});
