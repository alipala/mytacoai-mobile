/**
 * Language Selector Component
 * ===========================
 * Allows users to change the app's display language
 *
 * Features:
 * - Shows all 7 supported languages with flags and native names
 * - Highlights currently selected language
 * - Persists selection to AsyncStorage
 * - Updates app immediately when language changes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/config';

// Import flag components
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import DutchFlag from '../assets/flags/dutch.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
// Turkish flag not available yet - will use language icon

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const FLAG_COMPONENTS: Record<string, any> = {
  en: EnglishFlag,
  es: SpanishFlag,
  fr: FrenchFlag,
  de: GermanFlag,
  nl: DutchFlag,
  pt: PortugueseFlag,
  // tr: Turkish flag not available - will show language icon
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const handleSelectLanguage = async (languageCode: string) => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      console.log('[LanguageSelector] Changing language to:', languageCode);

      // Update local state immediately for UI feedback
      setSelectedLanguage(languageCode);

      // Change language and persist to storage
      await changeLanguage(languageCode);

      console.log('[LanguageSelector] Language changed successfully');

      // Close modal after a short delay to show selection feedback
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('[LanguageSelector] Error changing language:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('profile.settings.label_app_language')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#E5E7EB" />
            </TouchableOpacity>
          </View>

          {/* Language List */}
          <ScrollView
            style={styles.languageList}
            showsVerticalScrollIndicator={false}
          >
            {SUPPORTED_LANGUAGES.map((language) => {
              const isSelected = selectedLanguage === language.code;
              const FlagComponent = FLAG_COMPONENTS[language.code];

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                  onPress={() => handleSelectLanguage(language.code)}
                  activeOpacity={0.7}
                >
                  {/* Flag */}
                  <View style={styles.flagContainer}>
                    {FlagComponent ? (
                      <FlagComponent width={40} height={28} />
                    ) : (
                      <Ionicons name="flag" size={28} color="#6B8A84" />
                    )}
                  </View>

                  {/* Language Names */}
                  <View style={styles.languageTextContainer}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNativeName}>
                      {language.nativeName}
                    </Text>
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark-circle" size={28} color="#14B8A6" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('profile.settings.language_change_note') ||
               'The app will update immediately when you select a language'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0B1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexGrow: 0,
    flexShrink: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  flagContainer: {
    width: 50,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
