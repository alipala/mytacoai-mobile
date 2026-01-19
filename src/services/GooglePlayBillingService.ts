/**
 * Google Play Billing Service
 * Handles Google Play Billing integration for Android subscriptions using expo-in-app-purchases
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenAPI } from '../api/generated/core/OpenAPI';

// Dynamic import for Android only - prevents crash on iOS
let InAppPurchases: any = null;
if (Platform.OS === 'android') {
  InAppPurchases = require('expo-in-app-purchases');
}

// Google Play Product IDs (IMPORTANT: These must match exactly in Google Play Console)
export const GOOGLE_PLAY_PRODUCTS = {
  fluency_builder_monthly: 'fluency_builder_monthly',
  fluency_builder_annual: 'fluency_builder_annual',
  language_mastery_monthly: 'language_mastery_monthly',
  language_mastery_annual: 'language_mastery_annual',
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

class GooglePlayBillingService {
  private products: IAPProduct[] = [];
  private isInitialized = false;
  private purchaseListener: { remove: () => void } | null = null;
  private isFetchingProducts = false; // Guard against concurrent fetches

  /**
   * Initialize Google Play Billing connection
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('[GOOGLE_PLAY] Not on Android platform, skipping initialization');
      return false;
    }

    // Already initialized, don't set up listener again
    if (this.isInitialized && this.purchaseListener) {
      console.log('[GOOGLE_PLAY] Already initialized, reusing existing connection');
      return true;
    }

    try {
      console.log('[GOOGLE_PLAY] Initializing expo-in-app-purchases...');

      // Connect to Google Play Billing (handle already connected case)
      try {
        await InAppPurchases.connectAsync();
        console.log('[GOOGLE_PLAY] Connected to Google Play Billing');
      } catch (connectError: any) {
        // If already connected, that's fine - treat as success
        if (connectError?.code === 'ERR_IN_APP_PURCHASES_CONNECTION') {
          console.log('[GOOGLE_PLAY] Already connected to Google Play Billing - reusing connection');
        } else {
          throw connectError;
        }
      }

      // Set up purchase listener (only once)
      if (!this.purchaseListener) {
        this.purchaseListener = InAppPurchases.setPurchaseListener(
          this.handlePurchaseUpdate.bind(this)
        );
        console.log('[GOOGLE_PLAY] Purchase listener set up');
      }

      this.isInitialized = true;
      console.log('[GOOGLE_PLAY] Initialization complete');
      return true;
    } catch (error) {
      console.error('[GOOGLE_PLAY] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Handle purchase updates from Google Play
   */
  private async handlePurchaseUpdate(purchase: any) {
    const { acknowledged, purchaseState, productId } = purchase;

    console.log('[GOOGLE_PLAY] Purchase update received:', {
      productId,
      purchaseState,
      acknowledged,
    });

    // Handle successful purchase
    if (purchaseState === InAppPurchases.InAppPurchaseState.PURCHASED && !acknowledged) {
      console.log('[GOOGLE_PLAY] Processing successful purchase...');

      try {
        // Get purchase token (Android only)
        const purchaseToken = purchase.purchaseToken;
        if (purchaseToken) {
          const verifyResult = await this.verifyPurchase(purchaseToken, productId);

          if (verifyResult.success) {
            // Acknowledge the purchase
            await InAppPurchases.finishTransactionAsync(purchase, true);
            console.log('[GOOGLE_PLAY] Purchase acknowledged and verified');

            // Show success alert
            const { Alert } = require('react-native');
            Alert.alert(
              '✅ Purchase Successful',
              'Your subscription has been activated! Enjoy unlimited access to all premium features.',
              [{ text: 'Great!', style: 'default' }]
            );
          } else {
            throw new Error('Purchase verification failed');
          }
        } else {
          console.error('[GOOGLE_PLAY] No purchase token found');
          await InAppPurchases.finishTransactionAsync(purchase, false);

          const { Alert } = require('react-native');
          Alert.alert(
            'Purchase Error',
            'Could not verify your purchase. Please contact support if you were charged.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('[GOOGLE_PLAY] Failed to process purchase:', error);
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
      console.log('[GOOGLE_PLAY] Processing restored purchase...');
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
      console.log('[GOOGLE_PLAY] Purchase failed or cancelled by user');
      await InAppPurchases.finishTransactionAsync(purchase, false);
      // Don't show alert for cancellation - user knows they cancelled
    }

    // Handle pending purchase (requires user action)
    if (purchaseState === InAppPurchases.InAppPurchaseState.DEFERRED) {
      console.log('[GOOGLE_PLAY] Purchase pending');

      const { Alert } = require('react-native');
      Alert.alert(
        'Purchase Pending',
        'Your purchase is being processed. You will receive a notification when it completes.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Get available products from Google Play with retry logic
   */
  async getProducts(retryCount: number = 3, retryDelay: number = 2000): Promise<IAPProduct[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    // Guard: Prevent concurrent product fetches
    if (this.isFetchingProducts) {
      console.warn('[GOOGLE_PLAY] ⚠️ Product fetch already in progress, returning cached products');
      return this.products;
    }

    this.isFetchingProducts = true;
    let lastError: any = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`[GOOGLE_PLAY] Fetching products (attempt ${attempt}/${retryCount})...`);

        const productIds = Object.values(GOOGLE_PLAY_PRODUCTS);
        console.log(`[GOOGLE_PLAY] Requesting ${productIds.length} product IDs:`, productIds);

        const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);

        console.log(`[GOOGLE_PLAY] Response code: ${responseCode}`);
        console.log(`[GOOGLE_PLAY] Products returned: ${results?.length || 0}`);

        if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
          const errorMsg = this._getResponseCodeMessage(responseCode);
          console.error(`[GOOGLE_PLAY] Failed to fetch products: ${errorMsg} (code: ${responseCode})`);
          lastError = new Error(errorMsg);

          // If not OK, retry unless it's the last attempt
          if (attempt < retryCount) {
            console.log(`[GOOGLE_PLAY] Retrying in ${retryDelay}ms...`);
            await this._delay(retryDelay);
            continue;
          }
          return [];
        }

        // Success - map products
        this.products = results.map((product: any) => ({
          productId: product.productId,
          price: product.price,
          localizedPrice: product.price,
          title: product.title,
          description: product.description,
        }));

        console.log(`[GOOGLE_PLAY] ✅ Successfully fetched ${this.products.length} products`);
        if (this.products.length > 0) {
          console.log('[GOOGLE_PLAY] Product IDs loaded:', this.products.map(p => p.productId));
        } else {
          console.warn('[GOOGLE_PLAY] ⚠️ Google Play returned OK but 0 products - products may need to be published in Console');
        }

        this.isFetchingProducts = false; // Reset guard on success
        return this.products;
      } catch (error) {
        lastError = error;
        console.error(`[GOOGLE_PLAY] Error fetching products (attempt ${attempt}/${retryCount}):`, error);

        // Retry unless it's the last attempt
        if (attempt < retryCount) {
          console.log(`[GOOGLE_PLAY] Retrying in ${retryDelay}ms...`);
          await this._delay(retryDelay);
        }
      }
    }

    // All retries failed
    console.error(`[GOOGLE_PLAY] ❌ Failed to fetch products after ${retryCount} attempts`);
    console.error('[GOOGLE_PLAY] Last error:', lastError);
    this.isFetchingProducts = false; // Reset guard on failure
    return [];
  }

  /**
   * Helper: Get human-readable message for response codes
   */
  private _getResponseCodeMessage(code: number): string {
    const messages: { [key: number]: string } = {
      0: 'Success',
      1: 'User cancelled',
      2: 'Service unavailable',
      3: 'Billing unavailable',
      4: 'Item unavailable',
      5: 'Developer error',
      6: 'Error',
      7: 'Item already owned',
      8: 'Item not owned',
    };
    return messages[code] || `Unknown response code: ${code}`;
  }

  /**
   * Helper: Delay for retry logic
   */
  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Purchase a subscription product via Google Play
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (Platform.OS !== 'android') {
      return {
        success: false,
        error: 'Not on Android platform',
      };
    }

    if (!this.isInitialized) {
      console.log('[GOOGLE_PLAY] Not initialized, initializing now...');
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize Google Play Billing',
        };
      }
    }

    try {
      console.log(`[GOOGLE_PLAY] Initiating purchase for: ${productId}`);

      // Trigger the purchase
      await InAppPurchases.purchaseItemAsync(productId);

      // Note: The actual purchase result will be handled in handlePurchaseUpdate
      // This just initiates the purchase flow
      console.log('[GOOGLE_PLAY] Purchase initiated successfully');

      return {
        success: true,
      };
    } catch (error) {
      console.error('[GOOGLE_PLAY] Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  /**
   * Verify purchase with backend
   */
  async verifyPurchase(
    purchaseToken: string,
    productId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[GOOGLE_PLAY] Verifying purchase with backend...');

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const baseUrl = OpenAPI.BASE || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/google-play/verify-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          purchase_token: purchaseToken,
          product_id: productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Purchase verification failed');
      }

      const data = await response.json();
      console.log('[GOOGLE_PLAY] Purchase verified successfully:', data);

      return { success: true };
    } catch (error) {
      console.error('[GOOGLE_PLAY] Purchase verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Restore previous purchases (for Android subscription recovery)
   */
  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS !== 'android') {
      return {
        success: false,
        error: 'Not on Android platform',
      };
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize Google Play Billing',
        };
      }
    }

    try {
      console.log('[GOOGLE_PLAY] Restoring purchases...');

      const { results, responseCode } = await InAppPurchases.getPurchaseHistoryAsync();

      if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
        throw new Error('Failed to restore purchases');
      }

      console.log(`[GOOGLE_PLAY] Found ${results?.length || 0} previous purchases`);

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
      console.error('[GOOGLE_PLAY] Failed to restore purchases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }

  /**
   * Check if Google Play Billing is available and ready
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') {
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
      console.log('[GOOGLE_PLAY] Disconnected');
    }
  }
}

// Export singleton instance
export default new GooglePlayBillingService();
