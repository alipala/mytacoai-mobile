import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConversationHelpService, UserHelpSettings } from '../api/generated';
import { OpenAPI } from '../api/generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConversationHelpSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ConversationHelpSettingsModal: React.FC<ConversationHelpSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const [settings, setSettings] = useState<UserHelpSettings>({
    help_enabled: true,
    help_language: 'english',
    show_pronunciation: true,
    show_grammar_tips: true,
    show_cultural_notes: true,
    show_vocabulary: true,
    user_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        OpenAPI.TOKEN = token;
        const userSettings = await ConversationHelpService.getHelpSettingsApiConversationHelpSettingsGet();
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('[HELP_SETTINGS] Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserHelpSettings) => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        OpenAPI.TOKEN = token;
        await ConversationHelpService.updateHelpSettingsApiConversationHelpSettingsPut({
          requestBody: newSettings,
        });

        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('[HELP_SETTINGS] Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key: keyof UserHelpSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const helpLanguages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Español' },
    { value: 'french', label: 'Français' },
    { value: 'german', label: 'Deutsch' },
    { value: 'italian', label: 'Italiano' },
    { value: 'portuguese', label: 'Português' },
    { value: 'dutch', label: 'Nederlands' },
    { value: 'turkish', label: 'Türkçe' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="settings" size={24} color="#4ECFBF" />
              <Text style={styles.title}>Conversation Help Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Enable/Disable Help */}
            <View style={styles.section}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="bulb" size={22} color="#FBB040" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Enable Help</Text>
                    <Text style={styles.settingDescription}>
                      Show AI-powered suggestions during conversations
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.help_enabled}
                  onValueChange={(value) => updateSetting('help_enabled', value)}
                  trackColor={{ false: '#E5E7EB', true: '#4ECFBF' }}
                  thumbColor={settings.help_enabled ? '#FFFFFF' : '#F3F4F6'}
                  ios_backgroundColor="#E5E7EB"
                  disabled={loading || saving}
                />
              </View>
            </View>

            {/* Help Language */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="language" size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Help Language</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Choose the language for explanations and tips
              </Text>
              <View style={styles.languageGrid}>
                {helpLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    style={[
                      styles.languageButton,
                      settings.help_language === lang.value && styles.languageButtonActive,
                    ]}
                    onPress={() => updateSetting('help_language', lang.value)}
                    disabled={!settings.help_enabled || loading || saving}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        settings.help_language === lang.value && styles.languageButtonTextActive,
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Content Preferences */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="options" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Content Preferences</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Choose what to include in help suggestions
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="mic" size={20} color="#10B981" />
                  <Text style={styles.settingLabel}>Pronunciation Guides</Text>
                </View>
                <Switch
                  value={settings.show_pronunciation}
                  onValueChange={(value) => updateSetting('show_pronunciation', value)}
                  trackColor={{ false: '#E5E7EB', true: '#4ECFBF' }}
                  thumbColor={settings.show_pronunciation ? '#FFFFFF' : '#F3F4F6'}
                  ios_backgroundColor="#E5E7EB"
                  disabled={!settings.help_enabled || loading || saving}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="book" size={20} color="#F59E0B" />
                  <Text style={styles.settingLabel}>Vocabulary Highlights</Text>
                </View>
                <Switch
                  value={settings.show_vocabulary}
                  onValueChange={(value) => updateSetting('show_vocabulary', value)}
                  trackColor={{ false: '#E5E7EB', true: '#4ECFBF' }}
                  thumbColor={settings.show_vocabulary ? '#FFFFFF' : '#F3F4F6'}
                  ios_backgroundColor="#E5E7EB"
                  disabled={!settings.help_enabled || loading || saving}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="school" size={20} color="#8B5CF6" />
                  <Text style={styles.settingLabel}>Grammar Tips</Text>
                </View>
                <Switch
                  value={settings.show_grammar_tips}
                  onValueChange={(value) => updateSetting('show_grammar_tips', value)}
                  trackColor={{ false: '#E5E7EB', true: '#4ECFBF' }}
                  thumbColor={settings.show_grammar_tips ? '#FFFFFF' : '#F3F4F6'}
                  ios_backgroundColor="#E5E7EB"
                  disabled={!settings.help_enabled || loading || saving}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="globe" size={20} color="#EC4899" />
                  <Text style={styles.settingLabel}>Cultural Notes</Text>
                </View>
                <Switch
                  value={settings.show_cultural_notes}
                  onValueChange={(value) => updateSetting('show_cultural_notes', value)}
                  trackColor={{ false: '#E5E7EB', true: '#4ECFBF' }}
                  thumbColor={settings.show_cultural_notes ? '#FFFFFF' : '#F3F4F6'}
                  ios_backgroundColor="#E5E7EB"
                  disabled={!settings.help_enabled || loading || saving}
                />
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <Text style={styles.infoText}>
                Conversation help provides AI-powered suggestions to improve your language learning during practice sessions.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          {saving && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Saving changes...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageButtonActive: {
    backgroundColor: '#4ECFBF',
    borderColor: '#4ECFBF',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default ConversationHelpSettingsModal;
