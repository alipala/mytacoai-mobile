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
import LottieView from 'lottie-react-native';
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
    iconEmoji: 'animation',
  },
  {
    key: '2',
    title: 'Real-Time Voice Practice',
    description:
      'Build confidence through natural conversations with AI tutors who adapt to your learning pace and goals',
    backgroundColor: COLORS.coralLight,
    iconEmoji: 'chat-animation',
  },
  {
    key: '3',
    title: 'Track Your Progress',
    description:
      'Watch your confidence grow with personalized feedback, progress reports, and achievement milestones',
    backgroundColor: COLORS.yellowLight,
    iconEmoji: 'goal-animation',
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
    console.log('⏭️ Skip pressed - jumping to last slide');
    const lastIndex = slides.length - 1;
    setCurrentIndex(lastIndex); // Update state immediately
    sliderRef.current?.goToSlide(lastIndex);
  };

  /**
   * Handle Back - Go to previous slide
   */
  const handleBack = () => {
    console.log('⬅️ Back pressed - current index:', currentIndex);
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex); // Update state immediately
      sliderRef.current?.goToSlide(prevIndex);
      console.log('✅ Moving to index:', prevIndex);
    }
  };

  /**
   * Handle Next - Go to next slide
   */
  const handleNext = () => {
    console.log('➡️ Next pressed - current index:', currentIndex);
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex); // Update state immediately
      sliderRef.current?.goToSlide(nextIndex);
      console.log('✅ Moving to index:', nextIndex);
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
            {item.iconEmoji === 'animation' ? (
              <LottieView
                source={require('../../assets/LargeMicrophone.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : item.iconEmoji === 'chat-animation' ? (
              <LottieView
                source={require('../../assets/Chat.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : item.iconEmoji === 'goal-animation' ? (
              <LottieView
                source={require('../../assets/GoalAchieved.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : (
              <Text style={styles.emoji}>{item.iconEmoji}</Text>
            )}
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
            activeOpacity={0.7}
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
          activeOpacity={0.8}
        >
          <Text
            style={
              isLastSlide
                ? styles.getStartedButtonText
                : styles.nextButtonText
            }
          >
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
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
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
    paddingBottom: 220,
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
  lottieAnimation: {
    width: 200,
    height: 200,
  },

  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 150,
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
    bottom: 60,
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
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.turquoise,
  },
  getStartedButton: {
    backgroundColor: COLORS.turquoise,
    minWidth: 200,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
