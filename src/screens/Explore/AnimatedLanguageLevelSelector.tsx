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
import { Ionicons } from '@expo/vector-icons';
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

  // Refs to store current selection (fixes stale closure in PanResponders)
  const selectedLanguageIndexRef = useRef(selectedLanguageIndex);
  const selectedLevelIndexRef = useRef(selectedLevelIndex);

  // Animation values
  const languageCardOpacity = useRef(new Animated.Value(1)).current;
  const languageCardX = useRef(new Animated.Value(0)).current;

  const slideUpY = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;


  // Language swipe handler
  const languagePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Move the card with the gesture
        languageCardX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 60;
        const currentIndex = selectedLanguageIndexRef.current;

        if (gestureState.dx > swipeThreshold && currentIndex > 0) {
          // Swipe right - go to previous language
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Animate out to the right
          Animated.timing(languageCardX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSelectedLanguageIndex(currentIndex - 1);
            languageCardX.setValue(-width);
            // Animate in from left
            Animated.spring(languageCardX, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }).start();
          });
        } else if (gestureState.dx < -swipeThreshold && currentIndex < LANGUAGES.length - 1) {
          // Swipe left - go to next language
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Animate out to the left
          Animated.timing(languageCardX, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSelectedLanguageIndex(currentIndex + 1);
            languageCardX.setValue(width);
            // Animate in from right
            Animated.spring(languageCardX, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }).start();
          });
        } else {
          // Bounce back to center
          Animated.spring(languageCardX, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
      {/* Dark Background Gradient - matches rest of app */}
      <LinearGradient
        colors={['#0B1A1F', '#0D2832', '#0B1A1F']}
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
              <Ionicons name="arrow-back" size={28} color="#14B8A6" />
            </TouchableOpacity>
          )}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Choose Your Path</Text>
            <Text style={styles.headerSubtitle}>Select language and level</Text>
          </View>
        </View>

        {/* Language Selector */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingLeft: 4 }}>
            <Ionicons name="language" size={20} color="#14B8A6" />
            <Text style={styles.sectionLabel}>Language</Text>
          </View>

          <View style={styles.languageCarousel}>
            <Animated.View
              {...languagePanResponder.panHandlers}
              style={[
                styles.languageCard,
                {
                  opacity: languageCardOpacity,
                  transform: [{ translateX: languageCardX }]
                }
              ]}
            >
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
                <Ionicons name="chevron-back" size={24} color="#14B8A6" />
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
                <Ionicons name="chevron-forward" size={24} color="#14B8A6" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        </View>

        {/* Level Selector */}
        <View style={styles.levelSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingLeft: 4 }}>
            <Ionicons name="bar-chart" size={20} color="#8B5CF6" />
            <Text style={styles.sectionLabel}>Level</Text>
          </View>

          {/* Horizontal Level Buttons */}
          <View style={styles.levelButtonsContainer}>
            {LEVELS.map((level, index) => (
              <TouchableOpacity
                key={level.value}
                onPress={() => {
                  setSelectedLevelIndex(index);
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
                activeOpacity={0.7}
                style={styles.levelButtonWrapper}
              >
                <LinearGradient
                  colors={index === selectedLevelIndex
                    ? currentLanguage.gradient
                    : ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                  style={[
                    styles.levelButton,
                    index === selectedLevelIndex && styles.levelButtonActive
                  ]}
                >
                  <Text style={[
                    styles.levelButtonLabel,
                    index === selectedLevelIndex && styles.levelButtonLabelActive
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={[
                    styles.levelButtonDesc,
                    index === selectedLevelIndex && styles.levelButtonDescActive
                  ]}>
                    {level.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          style={styles.continueButtonWrapper}
        >
          <LinearGradient
            colors={['#14B8A6', '#0D9488']}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F',
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
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B4E4DD',
    fontWeight: '500',
  },
  section: {
    marginBottom: 50,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
  swipeHintOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
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
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(180, 228, 221, 0.3)',
  },
  dotActive: {
    backgroundColor: '#14B8A6',
    width: 24,
  },
  levelSection: {
    marginBottom: 20,
  },
  levelButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  levelButtonWrapper: {
    width: (width - 60) / 3 - 6,
  },
  levelButton: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    minHeight: 65,
  },
  levelButtonActive: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  levelButtonLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  levelButtonLabelActive: {
    color: '#FFFFFF',
    fontSize: 26,
  },
  levelButtonDesc: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  levelButtonDescActive: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 11,
    fontWeight: '700',
  },
  continueButtonWrapper: {
    marginTop: 20,
    marginBottom: 30,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
