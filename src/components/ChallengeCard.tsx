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
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge, ChallengeType } from '../services/mockChallengeData';
import { COLORS } from '../constants/colors';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
  index: number;
}

// Color schemes for different challenge types
const getChallengeColors = (type: ChallengeType): [string, string] => {
  switch (type) {
    case 'error_spotting':
      return ['#FFE8E8', '#FFD1D1']; // Soft coral gradient
    case 'swipe_fix':
      return ['#E8F7F5', '#D1F0EB']; // Soft turquoise gradient
    case 'micro_quiz':
      return ['#FFF7ED', '#FFECD1']; // Soft orange gradient
    case 'smart_flashcard':
      return ['#F3E8FF', '#E8D6FF']; // Soft purple gradient
    case 'native_check':
      return ['#FFFBEB', '#FFF4C6']; // Soft yellow gradient
    case 'brain_tickler':
      return ['#FFE8F5', '#FFD6EB']; // Soft pink gradient
    default:
      return ['#F5F5F5', '#E5E5E5'];
  }
};

const getAccentColor = (type: ChallengeType): string => {
  switch (type) {
    case 'error_spotting':
      return COLORS.coral;
    case 'swipe_fix':
      return COLORS.turquoise;
    case 'micro_quiz':
      return COLORS.orange;
    case 'smart_flashcard':
      return '#9333EA'; // Purple
    case 'native_check':
      return '#EAB308'; // Gold
    case 'brain_tickler':
      return '#EC4899'; // Pink
    default:
      return COLORS.textGray;
  }
};

export function ChallengeCard({ challenge, onPress, index }: ChallengeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const colors = getChallengeColors(challenge.type);
  const accentColor = getAccentColor(challenge.type);

  // Entry animation with stagger
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: index * 60, // Stagger by 60ms
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 1,
        duration: 250,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle float animation for emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    // Light haptic feedback on iOS
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <LinearGradient colors={colors} style={styles.card}>
          {/* Completed Badge */}
          {challenge.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Done</Text>
            </View>
          )}

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Emoji with float animation */}
            <Animated.View
              style={[
                styles.emojiContainer,
                {
                  transform: [{ scale: floatAnim }],
                },
              ]}
            >
              <Text style={styles.emoji}>{challenge.emoji}</Text>
            </Animated.View>

            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{challenge.title}</Text>
              <Text style={styles.cardDescription}>{challenge.description}</Text>

              {/* Time estimate */}
              <View style={styles.metaRow}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>
                    ⏱️ {challenge.estimatedSeconds}s
                  </Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.levelText}>{challenge.cefrLevel}</Text>
                </View>
              </View>
            </View>

            {/* CTA */}
            <View style={[styles.ctaButton, { borderColor: accentColor }]}>
              <Text style={[styles.ctaText, { color: accentColor }]}>
                {challenge.completed ? 'Review' : 'Start'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
