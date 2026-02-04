import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

// Import SVG flags as components
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AssessmentLanguageSelectionScreenProps {
  navigation: any;
}

interface Language {
  id: string;
  name: string;
  nativeName: string;
  FlagComponent: React.FC<any>;
  color: string;
}

const LANGUAGES: Language[] = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    FlagComponent: EnglishFlag,
    color: '#3B82F6',
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    FlagComponent: SpanishFlag,
    color: '#EF4444',
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    FlagComponent: FrenchFlag,
    color: '#8B5CF6',
  },
  {
    id: 'german',
    name: 'German',
    nativeName: 'Deutsch',
    FlagComponent: GermanFlag,
    color: '#F59E0B',
  },
  {
    id: 'dutch',
    name: 'Dutch',
    nativeName: 'Nederlands',
    FlagComponent: DutchFlag,
    color: '#10B981',
  },
  {
    id: 'portuguese',
    name: 'Portuguese',
    nativeName: 'Português',
    FlagComponent: PortugueseFlag,
    color: '#06B6D4',
  },
];

const AssessmentLanguageSelectionScreen: React.FC<AssessmentLanguageSelectionScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (languageId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLanguage(languageId);
  };

  const handleContinue = () => {
    if (!selectedLanguage) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Navigate to Topic Selection for Assessment
    navigation.navigate('AssessmentTopicSelection', {
      language: selectedLanguage,
    });
  };

  const handleBack = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('assessment.speaking.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="mic-outline" size={40} color="#14B8A6" />
          </View>
          <Text style={styles.title}>{t('assessment.language_selection.title')}</Text>
          <Text style={styles.subtitle}>
            {t('assessment.language_selection.subtitle')}
          </Text>
        </View>

        {/* Language Cards */}
        <View style={styles.languagesContainer}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                selectedLanguage === language.id && {
                  ...styles.languageCardSelected,
                  borderColor: language.color,
                },
              ]}
              onPress={() => handleLanguageSelect(language.id)}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <language.FlagComponent width={48} height={48} style={styles.flagIcon} />
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNativeName}>
                    {language.nativeName}
                  </Text>
                </View>
              </View>

              {selectedLanguage === language.id && (
                <View
                  style={[styles.checkmark, { backgroundColor: language.color }]}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLanguage && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{t('buttons.continue')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.15)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 24,
  },
  languagesContainer: {
    gap: 12,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  languageCardSelected: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 2,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagIcon: {
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#B4E4DD',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AssessmentLanguageSelectionScreen;
