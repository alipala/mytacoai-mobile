/**
 * Victories Share Modal Component
 *
 * Full-screen modal for previewing and sharing Victories cards
 */

import React, { useState, useRef } from 'react';
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
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { documentDirectory, copyAsync, deleteAsync } from 'expo-file-system/legacy';
import { VictoriesShareCard, VictoriesShareCardProps } from './VictoriesShareCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Preview card scale (scaled down to fit screen)
const PREVIEW_SCALE = SCREEN_WIDTH * 0.85 / 1080;

interface VictoriesShareModalProps {
  visible: boolean;
  onClose: () => void;
  cardData: VictoriesShareCardProps;
}

/**
 * Modal for previewing and sharing Victories cards
 */
export const VictoriesShareModal: React.FC<VictoriesShareModalProps> = ({
  visible,
  onClose,
  cardData,
}) => {
  console.log('[VictoriesShareModal] Rendered with:', { visible, cardData });

  const insets = useSafeAreaInsets();
  const cardRef = useRef<ViewShot>(null);
  const [showCard, setShowCard] = useState(false);
  const [isPreCapturing, setIsPreCapturing] = useState(false);
  const [preCapturedUri, setPreCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-capture on modal open for instant sharing
  React.useEffect(() => {
    if (visible) {
      console.log('[VictoriesShareModal] Modal visible, pre-capturing card...');
      setShowCard(true);
      setPreCapturedUri(null);

      // Pre-capture after card is rendered
      const preCaptureTimer = setTimeout(async () => {
        setIsPreCapturing(true);
        console.log('[VictoriesShareModal] Starting pre-capture...');
        const uri = await captureCard();
        if (uri) {
          console.log('[VictoriesShareModal] Pre-capture successful:', uri);
          setPreCapturedUri(uri);
        }
        setIsPreCapturing(false);
      }, 150);

      return () => clearTimeout(preCaptureTimer);
    } else {
      console.log('[VictoriesShareModal] Modal hidden, resetting state');
      setShowCard(false);
      setPreCapturedUri(null);
      setIsPreCapturing(false);
    }
  }, [visible]);

  /**
   * Capture card as image
   */
  const captureCard = async (): Promise<string | null> => {
    try {
      if (!cardRef.current) {
        console.log('[VictoriesShareModal] Card ref not available');
        return null;
      }

      setIsCapturing(true);
      const uri = await cardRef.current.capture();
      console.log('[VictoriesShareModal] Card captured:', uri);
      setIsCapturing(false);
      return uri;
    } catch (error) {
      console.error('[VictoriesShareModal] Capture error:', error);
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to capture card');
      return null;
    }
  };

  /**
   * Share card with caption
   */
  const handleShare = async () => {
    try {
      setIsCapturing(true);
      const uri = preCapturedUri || await captureCard();
      if (!uri) {
        console.log('[VictoriesShareModal] No URI to share');
        setIsCapturing(false);
        return;
      }

      // Copy to a permanent location for sharing
      const filename = `victories_${Date.now()}.png`;
      const destUri = `${documentDirectory}${filename}`;
      await copyAsync({ from: uri, to: destUri });

      setIsCapturing(false);

      // Prepare share message with victories summary
      const breakthroughsText = cardData.totalBreakthroughs === 1
        ? '1 breakthrough'
        : `${cardData.totalBreakthroughs} breakthroughs`;
      const milestonesText = `${cardData.achievedMilestones}/${cardData.totalMilestones} milestones`;

      const message = `🏆 My ${cardData.language.charAt(0).toUpperCase() + cardData.language.slice(1)} Speaking Victories!\n\n${breakthroughsText} achieved • ${milestonesText} unlocked`;

      console.log('[VictoriesShareModal] Opening share dialog with file:', destUri);

      // Share via native dialog with caption
      const result = await Share.share(
        {
          message,
          url: destUri,
        },
        {
          dialogTitle: 'Share Your Victories',
          ...(Platform.OS === 'android' && { subject: 'My Speaking Victories' }),
        }
      );

      if (result.action === Share.sharedAction) {
        console.log('[VictoriesShareModal] Share successful');
      } else if (result.action === Share.dismissedAction) {
        console.log('[VictoriesShareModal] Share dismissed');
      }

      // Clean up the copied file after a delay
      setTimeout(async () => {
        try {
          await deleteAsync(destUri, { idempotent: true });
          console.log('[VictoriesShareModal] Cleaned up temp file');
        } catch (cleanupError) {
          console.log('[VictoriesShareModal] Cleanup error (non-critical):', cleanupError);
        }
      }, 5000);

    } catch (error) {
      console.error('[VictoriesShareModal] Share error:', error);
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to share victories card');
    }
  };

  /**
   * Save to photos
   */
  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to save your card');
        return;
      }

      setIsSaving(true);
      const uri = preCapturedUri || await captureCard();
      if (!uri) {
        console.log('[VictoriesShareModal] No URI to save');
        setIsSaving(false);
        return;
      }

      await MediaLibrary.createAssetAsync(uri);
      setIsSaving(false);
      Alert.alert('Success', 'Your victories card has been saved to Photos!');
    } catch (error) {
      console.error('[VictoriesShareModal] Save error:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save card to photos');
    }
  };

  const isProcessing = isCapturing || isSaving;
  const isReady = !isPreCapturing && preCapturedUri !== null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#0B1A1F', '#0D2832']}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Your Victories</Text>
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
              {showCard && (
                <View
                  style={[
                    styles.previewCard,
                    {
                      transform: [{ scale: PREVIEW_SCALE }],
                    },
                  ]}
                >
                  <ViewShot
                    ref={cardRef}
                    options={{
                      format: 'png',
                      quality: 1.0,
                      result: 'tmpfile',
                    }}
                    style={styles.viewShot}
                  >
                    <VictoriesShareCard {...cardData} />
                  </ViewShot>
                </View>
              )}
            </View>

            {/* Loading State */}
            {isPreCapturing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#14B8A6" />
                <Text style={styles.loadingText}>Preparing your card...</Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              Share Your Achievement! 🏆
            </Text>
            <Text style={styles.instructionsText}>
              Show off your victories on Instagram Stories, WhatsApp Status, or share with friends!
            </Text>
          </View>
        </ScrollView>

        {/* Action Button - Single Share Button */}
        <View style={[styles.actionsContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.shareButton,
              (!isReady || isProcessing) && styles.actionButtonDisabled,
            ]}
            onPress={handleShare}
            disabled={!isReady || isProcessing}
          >
            {isCapturing ? (
              <>
                <ActivityIndicator size="small" color="#14B8A6" />
                <Text style={styles.actionButtonText}>Preparing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="share-social" size={24} color="#14B8A6" />
                <Text style={styles.actionButtonText}>
                  {isReady ? 'Share Your Victories Card' : 'Preparing...'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingVertical: 24,
    flexGrow: 1,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  previewWrapper: {
    width: SCREEN_WIDTH,
    height: (1920 / 1080) * (SCREEN_WIDTH * 0.85),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  previewCard: {
    width: 1080,
    height: 1920,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  viewShot: {
    width: 1080,
    height: 1920,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  instructionsContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  shareButton: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#14B8A6',
  },
});

export default VictoriesShareModal;
