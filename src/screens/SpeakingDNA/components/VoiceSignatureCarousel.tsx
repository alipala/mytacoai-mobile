/**
 * Voice Signature Carousel Component - REDESIGNED
 *
 * Full-screen swipeable cards showing acoustic metrics
 * with interpretations and AI tutor analysis
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // Full width with padding
const CARD_GAP = 16;
const CARD_PADDING = 20;

interface AcousticMetrics {
  pitch_mean?: number;
  pitch_std?: number;
  jitter?: number;
  shimmer?: number;
  words_per_minute?: number;
  pause_ratio?: number;
  voice_quality_factor?: number;
  filler_rate_per_minute?: number;
  articulation_rate?: number;
  speech_rate?: number;
  energy_mean?: number;
  energy_std?: number;
  intensity_mean?: number;
}

interface VoiceSignatureCarouselProps {
  acousticMetrics: AcousticMetrics;
}

interface AcousticCard {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradientColors: string[];
  getValue: (metrics: AcousticMetrics) => {
    main: string;
    sub: string;
    interpretation: string;
    analysis: string;
    score: 'excellent' | 'good' | 'needs-work';
  };
}

/**
 * Generate AI tutor analysis based on metric values
 */
const generatePitchAnalysis = (pitch: number, range: number): { interpretation: string; analysis: string; score: 'excellent' | 'good' | 'needs-work' } => {
  // Average pitch: Male 85-180 Hz, Female 165-255 Hz
  const isGoodRange = range >= 30 && range <= 50;
  const isGoodPitch = pitch >= 100 && pitch <= 220;

  if (isGoodPitch && isGoodRange) {
    return {
      interpretation: 'Your vocal pitch is natural and expressive, with healthy variation.',
      analysis: 'Great work! Your pitch range shows natural expressiveness. This helps convey emotions and keep listeners engaged.',
      score: 'excellent'
    };
  } else if (!isGoodRange && range < 20) {
    return {
      interpretation: 'Your pitch is somewhat monotone with limited variation.',
      analysis: 'Try using more pitch variation to sound more expressive. Practice emphasizing key words by raising or lowering your pitch.',
      score: 'needs-work'
    };
  }
  return {
    interpretation: 'Your pitch is within a normal range with moderate variation.',
    analysis: 'Your pitch sounds natural. Consider adding more variation on important words to enhance expressiveness.',
    score: 'good'
  };
};

const generateQualityAnalysis = (quality: number, jitter: number): { interpretation: string; analysis: string; score: 'excellent' | 'good' | 'needs-work' } => {
  // Jitter < 1% is excellent, 1-2% is good, >2% needs work
  const jitterPercent = jitter * 100;

  if (jitterPercent < 1.0) {
    return {
      interpretation: 'Your voice quality is excellent with minimal frequency variations.',
      analysis: 'Outstanding! Your voice is stable and clear. This indicates good vocal health and control.',
      score: 'excellent'
    };
  } else if (jitterPercent < 2.0) {
    return {
      interpretation: 'Your voice quality is good with normal frequency variations.',
      analysis: 'Your voice quality is healthy. Minor variations are natural and don\'t affect clarity.',
      score: 'good'
    };
  }
  return {
    interpretation: 'Your voice shows some frequency instability.',
    analysis: 'Consider vocal warm-ups before speaking. Stay hydrated and avoid straining your voice.',
    score: 'needs-work'
  };
};

const generateSpeakingRateAnalysis = (wpm: number, pauseRatio: number): { interpretation: string; analysis: string; score: 'excellent' | 'good' | 'needs-work' } => {
  // Ideal: 150-180 WPM, Pause ratio: 30-40%
  const isGoodWPM = wpm >= 120 && wpm <= 180;
  const isGoodPauses = pauseRatio >= 0.25 && pauseRatio <= 0.45;

  if (isGoodWPM && isGoodPauses) {
    return {
      interpretation: 'Your speaking pace is well-balanced with natural pausing.',
      analysis: 'Perfect! Your speaking rate and pauses make your speech easy to follow and engaging.',
      score: 'excellent'
    };
  } else if (wpm < 100) {
    return {
      interpretation: 'You speak quite slowly with frequent pauses.',
      analysis: 'Try to increase your speaking pace slightly. It\'s okay to speak faster once you\'re comfortable with the words.',
      score: 'needs-work'
    };
  } else if (wpm > 200) {
    return {
      interpretation: 'You speak very quickly with minimal pausing.',
      analysis: 'Slow down a bit and add strategic pauses. This gives your listener time to process what you\'re saying.',
      score: 'needs-work'
    };
  }
  return {
    interpretation: 'Your speaking rate is reasonable with adequate pausing.',
    analysis: 'Good pacing! Consider adding slightly more strategic pauses to emphasize key points.',
    score: 'good'
  };
};

