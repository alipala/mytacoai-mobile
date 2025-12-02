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

interface VoiceSelectionScreenProps {
  onBack: () => void;
}

const VoiceSelectionScreen: React.FC<VoiceSelectionScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<Record<string, VoiceCharacter>>({});

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

  const handleSaveVoice = async () => {
    if (selectedVoice === currentVoice) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      Alert.alert('No Changes', 'Voice preference is already set to ' + selectedVoice);
      return;
    }

    try {
      setSaving(true);
      const response = await AuthenticationService.selectVoiceApiAuthSelectVoicePost({
        requestBody: { voice: selectedVoice },
      });

      if (response.success) {
        setCurrentVoice(selectedVoice);

        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert('Success', `Voice changed to ${selectedVoice}`);
      }
    } catch (error: any) {
      console.error('Error saving voice:', error);
      Alert.alert('Error', error.message || 'Failed to save voice preference');
    } finally {
      setSaving(false);
    }
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
                  <View style={styles.voiceAvatar}>
                    <Text style={styles.voiceAvatarText}>
                      {voiceName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
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
            onPress={handleSaveVoice}
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
});

export default VoiceSelectionScreen;
