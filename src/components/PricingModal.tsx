import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualSavings: string;
  description: string;
  features: string[];
  isPopular?: boolean;
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
    annualSavings: 'Save $39.89 (17% off)',
    description: 'Ideal for serious language learners',
    isPopular: true,
    features: [
      '🎉 7-day free trial included',
      '30 practice sessions (5 minutes each) monthly',
      '2 speaking assessments monthly',
      'Advanced progress tracking',
      'Learning plan progression',
      'Achievement badges',
      'All conversation topics + custom topics',
      '🎤 Choose from multiple AI tutor voices',
      'Conversation history & analytics',
      'Priority email support',
    ],
  },
  {
    id: 'team_mastery',
    name: 'Language Mastery',
    monthlyPrice: '$39.99',
    annualPrice: '$399.99',
    annualSavings: 'Save $79.89 (17% off)',
    description: 'For advanced learners seeking fluency',
    features: [
      '🎉 7-day free trial included',
      'Unlimited practice sessions',
      'Unlimited speaking assessments',
      'Premium learning plans with advanced topics',
      '🎤 Choose from multiple AI tutor voices',
      '📊 Advanced analytics & detailed insights',
      '🎯 Personalized learning recommendations',
      '📝 Writing practice & correction',
      '🌍 Cultural context & idiom explanations',
      '⚡ Priority support & faster response times',
    ],
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({
  visible,
  onClose,
  onSelectPlan,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

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
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Billing Toggle */}
          <View style={styles.toggleContainer}>
            <Text
              style={[
                styles.toggleText,
                !isAnnual && styles.toggleTextActive,
              ]}
            >
              Monthly
            </Text>
            <TouchableOpacity
              style={styles.toggleSwitch}
              onPress={handleTogglePeriod}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleTrack,
                  isAnnual && styles.toggleTrackActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    isAnnual && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
            <Text
              style={[
                styles.toggleText,
                isAnnual && styles.toggleTextActive,
              ]}
            >
              Annual
            </Text>
            {isAnnual && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>Save up to 17%</Text>
              </View>
            )}
          </View>

          {/* Pricing Cards */}
          {PRICING_PLANS.map((plan, index) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.isPopular && styles.planCardPopular,
              ]}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>

              <View style={styles.priceContainer}>
                {isAnnual && (
                  <Text style={styles.originalPrice}>
                    ${((parseFloat(plan.monthlyPrice.slice(1)) * 12).toFixed(2))}
                  </Text>
                )}
                <Text style={styles.price}>
                  {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </Text>
                <Text style={styles.pricePeriod}>
                  {isAnnual ? '/year' : '/month'}
                </Text>
              </View>

              {isAnnual && (
                <Text style={styles.savings}>{plan.annualSavings}</Text>
              )}

              <Text style={styles.planDescription}>{plan.description}</Text>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#4ECFBF"
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  plan.isPopular && styles.selectButtonPopular,
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    plan.isPopular && styles.selectButtonTextPopular,
                  ]}
                >
                  Start Free Trial
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: '#111827',
  },
  toggleSwitch: {
    marginHorizontal: 12,
  },
  toggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#4ECFBF',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
  savingsBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    marginTop: Platform.OS === 'ios' ? 0 : 4,
  },
  savingsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  planCardPopular: {
    borderColor: '#4ECFBF',
    backgroundColor: '#F0FDFA',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#4ECFBF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  savings: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4ECFBF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonPopular: {
    backgroundColor: '#4ECFBF',
    borderColor: '#4ECFBF',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ECFBF',
  },
  selectButtonTextPopular: {
    color: '#FFFFFF',
  },
});
