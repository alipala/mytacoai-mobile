import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SubscriptionBannerProps {
  plan: string;
  sessionsRemaining: number;
  onUpgradePress: () => void;
  onDismiss?: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  plan,
  sessionsRemaining,
  onUpgradePress,
  onDismiss,
}) => {
  // Only show banner for free/trial users
  if (plan !== 'try_learn') {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4ECFBF', '#3a9e92']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket-outline" size={24} color="#FFFFFF" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>🎉 Ready to Unlock More?</Text>
            <Text style={styles.subtitle}>
              Try & Learn plan • {sessionsRemaining} sessions/month
            </Text>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgradePress}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color="#4ECFBF" />
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 16,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECFBF',
    marginLeft: 4,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});
