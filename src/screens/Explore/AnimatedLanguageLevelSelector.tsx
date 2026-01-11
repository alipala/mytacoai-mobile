/**
 * Animated Language & Level Selector
 *
 * Premium gaming experience with:
 * - Smooth swipe carousel for language selection
 * - Draggable slider for level selection
 * - Haptic feedback on interactions
 * - Beautiful animations and transitions
 * - "Slide up to start" gesture
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Language, CEFRLevel } from '../../services/mockChallengeData';

// Import SVG flags as components
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';

const { width, height } = Dimensions.get('window');

interface Props {
  onComplete: (language: Language, level: CEFRLevel) => void;
  onCancel?: () => void;
  initialLanguage?: Language;
  initialLevel?: CEFRLevel;
}

// Language options with beautiful gradients
const LANGUAGES: { value: Language; label: string; FlagComponent: React.FC<any>; gradient: [string, string] }[] = [
  { value: 'english', label: 'English', FlagComponent: EnglishFlag, gradient: ['#667eea', '#764ba2'] },
  { value: 'spanish', label: 'Español', FlagComponent: SpanishFlag, gradient: ['#f093fb', '#f5576c'] },
  { value: 'french', label: 'Français', FlagComponent: FrenchFlag, gradient: ['#4facfe', '#00f2fe'] },
  { value: 'german', label: 'Deutsch', FlagComponent: GermanFlag, gradient: ['#43e97b', '#38f9d7'] },
  { value: 'portuguese', label: 'Português', FlagComponent: PortugueseFlag, gradient: ['#fa709a', '#fee140'] },
  { value: 'dutch', label: 'Nederlands', FlagComponent: DutchFlag, gradient: ['#30cfd0', '#330867'] },
];

// Level options
const LEVELS: { value: CEFRLevel; label: string; description: string }[] = [
  { value: 'A1', label: 'A1', description: 'Beginner' },
  { value: 'A2', label: 'A2', description: 'Elementary' },
  { value: 'B1', label: 'B1', description: 'Intermediate' },
  { value: 'B2', label: 'B2', description: 'Upper Int.' },
  { value: 'C1', label: 'C1', description: 'Advanced' },
  { value: 'C2', label: 'C2', description: 'Mastery' },
];

export default function AnimatedLanguageLevelSelector({
  onComplete,
  onCancel,
  initialLanguage = 'english',
  initialLevel = 'B1',
}: Props) {
  // Find initial indices
  const initialLangIndex = LANGUAGES.findIndex(l => l.value === initialLanguage);
  const initialLevelIndex = LEVELS.findIndex(l => l.value === initialLevel);

  // State
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(initialLangIndex >= 0 ? initialLangIndex : 0);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(initialLevelIndex >= 0 ? initialLevelIndex : 2);
  const [levelPositions, setLevelPositions] = useState<number[]>([]);

  // Refs to store current selection (fixes stale closure in PanResponders)
  const selectedLanguageIndexRef = useRef(selectedLanguageIndex);
  const selectedLevelIndexRef = useRef(selectedLevelIndex);

  // Animation values
  const languageCardOpacity = useRef(new Animated.Value(1)).current;
  const levelSliderX = useRef(new Animated.Value(0)).current;

  const slideUpY = useRef(new Animated.Value(0)).current;
  const slideUpOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(slideUpOpacity, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();

    // Subtle pulse animation for "Slide Up" indicator
    Animated.loop(
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
    ).start();

    // Floating up/down animation for slide up button - smooth and prominent
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -18,
          duration: 1000,
          easing: (t) => {
            // Ease in-out for smooth motion
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          },
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          easing: (t) => {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          },
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Measure level positions on mount
  const levelRefs = useRef<any[]>([]);

  // Update refs when state changes (fixes stale closure bug)
  useEffect(() => {
    selectedLanguageIndexRef.current = selectedLanguageIndex;
    console.log('🌍 Language changed to:', LANGUAGES[selectedLanguageIndex].value);

    // Simple fade effect when language changes
    Animated.sequence([
      Animated.timing(languageCardOpacity, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(languageCardOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedLanguageIndex]);

  useEffect(() => {
    selectedLevelIndexRef.current = selectedLevelIndex;
    console.log('📊 Level changed to:', LEVELS[selectedLevelIndex].value);
  }, [selectedLevelIndex]);

  // Update handle position when level changes or positions are measured
  useEffect(() => {
    if (levelPositions.length === LEVELS.length) {
      const handleWidth = 70;
      const handleOffset = handleWidth / 2;
      const targetX = levelPositions[selectedLevelIndex] - handleOffset;

      Animated.spring(levelSliderX, {
        toValue: targetX,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedLevelIndex, levelPositions]);

  // Measure all level positions after layout
  const measureLevelPositions = () => {
    const positions: number[] = [];
    let measured = 0;

    levelRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          const centerX = pageX + width / 2 - 20; // Subtract content padding
          positions[index] = centerX;
          measured++;

          if (measured === LEVELS.length) {
            setLevelPositions(positions);
          }
        });
      }
    });
  };

  // Level slider drag handler
  const levelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (levelPositions.length !== LEVELS.length) return;

        const handleWidth = 70;
        const handleOffset = handleWidth / 2;
        const contentPadding = 20;

        // Calculate handle center position (touch x - content padding)
        const handleCenter = evt.nativeEvent.pageX - contentPadding;
        const handleLeft = handleCenter - handleOffset;

        // Constrain to slider bounds
        const minHandleLeft = levelPositions[0] - handleOffset;
        const maxHandleLeft = levelPositions[LEVELS.length - 1] - handleOffset;
        const constrainedLeft = Math.max(minHandleLeft, Math.min(maxHandleLeft, handleLeft));

        levelSliderX.setValue(constrainedLeft);

        // Find closest level based on handle center
        const constrainedCenter = constrainedLeft + handleOffset;
        let closestIndex = 0;
        let closestDistance = Math.abs(levelPositions[0] - constrainedCenter);

        for (let i = 1; i < levelPositions.length; i++) {
          const distance = Math.abs(levelPositions[i] - constrainedCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }

        if (closestIndex !== selectedLevelIndex) {
          setSelectedLevelIndex(closestIndex);
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },
      onPanResponderRelease: () => {
        // Snap animation is handled by useEffect
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
    })
  ).current;

  // Slide up to start gesture - Vertical sliding animation
  const slideUpButtonY = useRef(new Animated.Value(0)).current;
  const slideUpPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5; // Start tracking after 5px movement
      },
      onPanResponderGrant: () => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow upward movement (negative dy)
        if (gestureState.dy < 0) {
          const moveY = Math.max(gestureState.dy, -150); // Max 150px up
          slideUpButtonY.setValue(moveY);
          slideUpOpacity.setValue(1 + moveY / 300); // Fade as it moves
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -80) {
          // Swipe threshold met - start!
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          handleStart();
        } else {
          // Bounce back with spring animation
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          Animated.parallel([
            Animated.spring(slideUpButtonY, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(slideUpOpacity, {
              toValue: 1,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleStart = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Read from refs to get the CURRENT values (not stale closure values)
    const currentLanguageIndex = selectedLanguageIndexRef.current;
    const currentLevelIndex = selectedLevelIndexRef.current;
    const selectedLanguage = LANGUAGES[currentLanguageIndex].value;
    const selectedLevel = LEVELS[currentLevelIndex].value;

    console.log('🚀 Starting with:', selectedLanguage, selectedLevel);

    // Smooth exit animation
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpY, {
        toValue: -height,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('✅ Completing with:', selectedLanguage, selectedLevel);
      onComplete(selectedLanguage, selectedLevel);
    });
  };

  const currentLanguage = LANGUAGES[selectedLanguageIndex];
  const currentLevel = LEVELS[selectedLevelIndex];

  return (
    <View style={styles.container}>
      {/* Light Background Gradient - matches rest of app */}
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB', '#F3F4F6']}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: slideUpY }],
          },
        ]}
      >
        {/* Header with back button */}
        <View style={styles.headerContainer}>
          {onCancel && (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onCancel();
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Choose Your Path</Text>
            <Text style={styles.headerSubtitle}>Select language and level</Text>
          </View>
        </View>

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🌍 Language</Text>

          <View style={styles.languageCarousel}>
            <Animated.View style={[styles.languageCard, { opacity: languageCardOpacity }]}>
              <LinearGradient colors={currentLanguage.gradient} style={styles.languageGradient}>
                <currentLanguage.FlagComponent width={80} height={80} style={styles.languageFlag} />
                <Text style={styles.languageLabel}>{currentLanguage.label}</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Navigation buttons and dots */}
          <View style={styles.swipeIndicators}>
            {selectedLanguageIndex > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedLanguageIndex(selectedLanguageIndex - 1);
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>←</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}

            <View style={styles.dots}>
              {LANGUAGES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === selectedLanguageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            {selectedLanguageIndex < LANGUAGES.length - 1 ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedLanguageIndex(selectedLanguageIndex + 1);
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>→</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        </View>

        {/* Level Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📊 Level</Text>

          <View style={styles.levelContainer}>
            {/* Level labels - Tappable */}
            <View
              style={styles.levelLabels}
              onLayout={() => {
                // Measure positions after layout completes
                setTimeout(() => measureLevelPositions(), 100);
              }}
            >
              {LEVELS.map((level, index) => (
                <View
                  key={level.value}
                  ref={(ref) => { levelRefs.current[index] = ref; }}
                  collapsable={false}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLevelIndex(index);
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      // Snap animation is handled by useEffect
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.levelLabel,
                        index === selectedLevelIndex && styles.levelLabelActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Slider track */}
            <View style={styles.sliderTrack}>
              {LEVELS.map((_, index) => (
                <View key={index} style={styles.sliderDot} />
              ))}
            </View>

            {/* Draggable handle */}
            <Animated.View
              {...levelPanResponder.panHandlers}
              style={[
                styles.sliderHandle,
                {
                  left: levelSliderX,
                },
              ]}
            >
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                style={styles.sliderHandleInner}
              >
                <Text style={styles.sliderHandleText}>{currentLevel.label}</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Level description */}
          <Text style={styles.levelDescription}>{currentLevel.description}</Text>
        </View>

        {/* Slide Up to Start - Vertical slider with knob */}
        <View style={styles.slideUpContainer}>
          {/* Vertical track */}
          <View style={styles.slideUpTrack}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.3)']}
              style={styles.slideUpTrackGradient}
            />
          </View>

          {/* Instruction text with floating arrow */}
          <Animated.View
            style={[
              styles.slideUpTextContainer,
              {
                transform: [{ translateY: Animated.multiply(floatAnim, 0.4) }],
              },
            ]}
          >
            <Text style={styles.slideUpArrow}>↑</Text>
            <Text style={styles.slideUpText}>Slide up</Text>
          </Animated.View>

          {/* Draggable knob with floating animation */}
          <Animated.View
            {...slideUpPanResponder.panHandlers}
            style={[
              styles.slideUpKnobWrapper,
              {
                transform: [
                  { translateY: Animated.add(slideUpButtonY, floatAnim) },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleStart}
              activeOpacity={0.9}
              style={styles.slideUpKnob}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.slideUpKnobGradient}
              >
                <Text style={styles.slideUpKnobIcon}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 60,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#06B6D4',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 60,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    paddingLeft: 4,
  },
  languageCarousel: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageCard: {
    width: width - 80,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  languageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageFlag: {
    marginBottom: 12,
  },
  languageLabel: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  swipeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  navButtonText: {
    fontSize: 24,
    color: '#06B6D4',
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#06B6D4',
    width: 24,
  },
  levelContainer: {
    height: 80,
    marginBottom: 12,
  },
  levelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width < 400 ? 20 : 60,
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  levelLabelActive: {
    color: '#06B6D4',
    fontSize: 20,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width < 400 ? 20 : 60,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
  },
  sliderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  sliderHandle: {
    position: 'absolute',
    top: 30,
    width: 70,
    height: 32,
  },
  sliderHandleInner: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  sliderHandleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },
  slideUpContainer: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    height: 140,
    width: 70,
    alignItems: 'center',
  },
  slideUpTrack: {
    position: 'absolute',
    width: 6,
    height: 100,
    top: 40,
    borderRadius: 3,
    overflow: 'hidden',
  },
  slideUpTrackGradient: {
    flex: 1,
    width: '100%',
  },
  slideUpTextContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  slideUpArrow: {
    fontSize: 20,
    color: '#10B981',
    marginBottom: 2,
  },
  slideUpText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  slideUpKnobWrapper: {
    position: 'absolute',
    bottom: 0,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideUpKnob: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  slideUpKnobGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideUpKnobIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
