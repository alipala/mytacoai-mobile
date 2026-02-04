import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { OpenAPI } from '../../api/generated/core/OpenAPI';

interface CheckoutScreenProps {
  navigation: any;
  route: {
    params: {
      planId: string;
      period: 'monthly' | 'annual';
    };
  };
}

// Price IDs mapping (must match backend Stripe configuration)
const PRICE_IDS = {
  fluency_builder: {
    monthly: 'price_1RdxNjJcquSiYwWN2XQMwwYW',
    annual: 'price_1RdxNjJcquSiYwWNIpmYrKSE',
  },
  language_mastery: {
    monthly: 'price_1RdxlGJcquSiYwWNWvyEgmgL',
    annual: 'price_1RdxmRJcquSiYwWN7Oc6NnNe',
  },
  // Backward compatibility for old plan ID
  team_mastery: {
    monthly: 'price_1RdxlGJcquSiYwWNWvyEgmgL',
    annual: 'price_1RdxmRJcquSiYwWN7Oc6NnNe',
  },
};

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { planId, period } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createCheckoutSession();
  }, []);

  const createCheckoutSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the price ID for the selected plan and period
      const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS]?.[period];

      if (!priceId) {
        throw new Error(t('subscription.checkout.error_invalid_plan'));
      }

      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error(t('subscription.checkout.error_not_authenticated'));
      }

      // Create checkout session
      const response = await fetch(
        `${OpenAPI.BASE}/api/stripe/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: 'mytacoai://checkout-success',
            cancel_url: 'mytacoai://checkout-cancel',
            guest_checkout: false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('subscription.checkout.error_create_session'));
      }

      const data = await response.json();

      // Open the Stripe checkout URL
      if (data.url) {
        const canOpen = await Linking.canOpenURL(data.url);
        if (canOpen) {
          await Linking.openURL(data.url);

          // Wait a bit and then navigate back to dashboard
          setTimeout(() => {
            navigation.navigate('Main', { screen: 'Dashboard' });
          }, 1000);
        } else {
          throw new Error(t('subscription.checkout.error_cannot_open_url'));
        }
      } else {
        throw new Error(t('subscription.checkout.error_no_url'));
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || t('subscription.checkout.error_default'));
      setLoading(false);

      Alert.alert(
        t('subscription.checkout.error_title'),
        error.message || t('subscription.checkout.error_default'),
        [
          {
            text: t('subscription.checkout.button_try_again'),
            onPress: () => createCheckoutSession(),
          },
          {
            text: t('buttons.cancel'),
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECFBF" />
          <Text style={styles.loadingText}>{t('subscription.checkout.loading_title')}</Text>
          <Text style={styles.loadingSubtext}>
            {t('subscription.checkout.loading_subtitle')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>{t('subscription.checkout.error_title')}</Text>
          <Text style={styles.errorMessage}>{error}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={createCheckoutSession}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>{t('subscription.checkout.button_try_again')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Text style={styles.backButtonText}>{t('subscription.checkout.button_go_back')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECFBF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default CheckoutScreen;
