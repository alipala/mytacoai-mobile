import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function NewsDetailScreen({ route, navigation }: any) {
  const { newsId, title, recommendedLevel, availableLanguages } = route.params;

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedLevel, setSelectedLevel] = useState(recommendedLevel || 'B1');
  const [newsContent, setNewsContent] = useState<NewsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [switchingVariation, setSwitchingVariation] = useState(false);
  const [vocabularyExpanded, setVocabularyExpanded] = useState(false);

  useEffect(() => {
    fetchNewsContent();
  }, [selectedLanguage, selectedLevel]);

  const fetchNewsContent = async () => {
    try {
      // Only show full loading on initial load, use subtle indicator for switching
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
      const token = await AsyncStorage.getItem('auth_token');

      console.log('[NEWS_DETAIL] 🚀 Starting news conversation');
      console.log('[NEWS_DETAIL] News ID:', newsId);
      console.log('[NEWS_DETAIL] Language:', selectedLanguage);
      console.log('[NEWS_DETAIL] Level:', selectedLevel);

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

      console.log('[NEWS_DETAIL] ✅ Received conversation context');
      console.log('[NEWS_DETAIL] Context keys:', Object.keys(conversation_context || {}));
      console.log('[NEWS_DETAIL] Context preview:', JSON.stringify(conversation_context).substring(0, 200));

      // Navigate to conversation screen with news context
      navigation.navigate('ConversationScreen', {
        sessionType: 'news',
        sessionId: session_id,
        newsContext: conversation_context,
        language: selectedLanguage,
        level: selectedLevel,
        newsTitle: newsContent?.original.title,
        newsUrl: newsContent?.original.url,
      });

      console.log('[NEWS_DETAIL] 📱 Navigated to ConversationScreen with sessionType=news');
    } catch (err: any) {
      console.error('[NEWS_DETAIL] ❌ Error starting conversation:', err);
      Alert.alert('Error', err.message || 'Failed to start conversation');
    }
  };

  const renderLanguageSelector = () => (
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
            onPress={() => setSelectedLanguage(lang)}
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
  );

  const renderLevelSelector = () => (
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
            onPress={() => setSelectedLevel(lvl)}
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
  );

  const renderVocabulary = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setVocabularyExpanded(!vocabularyExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>
          Key Vocabulary ({newsContent?.vocabulary.length || 0} words)
        </Text>
        <Ionicons
          name={vocabularyExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#6B7280"
        />
      </TouchableOpacity>

      {vocabularyExpanded && (
        <View style={styles.vocabularyList}>
          {newsContent?.vocabulary.map((item, index) => (
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
  );

  const renderDiscussionQuestions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>We'll Discuss:</Text>
      {newsContent?.discussion_questions.map((question, index) => (
        <View key={index} style={styles.questionItem}>
          <Ionicons name="chatbubble-outline" size={20} color="#06B6D4" />
          <Text style={styles.questionText}>{question}</Text>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06B6D4" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!newsContent) {
    return null;
  }

  // Helper function to get category color
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

  const categoryColor = getCategoryColor(newsContent.original.category);

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle loading overlay when switching variations */}
      {switchingVariation && (
        <View style={styles.switchingOverlay}>
          <ActivityIndicator size="small" color={categoryColor} />
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image with Gradient Overlay and Back Button */}
        <View style={styles.heroContainer}>
          {newsContent.original.image_url ? (
            <Image source={{ uri: newsContent.original.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Ionicons name="newspaper-outline" size={60} color="#9CA3AF" />
            </View>
          )}
          {/* Dark gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Back button on image */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Category badge on image */}
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
        {renderLanguageSelector()}

        {/* Level Selector */}
        {renderLevelSelector()}

        {/* Adapted Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{newsContent.summary}</Text>
          <Text style={styles.wordCount}>{newsContent.word_count} words</Text>
        </View>

        {/* Vocabulary */}
        {renderVocabulary()}

        {/* Discussion Questions */}
        {renderDiscussionQuestions()}

        {/* Original Article Link */}
        <TouchableOpacity
          style={styles.originalLinkButton}
          onPress={async () => {
            if (!newsContent.original.url) {
              Alert.alert('Error', 'Article link not available');
              return;
            }

            try {
              // Validate URL before opening
              const canOpen = await Linking.canOpenURL(newsContent.original.url);

              if (!canOpen) {
                Alert.alert(
                  'Link Unavailable',
                  'This article link is not accessible. You can still practice with the summary above!',
                  [{ text: 'OK' }]
                );
                return;
              }

              // Show confirmation and open
              Alert.alert('Original Article', 'Open in browser?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open',
                  onPress: async () => {
                    try {
                      await Linking.openURL(newsContent.original.url);
                    } catch (err) {
                      Alert.alert(
                        'Error',
                        'Could not open article. The link may be broken or restricted.',
                        [{ text: 'OK' }]
                      );
                    }
                  },
                },
              ]);
            } catch (err) {
              Alert.alert(
                'Error',
                'Could not validate article link',
                [{ text: 'OK' }]
              );
            }
          }}
        >
          <Text style={styles.originalLinkText}>Read Original Article</Text>
          <Ionicons name="open-outline" size={20} color="#06B6D4" />
        </TouchableOpacity>
      </ScrollView>

      {/* Start Conversation Button (Fixed at bottom) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartConversation}>
          <Ionicons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start 5-Minute Conversation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#E5E7EB',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  heroCategoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  source: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 20,
  },
  selectorContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  recommendedBadge: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06B6D4',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#06B6D4',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  wordCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  vocabularyList: {
    marginTop: 12,
  },
  vocabularyItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vocabularyWord: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  vocabularyTranslation: {
    fontSize: 14,
    color: '#06B6D4',
  },
  vocabularyExample: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  vocabularyIPA: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  originalLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 12,
    gap: 8,
  },
  originalLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06B6D4',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  switchingOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
});
