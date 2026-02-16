/**
 * WelcomeScreen.tsx
 *
 * Immersive welcome experience after onboarding completion.
 * Features the companion mascot surrounded by floating multilingual
 * greeting bubbles, with choreographed staggered entrance animations.
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Language greeting bubbles with their brand gradient colors
const LANGUAGE_BUBBLES = [
  { text: 'Hello!',    colors: ['#FF6B9D', '#C239B3'], angle: -55, distance: 135 },  // English (Pink → Purple)
  { text: '¡Hola!',    colors: ['#FFD63A', '#FFA955'], angle: -10, distance: 148 },  // Spanish (Yellow → Orange)
  { text: 'Bonjour!',  colors: ['#3B82F6', '#60A5FA'], angle: 35,  distance: 140 },  // French (Blue)
  { text: 'Olá!',      colors: ['#4ECFBF', '#00D4AA'], angle: 80,  distance: 130 },  // Portuguese (Teal → Emerald)
  { text: 'Hallo!',    colors: ['#F75A5A', '#FFA955'], angle: 145, distance: 142 },  // German (Coral → Orange)
  { text: 'Hoi!',      colors: ['#FFA955', '#FF7B7B'], angle: 190, distance: 136 },  // Dutch (Orange → Coral)
  { text: 'Merhaba!',  colors: ['#E74C3C', '#C0392B'], angle: 240, distance: 144 },  // Turkish (Red)
];

// Ambient floating particle positions (decorative depth)
const PARTICLES = [
  { x: 0.12, y: 0.08, size: 3, opacity: 0.25, delay: 0 },
  { x: 0.85, y: 0.12, size: 2.5, opacity: 0.2, delay: 400 },
  { x: 0.08, y: 0.35, size: 2, opacity: 0.15, delay: 800 },
  { x: 0.92, y: 0.38, size: 3.5, opacity: 0.2, delay: 200 },
  { x: 0.25, y: 0.55, size: 2, opacity: 0.12, delay: 600 },
  { x: 0.78, y: 0.58, size: 2.5, opacity: 0.18, delay: 1000 },
  { x: 0.15, y: 0.72, size: 2, opacity: 0.1, delay: 300 },
  { x: 0.88, y: 0.75, size: 3, opacity: 0.15, delay: 700 },
];

interface WelcomeScreenProps {
  navigation: any;
}

// ─────────────────────────────────────────────────────
// Floating Language Bubble Component
// ─────────────────────────────────────────────────────
function FloatingBubble({
  text,
  colors,
  angle,
  distance,
  index,
}: {
  text: string;
  colors: string[];
  angle: number;
  distance: number;
  index: number;
}) {
  const entranceDelay = 600 + index * 120; // Stagger after companion
  const floatOffset = useSharedValue(0);
  const bubbleScale = useSharedValue(0);
  const bubbleOpacity = useSharedValue(0);

  // Convert polar to cartesian for positioning
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  useEffect(() => {
    // Pop-in entrance
    bubbleScale.value = withDelay(
      entranceDelay,
      withSpring(1, { damping: 12, stiffness: 120 })
    );
    bubbleOpacity.value = withDelay(
      entranceDelay,
      withTiming(1, { duration: 400 })
    );

    // Gentle continuous float (each bubble has unique rhythm)
    const floatDuration = 2200 + index * 300;
    floatOffset.value = withDelay(
      entranceDelay + 200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: floatDuration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: floatDuration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const floatY = interpolate(floatOffset.value, [0, 1], [0, -8]);
    const floatX = interpolate(floatOffset.value, [0, 1], [0, index % 2 === 0 ? 3 : -3]);
    return {
      transform: [
        { translateX: x + floatX },
        { translateY: y + floatY },
        { scale: bubbleScale.value },
      ],
      opacity: bubbleOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.bubbleWrapper, animatedStyle]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bubbleGradient}
      >
        <Text style={styles.bubbleText}>{text}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────
// Ambient Floating Particle
// ─────────────────────────────────────────────────────
function FloatingParticle({
  x, y, size, opacity: baseOpacity, delay,
}: {
  x: number; y: number; size: number; opacity: number; delay: number;
}) {
  const floatY = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  useEffect(() => {
    particleOpacity.value = withDelay(
      delay + 400,
      withTiming(baseOpacity, { duration: 1200 })
    );
    floatY.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x * SCREEN_WIDTH,
    top: y * SCREEN_HEIGHT,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#14B8A6',
    opacity: particleOpacity.value,
    transform: [{ translateY: interpolate(floatY.value, [0, 1], [0, -12]) }],
  }));

  return <Animated.View style={animStyle} />;
}

// ─────────────────────────────────────────────────────
// Main WelcomeScreen
// ─────────────────────────────────────────────────────
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  // Companion entrance animations
  const companionScale = useSharedValue(0);
  const companionOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const exitOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Companion scales in with spring physics
    companionScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 80 }));
    companionOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // 2. Continuous glow pulse around companion
    glowPulse.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const companionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: companionScale.value }],
    opacity: companionOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.15, 0.4]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.9, 1.1]) }],
  }));

  const exitStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
  }));

  // Navigation handlers with exit animation
  const animateOut = useCallback((callback: () => void) => {
    exitOpacity.value = withTiming(0, { duration: 250 }, () => {
      // Run on JS thread after animation completes
    });
    // Use setTimeout to match the animation duration
    setTimeout(callback, 260);
  }, []);

  const handleCreateAccount = useCallback(() => {
    animateOut(() => navigation.replace('Login'));
  }, [navigation]);

  const handleTryAsGuest = useCallback(() => {
    animateOut(() => navigation.replace('LanguageSelection'));
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0B1A1F', '#0D2832', '#102B36', '#0D2832', '#0B1A1F']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.screenWrapper, exitStyle]}>
          {/* ── Ambient floating particles ── */}
          {PARTICLES.map((p, i) => (
            <FloatingParticle key={i} {...p} />
          ))}

          {/* ══════════ HERO SECTION ══════════ */}
          <View style={styles.heroSection}>
            {/* Pulsing glow ring behind companion */}
            <Animated.View style={[styles.glowRing, glowAnimatedStyle]} />
            <Animated.View style={[styles.glowRingInner, glowAnimatedStyle]} />

            {/* Companion mascot */}
            <Animated.View style={[styles.companionContainer, companionAnimatedStyle]}>
              <LottieView
                source={require('../../assets/lottie/companion_idle2.json')}
                autoPlay
                loop
                resizeMode="contain"
                style={styles.companionLottie}
              />
            </Animated.View>

            {/* Floating language bubbles orbiting around companion */}
            <View style={styles.bubblesOrbit}>
              {LANGUAGE_BUBBLES.map((bubble, i) => (
                <FloatingBubble key={i} index={i} {...bubble} />
              ))}
            </View>
          </View>

          {/* ══════════ TEXT CONTENT ══════════ */}
          <Animated.View
            entering={FadeInUp.delay(1400).duration(600).springify()}
            style={styles.textSection}
          >
            <Text style={styles.tagline}>{t('onboarding.welcome.tagline')}</Text>
            <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>

            {/* Benefit pills row */}
            <Animated.View
              entering={FadeIn.delay(1700).duration(500)}
              style={styles.benefitsContainer}
            >
              <View style={styles.benefitPill}>
                <Ionicons name="mic-outline" size={14} color="#5EEAD4" />
                <Text style={styles.benefitText}>{t('onboarding.benefits.pill_adaptive_ai')}</Text>
              </View>
              <View style={styles.benefitPill}>
                <Ionicons name="albums-outline" size={14} color="#FFD63A" />
                <Text style={styles.benefitText}>{t('onboarding.benefits.pill_smart_flashcards')}</Text>
              </View>
              <View style={styles.benefitPill}>
                <Ionicons name="trending-up-outline" size={14} color="#FF6B9D" />
                <Text style={styles.benefitText}>{t('onboarding.benefits.pill_progress_tracking')}</Text>
              </View>
              <View style={styles.benefitPill}>
                <Ionicons name="ribbon-outline" size={14} color="#FFA955" />
                <Text style={styles.benefitText}>{t('onboarding.benefits.pill_personalised_learning')}</Text>
              </View>
              <View style={styles.benefitPill}>
                <Ionicons name="list-outline" size={14} color="#4ECFBF" />
                <Text style={styles.benefitText}>{t('onboarding.benefits.pill_custom_topics')}</Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* ══════════ CTA SECTION ══════════ */}
          <Animated.View
            entering={FadeInDown.delay(2000).duration(600).springify()}
            style={styles.ctaSection}
          >
            {/* Primary CTA — Gradient with glow */}
            <AnimatedTouchable
              style={styles.primaryButton}
              onPress={handleTryAsGuest}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#5EEAD4', '#14B8A6', '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="chatbubbles" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.primaryButtonText}>
                  {t('onboarding.welcome.button_start_free_practice')}
                </Text>
              </LinearGradient>
            </AnimatedTouchable>

            {/* Secondary CTA — Glass login */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>{t('onboarding.welcome.button_login')}</Text>
            </TouchableOpacity>

            {/* Reassurance */}
            <Text style={styles.reassurance}>{t('onboarding.welcome.reassurance')}</Text>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  gradient: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
    overflow: 'hidden',
  },

  // ── Hero Section (companion + bubbles) ──
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.42,
  },

  // Pulsing teal glow rings behind companion
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 0,
  },
  glowRingInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(20, 184, 166, 0.06)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 0,
  },

  // Companion character
  companionContainer: {
    zIndex: 10,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  companionLottie: {
    width: 160,
    height: 160,
  },

  // Bubble orbit container (centered on companion)
  bubblesOrbit: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Individual floating bubble
  bubbleWrapper: {
    position: 'absolute',
  },
  bubbleGradient: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Text Content ──
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -8,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 36,
    textShadowColor: 'rgba(20, 184, 166, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Benefit pills
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  benefitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  benefitText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // ── CTA Section ──
  ctaSection: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 28,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryButtonGradient: {
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14B8A6',
  },
  reassurance: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.35)',
    textAlign: 'center',
    marginTop: 2,
  },
});
