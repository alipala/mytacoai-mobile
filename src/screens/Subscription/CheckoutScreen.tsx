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
        throw new Error('Invalid plan or period selected');
      }

      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
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
        throw new Error(errorData.detail || 'Failed to create checkout session');
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
          throw new Error('Cannot open checkout URL');
        }
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to start checkout');
      setLoading(false);

      Alert.alert(
        'Checkout Error',
        error.message || 'Failed to start checkout. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => createCheckoutSession(),
          },
          {
            text: 'Cancel',
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
          <Text style={styles.loadingText}>Preparing checkout...</Text>
          <Text style={styles.loadingSubtext}>
            You'll be redirected to Stripe to complete your purchase
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
          <Text style={styles.errorTitle}>Checkout Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={createCheckoutSession}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
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
