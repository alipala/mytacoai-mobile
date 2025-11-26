import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { featuresStyles } from '../styles/OnboardingScreen.styles';

interface FeatureCardProps {
  emoji: string;
  title: string;
  text: string;
  index: number;
}

function FeatureCard({ emoji, title, text, index }: FeatureCardProps) {
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    // Stagger animation for each card
    const delay = index * 150;

    setTimeout(() => {
      fadeAnim.value = withTiming(1, { duration: 600 });
      scaleAnim.value = withSpring(1, { damping: 12 });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={[featuresStyles.card, animatedStyle]}>
      <Text style={featuresStyles.cardEmoji}>{emoji}</Text>
      <Text style={featuresStyles.cardTitle}>{title}</Text>
      <Text style={featuresStyles.cardText}>{text}</Text>
    </Animated.View>
  );
}

export default function FeaturesSlide() {
  const features = [
    {
      emoji: '💬',
      title: 'Talk Naturally',
      text: 'No scripts, just real conversations',
    },
    {
      emoji: '⚡',
      title: 'Instant Feedback',
      text: 'Get corrections as you speak',
    },
    {
      emoji: '💼',
      title: 'Job Interview Practice',
      text: 'Prepare for presentations & meetings',
    },
    {
      emoji: '🎯',
      title: 'Build Confidence',
      text: 'Practice in a safe, judgment-free space',
    },
  ];

  return (
    <View style={featuresStyles.container}>
      {/* Icon */}
      <Text style={featuresStyles.icon}>🎤</Text>

      {/* Headline */}
      <Text style={featuresStyles.headline}>Real-Time Voice Conversations</Text>

      {/* Feature Cards Grid */}
      <View style={featuresStyles.cardsContainer}>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            emoji={feature.emoji}
            title={feature.title}
            text={feature.text}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}
