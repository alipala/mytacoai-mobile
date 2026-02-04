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

interface AssessmentTopicSelectionScreenProps {
  navigation: any;
  route: any;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: any; // Ionicons name
  color: string;
  prompt: string;
}

const ASSESSMENT_TOPICS_CONFIG = [
  { id: 'introduce_yourself', icon: 'person', color: '#3B82F6' },
  { id: 'daily_routine', icon: 'time', color: '#06B6D4' },
  { id: 'favorite_place', icon: 'location', color: '#10B981' },
  { id: 'travel_experience', icon: 'airplane', color: '#8B5CF6' },
  { id: 'hobbies', icon: 'football', color: '#F59E0B' },
  { id: 'career_goals', icon: 'briefcase', color: '#EF4444' },
  { id: 'favorite_book_movie', icon: 'film', color: '#EC4899' },
  { id: 'technology', icon: 'phone-portrait', color: '#6366F1' },
];

const AssessmentTopicSelectionScreen: React.FC<AssessmentTopicSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { language } = route.params;

  const getTopics = (): Topic[] => {
    return ASSESSMENT_TOPICS_CONFIG.map(config => ({
      id: config.id,
      name: t(`assessment.topics.${config.id}`),
      description: t(`assessment.topics.${config.id}_desc`),
      icon: config.icon,
      color: config.color,
      prompt: t(`assessment.topics.${config.id}_prompt`),
    }));
  };

  const ASSESSMENT_TOPICS = getTopics();

  const handleTopicSelect = (topicId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTopic(topicId);
  };

  const handleContinue = () => {
    if (!selectedTopic) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const topic = ASSESSMENT_TOPICS.find(t => t.id === selectedTopic);

    // Navigate to Recording Screen
    navigation.navigate('SpeakingAssessmentRecording', {
      language,
      topic: selectedTopic,
      topicName: topic?.name,
      prompt: topic?.prompt,
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
        <Text style={styles.headerTitle}>{t('assessment.topic_selection.header_title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('assessment.topic_selection.title')}</Text>
          <Text style={styles.subtitle}>
            {t('assessment.topic_selection.subtitle')}
          </Text>
        </View>

        {/* Topic Cards */}
        <View style={styles.topicsContainer}>
          {ASSESSMENT_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicCard,
                selectedTopic === topic.id && {
                  ...styles.topicCardSelected,
                  borderColor: topic.color,
                },
              ]}
              onPress={() => handleTopicSelect(topic.id)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}
              >
                <Ionicons name={topic.icon} size={24} color={topic.color} />
              </View>

              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>

              {selectedTopic === topic.id && (
                <View
                  style={[styles.checkmark, { backgroundColor: topic.color }]}
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
            !selectedTopic && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedTopic}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B4E4DD',
    lineHeight: 24,
  },
  topicsContainer: {
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  topicCardSelected: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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

export default AssessmentTopicSelectionScreen;
