import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DefaultService } from '../../api/generated';
import LoadingModal from '../../components/LoadingModal';
import { styles } from './styles/TopicSelectionScreen.styles';

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
  {
    id: 'custom',
    name: '✨ Create Your Own',
    description: 'Create a personalized topic for your conversation',
    icon: 'sparkles',
    color: '#4ECFBF',
  },
];

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showCustomTopicModal, setShowCustomTopicModal] = useState(false);
  const [customTopicText, setCustomTopicText] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const { mode, language } = route.params;

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;
  const sparkleAnim3 = useRef(new Animated.Value(0)).current;
  const sparkleAnim4 = useRef(new Animated.Value(0)).current;

  // Start animations on mount
  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle animations with staggered delays
    const createSparkleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createSparkleAnimation(sparkleAnim1, 0).start();
    createSparkleAnimation(sparkleAnim2, 250).start();
    createSparkleAnimation(sparkleAnim3, 500).start();
    createSparkleAnimation(sparkleAnim4, 750).start();
  }, []);

  const handleTopicSelect = (topicId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // If custom topic is selected, show modal
    if (topicId === 'custom') {
      setShowCustomTopicModal(true);
      return;
    }

    setSelectedTopic(topicId);
  };

  const handleCustomTopicSubmit = async () => {
    if (!customTopicText.trim()) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsResearching(true);
    setShowCustomTopicModal(false);

    try {
      console.log('🔍 Starting topic research for:', customTopicText);

      // Call the research endpoint
      const researchData = await DefaultService.researchCustomTopicApiCustomTopicResearchPost({
        language: language || 'english',
        level: 'A1', // Default level, will be updated in next screen
        user_prompt: customTopicText,
        topic: 'custom',
      });

      console.log('✅ Topic research completed:', researchData);

      // Navigate to Level Selection with research data
      navigation.navigate('LevelSelection', {
        mode,
        language,
        topic: 'custom',
        customTopicText: customTopicText,
        researchData: researchData,
      });
    } catch (error) {
      console.error('❌ Topic research failed:', error);
      Alert.alert(
        'Research Failed',
        'Unable to research your topic. Please try again or select a predefined topic.',
        [{ text: 'OK', onPress: () => setShowCustomTopicModal(true) }]
      );
    } finally {
      setIsResearching(false);
    }
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
        <Text style={styles.title}>Select a Topic</Text>

        {/* Custom Topic Card - Featured at Top */}
        <Animated.View
          style={[
            styles.customTopicCard,
            {
              transform: [
                { translateY: floatAnim },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={{ width: '100%' }}
            onPress={() => handleTopicSelect('custom')}
            activeOpacity={0.85}
          >
            {/* Animated gradient background */}
            <View style={styles.customTopicGradient}>
              {/* Gradient overlay effect */}
              <View style={styles.gradientOverlay} />
              {/* Sparkle decorations with animations */}
              <Animated.View
                style={[
                  styles.sparkleTopLeft,
                  {
                    opacity: sparkleAnim1,
                    transform: [
                      {
                        scale: sparkleAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="sparkles" size={20} color="#FFD63A" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkleTopRight,
                  {
                    opacity: sparkleAnim2,
                    transform: [
                      {
                        scale: sparkleAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="star" size={16} color="#FFA955" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkleBottomLeft,
                  {
                    opacity: sparkleAnim3,
                    transform: [
                      {
                        scale: sparkleAnim3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="star" size={14} color="#4ECFBF" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkleBottomRight,
                  {
                    opacity: sparkleAnim4,
                    transform: [
                      {
                        scale: sparkleAnim4.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="sparkles" size={18} color="#FFD63A" />
              </Animated.View>

            {/* Main icon */}
            <View style={styles.customTopicIconContainer}>
              <View style={styles.customTopicIconInner}>
                <Ionicons name="sparkles" size={48} color="#FFFFFF" />
              </View>
            </View>

            {/* Content */}
            <View style={styles.customTopicContent}>
              <View style={styles.customTopicBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.customTopicBadgeText}>POPULAR</Text>
              </View>
              <Text style={styles.customTopicTitle}>✨ Create Your Own Topic</Text>
              <Text style={styles.customTopicDescription}>
                Design a personalized conversation about anything you want to learn
              </Text>
            </View>

            {/* Arrow icon */}
            <View style={styles.customTopicArrow}>
              <Ionicons name="arrow-forward-circle" size={32} color="#FFFFFF" />
            </View>
          </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CHOOSE A TOPIC</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Topics Grid */}
        <View style={styles.topicsGrid}>
          {PREDEFINED_TOPICS.filter(topic => topic.id !== 'custom').map((topic) => (
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

      {/* Custom Topic Modal */}
      <Modal
        visible={showCustomTopicModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomTopicModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCustomTopicModal(false)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Your Topic</Text>
                <Text style={styles.modalSubtitle}>
                  What would you like to talk about?
                </Text>
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.textInput}
                placeholder="Describe your topic here..."
                placeholderTextColor="#9CA3AF"
                value={customTopicText}
                onChangeText={setCustomTopicText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowCustomTopicModal(false);
                    setCustomTopicText('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSubmitButton,
                    !customTopicText.trim() && styles.modalSubmitButtonDisabled,
                  ]}
                  onPress={handleCustomTopicSubmit}
                  disabled={!customTopicText.trim()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalSubmitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={isResearching}
        message="Your taalcoach knowledge is being extended. Hold on please!"
      />
    </SafeAreaView>
  );
};

export default TopicSelectionScreen;
