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

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  es: 'Spanish',
  nl: 'Dutch',
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      technology: '#3B82F6',
      science: '#8B5CF6',
      health: '#EC4899',
      sports: '#EF4444',
      environment: '#14B8A6',
      business: '#10B981',
      culture: '#F59E0B',
      entertainment: '#F43F5E',
      education: '#6366F1',
      politics: '#64748B',
      finance: '#059669',
      travel: '#0EA5E9',
      food: '#F97316',
      fashion: '#A855F7',
      automotive: '#71717A',
    };
    return colors[category.toLowerCase()] || '#6B7280';
  };

  const categoryColor = newsContent ? getCategoryColor(newsContent.original.category) : '#6B7280';

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

          {/* Header with Close Button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>News Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color="#1F2937" />
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
                {/* Hero Image with Category Badge */}
                <View style={styles.heroContainer}>
                  {newsContent.original.image_url ? (
                    <Image source={{ uri: newsContent.original.image_url }} style={styles.heroImage} />
                  ) : (
                    <View style={[styles.heroImage, styles.placeholderImage]}>
                      <Ionicons name="newspaper-outline" size={48} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.heroOverlay} />
                  <View style={[styles.heroCategoryBadge, { backgroundColor: categoryColor }]}>
                    <Text style={styles.heroCategoryText}>
                      {newsContent.original.category.charAt(0).toUpperCase() + newsContent.original.category.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Title and Meta Info */}
                <View style={styles.contentContainer}>
                  <Text style={styles.title}>{newsContent.original.title}</Text>

                  {/* Stats Bar */}
                  <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={16} color={categoryColor} />
                      <Text style={styles.statText}>~3 min read</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="library-outline" size={16} color={categoryColor} />
                      <Text style={styles.statText}>{newsContent.vocabulary.length} words</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="school-outline" size={16} color={categoryColor} />
                      <Text style={styles.statText}>{selectedLevel}</Text>
                    </View>
                  </View>

                  <Text style={styles.source}>By {newsContent.original.source}</Text>
                </View>

                {/* Language Selector */}
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Language</Text>
                  <View style={styles.optionsContainer}>
                    {availableLanguages.map((lang: string) => (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.optionButton,
                          selectedLanguage === lang && styles.optionButtonActive,
                        ]}
                        onPress={() => {
                          if (Platform.OS === 'ios') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          setSelectedLanguage(lang);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedLanguage === lang && styles.optionTextActive,
                          ]}
                        >
                          {LANGUAGE_NAMES[lang] || lang}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Level Selector */}
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>
                    Proficiency Level
                    {selectedLevel === recommendedLevel && (
                      <Text style={styles.recommendedBadge}> • Recommended</Text>
                    )}
                  </Text>
                  <View style={styles.optionsContainer}>
                    {['A2', 'B1', 'B2'].map((lvl) => (
                      <TouchableOpacity
                        key={lvl}
                        style={[
                          styles.optionButton,
                          selectedLevel === lvl && styles.optionButtonActive,
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
                            selectedLevel === lvl && styles.optionTextActive,
                          ]}
                        >
                          {lvl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Summary</Text>
                  <Text style={styles.summaryText}>{newsContent.summary}</Text>
                  <Text style={styles.wordCount}>{newsContent.word_count} words</Text>
                </View>

                {/* Vocabulary */}
                <View style={styles.section}>
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
                    <Text style={styles.sectionTitle}>
                      Key Vocabulary ({newsContent.vocabulary.length} words)
                    </Text>
                    <Ionicons
                      name={vocabularyExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {vocabularyExpanded && (
                    <View style={styles.vocabularyList}>
                      {newsContent.vocabulary.map((item, index) => (
                        <View key={index} style={styles.vocabularyItem}>
                          <View style={styles.vocabularyHeader}>
                            <Text style={styles.vocabularyWord}>{item.word}</Text>
                            {item.translation && (
                              <Text style={styles.vocabularyTranslation}>
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
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>We'll Discuss:</Text>
                  {newsContent.discussion_questions.map((question, index) => (
                    <View key={index} style={styles.questionItem}>
                      <Ionicons name="chatbubble-outline" size={20} color="#06B6D4" />
                      <Text style={styles.questionText}>{question}</Text>
                    </View>
                  ))}
                </View>

                {/* Spacer for footer */}
                <View style={{ height: 100 }} />
              </ScrollView>

              {/* Start Conversation Button (Fixed at bottom) */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.startButton,
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.92,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  switchingOverlay: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroCategoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 30,
    marginBottom: 12,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  source: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  selectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  recommendedBadge: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#06B6D4',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#06B6D4',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  wordCount: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  vocabularyList: {
    marginTop: 8,
    gap: 12,
  },
  vocabularyItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#06B6D4',
  },
  vocabularyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  vocabularyWord: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  vocabularyTranslation: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  vocabularyExample: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  vocabularyIPA: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default NewsDetailModal;
