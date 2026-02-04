import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ConversationLoadingScreenProps {
  navigation: any;
  route: any;
}

const ConversationLoadingScreen: React.FC<ConversationLoadingScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { mode, language, topic, level, customTopicText, researchData } = route.params;
  const [loadingStep, setLoadingStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const loadingSteps = [
    { text: t('practice.loading_step_connecting', 'Connecting to AI tutor...'), icon: 'cloud-upload' },
    { text: t('practice.loading_step_preparing', 'Preparing conversation...'), icon: 'chatbubbles' },
    { text: t('practice.loading_step_voice', 'Setting up voice recognition...'), icon: 'mic' },
    { text: t('practice.loading_step_ready', 'Almost ready...'), icon: 'checkmark-circle' },
  ];

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200);

    // Navigate to conversation screen after all steps complete
    const navigationTimer = setTimeout(() => {
      navigation.replace('Conversation', {
        mode,
        language,
        topic,
        level,
        customTopicText,
        researchData,
      });
    }, 5000); // Total loading time: 5 seconds

    return () => {
      clearInterval(stepInterval);
      clearTimeout(navigationTimer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="chatbubble-ellipses" size={64} color="#14B8A6" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('practice.starting_conversation', 'Starting Your Conversation')}</Text>
        <Text style={styles.subtitle}>
          {t('practice.preparing_session', 'Preparing your {{language}} practice session...', {
            language: t(`practice.languages.${language}`, language)
          })}
        </Text>

        {/* Loading Spinner */}
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>

        {/* Loading Steps */}
        <View style={styles.stepsContainer}>
          {loadingSteps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepItem,
                index === loadingStep && styles.stepItemActive,
                index < loadingStep && styles.stepItemCompleted,
              ]}
            >
              <View
                style={[
                  styles.stepIcon,
                  index === loadingStep && styles.stepIconActive,
                  index < loadingStep && styles.stepIconCompleted,
                ]}
              >
                <Ionicons
                  name={index < loadingStep ? 'checkmark' : step.icon}
                  size={18}
                  color={
                    index < loadingStep
                      ? '#10B981'
                      : index === loadingStep
                      ? '#14B8A6'
                      : '#D1D5DB'
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepText,
                  index === loadingStep && styles.stepTextActive,
                  index < loadingStep && styles.stepTextCompleted,
                ]}
              >
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Session Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="language" size={18} color="#6B7280" />
            <Text style={styles.detailLabel}>{t('practice.conversation.label_language')}:</Text>
            <Text style={styles.detailValue}>
              {t(`practice.languages.${language}`, language.charAt(0).toUpperCase() + language.slice(1))}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="chatbubbles" size={18} color="#6B7280" />
            <Text style={styles.detailLabel}>{t('practice.conversation.label_topic')}:</Text>
            <Text style={styles.detailValue}>
              {topic === 'custom' && customTopicText
                ? customTopicText.length > 30
                  ? customTopicText.substring(0, 30) + '...'
                  : customTopicText
                : t(`practice.topics.${topic}`, topic.charAt(0).toUpperCase() + topic.slice(1))}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="bar-chart" size={18} color="#6B7280" />
            <Text style={styles.detailLabel}>{t('practice.conversation.label_level')}:</Text>
            <Text style={styles.detailValue}>{level}</Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  spinnerContainer: {
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  stepItemActive: {
    backgroundColor: '#F0FDFA',
  },
  stepItemCompleted: {
    opacity: 0.6,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepIconActive: {
    backgroundColor: '#CCFBF1',
  },
  stepIconCompleted: {
    backgroundColor: '#D1FAE5',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  stepTextActive: {
    color: '#1F2937',
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: '#6B7280',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
});

export default ConversationLoadingScreen;
