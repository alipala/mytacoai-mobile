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

// Import SVG flags as components
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LanguageSelectionScreenProps {
  navigation: any;
  route: any;
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

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const mode = route.params?.mode || 'practice';

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

    // Navigate to Topic Selection
    navigation.navigate('TopicSelection', {
      mode,
      language: selectedLanguage,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Select Language</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 4</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Your Language</Text>

        {/* Language Grid */}
        <View style={styles.languageGrid}>
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
              <View style={styles.languageCardContent}>
                <language.FlagComponent width={48} height={48} style={styles.languageFlag} />
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNativeName}>
                    {language.nativeName}
                  </Text>
                </View>
                {selectedLanguage === language.id && (
                  <View style={[styles.checkmark, { backgroundColor: language.color }]}>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
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
          <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#B4E4DD',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#B4E4DD',
    marginBottom: 32,
    lineHeight: 24,
  },
  languageGrid: {
    gap: 12,
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  languageCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  languageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
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
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 14,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LanguageSelectionScreen;
