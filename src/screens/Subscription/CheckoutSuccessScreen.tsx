import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../api/config';
import { cacheEvents } from '../../services/smartCache';

interface CheckoutSuccessScreenProps {
  navigation: any;
}

const BENEFITS = [
  { icon: 'flash',            label: '7-day free trial started',       sub: 'No charge until your trial ends' },
  { icon: 'chatbubbles',      label: 'Speaking sessions unlocked',      sub: 'Practice with AI tutors anytime' },
  { icon: 'heart',            label: 'Premium hearts activated',        sub: 'More energy for daily challenges' },
  { icon: 'trending-up',      label: 'Advanced tracking enabled',       sub: 'See your improvement over time' },
  { icon: 'close-circle',     label: 'Cancel anytime, no penalties',    sub: 'Full control over your plan' },
];

const CheckoutSuccessScreen: React.FC<CheckoutSuccessScreenProps> = ({ navigation }) => {
  // Animation values
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(24)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsY       = useRef(new Animated.Value(20)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Haptic success feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Staggered entrance animation
    Animated.sequence([
      // 1. Check icon pops in
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]),
      // 3. Benefit cards fade in
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardsY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]),
      // 4. Button fades in
      Animated.timing(btnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Pulse loop on check icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Sync hearts and refresh user data in background
    syncAfterCheckout();
  }, []);

  const syncAfterCheckout = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      // Sync hearts with new subscription
      await fetch(`${API_BASE_URL}/api/hearts/sync-with-subscription`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      // Refresh and cache user data
      const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }

      // Invalidate subscription and hearts caches after checkout
      console.log('[CACHE] Emitting subscription_changed event');
      cacheEvents.emit('subscription_changed');
    } catch {
      // Background sync — never block the UI on failure
    }
  };

  const handleStartLearning = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('Main', { screen: 'Dashboard', params: { upgradeSuccess: true } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Glow ring + animated check */}
        <View style={styles.iconWrapper}>
          <View style={styles.glowRing} />
          <Animated.View
            style={[
              styles.checkCircle,
              { transform: [{ scale: Animated.multiply(checkScale, pulseAnim) }], opacity: checkOpacity },
            ]}
          >
            <Ionicons name="checkmark" size={52} color="#FFFFFF" />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
          <Text style={styles.title}>You're all set! 🎉</Text>
          <Text style={styles.subtitle}>
            Your 7-day free trial has started.{'\n'}Enjoy full premium access — on us.
          </Text>
        </Animated.View>

        {/* Trial countdown pill */}
        <Animated.View style={[styles.trialPill, { opacity: titleOpacity }]}>
          <Ionicons name="time-outline" size={15} color="#4ECFBF" />
          <Text style={styles.trialPillText}>7 days free · then billed monthly · cancel anytime</Text>
        </Animated.View>

        {/* Benefit cards */}
        <Animated.View
          style={[styles.benefitsContainer, { opacity: cardsOpacity, transform: [{ translateY: cardsY }] }]}
        >
          {BENEFITS.map((item, i) => (
            <View key={i} style={styles.benefitCard}>
              <View style={styles.benefitIconBg}>
                <Ionicons name={item.icon as any} size={20} color="#4ECFBF" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitLabel}>{item.label}</Text>
                <Text style={styles.benefitSub}>{item.sub}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.btnWrapper, { opacity: btnOpacity }]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStartLearning}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaText}>Start Learning</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Manage or cancel anytime in Profile → Subscription
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // Icon
  iconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(78, 207, 191, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.35)',
  },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },

  // Title
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: 18,
  },

  // Trial pill
  trialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(78, 207, 191, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.28)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 32,
  },
  trialPillText: {
    fontSize: 12,
    color: '#4ECFBF',
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Benefit cards
  benefitsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 32,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.15)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  benefitIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(78, 207, 191, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  benefitSub: {
    fontSize: 12,
    color: '#8DB4AE',
    lineHeight: 16,
  },

  // CTA
  btnWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 17,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    gap: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 14,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerNote: {
    fontSize: 12,
    color: '#6B8A84',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CheckoutSuccessScreen;
