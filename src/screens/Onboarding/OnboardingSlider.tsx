/**
 * OnboardingSlider.tsx
 *
 * Main onboarding flow with 3 swipeable screens.
 * Shows key features of MyTaco AI with illustrations and descriptions.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { COLORS } from '../../constants/colors';
import { setOnboardingCompleted } from '../../utils/storage';

interface OnboardingSlide {
  key: string;
  title: string;
  description: string;
  backgroundColor: string;
  iconEmoji: string;
}

interface OnboardingSliderProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

// Onboarding slide data
const slides: OnboardingSlide[] = [
  {
    key: '1',
    title: 'Speak Confidently in Any Language',
    description:
      'Practice real conversations with AI tutors designed to help you overcome speaking anxiety',
    backgroundColor: COLORS.turquoiseLight,
    iconEmoji: '🗣️',
  },
  {
    key: '2',
    title: 'Real-Time Voice Practice',
    description:
      'Build confidence through natural conversations with AI tutors who adapt to your learning pace and goals',
    backgroundColor: COLORS.coralLight,
    iconEmoji: '⚡',
  },
  {
    key: '3',
    title: 'Track Your Progress',
    description:
      'Watch your confidence grow with personalized feedback, progress reports, and achievement milestones',
    backgroundColor: COLORS.yellowLight,
    iconEmoji: '🎓',
  },
];

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({
  navigation,
}) => {
  const sliderRef = useRef<AppIntroSlider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Handle Skip - Jump to last slide
   */
  const handleSkip = () => {
    sliderRef.current?.goToSlide(slides.length - 1);
  };

  /**
   * Handle Back - Go to previous slide
   */
  const handleBack = () => {
    if (currentIndex > 0) {
      sliderRef.current?.goToSlide(currentIndex - 1);
    }
  };

  /**
   * Handle Next - Go to next slide
   */
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      sliderRef.current?.goToSlide(currentIndex + 1);
    }
  };

  /**
   * Handle Done/Get Started
   */
  const handleDone = async () => {
    try {
      // Save onboarding completion status
      await setOnboardingCompleted();

      // Navigate to Welcome screen
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still navigate even if storage fails
      navigation.replace('Welcome');
    }
  };

  /**
   * Render individual slide
   */
  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View
            style={[
              styles.illustration,
              { backgroundColor: item.backgroundColor },
            ]}
          >
            <Text style={styles.emoji}>{item.iconEmoji}</Text>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  /**
   * Render pagination dots
   */
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  /**
   * Render bottom buttons
   */
  const renderBottomButtons = () => {
    const isFirstSlide = currentIndex === 0;
    const isLastSlide = currentIndex === slides.length - 1;

    return (
      <View style={styles.bottomContainer}>
        {/* Back Button (hidden on first slide) */}
        {!isFirstSlide && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        )}

        {/* Spacer if on first slide */}
        {isFirstSlide && <View style={styles.spacer} />}

        {/* Next or Get Started Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            isLastSlide && styles.getStartedButton,
          ]}
          onPress={isLastSlide ? handleDone : handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'GET STARTED' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button (hidden on last slide) */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>SKIP</Text>
        </TouchableOpacity>
      )}

      {/* Slider */}
      <AppIntroSlider
        ref={sliderRef}
        data={slides}
        renderItem={renderSlide}
        onSlideChange={(index) => setCurrentIndex(index)}
        showNextButton={false}
        showDoneButton={false}
        showPagination={false}
        activeDotStyle={{ display: 'none' }}
        dotStyle={{ display: 'none' }}
      />

      {/* Custom Pagination */}
      {renderPagination()}

      {/* Bottom Buttons */}
      {renderBottomButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textLight,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 120,
  },
  illustrationContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustration: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.turquoise,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textLight,
  },
  spacer: {
    width: 60,
  },
  nextButton: {
    backgroundColor: COLORS.darkNavy,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: COLORS.turquoise,
    minWidth: 200,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
