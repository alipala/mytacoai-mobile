/**
 * VoiceSelectionScreen.tsx
 * Voice selection screen for AI tutor voices
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { AuthenticationService, DefaultService } from '../../../api/generated';
import { styles } from './styles/VoiceSelectionScreen.styles';

interface VoiceCharacter {
  name: string;
  description: string;
  personality: string;
  icon_url?: string;
}

// Local avatar images mapping
const VOICE_AVATARS: Record<string, any> = {
  alloy: require('../../../assets/tutor/alloy.png'),
  ash: require('../../../assets/tutor/ash.png'),
  ballad: require('../../../assets/tutor/ballad.png'),
  coral: require('../../../assets/tutor/coral.png'),
  echo: require('../../../assets/tutor/echo.png'),
  sage: require('../../../assets/tutor/sage.png'),
  shimmer: require('../../../assets/tutor/shimmer.png'),
  verse: require('../../../assets/tutor/verse.png'),
};

interface VoiceSelectionScreenProps {
  onBack: () => void;
}

const VoiceSelectionScreen: React.FC<VoiceSelectionScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();

  // Fallback voice data (same as web app) - using translations
  const DEFAULT_VOICES: Record<string, VoiceCharacter> = {
    alloy: {
      name: t('profile.settings.voice.voice_alloy'),
      description: t('profile.settings.voice.voice_alloy_desc'),
      personality: t('profile.settings.voice.voice_alloy_personality'),
    },
    ash: {
      name: t('profile.settings.voice.voice_ash'),
      description: t('profile.settings.voice.voice_ash_desc'),
      personality: t('profile.settings.voice.voice_ash_personality'),
    },
    ballad: {
      name: t('profile.settings.voice.voice_ballad'),
      description: t('profile.settings.voice.voice_ballad_desc'),
      personality: t('profile.settings.voice.voice_ballad_personality'),
    },
    coral: {
      name: t('profile.settings.voice.voice_coral'),
      description: t('profile.settings.voice.voice_coral_desc'),
      personality: t('profile.settings.voice.voice_coral_personality'),
    },
    echo: {
      name: t('profile.settings.voice.voice_echo'),
      description: t('profile.settings.voice.voice_echo_desc'),
      personality: t('profile.settings.voice.voice_echo_personality'),
    },
    sage: {
      name: t('profile.settings.voice.voice_sage'),
      description: t('profile.settings.voice.voice_sage_desc'),
      personality: t('profile.settings.voice.voice_sage_personality'),
    },
    shimmer: {
      name: t('profile.settings.voice.voice_shimmer'),
      description: t('profile.settings.voice.voice_shimmer_desc'),
      personality: t('profile.settings.voice.voice_shimmer_personality'),
    },
    verse: {
      name: t('profile.settings.voice.voice_verse'),
      description: t('profile.settings.voice.voice_verse_desc'),
      personality: t('profile.settings.voice.voice_verse_personality'),
    },
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<Record<string, VoiceCharacter>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadVoiceData();
  }, []);

  const loadVoiceData = async () => {
    try {
      setLoading(true);

      // Try to load current voice preference
      let currentVoiceId = 'ash';
      try {
        const voiceResponse = await AuthenticationService.getVoicePreferenceApiAuthGetVoiceGet();
        currentVoiceId = voiceResponse.voice || 'ash';
      } catch (voiceError) {
        console.log('Could not load voice preference, using default');
      }

      setCurrentVoice(currentVoiceId);
      setSelectedVoice(currentVoiceId);

      // Try to load voice characters from API, fallback to DEFAULT_VOICES
      try {
        const charactersResponse = await DefaultService.getVoiceCharactersApiVoiceCharactersGet();

        // Extract voices from response - API returns { success: true, voices: {...} }
        let apiVoices = {};
        if (charactersResponse && typeof charactersResponse === 'object') {
          // Check if response has a 'voices' property
          if ('voices' in charactersResponse && charactersResponse.voices) {
            apiVoices = charactersResponse.voices as Record<string, VoiceCharacter>;
          } else if (!('success' in charactersResponse)) {
            // If no 'success' key, assume the response itself is the voices object
            apiVoices = charactersResponse as Record<string, VoiceCharacter>;
          }
        }

        // Merge API voices with DEFAULT_VOICES to ensure we have all fields
        const mergedVoices: Record<string, VoiceCharacter> = {};
        Object.keys(DEFAULT_VOICES).forEach((voiceId) => {
          mergedVoices[voiceId] = {
            ...DEFAULT_VOICES[voiceId],
            ...(apiVoices[voiceId] || {}),
          };
        });

        console.log('Loaded voices from API:', Object.keys(apiVoices));
        console.log('Sample voice data:', JSON.stringify(mergedVoices.alloy, null, 2));
        setVoices(mergedVoices);
      } catch (charactersError) {
        console.log('Could not load voices from API, using fallback data');
        setVoices(DEFAULT_VOICES);
      }
    } catch (error) {
      console.error('Error loading voice data:', error);
      // Even on error, set the default voices so the UI shows something
      setVoices(DEFAULT_VOICES);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVoice = (voice: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedVoice(voice);
  };

  const handleShowConfirmation = () => {
    if (selectedVoice === currentVoice) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      Alert.alert(t('profile.settings.account.alert_no_changes'), t('profile.settings.account.alert_voice_already_set', { voice: selectedVoice }));
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowConfirmModal(true);
  };

  const handleConfirmVoiceChange = async () => {
    try {
      setSaving(true);
      setShowConfirmModal(false);

      console.log('🎤 Attempting to change voice to:', selectedVoice);

      const response = await AuthenticationService.selectVoiceApiAuthSelectVoicePost({
        voice: selectedVoice,
      });

      console.log('✅ Voice change API response:', JSON.stringify(response, null, 2));

      if (response.success) {
        setCurrentVoice(selectedVoice);

        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert(t('modals.success.title'), response.message || t('profile.settings.voice.success_voice_changed', { voice: selectedVoice }));
      } else {
        console.warn('⚠️ Voice change response success=false');
        Alert.alert(t('modals.error.title'), t('profile.settings.voice.warning_no_save'));
      }
    } catch (error: any) {
      console.error('❌ Error saving voice:', error);
      Alert.alert(t('modals.error.title'), error.message || t('profile.settings.voice.error_save_voice'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelConfirmation = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14B8A6" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.settings.voice.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#14B8A6" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.settings.voice.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoBannerText}>
          <Text style={styles.infoBannerBold}>{t('profile.settings.voice.info_banner_title')} </Text>
          {t('profile.settings.voice.info_banner_text')}
        </Text>
      </View>

      {/* Content - Grid Layout */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.voicesGridContainer}>
          {Object.entries(voices).map(([voiceName, voiceData]) => {
            const isSelected = selectedVoice === voiceName;
            const isCurrent = currentVoice === voiceName;

            return (
              <TouchableOpacity
                key={voiceName}
                style={[
                  styles.voiceCardGrid,
                  isSelected && styles.voiceCardSelected,
                  isCurrent && styles.voiceCardCurrent,
                ]}
                onPress={() => handleSelectVoice(voiceName)}
                activeOpacity={0.7}
              >
                {/* Status Badges - Top Right */}
                <View style={styles.badgesContainer}>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>{t('profile.settings.voice.badge_active')}</Text>
                    </View>
                  )}
                  {isSelected && !isCurrent && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#14B8A6" />
                    </View>
                  )}
                </View>

                {/* Avatar with Glow Container */}
                <View style={styles.avatarContainer}>
                  {VOICE_AVATARS[voiceName] ? (
                    <View style={styles.avatarGlowWrapper}>
                      <Image
                        source={VOICE_AVATARS[voiceName]}
                        style={styles.voiceAvatarImageGrid}
                        resizeMode="cover"
                      />
                    </View>
                  ) : voiceData.icon_url ? (
                    <View style={styles.avatarGlowWrapper}>
                      <Image
                        source={{ uri: voiceData.icon_url }}
                        style={styles.voiceAvatarImageGrid}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View style={styles.voiceAvatarGrid}>
                      <Text style={styles.voiceAvatarText}>
                        {voiceName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Voice Info */}
                <Text style={styles.voiceNameGrid} numberOfLines={1}>
                  {voiceName.charAt(0).toUpperCase() + voiceName.slice(1)}
                </Text>
                <Text style={styles.voicePersonalityGrid} numberOfLines={1}>
                  {voiceData.personality}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <View style={styles.howItWorksHeader}>
            <Ionicons name="help-circle" size={20} color="#14B8A6" />
            <Text style={styles.howItWorksTitle}>{t('profile.settings.voice.section_how_it_works')}</Text>
          </View>
          <View style={styles.howItWorksList}>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                {t('profile.settings.voice.how_it_works_1')}
              </Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                {t('profile.settings.voice.how_it_works_2')}
              </Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                {t('profile.settings.voice.how_it_works_3')}
              </Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                {t('profile.settings.voice.how_it_works_4')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      {selectedVoice !== currentVoice && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleShowConfirmation}
            disabled={saving}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {t('profile.settings.voice.button_save_preference')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Ionicons name="volume-medium" size={24} color="#4ECFBF" />
              <Text style={styles.modalTitle}>{t('profile.settings.voice.modal_confirm_title')}</Text>
            </View>

            {/* Voice Info */}
            {voices[selectedVoice] && (
              <View style={styles.modalContent}>
                <View style={styles.modalVoiceCard}>
                  {VOICE_AVATARS[selectedVoice] ? (
                    <Image
                      source={VOICE_AVATARS[selectedVoice]}
                      style={styles.modalVoiceImage}
                      resizeMode="cover"
                    />
                  ) : voices[selectedVoice]?.icon_url ? (
                    <Image
                      source={{ uri: voices[selectedVoice].icon_url }}
                      style={styles.modalVoiceImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.modalVoiceAvatar}>
                      <Text style={styles.modalVoiceAvatarText}>
                        {selectedVoice.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.modalVoiceName}>
                  {selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}
                </Text>
                <Text style={styles.modalVoicePersonality}>
                  {voices[selectedVoice].personality}
                </Text>
                <Text style={styles.modalVoiceDescription}>
                  {voices[selectedVoice].description}
                </Text>

                {/* Info Banner */}
                <View style={styles.modalInfoBanner}>
                  <Ionicons name="pencil" size={16} color="#0D9488" />
                  <Text style={styles.modalInfoText}>
                    <Text style={styles.modalInfoBold}>{t('profile.settings.voice.modal_info_title')} </Text>
                    {t('profile.settings.voice.modal_info_text')}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelConfirmation}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>{t('buttons.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmVoiceChange}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.modalConfirmButtonText}>{t('profile.settings.voice.button_confirm_change')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VoiceSelectionScreen;
