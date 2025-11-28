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

interface TopicSelectionScreenProps {
  navigation: any;
  route: any;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: any; // Ionicons name
  color: string;
}

const PREDEFINED_TOPICS: Topic[] = [
  {
    id: 'travel',
    name: 'Travel & Tourism',
    description: 'Discuss destinations, booking trips, and travel experiences',
    icon: 'airplane',
    color: '#3B82F6',
  },
  {
    id: 'food',
    name: 'Food & Dining',
    description: 'Talk about restaurants, recipes, and food preferences',
    icon: 'restaurant',
    color: '#EF4444',
  },
  {
    id: 'work',
    name: 'Work & Career',
    description: 'Discuss jobs, career goals, and workplace situations',
    icon: 'briefcase',
    color: '#8B5CF6',
  },
  {
    id: 'hobbies',
    name: 'Hobbies & Interests',
    description: 'Share your favorite activities and pastimes',
    icon: 'football',
    color: '#F59E0B',
  },
  {
    id: 'shopping',
    name: 'Shopping & Services',
    description: 'Practice buying things and using services',
    icon: 'cart',
    color: '#10B981',
  },
  {
    id: 'daily',
    name: 'Daily Routines',
    description: 'Talk about everyday activities and schedules',
    icon: 'time',
    color: '#06B6D4',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Discuss wellness, exercise, and medical topics',
    icon: 'fitness',
    color: '#EC4899',
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Talk about gadgets, apps, and digital life',
    icon: 'phone-portrait',
    color: '#6366F1',
  },
  {
    id: 'education',
    name: 'Education & Learning',
    description: 'Discuss school, courses, and learning experiences',
    icon: 'school',
    color: '#F97316',
  },
  {
    id: 'family',
    name: 'Family & Relationships',
    description: 'Talk about family members and personal relationships',
    icon: 'people',
    color: '#14B8A6',
  },
];

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { mode, language } = route.params;

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

    // Navigate to Level Selection
    navigation.navigate('LevelSelection', {
      mode,
      language,
      topic: selectedTopic,
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

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 4</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What would you like to talk about?</Text>
        <Text style={styles.subtitle}>
          Choose a topic that interests you for conversation practice
        </Text>

        {/* Topics Grid */}
        <View style={styles.topicsGrid}>
          {PREDEFINED_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicCard,
                selectedTopic === topic.id && styles.topicCardSelected,
              ]}
              onPress={() => handleTopicSelect(topic.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.topicIconContainer,
                  { backgroundColor: `${topic.color}15` },
                ]}
              >
                <Ionicons name={topic.icon} size={28} color={topic.color} />
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>
              {selectedTopic === topic.id && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Topic Note (for future implementation) */}
        <View style={styles.customTopicNote}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <Text style={styles.customTopicText}>
            Custom topics coming soon! Create your own conversation topics.
          </Text>
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
  topicsGrid: {
    gap: 12,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topicCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
  },
  topicIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
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
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: 12,
  },
  customTopicNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  customTopicText: {
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

export default TopicSelectionScreen;
