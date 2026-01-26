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
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import LottieView from 'lottie-react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { COLORS } from '../../constants/colors';
import { setOnboardingCompleted } from '../../utils/storage';

interface OnboardingSlide {
  key: string;
  title: string;
  subtext: string;
  backgroundColor: string;
}

interface OnboardingSliderProps {
  navigation: any;
}

// Onboarding slide data - Defined outside component to prevent re-creation on every render
const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: '1',
    title: "Real Conversations Shouldn't Cost a Fortune",
    subtext: "Join 50,000+ learners speaking daily without breaking the bank.",
    backgroundColor: '#79C3F4', // Light blue
  },
  {
    key: '2',
    title: "Make Mistakes 100 Times!",
    subtext: "Unlimited do-overs without the fear that stops most learners.",
    backgroundColor: '#FFB3BA', // Light pink/salmon
  },
  {
    key: '3',
    title: "Your Pace. Your Schedule",
    subtext: "Speak when you can. Play challenges when you can't.",
    backgroundColor: '#B8B5FF', // Light purple
  },
  {
    key: '4',
    title: "Speak Confidently in Real Life",
    subtext: "Go from practicing alone to speaking freely with real people.",
    backgroundColor: '#FFD6A5', // Light orange
  },
];

// Create dynamic styles based on device type
const createDynamicStyles = (isIPad: boolean, screenHeight: number) => StyleSheet.create({
  container: {
    flex: 1,
    // Background color is set dynamically based on current slide
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF', // White background for bottom area
  },
  // Upper colorful container (50% of screen) - extends to top including status bar
  upperContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // Account for status bar
  },
  illustrationContainer: {
    width: isIPad ? 340 : 260,
    height: isIPad ? 340 : 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Lower white rounded card (50% of screen)
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 140,
    minHeight: screenHeight * 0.5,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  lottieAnimation: {
    width: isIPad ? 340 : 260,
    height: isIPad ? 340 : 260,
  },
  lottieAnimation3rd: {
    width: isIPad ? 380 : 300,
    height: isIPad ? 380 : 300,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: isIPad ? 32 : 28,
    fontWeight: '700',
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: isIPad ? 14 : 12,
    letterSpacing: 0,
    lineHeight: isIPad ? 40 : 36,
  },
  subtext: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: isIPad ? 16 : 14,
    fontWeight: '500',
    color: '#8E8E8E',
    textAlign: 'center',
    lineHeight: isIPad ? 24 : 22,
    letterSpacing: 0,
  },
  // Skip button (top right) - modern and simple
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipButtonText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  // Bottom buttons container
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
    backgroundColor: COLORS.white,
    paddingVertical: isIPad ? 20 : 18,
    paddingHorizontal: isIPad ? 42 : 36,
    borderRadius: 16,
    minWidth: isIPad ? 160 : 140,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: isIPad ? 16 : 15,
    fontWeight: '700',
    color: COLORS.textGray,
    letterSpacing: 0.5,
  },
  spacer: {
    width: isIPad ? 160 : 140, // Match button width
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
    fontFamily: 'Montserrat_500Medium',
    fontSize: isIPad ? 16 : 15,
    fontWeight: '700',
    color: COLORS.turquoise,
    letterSpacing: 0.5,
  },
  getStartedButtonText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: isIPad ? 17 : 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({
  navigation,
}) => {
  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_500Medium,
  });

  // Use dynamic dimensions hook
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const isIPad = SCREEN_WIDTH >= 768;

  console.log('🔍 [OnboardingSlider] Component mounted - Width:', SCREEN_WIDTH, 'isIPad:', isIPad);

  // Create dynamic styles based on current dimensions
  const styles = createDynamicStyles(isIPad, SCREEN_HEIGHT);

  const sliderRef = useRef<AppIntroSlider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);
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
      Animated.timing(sliderOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, 100);

    return () => clearTimeout(timer);
  }, [sliderOpacity]);

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
      setCurrentIndex(prevIndex);
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
   * Render individual slide with new two-tone layout
   */
  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    // Use larger container for 3rd animation
    const containerSize = item.key === '3'
      ? { width: isIPad ? 380 : 300, height: isIPad ? 380 : 300 }
      : styles.illustrationContainer;

    return (
      <View style={styles.slide}>
        {/* Upper colorful container with animation */}
        <View style={[styles.upperContainer, { backgroundColor: item.backgroundColor }]}>
          <View style={containerSize}>
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
                style={styles.lottieAnimation3rd}
              />
            ) : item.key === '4' ? (
              <LottieView
                source={require('../../assets/4th-screen.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : null}
          </View>
        </View>

        {/* Lower white rounded card with text content */}
        <View style={styles.contentCard}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtext}>{item.subtext}</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render bottom buttons (BACK, NEXT, GET STARTED)
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


  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }


  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
      }}>
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={[]}>
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

            {/* Bottom Buttons */}
            {renderBottomButtons()}
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

