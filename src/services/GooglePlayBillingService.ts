/**
 * Google Play Billing Service
 * Handles Google Play Billing integration for Android subscriptions using react-native-iap
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenAPI } from '../api/generated/core/OpenAPI';

// Dynamic import for Android only - prevents crash on iOS
let RNIap: any = null;
if (Platform.OS === 'android') {
  RNIap = require('react-native-iap');
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
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
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
    if (this.isInitialized && this.purchaseUpdateSubscription) {
      console.log('[GOOGLE_PLAY] Already initialized, reusing existing connection');
      return true;
    }

    try {
      console.log('[GOOGLE_PLAY] Initializing react-native-iap...');

      // Initialize IAP connection
      await RNIap.initConnection();
      console.log('[GOOGLE_PLAY] Connected to Google Play Billing');

      // Set up purchase listeners (only once)
      if (!this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
          this.handlePurchaseUpdate.bind(this)
        );
        console.log('[GOOGLE_PLAY] Purchase update listener set up');
      }

      if (!this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
          this.handlePurchaseError.bind(this)
        );
        console.log('[GOOGLE_PLAY] Purchase error listener set up');
      }

      // Flush pending purchases on initialization
      await this.flushFailedPurchasesCachedAsPendingAndroid();

      this.isInitialized = true;
      console.log('[GOOGLE_PLAY] Initialization complete');
      return true;
    } catch (error) {
      console.error('[GOOGLE_PLAY] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Flush any pending purchases (Android)
   */
  private async flushFailedPurchasesCachedAsPendingAndroid() {
    try {
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      console.log('[GOOGLE_PLAY] Flushed pending purchases');
    } catch (error) {
      console.log('[GOOGLE_PLAY] No pending purchases to flush or error:', error);
    }
  }

  /**
   * Handle purchase updates from Google Play
   */
  private async handlePurchaseUpdate(purchase: any) {
    console.log('[GOOGLE_PLAY] Purchase update received:', {
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      purchaseStateAndroid: purchase.purchaseStateAndroid,
    });

    // Check if already acknowledged
    if (purchase.isAcknowledgedAndroid) {
      console.log('[GOOGLE_PLAY] Purchase already acknowledged, skipping');
      return;
    }

    try {
      // Get purchase token (Android only)
      const purchaseToken = purchase.purchaseToken;
      if (purchaseToken) {
        const verifyResult = await this.verifyPurchase(purchaseToken, purchase.productId);

        if (verifyResult.success) {
          // Acknowledge the purchase
          await RNIap.acknowledgePurchaseAndroid(purchaseToken);
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

        const { Alert } = require('react-native');
        Alert.alert(
          'Purchase Error',
          'Could not verify your purchase. Please contact support if you were charged.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[GOOGLE_PLAY] Failed to process purchase:', error);

      const { Alert } = require('react-native');
      Alert.alert(
        'Verification Error',
        'Your purchase could not be verified. Please contact support if you were charged.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Handle purchase errors from Google Play
   */
  private handlePurchaseError(error: any) {
    console.log('[GOOGLE_PLAY] Purchase error received:', error);

    // Don't show alert for user cancellation
    // v14 uses 'user-cancelled', older versions used 'E_USER_CANCELLED'
    if (error.code === 'user-cancelled' || error.code === 'E_USER_CANCELLED') {
      console.log('[GOOGLE_PLAY] User cancelled purchase');
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

        // Fetch subscriptions from Google Play (v14 API requires type: 'subs' for subscriptions)
        const products = await RNIap.fetchProducts({ skus: productIds, type: 'subs' });

        console.log(`[GOOGLE_PLAY] Products returned: ${products?.length || 0}`);

        if (!products || products.length === 0) {
          console.warn('[GOOGLE_PLAY] ⚠️ Google Play returned 0 products - products may need to be published in Console');

          // Retry unless it's the last attempt
          if (attempt < retryCount) {
            console.log(`[GOOGLE_PLAY] Retrying in ${retryDelay}ms...`);
            await this._delay(retryDelay);
            continue;
          }
          this.isFetchingProducts = false;
          return [];
        }

        // Success - map products (v14 uses 'id' field instead of 'productId')
        this.products = products.map((product: any) => ({
          productId: product.id,
          price: product.price?.toString() || product.displayPrice,
          localizedPrice: product.displayPrice,
          title: product.title,
          description: product.description,
        }));

        console.log(`[GOOGLE_PLAY] ✅ Successfully fetched ${this.products.length} products`);
        if (this.products.length > 0) {
          console.log('[GOOGLE_PLAY] Product IDs loaded:', this.products.map(p => p.productId));
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

      // Trigger the subscription purchase (v14 unified API)
      await RNIap.requestPurchase({
        type: 'subs',
        request: {
          google: {
            skus: [productId],
          },
        },
      });

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

      // 🔥 NEW: Check current subscription status first to prevent conflicts
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          const baseUrl = OpenAPI.BASE || 'http://localhost:8000';
          const statusResponse = await fetch(`${baseUrl}/api/stripe/subscription-status`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (statusResponse.ok) {
            const status = await statusResponse.json();

            // Warn if user has active subscription from different provider
            if (status.status === 'active' && status.provider && status.provider !== 'google_play') {
              console.log(`[GOOGLE_PLAY] ⚠️ User has active ${status.provider} subscription`);

              const { Alert } = require('react-native');
              return await new Promise((resolve) => {
                Alert.alert(
                  'Active Subscription Found',
                  `You have an active ${status.provider.toUpperCase()} subscription. Restoring Google Play purchases may cause conflicts.\n\nWould you like to continue anyway?`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                      onPress: () => {
                        console.log('[GOOGLE_PLAY] User cancelled restore due to provider conflict');
                        resolve({
                          success: false,
                          error: 'Restore cancelled - active subscription from different provider',
                        });
                      },
                    },
                    {
                      text: 'Continue Anyway',
                      style: 'destructive',
                      onPress: () => {
                        console.log('[GOOGLE_PLAY] User confirmed restore despite provider conflict');
                        // Continue with restore (handled by then() block)
                        resolve({ success: true });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }).then(async (result) => {
                if (!result.success) {
                  return result;
                }
                // User confirmed - proceed with restore
                return await this._doRestorePurchases();
              });
            }
          }
        } catch (error) {
          console.error('[GOOGLE_PLAY] Failed to check subscription status:', error);
          // Continue with restore even if status check fails
        }
      }

      // No conflict detected - proceed with restore
      return await this._doRestorePurchases();
    } catch (error) {
      console.error('[GOOGLE_PLAY] Failed to restore purchases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }

  /**
   * Internal method to perform actual restore (separated for conflict checking)
   */
  private async _doRestorePurchases(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[GOOGLE_PLAY] Proceeding with restore purchases...');

      // Get available purchase history
      const purchases = await RNIap.getAvailablePurchases();

      console.log(`[GOOGLE_PLAY] Found ${purchases?.length || 0} previous purchases`);

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
      console.log('[GOOGLE_PLAY] Disconnected');
    }
  }
}

// Export singleton instance
export default new GooglePlayBillingService();
