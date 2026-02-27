import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/config';
import { createStyles } from './styles/PricingModal.styles';
// IAP services kept for future use - currently bypassed in favour of Stripe web checkout
import AppleIAPService, { APPLE_IAP_PRODUCTS } from '../services/AppleIAPService';
import GooglePlayBillingService, { GOOGLE_PLAY_PRODUCTS } from '../services/GooglePlayBillingService';

// Stripe Price IDs — must match backend configuration
const STRIPE_PRICE_IDS: Record<string, Record<string, string>> = {
  fluency_builder: {
    monthly: 'price_1RdxNjJcquSiYwWN2XQMwwYW',
    annual:  'price_1SoQw4JcquSiYwWNzi2zSgXt',
  },
  language_mastery: {
    monthly: 'price_1RdxlGJcquSiYwWNWvyEgmgL',
    annual:  'price_1SoQy8JcquSiYwWNalBlWPEQ',
  },
  team_mastery: {
    monthly: 'price_1RdxlGJcquSiYwWNWvyEgmgL',
    annual:  'price_1SoQy8JcquSiYwWNalBlWPEQ',
  },
};

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualSavings: string;
  shortDescription: string;
  monthlyFeatures: {
    icon: string;
    text: string;
  }[];
  annualFeatures: {
    icon: string;
    text: string;
  }[];
  isPopular?: boolean;
  highlight?: string;
}

