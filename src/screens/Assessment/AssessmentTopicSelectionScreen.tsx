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

const ASSESSMENT_TOPICS: Topic[] = [
  {
    id: 'introduce_yourself',
    name: 'Introduce Yourself',
    description: 'Talk about who you are, your background, and interests',
    icon: 'person',
    color: '#3B82F6',
    prompt: 'Please introduce yourself. Talk about your name, where you are from, what you do, and your interests.',
  },
  {
    id: 'daily_routine',
    name: 'Daily Routine',
    description: 'Describe your typical day and daily activities',
    icon: 'time',
    color: '#06B6D4',
    prompt: 'Describe your daily routine. What do you typically do from morning to evening?',
  },
  {
    id: 'favorite_place',
    name: 'Favorite Place',
    description: 'Describe a place that is special to you',
    icon: 'location',
    color: '#10B981',
    prompt: 'Tell me about your favorite place. Where is it and why is it special to you?',
  },
  {
    id: 'travel_experience',
    name: 'Travel Experience',
    description: 'Share a memorable travel story or experience',
    icon: 'airplane',
    color: '#8B5CF6',
    prompt: 'Share a memorable travel experience. Where did you go and what made it special?',
  },
  {
    id: 'hobbies',
    name: 'Hobbies & Interests',
    description: 'Talk about activities you enjoy in your free time',
    icon: 'football',
    color: '#F59E0B',
    prompt: 'What are your hobbies and interests? Tell me about what you like to do in your free time.',
  },
  {
    id: 'career_goals',
    name: 'Career & Goals',
    description: 'Discuss your professional aspirations',
    icon: 'briefcase',
    color: '#EF4444',
    prompt: 'Talk about your career goals and professional aspirations. What do you hope to achieve?',
  },
  {
    id: 'favorite_book_movie',
    name: 'Favorite Book or Movie',
    description: 'Discuss a book or movie that impacted you',
    icon: 'film',
    color: '#EC4899',
    prompt: 'Tell me about your favorite book or movie. What is it about and why do you like it?',
  },
  {
    id: 'technology',
    name: 'Technology Impact',
    description: 'Share your thoughts on technology in daily life',
    icon: 'phone-portrait',
    color: '#6366F1',
    prompt: 'How has technology impacted your daily life? Share your thoughts on this topic.',
  },
];

const AssessmentTopicSelectionScreen: React.FC<AssessmentTopicSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { language } = route.params;

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
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Topic</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Choose a Speaking Topic</Text>
          <Text style={styles.subtitle}>
            Pick a topic for your 1-minute speaking assessment
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
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  topicsContainer: {
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topicCardSelected: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#6B7280',
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
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AssessmentTopicSelectionScreen;
