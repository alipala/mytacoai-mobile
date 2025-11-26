import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import WelcomeSlide from './components/WelcomeSlide';
import FeaturesSlide from './components/FeaturesSlide';
import SocialProofSlide from './components/SocialProofSlide';
import PaginationDots from './components/PaginationDots';
import { onboardingStorage } from './utils/onboardingStorage';
import { styles, COLORS } from './styles/OnboardingScreen.styles';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const slides = [
  { id: '1', component: WelcomeSlide },
  { id: '2', component: FeaturesSlide },
  { id: '3', component: SocialProofSlide },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await onboardingStorage.completeOnboarding();
      // @ts-ignore - Navigate to AuthChoice screen
      navigation.replace('AuthChoice');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleGetStarted = () => {
    handleComplete();
  };

  const handleSignIn = () => {
    handleComplete();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    const Component = item.component;

    // Pass props to SocialProofSlide
    if (index === 2) {
      return (
        <Component
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
      );
    }

    return <Component />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <AnimatedFlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom Controls (Hidden on last slide since it has its own CTA) */}
      {currentIndex < slides.length - 1 && (
        <View style={styles.bottomContainer}>
          <PaginationDots
            data={slides}
            scrollX={scrollX}
            currentIndex={currentIndex}
          />
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={24} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      )}

      {/* Pagination Dots Only on Last Slide */}
      {currentIndex === slides.length - 1 && (
        <View style={[styles.bottomContainer, { justifyContent: 'center' }]}>
          <PaginationDots
            data={slides}
            scrollX={scrollX}
            currentIndex={currentIndex}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
