/**
 * useDNAShare Hook
 *
 * Handles DNA card capture, sharing, and saving functionality
 * Uses react-native-view-shot for capturing the card as an image
 */

import { useRef, useState, useCallback } from 'react';
import { Share, Platform, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { documentDirectory, copyAsync, deleteAsync } from 'expo-file-system/legacy';
import type { SpeakingDNAProfile } from '../types/speakingDNA';

interface UseDNAShareProps {
  profile: SpeakingDNAProfile | null;
  language: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDNAShareReturn {
  cardRef: React.RefObject<ViewShot>;
  isCapturing: boolean;
  isSaving: boolean;
  captureCard: () => Promise<string | null>;
  shareCard: () => Promise<void>;
  saveToPhotos: () => Promise<void>;
}

/**
 * Hook for handling DNA card sharing functionality
 */
export const useDNAShare = ({
  profile,
  language,
  onSuccess,
  onError,
}: UseDNAShareProps): UseDNAShareReturn => {
  const cardRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Capture the DNA card as an image
   */
  const captureCard = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current || !profile) {
      Alert.alert('Error', 'DNA card not ready for capture');
      return null;
    }

    try {
      setIsCapturing(true);

      // Capture the view as image
      const uri = await cardRef.current.capture();

      console.log('[DNA_SHARE] Card captured successfully:', uri);
      return uri;
    } catch (error) {
      console.error('[DNA_SHARE] Capture error:', error);
      onError?.(error as Error);
      Alert.alert('Error', 'Failed to capture DNA card');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [profile, onError]);

  /**
   * Share the DNA card via native share dialog
   */
  const shareCard = useCallback(async () => {
    console.log('[DNA_SHARE] shareCard called');
    if (!profile) {
      Alert.alert('Error', 'No DNA profile available to share');
      return;
    }

    try {
      setIsCapturing(true);

      // Capture the card first
      const tempUri = await captureCard();
      if (!tempUri) {
        setIsCapturing(false);
        return;
      }

      // Copy to a proper location with clear filename
      // This helps iOS recognize it as an image for "Save Image" option
      const timestamp = Date.now();
      const filename = `SpeakingDNA_${language}_${timestamp}.png`;
      const destUri = `${documentDirectory}${filename}`;

      console.log('[DNA_SHARE] Copying image to:', destUri);
      await copyAsync({
        from: tempUri,
        to: destUri
      });

      setIsCapturing(false);

      // Prepare share message
      const archetypeName = profile.overall_profile?.name || profile.overall_profile?.speaker_archetype || 'Developing Speaker';
      const archetypeSummary = profile.overall_profile?.summary || profile.overall_profile?.description || 'A distinctive learner';
      const message = `Check out my ${language} Speaking DNA! 🧬\n\nI'm "${archetypeName}" - ${archetypeSummary}`;

      console.log('[DNA_SHARE] Opening share dialog with file:', destUri);

      // Share via native dialog with proper file URI
      const result = await Share.share(
        {
          message,
          url: destUri,
        },
        {
          dialogTitle: 'Share Your Speaking DNA',
          ...(Platform.OS === 'android' && { subject: 'My Speaking DNA' }),
        }
      );

      if (result.action === Share.sharedAction) {
        console.log('[DNA_SHARE] Share successful');
        onSuccess?.();
      } else if (result.action === Share.dismissedAction) {
        console.log('[DNA_SHARE] Share dismissed');
      }

      // Clean up the copied file after a delay
      setTimeout(async () => {
        try {
          await deleteAsync(destUri, { idempotent: true });
          console.log('[DNA_SHARE] Cleaned up temp file');
        } catch (cleanupError) {
          console.log('[DNA_SHARE] Cleanup error (non-critical):', cleanupError);
        }
      }, 5000);

    } catch (error) {
      console.error('[DNA_SHARE] Share error:', error);
      setIsCapturing(false);
      onError?.(error as Error);
      Alert.alert('Error', 'Failed to share DNA card');
    }
  }, [profile, language, captureCard, onSuccess, onError]);

  /**
   * Save to Photos via share sheet
   * Opens iOS share sheet where user can tap "Save Image" to add to Photos
   * This approach is more stable than CameraRoll and doesn't require permissions
   */
  const saveToPhotos = useCallback(async () => {
    console.log('[DNA_SHARE] saveToPhotos called (using Share API)');
    if (!profile) {
      Alert.alert('Error', 'No DNA profile available to save');
      return;
    }

    try {
      setIsSaving(true);

      // Capture the card
      console.log('[DNA_SHARE] Capturing card...');
      const tempUri = await captureCard();
      console.log('[DNA_SHARE] Captured image URI:', tempUri);

      if (!tempUri) {
        setIsSaving(false);
        return;
      }

      // Copy to a proper location with clear filename
      const timestamp = Date.now();
      const filename = `SpeakingDNA_${language}_${timestamp}.png`;
      const destUri = `${documentDirectory}${filename}`;

      console.log('[DNA_SHARE] Copying image to:', destUri);
      await copyAsync({
        from: tempUri,
        to: destUri
      });

      setIsSaving(false);

      // Open share sheet - user can tap "Save Image" to add to Photos
      console.log('[DNA_SHARE] Opening share sheet for save...');
      const result = await Share.share(
        {
          title: 'Save to Photos',
          url: destUri,
        },
        {
          dialogTitle: 'Save Your DNA Card',
        }
      );

      if (result.action === Share.sharedAction) {
        console.log('[DNA_SHARE] Share/save action completed');
        onSuccess?.();
      }

      // Clean up the copied file after a delay
      setTimeout(async () => {
        try {
          await deleteAsync(destUri, { idempotent: true });
          console.log('[DNA_SHARE] Cleaned up temp file');
        } catch (cleanupError) {
          console.log('[DNA_SHARE] Cleanup error (non-critical):', cleanupError);
        }
      }, 5000);

    } catch (error) {
      console.error('[DNA_SHARE] Save error:', error);
      setIsSaving(false);
      onError?.(error as Error);
      Alert.alert('Error', `Failed to open share menu: ${(error as Error).message}`);
    }
  }, [profile, language, captureCard, onSuccess, onError]);

  return {
    cardRef,
    isCapturing,
    isSaving,
    captureCard,
    shareCard,
    saveToPhotos,
  };
};
