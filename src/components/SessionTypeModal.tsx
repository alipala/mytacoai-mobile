import React from 'react';
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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
      <BlurView intensity={20} style={styles.blurContainer} tint="dark">
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Ionicons name="layers" size={28} color="#4FD1C5" />
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Choose Session Type</Text>
                    <Text style={styles.headerSubtitle}>
                      Select how you want to practice today
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Session Options */}
              <View style={styles.optionsContainer}>
                {/* Quick Practice Option */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={handleSelectQuickPractice}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, styles.iconQuickPractice]}>
                    <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Quick Practice</Text>
                    <Text style={styles.optionDescription}>
                      Start a conversation session to practice your skills
                    </Text>
                    <View style={styles.optionFeatures}>
                      <View style={styles.featureItem}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.featureText}>Flexible duration</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="chatbox-ellipses-outline" size={14} color="#6B7280" />
                        <Text style={styles.featureText}>Real conversations</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Speaking Assessment Option */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={handleSelectAssessment}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, styles.iconAssessment]}>
                    <Ionicons name="mic" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Speaking Assessment</Text>
                    <Text style={styles.optionDescription}>
                      Get detailed feedback on your speaking proficiency
                    </Text>
                    <View style={styles.optionFeatures}>
                      <View style={styles.featureItem}>
                        <Ionicons name="analytics-outline" size={14} color="#6B7280" />
                        <Text style={styles.featureText}>Detailed analysis</Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="ribbon-outline" size={14} color="#6B7280" />
                        <Text style={styles.featureText}>CEFR level rating</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
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
    backgroundColor: '#F9FAFB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 20,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickPractice: {
    backgroundColor: '#4FD1C5',
  },
  iconAssessment: {
    backgroundColor: '#8B5CF6',
  },
  optionContent: {
    flex: 1,
    gap: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  optionFeatures: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
