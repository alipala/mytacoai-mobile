import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Cap at 82% of screen — leaves visible dashboard above, enough room for all content
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.82, 720);

interface SubscriptionStatus {
  plan: string;
  period?: string;
  is_in_trial?: boolean;
  trial_days_remaining?: number;
}

interface SubscriptionBenefitsModalProps {
  visible: boolean;
  onClose: () => void;
  subscriptionStatus: SubscriptionStatus | null;
  navigation: any;
  onUpgrade?: () => void;
}

const PLAN_NAMES: Record<string, string> = {
  fluency_builder: 'Fluency Builder',
  language_mastery: 'Language Mastery',
  team_mastery: 'Team Mastery',
};

const getPlanBenefits = (status: SubscriptionStatus | null) => {
  const plan = status?.plan || 'free';
  const period = status?.period;
  const isAnnual = period === 'annual';

  if (plan === 'fluency_builder') {
    return isAnnual
      ? [
          { icon: 'chatbubbles' as const, text: '1800 min speaking/year' },
          { icon: 'mic' as const,         text: '24 assessments/year' },
          { icon: 'heart' as const,       text: '10 hearts for challenges' },
          { icon: 'time' as const,        text: 'Refills every 1 hour' },
          { icon: 'trophy' as const,      text: 'Advanced tracking' },
          { icon: 'star' as const,        text: 'All conversation topics' },
        ]
      : [
          { icon: 'chatbubbles' as const, text: '150 min speaking/month' },
          { icon: 'mic' as const,         text: '2 assessments/month' },
          { icon: 'heart' as const,       text: '10 hearts for challenges' },
          { icon: 'time' as const,        text: 'Refills every 1 hour' },
          { icon: 'trophy' as const,      text: 'Advanced tracking' },
          { icon: 'star' as const,        text: 'All conversation topics' },
        ];
  }

  if (plan === 'language_mastery' || plan === 'team_mastery') {
    return [
      { icon: 'infinite' as const,  text: 'UNLIMITED speaking' },
      { icon: 'analytics' as const, text: 'UNLIMITED assessments' },
      { icon: 'heart' as const,     text: 'UNLIMITED hearts' },
      { icon: 'flash' as const,     text: 'Instant heart refills' },
      { icon: 'bulb' as const,      text: 'Premium learning plans' },
      { icon: 'rocket' as const,    text: 'Advanced analytics' },
    ];
  }

  return [];
};

const SubscriptionBenefitsModal: React.FC<SubscriptionBenefitsModalProps> = ({
  visible,
  onClose,
  subscriptionStatus,
  onUpgrade,
}) => {
  const plan = subscriptionStatus?.plan || 'free';
  const isTrialing = subscriptionStatus?.is_in_trial;
  const trialDays = subscriptionStatus?.trial_days_remaining ?? 0;
  const canUpgrade = plan === 'fluency_builder';
  const benefits = getPlanBenefits(subscriptionStatus);
  const planName = PLAN_NAMES[plan] || 'Premium';

  const handleUpgrade = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
    onUpgrade?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Backdrop — tap to dismiss */}
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

      {/* Bottom sheet */}
      <LinearGradient
        colors={['#1C1500', '#251D00', '#1A1200']}
        style={styles.sheet}
      >
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Diamond glow icon */}
          <View style={styles.glowContainer}>
            <View style={styles.glowOuter} />
            <View style={styles.glowMid} />
            <View style={styles.iconCircle}>
              <Ionicons name="diamond" size={28} color="#FBBF24" />
            </View>
          </View>

          {/* Plan name */}
          <Text style={styles.planLabel}>YOUR PLAN</Text>
          <Text style={styles.planName}>{planName}</Text>

          {/* Status pill */}
          {isTrialing ? (
            <View style={styles.trialPill}>
              <Ionicons name="time-outline" size={13} color="#FBBF24" />
              <Text style={styles.trialPillText}>
                {trialDays} day{trialDays !== 1 ? 's' : ''} left in trial · No charge yet
              </Text>
            </View>
          ) : (
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activePillText}>
                {subscriptionStatus?.period === 'annual' ? 'Annual' : 'Monthly'} · Active
              </Text>
            </View>
          )}

          {/* Benefits */}
          <View style={styles.benefitsList}>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <Ionicons name={b.icon} size={17} color="#FBBF24" />
                </View>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>

          {/* Upgrade button */}
          {canUpgrade && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up-circle" size={17} color="#FBBF24" />
              <Text style={styles.upgradeButtonText}>Upgrade to Language Mastery</Text>
            </TouchableOpacity>
          )}

          {/* Manage info */}
          <Text style={styles.manageInfoText}>
            Manage in{' '}
            <Text style={styles.manageInfoHighlight}>Profile → App Settings → Subscription</Text>
          </Text>
        </ScrollView>

        {/* Done — pinned outside scroll so it's always visible */}
        <TouchableOpacity onPress={onClose} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Gold border glow at top
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },

  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
    flexShrink: 0,
  },

  closeButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },

  // Glow layers
  glowContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  glowOuter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.07)',
  },
  glowMid: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 10,
  },

  // Plan name
  planLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(251, 191, 36, 0.6)',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Pills
  trialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  trialPillText: {
    fontSize: 12,
    color: '#FCD34D',
    fontWeight: '600',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activePillText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // Benefits
  benefitsList: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
    lineHeight: 22,
  },

  // Upgrade button
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 14,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FBBF24',
  },

  // Manage info
  manageInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 18,
  },
  manageInfoHighlight: {
    color: 'rgba(251, 191, 36, 0.5)',
    fontWeight: '600',
  },

  // Done — always visible, pinned at bottom of sheet
  doneButton: {
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexShrink: 0,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
});

export default SubscriptionBenefitsModal;