const generateEnergyAnalysis = (energy: number): { interpretation: string; analysis: string; score: 'excellent' | 'good' | 'needs-work' } => {
  // Energy (amplitude): Higher is more energetic
  if (energy > 0.05) {
    return {
      interpretation: 'You speak with strong vocal energy and projection.',
      analysis: 'Excellent! Your vocal energy is engaging and clear. This makes you easy to understand.',
      score: 'excellent'
    };
  } else if (energy > 0.03) {
    return {
      interpretation: 'Your vocal energy is moderate and comfortable.',
      analysis: 'Your energy level is good. You can project more on important points to add emphasis.',
      score: 'good'
    };
  }
  return {
    interpretation: 'Your voice is quite soft with lower energy.',
    analysis: 'Try speaking with more energy and projection. Imagine speaking to someone across the room.',
    score: 'needs-work'
  };
};

const generateFluencyAnalysis = (fillerRate: number, articulationRate: number): { interpretation: string; analysis: string; score: 'excellent' | 'good' | 'needs-work' } => {
  // Filler rate: <2/min excellent, 2-4/min good, >4/min needs work
  if (fillerRate < 2) {
    return {
      interpretation: 'Your speech is smooth and fluent with minimal filler words.',
      analysis: 'Fantastic! You speak with confidence and few hesitations. Your fluency is excellent.',
      score: 'excellent'
    };
  } else if (fillerRate < 4) {
    return {
      interpretation: 'Your speech has some filler words but remains fluent.',
      analysis: 'Good fluency! Pause silently instead of using "um" or "uh" - silence is powerful.',
      score: 'good'
    };
  }
  return {
    interpretation: 'You use frequent filler words when speaking.',
    analysis: 'Try pausing silently when thinking. Practice speaking more slowly to reduce "um" and "uh".',
    score: 'needs-work'
  };
};

const generateStabilityAnalysis = (shimmer: number): { interpretation: string; analysis: string; score: 'excellent' | 'good' | 'needs-work' } => {
  // Shimmer: <3.81% is stable, 3.81-5% moderate, >5% unstable
  const shimmerPercent = shimmer * 100;

  if (shimmerPercent < 3.81) {
    return {
      interpretation: 'Your voice amplitude is very stable and consistent.',
      analysis: 'Excellent! Your voice control is strong, producing clear and steady speech.',
      score: 'excellent'
    };
  } else if (shimmerPercent < 5.0) {
    return {
      interpretation: 'Your voice shows moderate amplitude variations.',
      analysis: 'Your voice stability is okay. Normal variations occur naturally during speech.',
      score: 'good'
    };
  }
  return {
    interpretation: 'Your voice has noticeable amplitude instability.',
    analysis: 'Focus on maintaining steady breath support. Vocal exercises can help improve stability.',
    score: 'needs-work'
  };
};

const ACOUSTIC_CARDS: AcousticCard[] = [
  {
    key: 'pitch',
    title: 'Vocal Pitch',
    icon: 'musical-notes',
    color: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#6D28D9'],
    getValue: (metrics) => {
      const pitch = Math.round(metrics.pitch_mean || 0);
      const range = Math.round(metrics.pitch_std || 0);
      const { interpretation, analysis, score } = generatePitchAnalysis(pitch, range);
      return {
        main: `${pitch} Hz`,
        sub: `Variation: ${range} Hz`,
        interpretation,
        analysis,
        score,
      };
    },
  },
  {
    key: 'quality',
    title: 'Voice Quality',
    icon: 'radio',
    color: '#10B981',
    gradientColors: ['#10B981', '#059669'],
    getValue: (metrics) => {
      const quality = (metrics.voice_quality_factor || 0) * 100;
      const jitter = metrics.jitter || 0;
      const { interpretation, analysis, score } = generateQualityAnalysis(quality, jitter);
      return {
        main: `${quality.toFixed(0)}%`,
        sub: `Jitter: ${(jitter * 100).toFixed(2)}%`,
        interpretation,
        analysis,
        score,
      };
    },
  },
  {
    key: 'speaking',
    title: 'Speaking Rate',
    icon: 'speedometer',
    color: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706'],
    getValue: (metrics) => {
      const wpm = Math.round(metrics.words_per_minute || 0);
      const pauseRatio = metrics.pause_ratio || 0;
      const { interpretation, analysis, score } = generateSpeakingRateAnalysis(wpm, pauseRatio);
      return {
        main: `${wpm} WPM`,
        sub: `Pauses: ${(pauseRatio * 100).toFixed(0)}%`,
        interpretation,
        analysis,
        score,
      };
    },
  },
  {
    key: 'energy',
    title: 'Vocal Energy',
    icon: 'flash',
    color: '#EF4444',
    gradientColors: ['#EF4444', '#DC2626'],
    getValue: (metrics) => {
      const energy = metrics.energy_mean || 0;
      const { interpretation, analysis, score } = generateEnergyAnalysis(energy);
      return {
        main: energy > 0 ? `${energy.toFixed(3)}` : 'Low',
        sub: `Amplitude level`,
        interpretation,
        analysis,
        score,
      };
    },
  },
  {
    key: 'fluency',
    title: 'Speech Fluency',
    icon: 'chatbubbles',
    color: '#3B82F6',
    gradientColors: ['#3B82F6', '#2563EB'],
    getValue: (metrics) => {
      const fillerRate = metrics.filler_rate_per_minute || 0;
      const articulationRate = metrics.articulation_rate || 0;
      const { interpretation, analysis, score } = generateFluencyAnalysis(fillerRate, articulationRate);
      return {
        main: fillerRate === 0 ? 'Smooth' : `${fillerRate.toFixed(1)}/min`,
        sub: articulationRate > 0 ? `${articulationRate.toFixed(1)} syl/s` : 'N/A',
        interpretation,
        analysis,
        score,
      };
    },
  },
  {
    key: 'stability',
    title: 'Voice Stability',
    icon: 'pulse',
    color: '#EC4899',
    gradientColors: ['#EC4899', '#DB2777'],
    getValue: (metrics) => {
      const shimmer = (metrics.shimmer || 0) * 100;
      const { interpretation, analysis, score } = generateStabilityAnalysis(metrics.shimmer || 0);
      return {
        main: `${shimmer.toFixed(2)}%`,
        sub: 'Shimmer level',
        interpretation,
        analysis,
        score,
      };
    },
  },
];

