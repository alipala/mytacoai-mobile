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
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AuthenticationService, DefaultService } from '../../../api/generated';

interface VoiceCharacter {
  name: string;
  description: string;
  personality: string;
  icon_url?: string;
}

// Local avatar images mapping
const VOICE_AVATARS: Record<string, any> = {
  alloy: require('../../../../assets/tutors/alloy.png'),
  ash: require('../../../../assets/tutors/ash.png'),
  ballad: require('../../../../assets/tutors/ballad.png'),
  coral: require('../../../../assets/tutors/coral.png'),
  echo: require('../../../../assets/tutors/echo.png'),
  sage: require('../../../../assets/tutors/sage.png'),
  shimmer: require('../../../../assets/tutors/shimmer.png'),
  verse: require('../../../../assets/tutors/verse.png'),
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

      // Load current voice preference and available voices in parallel
      const [voiceResponse, charactersResponse] = await Promise.all([
        AuthenticationService.getVoicePreferenceApiAuthGetVoiceGet(),
        DefaultService.getVoiceCharactersApiVoiceCharactersGet(),
      ]);

      const voice = voiceResponse.voice || 'ash';
      setCurrentVoice(voice);
      setSelectedVoice(voice);
      setVoices(charactersResponse || {});
    } catch (error) {
      console.error('Error loading voice data:', error);
      Alert.alert('Error', 'Failed to load voice preferences');
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

      const response = await AuthenticationService.selectVoiceApiAuthSelectVoicePost({
        requestBody: { voice: selectedVoice },
      });

      if (response.success) {
        setCurrentVoice(selectedVoice);

        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert('Success', response.message || `Voice changed to ${selectedVoice}`);
      }
    } catch (error: any) {
      console.error('Error saving voice:', error);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  infoBannerBold: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  currentVoiceCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  currentVoiceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentVoiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentVoiceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4ECFBF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentVoiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
  },
  currentVoiceDescription: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  voicesGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  voiceCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  voiceCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#4ECFBF',
  },
  voiceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4ECFBF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  voiceAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  currentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  voiceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  voicePersonality: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4ECFBF',
    marginBottom: 8,
  },
  voiceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  howItWorksSection: {
    padding: 20,
    marginTop: 24,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  howItWorksList: {
    gap: 12,
  },
  howItWorksItem: {
    flexDirection: 'row',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ECFBF',
    marginTop: 7,
  },
  howItWorksText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4ECFBF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalVoiceCard: {
    marginBottom: 16,
  },
  modalVoiceImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalVoiceAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4ECFBF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalVoiceAvatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalVoiceName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalVoicePersonality: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4ECFBF',
    marginBottom: 12,
  },
  modalVoiceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInfoBanner: {
    flexDirection: 'row',
    backgroundColor: '#CCFBF1',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    alignItems: 'flex-start',
  },
  modalInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#0D9488',
    lineHeight: 18,
  },
  modalInfoBold: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4ECFBF',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default VoiceSelectionScreen;
