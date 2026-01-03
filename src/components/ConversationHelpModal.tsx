import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { ConversationHelpResponse } from '../api/generated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// UI text translations
const getUIText = (language: string) => {
  const texts: Record<string, any> = {
    english: {
      conversationHelp: 'Conversation Help',
      whatAiSaid: 'What the AI said:',
      suggestedResponses: 'Suggested responses:',
      keyVocabulary: 'Key vocabulary:',
      grammarTips: 'Grammar tips:',
      culturalNote: 'Cultural note:',
      generatingHelp: 'Generating Help',
      analyzing: 'AI is analyzing the conversation...',
      creating: 'Creating suggestions for you',
      tapToSelect: 'Tap to use this response',
      close: 'Close',
      enableHelp: 'Enable Help',
      tapMicToSpeak: 'Tap microphone to speak',
      readyToRespond: 'Ready to respond?',
    },
    spanish: {
      conversationHelp: 'Ayuda de Conversación',
      whatAiSaid: 'Lo que dijo la IA:',
      suggestedResponses: 'Respuestas sugeridas:',
      keyVocabulary: 'Vocabulario clave:',
      grammarTips: 'Consejos de gramática:',
      culturalNote: 'Nota cultural:',
      generatingHelp: 'Generando Ayuda',
      analyzing: 'La IA está analizando...',
      creating: 'Creando sugerencias',
      tapToSelect: 'Toca para usar esta respuesta',
      close: 'Cerrar',
    },
    french: {
      conversationHelp: 'Aide à la Conversation',
      whatAiSaid: "Ce que l'IA a dit:",
      suggestedResponses: 'Réponses suggérées:',
      keyVocabulary: 'Vocabulaire clé:',
      grammarTips: 'Conseils grammaticaux:',
      culturalNote: 'Note culturelle:',
      generatingHelp: "Génération d'Aide",
      analyzing: "L'IA analyse...",
      creating: 'Création de suggestions',
      tapToSelect: 'Appuyez pour utiliser',
      close: 'Fermer',
    },
    german: {
      conversationHelp: 'Gesprächshilfe',
      whatAiSaid: 'Was die KI gesagt hat:',
      suggestedResponses: 'Vorgeschlagene Antworten:',
      keyVocabulary: 'Wichtige Vokabeln:',
      grammarTips: 'Grammatik-Tipps:',
      culturalNote: 'Kulturelle Notiz:',
      generatingHelp: 'Hilfe generieren',
      analyzing: 'KI analysiert...',
      creating: 'Vorschläge erstellen',
      tapToSelect: 'Tippen zum Verwenden',
      close: 'Schließen',
    },
    italian: {
      conversationHelp: 'Aiuto Conversazione',
      whatAiSaid: "Quello che ha detto l'IA:",
      suggestedResponses: 'Risposte suggerite:',
      keyVocabulary: 'Vocabolario chiave:',
      grammarTips: 'Suggerimenti grammaticali:',
      culturalNote: 'Nota culturale:',
      generatingHelp: 'Generazione Aiuto',
      analyzing: "L'IA sta analizzando...",
      creating: 'Creazione suggerimenti',
      tapToSelect: 'Tocca per usare',
      close: 'Chiudi',
    },
    portuguese: {
      conversationHelp: 'Ajuda de Conversa',
      whatAiSaid: 'O que a IA disse:',
      suggestedResponses: 'Respostas sugeridas:',
      keyVocabulary: 'Vocabulário chave:',
      grammarTips: 'Dicas de gramática:',
      culturalNote: 'Nota cultural:',
      generatingHelp: 'Gerando Ajuda',
      analyzing: 'IA está analisando...',
      creating: 'Criando sugestões',
      tapToSelect: 'Toque para usar',
      close: 'Fechar',
    },
    dutch: {
      conversationHelp: 'Gesprekshulp',
      whatAiSaid: 'Wat de AI zei:',
      suggestedResponses: 'Voorgestelde antwoorden:',
      keyVocabulary: 'Belangrijke woordenschat:',
      grammarTips: 'Grammatica tips:',
      culturalNote: 'Culturele opmerking:',
      generatingHelp: 'Hulp Genereren',
      analyzing: 'AI analyseert...',
      creating: 'Suggesties maken',
      tapToSelect: 'Tik om te gebruiken',
      close: 'Sluiten',
    },
    turkish: {
      conversationHelp: 'Konuşma Yardımı',
      whatAiSaid: "AI'nın söylediği:",
      suggestedResponses: 'Önerilen yanıtlar:',
      keyVocabulary: 'Anahtar kelimeler:',
      grammarTips: 'Dilbilgisi ipuçları:',
      culturalNote: 'Kültürel not:',
      generatingHelp: 'Yardım Oluşturuluyor',
      analyzing: 'AI analiz ediyor...',
      creating: 'Öneriler oluşturuluyor',
      tapToSelect: 'Kullanmak için dokun',
      close: 'Kapat',
    },
  };

  return texts[language] || texts.english;
};

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

  const uiText = getUIText(helpLanguage);

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
              <Text style={styles.title}>{uiText.conversationHelp}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748B" />
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
                <Text style={styles.loadingTitle}>{uiText.generatingHelp}</Text>
                <Text style={styles.loadingSubtitle}>{uiText.analyzing}</Text>
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
                {/* AI Response Summary - No title, just content */}
                {helpData?.ai_response_summary && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>{helpData.ai_response_summary}</Text>
                  </View>
                )}

                {/* Suggested Responses */}
                {helpData?.suggested_responses && helpData.suggested_responses.length > 0 && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => toggleSection('responses')}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.sectionTitle}>{uiText.suggestedResponses}</Text>
                      <Ionicons
                        name={expandedSections.has('responses') ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#64748B"
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
                      <Text style={styles.sectionTitle}>{uiText.keyVocabulary}</Text>
                      <Ionicons
                        name={expandedSections.has('vocabulary') ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#64748B"
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
                      <Text style={styles.sectionTitle}>{uiText.grammarTips}</Text>
                      <Ionicons
                        name={expandedSections.has('grammar') ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#64748B"
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
                      <Text style={styles.sectionTitle}>{uiText.culturalNote}</Text>
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

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  inlineContainer: {
    width: SCREEN_WIDTH - 32, // Account for conversation padding
    minHeight: 300, // Ensure minimum height
    maxHeight: SCREEN_HEIGHT * 0.6, // Give more space
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // All corners rounded
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden', // Hide overflow for rounded corners
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 18,
    paddingTop: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  contentContainer: {
    paddingBottom: 4,
  },
  section: {
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  responsesContainer: {
    gap: 14,
    marginTop: 4,
  },
  responseCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 16,
    paddingLeft: 22,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    minHeight: 85,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  responseCardFirst: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FEFEFE',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
      },
    }),
  },
  responseNumberBadge: {
    position: 'absolute',
    top: -8,
    left: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  responseNumberBadgeFirst: {
    backgroundColor: '#8B5CF6',
  },
  responseNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  responseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  pronunciationButton: {
    padding: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
  },
  vocabularyContainer: {
    gap: 12,
  },
  vocabularyCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  vocabularyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vocabularyWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9A3412',
  },
  vocabularyDefinition: {
    fontSize: 14,
    color: '#9A3412',
    marginBottom: 8,
  },
  vocabularyExample: {
    fontSize: 13,
    color: '#C2410C',
    fontStyle: 'italic',
  },
  grammarContainer: {
    gap: 12,
  },
  grammarCard: {
    backgroundColor: '#FAF5FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  grammarPattern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B21A8',
    marginBottom: 8,
  },
  grammarExplanation: {
    fontSize: 14,
    color: '#7C3AED',
    marginBottom: 8,
  },
  grammarExample: {
    fontSize: 13,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
  culturalCard: {
    backgroundColor: '#FDF2F8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  culturalText: {
    fontSize: 14,
    color: '#9F1239',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
  },
  debugInfo: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
});

export default ConversationHelpModal;
