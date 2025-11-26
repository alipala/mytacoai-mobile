import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { welcomeStyles, COLORS } from '../styles/OnboardingScreen.styles';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function WelcomeSlide() {
  const gradientProgress = useSharedValue(0);

  useEffect(() => {
    gradientProgress.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedGradientStyle = useAnimatedStyle(() => {
    return {
      opacity: 1,
    };
  });

  return (
    <View style={welcomeStyles.container}>
      {/* Headline with Animated Gradient */}
      <View style={welcomeStyles.headlineContainer}>
        <AnimatedLinearGradient
          colors={[
            COLORS.primary,
            COLORS.primaryDark,
            '#6366f1',
            '#8b5cf6',
            '#ec4899',
            COLORS.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[welcomeStyles.gradientText, animatedGradientStyle]}
        >
          <Text style={[welcomeStyles.headline, { color: 'transparent' }]}>
            <Text
              style={{
                ...welcomeStyles.headline,
                color: COLORS.textDark,
              }}
            >
              Speak Confidently{'\n'}in Any Language
            </Text>
          </Text>
        </AnimatedLinearGradient>
      </View>

      {/* Subheadline */}
      <Text style={welcomeStyles.subheadline}>
        Practice real conversations with AI tutors designed to overcome speaking anxiety
      </Text>

      {/* Lottie Animation */}
      <View style={welcomeStyles.animationContainer}>
        <LottieView
          source={require('../../../assets/animations/conversation.json')}
          autoPlay
          loop
          style={{ width: '100%', height: '100%' }}
          speed={1.0}
        />
      </View>
    </View>
  );
}
