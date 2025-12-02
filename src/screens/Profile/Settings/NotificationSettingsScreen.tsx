/**
 * NotificationSettingsScreen.tsx
 * Notification settings screen for managing notification preferences
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onBack }) => {
  // Local notification preferences (stored in AsyncStorage)
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [learningPlanUpdates, setLearningPlanUpdates] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);

  const handleToggle = async (
    key: string,
    currentValue: boolean,
    setValue: (value: boolean) => void
  ) => {
    const newValue = !currentValue;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Update state
    setValue(newValue);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(`notification_${key}`, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  const handleOpenSystemSettings = async () => {
    Alert.alert(
      'System Notification Settings',
      'To manage app notifications, you need to open your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
              } else {
                await Linking.openSettings();
              }
            } catch (error) {
              console.error('Error opening settings:', error);
              Alert.alert('Error', 'Could not open settings');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoBannerText}>
          Customize your notification preferences to stay updated on your learning progress and important updates.
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color="#4ECFBF" />
            <Text style={styles.sectionTitle}>System Settings</Text>
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
              <Text style={styles.systemSettingsTitle}>Device Notification Settings</Text>
              <Text style={styles.systemSettingsDescription}>
                Manage app notifications from your device settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Practice & Learning */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={20} color="#4ECFBF" />
            <Text style={styles.sectionTitle}>Practice & Learning</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Practice Reminders</Text>
              <Text style={styles.settingDescription}>
                Get daily reminders to practice your language skills
              </Text>
            </View>
            <Switch
              value={practiceReminders}
              onValueChange={() =>
                handleToggle('practice_reminders', practiceReminders, setPracticeReminders)
              }
              trackColor={{ false: '#E5E7EB', true: '#4ECFBF80' }}
              thumbColor={practiceReminders ? '#4ECFBF' : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Achievement Alerts</Text>
              <Text style={styles.settingDescription}>
                Celebrate your milestones and achievements
              </Text>
            </View>
            <Switch
              value={achievementAlerts}
              onValueChange={() =>
                handleToggle('achievement_alerts', achievementAlerts, setAchievementAlerts)
              }
              trackColor={{ false: '#E5E7EB', true: '#4ECFBF80' }}
              thumbColor={achievementAlerts ? '#4ECFBF' : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Learning Plan Updates</Text>
              <Text style={styles.settingDescription}>
                Stay informed about your learning plan progress
              </Text>
            </View>
            <Switch
              value={learningPlanUpdates}
              onValueChange={() =>
                handleToggle('learning_plan_updates', learningPlanUpdates, setLearningPlanUpdates)
              }
              trackColor={{ false: '#E5E7EB', true: '#4ECFBF80' }}
              thumbColor={learningPlanUpdates ? '#4ECFBF' : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Updates & Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="megaphone" size={20} color="#4ECFBF" />
            <Text style={styles.sectionTitle}>Updates & Announcements</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Product Updates</Text>
              <Text style={styles.settingDescription}>
                Receive notifications about new features and improvements
              </Text>
            </View>
            <Switch
              value={productUpdates}
              onValueChange={() =>
                handleToggle('product_updates', productUpdates, setProductUpdates)
              }
              trackColor={{ false: '#E5E7EB', true: '#4ECFBF80' }}
              thumbColor={productUpdates ? '#4ECFBF' : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Ionicons name="help-circle" size={20} color="#6B7280" />
            <Text style={styles.infoSectionTitle}>Notification Types</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="information" size={16} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Information</Text>
                <Text style={styles.infoText}>
                  General updates and helpful tips for your learning journey
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="construct" size={16} color="#F59E0B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Maintenance</Text>
                <Text style={styles.infoText}>
                  Important system maintenance and downtime notifications
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="gift" size={16} color="#10B981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Special Offers</Text>
                <Text style={styles.infoText}>
                  Exclusive deals and promotions for premium features
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="bulb" size={20} color="#FBB040" />
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>Note: </Text>
            Notification preferences are saved locally on this device. Make sure to enable notifications in your device settings for the best experience.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    color: '#1F2937',
  },
  systemSettingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  systemSettingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  systemSettingsInfo: {
    flex: 1,
  },
  systemSettingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  systemSettingsDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#6B7280',
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
    color: '#374151',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
