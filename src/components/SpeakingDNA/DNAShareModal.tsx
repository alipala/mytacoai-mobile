/**
 * DNA Share Modal Component
 *
 * Full-screen modal for previewing and sharing DNA cards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { DNAShareCard } from './DNAShareCard';
import { useDNAShare } from '../../hooks/useDNAShare';
import type { SpeakingDNAProfile } from '../../types/speakingDNA';
import { COLORS, SHADOWS } from '../../screens/SpeakingDNA/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Preview card scale (scaled down to fit screen)
const PREVIEW_SCALE = SCREEN_WIDTH * 0.85 / 1080;

interface DNAShareModalProps {
  visible: boolean;
  onClose: () => void;
  profile: SpeakingDNAProfile | null;
  language: string;
}

/**
 * Modal for previewing and sharing DNA cards
 */
export const DNAShareModal: React.FC<DNAShareModalProps> = ({
  visible,
  onClose,
  profile,
  language,
}) => {
  console.log('[DNAShareModal] Rendered with:', { visible, hasProfile: !!profile, language });

  const insets = useSafeAreaInsets();
  const [showCard, setShowCard] = useState(false);
  const [isPreCapturing, setIsPreCapturing] = useState(false);
  const [preCapturedUri, setPreCapturedUri] = useState<string | null>(null);

  const { cardRef, isCapturing, isSaving, captureCard, shareCard, saveToPhotos } = useDNAShare({
    profile,
    language,
    onSuccess: () => {
      console.log('[DNA_SHARE_MODAL] Share/save successful');
    },
    onError: (error) => {
      console.error('[DNA_SHARE_MODAL] Share/save error:', error);
    },
  });

  // Pre-capture on modal open for instant sharing
  React.useEffect(() => {
    if (visible) {
      console.log('[DNAShareModal] Modal visible, pre-capturing card...');
      setShowCard(true);
      setPreCapturedUri(null);

      // Pre-capture after card is rendered
      const preCaptureTimer = setTimeout(async () => {
        setIsPreCapturing(true);
        console.log('[DNAShareModal] Starting pre-capture...');
        const uri = await captureCard();
        if (uri) {
          console.log('[DNAShareModal] Pre-capture successful:', uri);
          setPreCapturedUri(uri);
        }
        setIsPreCapturing(false);
      }, 150); // Small delay to ensure card is fully rendered

      return () => clearTimeout(preCaptureTimer);
    } else {
      console.log('[DNAShareModal] Modal hidden, resetting state');
      setShowCard(false);
      setPreCapturedUri(null);
      setIsPreCapturing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // Only depend on visible, not captureCard

  if (!profile) return null;

  const isProcessing = isCapturing || isSaving;
  const isReady = !isPreCapturing && preCapturedUri !== null;

  // Handle share with pre-captured image
  const handleShare = async () => {
    if (!isReady) {
      console.log('[DNAShareModal] Not ready yet, still pre-capturing...');
      return;
    }
    // Use the shareCard function, which will recapture if needed
    await shareCard();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={[COLORS.gray[50], COLORS.white]}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Your DNA</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Preview */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview</Text>

            {/* Scaled-down preview of the card */}
            <View style={styles.previewWrapper}>
              <View
                style={[
                  styles.previewCard,
                  {
                    transform: [{ scale: PREVIEW_SCALE }],
                  },
                ]}
              >
                {showCard && (
                  <ViewShot
                    ref={cardRef}
                    options={{
                      format: 'png',
                      quality: 1.0,
                      result: 'tmpfile',
                    }}
                  >
                    <DNAShareCard
                      profile={profile}
                      language={language}
                      variant="story"
                    />
                  </ViewShot>
                )}
              </View>
            </View>

            {/* Loading State - Only show during pre-capture */}
            {isPreCapturing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary[500]} />
                <Text style={styles.loadingText}>Preparing your card...</Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              Share Your Achievement! 🔥
            </Text>
            <Text style={styles.instructionsText}>
              Show off your Speaking DNA on Instagram Stories, WhatsApp Status, or share with friends!
            </Text>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={[styles.actionsContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.saveButton,
              !isReady && styles.buttonDisabled
            ]}
            onPress={handleShare}
            disabled={!isReady}
          >
            {!isReady ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.saveButtonText}>Preparing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="share-social" size={24} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Share Your DNA Card</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewWrapper: {
    width: 1080 * PREVIEW_SCALE,
    height: 1920 * PREVIEW_SCALE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 20,
    ...SHADOWS.lg,
  },
  previewCard: {
    width: 1080,
    height: 1920,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  instructionsContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    ...SHADOWS.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary[500],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  shareButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
});
