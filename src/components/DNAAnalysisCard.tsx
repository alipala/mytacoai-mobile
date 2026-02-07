import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

interface DNAAnalysisCardProps {
  onPress: () => void;
}

export const DNAAnalysisCard: React.FC<DNAAnalysisCardProps> = ({ onPress }) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Voice DNA Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>VOICE DNA</Text>
        </View>

        {/* Sparkles Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={52} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {t('learning_plan.dna_analysis')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.cardSubtitle} numberOfLines={3}>
          {t('learning_plan.view_voice_profile')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#14B8A6',
    justifyContent: 'space-between',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  labelContainer: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  labelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
