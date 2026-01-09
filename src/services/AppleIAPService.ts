/**
 * Apple In-App Purchase Service
 * Handles StoreKit integration for iOS subscriptions
 */

import { Platform } from 'react-native';
import * as StoreKit from 'expo-store-review';
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

  /**
   * Initialize StoreKit connection
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[APPLE_IAP] Not on iOS platform, skipping initialization');
      return false;
    }

    try {
      console.log('[APPLE_IAP] Initializing StoreKit...');

      // Note: expo-store-review doesn't handle IAP purchases directly
      // For now, we'll use a simplified flow that goes through Stripe
      // until we add react-native-iap or expo-in-app-purchases

      this.isInitialized = true;
      console.log('[APPLE_IAP] Initialized (using Stripe fallback for now)');
      return true;
    } catch (error) {
      console.error('[APPLE_IAP] Initialization failed:', error);
      return false;
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
      console.log('[APPLE_IAP] Fetching products...');

      // For now, return mock product data
      // In production, this would fetch from App Store
      this.products = [
        {
          productId: APPLE_IAP_PRODUCTS.fluency_builder_monthly,
          price: '19.99',
          localizedPrice: '$19.99',
          title: 'Fluency Builder Monthly',
          description: 'Monthly subscription to Fluency Builder plan',
        },
        {
          productId: APPLE_IAP_PRODUCTS.fluency_builder_annual,
          price: '119.00',
          localizedPrice: '$119.00',
          title: 'Fluency Builder Annual',
          description: 'Annual subscription to Fluency Builder plan',
        },
        {
          productId: APPLE_IAP_PRODUCTS.language_mastery_monthly,
          price: '39.99',
          localizedPrice: '$39.99',
          title: 'Language Mastery Monthly',
          description: 'Monthly subscription to Language Mastery plan',
        },
        {
          productId: APPLE_IAP_PRODUCTS.language_mastery_annual,
          price: '239.00',
          localizedPrice: '$239.00',
          title: 'Language Mastery Annual',
          description: 'Annual subscription to Language Mastery plan',
        },
      ];

      console.log(`[APPLE_IAP] Retrieved ${this.products.length} products`);
      return this.products;
    } catch (error) {
      console.error('[APPLE_IAP] Failed to get products:', error);
      return [];
    }
  }

  /**
   * Purchase a subscription product
   * For now, this redirects to Stripe checkout
   * TODO: Implement actual StoreKit purchase flow when ready
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Not on iOS platform',
      };
    }

    try {
      console.log(`[APPLE_IAP] Purchase requested for: ${productId}`);

      // For now, we'll use Stripe as fallback
      // This allows testing the full flow while we wait for Apple review
      console.log('[APPLE_IAP] Using Stripe checkout as fallback');

      return {
        success: false,
        error: 'Use Stripe checkout for now (Apple IAP coming soon)',
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

      const token = await AsyncStorage.getItem('token');
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

    try {
      console.log('[APPLE_IAP] Restoring purchases...');

      // This would restore previous purchases from App Store
      // For now, return placeholder

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
   * Check if Apple IAP is available and products are approved
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    // For now, return false until Apple approves IAPs
    // This will make app fall back to Stripe
    return false;
  }
}

// Export singleton instance
export default new AppleIAPService();