interface PricingModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string, period: 'monthly' | 'annual') => void;
  currentPlan?: string; // Current subscription plan (e.g., 'fluency_builder', 'language_mastery')
  currentPeriod?: string; // Current subscription period (e.g., 'monthly', 'annual')
  isInTrial?: boolean; // Whether user is currently in trial
  subscriptionProvider?: string; // Current provider (stripe, apple, google_play)
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'fluency_builder',
    name: 'Fluency Builder',
    monthlyPrice: '€19.99',
    annualPrice: '€119.00',
    annualSavings: 'Save €120.88',
    shortDescription: 'Perfect for consistent learners',
    highlight: '🎉 7-day free trial',
    isPopular: true,
    monthlyFeatures: [
      { icon: 'chatbubbles', text: '150 min speaking/month' },
      { icon: 'mic', text: '2 assessments/month' },
      { icon: 'heart', text: '10 hearts for challenges' },
      { icon: 'time', text: 'Refills every 1 hour' },
      { icon: 'trophy', text: 'Advanced tracking' },
      { icon: 'star', text: 'All conversation topics' },
    ],
    annualFeatures: [
      { icon: 'chatbubbles', text: '1800 min speaking/year' },
      { icon: 'mic', text: '24 assessments/year' },
      { icon: 'heart', text: '10 hearts for challenges' },
      { icon: 'time', text: 'Refills every 1 hour' },
      { icon: 'trophy', text: 'Advanced tracking' },
      { icon: 'star', text: 'All conversation topics' },
    ],
  },
  {
    id: 'language_mastery',
    name: 'Language Mastery',
    monthlyPrice: '€39.99',
    annualPrice: '€239.00',
    annualSavings: 'Save €240.88',
    shortDescription: 'Ultimate learning experience',
    highlight: '🎉 7-day free trial',
    monthlyFeatures: [
      { icon: 'infinite', text: 'UNLIMITED speaking' },
      { icon: 'analytics', text: 'UNLIMITED assessments' },
      { icon: 'heart', text: 'UNLIMITED hearts' },
      { icon: 'flash', text: 'Instant heart refills' },
      { icon: 'bulb', text: 'Premium learning plans' },
      { icon: 'rocket', text: 'Advanced analytics' },
    ],
    annualFeatures: [
      { icon: 'infinite', text: 'UNLIMITED speaking' },
      { icon: 'analytics', text: 'UNLIMITED assessments' },
      { icon: 'heart', text: 'UNLIMITED hearts' },
      { icon: 'flash', text: 'Instant heart refills' },
      { icon: 'bulb', text: 'Premium learning plans' },
      { icon: 'rocket', text: 'Advanced analytics' },
    ],
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({
  visible,
  onClose,
  onSelectPlan,
  currentPlan,
  currentPeriod,
  isInTrial,
  subscriptionProvider,
}) => {
  // Use dynamic dimensions hook (updates on rotation/resize)
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Calculate responsive values dynamically
  const isTablet = SCREEN_WIDTH >= 768;
  const CARD_WIDTH = isTablet
    ? SCREEN_WIDTH * 0.45
    : SCREEN_WIDTH < 400
      ? SCREEN_WIDTH - 32
      : SCREEN_WIDTH - 60;
  const CARD_SPACING = isTablet ? 30 : (SCREEN_WIDTH < 400 ? 16 : 20);
  const CARD_MARGIN = isTablet ? 40 : (SCREEN_WIDTH < 400 ? 16 : 30);

  // Create styles with current dimensions
  const styles = createStyles(SCREEN_WIDTH, isTablet);

  // Filter plans based on current subscription
  // For existing paid subscribers, only show plans that are actual upgrades
  const availablePlans = React.useMemo(() => {
    // Free users or try_learn: Show all plans
    if (!currentPlan || ['try_learn', 'free'].includes(currentPlan)) {
      return PRICING_PLANS;
    }

    // Fluency Builder Annual: Can only upgrade to Language Mastery
    // Hide Fluency Builder entirely (they're already on it, annual is the highest tier of FB)
    if (currentPlan === 'fluency_builder' && currentPeriod === 'annual') {
      return PRICING_PLANS.filter(p => p.id === 'language_mastery');
    }

    // Fluency Builder Monthly: Can upgrade to FB Annual OR Language Mastery
    // Hide Fluency Builder Monthly — it IS their current plan (prevent accidental same-plan tap)
    // Show Fluency Builder (for annual toggle) + Language Mastery
    if (currentPlan === 'fluency_builder' && currentPeriod === 'monthly') {
      return PRICING_PLANS; // Both cards shown; isCurrentPlan guard disables the monthly FB button
    }

    // Language Mastery / Team Mastery: Already have top tier, show all to view benefits
    if (currentPlan === 'language_mastery' || currentPlan === 'team_mastery') {
      return PRICING_PLANS;
    }

    // Fallback: Show all plans
    return PRICING_PLANS;
  }, [currentPlan, currentPeriod]);

  // Smart default: show Annual toggle for FB monthly (highlights savings) or FB annual (they're already annual)
  const defaultToAnnual =
    currentPlan === 'fluency_builder' ||  // Both monthly and annual FB → default to annual tab
    currentPeriod === 'annual';           // Any annual subscriber → stay on annual tab
  const [isAnnual, setIsAnnual] = useState(defaultToAnnual);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appleIAPAvailable, setAppleIAPAvailable] = useState(false);
  const [googlePlayAvailable, setGooglePlayAvailable] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<'connecting' | 'fetching' | 'timeout' | 'ready'>('connecting');
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const upgradeConfirmCancelRef = useRef<(() => void) | null>(null);

  // Stripe web checkout state
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  // Custom upgrade confirmation dialog state
  const [upgradeConfirm, setUpgradeConfirm] = useState<{
    label: string;
    onConfirm: () => void;
  } | null>(null);

  // Animation for promo banner
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Reset toggle to smart default when modal opens
  useEffect(() => {
    if (visible) {
      setIsAnnual(defaultToAnnual);
    }
  }, [visible, defaultToAnnual]);

  // Pulse animation for promo banner
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Shimmer animation for promo icon
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  // IAP initialization kept dormant — Stripe web checkout is used instead.
  // Re-enable this block to switch back to native Apple/Google IAP.
  useEffect(() => {
    if (visible) {
      // Reset checkout message when modal opens
      setCheckoutMessage(null);

      /* --- NATIVE IAP INIT (dormant) ---
      setIsInitializing(false);
      setProductsLoaded(false);
      setLoadingProgress('connecting');
      setProductLoadError(null);

      const timeoutId = setTimeout(() => {
        setLoadingProgress('timeout');
        setProductLoadError('Subscriptions are taking longer than expected to load.');
      }, 12000);
      initTimeoutRef.current = timeoutId;

      if (Platform.OS === 'ios') {
        initializeAppleIAP();
      } else if (Platform.OS === 'android') {
        initializeGooglePlayBilling();
      }
      --- END NATIVE IAP INIT --- */
    }

    // Cleanup function
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [visible]);

  const initializeAppleIAP = async () => {
    try {
      setIsInitializing(true);
      setProductsLoaded(false);
      setLoadingProgress('connecting');
      setProductLoadError(null);
      console.log('[PRICING_MODAL] Starting Apple IAP initialization...');

      // Initialize IAP service (sets up purchase listener)
      const initialized = await AppleIAPService.initialize();
      if (!initialized) {
        console.log('[PRICING_MODAL] Failed to initialize Apple IAP');
        setAppleIAPAvailable(false);
        setIsInitializing(false);
        setProductLoadError('Failed to connect to App Store. Please check your connection.');
        return;
      }

      // Check availability
      const available = await AppleIAPService.isAvailable();
      setAppleIAPAvailable(available);
      console.log('[PRICING_MODAL] Apple IAP available:', available);

      if (available) {
        setLoadingProgress('fetching');
        console.log('[PRICING_MODAL] Fetching products with retry logic...');

        // CRITICAL: Fetch products from App Store before purchase
        // This is REQUIRED by expo-in-app-purchases before calling purchaseItemAsync
        // Now includes automatic retry logic (3 attempts with 2s delays)
        const products = await AppleIAPService.getProducts();
        console.log('[PRICING_MODAL] Loaded products:', products.length);

        if (products.length > 0) {
          setProductsLoaded(true);
          setLoadingProgress('ready');
          console.log('[PRICING_MODAL] ✅ Products ready for purchase');

          // Clear timeout since products loaded successfully
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
          }
        } else {
          console.warn('[PRICING_MODAL] ⚠️ No products loaded from App Store after retries');
          setProductsLoaded(false);
          setLoadingProgress('timeout');
          setProductLoadError('Unable to load subscription products. Products may be awaiting App Store review approval.');
        }
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Failed to initialize Apple IAP:', error);
      setAppleIAPAvailable(false);
      setProductsLoaded(false);
      setLoadingProgress('timeout');
      setProductLoadError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeGooglePlayBilling = async () => {
    try {
      setIsInitializing(true);
      setProductsLoaded(false);
      setLoadingProgress('connecting');
      setProductLoadError(null);
      console.log('[PRICING_MODAL] Starting Google Play Billing initialization...');

      // Initialize Google Play Billing service (sets up purchase listener)
      const initialized = await GooglePlayBillingService.initialize();
      if (!initialized) {
        console.log('[PRICING_MODAL] Failed to initialize Google Play Billing');
        setGooglePlayAvailable(false);
        setIsInitializing(false);
        setProductLoadError('Failed to connect to Google Play. Please check your connection.');
        return;
      }

      // Check availability
      const available = await GooglePlayBillingService.isAvailable();
      setGooglePlayAvailable(available);
      console.log('[PRICING_MODAL] Google Play Billing available:', available);

      if (available) {
        setLoadingProgress('fetching');
        console.log('[PRICING_MODAL] Fetching products with retry logic...');

        // CRITICAL: Fetch products from Google Play before purchase
        // This is REQUIRED by expo-in-app-purchases before calling purchaseItemAsync
        // Now includes automatic retry logic (3 attempts with 2s delays)
        const products = await GooglePlayBillingService.getProducts();
        console.log('[PRICING_MODAL] Loaded products:', products.length);

        if (products.length > 0) {
          setProductsLoaded(true);
          setLoadingProgress('ready');
          console.log('[PRICING_MODAL] ✅ Products ready for purchase');

          // Clear timeout since products loaded successfully
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
          }
        } else {
          console.warn('[PRICING_MODAL] ⚠️ No products loaded from Google Play after retries');
          setProductsLoaded(false);
          setLoadingProgress('timeout');
          setProductLoadError('Unable to load subscription products. Products may need to be published in Google Play Console.');
        }
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Failed to initialize Google Play Billing:', error);
      setGooglePlayAvailable(false);
      setProductsLoaded(false);
      setLoadingProgress('timeout');
      setProductLoadError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleTogglePeriod = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsAnnual(!isAnnual);
  };

  /**
   * Opens Stripe checkout in an in-app browser sheet (SFSafariViewController on iOS,
   * Chrome Custom Tab on Android). Awaits the result — no screen navigation required.
   */
  const handleStripeCheckout = async (planId: string, period: 'monthly' | 'annual') => {
    const priceId = STRIPE_PRICE_IDS[planId]?.[period];
    if (!priceId) {
      Alert.alert('Error', 'Invalid plan selected. Please try again.');
      return;
    }

    try {
      setPurchasingPlanId(planId);
      setCheckoutMessage(null);

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Sign In Required', 'Please sign in to start your free trial.');
        return;
      }

      // Create Stripe checkout session
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: 'mytacoai://checkout-success',
          cancel_url: 'mytacoai://checkout-cancel',
          guest_checkout: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Could not prepare checkout. Please try again.');
      }

      const { url } = await response.json();

      // Open Stripe in an in-app browser sheet — feels like a modal, not leaving the app.
      // On iOS this is SFSafariViewController; on Android Chrome Custom Tab.
      // The browser auto-closes when Stripe redirects to mytacoai://.
      const result = await WebBrowser.openAuthSessionAsync(url, 'mytacoai://');

      if (result.type === 'success' && result.url?.includes('checkout-success')) {
        // Payment completed — close modal and show success screen
        onClose();
        navigation.navigate('CheckoutSuccess');
      } else if (
        result.type === 'dismiss' ||
        result.type === 'cancel' ||
        (result.type === 'success' && result.url?.includes('checkout-cancel'))
      ) {
        // User closed the browser without paying — stay on modal with gentle message
        setCheckoutMessage('Your free trial is still here whenever you\'re ready 🎉');
      }
    } catch (error: any) {
      console.error('[PRICING_MODAL] Stripe checkout error:', error);
      Alert.alert(
        'Checkout Error',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasingPlanId(null);
    }
  };

  /**
   * For users who already have an active or trialing Stripe subscription,
   * modify the existing subscription instead of creating a new checkout session.
   * This prevents duplicate subscriptions in Stripe.
   */
  const handleUpgrade = async (planId: string, period: 'monthly' | 'annual') => {
    const priceId = STRIPE_PRICE_IDS[planId]?.[period];
    if (!priceId) {
      Alert.alert('Error', 'Invalid plan selected. Please try again.');
      return;
    }

    // Determine upgrade_type for the backend
    let upgradeType: string;
    let upgradeLabel: string;
    if (currentPlan === 'fluency_builder' && planId === 'fluency_builder' && period === 'annual') {
      upgradeType = 'upgrade_to_annual';
      upgradeLabel = 'Fluency Builder Annual (€199.99/year)';
    } else if (planId === 'language_mastery' && period === 'annual') {
      upgradeType = 'upgrade_to_language_mastery_annual';
      upgradeLabel = 'Language Mastery Annual (€239.00/year)';
    } else if (planId === 'language_mastery' && period === 'monthly') {
      upgradeType = 'upgrade_to_language_mastery_monthly';
      upgradeLabel = 'Language Mastery Monthly (€39.99/month)';
    } else if (planId === 'team_mastery') {
      upgradeType = 'upgrade_to_team_mastery';
      upgradeLabel = `Team Mastery ${period === 'annual' ? 'Annual' : 'Monthly'}`;
    } else {
      // Fallback: same plan/period — nothing to upgrade
      Alert.alert('Already subscribed', 'You are already on this plan.');
      return;
    }

    // Show custom branded confirmation dialog before modifying existing subscription
    const confirmed = await new Promise<boolean>((resolve) => {
      setUpgradeConfirm({
        label: upgradeLabel,
        onConfirm: () => {
          setUpgradeConfirm(null);
          resolve(true);
        },
      });
      // Store cancel resolver so the Cancel button can resolve false
      upgradeConfirmCancelRef.current = () => {
        setUpgradeConfirm(null);
        resolve(false);
      };
    });

    if (!confirmed) return;

    try {
      setPurchasingPlanId(planId);
      setCheckoutMessage(null);

      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Sign In Required', 'Please sign in to continue.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/upgrade/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price_id: priceId, upgrade_type: upgradeType }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Upgrade failed. Please try again.');
      }

      const result = await response.json();
      if (result.success) {
        // Close modal first, then navigate after a short delay so the modal
        // is fully dismissed before we push a new screen.
        onClose();
        setTimeout(() => {
          navigation.navigate('CheckoutSuccess');
        }, 350);
      } else {
        throw new Error('Upgrade failed. Please try again.');
      }
    } catch (error: any) {
      console.error('[PRICING_MODAL] Upgrade error:', error);
      Alert.alert('Upgrade Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const period = isAnnual ? 'annual' : 'monthly';

    // Existing paid/trialing Stripe subscriber → modify subscription, don't create new checkout
    const isExistingStripeSubscriber =
      subscriptionProvider === 'stripe' &&
      currentPlan &&
      !['try_learn', 'free'].includes(currentPlan);

    if (isExistingStripeSubscriber) {
      await handleUpgrade(planId, period);
    } else {
      // Free user or non-Stripe → use Stripe web checkout (new subscription)
      await handleStripeCheckout(planId, period);
    }
  };

  const handleAppleIAPPurchase = async (planId: string, period: 'monthly' | 'annual') => {
    try {
      // Map plan ID to Apple product ID
      const productKey = `${planId}_${period}` as keyof typeof APPLE_IAP_PRODUCTS;
      const productId = APPLE_IAP_PRODUCTS[productKey];

      if (!productId) {
        throw new Error('Invalid product ID');
      }

      console.log('[PRICING_MODAL] Initiating Apple IAP purchase:', productId);

      // Initiate purchase - this just opens the purchase dialog
      const result = await AppleIAPService.purchaseProduct(productId);

      if (result.success) {
        console.log('[PRICING_MODAL] Purchase dialog opened');
        // Don't close modal or show alert yet - wait for actual purchase result
        // The AppleIAPService purchase listener will handle the actual result
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Apple IAP purchase failed:', error);

      Alert.alert(
        'Purchase Error',
        error instanceof Error ? error.message : 'Failed to open purchase dialog. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => handleAppleIAPPurchase(planId, period),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleGooglePlayPurchase = async (planId: string, period: 'monthly' | 'annual') => {
    try {
      // Map plan ID to Google Play product ID
      const productKey = `${planId}_${period}` as keyof typeof GOOGLE_PLAY_PRODUCTS;
      const productId = GOOGLE_PLAY_PRODUCTS[productKey];

      if (!productId) {
        throw new Error('Invalid product ID');
      }

      console.log('[PRICING_MODAL] Initiating Google Play purchase:', productId);

      // Initiate purchase - this opens the Google Play purchase dialog
      const result = await GooglePlayBillingService.purchaseProduct(productId);

      if (result.success) {
        console.log('[PRICING_MODAL] Purchase dialog opened');
        // Don't close modal or show alert yet - wait for actual purchase result
        // The GooglePlayBillingService purchase listener will handle the actual result
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Google Play purchase failed:', error);

      Alert.alert(
        'Purchase Error',
        error instanceof Error ? error.message : 'Failed to open purchase dialog. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => handleGooglePlayPurchase(planId, period),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const handleRetryLoadProducts = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[PRICING_MODAL] Manual retry requested by user');

    if (Platform.OS === 'ios') {
      initializeAppleIAP();
    } else if (Platform.OS === 'android') {
      initializeGooglePlayBilling();
    }
  };

  const handleRestorePurchases = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsRestoring(true);

    try {
      console.log('[PRICING_MODAL] Initiating restore purchases...');

      let result;
      if (Platform.OS === 'ios') {
        result = await AppleIAPService.restorePurchases();
      } else if (Platform.OS === 'android') {
        result = await GooglePlayBillingService.restorePurchases();
      } else {
        throw new Error('Restore purchases not available on this platform');
      }

      if (result && result.success) {
        Alert.alert(
          'Restore Complete',
          'Your purchases have been checked. If you had an active subscription, it has been restored.',
          [{ text: 'OK', onPress: handleClose }]
        );
      } else {
        throw new Error(result?.error || 'Failed to restore purchases');
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        error instanceof Error ? error.message : 'Could not restore purchases. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePromoCodeInfo = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const promoPageUrl = 'https://mytacoai.com/promo-code';

    try {
      // Open promo code instructions page directly in browser
      const supported = await Linking.canOpenURL(promoPageUrl);
      if (supported) {
        await Linking.openURL(promoPageUrl);
        console.log('[PRICING_MODAL] Opened promo code instructions page');
      } else {
        console.error('[PRICING_MODAL] Cannot open URL:', promoPageUrl);
        Alert.alert(
          'Error',
          'Unable to open browser. Please visit mytacoai.com/promo-code manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Error opening URL:', error);
      Alert.alert(
        'Error',
        'Unable to open browser. Please visit mytacoai.com/promo-code manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    if (index !== currentIndex) {
      setCurrentIndex(index);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {(currentPlan === 'fluency_builder' || currentPlan === 'language_mastery' || currentPlan === 'team_mastery')
                ? 'Upgrade Your Plan'
                : 'Unlock Premium Features'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentPlan === 'fluency_builder' && currentPeriod === 'annual'
                ? 'Upgrade to Language Mastery for unlimited practice'
                : currentPlan === 'fluency_builder'
                  ? 'Save money with Annual or get Unlimited with Language Mastery'
                  : 'Choose the plan that fits your goals'}
            </Text>
          </View>
        </View>

        {/* Main Scrollable Content */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Gentle message after user cancels/dismisses Stripe checkout */}
          {checkoutMessage && (
            <View style={styles.checkoutMessageBanner}>
              <Ionicons name="heart" size={16} color="#4ECFBF" />
              <Text style={styles.checkoutMessageText}>{checkoutMessage}</Text>
            </View>
          )}

          {/* Promo Code Info Banner - Mobile Only */}
          {Platform.OS !== 'web' && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.promoBanner}
                onPress={handlePromoCodeInfo}
                activeOpacity={0.8}
              >
                <View style={styles.promoBannerContent}>
                  <View style={styles.promoBannerLeft}>
                    <Animated.View
                      style={[
                        styles.promoBannerIconContainer,
                        {
                          opacity: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.85, 1],
                          }),
                        }
                      ]}
                    >
                      <Ionicons name="pricetag" size={18} color="#FFFFFF" />
                    </Animated.View>
                    <View style={styles.promoBannerTextContainer}>
                      <Text style={styles.promoBannerTitle}>Have a Promo Code?</Text>
                      <Text style={styles.promoBannerSubtitle}>Apply it on our website</Text>
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={22} color="#4ECFBF" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Billing Toggle - Prominent */}
          <View style={styles.toggleSection}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleOption, !isAnnual && styles.toggleOptionActive]}
              onPress={() => !isAnnual || handleTogglePeriod()}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  !isAnnual && styles.toggleOptionTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, isAnnual && styles.toggleOptionActive]}
              onPress={() => isAnnual || handleTogglePeriod()}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  isAnnual && styles.toggleOptionTextActive,
                ]}
              >
                Annual
              </Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>Save 50%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Cards Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal={!isTablet}
          pagingEnabled={!isTablet}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={isTablet ? undefined : CARD_WIDTH + CARD_SPACING}
          contentContainerStyle={[
            styles.carouselContent,
            isTablet && styles.carouselContentTablet,
          ]}
          onScroll={!isTablet ? handleScroll : undefined}
          scrollEventThrottle={16}
        >
          {availablePlans.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquivalent = isAnnual
              ? `€${(parseFloat(plan.annualPrice.slice(1)) / 12).toFixed(2)}/mo`
              : null;
            const features = isAnnual ? plan.annualFeatures : plan.monthlyFeatures;

            // Check if this is the user's current plan
            const isCurrentPlan =
              currentPlan === plan.id &&
              ((isAnnual && currentPeriod === 'annual') || (!isAnnual && currentPeriod === 'monthly'));

            // Determine if trial should be shown
            // Only show trial for NEW users (no current subscription) or users actively in trial
            const hasActiveSubscription = currentPlan && !['try_learn', 'free'].includes(currentPlan);
            const showTrial = !hasActiveSubscription || isInTrial;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  !isTablet && index === 0 && { marginLeft: CARD_MARGIN },
                  !isTablet && index === availablePlans.length - 1 && { marginRight: CARD_MARGIN },
                  isTablet && { marginHorizontal: CARD_SPACING / 2 },
                  plan.isPopular && styles.planCardPopular,
                ]}
              >
                {/* Badge: Current Plan / Save 17% / Most Popular */}
                {isCurrentPlan ? (
                  <View style={[styles.popularBadge, { backgroundColor: '#6B7280' }]}>
                    <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                    <Text style={styles.popularBadgeText}>CURRENT PLAN</Text>
                  </View>
                ) : currentPlan === 'fluency_builder' && plan.id === 'fluency_builder' && isAnnual ? (
                  <View style={[styles.popularBadge, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="trending-up" size={14} color="#FFFFFF" />
                    <Text style={styles.popularBadgeText}>SAVE 17%</Text>
                  </View>
                ) : plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={14} color="#FFFFFF" />
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}

                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>
                    {plan.shortDescription}
                  </Text>
                </View>

                {/* Highlight - Only show trial text for eligible users */}
                {plan.highlight && showTrial && (
                  <View style={styles.highlightContainer}>
                    <Text style={styles.highlightText}>{plan.highlight}</Text>
                  </View>
                )}

                {/* Pricing */}
                <View style={styles.pricingContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{price}</Text>
                    <Text style={styles.pricePeriod}>
                      {isAnnual ? '/year' : '/month'}
                    </Text>
                  </View>
                  {monthlyEquivalent && (
                    <Text style={styles.monthlyEquivalent}>
                      {monthlyEquivalent}
                    </Text>
                  )}
                  {isAnnual && (
                    <View style={styles.savingsTag}>
                      <Text style={styles.savingsText}>{plan.annualSavings}</Text>
                    </View>
                  )}
                </View>

                {/* Features - Compact Grid */}
                <View style={styles.featuresGrid}>
                  {features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <View style={styles.featureIconContainer}>
                        <Ionicons
                          name={feature.icon as any}
                          size={16}
                          color="#4ECFBF"
                        />
                      </View>
                      <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button — always enabled, spinner per-plan while checkout loads */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    plan.isPopular && !isCurrentPlan && styles.ctaButtonPopular,
                    (purchasingPlanId !== null && purchasingPlanId !== plan.id) && styles.ctaButtonDisabled,
                    isCurrentPlan && styles.ctaButtonDisabled,
                  ]}
                  onPress={() => !isCurrentPlan && handleSelectPlan(plan.id)}
                  disabled={purchasingPlanId !== null || isCurrentPlan}
                  activeOpacity={isCurrentPlan ? 1 : 0.85}
                >
                  {purchasingPlanId === plan.id ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color={plan.isPopular ? '#FFFFFF' : '#4ECFBF'}
                      />
                      <Text
                        style={[
                          styles.ctaButtonText,
                          plan.isPopular && styles.ctaButtonTextPopular,
                          { marginLeft: 8 },
                        ]}
                      >
                        Preparing checkout...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.ctaButtonText,
                          plan.isPopular && styles.ctaButtonTextPopular,
                        ]}
                      >
                        {isCurrentPlan
                          ? 'Current Plan'
                          : (subscriptionProvider === 'stripe' && currentPlan && !['try_learn', 'free'].includes(currentPlan))
                            ? 'Upgrade Plan'
                            : showTrial
                              ? 'Start Free Trial'
                              : 'Subscribe Now'}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={plan.isPopular ? '#FFFFFF' : '#4ECFBF'}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Pagination Dots - Hidden on iPad */}
        {!isTablet && (
          <View style={styles.paginationContainer}>
            {availablePlans.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footer}>
          <View style={styles.footerInfoRow}>
            <View style={styles.footerInfoItem}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.footerInfoText}>Cancel anytime</Text>
            </View>
            <View style={styles.footerInfoItem}>
              <Ionicons name="lock-closed" size={14} color="#10B981" />
              <Text style={styles.footerInfoText}>Secure payment</Text>
            </View>
          </View>

          {/* Legal Links - Required by Apple for Auto-Renewable Subscriptions */}
          <View style={styles.legalLinksContainer}>
            <Text style={styles.legalLinksHeader}>SUBSCRIPTION TERMS</Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://mytacoai.com/terms')}
                activeOpacity={0.7}
              >
                <Text style={styles.legalLinkText}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://mytacoai.com/privacy')}
                activeOpacity={0.7}
              >
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Restore Purchases - kept for IAP future use, hidden for Stripe-only flow */}
          {false && ((Platform.OS === 'ios' && appleIAPAvailable) || (Platform.OS === 'android' && googlePlayAvailable)) && (
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={isRestoring}
              activeOpacity={0.7}
            >
              {isRestoring ? (
                <View style={styles.restoreButtonContent}>
                  <ActivityIndicator size="small" color="#4ECFBF" />
                  <Text style={styles.restoreButtonText}>Restoring...</Text>
                </View>
              ) : (
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Maybe Later Option */}
          <TouchableOpacity
            style={styles.maybeLaterButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
        </View>
      </SafeAreaView>

      {/* Custom Upgrade Confirmation Dialog - matches app branding */}
      {upgradeConfirm && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 999,
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => upgradeConfirmCancelRef.current?.()}
          />
          <View style={{
            backgroundColor: '#1A1A2E',
            borderRadius: 24,
            marginHorizontal: 24,
            padding: 28,
            width: '88%',
            borderWidth: 1.5,
            borderColor: '#4ECFBF',
            shadowColor: '#4ECFBF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 20,
          }}>
            {/* Icon */}
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: 'rgba(78,207,191,0.15)',
              borderWidth: 1.5, borderColor: '#4ECFBF',
              alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="arrow-up-circle" size={28} color="#4ECFBF" />
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 20, fontWeight: '800', color: '#FFFFFF',
              textAlign: 'center', marginBottom: 8,
            }}>
              Confirm Upgrade
            </Text>

            {/* Plan label */}
            <Text style={{
              fontSize: 15, fontWeight: '700', color: '#4ECFBF',
              textAlign: 'center', marginBottom: 12,
            }}>
              {upgradeConfirm.label}
            </Text>

            {/* Description */}
            <Text style={{
              fontSize: 13, fontWeight: '500', color: '#9CA3AF',
              textAlign: 'center', lineHeight: 20, marginBottom: 24,
            }}>
              Your subscription will be modified immediately.{'\n'}Usage counters reset to 0.
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                }}
                onPress={() => upgradeConfirmCancelRef.current?.()}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#9CA3AF' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 14,
                  backgroundColor: '#4ECFBF',
                  alignItems: 'center',
                  shadowColor: '#4ECFBF',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                onPress={upgradeConfirm.onConfirm}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
                  Upgrade
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};
