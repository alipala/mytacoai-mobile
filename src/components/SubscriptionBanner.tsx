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
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Unlock Premium Features</Text>
            <Text style={styles.subtitle}>
              {sessionsRemaining} sessions left • Try & Learn Plan
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => {
            console.log('🚀 Upgrade button pressed in SubscriptionBanner');
            onUpgradePress();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.upgradeText}>Upgrade Now</Text>
          <Ionicons name="arrow-forward-circle" size={20} color="#4ECFBF" />
        </TouchableOpacity>

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={24} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4ECFBF',
    marginRight: 8,
    letterSpacing: 0.3,
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 2,
  },
});
