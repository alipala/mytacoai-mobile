/**
 * Immersive Header Component
 *
 * Modern gamified header inspired by Duolingo & fitness apps
 * Shows user level, XP, streak in an engaging way
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ImmersiveHeaderProps {
  userName?: string;
  streak?: number;
  totalXP?: number;
  challengesToday?: number;
}

export default function ImmersiveHeader({
  userName = 'Learner',
  streak = 0,
  totalXP = 0,
  challengesToday = 0,
}: ImmersiveHeaderProps) {
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Streak pulse animation (if streak exists)
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(streakPulse, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(streakPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [streak]);

  // Determine greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Determine motivation message
  const getMotivation = () => {
    if (challengesToday === 0) return "Ready to level up? 🚀";
    if (challengesToday < 5) return "You're on fire! Keep going! 🔥";
    if (challengesToday < 10) return "Crushing it today! 💪";
    return "Legendary performance! ⚡";
  };

  // Calculate user level (rough approximation)
  const userLevel = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = ((userLevel * 100) - totalXP);
  const levelProgress = ((totalXP % 100) / 100) * 100;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#0D9488', '#14B8A6', '#5EEAD4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Centered Title with Streak Badge */}
        <View style={styles.headerRow}>
          <Text style={styles.mainTitle}>Ready to Level Up? 🚀</Text>

          {/* Streak Badge */}
          {streak > 0 && (
            <Animated.View
              style={[
                styles.streakBadge,
                {
                  transform: [{ scale: streakPulse }],
                },
              ]}
            >
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNumber}>{streak}</Text>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  streakFire: {
    fontSize: 20,
    marginRight: 4,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
