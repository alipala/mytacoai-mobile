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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createStyles } from './styles/PricingModal.styles';
import AppleIAPService, { APPLE_IAP_PRODUCTS } from '../services/AppleIAPService';

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

  console.log('🔍 [PricingModal] Dynamic - Width:', SCREEN_WIDTH, 'isTablet:', isTablet);

  const [isAnnual, setIsAnnual] = useState(false); // Default to monthly
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appleIAPAvailable, setAppleIAPAvailable] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize Apple IAP when modal opens on iOS
  useEffect(() => {
    if (visible && Platform.OS === 'ios') {
      // Reset states before initializing
      setIsInitializing(false);
      setProductsLoaded(false);
      initializeAppleIAP();
    }

    // Cleanup function - but DON'T disconnect, keep listener active
    return () => {
      // Keep the listener active for background purchase processing
      // Apple IAP service will remain connected for the app lifetime
    };
  }, [visible]);

  const initializeAppleIAP = async () => {
    try {
      setIsInitializing(true);
      setProductsLoaded(false);
      console.log('[PRICING_MODAL] Starting Apple IAP initialization...');

      // Initialize IAP service (sets up purchase listener)
      const initialized = await AppleIAPService.initialize();
      if (!initialized) {
        console.log('[PRICING_MODAL] Failed to initialize Apple IAP');
        setAppleIAPAvailable(false);
        setIsInitializing(false);
        return;
      }

      // Check availability
      const available = await AppleIAPService.isAvailable();
      setAppleIAPAvailable(available);
      console.log('[PRICING_MODAL] Apple IAP available:', available);

      if (available) {
        // CRITICAL: Fetch products from App Store before purchase
        // This is REQUIRED by expo-in-app-purchases before calling purchaseItemAsync
        const products = await AppleIAPService.getProducts();
        console.log('[PRICING_MODAL] Loaded products:', products.length);

        if (products.length > 0) {
          setProductsLoaded(true);
          console.log('[PRICING_MODAL] Products ready for purchase');
        } else {
          console.warn('[PRICING_MODAL] No products loaded from App Store');
          setProductsLoaded(false);
        }
      }
    } catch (error) {
      console.error('[PRICING_MODAL] Failed to initialize Apple IAP:', error);
      setAppleIAPAvailable(false);
      setProductsLoaded(false);
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

  const handleSelectPlan = async (planId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const period = isAnnual ? 'annual' : 'monthly';

    // Use Apple IAP on iOS if available AND products are loaded
    if (Platform.OS === 'ios' && appleIAPAvailable && productsLoaded) {
      console.log('[PRICING_MODAL] Using Apple IAP for purchase');
      await handleAppleIAPPurchase(planId, period);
    } else if (Platform.OS === 'ios' && appleIAPAvailable && !productsLoaded) {
      // Products not loaded yet - should not happen due to button being disabled
      console.error('[PRICING_MODAL] Products not loaded, cannot purchase');
      Alert.alert(
        'Please Wait',
        'Products are still loading from the App Store. Please try again in a moment.',
        [{ text: 'OK' }]
      );
    } else {
      console.log('[PRICING_MODAL] Using Stripe for purchase');
      onSelectPlan(planId, period); // This will navigate to Stripe checkout
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

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const handleRestorePurchases = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsRestoring(true);

    try {
      console.log('[PRICING_MODAL] Initiating restore purchases...');
      const result = await AppleIAPService.restorePurchases();

      if (result.success) {
        Alert.alert(
          'Restore Complete',
          'Your purchases have been checked. If you had an active subscription, it has been restored.',
          [{ text: 'OK', onPress: handleClose }]
        );
      } else {
        throw new Error(result.error || 'Failed to restore purchases');
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
            <Text style={styles.headerTitle}>Unlock Premium Features</Text>
            <Text style={styles.headerSubtitle}>Choose the plan that fits your goals</Text>
          </View>
        </View>

        {/* Main Scrollable Content */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
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
          {PRICING_PLANS.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquivalent = isAnnual
              ? `€${(parseFloat(plan.annualPrice.slice(1)) / 12).toFixed(2)}/mo`
              : null;
            const features = isAnnual ? plan.annualFeatures : plan.monthlyFeatures;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  !isTablet && index === 0 && { marginLeft: CARD_MARGIN },
                  !isTablet && index === PRICING_PLANS.length - 1 && { marginRight: CARD_MARGIN },
                  isTablet && { marginHorizontal: CARD_SPACING / 2 },
                  plan.isPopular && styles.planCardPopular,
                ]}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
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

                {/* Highlight */}
                {plan.highlight && (
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

                {/* CTA Button */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    plan.isPopular && styles.ctaButtonPopular,
                    Platform.OS === 'ios' && (isInitializing || !productsLoaded) && styles.ctaButtonDisabled,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  disabled={Platform.OS === 'ios' && (isInitializing || !productsLoaded)}
                  activeOpacity={0.8}
                >
                  {Platform.OS === 'ios' && isInitializing ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color={plan.isPopular ? '#FFFFFF' : '#4ECFBF'}
                      />
                      <Text
                        style={[
                          styles.ctaButtonText,
                          plan.isPopular && styles.ctaButtonTextPopular,
                          { marginLeft: 8 }
                        ]}
                      >
                        Loading...
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
                        Start Free Trial
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
            {PRICING_PLANS.map((_, index) => (
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

          {/* Restore Purchases Button - Required by Apple */}
          {Platform.OS === 'ios' && appleIAPAvailable && (
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
    </Modal>
  );
};
