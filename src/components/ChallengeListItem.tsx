import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Challenge } from '../services/mockChallengeData';
import { COLORS } from '../constants/colors';

interface ChallengeListItemProps {
  challenge: Challenge;
  emoji: string;
  accentColor: string;
  index: number;
  isCompletedToday: boolean;
  onPress: () => void;
}

export function ChallengeListItem({
  challenge,
  emoji,
  accentColor,
  index,
  isCompletedToday,
  onPress,
}: ChallengeListItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Entry animation with stagger
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay: index * 40, // 40ms stagger
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // Get preview text (first 60 chars of description)
  const previewText = challenge.description.length > 60
    ? challenge.description.substring(0, 60) + '...'
    : challenge.description;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.card,
          isCompletedToday && styles.completedCard,
        ]}
      >
        {/* Completed Today Badge */}
        {isCompletedToday && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}

        {/* Left: Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Middle: Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.previewText} numberOfLines={2}>
            {previewText}
          </Text>

          <View style={styles.metaRow}>
            {/* Time Badge */}
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.textGray} />
              <Text style={styles.timeText}>{challenge.estimatedSeconds}s</Text>
            </View>

            {/* Level Badge */}
            <View style={[styles.levelBadge, { backgroundColor: `${accentColor}20` }]}>
              <Text style={[styles.levelText, { color: accentColor }]}>
                {challenge.cefrLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Start Button */}
        <View style={[
          styles.startButton,
          { backgroundColor: isCompletedToday ? '#10B981' : accentColor }
        ]}>
          {isCompletedToday ? (
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          ) : (
            <Ionicons name="play" size={18} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  completedCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  emoji: {
    fontSize: 24,
  },
  checkmarkOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  startButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
