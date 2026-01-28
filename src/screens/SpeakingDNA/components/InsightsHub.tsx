/**
 * Insights Hub Component
 *
 * Visual grid layout showing top strengths and growth areas
 * with icons, colors, and quick visual cues
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, GRADIENTS, SHADOWS, ICON_SIZES } from '../constants';
import { InsightsHubProps } from '../types';

/**
 * Get icon for insight text
 */
const getInsightIcon = (text: string, type: 'strength' | 'growth'): string => {
  const lowerText = text.toLowerCase();

  // Strength-specific icons
  if (type === 'strength') {
    if (lowerText.includes('confident') || lowerText.includes('confidence')) return 'shield-checkmark';
    if (lowerText.includes('vocabulary') || lowerText.includes('word')) return 'book';
    if (lowerText.includes('grammar') || lowerText.includes('accuracy')) return 'checkmark-done';
    if (lowerText.includes('rhythm') || lowerText.includes('pace')) return 'pulse';
    if (lowerText.includes('engage') || lowerText.includes('participation')) return 'chatbubbles';
    if (lowerText.includes('learning') || lowerText.includes('curiosity')) return 'bulb';
    return 'star';
  }

  // Growth area icons
  if (lowerText.includes('confident') || lowerText.includes('confidence')) return 'trending-up';
  if (lowerText.includes('vocabulary') || lowerText.includes('word')) return 'library';
  if (lowerText.includes('grammar') || lowerText.includes('accuracy')) return 'hammer';
  if (lowerText.includes('rhythm') || lowerText.includes('pace')) return 'speedometer';
  if (lowerText.includes('engage') || lowerText.includes('participation')) return 'megaphone';
  if (lowerText.includes('learning') || lowerText.includes('curiosity')) return 'rocket';
  return 'arrow-up-circle';
};

/**
 * Individual Visual Insight Card
 */
const VisualInsightCard: React.FC<{
  text: string;
  type: 'strength' | 'growth';
  index: number;
}> = ({ text, type, index }) => {
  const isStrength = type === 'strength';
  const gradientColors = isStrength ? GRADIENTS.success : GRADIENTS.warning;
  const iconName = getInsightIcon(text, type);

  // Format text: convert snake_case to Title Case
  const textString = typeof text === 'string' ? text : JSON.stringify(text);
  const formattedText = textString
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Trigger haptic feedback on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Animated.View
      style={[styles.insightCard, SHADOWS.md]}
      entering={FadeInDown.delay(index * 80).springify()}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={[`${gradientColors[0]}15`, `${gradientColors[1]}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: `${gradientColors[0]}20` }]}>
        <Ionicons name={iconName as any} size={20} color={gradientColors[0]} />
      </View>

      {/* Text */}
      <Text style={styles.insightCardText} numberOfLines={2}>
        {formattedText}
      </Text>

      {/* Type indicator */}
      <View style={styles.typeIndicator}>
        <Ionicons
          name={isStrength ? 'checkmark-circle' : 'arrow-up'}
          size={12}
          color={isStrength ? COLORS.success : COLORS.warning}
        />
      </View>
    </Animated.View>
  );
};

/**
 * Insights Hub Component
 */
export const InsightsHub: React.FC<InsightsHubProps> = ({ strengths, growthAreas }) => {
  // Show top 3 of each
  const topStrengths = strengths.slice(0, 3);
  const topGrowthAreas = growthAreas.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Ionicons name="bulb" size={ICON_SIZES.lg} color={COLORS.primary[500]} />
        <Text style={styles.headerTitle}>Key Insights</Text>
      </View>

      {/* Strengths Section */}
      {topStrengths.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={16} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Top Strengths</Text>
          </View>
          <View style={styles.cardsGrid}>
            {topStrengths.map((strength, index) => (
              <VisualInsightCard
                key={`strength-${index}`}
                text={strength}
                type="strength"
                index={index}
              />
            ))}
          </View>
        </View>
      )}

      {/* Growth Areas Section */}
      {topGrowthAreas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={16} color={COLORS.warning} />
            <Text style={styles.sectionTitle}>Focus Areas</Text>
          </View>
          <View style={styles.cardsGrid}>
            {topGrowthAreas.map((area, index) => (
              <VisualInsightCard
                key={`growth-${index}`}
                text={area}
                type="growth"
                index={index + topStrengths.length}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  insightCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[800],
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
  typeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default InsightsHub;
