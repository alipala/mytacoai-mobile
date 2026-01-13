import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function NewsListScreen({ navigation }: any) {
  const [newsData, setNewsData] = useState<NewsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
    navigation.navigate('NewsDetail', {
      newsId: article.id,
      title: article.title,
      recommendedLevel: newsData?.recommended_level || 'B1',
      availableLanguages: newsData?.available_languages || ['en', 'es', 'nl'],
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

  // Get accent color for card based on index (rotate through brand colors)
  const getAccentColor = (index: number) => {
    const brandColors = ['#4ECFBF', '#FFD63A', '#F75A5A', '#FFA955'];
    return brandColors[index % brandColors.length];
  };

  const renderArticle = ({ item, index }: { item: NewsArticle; index: number }) => {
    const accentColor = getAccentColor(index);

    return (
      <TouchableOpacity
        style={[styles.articleCard, { borderLeftColor: accentColor }]}
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
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Text style={styles.categoryText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={3}>
            {item.title}
          </Text>
          <View style={styles.articleFooter}>
            <Text style={styles.articleSource}>{item.source}</Text>
            <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06B6D4" />
          <Text style={styles.loadingText}>Loading today's news...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
    </SafeAreaView>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    borderLeftWidth: 4,
    // borderLeftColor set dynamically per card
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  articleContent: {
    padding: 18,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleSource: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
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
