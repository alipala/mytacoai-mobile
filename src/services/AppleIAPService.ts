/**
 * Apple In-App Purchase Service
 * Handles StoreKit integration for iOS subscriptions using expo-in-app-purchases
 */

import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenAPI } from '../api/generated/core/OpenAPI';

// Apple IAP Product IDs
export const APPLE_IAP_PRODUCTS = {
  fluency_builder_monthly: 'com.bigdavinci.mytaco.fluency_builder_monthly',
  fluency_builder_annual: 'com.bigdavinci.mytaco.fluency_builder_annual',
  language_mastery_monthly: 'com.bigdavinci.mytaco.language_mastery_monthly',
  language_mastery_annual: 'com.bigdavinci.mytaco.language_mastery_annual',
};

export interface IAPProduct {
  productId: string;
  price: string;
  localizedPrice: string;
  title: string;
  description: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class AppleIAPService {
  private products: IAPProduct[] = [];
  private isInitialized = false;
  private purchaseListener: { remove: () => void } | null = null;

  /**
   * Initialize StoreKit connection
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[APPLE_IAP] Not on iOS platform, skipping initialization');
      return false;
    }

    // Already initialized, don't set up listener again
    if (this.isInitialized && this.purchaseListener) {
      console.log('[APPLE_IAP] Already initialized, reusing existing connection');
      return true;
    }

    try {
      console.log('[APPLE_IAP] Initializing expo-in-app-purchases...');

      // Connect to App Store
      await InAppPurchases.connectAsync();
      console.log('[APPLE_IAP] Connected to App Store');

      // Set up purchase listener (only once)
      if (!this.purchaseListener) {
        this.purchaseListener = InAppPurchases.setPurchaseListener(
          this.handlePurchaseUpdate.bind(this)
        );
        console.log('[APPLE_IAP] Purchase listener set up');
      }

      this.isInitialized = true;
      console.log('[APPLE_IAP] Initialization complete');
      return true;
    } catch (error) {
      console.error('[APPLE_IAP] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Handle purchase updates from StoreKit
   */
  private async handlePurchaseUpdate(purchase: InAppPurchases.InAppPurchase) {
    const { acknowledged, purchaseState, productId } = purchase;

    console.log('[APPLE_IAP] Purchase update received:', {
      productId,
      purchaseState,
      acknowledged,
    });

    // Handle successful purchase
    if (purchaseState === InAppPurchases.InAppPurchaseState.PURCHASED && !acknowledged) {
      console.log('[APPLE_IAP] Processing successful purchase...');

      try {
        // Get receipt from transaction (iOS only)
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          const verifyResult = await this.verifyReceipt(receipt, productId);

          if (verifyResult.success) {
            // Acknowledge the purchase
            await InAppPurchases.finishTransactionAsync(purchase, true);
            console.log('[APPLE_IAP] Purchase acknowledged and verified');

            // Show success alert (using React Native Alert)
            const { Alert } = require('react-native');
            Alert.alert(
              '✅ Purchase Successful',
              'Your subscription has been activated! Enjoy unlimited access to all premium features.',
              [{ text: 'Great!', style: 'default' }]
            );
          } else {
            throw new Error('Receipt verification failed');
          }
        } else {
          console.error('[APPLE_IAP] No receipt found in purchase');
          await InAppPurchases.finishTransactionAsync(purchase, false);

          const { Alert } = require('react-native');
          Alert.alert(
            'Purchase Error',
            'Could not verify your purchase. Please contact support if you were charged.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('[APPLE_IAP] Failed to process purchase:', error);
        // Finish transaction even on error to prevent stuck purchases
        await InAppPurchases.finishTransactionAsync(purchase, false);

        const { Alert } = require('react-native');
        Alert.alert(
          'Verification Error',
          'Your purchase could not be verified. Please contact support if you were charged.',
          [{ text: 'OK' }]
        );
      }
    }

    // Handle restored purchase
    if (purchaseState === InAppPurchases.InAppPurchaseState.RESTORED && !acknowledged) {
      console.log('[APPLE_IAP] Processing restored purchase...');
      await InAppPurchases.finishTransactionAsync(purchase, true);

      const { Alert } = require('react-native');
      Alert.alert(
        'Purchase Restored',
        'Your subscription has been restored successfully.',
        [{ text: 'OK' }]
      );
    }

    // Handle failed/cancelled purchase
    if (purchaseState === InAppPurchases.InAppPurchaseState.FAILED) {
      console.log('[APPLE_IAP] Purchase failed or cancelled by user');
      await InAppPurchases.finishTransactionAsync(purchase, false);
      // Don't show alert for cancellation - user knows they cancelled
    }

    // Handle deferred purchase (Ask to Buy)
    if (purchaseState === InAppPurchases.InAppPurchaseState.DEFERRED) {
      console.log('[APPLE_IAP] Purchase deferred (Ask to Buy)');

      const { Alert } = require('react-native');
      Alert.alert(
        'Purchase Pending',
        'Your purchase requires approval. You will receive a notification when approved.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Get available products from App Store
   */
  async getProducts(): Promise<IAPProduct[]> {
    if (Platform.OS !== 'ios') {
      return [];
    }

    try {
      console.log('[APPLE_IAP] Fetching products from App Store...');

      const productIds = Object.values(APPLE_IAP_PRODUCTS);
      const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);

      if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
        console.error('[APPLE_IAP] Failed to fetch products, response code:', responseCode);
        return [];
      }

      this.products = results.map((product) => ({
        productId: product.productId,
        price: product.price,
        localizedPrice: product.price, // Already formatted with currency symbol
        title: product.title,
        description: product.description,
      }));

      console.log(`[APPLE_IAP] Successfully fetched ${this.products.length} products`);
      return this.products;
    } catch (error) {
      console.error('[APPLE_IAP] Failed to get products:', error);
      return [];
    }
  }

  /**
   * Purchase a subscription product via StoreKit
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Not on iOS platform',
      };
    }

    if (!this.isInitialized) {
      console.log('[APPLE_IAP] Not initialized, initializing now...');
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize IAP',
        };
      }
    }

    try {
      console.log(`[APPLE_IAP] Initiating purchase for: ${productId}`);

      // Trigger the purchase
      await InAppPurchases.purchaseItemAsync(productId);

      // Note: The actual purchase result will be handled in handlePurchaseUpdate
      // This just initiates the purchase flow
      console.log('[APPLE_IAP] Purchase initiated successfully');

      return {
        success: true,
      };
    } catch (error) {
      console.error('[APPLE_IAP] Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  /**
   * Verify receipt with backend
   */
  async verifyReceipt(
    receiptData: string,
    productId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[APPLE_IAP] Verifying receipt with backend...');

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const baseUrl = OpenAPI.BASE || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/apple-iap/verify-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receipt_data: receiptData,
          product_id: productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Receipt verification failed');
      }

      const data = await response.json();
      console.log('[APPLE_IAP] Receipt verified successfully:', data);

      return { success: true };
    } catch (error) {
      console.error('[APPLE_IAP] Receipt verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Not on iOS platform',
      };
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize IAP',
        };
      }
    }

    try {
      console.log('[APPLE_IAP] Restoring purchases...');

      const { results, responseCode } = await InAppPurchases.getPurchaseHistoryAsync();

      if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
        throw new Error('Failed to restore purchases');
      }

      console.log(`[APPLE_IAP] Found ${results?.length || 0} previous purchases`);

      // Process each restored purchase
      if (results && results.length > 0) {
        for (const purchase of results) {
          await this.handlePurchaseUpdate(purchase);
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('[APPLE_IAP] Failed to restore purchases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }

  /**
   * Check if Apple IAP is available and ready
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    // Check if we can initialize (will return true if already initialized)
    if (!this.isInitialized) {
      return await this.initialize();
    }

    return this.isInitialized;
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.purchaseListener) {
      this.purchaseListener.remove();
      this.purchaseListener = null;
    }

    if (this.isInitialized) {
      await InAppPurchases.disconnectAsync();
      this.isInitialized = false;
      console.log('[APPLE_IAP] Disconnected');
    }
  }
}

// Export singleton instance
export default new AppleIAPService();
