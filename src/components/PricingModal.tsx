import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { styles, CARD_WIDTH, CARD_SPACING, CARD_MARGIN, isTablet } from './styles/PricingModal.styles';

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
    monthlyPrice: '$19.99',
    annualPrice: '$119.00',
    annualSavings: 'Save $120.88',
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
    monthlyPrice: '$39.99',
    annualPrice: '$239.00',
    annualSavings: 'Save $240.88',
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
  const [isAnnual, setIsAnnual] = useState(false); // Default to monthly
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleTogglePeriod = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsAnnual(!isAnnual);
  };

  const handleSelectPlan = (planId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const period = isAnnual ? 'annual' : 'monthly';
    onSelectPlan(planId, period);
  };

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Unlock Premium Features</Text>
            <Text style={styles.headerSubtitle}>Choose the plan that fits your goals</Text>
          </View>
        </View>

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
              ? `$${(parseFloat(plan.annualPrice.slice(1)) / 12).toFixed(2)}/mo`
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
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  activeOpacity={0.8}
                >
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
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.footerText}>
              Cancel anytime during free trial
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Ionicons name="lock-closed" size={16} color="#10B981" />
            <Text style={styles.footerText}>Secure payment with Stripe</Text>
          </View>

          {/* Legal Links */}
          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.mytacoai.com/terms')}
              activeOpacity={0.7}
            >
              <Text style={styles.legalLinkText}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.mytacoai.com/privacy')}
              activeOpacity={0.7}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          {/* Maybe Later Option */}
          <TouchableOpacity
            style={styles.maybeLaterButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
