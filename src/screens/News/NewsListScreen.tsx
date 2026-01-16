import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsDetailModal from '../../components/NewsDetailModal';
import TransitionWrapper from '../../components/TransitionWrapper';

interface NewsArticle {
  id: string;
  title: string;
  image_url?: string;
  category: string;
  source: string;
  article_index: number;
}

interface NewsList {
  date: string;
  articles: NewsArticle[];
  recommended_level: string;
  fallback_used: boolean;
  available_languages: string[];
}

// Animated Arrow Component
const AnimatedArrowPrompt = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  const translateX = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <View style={styles.arrowPrompt}>
      <Text style={styles.arrowPromptText}>Tap to read & discuss</Text>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Ionicons name="arrow-forward-circle" size={28} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
};

export default function NewsListScreen({ navigation }: any) {
  const [newsData, setNewsData] = useState<NewsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/api/news/today`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load news');
      }

      const data = await response.json();
      setNewsData(data);
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleArticlePress = (article: NewsArticle) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedArticle(null);
  };

  const handleStartConversation = (params: {
    sessionId: string;
    newsContext: any;
    language: string;
    level: string;
    newsTitle: string;
    newsUrl: string;
  }) => {
    // Close modal first
    setModalVisible(false);
    setSelectedArticle(null);

    // Navigate to conversation screen
    navigation.navigate('ConversationScreen', {
      sessionType: 'news',
      sessionId: params.sessionId,
      newsContext: params.newsContext,
      language: params.language,
      level: params.level,
      newsTitle: params.newsTitle,
      newsUrl: params.newsUrl,
    });
  };

  const getCategoryConfig = (category: string) => {
    // Normalize category to lowercase for matching
    const normalizedCategory = category.toLowerCase();

    const configs: { [key: string]: { color: string; icon: string } } = {
      all: { color: '#06B6D4', icon: 'apps' },
      technology: { color: '#3B82F6', icon: 'hardware-chip' },
      science: { color: '#8B5CF6', icon: 'flask' },
      culture: { color: '#F59E0B', icon: 'color-palette' },
      sports: { color: '#EF4444', icon: 'football' },
      environment: { color: '#14B8A6', icon: 'leaf' },
      health: { color: '#EC4899', icon: 'heart' },
      business: { color: '#10B981', icon: 'briefcase' },
      entertainment: { color: '#F43F5E', icon: 'sparkles' },
      education: { color: '#6366F1', icon: 'school' },
      politics: { color: '#64748B', icon: 'megaphone' },
      finance: { color: '#059669', icon: 'cash' },
      travel: { color: '#0EA5E9', icon: 'airplane' },
      food: { color: '#F97316', icon: 'restaurant' },
      fashion: { color: '#A855F7', icon: 'shirt' },
      automotive: { color: '#71717A', icon: 'car-sport' },
    };
    return configs[normalizedCategory] || { color: '#6B7280', icon: 'ellipse' };
  };

  const getCategoryColor = (category: string) => {
    return getCategoryConfig(category).color;
  };

  // Get unique categories from articles
  const categories = ['All', ...Array.from(new Set(newsData?.articles.map(a => a.category) || []))];

  // Filter articles by selected category
  const filteredArticles = selectedCategory === 'All'
    ? newsData?.articles || []
    : newsData?.articles.filter(a => a.category === selectedCategory) || [];

  const renderArticle = ({ item, index }: { item: NewsArticle; index: number }) => {
    // Use category color for entire card
    const categoryColor = getCategoryColor(item.category);
    const categoryConfig = getCategoryConfig(item.category);

    return (
      <TouchableOpacity
        style={[styles.articleCard, { backgroundColor: categoryColor }]}
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.7}
      >
        {/* Article Image with Gradient Overlay */}
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.articleImage} />
          ) : (
            <View style={[styles.articleImage, styles.placeholderImage]}>
              <Ionicons name="newspaper-outline" size={40} color="#9CA3AF" />
            </View>
          )}
          {/* Dark gradient overlay for better text contrast */}
          <View style={styles.imageOverlay} />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Ionicons
              name={categoryConfig.icon as any}
              size={12}
              color={categoryColor}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={styles.articleSource}>{item.source}</Text>

          {/* Animated Arrow Prompt */}
          <AnimatedArrowPrompt />
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Daily Language News</Text>
          <Text style={styles.headerSubtitle}>
            {newsData?.fallback_used ? "Yesterday's News" : 'Today'} •{' '}
            {newsData?.articles.length || 0} articles
          </Text>
        </View>
        {newsData?.fallback_used && (
          <View style={styles.fallbackBadge}>
            <Text style={styles.fallbackText}>Yesterday</Text>
          </View>
        )}
      </View>

      {/* Category Filter - Expert Design */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((category) => {
            const config = getCategoryConfig(category);
            const isSelected = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  isSelected && {
                    backgroundColor: config.color,
                    shadowColor: config.color,
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={config.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : config.color}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* News List */}
      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#06B6D4"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No news available</Text>
          </View>
        }
      />

      {/* News Detail Modal */}
      {selectedArticle && (
        <NewsDetailModal
          visible={modalVisible}
          newsId={selectedArticle.id}
          title={selectedArticle.title}
          recommendedLevel={newsData?.recommended_level || 'B1'}
          availableLanguages={newsData?.available_languages || ['en', 'es', 'nl']}
          onClose={handleCloseModal}
          onStartConversation={handleStartConversation}
        />
      )}
      </SafeAreaView>
    );
  };

  return (
    <TransitionWrapper isLoading={loading} loadingMessage="Loading today's news...">
      {renderContent()}
    </TransitionWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  fallbackBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  listContent: {
    padding: 16,
  },
  articleCard: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    // backgroundColor set dynamically per card with category color
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    // color set dynamically to match category color in component
    letterSpacing: 0.5,
  },
  articleContent: {
    padding: 18,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  articleSource: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginBottom: 12,
  },
  arrowPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  arrowPromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
