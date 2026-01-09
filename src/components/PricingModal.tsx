import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Detect iPad (tablets have width > 768)
const isTablet = SCREEN_WIDTH >= 768;

// Card dimensions optimized for both iPhone and iPad
const CARD_WIDTH = isTablet ? SCREEN_WIDTH * 0.45 : SCREEN_WIDTH - 60; // Side-by-side on iPad
const CARD_SPACING = isTablet ? 30 : 20;
const CARD_MARGIN = isTablet ? 40 : 30;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  toggleSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    position: 'relative',
  },
  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleOptionTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  carouselContent: {
    paddingVertical: 14,
  },
  carouselContentTablet: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  planCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: CARD_SPACING / 2,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    // Removed fixed height to allow dynamic content
  },
  planCardPopular: {
    borderColor: '#4ECFBF',
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECFBF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 6,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  highlightContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  pricingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 38,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  monthlyEquivalent: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
  savingsTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  featuresGrid: {
    marginBottom: 14,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4ECFBF',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonPopular: {
    backgroundColor: '#4ECFBF',
    borderColor: '#4ECFBF',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4ECFBF',
    marginRight: 8,
  },
  ctaButtonTextPopular: {
    color: '#FFFFFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4ECFBF',
    width: 24,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  legalLinkText: {
    fontSize: 11,
    color: '#6B7280',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  maybeLaterButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  maybeLaterText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
