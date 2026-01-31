/**
 * BreakthroughModal Component
 * ===========================
 * Celebrates user breakthrough moments with confetti and animations.
 *
 * Features:
 * - Confetti animation
 * - Breakthrough details display
 * - Share functionality
 * - Auto-marks as celebrated when dismissed
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SpeakingBreakthrough } from '../../types/speakingDNA';
import { speakingDNAService } from '../../services/SpeakingDNAService';

const { width, height } = Dimensions.get('window');

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface BreakthroughModalProps {
  /** Breakthrough to celebrate */
  breakthrough: SpeakingBreakthrough | null;
  /** Visibility state */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Share handler (optional) */
  onShare?: (breakthrough: SpeakingBreakthrough) => void;
}

// ============================================================================
// BREAKTHROUGH COLORS BY CATEGORY
// ============================================================================

const CATEGORY_COLORS: Record<string, string[]> = {
  confidence: ['#9B59B6', '#8E44AD'], // Purple
  vocabulary: ['#2ECC71', '#27AE60'], // Green
  learning: ['#3498DB', '#2980B9'], // Blue
  rhythm: ['#4ECDC4', '#45B7B0'], // Teal
  accuracy: ['#E74C3C', '#C0392B'], // Red
  emotional: ['#F39C12', '#E67E22'], // Orange
  default: ['#34495E', '#2C3E50'], // Gray
};

// ============================================================================
// COMPONENT
// ============================================================================

export const BreakthroughModal: React.FC<BreakthroughModalProps> = ({
  breakthrough,
  visible,
  onClose,
  onShare,
}) => {
  // Mark breakthrough as celebrated when modal opens
  useEffect(() => {
    if (visible && breakthrough && !breakthrough.celebrated) {
      markAsCelebrated();
    }
  }, [visible, breakthrough]);

  /**
   * Mark breakthrough as celebrated in backend
   */
  const markAsCelebrated = async () => {
    if (!breakthrough) return;

    try {
      await speakingDNAService.celebrateBreakthrough(breakthrough._id);
      console.log('[BreakthroughModal] Breakthrough marked as celebrated');
    } catch (error) {
      console.error('[BreakthroughModal] Failed to mark as celebrated:', error);
      // Non-fatal error
    }
  };

  /**
   * Handle share button press
   */
  const handleShare = () => {
    if (breakthrough && onShare) {
      onShare(breakthrough);
    }
  };

  if (!breakthrough) {
    return null;
  }

  // Get gradient colors for this breakthrough category
  const gradientColors =
    CATEGORY_COLORS[breakthrough.category] || CATEGORY_COLORS.default;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Background blur effect */}
        <View style={styles.backdrop} />

        {/* Breakthrough card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={gradientColors}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Emoji */}
            <Text style={styles.emoji}>{breakthrough.emoji}</Text>

            {/* Title */}
            <Text style={styles.title}>{breakthrough.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{breakthrough.description}</Text>

            {/* Metrics (if available) */}
            {breakthrough.metrics && breakthrough.metrics.improvement_percent != null && (
              <View style={styles.metricsContainer}>
                <Text style={styles.metricsLabel}>Improvement</Text>
                <Text style={styles.metricsValue}>
                  +{Math.round(breakthrough.metrics.improvement_percent)}%
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actionsContainer}>
              {onShare && (
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={20} color="#FFF" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeButtonLarge} onPress={onClose}>
                <Text style={styles.closeButtonText}>Awesome!</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  card: {
    padding: 32,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.95,
  },
  metricsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  metricsLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  metricsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonLarge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BreakthroughModal;
