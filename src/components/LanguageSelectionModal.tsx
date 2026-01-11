import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Language, CEFRLevel } from '../services/mockChallengeData';
import type { LearningPlan } from '../api/generated';
import { styles } from './styles/LanguageSelectionModal.styles';

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
