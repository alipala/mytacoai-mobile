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
import { useTranslation } from 'react-i18next';
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
  read?: boolean; // Track read state
  published_time?: string; // Article timestamp
  estimated_read_time?: number; // Minutes to read
}

interface NewsList {
  date: string;
  articles: NewsArticle[];
  recommended_level: string;
  fallback_used: boolean;
  available_languages: string[];
}

// Skeleton Loading Card Component
const SkeletonCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonBadge, { opacity }]} />
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonTitleShort, { opacity }]} />
        <Animated.View style={[styles.skeletonMeta, { opacity }]} />
      </View>
    </View>
  );
};

export default function NewsListScreen({ navigation }: any) {
  const { t } = useTranslation();

  // Helper function to get time ago string
  const getTimeAgo = (timestamp?: string): string => {
    if (!timestamp) return t('news.time.today');

    const now = new Date();
    const articleDate = new Date(timestamp);
    const diffMs = now.getTime() - articleDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return t('news.time.minutes_ago', { count: diffMinutes });
    if (diffHours < 24) return t('news.time.hours_ago', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return t('news.time.yesterday');
    if (diffDays < 7) return t('news.time.days_ago', { count: diffDays });
    return articleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get dynamic greeting based on time
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('news.greeting.morning');
    if (hour < 18) return t('news.greeting.afternoon');
    return t('news.greeting.evening');
  };

  // Get greeting emoji
  const getGreetingEmoji = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('news.greeting_emoji.morning');
    if (hour < 18) return t('news.greeting_emoji.afternoon');
    return t('news.greeting_emoji.evening');
  };
  const [newsData, setNewsData] = useState<NewsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // Use key instead of translated string
  const [progressStats, setProgressStats] = useState<any>(null); // For streak data

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetchNews();
    fetchProgressStats();
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
        throw new Error(errorData.detail || t('news.error.failed_to_load'));
      }

      const data = await response.json();
      setNewsData(data);
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.message || t('news.error.failed_to_load'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/progress/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgressStats(data);
      }
    } catch (err) {
      console.log('Failed to fetch progress stats:', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  // Category helper functions (must be defined before use)
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

  const handleArticlePress = (article: NewsArticle) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const selectedArticleCategoryColor = selectedArticle
    ? getCategoryColor(selectedArticle.category)
    : '#14B8A6';

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

  // Get unique categories from articles
  // Get unique categories from articles
  const articleCategories = Array.from(new Set(newsData?.articles.map(a => a.category) || []));
  const categories = ['all', ...articleCategories];

  // Filter articles by selected category
  const filteredArticles = selectedCategory === 'all'
    ? newsData?.articles || []
    : newsData?.articles.filter(a => a.category === selectedCategory) || [];

  const renderArticle = ({ item, index }: { item: NewsArticle; index: number }) => {
    const categoryColor = getCategoryColor(item.category);
    const categoryConfig = getCategoryConfig(item.category);
    const readTime = item.estimated_read_time || Math.ceil(item.title.length / 50); // Estimate based on title length
    const timeAgo = getTimeAgo(item.published_time);

    return (
      <TouchableOpacity
        style={[styles.articleCard, { backgroundColor: categoryColor }]}
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.85}
      >
        {/* Read/Unread Indicator */}
        {item.read && (
          <View style={styles.readIndicator}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          </View>
        )}

        {/* Article Image */}
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.articleImage} />
          ) : (
            <View style={[styles.articleImage, styles.placeholderImage]}>
              <Ionicons name="newspaper-outline" size={48} color="rgba(255,255,255,0.6)" />
            </View>
          )}
          {/* Lighter overlay for vibrant look */}
          <View style={styles.imageOverlay} />
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Category Badge - White with Category Color Text */}
          <View style={styles.categoryBadgeCompact}>
            <Ionicons
              name={categoryConfig.icon as any}
              size={13}
              color={categoryColor}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.categoryTextCompact}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>

          {/* Article Title - White Bold */}
          <Text style={styles.articleTitle} numberOfLines={3}>
            {item.title}
          </Text>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            <Text style={styles.metadataText}>{item.source}</Text>
            <View style={styles.metadataDot} />
            <Text style={styles.metadataText}>{t('news.reading_time_short', { minutes: readTime })}</Text>
            <View style={styles.metadataDot} />
            <Text style={styles.metadataText}>{timeAgo}</Text>
          </View>

          {/* Speak Now Button - Solid White */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => handleArticlePress(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={22} color={categoryColor} />
            <Text style={[styles.ctaButtonText, { color: categoryColor }]}>
              {t('news.button_speak_now')}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={categoryColor} />
          </TouchableOpacity>
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
            <Text style={styles.errorTitle}>{t('news.error.title')}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
              <Text style={styles.retryButtonText}>{t('news.button_try_again')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>
              {getGreeting()} {getGreetingEmoji()}
            </Text>
            {newsData?.fallback_used && (
              <View style={styles.fallbackBadge}>
                <Text style={styles.fallbackText}>{t('news.badges.yesterday')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Category Filter with Colored Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((category) => {
            const config = getCategoryConfig(category);
            const isSelected = selectedCategory === category;
            // Count articles in this category
            const articleCount = category === 'all'
              ? newsData?.articles.length || 0
              : newsData?.articles.filter(a => a.category === category).length || 0;
            // Get translated category name
            const categoryName = category === 'all' ? t('news.categories.all') : category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  isSelected && {
                    backgroundColor: config.color,
                    shadowColor: config.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={config.icon as any}
                  size={18}
                  color={isSelected ? '#FFFFFF' : 'rgba(180, 228, 221, 0.6)'}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && {
                      color: '#FFFFFF',
                      fontWeight: '800',
                    },
                  ]}
                >
                  {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                </Text>

                {/* Article Count Badge */}
                <View style={[
                  styles.countBadge,
                  isSelected && {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  }
                ]}>
                  <Text style={[
                    styles.countBadgeText,
                    isSelected && {
                      color: '#FFFFFF',
                      fontWeight: '800',
                    }
                  ]}>
                    {articleCount}
                  </Text>
                </View>
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
            tintColor="#14B8A6" // Teal accent for dark theme
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>{t('news.empty.emoji')}</Text>
            <Text style={styles.emptyTitle}>{t('news.empty.title')}</Text>
            <Text style={styles.emptyMessage}>
              {t('news.empty.message')}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={fetchNews}>
              <Ionicons name="refresh" size={20} color="#14B8A6" />
              <Text style={styles.emptyButtonText}>{t('news.button_refresh')}</Text>
            </TouchableOpacity>
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
          categoryColor={selectedArticleCategoryColor}
          onClose={handleCloseModal}
          onStartConversation={handleStartConversation}
        />
      )}
      </SafeAreaView>
    );
  };

  // Show skeleton loading state
  if (loading && !newsData) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Compact Header skeleton */}
        <View style={styles.header}>
          <View>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
          <View style={styles.skeletonBadge} />
        </View>

        {/* Filter skeleton */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.skeletonFilter} />
            ))}
          </ScrollView>
        </View>

        {/* Article cards skeleton */}
        <ScrollView style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return renderContent();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme primary background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#0B1A1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    width: '100%',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B8A84',
  },
  fallbackBadge: {
    backgroundColor: 'rgba(255, 214, 58, 0.15)', // Dark theme badge
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 58, 0.3)',
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD63A', // Bright yellow for dark theme
  },
  listContent: {
    padding: 16,
    backgroundColor: '#0D2832',
  },
  articleCard: {
    position: 'relative',
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  readIndicator: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    padding: 6,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  articleContent: {
    padding: 18,
    paddingTop: 14,
  },
  categoryBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  categoryTextCompact: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  metadataDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D2832',
  },
  loadingText: {
    fontSize: 16,
    color: '#B4E4DD',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#0D2832',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#14B8A6', // Teal button
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B8A84',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14B8A6',
  },
  filterWrapper: {
    backgroundColor: '#0B1A1F',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterIcon: {
    marginRight: 7,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(180, 228, 221, 0.6)',
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 6,
    minWidth: 26,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(180, 228, 221, 0.8)',
  },
  // Skeleton Loading Styles
  skeletonCard: {
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  skeletonImage: {
    width: 'calc(100% - 16px)',
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 8,
    borderRadius: 16,
  },
  skeletonContent: {
    padding: 16,
    paddingTop: 8,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonTitle: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonTitleShort: {
    width: '70%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonMeta: {
    width: '50%',
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
  skeletonTitle: {
    width: 200,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: 150,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 60,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  skeletonFilter: {
    width: 100,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginRight: 12,
  },
});
