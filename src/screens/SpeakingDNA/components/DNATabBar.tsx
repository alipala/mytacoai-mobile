/**
 * DNA Tab Bar Component
 *
 * Swipeable tab navigation for Speaking DNA screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { THEME_COLORS, TAB_LABELS } from '../constants';

interface DNATabBarProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  scrollX?: Animated.Value;
}

export const DNATabBar: React.FC<DNATabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {TAB_LABELS.map((label, index) => {
        const isActive = activeTab === index;

        return (
          <TouchableOpacity
            key={label}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabPress(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLORS.text.secondary,
  },
  tabTextActive: {
    color: THEME_COLORS.text.white,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    backgroundColor: THEME_COLORS.text.white,
    borderRadius: 2,
  },
});
