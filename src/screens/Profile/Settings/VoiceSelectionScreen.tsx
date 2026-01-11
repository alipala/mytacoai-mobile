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

// Fallback voice data (same as web app)
const DEFAULT_VOICES: Record<string, VoiceCharacter> = {
  alloy: {
    name: 'Alloy',
    description: 'Balanced and clear voice, great for general learning',
    personality: 'Professional and encouraging',
  },
  ash: {
    name: 'Ash',
    description: 'Warm and friendly voice, perfect for conversational practice',
    personality: 'Warm and approachable',
  },
  ballad: {
    name: 'Ballad',
    description: 'Melodic and expressive voice, ideal for pronunciation work',
    personality: 'Expressive and articulate',
  },
  coral: {
    name: 'Coral',
    description: 'Bright and energetic voice, motivating for active learning',
    personality: 'Energetic and motivating',
  },
  echo: {
    name: 'Echo',
    description: 'Calm and patient voice, excellent for beginners',
    personality: 'Patient and supportive',
  },
  sage: {
    name: 'Sage',
    description: 'Storytelling voice, engaging for immersive conversations',
    personality: 'Engaging storyteller',
  },
  shimmer: {
    name: 'Shimmer',
    description: 'Deep and confident voice, great for advanced learners',
    personality: 'Confident and authoritative',
  },
  verse: {
    name: 'Verse',
    description: 'Modern and dynamic voice, perfect for contemporary topics',
    personality: 'Dynamic and modern',
  },
};

interface VoiceSelectionScreenProps {
  onBack: () => void;
}

const VoiceSelectionScreen: React.FC<VoiceSelectionScreenProps> = ({ onBack }) => {
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
      Alert.alert('No Changes', 'Voice preference is already set to ' + selectedVoice);
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

        Alert.alert('Success', response.message || `Voice changed to ${selectedVoice}`);
      } else {
        console.warn('⚠️ Voice change response success=false');
        Alert.alert('Warning', 'Voice change may not have been saved');
      }
    } catch (error: any) {
      console.error('❌ Error saving voice:', error);
      Alert.alert('Error', error.message || 'Failed to save voice preference');
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
            <Ionicons name="arrow-back" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.title}>Voice Selection</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECFBF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Voice Selection</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoBannerText}>
          <Text style={styles.infoBannerBold}>Personalize Your Learning Experience: </Text>
          Select the AI tutor voice that feels most comfortable for your practice sessions. Your choice will be used for all voice conversations across the platform.
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.currentVoiceCard}>
          <Text style={styles.currentVoiceLabel}>Current Voice</Text>
          <View style={styles.currentVoiceInfo}>
            <View style={styles.currentVoiceIcon}>
              <Ionicons name="mic" size={20} color="#4ECFBF" />
            </View>
            <Text style={styles.currentVoiceName}>
              {currentVoice.charAt(0).toUpperCase() + currentVoice.slice(1)}
            </Text>
          </View>
          {voices[currentVoice] && (
            <Text style={styles.currentVoiceDescription}>
              {voices[currentVoice].description}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Choose Your Preferred Voice</Text>

        <View style={styles.voicesGrid}>
          {Object.entries(voices).map(([voiceName, voiceData]) => {
            const isSelected = selectedVoice === voiceName;
            const isCurrent = currentVoice === voiceName;

            return (
              <TouchableOpacity
                key={voiceName}
                style={[
                  styles.voiceCard,
                  isSelected && styles.voiceCardSelected,
                ]}
                onPress={() => handleSelectVoice(voiceName)}
                activeOpacity={0.7}
              >
                <View style={styles.voiceCardHeader}>
                  {VOICE_AVATARS[voiceName] ? (
                    <Image
                      source={VOICE_AVATARS[voiceName]}
                      style={styles.voiceAvatarImage}
                      resizeMode="cover"
                    />
                  ) : voiceData.icon_url ? (
                    <Image
                      source={{ uri: voiceData.icon_url }}
                      style={styles.voiceAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.voiceAvatar}>
                      <Text style={styles.voiceAvatarText}>
                        {voiceName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color="#4ECFBF" />
                    </View>
                  )}
                  {isCurrent && !isSelected && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.voiceName}>
                  {voiceName.charAt(0).toUpperCase() + voiceName.slice(1)}
                </Text>
                <Text style={styles.voicePersonality}>{voiceData.personality}</Text>
                <Text style={styles.voiceDescription} numberOfLines={2}>
                  {voiceData.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* How Voice Selection Works */}
        <View style={styles.howItWorksSection}>
          <View style={styles.howItWorksHeader}>
            <Ionicons name="help-circle" size={20} color="#4ECFBF" />
            <Text style={styles.howItWorksTitle}>How Voice Selection Works</Text>
          </View>
          <View style={styles.howItWorksList}>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                Your selected voice will be used for all AI tutor conversations
              </Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                Voice changes apply immediately to new practice sessions
              </Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                Each voice has a unique personality and speaking style
              </Text>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.bullet} />
              <Text style={styles.howItWorksText}>
                You can change your voice preference anytime from this page
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
                  Save Voice Preference
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
              <Text style={styles.modalTitle}>Confirm Voice Change</Text>
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
                    <Text style={styles.modalInfoBold}>Voice Update: </Text>
                    This voice will be used for all your future AI tutor conversations. You can change it again anytime from your profile settings.
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
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmVoiceChange}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.modalConfirmButtonText}>Confirm Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VoiceSelectionScreen;
