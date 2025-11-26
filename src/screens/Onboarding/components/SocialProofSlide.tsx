import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { socialProofStyles, COLORS } from '../styles/OnboardingScreen.styles';

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
        Join Thousands of{'\n'}Language Learners
      </Text>

      {/* Subheadline */}
      <Text style={socialProofStyles.subheadline}>
        Trusted by professionals in 40+ countries
      </Text>

      {/* Stats Row - Cleaner Design */}
      <View style={socialProofStyles.statsRow}>
        <View style={socialProofStyles.stat}>
          <Text style={socialProofStyles.statNumber}>10K+</Text>
          <Text style={socialProofStyles.statLabel}>Active Users</Text>
        </View>
        <View style={socialProofStyles.statDivider} />
        <View style={socialProofStyles.stat}>
          <Text style={socialProofStyles.statNumber}>4.8★</Text>
          <Text style={socialProofStyles.statLabel}>App Rating</Text>
        </View>
        <View style={socialProofStyles.statDivider} />
        <View style={socialProofStyles.stat}>
          <Text style={socialProofStyles.statNumber}>15min</Text>
          <Text style={socialProofStyles.statLabel}>Daily Avg</Text>
        </View>
      </View>

      {/* CTA Buttons Container */}
      <View style={socialProofStyles.buttonsContainer}>
        {/* Primary CTA - Get Started */}
        <TouchableOpacity onPress={handleGetStartedPress} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={socialProofStyles.primaryButton}
          >
            <Text style={socialProofStyles.primaryButtonText}>Get Started Free</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary CTA - Sign In */}
        <TouchableOpacity
          style={socialProofStyles.secondaryButton}
          onPress={handleSignInPress}
          activeOpacity={0.8}
        >
          <Text style={socialProofStyles.secondaryButtonText}>
            Already have an account? <Text style={socialProofStyles.secondaryButtonLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
