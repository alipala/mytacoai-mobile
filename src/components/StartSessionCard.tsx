import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

interface StartSessionCardProps {
  onPress: () => void;
}

export const StartSessionCard: React.FC<StartSessionCardProps> = ({ onPress }) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="add-circle" size={48} color="#8B5CF6" />
      </View>
      <Text style={styles.text}>{t('buttons.start')}</Text>
      <Text style={styles.subtitle}>{t('dashboard.quick_start.subtitle')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 32,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A78BFA',
  },
});
