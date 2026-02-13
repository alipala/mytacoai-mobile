/**
 * Lifetime Separator Card
 * Beautiful section divider for Lifetime Progress stats
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.5;

export default function LifetimeSeparatorCard() {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim1 = useRef(new Animated.Value(0)).current;
  const sparkleAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animations with delays
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim1, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(sparkleAnim2, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim2, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#FBBF24', '#F59E0B', '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={64} color="#FFFFFF" />
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkleTopRight,
                { opacity: sparkleAnim1 },
              ]}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </Animated.View>
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkleBottomLeft,
                { opacity: sparkleAnim2 },
              ]}
            >
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </Animated.View>
          </View>

          <Text style={styles.title}>Lifetime Progress</Text>
          <Text style={styles.subtitle}>All Time Achievements</Text>

          <View style={styles.decorativeBar} />

          <View style={styles.statsPreview}>
            <View style={styles.previewItem}>
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={styles.previewText}>Streaks</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewItem}>
              <Ionicons name="star" size={24} color="#FFFFFF" />
              <Text style={styles.previewText}>Total XP</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewItem}>
              <Ionicons name="ribbon" size={24} color="#FFFFFF" />
              <Text style={styles.previewText}>Mastery</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: CARD_HEIGHT,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTopRight: {
    top: 0,
    right: 0,
  },
  sparkleBottomLeft: {
    bottom: 0,
    left: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 30,
  },
  decorativeBar: {
    width: 80,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginBottom: 30,
    opacity: 0.5,
  },
  statsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewItem: {
    alignItems: 'center',
    gap: 6,
  },
  previewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  previewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
