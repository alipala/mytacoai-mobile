/**
 * NotificationSettingsScreen.tsx
 * Notification settings screen for managing notification preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../../config/api';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();

  // Local notification preferences
  const [practiceReminders, setPracticeReminders] = useState(false);  // Default OFF
  const [achievementAlerts, setAchievementAlerts] = useState(true);   // Default ON
  const [learningPlanUpdates, setLearningPlanUpdates] = useState(true);  // Default ON
  const [productUpdates, setProductUpdates] = useState(true);  // Default ON

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch preferences from backend on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found, using defaults');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/preferences/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update state from backend
        setPracticeReminders(data.practice_reminders_enabled);
        setAchievementAlerts(data.achievement_alerts_enabled);
        setLearningPlanUpdates(data.learning_plan_updates_enabled);
        setProductUpdates(data.product_updates_enabled);

        // Also save to AsyncStorage as backup
        await AsyncStorage.setItem('notification_practice_reminders', JSON.stringify(data.practice_reminders_enabled));
        await AsyncStorage.setItem('notification_achievement_alerts', JSON.stringify(data.achievement_alerts_enabled));
        await AsyncStorage.setItem('notification_learning_plan_updates', JSON.stringify(data.learning_plan_updates_enabled));
        await AsyncStorage.setItem('notification_product_updates', JSON.stringify(data.product_updates_enabled));
      } else {
        console.error('Failed to fetch preferences:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (
    key: string,
    currentValue: boolean,
    setValue: (value: boolean) => void
  ) => {
    const newValue = !currentValue;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Update state immediately for better UX
    setValue(newValue);

    // Save to AsyncStorage as backup
    try {
      await AsyncStorage.setItem(`notification_${key}`, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }

    // Save to backend
    try {
      setIsSaving(true);
      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        console.log('No auth token, skipping backend sync');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/preferences/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [`${key}_enabled`]: newValue,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save preference to backend:', response.status);
        // Revert state on error
        setValue(currentValue);
        Alert.alert(
          t('modals.error.title'),
          t('profile.settings.notifications.error_save_preference'),
          [{ text: t('buttons.ok') }]
        );
      }
    } catch (error) {
      console.error('Error saving notification preference to backend:', error);
      // Revert state on error
      setValue(currentValue);
      Alert.alert(
        t('profile.settings.notifications.error_connection'),
        t('profile.settings.notifications.error_connection_message'),
        [{ text: t('buttons.ok') }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSystemSettings = async () => {
    Alert.alert(
      t('profile.settings.notifications.alert_system_settings_title'),
      t('profile.settings.notifications.alert_system_settings_message'),
      [
        { text: t('buttons.cancel'), style: 'cancel' },
        {
          text: t('profile.settings.notifications.alert_open_settings'),
          onPress: async () => {
            try {
              if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
              } else {
                await Linking.openSettings();
              }
            } catch (error) {
              console.error('Error opening settings:', error);
              Alert.alert(t('modals.error.title'), t('modals.error.default_message'));
            }
          },
        },
      ]
    );
  };

  // Show loading screen while fetching preferences
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14B8A6" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.settings.notifications.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECFBF" />
          <Text style={styles.loadingText}>{t('profile.settings.notifications.loading_preferences')}</Text>
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
        <Text style={styles.title}>{t('profile.settings.notifications.title')}</Text>
        {isSaving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color="#14B8A6" />
          </View>
        )}
        {!isSaving && <View style={styles.headerSpacer} />}
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoBannerText}>
          {t('profile.settings.notifications.info_banner')}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color="#14B8A6" />
            <Text style={styles.sectionTitle}>{t('profile.settings.notifications.section_system')}</Text>
          </View>

          <TouchableOpacity
            style={styles.systemSettingsCard}
            onPress={handleOpenSystemSettings}
            activeOpacity={0.7}
          >
            <View style={styles.systemSettingsIcon}>
              <Ionicons name="phone-portrait" size={24} color="#3B82F6" />
            </View>
            <View style={styles.systemSettingsInfo}>
              <Text style={styles.systemSettingsTitle}>{t('profile.settings.notifications.system_settings_title')}</Text>
              <Text style={styles.systemSettingsDescription}>
                {t('profile.settings.notifications.system_settings_description')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Practice & Learning */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={20} color="#14B8A6" />
            <Text style={styles.sectionTitle}>{t('profile.settings.notifications.section_practice_learning')}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('profile.settings.notifications.label_practice_reminders')}</Text>
              <Text style={styles.settingDescription}>
                {t('profile.settings.notifications.desc_practice_reminders')}
              </Text>
            </View>
            <Switch
              value={practiceReminders}
              onValueChange={() =>
                handleToggle('practice_reminders', practiceReminders, setPracticeReminders)
              }
              trackColor={{ false: 'rgba(20, 184, 166, 0.2)', true: 'rgba(20, 184, 166, 0.5)' }}
              thumbColor={practiceReminders ? '#14B8A6' : '#6B8A84'}
              ios_backgroundColor="rgba(20, 184, 166, 0.2)"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('profile.settings.notifications.label_achievement_alerts')}</Text>
              <Text style={styles.settingDescription}>
                {t('profile.settings.notifications.desc_achievement_alerts')}
              </Text>
            </View>
            <Switch
              value={achievementAlerts}
              onValueChange={() =>
                handleToggle('achievement_alerts', achievementAlerts, setAchievementAlerts)
              }
              trackColor={{ false: 'rgba(20, 184, 166, 0.2)', true: 'rgba(20, 184, 166, 0.5)' }}
              thumbColor={achievementAlerts ? '#14B8A6' : '#6B8A84'}
              ios_backgroundColor="rgba(20, 184, 166, 0.2)"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('profile.settings.notifications.label_learning_plan_updates')}</Text>
              <Text style={styles.settingDescription}>
                {t('profile.settings.notifications.desc_learning_plan_updates')}
              </Text>
            </View>
            <Switch
              value={learningPlanUpdates}
              onValueChange={() =>
                handleToggle('learning_plan_updates', learningPlanUpdates, setLearningPlanUpdates)
              }
              trackColor={{ false: 'rgba(20, 184, 166, 0.2)', true: 'rgba(20, 184, 166, 0.5)' }}
              thumbColor={learningPlanUpdates ? '#14B8A6' : '#6B8A84'}
              ios_backgroundColor="rgba(20, 184, 166, 0.2)"
            />
          </View>
        </View>

        {/* Updates & Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="megaphone" size={20} color="#4ECFBF" />
            <Text style={styles.sectionTitle}>{t('profile.settings.notifications.section_updates_announcements')}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('profile.settings.notifications.label_product_updates')}</Text>
              <Text style={styles.settingDescription}>
                {t('profile.settings.notifications.desc_product_updates')}
              </Text>
            </View>
            <Switch
              value={productUpdates}
              onValueChange={() =>
                handleToggle('product_updates', productUpdates, setProductUpdates)
              }
              trackColor={{ false: 'rgba(20, 184, 166, 0.2)', true: 'rgba(20, 184, 166, 0.5)' }}
              thumbColor={productUpdates ? '#14B8A6' : '#6B8A84'}
              ios_backgroundColor="rgba(20, 184, 166, 0.2)"
            />
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Ionicons name="help-circle" size={20} color="#6B7280" />
            <Text style={styles.infoSectionTitle}>{t('profile.settings.notifications.section_notification_types')}</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="information" size={16} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.settings.notifications.type_information_title')}</Text>
                <Text style={styles.infoText}>
                  {t('profile.settings.notifications.type_information_desc')}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="construct" size={16} color="#F59E0B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.settings.notifications.type_maintenance_title')}</Text>
                <Text style={styles.infoText}>
                  {t('profile.settings.notifications.type_maintenance_desc')}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="gift" size={16} color="#10B981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.settings.notifications.type_special_offers_title')}</Text>
                <Text style={styles.infoText}>
                  {t('profile.settings.notifications.type_special_offers_desc')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="cloud-done" size={20} color="#10B981" />
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>{t('profile.settings.notifications.note_synced_title')} </Text>
            {t('profile.settings.notifications.note_synced_text')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 32,
  },
  savingIndicator: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#B4E4DD',
    marginTop: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#0D2832',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  systemSettingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  systemSettingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  systemSettingsInfo: {
    flex: 1,
  },
  systemSettingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  systemSettingsDescription: {
    fontSize: 14,
    color: '#B4E4DD',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B4E4DD',
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#6EE7B7',
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '600',
    color: '#10B981',
  },
});

export default NotificationSettingsScreen;
