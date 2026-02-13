/**
 * FlashcardViewerMobile.tsx
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles/FlashcardViewerMobile.styles';

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
  accentColor?: string;
}

const FlashcardViewerMobile: React.FC<Props> = ({ flashcards, onReview, accentColor = '#14B8A6' }) => {
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
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: accentColor }]} />
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
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
        {/* Front Side - Question */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontRotation }],
              borderColor: accentColor,
            },
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabelFront, { color: accentColor }]}>QUESTION</Text>
            <Text style={styles.cardTextFront}>
              {currentCard.front}
            </Text>
            <View style={styles.flipHintFront}>
              <Ionicons name="sync-outline" size={20} color={accentColor} />
              <Text style={[styles.flipHintTextFront, { color: accentColor }]}>Tap to flip</Text>
            </View>
          </View>
        </Animated.View>

        {/* Back Side - Answer */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backRotation }],
              backgroundColor: accentColor,
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
          style={[
            styles.navButton,
            {
              backgroundColor: currentIndex === 0 ? `${accentColor}4D` : accentColor,
              shadowColor: accentColor
            },
            currentIndex === 0 && styles.navButtonDisabled
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navHint}>Swipe through cards</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: currentIndex === flashcards.length - 1 ? `${accentColor}4D` : accentColor,
              shadowColor: accentColor
            },
            currentIndex === flashcards.length - 1 && styles.navButtonDisabled
          ]}
          onPress={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FlashcardViewerMobile;