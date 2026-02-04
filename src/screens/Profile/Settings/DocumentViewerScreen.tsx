/**
 * DocumentViewerScreen.tsx
 * Displays Terms of Use or Privacy Policy in-app
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

interface DocumentSection {
  title: string;
  icon: string;
  content: {
    subtitle: string;
    text: string;
  }[];
}

interface DocumentViewerScreenProps {
  onBack: () => void;
  documentType: 'terms' | 'privacy';
}

const getTermsData = (t: any): DocumentSection[] => [
  {
    title: t('legal_documents.terms.acceptance.title'),
    icon: "book-outline",
    content: [
      {
        subtitle: t('legal_documents.terms.acceptance.agreement.subtitle'),
        text: t('legal_documents.terms.acceptance.agreement.text')
      },
      {
        subtitle: t('legal_documents.terms.acceptance.eligibility.subtitle'),
        text: t('legal_documents.terms.acceptance.eligibility.text')
      }
    ]
  },
  {
    title: t('legal_documents.terms.use_of_services.title'),
    icon: "people-outline",
    content: [
      {
        subtitle: t('legal_documents.terms.use_of_services.permitted_use.subtitle'),
        text: t('legal_documents.terms.use_of_services.permitted_use.text')
      },
      {
        subtitle: t('legal_documents.terms.use_of_services.account_responsibility.subtitle'),
        text: t('legal_documents.terms.use_of_services.account_responsibility.text')
      },
      {
        subtitle: t('legal_documents.terms.use_of_services.prohibited_activities.subtitle'),
        text: t('legal_documents.terms.use_of_services.prohibited_activities.text')
      }
    ]
  },
  {
    title: t('legal_documents.terms.intellectual_property.title'),
    icon: "shield-outline",
    content: [
      {
        subtitle: t('legal_documents.terms.intellectual_property.our_content.subtitle'),
        text: t('legal_documents.terms.intellectual_property.our_content.text')
      },
      {
        subtitle: t('legal_documents.terms.intellectual_property.user_content.subtitle'),
        text: t('legal_documents.terms.intellectual_property.user_content.text')
      }
    ]
  },
  {
    title: t('legal_documents.terms.privacy_and_data.title'),
    icon: "lock-closed-outline",
    content: [
      {
        subtitle: t('legal_documents.terms.privacy_and_data.data_collection.subtitle'),
        text: t('legal_documents.terms.privacy_and_data.data_collection.text')
      },
      {
        subtitle: t('legal_documents.terms.privacy_and_data.learning_data.subtitle'),
        text: t('legal_documents.terms.privacy_and_data.learning_data.text')
      }
    ]
  },
  {
    title: t('legal_documents.terms.limitation_of_liability.title'),
    icon: "alert-circle-outline",
    content: [
      {
        subtitle: t('legal_documents.terms.limitation_of_liability.disclaimer.subtitle'),
        text: t('legal_documents.terms.limitation_of_liability.disclaimer.text')
      },
      {
        subtitle: t('legal_documents.terms.limitation_of_liability.maximum_liability.subtitle'),
        text: t('legal_documents.terms.limitation_of_liability.maximum_liability.text')
      }
    ]
  }
];

const getPrivacyData = (t: any): DocumentSection[] => [
  {
    title: t('legal_documents.privacy.information_we_collect.title'),
    icon: "document-text-outline",
    content: [
      {
        subtitle: t('legal_documents.privacy.information_we_collect.personal_information.subtitle'),
        text: t('legal_documents.privacy.information_we_collect.personal_information.text')
      },
      {
        subtitle: t('legal_documents.privacy.information_we_collect.learning_data.subtitle'),
        text: t('legal_documents.privacy.information_we_collect.learning_data.text')
      },
      {
        subtitle: t('legal_documents.privacy.information_we_collect.technical_information.subtitle'),
        text: t('legal_documents.privacy.information_we_collect.technical_information.text')
      }
    ]
  },
  {
    title: t('legal_documents.privacy.how_we_use.title'),
    icon: "people-outline",
    content: [
      {
        subtitle: t('legal_documents.privacy.how_we_use.service_provision.subtitle'),
        text: t('legal_documents.privacy.how_we_use.service_provision.text')
      },
      {
        subtitle: t('legal_documents.privacy.how_we_use.communication.subtitle'),
        text: t('legal_documents.privacy.how_we_use.communication.text')
      },
      {
        subtitle: t('legal_documents.privacy.how_we_use.analytics_improvement.subtitle'),
        text: t('legal_documents.privacy.how_we_use.analytics_improvement.text')
      }
    ]
  },
  {
    title: t('legal_documents.privacy.information_sharing.title'),
    icon: "eye-outline",
    content: [
      {
        subtitle: t('legal_documents.privacy.information_sharing.no_sale.subtitle'),
        text: t('legal_documents.privacy.information_sharing.no_sale.text')
      },
      {
        subtitle: t('legal_documents.privacy.information_sharing.service_providers.subtitle'),
        text: t('legal_documents.privacy.information_sharing.service_providers.text')
      },
      {
        subtitle: t('legal_documents.privacy.information_sharing.legal_requirements.subtitle'),
        text: t('legal_documents.privacy.information_sharing.legal_requirements.text')
      }
    ]
  },
  {
    title: t('legal_documents.privacy.data_security.title'),
    icon: "lock-closed-outline",
    content: [
      {
        subtitle: t('legal_documents.privacy.data_security.security_measures.subtitle'),
        text: t('legal_documents.privacy.data_security.security_measures.text')
      },
      {
        subtitle: t('legal_documents.privacy.data_security.encryption.subtitle'),
        text: t('legal_documents.privacy.data_security.encryption.text')
      },
      {
        subtitle: t('legal_documents.privacy.data_security.access_controls.subtitle'),
        text: t('legal_documents.privacy.data_security.access_controls.text')
      }
    ]
  },
  {
    title: t('legal_documents.privacy.your_rights.title'),
    icon: "hand-right-outline",
    content: [
      {
        subtitle: t('legal_documents.privacy.your_rights.access_correction.subtitle'),
        text: t('legal_documents.privacy.your_rights.access_correction.text')
      },
      {
        subtitle: t('legal_documents.privacy.your_rights.data_deletion.subtitle'),
        text: t('legal_documents.privacy.your_rights.data_deletion.text')
      },
      {
        subtitle: t('legal_documents.privacy.your_rights.opt_out.subtitle'),
        text: t('legal_documents.privacy.your_rights.opt_out.text')
      }
    ]
  }
];

const DocumentViewerScreen: React.FC<DocumentViewerScreenProps> = ({ onBack, documentType }) => {
  const { t } = useTranslation();
  const isTerms = documentType === 'terms';
  const data = isTerms ? getTermsData(t) : getPrivacyData(t);
  const title = isTerms ? t('legal_documents.terms_of_use') : t('legal_documents.privacy_policy');
  const url = isTerms ? 'https://mytacoai.com/terms' : 'https://mytacoai.com/privacy';
  const lastUpdated = "January 15, 2025";

  const handleOpenOnline = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
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
          <Ionicons
            name={isTerms ? "document-text" : "shield-checkmark"}
            size={22}
            color="#14B8A6"
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updateBanner}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.updateText}>{t('legal_documents.last_updated', { date: lastUpdated })}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            {isTerms ? t('legal_documents.terms.intro') : t('legal_documents.privacy.intro')}
          </Text>
        </View>

        {/* Sections */}
        {data.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name={section.icon as any} size={20} color="#14B8A6" />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.content.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.contentItem}>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.text}>{item.text}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Termination (Terms only) */}
        {isTerms && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="warning-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.sectionTitle}>{t('legal_documents.terms.termination.title')}</Text>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.text}>
                {t('legal_documents.terms.termination.text_part1')}
              </Text>
              <Text style={[styles.text, { marginTop: 12 }]}>
                {t('legal_documents.terms.termination.text_part2')}
              </Text>
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>{t('legal_documents.contact_us')}</Text>
          <Text style={styles.contactSubtitle}>
            {isTerms ? t('legal_documents.contact_subtitle_terms') : t('legal_documents.contact_subtitle_privacy')}
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#14B8A6" />
              <Text style={styles.contactText}>hello@mytacoai.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#14B8A6" />
              <Text style={styles.contactText}>+31 6 21185593</Text>
            </View>
          </View>
        </View>

        {/* View Online Button */}
        <TouchableOpacity
          style={styles.onlineButton}
          onPress={handleOpenOnline}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={20} color="#14B8A6" />
          <Text style={styles.onlineButtonText}>{t('legal_documents.view_online')}</Text>
          <Ionicons name="open-outline" size={18} color="#14B8A6" />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D2832', // Dark theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0B1A1F',
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
    gap: 10,
    flex: 1,
    justifyContent: 'center',
    marginRight: 40,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0B1A1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
  },
  updateText: {
    fontSize: 13,
    color: '#B4E4DD',
    fontWeight: '500',
  },
  introCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  introText: {
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  contentItem: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#B4E4DD',
    marginBottom: 12,
  },
  contactInfo: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '500',
  },
  onlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
    gap: 8,
  },
  onlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14B8A6',
  },
});

export default DocumentViewerScreen;
