import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Platform,
  Switch,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { ConversationHelpResponse } from '../api/generated';
import { styles, SCREEN_WIDTH, SCREEN_HEIGHT } from './styles/ConversationHelpModal.styles';

interface ConversationHelpModalProps {
  visible: boolean;
  helpData: ConversationHelpResponse | null;
  isLoading: boolean;
  targetLanguage: string;
  helpLanguage: string;
  helpEnabled: boolean;
  onClose: () => void;
  onSelectResponse?: (responseText: string) => void;
  onToggleHelp?: (enabled: boolean) => void;
  variant?: 'modal' | 'inline'; // NEW: Support inline rendering
}

// UI text translations are now handled by i18n system

const ConversationHelpModal: React.FC<ConversationHelpModalProps> = ({
  visible,
  helpData,
  isLoading,
  targetLanguage,
  helpLanguage,
  helpEnabled,
  onClose,
  onSelectResponse,
  onToggleHelp,
  variant = 'modal', // Default to modal behavior
}) => {
  const { t } = useTranslation();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['responses']));
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const micPulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance and exit animations
  useEffect(() => {
    if (visible) {
      // Modal variant - scale animation
      if (variant === 'modal') {
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      } else {
        // Inline variant - fade + slide animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]).start();
      }

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Start microphone pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(micPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations when closing
      if (variant === 'modal') {
        scaleAnim.setValue(0);
      } else {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
      }
      micPulseAnim.setValue(1);
    }
  }, [visible, variant]);

  // Loading dots animation
  useEffect(() => {
    if (isLoading) {
      const animations = dotAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.timing(anim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        )
      );

      animations.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
      };
    }
  }, [isLoading]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const playPronunciation = async (text: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:text/plain,${text}` },
        { shouldPlay: true }
      );

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('[CONVERSATION_HELP] Error playing pronunciation:', error);
    }
  };

  const handleSelectResponse = (responseText: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (onSelectResponse) {
      onSelectResponse(responseText);
    }

    onClose();
  };

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  // Content component (can be wrapped in Modal or rendered inline)
  const HelpContent = (
    <Animated.View
      style={[
        variant === 'inline' ? styles.inlineContainer : styles.modalContainer,
        variant === 'modal' ? {
          transform: [{ scale: scaleAnim }],
        } : {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.title}>{t('practice.conversation.help.conversation_help')}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
            scrollEnabled={true}
          >
            {isLoading ? (
              /* Loading State */
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIconContainer}>
                  <Ionicons name="sparkles" size={32} color="#8B5CF6" />
                </View>
                <Text style={styles.loadingTitle}>{t('practice.conversation.help.generating_help')}</Text>
                <Text style={styles.loadingSubtitle}>{t('practice.conversation.help.analyzing')}</Text>
                <View style={styles.dotsContainer}>
                  {dotAnimations.map((anim, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          opacity: anim,
                          transform: [
                            {
                              translateY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -10],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            ) : helpData ? (
              /* Help Content */
              <View style={styles.contentContainer}>
                {/* AI Response Summary - REMOVED to save space for immersive design */}
                {/* User can see the AI message directly above in conversation */}

                {/* Suggested Responses */}
                {helpData?.suggested_responses && helpData.suggested_responses.length > 0 && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => toggleSection('responses')}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.sectionTitle}>{t('practice.conversation.help.suggested_responses')}</Text>
                      <Ionicons
                        name={expandedSections.has('responses') ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#B4E4DD"
                      />
                    </TouchableOpacity>

                    {expandedSections.has('responses') && (
                      <View style={styles.responsesContainer}>
                        {helpData.suggested_responses?.map((response, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.responseCard,
                              index === 0 && styles.responseCardFirst,
                            ]}
                            onPress={() => handleSelectResponse(response.text || '')}
                            activeOpacity={0.8}
                          >
                            <View style={[
                              styles.responseNumberBadge,
                              index === 0 && styles.responseNumberBadgeFirst,
                            ]}>
                              <Text style={styles.responseNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.responseText}>{response.text}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Vocabulary Highlights */}
                {helpData?.vocabulary_highlights && helpData.vocabulary_highlights.length > 0 && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => toggleSection('vocabulary')}
                    >
                      <Ionicons name="book-outline" size={18} color="#F59E0B" />
                      <Text style={styles.sectionTitle}>{t('practice.conversation.help.key_vocabulary')}</Text>
                      <Ionicons
                        name={expandedSections.has('vocabulary') ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#B4E4DD"
                      />
                    </TouchableOpacity>

                    {expandedSections.has('vocabulary') && (
                      <View style={styles.vocabularyContainer}>
                        {helpData.vocabulary_highlights?.slice(0, 3).map((vocab, index) => (
                          <View key={index} style={styles.vocabularyCard}>
                            <View style={styles.vocabularyHeader}>
                              <Text style={styles.vocabularyWord}>{vocab.word}</Text>
                              <TouchableOpacity
                                onPress={() => playPronunciation(vocab.word || '')}
                                style={styles.pronunciationButton}
                              >
                                <Ionicons name="volume-medium" size={16} color="#F59E0B" />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.vocabularyDefinition}>{vocab.definition}</Text>
                            {vocab.example_sentence && (
                              <Text style={styles.vocabularyExample}>"{vocab.example_sentence}"</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Grammar Tips */}
                {helpData?.grammar_tips && helpData.grammar_tips.length > 0 && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => toggleSection('grammar')}
                    >
                      <Ionicons name="school-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.sectionTitle}>{t('practice.conversation.help.grammar_tips')}</Text>
                      <Ionicons
                        name={expandedSections.has('grammar') ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#B4E4DD"
                      />
                    </TouchableOpacity>

                    {expandedSections.has('grammar') && (
                      <View style={styles.grammarContainer}>
                        {helpData.grammar_tips?.map((tip, index) => (
                          <View key={index} style={styles.grammarCard}>
                            <Text style={styles.grammarPattern}>{tip.pattern}</Text>
                            <Text style={styles.grammarExplanation}>{tip.explanation}</Text>
                            {tip.example && (
                              <Text style={styles.grammarExample}>Example: {tip.example}</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Cultural Context */}
                {helpData?.cultural_context && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="globe-outline" size={18} color="#EC4899" />
                      <Text style={styles.sectionTitle}>{t('practice.conversation.help.cultural_note')}</Text>
                    </View>
                    <View style={styles.culturalCard}>
                      <Text style={styles.culturalText}>{helpData.cultural_context?.explanation}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              /* No Content State */
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No help content available</Text>
              </View>
            )}
          </ScrollView>
    </Animated.View>
  );

  // Return based on variant
  if (variant === 'inline') {
    return visible ? HelpContent : null;
  }

  // Modal variant (default)
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // Prevent automatic closing - only X button can close
    >
      <View style={styles.blurContainer} pointerEvents="box-none">
        <BlurView intensity={80} style={StyleSheet.absoluteFill} pointerEvents="none" />
        {HelpContent}
      </View>
    </Modal>
  );
};

export default ConversationHelpModal;

