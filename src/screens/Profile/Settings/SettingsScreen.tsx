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
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import AccountPreferencesScreen from './AccountPreferencesScreen';
import VoiceSelectionScreen from './VoiceSelectionScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import SubscriptionManagementScreen from './SubscriptionManagementScreen';
import LegalDocumentsScreen from './LegalDocumentsScreen';
import DocumentViewerScreen from './DocumentViewerScreen';
import { LanguageSelector } from '../../../components/LanguageSelector';

type SettingsView = 'main' | 'account' | 'voice' | 'notifications' | 'subscription' | 'legal' | 'document';
type DocumentType = 'terms' | 'privacy' | null;

interface SettingsScreenProps {
  onClose: () => void;
  navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose, navigation }) => {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [currentDocument, setCurrentDocument] = useState<DocumentType>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

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

  const handleNavigateToDocument = (documentType: 'terms' | 'privacy') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentDocument(documentType);
    setCurrentView('document');
  };

  const handleBackFromDocument = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentView('legal');
    setCurrentDocument(null);
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowLogoutModal(false);

    // Clear auth data
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');

    // Clear all stats/progress cache so the next user sees their own data
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(
        key =>
          key.startsWith('stats_daily_') ||
          key.startsWith('stats_recent_') ||
          key.startsWith('stats_lifetime_') ||
          key === 'daily_challenge_stats' ||
          key === 'challenge_streak' ||
          key.startsWith('category_stats_') ||
          key === '@challenge_session'
      );
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('[Logout] Failed to clear stats cache:', error);
    }

    // Close the settings modal
    onClose();

    // Navigate to Login screen
    // We need to get navigation from the parent ProfileScreen
    if (navigation) {
      navigation.replace('Login');
    }
  };

  const handleCancelLogout = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowLogoutModal(false);
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

  if (currentView === 'subscription') {
    return <SubscriptionManagementScreen onBack={handleBack} />;
  }

  if (currentView === 'legal') {
    return <LegalDocumentsScreen onBack={handleBack} onNavigateToDocument={handleNavigateToDocument} />;
  }

  if (currentView === 'document' && currentDocument) {
    return <DocumentViewerScreen onBack={handleBackFromDocument} documentType={currentDocument} />;
  }

  // Main Settings Menu
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="settings" size={24} color="#14B8A6" />
          <Text style={styles.title}>{t('profile.settings.title')}</Text>
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
          <Ionicons name="close" size={24} color="#B4E4DD" />
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
            <Text style={styles.menuLabel}>{t('profile.settings.label_account') || 'Account Preferences'}</Text>
            <Text style={styles.menuDescription}>
              {t('profile.settings.desc_account') || 'Manage your profile and account settings'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
        </TouchableOpacity>

        {/* AI Tutor Voice */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('voice')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="mic-outline" size={24} color="#10B981" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>{t('profile.settings.label_voice') || 'AI Tutor Voice'}</Text>
            <Text style={styles.menuDescription}>
              {t('profile.settings.desc_voice') || 'Choose your preferred tutor voice'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
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
            <Text style={styles.menuLabel}>{t('profile.settings.label_notifications_enabled')}</Text>
            <Text style={styles.menuDescription}>
              {t('profile.settings.desc_notifications') || 'Customize reminders and notification preferences'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
        </TouchableOpacity>

        {/* Subscription Management */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('subscription')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="card-outline" size={24} color="#F59E0B" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>{t('profile.settings.label_subscription') || 'Subscription'}</Text>
            <Text style={styles.menuDescription}>
              {t('profile.settings.desc_subscription') || 'Manage your subscription and billing'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
        </TouchableOpacity>

        {/* App Language */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowLanguageSelector(true);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#14B8A620' }]}>
            <Ionicons name="language-outline" size={24} color="#14B8A6" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>{t('profile.settings.label_app_language')}</Text>
            <Text style={styles.menuDescription}>
              {i18n.language.toUpperCase()} • {t('profile.settings.desc_app_language') || 'Change app display language'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
        </TouchableOpacity>

        {/* Legal & Privacy */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('legal')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#6366F120' }]}>
            <Ionicons name="document-text-outline" size={24} color="#6366F1" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>{t('profile.settings.label_legal') || 'Legal & Privacy'}</Text>
            <Text style={styles.menuDescription}>
              {t('profile.settings.desc_legal') || 'Terms of Use and Privacy Policy'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
        </TouchableOpacity>

        {/* Version Information */}
        <View style={styles.versionItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#8B5CF620' }]}>
            <Ionicons name="information-circle-outline" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>{t('profile.settings.label_version') || 'Version'}</Text>
            <Text style={styles.menuDescription}>
              {Constants.expoConfig?.version || '1.0.0'} ({Constants.expoConfig?.ios?.buildNumber || '1'})
            </Text>
          </View>
        </View>

        {/* Note about conversation help */}
        <View style={styles.helpNote}>
          <Ionicons name="bulb" size={20} color="#FBB040" />
          <Text style={styles.helpNoteText}>
            <Text style={styles.helpNoteBold}>{t('profile.settings.help_note_title') || 'Conversation Help'}</Text> {t('profile.settings.help_note_text') || 'settings can be accessed directly during your practice sessions by tapping the lightbulb icon.'}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.logoutLabel}>{t('profile.overview.button_logout')}</Text>
            <Text style={styles.menuDescription}>
              {t('profile.settings.desc_logout') || 'Sign out and clear your session'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8A84" />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <Pressable style={styles.logoutModalOverlay} onPress={handleCancelLogout}>
          <Pressable style={styles.logoutModalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.logoutModalHeader}>
              <View style={styles.logoutIconContainer}>
                <Ionicons name="log-out" size={32} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.logoutModalTitle}>{t('modals.logout.title')}</Text>
            <Text style={styles.logoutModalMessage}>
              {t('modals.logout.message')}
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={handleCancelLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutCancelButtonText}>{t('modals.logout.button_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutConfirmButtonText}>{t('modals.logout.button_logout')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 12,
    backgroundColor: '#0D2832',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#B4E4DD',
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
    opacity: 0.7,
  },
  helpNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  helpNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#FBBF24',
    lineHeight: 20,
  },
  helpNoteBold: {
    fontWeight: '600',
    color: '#FDE047',
  },
  // Logout Button Styles
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 24,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  // Logout Modal Styles - Dark Theme
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0D2832',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoutModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  logoutModalMessage: {
    fontSize: 15,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  logoutCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsScreen;
