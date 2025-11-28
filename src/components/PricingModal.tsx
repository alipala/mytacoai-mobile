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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60;
const CARD_SPACING = 20;

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualSavings: string;
  shortDescription: string;
  features: {
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
    annualPrice: '$199.99',
    annualSavings: 'Save $39.89',
    shortDescription: 'Perfect for consistent learners',
    highlight: '🎉 7-day free trial',
    isPopular: true,
    features: [
      { icon: 'chatbubbles', text: '30 sessions monthly' },
      { icon: 'mic', text: '2 assessments' },
      { icon: 'trophy', text: 'Advanced tracking' },
      { icon: 'star', text: 'All AI voices' },
    ],
  },
  {
    id: 'team_mastery',
    name: 'Language Mastery',
    monthlyPrice: '$39.99',
    annualPrice: '$399.99',
    annualSavings: 'Save $79.89',
    shortDescription: 'Ultimate learning experience',
    highlight: '🎉 7-day free trial',
    features: [
      { icon: 'infinite', text: 'Unlimited sessions' },
      { icon: 'analytics', text: 'Advanced analytics' },
      { icon: 'bulb', text: 'AI recommendations' },
      { icon: 'flash', text: 'Priority support' },
    ],
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({
  visible,
  onClose,
  onSelectPlan,
}) => {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual for savings
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
          <View>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>Swipe to compare plans</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={32} color="#9CA3AF" />
          </TouchableOpacity>
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
              {isAnnual && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>Save 17%</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Cards Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          contentContainerStyle={styles.carouselContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {PRICING_PLANS.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquivalent = isAnnual
              ? `$${(parseFloat(plan.annualPrice.slice(1)) / 12).toFixed(2)}/mo`
              : null;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  index === 0 && { marginLeft: 30 },
                  index === PRICING_PLANS.length - 1 && { marginRight: 30 },
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
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <View style={styles.featureIconContainer}>
                        <Ionicons
                          name={feature.icon as any}
                          size={20}
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

        {/* Pagination Dots */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  toggleSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
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
    paddingVertical: 24,
  },
  planCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: CARD_SPACING / 2,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    marginBottom: 16,
  },
  planName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  highlightContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  pricingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 48,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  monthlyEquivalent: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
  savingsTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  featuresGrid: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
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
    paddingVertical: 16,
    borderRadius: 16,
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
    fontSize: 17,
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
    paddingVertical: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
});
