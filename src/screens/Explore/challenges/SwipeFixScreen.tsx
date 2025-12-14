import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SwipeFixChallenge } from '../../../services/mockChallengeData';
import { COLORS } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeFixScreenProps {
  challenge: SwipeFixChallenge;
  onComplete: (challengeId: string) => void;
  onClose: () => void;
}

export default function SwipeFixScreen({
  challenge,
  onComplete,
  onClose,
}: SwipeFixScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const currentExample = challenge.examples[currentIndex];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = SCREEN_WIDTH * 0.25;

        if (gestureState.dx > threshold && currentIndex > 0) {
          // Swipe right - previous example
          handleSwipe('right');
        } else if (
          gestureState.dx < -threshold &&
          currentIndex < challenge.examples.length - 1
        ) {
          // Swipe left - next example
          handleSwipe('left');
        } else {
          // Return to center
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Update index
      setCurrentIndex((prev) =>
        direction === 'left'
          ? Math.min(prev + 1, challenge.examples.length - 1)
          : Math.max(prev - 1, 0)
      );

      setHasViewed(true);

      // Reset position
      translateX.setValue(direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.spring(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      // Soft haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
    });
  };

  const handleDone = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onComplete(challenge.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>{challenge.emoji}</Text>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.concept}>{challenge.concept}</Text>
        </View>

        {/* Swipe Hint */}
        <View style={styles.swipeHint}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textLight} />
          <Text style={styles.swipeHintText}>Swipe to compare</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {/* Correctness Indicator */}
            <View
              style={[
                styles.correctnessBadge,
                currentExample.isCorrect
                  ? styles.correctBadge
                  : styles.incorrectBadge,
              ]}
            >
              <Text style={styles.correctnessText}>
                {currentExample.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </Text>
            </View>

            {/* Example Text */}
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleText}>{currentExample.text}</Text>
            </View>

            {/* Explanation */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                {currentExample.explanation}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {challenge.examples.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Done Button */}
        {hasViewed && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  concept: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.turquoise,
    textAlign: 'center',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  swipeHintText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  correctnessBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  correctBadge: {
    backgroundColor: '#D1FAE5',
  },
  incorrectBadge: {
    backgroundColor: '#FEE2E2',
  },
  correctnessText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  exampleContainer: {
    marginBottom: 24,
  },
  exampleText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 34,
    textAlign: 'center',
  },
  explanationBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 16,
  },
  explanationText: {
    fontSize: 16,
    color: COLORS.textGray,
    lineHeight: 24,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  paginationDotActive: {
    backgroundColor: COLORS.turquoise,
    width: 24,
  },
  doneButton: {
    backgroundColor: COLORS.darkNavy,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
