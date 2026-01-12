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

const TERMS_DATA: DocumentSection[] = [
  {
    title: "Acceptance of Terms",
    icon: "book-outline",
    content: [
      {
        subtitle: "Agreement to Terms",
        text: "By accessing and using Language Tutor's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
      },
      {
        subtitle: "Eligibility",
        text: "You must be at least 13 years old to use our services. If you are under 18, you must have your parent or guardian's permission to use our services."
      }
    ]
  },
  {
    title: "Use of Services",
    icon: "people-outline",
    content: [
      {
        subtitle: "Permitted Use",
        text: "You may use our services for personal, non-commercial language learning purposes. You agree to use the services in compliance with all applicable laws and regulations."
      },
      {
        subtitle: "Account Responsibility",
        text: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account."
      },
      {
        subtitle: "Prohibited Activities",
        text: "You may not use our services to engage in illegal activities, harass other users, distribute malware, or attempt to gain unauthorized access to our systems."
      }
    ]
  },
  {
    title: "Intellectual Property",
    icon: "shield-outline",
    content: [
      {
        subtitle: "Our Content",
        text: "All content, features, and functionality of our services, including but not limited to text, graphics, logos, and software, are owned by Language Tutor and are protected by copyright and other intellectual property laws."
      },
      {
        subtitle: "User Content",
        text: "You retain ownership of any content you create or upload to our services. By using our services, you grant us a license to use, modify, and display your content for the purpose of providing our services."
      }
    ]
  },
  {
    title: "Privacy and Data",
    icon: "lock-closed-outline",
    content: [
      {
        subtitle: "Data Collection",
        text: "Our collection and use of personal information is governed by our Privacy Policy. By using our services, you consent to the collection and use of information as outlined in our Privacy Policy."
      },
      {
        subtitle: "Learning Data",
        text: "We may use aggregated and anonymized learning data to improve our services and develop new features. Individual user data is never shared without explicit consent."
      }
    ]
  },
  {
    title: "Limitation of Liability",
    icon: "alert-circle-outline",
    content: [
      {
        subtitle: "Disclaimer",
        text: "Our services are provided 'as is' without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to merchantability and fitness for a particular purpose."
      },
      {
        subtitle: "Maximum Liability",
        text: "Our total liability to you for any claims arising from your use of our services shall not exceed the amount you paid us in the twelve months preceding the claim."
      }
    ]
  }
];

const PRIVACY_DATA: DocumentSection[] = [
  {
    title: "Information We Collect",
    icon: "document-text-outline",
    content: [
      {
        subtitle: "Personal Information",
        text: "We collect information you provide directly to us, such as when you create an account, use our language learning services, or contact us for support. This includes your name, email address, and learning preferences."
      },
      {
        subtitle: "Learning Data",
        text: "To provide personalized learning experiences, we collect data about your progress, conversation transcripts, assessment results, and usage patterns within our platform."
      },
      {
        subtitle: "Technical Information",
        text: "We automatically collect certain technical information, including your device type, browser information, IP address, and how you interact with our services."
      }
    ]
  },
  {
    title: "How We Use Your Information",
    icon: "people-outline",
    content: [
      {
        subtitle: "Service Provision",
        text: "We use your information to provide, maintain, and improve our language learning services, including personalizing your learning experience and tracking your progress."
      },
      {
        subtitle: "Communication",
        text: "We may use your contact information to send you important updates about our services, respond to your inquiries, and provide customer support."
      },
      {
        subtitle: "Analytics and Improvement",
        text: "We analyze usage patterns and feedback to improve our platform, develop new features, and enhance the overall learning experience."
      }
    ]
  },
  {
    title: "Information Sharing",
    icon: "eye-outline",
    content: [
      {
        subtitle: "No Sale of Data",
        text: "We do not sell, trade, or otherwise transfer your personal information to third parties for commercial purposes."
      },
      {
        subtitle: "Service Providers",
        text: "We may share information with trusted third-party service providers who assist us in operating our platform, conducting our business, or serving our users."
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information when required by law, court order, or other legal process, or when we believe disclosure is necessary to protect our rights or the safety of others."
      }
    ]
  },
  {
    title: "Data Security",
    icon: "lock-closed-outline",
    content: [
      {
        subtitle: "Security Measures",
        text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
      },
      {
        subtitle: "Encryption",
        text: "We use industry-standard encryption to protect sensitive data both in transit and at rest on our servers."
      },
      {
        subtitle: "Access Controls",
        text: "We maintain strict access controls and regularly review our security practices to ensure your data remains protected."
      }
    ]
  },
  {
    title: "Your Rights",
    icon: "hand-right-outline",
    content: [
      {
        subtitle: "Access and Correction",
        text: "You have the right to access and update your personal information at any time through your account settings."
      },
      {
        subtitle: "Data Deletion",
        text: "You may request deletion of your account and associated data by contacting us. Note that some information may be retained as required by law or for legitimate business purposes."
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt-out of marketing communications at any time by using the unsubscribe link in our emails or adjusting your notification preferences."
      }
    ]
  }
];

const DocumentViewerScreen: React.FC<DocumentViewerScreenProps> = ({ onBack, documentType }) => {
  const isTerms = documentType === 'terms';
  const data = isTerms ? TERMS_DATA : PRIVACY_DATA;
  const title = isTerms ? 'Terms of Use' : 'Privacy Policy';
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
          <Ionicons name="chevron-back" size={24} color="#4ECFBF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons
            name={isTerms ? "document-text" : "shield-checkmark"}
            size={22}
            color="#4ECFBF"
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
          <Text style={styles.updateText}>Last updated: {lastUpdated}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            {isTerms
              ? "These Terms of Service govern your use of Language Tutor's services. Please read carefully before using our platform."
              : "We are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information."}
          </Text>
        </View>

        {/* Sections */}
        {data.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name={section.icon as any} size={20} color="#4ECFBF" />
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
              <Text style={styles.sectionTitle}>Termination</Text>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.text}>
                We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </Text>
              <Text style={[styles.text, { marginTop: 12 }]}>
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your right to use the services will cease immediately.
              </Text>
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactSubtitle}>
            If you have any questions about {isTerms ? 'these Terms' : 'this Privacy Policy'}, please contact us:
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#4ECFBF" />
              <Text style={styles.contactText}>hello@mytacoai.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#4ECFBF" />
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
          <Ionicons name="globe-outline" size={20} color="#4ECFBF" />
          <Text style={styles.onlineButtonText}>View Online Version</Text>
          <Ionicons name="open-outline" size={18} color="#4ECFBF" />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#1F2937',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  updateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  introCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  introText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  contentItem: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#F0FDFA',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#6B7280',
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
    color: '#0F766E',
    fontWeight: '500',
  },
  onlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECFBF',
    gap: 8,
  },
  onlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4ECFBF',
  },
});

export default DocumentViewerScreen;
