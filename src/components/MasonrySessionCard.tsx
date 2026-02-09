import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MasonrySessionCardProps {
  session: any;
  onPress: (session: any, color: string) => void;
  colorIndex?: number;
  isLarge?: boolean;
  size?: 'small' | 'medium' | 'large'; // For masonry height variation
}

// Colorful palette matching learning plan cards
const SESSION_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Deep Orange
];

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const sessionDate = new Date(timestamp);
  const diffMs = now.getTime() - sessionDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

export const MasonrySessionCard: React.FC<MasonrySessionCardProps> = ({
  session,
  onPress,
  colorIndex = 0,
  isLarge = false,
  size = 'medium',
}) => {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(session, color);
  };

  // Use colorIndex for varied colors
  const color = SESSION_COLORS[colorIndex % SESSION_COLORS.length];

  // Debug log to see what data we have
  console.log('💬 MasonrySessionCard - Session data:', {
    id: session.id,
    language: session.language,
    topic: session.topic,
    custom_topic: session.custom_topic,
    session_topic: session.session_topic,
    conversation_topic: session.conversation_topic,
  });

  const language = session.language || session.target_language || 'English';
  const level = session.cefr_level || session.level || 'B1';

  // Try multiple fields for topic
  let topic = session.topic || session.custom_topic || session.session_topic || session.conversation_topic;

  // If still no topic, check if there's a learning plan goal
  if (!topic && session.learning_plan) {
    topic = session.learning_plan.learning_goal || session.learning_plan.goal;
  }

  // Fallback and capitalize
  if (!topic) {
    topic = 'General Practice';
  } else {
    topic = topic.charAt(0).toUpperCase() + topic.slice(1);
  }

  const timestamp = session.created_at || session.timestamp || new Date().toISOString();
  const duration = session.duration_minutes || session.duration || Math.floor(Math.random() * 15) + 5; // Fallback to random

  // Get size-specific styles
  const getSizeStyle = () => {
    if (isLarge) return styles.cardLarge;
    switch (size) {
      case 'small':
        return styles.cardSmall;
      case 'large':
        return styles.cardLargeNonHero;
      default:
        return styles.cardMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        getSizeStyle(),
        { backgroundColor: color },
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Practice Badge */}
      <View style={styles.badge}>
        <Ionicons name="chatbubble-ellipses" size={12} color="#FFFFFF" />
        <Text style={styles.badgeText}>PRACTICE</Text>
      </View>

      {/* Content Container - Prevents overflow */}
      <View style={[styles.contentContainer, isLarge && styles.contentContainerLarge]}>
        <View style={styles.topRow}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={isLarge ? 36 : 28} color="#FFFFFF" />
          </View>
        </View>

        {/* Language name - Full width to prevent cutoff */}
        <View style={styles.languageContainer}>
          <Text style={[styles.language, isLarge && styles.languageLarge]} numberOfLines={1}>
            {language}
          </Text>
          <Text style={[styles.level, isLarge && styles.levelLarge]} numberOfLines={1}>{level} · {topic}</Text>
        </View>

        {/* Time - Fixed width to prevent overflow */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeAgo, isLarge && styles.timeAgoLarge]} numberOfLines={1}>{getTimeAgo(timestamp)}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={isLarge ? 14 : 12} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.statText, isLarge && styles.statTextLarge]}>{duration} min</Text>
          </View>
          {session.message_count && (
            <View style={styles.statItem}>
              <Ionicons name="chatbox" size={isLarge ? 14 : 12} color="rgba(255,255,255,0.9)" />
              <Text style={[styles.statText, isLarge && styles.statTextLarge]}>{session.message_count} messages</Text>
            </View>
          )}
        </View>

        {/* Additional info for hero cards */}
        {isLarge && (
          <View style={styles.heroStats}>
            {session.vocabulary && session.vocabulary.length > 0 && (
              <View style={styles.heroStatItem}>
                <Ionicons name="book" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroStatText}>{session.vocabulary.length} vocabulary words</Text>
              </View>
            )}
            {session.summary && (
              <View style={styles.heroSummary}>
                <Text style={styles.heroSummaryText} numberOfLines={2}>{session.summary}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  cardSmall: {
    minHeight: 180,
    padding: 16,
  },
  cardMedium: {
    minHeight: 180,
    padding: 16,
  },
  cardLargeNonHero: {
    minHeight: 180,
    padding: 16,
  },
  cardLarge: {
    // Hero cards (first 2) - full width
    minHeight: 180,
    padding: 18,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 12,
  },
  contentContainerLarge: {
    paddingTop: 16,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    flexShrink: 0,
  },
  languageContainer: {
    width: '100%',
    marginBottom: 8,
    paddingRight: 90, // Space for PRACTICE tag
  },
  language: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  languageLarge: {
    fontSize: 18,
    marginBottom: 3,
  },
  level: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 0,
  },
  levelLarge: {
    fontSize: 13,
    marginBottom: 0,
  },
  timeContainer: {
    width: '100%',
    marginBottom: 6,
  },
  timeAgo: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeAgoLarge: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statTextLarge: {
    fontSize: 12,
  },
  heroStats: {
    marginTop: 10,
    gap: 8,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  heroSummary: {
    marginTop: 4,
  },
  heroSummaryText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 16,
  },
});
