import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectQuickPractice: () => void;
  onSelectAssessment: () => void;
}

export const SessionTypeModal: React.FC<SessionTypeModalProps> = ({
  visible,
  onClose,
  onSelectQuickPractice,
  onSelectAssessment,
}) => {
  // Main animations
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Card animations
  const card1Scale = useRef(new Animated.Value(0.9)).current;
  const card2Scale = useRef(new Animated.Value(0.9)).current;
  const card1Slide = useRef(new Animated.Value(50)).current;
  const card2Slide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered card animations
      Animated.stagger(100, [
        Animated.parallel([
          Animated.spring(card1Scale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(card1Slide, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(card2Scale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(card2Slide, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Exit animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '0deg'],
  });

  const handleSelectQuickPractice = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
    setTimeout(() => onSelectQuickPractice(), 300);
  };

  const handleSelectAssessment = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
    setTimeout(() => onSelectAssessment(), 300);
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
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <BlurView intensity={80} style={styles.blurContainer} tint="dark">
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Glassmorphism container with gradient border */}
              <View style={styles.glassContainer}>
                {/* Header with gradient background */}
                <LinearGradient
                  colors={['rgba(78, 207, 191, 0.1)', 'rgba(78, 207, 191, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.header}
                >
                  <View style={styles.headerContent}>
                    <View style={styles.iconBadge}>
                      <LinearGradient
                        colors={[COLORS.turquoise, '#3DA89D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconBadgeGradient}
                      >
                        <Ionicons name="layers" size={24} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.headerTitle}>Choose Your Session</Text>
                      <Text style={styles.headerSubtitle}>
                        Select the perfect way to practice
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <View style={styles.closeButtonBg}>
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                </LinearGradient>

                {/* Session Options */}
                <View style={styles.optionsContainer}>
                  {/* Quick Practice Option - Animated Card */}
                  <Animated.View
                    style={[
                      {
                        transform: [
                          { scale: card1Scale },
                          { translateY: card1Slide },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.optionCard}
                      onPress={handleSelectQuickPractice}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={[COLORS.turquoise, '#3DA89D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.optionGradient}
                      >
                        {/* Content */}
                        <View style={styles.optionCardContent}>
                          <View style={styles.optionHeader}>
                            <View style={styles.optionIconContainer}>
                              <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
                            </View>
                            <View style={styles.recommendedBadge}>
                              <Ionicons name="star" size={10} color="#FFD63A" />
                              <Text style={styles.recommendedText}>POPULAR</Text>
                            </View>
                          </View>

                          <Text style={styles.optionTitle}>Quick Practice</Text>
                          <Text style={styles.optionDescription}>
                            Start a real conversation to improve your skills
                          </Text>

                          <View style={styles.optionFeatures}>
                            <View style={styles.featureItem}>
                              <Ionicons name="time" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.featureText}>Flexible</Text>
                            </View>
                            <View style={styles.featureItem}>
                              <Ionicons name="chatbox-ellipses" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.featureText}>Real-time</Text>
                            </View>
                            <View style={styles.featureItem}>
                              <Ionicons name="rocket" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.featureText}>Instant start</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Speaking Assessment Option - Animated Card */}
                  <Animated.View
                    style={[
                      {
                        transform: [
                          { scale: card2Scale },
                          { translateY: card2Slide },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.optionCard}
                      onPress={handleSelectAssessment}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.optionGradient}
                      >
                        {/* Content */}
                        <View style={styles.optionCardContent}>
                          <View style={styles.optionHeader}>
                            <View style={styles.optionIconContainer}>
                              <Ionicons name="mic" size={28} color="#FFFFFF" />
                            </View>
                          </View>

                          <Text style={styles.optionTitle}>Speaking Assessment</Text>
                          <Text style={styles.optionDescription}>
                            Get detailed feedback on your speaking proficiency
                          </Text>

                          <View style={styles.optionFeatures}>
                            <View style={styles.featureItem}>
                              <Ionicons name="analytics" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.featureText}>Analysis</Text>
                            </View>
                            <View style={styles.featureItem}>
                              <Ionicons name="ribbon" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.featureText}>CEFR rated</Text>
                            </View>
                            <View style={styles.featureItem}>
                              <Ionicons name="trophy" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.featureText}>Progress</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 500,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#4ECFBF',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.turquoise,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconBadgeGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    padding: 20,
    gap: 12,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  optionGradient: {
    padding: 20,
    minHeight: 160,
    position: 'relative',
  },
  optionCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 58, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 58, 0.4)',
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 12,
  },
  optionFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
