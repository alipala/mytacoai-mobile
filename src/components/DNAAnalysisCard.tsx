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
      <View style={[styles.card, { backgroundColor: '#6366F1' }]}>
        {/* Sparkles Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={48} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {t('learning_plan.dna_analysis')}
        </Text>

        {/* Subtitle */}
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {t('learning_plan.view_voice_profile')}
        </Text>

        {/* Arrow Icon */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </View>
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
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    flex: 1,
  },
  arrowContainer: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
