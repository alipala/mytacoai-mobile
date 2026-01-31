/**
 * Compact Dashboard Header
 *
 * Combines Logo + Premium Badge + Streak Badge in one compact row
 * Saves ~80px vertical space compared to separate cards
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { styles } from './styles/CompactDashboardHeader.styles';

interface CompactDashboardHeaderProps {
  // Premium status
  isPremium: boolean;
  minutesRemaining?: number;
  planName?: string;

  // Streak data
  currentStreak: number;
  longestStreak: number;

  // Callbacks
  onPremiumPress?: () => void;
  onStreakPress?: () => void;
}

export const CompactDashboardHeader: React.FC<CompactDashboardHeaderProps> = ({
  isPremium,
  minutesRemaining = 0,
  planName = 'Free',
  currentStreak,
  longestStreak,
  onPremiumPress,
  onStreakPress,
}) => {
  const handlePremiumPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPremiumPress?.();
  };

  const handleStreakPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onStreakPress?.();
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>myTaco<Text style={styles.appNameAI}>AI</Text></Text>
      </View>

      {/* Right Section: Premium + Streak */}
      <View style={styles.badgesSection}>
        {/* Premium Badge */}
        {isPremium ? (
          <TouchableOpacity
            style={styles.premiumBadge}
            onPress={handlePremiumPress}
            activeOpacity={0.8}
          >
            {/* Outer glow for premium feel */}
            <View style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 14,
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
              opacity: 0.5,
            }} />
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(245, 158, 11, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumGradient}
            >
              <Ionicons name="diamond-outline" size={16} color="#FBBF24" />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumLabel}>Premium</Text>
                {minutesRemaining > 0 && (
                  <Text style={styles.premiumMinutes}>{minutesRemaining} min</Text>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.freeBadge}
            onPress={handlePremiumPress}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={12} color="#9CA3AF" />
            <Text style={styles.freeLabel}>Free Plan</Text>
          </TouchableOpacity>
        )}

        {/* Streak Badge */}
        <TouchableOpacity
          style={styles.streakBadge}
          onPress={handleStreakPress}
          activeOpacity={0.8}
        >
          {/* Outer glow for streak */}
          <View style={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 14,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            opacity: 0.5,
          }} />
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.15)', 'rgba(220, 38, 38, 0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakGradient}
          >
            <Ionicons name="flame-outline" size={18} color="#EF4444" />
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>day{currentStreak !== 1 ? 's' : ''}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
