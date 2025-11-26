import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { featuresStyles } from '../styles/OnboardingScreen.styles';

interface FeatureRowProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View style={featuresStyles.featureRow}>
      <View style={featuresStyles.iconCircle}>
        <Text style={featuresStyles.featureIcon}>{icon}</Text>
      </View>
      <View style={featuresStyles.featureContent}>
        <Text style={featuresStyles.featureTitle}>{title}</Text>
        <Text style={featuresStyles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function FeaturesSlide() {
  const features = [
    {
      icon: '🎤',
      title: 'Real Voice Practice',
      description: 'Natural conversations, not scripted lessons',
    },
    {
      icon: '⚡',
      title: 'Instant Feedback',
      description: 'Get corrections as you speak',
    },
    {
      icon: '💼',
      title: 'Career Ready',
      description: 'Practice interviews and presentations',
    },
    {
      icon: '🎯',
      title: 'Build Confidence',
      description: 'Safe space to make mistakes and improve',
    },
  ];

  return (
    <View style={featuresStyles.container}>
      {/* Headline */}
      <Text style={featuresStyles.headline}>
        Everything You Need{'\n'}to Speak Fluently
      </Text>

      {/* Lottie Animation */}
      <View style={featuresStyles.animationContainer}>
        <LottieView
          source={require('../../../assets/animations/microphone.json')}
          autoPlay
          loop
          style={{ width: '100%', height: '100%' }}
          speed={1.0}
        />
      </View>

      {/* Features List */}
      <View style={featuresStyles.featuresContainer}>
        {features.map((feature, index) => (
          <FeatureRow
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </View>
    </View>
  );
}
