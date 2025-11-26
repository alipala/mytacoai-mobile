import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { socialProofStyles, COLORS } from '../styles/OnboardingScreen.styles';

interface StatCardProps {
  number: string;
  label: string;
  index: number;
}

function StatCard({ number, label, index }: StatCardProps) {
  const bounceAnim = useSharedValue(0);

  useEffect(() => {
    // Stagger bounce animation for each stat card
    const delay = index * 100;

    setTimeout(() => {
      bounceAnim.value = withSequence(
        withTiming(1, { duration: 300 }),
        withSpring(1, { damping: 8 })
      );
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: bounceAnim.value,
    transform: [{ scale: bounceAnim.value }],
  }));

  return (
    <Animated.View style={[socialProofStyles.statCard, animatedStyle]}>
      <Text style={socialProofStyles.statNumber}>{number}</Text>
      <Text style={socialProofStyles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

interface SocialProofSlideProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function SocialProofSlide({ onGetStarted, onSignIn }: SocialProofSlideProps) {
  const handleGetStartedPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGetStarted();
  };

  const handleSignInPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSignIn();
  };

  const stats = [
    { number: '95%', label: 'Confidence Increase' },
    { number: '15 min', label: 'Daily Average' },
    { number: '4.8★', label: 'User Rating' },
  ];

  return (
    <View style={socialProofStyles.container}>
      {/* Lottie Animation */}
      <View style={socialProofStyles.animationContainer}>
        <LottieView
          source={require('../../../assets/animations/success.json')}
          autoPlay
          loop
          style={{ width: '100%', height: '100%' }}
          speed={1.0}
        />
      </View>

      {/* Headline */}
      <Text style={socialProofStyles.headline}>
        Join Professionals{'\n'}Mastering Languages
      </Text>

      {/* Subheadline */}
      <Text style={socialProofStyles.subheadline}>
        Trusted by learners in 40+ countries
      </Text>

      {/* Stats Cards */}
      <View style={socialProofStyles.statsContainer}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            number={stat.number}
            label={stat.label}
            index={index}
          />
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity onPress={handleGetStartedPress} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={socialProofStyles.ctaButton}
        >
          <Text style={socialProofStyles.ctaButtonText}>Get Started Free</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary Link */}
      <TouchableOpacity
        style={socialProofStyles.secondaryLink}
        onPress={handleSignInPress}
        activeOpacity={0.7}
      >
        <Text style={socialProofStyles.secondaryLinkText}>
          Already have an account?{' '}
          <Text style={socialProofStyles.linkText}>Sign In</Text>
        </Text>
      </TouchableOpacity>

      {/* Footer Links */}
      <View style={socialProofStyles.footer}>
        <TouchableOpacity>
          <Text style={socialProofStyles.footerText}>Privacy</Text>
        </TouchableOpacity>
        <Text style={socialProofStyles.footerSeparator}>•</Text>
        <TouchableOpacity>
          <Text style={socialProofStyles.footerText}>Terms</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
