import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

// Import SVG flags
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import FrenchFlag from '../assets/flags/french.svg';
import GermanFlag from '../assets/flags/german.svg';
import PortugueseFlag from '../assets/flags/portuguese.svg';
import DutchFlag from '../assets/flags/dutch.svg';

interface LanguageFilterSelectorProps {
  selectedLanguage: string | null;
  onLanguageChange: (language: string | null) => void;
  availableLanguages: string[];
}

const LANGUAGE_FLAGS: Record<string, React.FC<any>> = {
  'english': EnglishFlag,
  'spanish': SpanishFlag,
  'french': FrenchFlag,
  'german': GermanFlag,
  'dutch': DutchFlag,
  'portuguese': PortugueseFlag,
};

const LANGUAGE_NAMES: Record<string, string> = {
  'english': 'English',
  'spanish': 'Spanish',
  'french': 'French',
  'german': 'German',
  'dutch': 'Dutch',
  'portuguese': 'Portuguese',
};

export const LanguageFilterSelector: React.FC<LanguageFilterSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (language: string | null) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLanguageChange(language);
    setShowModal(false);
  };

  const selectedLangName = selectedLanguage
    ? LANGUAGE_NAMES[selectedLanguage] || selectedLanguage
    : t('learning_plan.filters.all');

  const SelectedFlag = selectedLanguage ? LANGUAGE_FLAGS[selectedLanguage] : null;

  return (
    <>
      {/* Flag-sized rectangular dropdown button */}
      <TouchableOpacity
        style={styles.flagButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        {SelectedFlag ? (
          <SelectedFlag width={24} height={24} />
        ) : (
          <Ionicons name="globe" size={20} color="#14B8A6" />
        )}
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
        statusBarTranslucent
      >
        <BlurView intensity={80} style={styles.blurContainer} tint="dark">
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter by Language</Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              >
                {/* All Languages Option */}
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    !selectedLanguage && styles.languageOptionSelected,
                  ]}
                  onPress={() => handleSelect(null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageContent}>
                    <View style={[styles.flagCircleLarge, styles.allLanguagesCircle]}>
                      <Ionicons name="globe" size={28} color="#14B8A6" />
                    </View>
                    <Text style={styles.languageName}>
                      {t('learning_plan.filters.all')}
                    </Text>
                  </View>
                  {!selectedLanguage && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>

                {/* Individual Languages */}
                {availableLanguages.map((language) => {
                  const FlagComponent = LANGUAGE_FLAGS[language];
                  const isSelected = selectedLanguage === language;

                  return (
                    <TouchableOpacity
                      key={language}
                      style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionSelected,
                      ]}
                      onPress={() => handleSelect(language)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.languageContent}>
                        {FlagComponent && (
                          <View style={styles.flagCircleLarge}>
                            <FlagComponent width={32} height={32} />
                          </View>
                        )}
                        <Text style={styles.languageName}>
                          {LANGUAGE_NAMES[language] || language}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Flag-sized circular dropdown button
  flagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Keep old styles for backward compatibility (in case referenced elsewhere)
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allLanguagesCircle: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  blurContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#0B1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flagCircleLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
