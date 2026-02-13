import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnglishFlag from '../assets/flags/english.svg';
import SpanishFlag from '../assets/flags/spanish.svg';
import DutchFlag from '../assets/flags/dutch.svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VocabularyItem {
  word: string;
  translation?: string;
  example: string;
  ipa?: string;
}

interface NewsContent {
  news_id: string;
  language: string;
  level: string;
  original: {
    title: string;
    url: string;
    source: string;
    image_url?: string;
    category: string;
  };
  summary: string;
  vocabulary: VocabularyItem[];
  discussion_questions: string[];
  ai_instructions: string;
  word_count: number;
}

interface NewsDetailModalProps {
  visible: boolean;
  newsId: string;
  title: string;
  recommendedLevel: string;
  availableLanguages: string[];
  categoryColor: string;
  onClose: () => void;
  onStartConversation: (params: {
    sessionId: string;
    newsContext: any;
    language: string;
    level: string;
    newsTitle: string;
    newsUrl: string;
  }) => void;
}

const LANGUAGE_FLAGS: { [key: string]: React.FC<any> } = {
  en: EnglishFlag,
  es: SpanishFlag,
  nl: DutchFlag,
};

const LEVEL_NAMES: { [key: string]: string } = {
  A2: 'A2 - Elementary',
  B1: 'B1 - Intermediate',
  B2: 'B2 - Upper Intermediate',
};

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  visible,
  newsId,
  title,
  recommendedLevel,
  availableLanguages,
  categoryColor,
  onClose,
  onStartConversation,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedLevel, setSelectedLevel] = useState(recommendedLevel || 'B1');
  const [newsContent, setNewsContent] = useState<NewsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [switchingVariation, setSwitchingVariation] = useState(false);
  const [vocabularyExpanded, setVocabularyExpanded] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchNewsContent();
    }
  }, [visible, selectedLanguage, selectedLevel]);

  const fetchNewsContent = async () => {
    try {
      if (!newsContent) {
        setLoading(true);
      } else {
        setSwitchingVariation(true);
      }

      const token = await AsyncStorage.getItem('auth_token');
      const url = `${API_BASE_URL}/api/news/${newsId}/content?language=${selectedLanguage}&level=${selectedLevel}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load content');
      }

      const data = await response.json();
      setNewsContent(data);
    } catch (err: any) {
      console.error('Error fetching news content:', err);
      Alert.alert('Error', err.message || 'Failed to load content');
    } finally {
      setLoading(false);
      setSwitchingVariation(false);
    }
  };

  const handleStartConversation = async () => {
    try {
      setStartingConversation(true);

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const token = await AsyncStorage.getItem('auth_token');

      console.log('[NEWS_MODAL] 🚀 Starting news conversation');
      console.log('[NEWS_MODAL] News ID:', newsId);
      console.log('[NEWS_MODAL] Language:', selectedLanguage);
      console.log('[NEWS_MODAL] Level:', selectedLevel);

      const response = await fetch(`${API_BASE_URL}/api/news/start-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          news_id: newsId,
          language: selectedLanguage,
          level: selectedLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start conversation');
      }

      const data = await response.json();
      const { session_id, conversation_context } = data;

      console.log('[NEWS_MODAL] ✅ Received conversation context');

      // Close modal and start conversation
      onClose();

      onStartConversation({
        sessionId: session_id,
        newsContext: conversation_context,
        language: selectedLanguage,
        level: selectedLevel,
        newsTitle: newsContent?.original.title || title,
        newsUrl: newsContent?.original.url || '',
      });

      console.log('[NEWS_MODAL] 📱 Started conversation from modal');
    } catch (err: any) {
      console.error('[NEWS_MODAL] ❌ Error starting conversation:', err);
      Alert.alert('Error', err.message || 'Failed to start conversation');
    } finally {
      setStartingConversation(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header with Close Button - On colored background */}
          <View style={[styles.modalHeader, { backgroundColor: categoryColor }]}>
            <Text style={styles.modalHeaderTitle}>News Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={categoryColor} />
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          ) : newsContent ? (
            <>
              {/* Subtle loading overlay when switching variations */}
              {switchingVariation && (
                <View style={styles.switchingOverlay}>
                  <ActivityIndicator size="small" color={categoryColor} />
                </View>
              )}

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Hero Image with Category Badge - Colored Background */}
                <View style={[styles.heroContainer, { backgroundColor: categoryColor }]}>
                  {newsContent.original.image_url ? (
                    <Image source={{ uri: newsContent.original.image_url }} style={styles.heroImage} />
                  ) : (
                    <View style={[styles.heroImage, styles.placeholderImage]}>
                      <Ionicons name="newspaper-outline" size={48} color="rgba(255, 255, 255, 0.4)" />
                    </View>
                  )}
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroCategoryBadge}>
                    <Text style={styles.heroCategoryText}>
                      {newsContent.original.category.charAt(0).toUpperCase() + newsContent.original.category.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Title and Meta Info */}
                <View style={styles.contentContainer}>
                  <Text style={styles.title}>{newsContent.original.title}</Text>

                  {/* Stats Bar */}
                  <View style={[styles.statsBar, {
                    backgroundColor: `${categoryColor}15`,
                    borderColor: `${categoryColor}33`,
                  }]}>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={16} color={categoryColor} />
                      <Text style={styles.statText}>~3 min read</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: `${categoryColor}4D` }]} />
                    <View style={styles.statItem}>
                      <Ionicons name="library-outline" size={16} color={categoryColor} />
                      <Text style={styles.statText}>{newsContent.vocabulary.length} words</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: `${categoryColor}4D` }]} />
                    <View style={styles.statItem}>
                      <Ionicons name="school-outline" size={16} color={categoryColor} />
                      <Text style={styles.statText}>{selectedLevel}</Text>
                    </View>
                  </View>

                  <Text style={styles.source}>By {newsContent.original.source}</Text>
                </View>

                {/* Language Selector */}
                <View style={[styles.selectorContainer, { borderTopColor: `${categoryColor}26` }]}>
                  <Text style={[styles.selectorLabel, { color: categoryColor }]}>Language</Text>
                  <View style={styles.flagOptionsContainer}>
                    {availableLanguages.map((lang: string) => {
                      const FlagComponent = LANGUAGE_FLAGS[lang];
                      return (
                        <TouchableOpacity
                          key={lang}
                          style={[
                            styles.flagButton,
                            selectedLanguage === lang && {
                              shadowColor: categoryColor,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.6,
                              shadowRadius: 16,
                              elevation: 8,
                            },
                          ]}
                          onPress={() => {
                            if (Platform.OS === 'ios') {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            setSelectedLanguage(lang);
                          }}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              styles.flagImage,
                              selectedLanguage === lang && {
                                borderColor: categoryColor,
                                borderWidth: 3,
                              }
                            ]}
                          >
                            {FlagComponent && <FlagComponent width={56} height={40} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Level Selector */}
                <View style={[styles.selectorContainer, { borderTopColor: `${categoryColor}26` }]}>
                  <Text style={[styles.selectorLabel, { color: categoryColor }]}>
                    Proficiency Level
                    {selectedLevel === recommendedLevel && (
                      <Text style={[styles.recommendedBadge, { color: categoryColor }]}> • Recommended</Text>
                    )}
                  </Text>
                  <View style={styles.optionsContainer}>
                    {['A2', 'B1', 'B2'].map((lvl) => (
                      <TouchableOpacity
                        key={lvl}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: `${categoryColor}14`,
                            borderColor: `${categoryColor}33`,
                          },
                          selectedLevel === lvl && [
                            styles.optionButtonActive,
                            {
                              borderColor: categoryColor,
                              backgroundColor: `${categoryColor}33`,
                              shadowColor: categoryColor,
                            }
                          ],
                        ]}
                        onPress={() => {
                          if (Platform.OS === 'ios') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          setSelectedLevel(lvl);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedLevel === lvl && [styles.optionTextActive, { color: categoryColor }],
                          ]}
                        >
                          {lvl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Summary */}
                <View style={[styles.section, { borderTopColor: `${categoryColor}26` }]}>
                  <Text style={[styles.sectionTitle, { color: categoryColor }]}>Summary</Text>
                  <Text style={styles.summaryText}>{newsContent.summary}</Text>
                  <Text style={styles.wordCount}>{newsContent.word_count} words</Text>
                </View>

                {/* Vocabulary */}
                <View style={[styles.section, { borderTopColor: `${categoryColor}26` }]}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setVocabularyExpanded(!vocabularyExpanded);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sectionTitle, { color: categoryColor }]}>
                      Key Vocabulary ({newsContent.vocabulary.length} words)
                    </Text>
                    <Ionicons
                      name={vocabularyExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={categoryColor}
                    />
                  </TouchableOpacity>

                  {vocabularyExpanded && (
                    <View style={styles.vocabularyList}>
                      {newsContent.vocabulary.map((item, index) => (
                        <View key={index} style={[
                          styles.vocabularyItem,
                          {
                            borderLeftColor: categoryColor,
                            backgroundColor: `${categoryColor}14`,
                            borderColor: `${categoryColor}33`,
                          }
                        ]}>
                          <View style={styles.vocabularyHeader}>
                            <Text style={styles.vocabularyWord}>{item.word}</Text>
                            {item.translation && (
                              <Text style={[styles.vocabularyTranslation, { color: categoryColor }]}>
                                {item.translation}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.vocabularyExample}>"{item.example}"</Text>
                          {item.ipa && (
                            <Text style={styles.vocabularyIPA}>{item.ipa}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Discussion Questions */}
                <View style={[styles.section, { borderTopColor: `${categoryColor}26` }]}>
                  <Text style={[styles.sectionTitle, { color: categoryColor }]}>We'll Discuss:</Text>
                  {newsContent.discussion_questions.map((question, index) => (
                    <View key={index} style={styles.questionItem}>
                      <Ionicons name="chatbubble-outline" size={20} color={categoryColor} />
                      <Text style={styles.questionText}>{question}</Text>
                    </View>
                  ))}
                </View>

                {/* Spacer for footer */}
                <View style={{ height: 100 }} />
              </ScrollView>

              {/* Start Conversation Button (Fixed at bottom) */}
              <View style={[styles.footer, { borderTopColor: `${categoryColor}33` }]}>
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    {
                      backgroundColor: categoryColor,
                      shadowColor: categoryColor,
                    },
                    startingConversation && styles.startButtonDisabled,
                  ]}
                  onPress={handleStartConversation}
                  disabled={startingConversation}
                  activeOpacity={0.8}
                >
                  {startingConversation ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="mic" size={24} color="#FFFFFF" />
                      <Text style={styles.startButtonText}>Start 5-Minute Conversation</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#0B1A1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.92,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 0,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#0B1A1F',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B8A84',
    marginTop: 16,
  },
  switchingOverlay: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    position: 'relative',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroCategoryText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#1F2937',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#0B1A1F',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 16,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#B4E4DD',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 12,
  },
  source: {
    fontSize: 14,
    color: '#6B8A84',
    fontStyle: 'italic',
  },
  selectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    backgroundColor: '#0B1A1F',
  },
  selectorLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  recommendedBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flagOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  flagButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  flagImage: {
    width: 56,
    height: 40,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionButtonActive: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  optionTextActive: {
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    backgroundColor: '#0B1A1F',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#D1D5DB',
  },
  wordCount: {
    fontSize: 13,
    color: '#6B8A84',
    marginTop: 10,
  },
  vocabularyList: {
    marginTop: 12,
    gap: 12,
  },
  vocabularyItem: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  vocabularyWord: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  vocabularyTranslation: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  vocabularyExample: {
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 22,
  },
  vocabularyIPA: {
    fontSize: 12,
    color: '#6B8A84',
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    backgroundColor: '#0B1A1F',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default NewsDetailModal;
