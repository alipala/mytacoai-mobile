/**
 * AccountPreferencesScreen.tsx
 * Account settings screen for managing profile and password
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationService } from '../../../api/generated';

interface AccountPreferencesScreenProps {
  onBack: () => void;
}

const AccountPreferencesScreen: React.FC<AccountPreferencesScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authProvider, setAuthProvider] = useState<string>('email');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await AuthenticationService.getUserMeApiAuthMeGet();
      setName(userData.name || '');
      setEmail(userData.email || '');

      // Check authentication provider
      let provider = await AsyncStorage.getItem('auth_provider');

      // If no provider stored yet, default to 'email'
      // Note: Google users should have this set during login, but we'll default safely
      if (!provider) {
        provider = 'email';
        await AsyncStorage.setItem('auth_provider', provider);
      }

      console.log('🔐 Auth provider loaded:', provider, 'for user:', userData.email);
      setAuthProvider(provider);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await AuthenticationService.updateProfileApiAuthUpdateProfilePut({
        requestBody: { name: name.trim() },
      });

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await AuthenticationService.updatePasswordApiAuthUpdatePasswordPost({
        requestBody: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('Success', 'Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await AuthenticationService.deactivateAccountApiAuthDeactivateAccountPost();

      // Clear local storage
      await AsyncStorage.clear();

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Account Deleted', 'Your account has been permanently deleted. We are sorry to see you go!');
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.title}>Account Preferences</Text>
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
        <Text style={styles.title}>Account Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#4ECFBF" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.fieldNote}>Email cannot be changed</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (saving || authProvider === 'google') && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={saving || authProvider === 'google'}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Password & Security Section - Disabled for Google users */}
        {authProvider === 'google' ? (
          <View style={[styles.section, styles.disabledSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
              <Text style={[styles.sectionTitle, styles.disabledSectionTitle]}>Password & Security</Text>
            </View>

            <View style={styles.googleAccountNotice}>
              <View style={styles.googleAccountNoticeIconContainer}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </View>
              <View style={styles.googleAccountNoticeContent}>
                <Text style={styles.googleAccountNoticeTitle}>Google Account</Text>
                <Text style={styles.googleAccountNoticeText}>
                  Your account is linked to Google. Password management is handled by your Google account settings.
                </Text>
                <Text style={styles.googleAccountNoticeLink}>
                  Manage your Google password at myaccount.google.com
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={20} color="#4ECFBF" />
              <Text style={styles.sectionTitle}>Password & Security</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
              <Text style={styles.fieldNote}>
                Password must be at least 6 characters long
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleUpdatePassword}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="key" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Dangerous Area */}
        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
              Dangerous Area
            </Text>
          </View>

          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Delete Account</Text>
            <Text style={styles.dangerDescription}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <Pressable style={styles.deleteModalOverlay} onPress={handleCancelDelete}>
          <Pressable style={styles.deleteModalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalIconContainer}>
              <View style={styles.deleteModalIconCircle}>
                <Ionicons name="warning" size={40} color="#EF4444" />
              </View>
            </View>

            <Text style={styles.deleteModalTitle}>Delete Account?</Text>
            <Text style={styles.deleteModalSubtitle}>This action cannot be undone</Text>

            <View style={styles.deleteModalWarningBox}>
              <Text style={styles.deleteModalWarningTitle}>⚠️ You will permanently lose:</Text>
              <View style={styles.deleteModalWarningList}>
                <View style={styles.deleteModalWarningItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={styles.deleteModalWarningText}>All your learning progress and history</Text>
                </View>
                <View style={styles.deleteModalWarningItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={styles.deleteModalWarningText}>Your personalized learning plans</Text>
                </View>
                <View style={styles.deleteModalWarningItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={styles.deleteModalWarningText}>All flashcards and study materials</Text>
                </View>
                <View style={styles.deleteModalWarningItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={styles.deleteModalWarningText}>Your subscription and payment information</Text>
                </View>
                <View style={styles.deleteModalWarningItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={styles.deleteModalWarningText}>Access to your account forever</Text>
                </View>
              </View>
            </View>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={handleCancelDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteCancelButtonText}>Keep My Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, deleting && styles.deleteConfirmButtonDisabled]}
                onPress={handleConfirmDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteConfirmButtonText}>Delete Forever</Text>
                  </>
                )}
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  fieldNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#4ECFBF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dangerSection: {
    padding: 20,
  },
  dangerCard: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledSection: {
    opacity: 0.7,
  },
  disabledSectionTitle: {
    color: '#9CA3AF',
  },
  googleAccountNotice: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  googleAccountNoticeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleAccountNoticeContent: {
    flex: 1,
  },
  googleAccountNoticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  googleAccountNoticeText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 8,
  },
  googleAccountNoticeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  deleteModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  deleteModalWarningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    marginBottom: 24,
  },
  deleteModalWarningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 12,
  },
  deleteModalWarningList: {
    gap: 10,
  },
  deleteModalWarningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  deleteModalWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  deleteModalButtons: {
    gap: 10,
  },
  deleteCancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteConfirmButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  deleteConfirmButtonDisabled: {
    opacity: 0.6,
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AccountPreferencesScreen;
