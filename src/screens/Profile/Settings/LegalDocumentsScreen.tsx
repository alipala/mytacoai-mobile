/**
 * LegalDocumentsScreen.tsx
 * Legal & Privacy screen with links to Terms of Use and Privacy Policy
 * Required by Apple for auto-renewable subscriptions
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

interface LegalDocumentsScreenProps {
  onBack: () => void;
  onNavigateToDocument: (documentType: 'terms' | 'privacy') => void;
}

const LegalDocumentsScreen: React.FC<LegalDocumentsScreenProps> = ({ onBack, onNavigateToDocument }) => {
  const { t } = useTranslation();

  const handleViewDocument = (documentType: 'terms' | 'privacy') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onNavigateToDocument(documentType);
  };

  const handleOpenUrl = async (url: string, title: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error opening ${title}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#14B8A6" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="document-text" size={24} color="#14B8A6" />
          <Text style={styles.title}>{t('profile.settings.legal.title')}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.infoBannerText}>
            {t('profile.settings.legal.info_banner')}
          </Text>
        </View>

        {/* Terms of Use */}
        <TouchableOpacity
          style={styles.documentCard}
          onPress={() => handleViewDocument('terms')}
          activeOpacity={0.7}
        >
          <View style={[styles.documentIcon, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="document-text-outline" size={28} color="#3B82F6" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{t('profile.settings.legal.terms_title')}</Text>
            <Text style={styles.documentDescription}>
              {t('profile.settings.legal.terms_description')}
            </Text>
            <View style={styles.linkContainer}>
              <Ionicons name="document" size={14} color="#14B8A6" />
              <Text style={styles.linkText}>{t('profile.settings.legal.link_view_in_app')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#14B8A6" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity
          style={styles.documentCard}
          onPress={() => handleViewDocument('privacy')}
          activeOpacity={0.7}
        >
          <View style={[styles.documentIcon, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="lock-closed-outline" size={28} color="#10B981" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{t('profile.settings.legal.privacy_title')}</Text>
            <Text style={styles.documentDescription}>
              {t('profile.settings.legal.privacy_description')}
            </Text>
            <View style={styles.linkContainer}>
              <Ionicons name="document" size={14} color="#14B8A6" />
              <Text style={styles.linkText}>{t('profile.settings.legal.link_view_in_app')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#14B8A6" />
        </TouchableOpacity>

        {/* Subscription Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Ionicons name="card" size={20} color="#F59E0B" />
            <Text style={styles.infoSectionTitle}>{t('profile.settings.legal.section_subscription_info')}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                {t('profile.settings.legal.subscription_info_trial')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                {t('profile.settings.legal.subscription_info_cancel')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                {t('profile.settings.legal.subscription_info_auto_renew')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                {t('profile.settings.legal.subscription_info_payment')}
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>{t('profile.settings.legal.support_title')}</Text>
          <Text style={styles.supportText}>
            {t('profile.settings.legal.support_description')}
          </Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleOpenUrl('tel:+31621185593', 'Support Phone')}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color="#14B8A6" />
              <Text style={styles.supportButtonText}>{t('profile.settings.legal.button_call_support')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleOpenUrl('mailto:hello@mytacoai.com', 'Support Email')}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={20} color="#14B8A6" />
              <Text style={styles.supportButtonText}>{t('profile.settings.legal.button_email_us')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
    marginRight: 40,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    backgroundColor: '#0D2832',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#6EE7B7',
    lineHeight: 20,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: '#B4E4DD',
    lineHeight: 18,
    marginBottom: 6,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#FCD34D',
    lineHeight: 20,
  },
  supportSection: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#14B8A6',
    gap: 6,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6',
  },
});

export default LegalDocumentsScreen;
