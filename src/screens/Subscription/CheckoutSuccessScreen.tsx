import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../api/config';

interface CheckoutSuccessScreenProps {
  navigation: any;
}

const CheckoutSuccessScreen: React.FC<CheckoutSuccessScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Sync hearts with subscription after successful checkout
    syncHeartsWithSubscription();
  }, []);

  const syncHeartsWithSubscription = async () => {
    try {
      console.log('🔄 Syncing hearts with subscription after checkout...');
      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        console.warn('⚠️  No auth token found, skipping heart sync');
        return;
      }

      // Step 1: Sync hearts with subscription
      const syncResponse = await fetch(`${API_BASE_URL}/hearts/sync-with-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (syncResponse.ok) {
        const data = await syncResponse.json();
        console.log('✅ Hearts synced successfully:', data);
      } else {
        console.error('❌ Failed to sync hearts:', syncResponse.status);
      }

      // Step 2: Fetch fresh user data from API to update AsyncStorage
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User data refreshed:', userData.subscription_plan);
      } else {
        console.error('❌ Failed to refresh user data:', userResponse.status);
      }
    } catch (error) {
      console.error('❌ Error syncing hearts:', error);
      // Don't block the user experience if sync fails
    }
  };

  const handleContinue = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Navigate to Challenges tab (ExploreScreenRedesigned) with upgrade success flag
    navigation.navigate('Main', {
      screen: 'Challenges',
      params: { upgradeSuccess: true }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#10B981" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>{t('subscription.success.title')}</Text>
        <Text style={styles.subtitle}>
          {t('subscription.success.subtitle')}
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Ionicons name="flash" size={24} color="#4ECFBF" />
            <Text style={styles.benefitText}>
              {t('subscription.success.trial_started')}
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="infinite" size={24} color="#4ECFBF" />
            <Text style={styles.benefitText}>
              {t('subscription.success.unlimited_sessions')}
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="trending-up" size={24} color="#4ECFBF" />
            <Text style={styles.benefitText}>
              {t('subscription.success.advanced_tracking')}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{t('subscription.success.button_start_learning')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          {t('subscription.success.trial_info')}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 40,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECFBF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default CheckoutSuccessScreen;
