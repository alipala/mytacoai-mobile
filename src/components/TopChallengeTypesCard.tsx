/**
 * Top Challenge Types Card
 * Displays top 3 practiced challenge types with stats
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLifetimeProgress } from '../hooks/useStats';

const { width, height } = Dimensions.get('window');
const MAX_CARD_HEIGHT = height * 0.5; // Half of screen height

interface TopChallengeTypesCardProps {
  onRefresh?: () => void;
}

export default function TopChallengeTypesCard({ onRefresh }: TopChallengeTypesCardProps) {
  const { t } = useTranslation();
  const { lifetime, isLoading } = useLifetimeProgress(false, true);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Color rotation matching main stat boxes
  const STAT_COLORS = ['#8B5CF6', '#FBBF24', '#F75A5A'];

  // Get challenge type icon
  const getChallengeTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'native_check': 'checkmark-circle',
      'story_builder': 'book',
      'brain_tickler': 'bulb',
      'micro_quiz': 'help-circle',
      'error_spotting': 'search',
      'smart_flashcard': 'flash',
      'swipe_fix': 'hand-left',
    };
    return iconMap[type] || 'game-controller';
  };

  // Format challenge type names
  const formatChallengeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'micro_quiz': 'Micro Quiz',
      'brain_tickler': 'Brain Tickler',
      'smart_flashcard': 'Smart Flashcard',
      'swipe_fix': 'Swipe Fix',
      'error_spotting': 'Error Spotting',
      'native_check': 'Native Check',
    };
    return typeMap[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Loading state
  if (isLoading && !lifetime) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0D2832', '#0B1A1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Debug logging
  useEffect(() => {
    if (lifetime) {
      console.log('[TopChallengeTypesCard] Lifetime data:', {
        challenge_type_mastery_exists: !!lifetime.challenge_type_mastery,
        challenge_type_mastery_keys: lifetime.challenge_type_mastery ? Object.keys(lifetime.challenge_type_mastery) : [],
        challenge_type_mastery_data: lifetime.challenge_type_mastery,
      });
    }
  }, [lifetime]);

  // No data state
  if (!lifetime || !lifetime.challenge_type_mastery) {
    return null;
  }

  // Prepare Challenge Types data
  const typeEntries = Object.entries(lifetime.challenge_type_mastery || {});
  const topTypes = typeEntries
    .sort((a, b) => b[1].total_challenges - a[1].total_challenges)
    .slice(0, 3);

  if (topTypes.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#0D2832', '#0B1A1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="game-controller" size={32} color="#A78BFA" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>{t('explore.stats.top_challenge_types')}</Text>
              <Text style={styles.headerSubtitle}>Most played</Text>
            </View>
          </View>
        </View>

        {/* Challenge Types Grid */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.typesGrid}>
            {topTypes.map(([type, mastery], index) => {
              const typeIconName = getChallengeTypeIcon(type);
              const solidColor = STAT_COLORS[index % STAT_COLORS.length];

              return (
                <View
                  key={type}
                  style={[styles.typeItem, { backgroundColor: solidColor }]}
                >
                  <View style={styles.typeIcon}>
                    <Ionicons name={typeIconName as any} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeName} numberOfLines={1}>
                      {formatChallengeType(type)}
                    </Text>
                    <Text style={styles.typeStats}>
                      {mastery.total_challenges} • {Math.round(mastery.accuracy)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: MAX_CARD_HEIGHT,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    height: MAX_CARD_HEIGHT,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#C4B5FD',
    marginTop: 2,
    opacity: 0.8,
  },
  scrollContainer: {
    flex: 1,
  },
  typesGrid: {
    gap: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  typeStats: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
