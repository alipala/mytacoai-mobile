import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LearningService } from '../api/generated';

interface CreateLearningPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (planData: { topic: string; focus: string; duration: string }) => void;
  language: string;
  recommendedLevel?: string;
  assessmentFocus?: string[];
}

interface OptionButton {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

const TOPICS: OptionButton[] = [
  { id: 'conversation', label: 'Conversation Skills', icon: 'chatbubbles', description: 'Daily communication and dialogue' },
  { id: 'business', label: 'Business Language', icon: 'briefcase', description: 'Professional and workplace communication' },
  { id: 'travel', label: 'Travel & Tourism', icon: 'airplane', description: 'Essential phrases for travelers' },
  { id: 'academic', label: 'Academic Language', icon: 'school', description: 'Formal and educational contexts' },
  { id: 'social', label: 'Social Interactions', icon: 'people', description: 'Casual conversations and social settings' },
];

const FOCUS_AREAS: OptionButton[] = [
  { id: 'speaking', label: 'Speaking', icon: 'mic' },
  { id: 'listening', label: 'Listening', icon: 'ear' },
  { id: 'grammar', label: 'Grammar', icon: 'create' },
  { id: 'vocabulary', label: 'Vocabulary', icon: 'book' },
  { id: 'pronunciation', label: 'Pronunciation', icon: 'volume-high' },
];

const DURATIONS: OptionButton[] = [
  { id: '2', label: '2 Weeks', description: 'Quick boost' },
  { id: '4', label: '1 Month', description: 'Standard pace' },
  { id: '8', label: '2 Months', description: 'Comprehensive' },
  { id: '12', label: '3 Months', description: 'In-depth mastery' },
];

export const CreateLearningPlanModal: React.FC<CreateLearningPlanModalProps> = ({
  visible,
  onClose,
  onCreate,
  language,
  recommendedLevel = 'intermediate',
  assessmentFocus = [],
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Pre-select focus based on assessment results
  React.useEffect(() => {
    if (assessmentFocus.length > 0 && !selectedFocus) {
      // Map common assessment areas to focus options
      const focusMap: Record<string, string> = {
        'pronunciation': 'pronunciation',
        'grammar': 'grammar',
        'vocabulary': 'vocabulary',
        'fluency': 'speaking',
        'coherence': 'speaking',
      };

      for (const area of assessmentFocus) {
        const areaLower = area.toLowerCase();
        for (const [key, value] of Object.entries(focusMap)) {
          if (areaLower.includes(key)) {
            setSelectedFocus(value);
            return;
          }
        }
      }
    }
  }, [assessmentFocus]);

  // Helper to format language name for display
  const formatLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'english': 'English',
      'spanish': 'Spanish',
      'french': 'French',
      'german': 'German',
      'dutch': 'Dutch',
      'portuguese': 'Portuguese',
    };
    return languageMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  // Helper to format level for display
  const formatLevel = (level: string): string => {
    const levelMap: Record<string, string> = {
      'beginner': 'Beginner',
      'elementary': 'Elementary',
      'intermediate': 'Intermediate',
      'upper-intermediate': 'Upper Intermediate',
      'advanced': 'Advanced',
      'proficient': 'Proficient',
    };
    return levelMap[level.toLowerCase()] || level.charAt(0).toUpperCase() + level.slice(1);
  };

  const handleCreatePlan = async () => {
    if (!selectedTopic || !selectedFocus || !selectedDuration) {
      Alert.alert('Incomplete', 'Please select all options to create your learning plan.');
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsCreating(true);

    try {
      // Create learning plan via API
      const planData = {
        language: language,
        proficiency_level: recommendedLevel,
        topic: selectedTopic,
        focus_area: selectedFocus,
        duration_weeks: parseInt(selectedDuration),
        goals: assessmentFocus.length > 0
          ? `Improve ${assessmentFocus.slice(0, 2).join(' and ')}`
          : `Master ${selectedFocus} skills`,
      };

      console.log('📤 Creating learning plan with data:', planData);
      console.log('📍 Language:', formatLanguage(language), '| Level:', formatLevel(recommendedLevel));

      await LearningService.createLearningPlanApiLearningPlanPost({
        requestBody: planData,
      });

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Success!',
        'Your personalized learning plan has been created.',
        [
          {
            text: 'Great!',
            onPress: () => {
              onCreate({
                topic: selectedTopic,
                focus: selectedFocus,
                duration: selectedDuration,
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating learning plan:', error);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert(
        'Error',
        error.message || 'Failed to create learning plan. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const renderOption = (
    option: OptionButton,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {option.icon && (
        <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
          <Ionicons
            name={option.icon as any}
            size={24}
            color={isSelected ? '#4FD1C5' : '#6B7280'}
          />
        </View>
      )}
      <View style={styles.optionInfo}>
        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
          {option.label}
        </Text>
        {option.description && (
          <Text style={styles.optionDescription}>{option.description}</Text>
        )}
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color="#4FD1C5" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Create Learning Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isCreating}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Customize Your Learning Journey</Text>
            <Text style={styles.introText}>
              Creating a <Text style={styles.highlight}>{formatLanguage(language)}</Text> learning plan at{' '}
              <Text style={styles.highlight}>{formatLevel(recommendedLevel)}</Text> level.
              Choose your preferences below to personalize your plan.
            </Text>
          </View>

          {/* Topic Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Choose Your Topic</Text>
            <View style={styles.optionsContainer}>
              {TOPICS.map((topic) =>
                renderOption(topic, selectedTopic === topic.id, () => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedTopic(topic.id);
                })
              )}
            </View>
          </View>

          {/* Focus Area Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Select Your Focus Area</Text>
            {assessmentFocus.length > 0 && (
              <View style={styles.suggestionBadge}>
                <Ionicons name="bulb" size={16} color="#F59E0B" />
                <Text style={styles.suggestionText}>
                  Recommended based on your assessment
                </Text>
              </View>
            )}
            <View style={styles.optionsContainer}>
              {FOCUS_AREAS.map((focus) =>
                renderOption(focus, selectedFocus === focus.id, () => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedFocus(focus.id);
                })
              )}
            </View>
          </View>

          {/* Duration Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Choose Duration</Text>
            <View style={styles.optionsContainer}>
              {DURATIONS.map((duration) =>
                renderOption(duration, selectedDuration === duration.id, () => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedDuration(duration.id);
                })
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!selectedTopic || !selectedFocus || !selectedDuration || isCreating) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreatePlan}
            disabled={!selectedTopic || !selectedFocus || !selectedDuration || isCreating}
            activeOpacity={0.8}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.createButtonText}>Create My Learning Plan</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
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
  introSection: {
    backgroundColor: '#E6FFFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '600',
    color: '#4FD1C5',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4FD1C5',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconSelected: {
    backgroundColor: '#E6FFFA',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  optionLabelSelected: {
    color: '#1F2937',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  checkmark: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
