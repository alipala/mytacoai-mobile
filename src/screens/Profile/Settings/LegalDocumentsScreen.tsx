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

interface LegalDocumentsScreenProps {
  onBack: () => void;
  onNavigateToDocument: (documentType: 'terms' | 'privacy') => void;
}

const LegalDocumentsScreen: React.FC<LegalDocumentsScreenProps> = ({ onBack, onNavigateToDocument }) => {
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
          <Ionicons name="chevron-back" size={24} color="#4ECFBF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="document-text" size={24} color="#4ECFBF" />
          <Text style={styles.title}>Legal & Privacy</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.infoBannerText}>
            Your privacy and trust are important to us. Review our policies to understand how we protect your data.
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
            <Text style={styles.documentTitle}>Terms of Use</Text>
            <Text style={styles.documentDescription}>
              Read our terms and conditions for using MyTaco AI
            </Text>
            <View style={styles.linkContainer}>
              <Ionicons name="document" size={14} color="#4ECFBF" />
              <Text style={styles.linkText}>View in App</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4ECFBF" />
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
            <Text style={styles.documentTitle}>Privacy Policy</Text>
            <Text style={styles.documentDescription}>
              Learn how we collect, use, and protect your personal information
            </Text>
            <View style={styles.linkContainer}>
              <Ionicons name="document" size={14} color="#4ECFBF" />
              <Text style={styles.linkText}>View in App</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#4ECFBF" />
        </TouchableOpacity>

        {/* Subscription Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Ionicons name="card" size={20} color="#F59E0B" />
            <Text style={styles.infoSectionTitle}>Subscription Information</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                All subscriptions include a 7-day free trial
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                Cancel anytime during the free trial period
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                Auto-renewal can be disabled in your account settings
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoText}>
                Payment charged to your account at confirmation
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have questions about our terms, privacy practices, or subscriptions, please contact our support team.
          </Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleOpenUrl('tel:+31621185593', 'Support Phone')}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color="#4ECFBF" />
              <Text style={styles.supportButtonText}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleOpenUrl('mailto:hello@mytacoai.com', 'Support Email')}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={20} color="#4ECFBF" />
              <Text style={styles.supportButtonText}>Email Us</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: '#6B7280',
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
    color: '#4ECFBF',
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
    color: '#1F2937',
  },
  infoCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
    color: '#78350F',
    lineHeight: 20,
  },
  supportSection: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ECFBF',
    gap: 6,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECFBF',
  },
});

export default LegalDocumentsScreen;
