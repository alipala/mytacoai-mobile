/**
 * DNA Header Component
 *
 * Header with back button, title, and language indicator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../constants.OLD';

interface DNAHeaderProps {
  language: string;
  onBack: () => void;
}

export const DNAHeader: React.FC<DNAHeaderProps> = ({ language, onBack }) => {
  const languageFormatted = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={THEME_COLORS.text.white} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Your Speaking DNA</Text>
        <Text style={styles.headerLanguage}>{languageFormatted}</Text>
      </View>

      <View style={styles.headerRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text.white,
  },
  headerLanguage: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
});
