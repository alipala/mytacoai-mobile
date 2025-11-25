/**
 * FlashcardViewerMobile.tsx
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: string;
  mastery_level: number;
}

interface Props {
  flashcards: Flashcard[];
  onReview?: (flashcardId: string, correct: boolean) => void;
}

const FlashcardViewerMobile: React.FC<Props> = ({ flashcards, onReview }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      // Reset flip animation
      flipAnimation.setValue(0);
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      // Reset flip animation
      flipAnimation.setValue(0);
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar':
        return 'book-outline';
      case 'vocabulary':
        return 'chatbubbles-outline';
      case 'pronunciation':
        return 'mic-outline';
      case 'fluency':
        return 'rocket-outline';
      case 'comprehension':
        return 'bulb-outline';
      default:
        return 'document-text-outline';
    }
  };

  if (!currentCard) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text style={styles.emptyTitle}>All Done!</Text>
        <Text style={styles.emptyText}>You've reviewed all flashcards</Text>
      </View>
    );
  }

  // Interpolate rotation values for 3D flip
  const frontRotation = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 90.1, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 89.9, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon(currentCard.category) as any} size={14} color="#FFFFFF" />
          <Text style={styles.categoryText}>{currentCard.category}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentCard.difficulty) }]}>
          <Text style={styles.difficultyText}>{currentCard.difficulty}</Text>
        </View>
      </View>

      {/* Flashcard with 3D Flip Animation */}
      <TouchableOpacity 
        style={styles.cardContainer} 
        onPress={handleFlip} 
        activeOpacity={1}
      >
        {/* Front Side - Question (Yellow) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontRotation }],
            },
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardLabelFront}>QUESTION</Text>
            <Text style={styles.cardTextFront}>
              {currentCard.front}
            </Text>
            <View style={styles.flipHintFront}>
              <Ionicons name="sync-outline" size={20} color="#000000" />
              <Text style={styles.flipHintTextFront}>Tap to flip</Text>
            </View>
          </View>
        </Animated.View>

        {/* Back Side - Answer (Turquoise) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backRotation }],
            },
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardLabelBack}>ANSWER</Text>
            <Text style={styles.cardTextBack}>
              {currentCard.back}
            </Text>
            <View style={styles.flipHintBack}>
              <Ionicons name="sync-outline" size={20} color="#FFFFFF" />
              <Text style={styles.flipHintTextBack}>Tap to flip back</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? '#D1D5DB' : '#1F2937'} />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navHint}>Swipe through cards</Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentIndex === flashcards.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          <Ionicons name="chevron-forward" size={24} color={currentIndex === flashcards.length - 1 ? '#D1D5DB' : '#1F2937'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  cardContainer: {
    height: 350,
    marginBottom: 24,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#FFD63A', // Yellow for Question
  },
  cardBack: {
    backgroundColor: '#4ECFBF', // Turquoise for Answer
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
  },
  cardLabelFront: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000', // Black text on yellow
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  cardLabelBack: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF', // White text on turquoise
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  cardTextFront: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000', // Black text on yellow
    textAlign: 'center',
    lineHeight: 32,
  },
  cardTextBack: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // White text on turquoise
    textAlign: 'center',
    lineHeight: 32,
  },
  flipHintFront: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  flipHintBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  flipHintTextFront: {
    fontSize: 14,
    color: '#000000', // Black text on yellow
    fontWeight: '500',
  },
  flipHintTextBack: {
    fontSize: 14,
    color: '#FFFFFF', // White text on turquoise
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  masteryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  masteryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  masteryBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  masteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default FlashcardViewerMobile;