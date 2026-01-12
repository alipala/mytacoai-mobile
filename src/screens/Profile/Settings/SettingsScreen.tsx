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
import AccountPreferencesScreen from './AccountPreferencesScreen';
import VoiceSelectionScreen from './VoiceSelectionScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import SubscriptionManagementScreen from './SubscriptionManagementScreen';
import LegalDocumentsScreen from './LegalDocumentsScreen';
import DocumentViewerScreen from './DocumentViewerScreen';

type SettingsView = 'main' | 'account' | 'voice' | 'notifications' | 'subscription' | 'legal' | 'document';
type DocumentType = 'terms' | 'privacy' | null;

interface SettingsScreenProps {
  onClose: () => void;
  navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose, navigation }) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [currentDocument, setCurrentDocument] = useState<DocumentType>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
            <Text style={styles.menuLabel}>Subscription</Text>
            <Text style={styles.menuDescription}>
              Manage your subscription and billing
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
            <Text style={styles.menuLabel}>Legal & Privacy</Text>
            <Text style={styles.menuDescription}>
              Terms of Use and Privacy Policy
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
            <Text style={styles.logoutLabel}>Logout</Text>
            <Text style={styles.menuDescription}>
              Sign out and clear your session
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
            <Text style={styles.logoutModalTitle}>Sign Out?</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to sign out? You'll need to log in again to access your learning progress.
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={handleCancelLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutConfirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
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
  // Logout Button Styles
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginTop: 24,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  // Logout Modal Styles
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
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
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  logoutModalMessage: {
    fontSize: 15,
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsScreen;
