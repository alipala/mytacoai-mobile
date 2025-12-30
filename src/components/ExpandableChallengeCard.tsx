import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';
import { Challenge, ChallengeType } from '../services/mockChallengeData';
import { COLORS } from '../constants/colors';
import { ChallengeListItem } from './ChallengeListItem';
import { HeartDisplay } from './HeartDisplay';
import { HeartPool } from '../types/hearts';

interface ExpandableChallengeCardProps {
  type: ChallengeType;
  title: string;
  emoji: string;
  description: string;
  totalCount: number;
  completedCount?: number; // Number of challenges completed historically (all-time)
  challenges: Challenge[];
  isExpanded: boolean;
  isLoading: boolean;
  completedToday: Set<string>;
  heartPool?: HeartPool | null;
  onToggle: () => void;
  onChallengePress: (challenge: Challenge) => void;
}

// Reuse color schemes from ChallengeCard
const getChallengeColors = (type: ChallengeType): [string, string] => {
  switch (type) {
    case 'error_spotting':
      return ['#FFE8E8', '#FFD1D1'];
    case 'swipe_fix':
      return ['#E8F7F5', '#D1F0EB'];
    case 'micro_quiz':
      return ['#FFF7ED', '#FFECD1'];
    case 'smart_flashcard':
      return ['#F3E8FF', '#E8D6FF'];
    case 'native_check':
      return ['#FFFBEB', '#FFF4C6'];
    case 'brain_tickler':
      return ['#FFE8F5', '#FFD6EB'];
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
      return '#9333EA';
    case 'native_check':
      return '#EAB308';
    case 'brain_tickler':
      return '#EC4899';
    default:
      return COLORS.textGray;
  }
};

export function ExpandableChallengeCard({
  type,
  title,
  emoji,
  description,
  totalCount,
  completedCount = 0,
  challenges,
  isExpanded,
  isLoading,
  completedToday,
  heartPool,
  onToggle,
  onChallengePress,
}: ExpandableChallengeCardProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  const colors = getChallengeColors(type);
  const accentColor = getAccentColor(type);

  // Track completed challenges in this category
  useEffect(() => {
    if (challenges.length === 0) return;

    // Count how many challenges in this category are completed today
    const completedInCategory = challenges.filter(c => completedToday.has(c.id)).length;
    const totalInCategory = challenges.length;

    // Trigger confetti if ALL challenges in this category are completed
    if (completedInCategory === totalInCategory && totalInCategory > 0) {
      console.log(`🎉 All ${totalInCategory} challenges completed in ${type}! Triggering confetti`);
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    }
  }, [completedToday, challenges, type]);

  // Animate expand/collapse
  useEffect(() => {
    if (isExpanded) {
      // Expand
      Animated.parallel([
        Animated.spring(heightAnim, {
          toValue: contentHeight,
          useNativeDriver: false, // height requires layout
          tension: 80,
          friction: 12,
        }),
        Animated.timing(chevronRotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Collapse
      Animated.parallel([
        Animated.spring(heightAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(chevronRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isExpanded, contentHeight]);

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
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.cardWrapper}>
      {/* Header Card */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient colors={colors} style={styles.card}>
          <View style={styles.cardContent}>
            {/* Emoji */}
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>

            {/* Title & Description */}
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDescription}>{description}</Text>

              {/* Heart Display below description */}
              {heartPool && (
                <View style={{ marginTop: 8 }}>
                  <HeartDisplay
                    heartPool={heartPool}
                    size="small"
                    showShield={true}
                    showCount={true}
                  />
                </View>
              )}
            </View>

            {/* Badge & Chevron */}
            <View style={styles.rightSection}>
              <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.countText}>{totalCount - completedCount}</Text>
                </View>
                {completedCount > 0 && (
                  <Text style={{ fontSize: 9, color: '#10B981', marginTop: 2, fontWeight: '600' }}>
                    ✓ {completedCount}
                  </Text>
                )}
              </View>
              <Animated.View
                style={{
                  transform: [{ rotate: chevronRotate }],
                }}
              >
                <Ionicons name="chevron-down" size={24} color={accentColor} />
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Expandable Content - Separate height and opacity animations */}
      <Animated.View
        style={[
          styles.expandableContent,
          {
            height: heightAnim,
          },
        ]}
      >
        <Animated.View style={{ opacity: opacityAnim }}>
          <View
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              if (height !== contentHeight && height > 0) {
                setContentHeight(height);
              }
            }}
            style={styles.contentMeasurer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={require('../assets/lottie/loading.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text style={styles.loadingText}>Loading challenges...</Text>
              </View>
            ) : challenges.length > 0 ? (
              <View style={styles.challengeList}>
                {challenges.map((challenge, index) => {
                  const isCompletedToday = completedToday.has(challenge.id);
                  return (
                    <ChallengeListItem
                      key={`${type}-${challenge.id}-${index}`}
                      challenge={challenge}
                      emoji={emoji}
                      accentColor={accentColor}
                      index={index}
                      isCompletedToday={isCompletedToday}
                      onPress={() => onChallengePress(challenge)}
                    />
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No challenges available</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Confetti for celebration */}
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: 0, y: 0 }}
        autoStart={false}
        fadeOut
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 16,
  },
  emoji: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textGray,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  countBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 44,
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandableContent: {
    overflow: 'hidden',
  },
  contentMeasurer: {
    position: 'absolute',
    width: '100%',
    paddingTop: 8,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textGray,
  },
  challengeList: {
    paddingTop: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
});
