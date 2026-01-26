/**
 * OnboardingSlider.tsx
 *
 * Main onboarding flow with 3 swipeable screens.
 * Shows key features of MyTaco AI with illustrations and descriptions.
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { COLORS } from '../../constants/colors';
import { setOnboardingCompleted } from '../../utils/storage';

interface OnboardingSlide {
  key: string;
  title: string;
  highlight: string;
  subtext: string;
  backgroundColor: string;
  iconEmoji: string;
}

interface OnboardingSliderProps {
  navigation: any;
}

// Onboarding slide data - Value-driven messaging with highlight + subtext
// Defined outside component to prevent re-creation on every render
const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: '1',
    title: "Real Conversations Shouldn't Cost a Fortune",
    highlight: "No financial pain",
    subtext: "Join 50,000+ learners speaking daily without breaking the bank.",
    backgroundColor: COLORS.turquoiseLight,
    iconEmoji: 'animation',
  },
  {
    key: '2',
    title: "Make Mistakes 100 Times!",
    highlight: "Practice without judgment.",
    subtext: "Unlimited do-overs without the fear that stops most learners.",
    backgroundColor: COLORS.coralLight,
    iconEmoji: 'chat-animation',
  },
  {
    key: '3',
    title: "Your Pace. Your Schedule",
    highlight: "Learning that adapts to your life.",
    subtext: "Speak when you can. Play challenges when you can't.",
    backgroundColor: COLORS.yellowLight,
    iconEmoji: 'goal-animation',
  },
  {
    key: '4',
    title: "Speak Confidently in Real Life",
    highlight: "Order in restaurants. Make friends. Land that job.",
    subtext: "Go from practicing alone to speaking freely with real people.",
    backgroundColor: COLORS.orangeLight,
    iconEmoji: 'success-animation',
  },
];

// Create dynamic styles based on device type
const createDynamicStyles = (isIPad: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 230,
  },
  illustrationContainer: {
    width: '100%',
    height: isIPad ? 380 : 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isIPad ? 40 : 32,
  },
  illustration: {
    width: isIPad ? 340 : 260,
    height: isIPad ? 340 : 260,
    borderRadius: isIPad ? 170 : 130,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: isIPad ? 100 : 80,
  },
  lottieAnimation: {
    width: isIPad ? 260 : 200,
    height: isIPad ? 260 : 200,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 500,
  },
  title: {
    fontSize: isIPad ? 34 : 28,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: isIPad ? 24 : 20,
    letterSpacing: -0.5,
    lineHeight: isIPad ? 42 : 36,
  },
  highlight: {
    fontSize: isIPad ? 24 : 20,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: isIPad ? 14 : 12,
    letterSpacing: 0,
    lineHeight: isIPad ? 32 : 28,
  },
  subtext: {
    fontSize: isIPad ? 18 : 16,
    fontWeight: '400',
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: isIPad ? 28 : 24,
    letterSpacing: 0.1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: isIPad ? 10 : 8,
    height: isIPad ? 10 : 8,
    borderRadius: isIPad ? 5 : 4,
    backgroundColor: COLORS.border,
    marginHorizontal: isIPad ? 6 : 5,
  },
  paginationDotActive: {
    width: isIPad ? 32 : 28,
    height: isIPad ? 10 : 8,
    borderRadius: isIPad ? 5 : 4,
    backgroundColor: COLORS.turquoise,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: isIPad ? 18 : 16,
    paddingHorizontal: isIPad ? 28 : 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  backButtonText: {
    fontSize: isIPad ? 16 : 15,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  spacer: {
    width: 60,
  },
  nextButton: {
    backgroundColor: COLORS.white,
    paddingVertical: isIPad ? 20 : 18,
    paddingHorizontal: isIPad ? 42 : 36,
    borderRadius: 16,
    minWidth: isIPad ? 160 : 140,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.turquoise,
    shadowColor: COLORS.turquoise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedButton: {
    backgroundColor: COLORS.turquoise,
    minWidth: isIPad ? 200 : 180,
    borderWidth: 0,
    shadowColor: COLORS.turquoise,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: isIPad ? 16 : 15,
    fontWeight: '700',
    color: COLORS.turquoise,
    letterSpacing: 0.5,
  },
  getStartedButtonText: {
    fontSize: isIPad ? 17 : 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({
  navigation,
}) => {
  // Use dynamic dimensions hook
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isIPad = SCREEN_WIDTH >= 768;

  console.log('🔍 [OnboardingSlider] Component mounted - Width:', SCREEN_WIDTH, 'isIPad:', isIPad);

  // Create dynamic styles based on current dimensions
  const styles = createDynamicStyles(isIPad);

  const sliderRef = useRef<AppIntroSlider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sliderReady, setSliderReady] = useState(false);
  const sliderOpacity = useRef(new Animated.Value(0)).current;

  // Memoized getItemLayout for FlatList optimization
  // This tells FlatList exactly where each item is without measuring
  const getItemLayout = useMemo(
    () => (_data: any, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [SCREEN_WIDTH]
  );

  // Log initial mount and show slider after brief delay
  useEffect(() => {
    console.log('✨ [OnboardingSlider] Mounted - currentIndex:', currentIndex);

    // Small delay to ensure FlatList is positioned correctly, then fade in
    const timer = setTimeout(() => {
      console.log('✅ [OnboardingSlider] Making slider visible');
      setSliderReady(true);
      Animated.timing(sliderOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle Skip - Jump to last slide
   */
  const handleSkip = () => {
    console.log('⏭️ Skip pressed - jumping to last slide');
    const lastIndex = ONBOARDING_SLIDES.length - 1;
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
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
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
    if (isTransitioning) {
      console.log('⚠️ Already transitioning, ignoring tap');
      return; // Prevent double-tap
    }

    console.log('🎯 GET STARTED button pressed');
    setIsTransitioning(true);

    try {
      // Save onboarding completion FIRST (before any animation or navigation)
      console.log('💾 [OnboardingSlider] Saving onboarding completion...');
      await setOnboardingCompleted();
      console.log('✅ [OnboardingSlider] Onboarding completion saved and verified');

      // Small delay to ensure AsyncStorage write is fully committed
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('⏱️ [OnboardingSlider] Storage commit delay complete');

      // Then start fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // After fade completes, navigate
        console.log('🚀 [OnboardingSlider] Navigating to Welcome screen...');
        navigation.replace('Welcome');
      });
    } catch (error) {
      console.error('❌ [OnboardingSlider] Error completing onboarding:', error);
      // Still navigate even if storage fails (user can onboard again if needed)
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
            {item.key === '1' ? (
              <LottieView
                source={require('../../assets/1st-screen.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : item.key === '2' ? (
              <LottieView
                source={require('../../assets/2nd-screen.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : item.key === '3' ? (
              <LottieView
                source={require('../../assets/3rd-screen.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : item.key === '4' ? (
              <LottieView
                source={require('../../assets/4th-screen.json')}
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
          <Text style={styles.highlight}>{item.highlight}</Text>
          <Text style={styles.subtext}>{item.subtext}</Text>
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
        {ONBOARDING_SLIDES.map((_, index) => (
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
    const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

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
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: sliderOpacity }}>
          {/* Skip Button (hidden on last slide) */}
          {currentIndex < ONBOARDING_SLIDES.length - 1 && (
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
            key="onboarding-slider-key"
            ref={sliderRef}
            data={ONBOARDING_SLIDES}
            renderItem={renderSlide}
            initialScrollIndex={0}
            initialNumToRender={1}
            getItemLayout={getItemLayout}
            windowSize={3}
            onSlideChange={(index) => {
              console.log(`📍 [Slider] Slide changed to index: ${index}`);
              setCurrentIndex(index);
            }}
            showNextButton={false}
            showDoneButton={false}
            activeDotStyle={{ display: 'none' }}
            dotStyle={{ display: 'none' }}
          />

          {/* Custom Pagination */}
          {renderPagination()}

          {/* Bottom Buttons */}
          {renderBottomButtons()}
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
};

