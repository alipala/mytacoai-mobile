import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

interface LevelSelectionScreenProps {
  navigation: any;
  route: any;
}

interface Level {
  id: string;
  name: string;
  description: string;
  skills: string[];
  color: string;
}

const getCEFRLevels = (t: (key: string) => string): Level[] => [
  {
    id: 'A1',
    name: t('levels.a1_name'),
    description: t('levels.a1_description'),
    skills: [
      t('levels.a1_skill_1'),
      t('levels.a1_skill_2'),
      t('levels.a1_skill_3'),
    ],
    color: '#10B981',
  },
  {
    id: 'A2',
    name: t('levels.a2_name'),
    description: t('levels.a2_description'),
    skills: [
      t('levels.a2_skill_1'),
      t('levels.a2_skill_2'),
      t('levels.a2_skill_3'),
    ],
    color: '#3B82F6',
  },
  {
    id: 'B1',
    name: t('levels.b1_name'),
    description: t('levels.b1_description'),
    skills: [
      t('levels.b1_skill_1'),
      t('levels.b1_skill_2'),
      t('levels.b1_skill_3'),
    ],
    color: '#8B5CF6',
  },
  {
    id: 'B2',
    name: t('levels.b2_name'),
    description: t('levels.b2_description'),
    skills: [
      t('levels.b2_skill_1'),
      t('levels.b2_skill_2'),
      t('levels.b2_skill_3'),
    ],
    color: '#F59E0B',
  },
  {
    id: 'C1',
    name: t('levels.c1_name'),
    description: t('levels.c1_description'),
    skills: [
      t('levels.c1_skill_1'),
      t('levels.c1_skill_2'),
      t('levels.c1_skill_3'),
    ],
    color: '#EF4444',
  },
  {
    id: 'C2',
    name: t('levels.c2_name'),
    description: t('levels.c2_description'),
    skills: [
      t('levels.c2_skill_1'),
      t('levels.c2_skill_2'),
      t('levels.c2_skill_3'),
    ],
    color: '#DC2626',
  },
];

const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const { mode, language, topic, customTopicText, researchData } = route.params;

  const CEFR_LEVELS = getCEFRLevels(t);

  const handleLevelSelect = (levelId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLevel(levelId);
    setExpandedLevel(expandedLevel === levelId ? null : levelId);
  };

  const handleContinue = () => {
    if (!selectedLevel) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Navigate directly to Conversation screen
    navigation.navigate('Conversation', {
      mode,
      language,
      topic,
      level: selectedLevel,
      customTopicText,
      researchData,
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
        <Text style={styles.headerTitle}>{t('practice.conversation.label_level')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '75%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 4</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('practice.conversation.label_level')}</Text>

        {/* Levels List */}
        <View style={styles.levelsContainer}>
          {CEFR_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                selectedLevel === level.id && {
                  ...styles.levelCardSelected,
                  borderColor: level.color,
                },
              ]}
              onPress={() => handleLevelSelect(level.id)}
              activeOpacity={0.7}
            >
              <View style={styles.levelHeader}>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: level.color },
                  ]}
                >
                  <Text style={styles.levelBadgeText}>{level.id}</Text>
                </View>
                <View style={styles.levelHeaderText}>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <Text style={styles.levelDescription}>
                    {level.description}
                  </Text>
                </View>
                <View style={styles.levelIcons}>
                  {selectedLevel === level.id && (
                    <View style={[styles.checkmark, { backgroundColor: level.color }]}>
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                  <Ionicons
                    name={
                      expandedLevel === level.id
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color="#B4E4DD"
                  />
                </View>
              </View>

              {/* Expanded Skills */}
              {expandedLevel === level.id && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsTitle}>{t('common.what_you_can_do', 'What you can do:')}</Text>
                  {level.skills.map((skill, index) => (
                    <View key={index} style={styles.skillItem}>
                      <View style={styles.skillBullet} />
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Ionicons name="help-circle" size={20} color="#B4E4DD" />
          <Text style={styles.helpText}>
            {t('practice.level_help_text', "Not sure about your level? Don't worry! You can always adjust it later.")}
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLevel && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedLevel}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{t('practice.conversation.button_start')}</Text>
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
    borderBottomColor: 'rgba(20, 184, 166, 0.15)',
  },
  backButton: {
    padding: 8,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  levelsContainer: {
    gap: 12,
  },
  levelCard: {
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
  levelCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  levelBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelHeaderText: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: 13,
    color: '#B4E4DD',
  },
  levelIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkIcon: {
    marginRight: 4,
  },
  skillsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  skillBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginTop: 6,
    marginRight: 12,
  },
  skillText: {
    flex: 1,
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
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

export default LevelSelectionScreen;