/**
 * Individual Full-Screen Acoustic Card
 */
const FullScreenAcousticCard: React.FC<{
  card: AcousticCard;
  metrics: AcousticMetrics;
  index: number;
  scrollX: Animated.SharedValue<number>;
}> = ({ card, metrics, index, scrollX }) => {
  const values = card.getValue(metrics);

  /**
   * Card animation based on scroll position
   */
  const animatedCardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_GAP),
      index * (CARD_WIDTH + CARD_GAP),
      (index + 1) * (CARD_WIDTH + CARD_GAP),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.92, 1, 0.92],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.fullCard, animatedCardStyle]}>
      <LinearGradient
        colors={[...card.gradientColors, '#1F2937']}
        style={styles.fullCardGradient}
      >
        {/* Icon and Title */}
        <View style={styles.fullCardHeader}>
          <View style={[styles.fullIconContainer, { backgroundColor: `${card.color}30` }]}>
            <Ionicons name={card.icon} size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.fullCardTitle}>{card.title}</Text>
        </View>

        {/* Main Value Display */}
        <View style={styles.valueContainer}>
          <Text style={styles.fullMainValue}>{values.main}</Text>
          <Text style={styles.fullSubValue}>{values.sub}</Text>
        </View>

        {/* What This Means Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={18} color="#FCD34D" />
            <Text style={styles.sectionTitle}>What This Means</Text>
          </View>
          <Text style={styles.interpretationText}>{values.interpretation}</Text>
        </View>

        {/* AI Tutor Analysis */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school-outline" size={18} color="#14B8A6" />
            <Text style={styles.sectionTitle}>AI Tutor Says</Text>
          </View>
          <Text style={styles.analysisText}>{values.analysis}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

/**
 * Page Indicator Dots
 */
const PageIndicator: React.FC<{ currentIndex: number; total: number }> = ({
  currentIndex,
  total,
}) => {
  return (
    <View style={styles.pageIndicator}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pageIndicatorDot,
            currentIndex === index && styles.pageIndicatorDotActive,
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Voice Signature Carousel - Full Screen Cards
 */
export const VoiceSignatureCarousel: React.FC<VoiceSignatureCarouselProps> = ({
  acousticMetrics,
}) => {
  const scrollX = useSharedValue(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / (CARD_WIDTH + CARD_GAP));
      runOnJS(setCurrentCardIndex)(index);
    },
  });

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Your Voice Fingerprint</Text>
        <Text style={styles.subtitle}>Swipe to explore your acoustic profile</Text>
      </View>

      {/* Full-Screen Scrolling Cards */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="center"
        pagingEnabled={false}
      >
        {ACOUSTIC_CARDS.map((card, index) => (
          <FullScreenAcousticCard
            key={card.key}
            card={card}
            metrics={acousticMetrics}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* Page Indicator */}
      <PageIndicator currentIndex={currentCardIndex} total={ACOUSTIC_CARDS.length} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  titleContainer: {
    paddingHorizontal: CARD_PADDING,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#B4E4DD',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: CARD_PADDING,
    gap: CARD_GAP,
  },
  fullCard: {
    width: CARD_WIDTH,
    height: 520,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  fullCardGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  fullCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fullIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fullCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  fullMainValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fullSubValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  interpretationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    fontWeight: '500',
  },
  analysisText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pageIndicatorDotActive: {
    width: 24,
    backgroundColor: '#14B8A6',
  },
});
