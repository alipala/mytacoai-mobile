import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Subtle Static Background Gradient
 *
 * A barely noticeable grey-blue gradient that provides
 * a clean, calm background for speech bubbles without
 * distracting from the conversation content.
 */
const ConversationBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']} // Very subtle grey-blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ConversationBackground;
