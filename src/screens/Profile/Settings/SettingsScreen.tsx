/**
 * SettingsScreen.tsx
 * Main Settings Screen with navigation to sub-screens
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AccountPreferencesScreen from './AccountPreferencesScreen';
import VoiceSelectionScreen from './VoiceSelectionScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';

type SettingsView = 'main' | 'account' | 'voice' | 'notifications';

interface SettingsScreenProps {
  onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  const handleNavigate = (view: SettingsView) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentView(view);
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentView('main');
  };

  // Render sub-screens
  if (currentView === 'account') {
    return <AccountPreferencesScreen onBack={handleBack} />;
  }

  if (currentView === 'voice') {
    return <VoiceSelectionScreen onBack={handleBack} />;
  }

  if (currentView === 'notifications') {
    return <NotificationSettingsScreen onBack={handleBack} />;
  }

  // Main Settings Menu
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="settings" size={24} color="#4ECFBF" />
          <Text style={styles.title}>App Settings</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onClose();
          }}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Preferences */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('account')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="person-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Account Preferences</Text>
            <Text style={styles.menuDescription}>
              Manage your profile and account settings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Voice Selection */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('voice')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="mic-outline" size={24} color="#10B981" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Voice Selection</Text>
            <Text style={styles.menuDescription}>
              Choose your preferred AI tutor voice
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Notification Settings */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('notifications')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#EC489920' }]}>
            <Ionicons name="notifications-outline" size={24} color="#EC4899" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Notification Settings</Text>
            <Text style={styles.menuDescription}>
              Customize reminders and notification preferences
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Note about conversation help */}
        <View style={styles.helpNote}>
          <Ionicons name="bulb" size={20} color="#FBB040" />
          <Text style={styles.helpNoteText}>
            <Text style={styles.helpNoteBold}>Conversation Help</Text> settings can be accessed directly during your practice sessions by tapping the lightbulb icon.
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  helpNote: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    borderRadius: 12,
    gap: 12,
  },
  helpNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  helpNoteBold: {
    fontWeight: '600',
  },
});

export default SettingsScreen;
