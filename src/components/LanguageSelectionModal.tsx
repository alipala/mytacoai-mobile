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
import type { LearningPlan } from '../api/generated';

interface LanguageSelectionModalProps {
  visible: boolean;
  selectedLanguage: Language;
  selectedLevel: CEFRLevel;
  onLanguageChange: (language: Language) => void;
  onLevelChange: (level: CEFRLevel) => void;
  onClose: () => void;
  learningPlans?: LearningPlan[];
  activePlan?: LearningPlan | null;
  onSelectPlan?: (plan: LearningPlan) => void;
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
  learningPlans = [],
  activePlan = null,
  onSelectPlan,
  totalChallenges = 0,
}) => {
  const [tempLanguage, setTempLanguage] = useState(selectedLanguage);
  const [tempLevel, setTempLevel] = useState(selectedLevel);

  // Debug logging
  React.useEffect(() => {
    if (visible) {
      console.log('🎨 Modal opened with:');
      console.log(`   - Learning plans: ${learningPlans.length}`);
      console.log(`   - Active plan: ${activePlan?.language} ${activePlan?.proficiency_level}`);
      console.log(`   - Selected: ${selectedLanguage} ${selectedLevel}`);
      console.log(`   - Total challenges: ${totalChallenges}`);
    }
  }, [visible, learningPlans, activePlan, selectedLanguage, selectedLevel, totalChallenges]);

  const handleApply = () => {
    console.log(`✅ Applying selection: ${tempLanguage} ${tempLevel}`);
    onLanguageChange(tempLanguage);
    onLevelChange(tempLevel);
    onClose();
  };

  const handleSelectPlan = (plan: LearningPlan) => {
    console.log(`📚 Plan selected: ${plan.language} ${plan.proficiency_level}`);
    if (onSelectPlan) {
      onSelectPlan(plan);
      onClose();
    }
  };

  const getLanguageFlag = (language: string): string => {
    const flags: Record<string, string> = {
      english: '🇬🇧',
      spanish: '🇪🇸',
      dutch: '🇳🇱',
      german: '🇩🇪',
      french: '🇫🇷',
      portuguese: '🇵🇹',
    };
    return flags[language.toLowerCase()] || '🌍';
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
            {/* My Learning Plans Section */}
            {learningPlans.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 MY LEARNING PLANS</Text>
                {learningPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planButton,
                      activePlan?.id === plan.id && styles.planButtonActive
                    ]}
                    onPress={() => handleSelectPlan(plan)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.planButtonIcon}>
                      {getLanguageFlag(plan.language)}
                    </Text>
                    <View style={styles.planButtonContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.planButtonTitle}>
                          {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)} · {plan.proficiency_level}
                        </Text>
                        {activePlan?.id === plan.id && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>Active</Text>
                          </View>
                        )}
                      </View>
                      {plan.progress_percentage !== undefined && plan.progress_percentage !== null && (
                        <Text style={styles.planButtonSubtitle}>
                          {plan.progress_percentage}% Complete · {plan.completed_sessions || 0}/{plan.total_sessions || 0} Sessions
                        </Text>
                      )}
                    </View>
                    <Text style={styles.planButtonChevron}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Language Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌍 LANGUAGE</Text>
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
              <Text style={styles.sectionTitle}>📊 CEFR LEVEL</Text>
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
    height: height * 0.85,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  planButtonActive: {
    backgroundColor: '#F0FDFA',
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
    fontSize: 12,
    color: '#14B8A6',
    marginTop: 4,
  },
  planButtonChevron: {
    fontSize: 20,
    color: '#14B8A6',
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
