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
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationService } from '../../../api/generated';
import { styles } from './styles/AccountPreferencesScreen.styles';

interface AccountPreferencesScreenProps {
  onBack: () => void;
}

// CEFR Levels with descriptions
const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner', description: 'Can understand and use basic phrases' },
  { value: 'A2', label: 'A2 - Elementary', description: 'Can communicate in simple routine tasks' },
  { value: 'B1', label: 'B1 - Intermediate', description: 'Can deal with most situations while traveling' },
  { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Can interact with native speakers fluently' },
  { value: 'C1', label: 'C1 - Advanced', description: 'Can express ideas fluently and spontaneously' },
  { value: 'C2', label: 'C2 - Proficient', description: 'Can understand virtually everything with ease' },
];

const AccountPreferencesScreen: React.FC<AccountPreferencesScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authProvider, setAuthProvider] = useState<string>('email');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLevel, setPreferredLevel] = useState('B1');
  const [showLevelPicker, setShowLevelPicker] = useState(false);

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
      setPreferredLevel(userData.preferred_level || 'B1');

      // Check authentication provider
      let provider = await AsyncStorage.getItem('auth_provider');

      // If no provider stored yet, default to 'email'
      // Note: Google users should have this set during login, but we'll default safely
      if (!provider) {
        provider = 'email';
        await AsyncStorage.setItem('auth_provider', provider);
      }

      console.log('🔐 Auth provider loaded:', provider, 'for user:', userData.email);
      console.log('📚 Preferred level loaded:', userData.preferred_level || 'B1 (default)');
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
        name: name.trim(),
      });

      // Update local storage
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = name.trim();
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

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

  const handleLevelChange = async (level: string) => {
    try {
      setSaving(true);
      setShowLevelPicker(false);

      // Update on backend
      await AuthenticationService.updateProfileApiAuthUpdateProfilePut({
        requestBody: { preferred_level: level },
      });

      // Update local state
      setPreferredLevel(level);

      // Update local storage so Explore tab uses it immediately
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.preferred_level = level;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      // IMPORTANT: Set flag to force Explore tab to refresh
      await AsyncStorage.setItem('levelChanged', 'true');
      await AsyncStorage.setItem('newLevel', level);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      console.log('✅ Proficiency level updated to:', level);
      console.log('🔄 Explore tab will refresh with new level on next focus');
      Alert.alert('Success', `Proficiency level updated to ${level}`);
    } catch (error: any) {
      console.error('Error updating level:', error);
      Alert.alert('Error', error.message || 'Failed to update level');
      // Revert on error
      await loadUserData();
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
        current_password: currentPassword,
        new_password: newPassword,
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

        {/* Proficiency Level Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={20} color="#4ECFBF" />
            <Text style={styles.sectionTitle}>Proficiency Level</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>My Current Level</Text>
            <TouchableOpacity
              style={styles.levelSelector}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowLevelPicker(true);
              }}
              disabled={saving}
              activeOpacity={0.7}
            >
              <View style={styles.levelSelectorContent}>
                <Text style={styles.levelSelectorText}>
                  {CEFR_LEVELS.find(l => l.value === preferredLevel)?.label || 'B1 - Intermediate'}
                </Text>
                <Text style={styles.levelSelectorDescription}>
                  {CEFR_LEVELS.find(l => l.value === preferredLevel)?.description || 'Can deal with most situations while traveling'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <Text style={styles.fieldNote}>
              Your defined level
            </Text>
          </View>
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

      {/* Level Picker Modal */}
      <Modal
        visible={showLevelPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLevelPicker(false)}
      >
        <Pressable style={styles.levelPickerOverlay} onPress={() => setShowLevelPicker(false)}>
          <Pressable style={styles.levelPickerContainer} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.levelPickerHeader}>
              <Text style={styles.levelPickerTitle}>Select Your Proficiency Level</Text>
              <Text style={styles.levelPickerSubtitle}>
                Choose the CEFR level that best matches your ability
              </Text>
            </View>

            {/* Level Options */}
            <ScrollView style={styles.levelPickerScroll} showsVerticalScrollIndicator={false}>
              {CEFR_LEVELS.map((level) => {
                const isSelected = level.value === preferredLevel;
                return (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.levelOption,
                      isSelected && styles.levelOptionSelected,
                    ]}
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      handleLevelChange(level.value);
                    }}
                    disabled={saving}
                    activeOpacity={0.7}
                  >
                    <View style={styles.levelOptionContent}>
                      <View style={styles.levelOptionHeader}>
                        <Text style={[
                          styles.levelOptionLabel,
                          isSelected && styles.levelOptionLabelSelected,
                        ]}>
                          {level.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.levelOptionCheck}>
                            <Ionicons name="checkmark-circle" size={24} color="#4ECFBF" />
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.levelOptionDescription,
                        isSelected && styles.levelOptionDescriptionSelected,
                      ]}>
                        {level.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.levelPickerCancelButton}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowLevelPicker(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.levelPickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AccountPreferencesScreen;
