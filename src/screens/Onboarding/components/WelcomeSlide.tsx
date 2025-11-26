import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { welcomeStyles } from '../styles/OnboardingScreen.styles';

export default function WelcomeSlide() {
  return (
    <View style={welcomeStyles.container}>
      {/* Lottie Animation - Hero Element */}
      <View style={welcomeStyles.animationContainer}>
        <LottieView
          source={require('../../../assets/animations/conversation.json')}
          autoPlay
          loop
          style={{ width: '100%', height: '100%' }}
          speed={1.0}
        />
      </View>

      {/* Headline - Clean & Bold */}
      <Text style={welcomeStyles.headline}>
        Master Any Language{'\n'}Through Conversation
      </Text>

      {/* Subheadline - Clear Value Prop */}
      <Text style={welcomeStyles.subheadline}>
        AI-powered voice practice that builds real speaking confidence
      </Text>
    </View>
  );
}
