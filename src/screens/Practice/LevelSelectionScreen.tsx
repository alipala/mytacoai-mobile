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

const CEFR_LEVELS: Level[] = [
  {
    id: 'A1',
    name: 'A1 - Beginner',
    description: 'Just starting out',
    skills: [
      'Basic greetings and introductions',
      'Simple everyday phrases',
      'Very basic conversations',
    ],
    color: '#10B981',
  },
  {
    id: 'A2',
    name: 'A2 - Elementary',
    description: 'Building foundations',
    skills: [
      'Routine tasks and exchanges',
      'Immediate needs and familiar topics',
      'Simple descriptions',
    ],
    color: '#3B82F6',
  },
  {
    id: 'B1',
    name: 'B1 - Intermediate',
    description: 'Gaining confidence',
    skills: [
      'Main points on familiar matters',
      'Travel situations',
      'Personal interests and experiences',
    ],
    color: '#8B5CF6',
  },
  {
    id: 'B2',
    name: 'B2 - Upper Intermediate',
    description: 'Working proficiency',
    skills: [
      'Complex text comprehension',
      'Fluent interaction with natives',
      'Detailed texts on various subjects',
    ],
    color: '#F59E0B',
  },
  {
    id: 'C1',
    name: 'C1 - Advanced',
    description: 'Professional fluency',
    skills: [
      'Demanding texts and implicit meaning',
      'Flexible language use',
      'Complex social, academic, or professional topics',
    ],
    color: '#EF4444',
  },
  {
    id: 'C2',
    name: 'C2 - Mastery',
    description: 'Near-native proficiency',
    skills: [
      'Understand virtually everything',
      'Summarize from various sources',
      'Spontaneous, precise expression',
    ],
    color: '#DC2626',
  },
];

const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const { mode, language, topic, customTopicText, researchData } = route.params;

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

    // Navigate to Loading/Initializing screen
    navigation.navigate('ConversationLoading', {
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
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Level</Text>
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
        <Text style={styles.title}>Select Your Level</Text>

        {/* Levels List */}
        <View style={styles.levelsContainer}>
          {CEFR_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                selectedLevel === level.id && styles.levelCardSelected,
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
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                      style={styles.checkIcon}
                    />
                  )}
                  <Ionicons
                    name={
                      expandedLevel === level.id
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </View>

              {/* Expanded Skills */}
              {expandedLevel === level.id && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsTitle}>What you can do:</Text>
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
          <Ionicons name="help-circle" size={20} color="#6B7280" />
          <Text style={styles.helpText}>
            Not sure about your level? Don't worry! You can always adjust it later.
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
          <Text style={styles.continueButtonText}>Start Practice</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
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
    backgroundColor: '#E5E7EB',
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
    color: '#6B7280',
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
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  levelsContainer: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  levelCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
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
    color: '#1F2937',
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  levelIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    marginRight: 4,
  },
  skillsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#4B5563',
    lineHeight: 20,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LevelSelectionScreen;
