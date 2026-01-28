/**
 * Strand Detail Modal
 * ===================
 *
 * Beautiful modal that slides up from bottom when user taps a strand label
 * Shows detailed information: icon, score, description, tips, progress
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DNAStrandKey } from '../../../types/speakingDNA';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface StrandDetailModalProps {
  visible: boolean;
  strand: DNAStrandKey | null;
  score: number;
  label: string;
  color: string;
  onClose: () => void;
}

interface StrandInfo {
  description: string;
  tip: string;
  level: string;
  nextLevel: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStrandIcon = (strand: DNAStrandKey): keyof typeof Ionicons.glyphMap => {
  const icons: Record<DNAStrandKey, keyof typeof Ionicons.glyphMap> = {
    rhythm: 'pulse',
    confidence: 'trending-up',
    vocabulary: 'book',
    accuracy: 'checkmark-done',
    learning: 'school',
    emotional: 'heart',
  };
  return icons[strand];
};

const getStrandInfo = (strand: DNAStrandKey, score: number): StrandInfo => {
  const descriptions: Record<DNAStrandKey, string> = {
    rhythm: 'Your speaking pace and natural flow when expressing ideas',
    confidence: 'Self-assurance and comfort level while speaking',
    vocabulary: 'Range and variety of words you use in conversations',
    accuracy: 'Precision in grammar, pronunciation, and language structure',
    learning: 'Growth mindset and eagerness to try new challenges',
    emotional: 'Ability to express emotions and connect with others',
  };

  const tips: Record<DNAStrandKey, string> = {
    rhythm: score < 60 ? 'Try speaking with a metronome app' : 'Excellent natural flow!',
    confidence: score < 60 ? 'Record yourself and listen back' : 'Very confident speaker!',
    vocabulary: score < 60 ? 'Learn 5 new words daily' : 'Rich and diverse vocabulary!',
    accuracy: score < 60 ? 'Focus on common mistake patterns' : 'Highly accurate speaker!',
    learning: score < 60 ? 'Challenge yourself with harder topics' : 'Amazing curiosity!',
    emotional: score < 60 ? 'Practice expressing feelings openly' : 'Great emotional connection!',
  };

  const getLevel = (score: number): string => {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Comfortable';
    if (score >= 40) return 'Developing';
    return 'Building';
  };

  const level = getLevel(score);

  const nextLevel = score < 40 ? `${40 - score}% to Developing` :
                    score < 60 ? `${60 - score}% to Comfortable` :
                    score < 80 ? `${80 - score}% to Expert` :
                    'Mastered!';

  return {
    description: descriptions[strand],
    tip: tips[strand],
    level,
    nextLevel,
    icon: getStrandIcon(strand),
  };
};

const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const StrandDetailModal: React.FC<StrandDetailModalProps> = ({
  visible,
  strand,
  score,
  label,
  color,
  onClose,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  // Trigger haptic on open
  useEffect(() => {
    if (visible && strand) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      // Animate in
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.8,
      });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate out
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, strand]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  if (!strand) return null;

  const info = getStrandInfo(strand, score);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Overlay */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View style={[styles.overlay, overlayStyle]} />
        </Pressable>

        {/* Modal Card */}
        <Animated.View style={[styles.modal, modalStyle]}>
          <LinearGradient
            colors={[color, adjustColor(color, -30)]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={info.icon} size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>{label}</Text>
              <Text style={styles.score}>{score}%</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${score}%` }]} />
              </View>
              <Text style={styles.levelText}>{info.level}</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color="#FFFFFF" />
                <Text style={styles.sectionTitle}>What is this?</Text>
              </View>
              <Text style={styles.description}>{info.description}</Text>
            </View>

            {/* Tip */}
            <View style={styles.section}>
              <View style={styles.tipContainer}>
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb" size={20} color="#FFFFFF" />
                  <Text style={styles.sectionTitle}>Tip for You</Text>
                </View>
                <Text style={styles.tipText}>{info.tip}</Text>
              </View>
            </View>

            {/* Next Level */}
            {score < 80 && (
              <View style={styles.nextLevelContainer}>
                <Ionicons name="arrow-up-circle" size={18} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.nextLevelText}>{info.nextLevel}</Text>
              </View>
            )}

            {/* Action Hint */}
            <Text style={styles.hintText}>Tap outside to close</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modal: {
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  gradient: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  nextLevelText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default StrandDetailModal;
