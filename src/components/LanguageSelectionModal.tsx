import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Language, CEFRLevel } from '../services/mockChallengeData';

interface LanguageSelectionModalProps {
  visible: boolean;
  selectedLanguage: Language;
  selectedLevel: CEFRLevel;
  onLanguageChange: (language: Language) => void;
  onLevelChange: (level: CEFRLevel) => void;
  onClose: () => void;
  hasLearningPlan?: boolean;
  learningPlanLanguage?: Language;
  learningPlanLevel?: CEFRLevel;
  totalChallenges?: number;
}

const LANGUAGES: Array<{ code: Language; name: string; flag: string }> = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'dutch', name: 'Dutch', flag: '🇳🇱' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
];

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
};

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  visible,
  selectedLanguage,
  selectedLevel,
  onLanguageChange,
  onLevelChange,
  onClose,
  hasLearningPlan = false,
  learningPlanLanguage,
  learningPlanLevel,
  totalChallenges = 0,
}) => {
  const [tempLanguage, setTempLanguage] = useState(selectedLanguage);
  const [tempLevel, setTempLevel] = useState(selectedLevel);

  const handleApply = () => {
    onLanguageChange(tempLanguage);
    onLevelChange(tempLevel);
    onClose();
  };

  const handleReturnToPlan = () => {
    if (learningPlanLanguage && learningPlanLevel) {
      setTempLanguage(learningPlanLanguage);
      setTempLevel(learningPlanLevel);
      onLanguageChange(learningPlanLanguage);
      onLevelChange(learningPlanLevel);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Language & Level</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Return to Plan (if applicable) */}
            {hasLearningPlan && learningPlanLanguage && learningPlanLevel && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.planButton}
                  onPress={handleReturnToPlan}
                  activeOpacity={0.7}
                >
                  <Text style={styles.planButtonIcon}>📚</Text>
                  <View style={styles.planButtonContent}>
                    <Text style={styles.planButtonTitle}>Back to My Learning Plan</Text>
                    <Text style={styles.planButtonSubtitle}>
                      {LANGUAGES.find(l => l.code === learningPlanLanguage)?.name} {learningPlanLevel}
                    </Text>
                  </View>
                  <Text style={styles.planButtonChevron}>→</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Language Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language</Text>
              <View style={styles.languageGrid}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageButton,
                      tempLanguage === lang.code && styles.languageButtonSelected,
                    ]}
                    onPress={() => setTempLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageName,
                        tempLanguage === lang.code && styles.languageNameSelected,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Level Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CEFR Level</Text>
              <View style={styles.levelGrid}>
                {LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      tempLevel === level && styles.levelButtonSelected,
                    ]}
                    onPress={() => setTempLevel(level)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.levelCode,
                        tempLevel === level && styles.levelCodeSelected,
                      ]}
                    >
                      {level}
                    </Text>
                    <Text
                      style={[
                        styles.levelDescription,
                        tempLevel === level && styles.levelDescriptionSelected,
                      ]}
                    >
                      {LEVEL_DESCRIPTIONS[level]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Challenge Count Info */}
            {totalChallenges > 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  🎯 {totalChallenges} challenges available
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#4ECFBF',
  },
  planButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  planButtonContent: {
    flex: 1,
  },
  planButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F766E',
    marginBottom: 2,
  },
  planButtonSubtitle: {
    fontSize: 13,
    color: '#14B8A6',
  },
  planButtonChevron: {
    fontSize: 20,
    color: '#14B8A6',
    fontWeight: '600',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  languageButtonSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECFBF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 10,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  languageNameSelected: {
    color: '#0F766E',
  },
  levelGrid: {
    gap: 10,
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  levelButtonSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECFBF',
  },
  levelCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    minWidth: 36,
  },
  levelCodeSelected: {
    color: '#0F766E',
  },
  levelDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  levelDescriptionSelected: {
    color: '#14B8A6',
  },
  infoBox: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECFBF',
  },
  infoText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  applyButton: {
    backgroundColor: '#4ECFBF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
