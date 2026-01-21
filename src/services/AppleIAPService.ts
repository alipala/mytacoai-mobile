/**
 * Apple In-App Purchase Service
 * Handles StoreKit integration for iOS subscriptions using react-native-iap
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenAPI } from '../api/generated/core/OpenAPI';

// Dynamic import for iOS only - prevents crash on Android
let RNIap: any = null;
if (Platform.OS === 'ios') {
  RNIap = require('react-native-iap');
}

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
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private isFetchingProducts = false; // Guard against concurrent fetches

  /**
   * Initialize StoreKit connection
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[APPLE_IAP] Not on iOS platform, skipping initialization');
      return false;
    }

    // Already initialized, don't set up listener again
    if (this.isInitialized && this.purchaseUpdateSubscription) {
      console.log('[APPLE_IAP] Already initialized, reusing existing connection');
      return true;
    }

    try {
      console.log('[APPLE_IAP] Initializing react-native-iap...');

      // Initialize IAP connection
      await RNIap.initConnection();
      console.log('[APPLE_IAP] Connected to App Store');

      // Set up purchase listeners (only once)
      if (!this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
          this.handlePurchaseUpdate.bind(this)
        );
        console.log('[APPLE_IAP] Purchase update listener set up');
      }

      if (!this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
          this.handlePurchaseError.bind(this)
        );
        console.log('[APPLE_IAP] Purchase error listener set up');
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
  private async handlePurchaseUpdate(purchase: any) {
    console.log('[APPLE_IAP] Purchase update received:', {
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      transactionReceipt: purchase.transactionReceipt ? 'present' : 'missing',
    });

    try {
      // Get receipt from transaction (iOS only)
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        const verifyResult = await this.verifyReceipt(receipt, purchase.productId);

        if (verifyResult.success) {
          // Finish the transaction (iOS equivalent of acknowledge)
          await RNIap.finishTransaction({ purchase });
          console.log('[APPLE_IAP] Purchase finished and verified');

          // Show success alert
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
        await RNIap.finishTransaction({ purchase });

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
      await RNIap.finishTransaction({ purchase });

      const { Alert } = require('react-native');
      Alert.alert(
        'Verification Error',
        'Your purchase could not be verified. Please contact support if you were charged.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Handle purchase errors from StoreKit
   */
  private handlePurchaseError(error: any) {
    console.log('[APPLE_IAP] Purchase error received:', error);

    // Don't show alert for user cancellation (code: 'E_USER_CANCELLED')
    if (error.code === 'E_USER_CANCELLED') {
      console.log('[APPLE_IAP] User cancelled purchase');
      return;
    }

    // Show alert for other errors
    const { Alert } = require('react-native');
    Alert.alert(
      'Purchase Error',
      error.message || 'An error occurred during purchase. Please try again.',
      [{ text: 'OK' }]
    );
  }

  /**
   * Get available products from App Store with retry logic
   */
  async getProducts(retryCount: number = 3, retryDelay: number = 2000): Promise<IAPProduct[]> {
    if (Platform.OS !== 'ios') {
      return [];
    }

    // Guard: Prevent concurrent product fetches
    if (this.isFetchingProducts) {
      console.warn('[APPLE_IAP] ⚠️ Product fetch already in progress, returning cached products');
      return this.products;
    }

    this.isFetchingProducts = true;
    let lastError: any = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`[APPLE_IAP] Fetching products from App Store (attempt ${attempt}/${retryCount})...`);

        const productIds = Object.values(APPLE_IAP_PRODUCTS);
        console.log(`[APPLE_IAP] Requesting ${productIds.length} product IDs:`, productIds);

        // Fetch subscriptions from App Store (v14 API uses fetchProducts)
        const products = await RNIap.fetchProducts({ skus: productIds });

        console.log(`[APPLE_IAP] Products returned: ${products?.length || 0}`);

        if (!products || products.length === 0) {
          console.warn('[APPLE_IAP] ⚠️ StoreKit returned 0 products - products may be in review status');

          // Retry unless it's the last attempt
          if (attempt < retryCount) {
            console.log(`[APPLE_IAP] Retrying in ${retryDelay}ms...`);
            await this._delay(retryDelay);
            continue;
          }
          this.isFetchingProducts = false;
          return [];
        }

        // Success - map products
        this.products = products.map((product: any) => ({
          productId: product.productId,
          price: product.price || product.localizedPrice,
          localizedPrice: product.localizedPrice,
          title: product.title,
          description: product.description,
        }));

        console.log(`[APPLE_IAP] ✅ Successfully fetched ${this.products.length} products`);
        if (this.products.length > 0) {
          console.log('[APPLE_IAP] Product IDs loaded:', this.products.map(p => p.productId));
        }

        this.isFetchingProducts = false; // Reset guard on success
        return this.products;
      } catch (error) {
        lastError = error;
        console.error(`[APPLE_IAP] Error fetching products (attempt ${attempt}/${retryCount}):`, error);

        // Retry unless it's the last attempt
        if (attempt < retryCount) {
          console.log(`[APPLE_IAP] Retrying in ${retryDelay}ms...`);
          await this._delay(retryDelay);
        }
      }
    }

    // All retries failed
    console.error(`[APPLE_IAP] ❌ Failed to fetch products after ${retryCount} attempts`);
    console.error('[APPLE_IAP] Last error:', lastError);
    this.isFetchingProducts = false; // Reset guard on failure
    return [];
  }

  /**
   * Helper: Delay for retry logic
   */
  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

      // Trigger the subscription purchase
      await RNIap.requestSubscription({
        sku: productId,
      });

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

      // Get available purchases
      const purchases = await RNIap.getAvailablePurchases();

      console.log(`[APPLE_IAP] Found ${purchases?.length || 0} previous purchases`);

      // Process each restored purchase
      if (purchases && purchases.length > 0) {
        for (const purchase of purchases) {
          await this.handlePurchaseUpdate(purchase);
        }

        const { Alert } = require('react-native');
        Alert.alert(
          'Purchases Restored',
          'Your subscriptions have been restored successfully.',
          [{ text: 'OK' }]
        );
      } else {
        const { Alert } = require('react-native');
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.',
          [{ text: 'OK' }]
        );
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
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    if (this.isInitialized && RNIap) {
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('[APPLE_IAP] Disconnected');
    }
  }
}

// Export singleton instance
export default new AppleIAPService();
