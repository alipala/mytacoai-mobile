import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type SavingStage = 'saving' | 'analyzing' | 'finalizing' | 'success';

interface SessionSummaryModalProps {
  visible: boolean;
  stage: SavingStage;
  sentenceCount: number;
  conversationHighlights: string[];
  duration: string;
  messageCount: number;
  onComplete: () => void;
  onViewAnalysis: () => void;
  onGoDashboard: () => void;
}

const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  visible,
  stage,
  sentenceCount,
  conversationHighlights,
  duration,
  messageCount,
  onComplete,
  onViewAnalysis,
  onGoDashboard,
}) => {
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));

  // Rotate conversation highlights
  useEffect(() => {
    if (conversationHighlights.length > 0 && stage !== 'success') {
      const interval = setInterval(() => {
        setCurrentHighlightIndex((prev) => (prev + 1) % conversationHighlights.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [conversationHighlights.length, stage]);

  // Animate progress bar
  useEffect(() => {
    const progress = getStageProgress();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [stage]);

  const getStageProgress = () => {
    switch (stage) {
      case 'saving':
        return 33;
      case 'analyzing':
        return 66;
      case 'finalizing':
        return 90;
      case 'success':
        return 100;
      default:
        return 0;
    }
  };

  const getStageConfig = () => {
    switch (stage) {
      case 'saving':
        return {
          icon: '💾',
          title: 'Saving Your Conversation...',
          subtitle: 'Preserving your progress',
          color: '#FFA955',
        };
      case 'analyzing':
        return {
          icon: '🔍',
          title: 'Analyzing Your Speech...',
          subtitle: `Processing ${sentenceCount} sentences`,
          color: '#4ECFBF',
        };
      case 'finalizing':
        return {
          icon: '✨',
          title: 'Finalizing Your Session...',
          subtitle: 'Almost done',
          color: '#FFD63A',
        };
      case 'success':
        return {
          icon: '🎉',
          title: 'Session Saved Successfully!',
          subtitle: 'Your progress has been saved and analyzed',
          color: '#4ECFBF',
        };
      default:
        return {
          icon: '💾',
          title: 'Saving...',
          subtitle: 'Please wait',
          color: '#4ECFBF',
        };
    }
  };

  const config = getStageConfig();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={stage === 'success' ? onComplete : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: config.color }]}>
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Checklist */}
            <View style={styles.checklist}>
              <ChecklistItem
                completed={stage === 'analyzing' || stage === 'finalizing' || stage === 'success'}
                active={stage === 'saving'}
                text="Conversation saved"
                color="#4ECFBF"
              />
              <ChecklistItem
                completed={stage === 'finalizing' || stage === 'success'}
                active={stage === 'analyzing'}
                text="Speech analyzed"
                color="#4ECFBF"
              />
              <ChecklistItem
                completed={stage === 'success'}
                active={stage === 'finalizing'}
                text="Feedback generated"
                color="#4ECFBF"
              />
              <ChecklistItem
                completed={stage === 'success'}
                active={false}
                text="Flashcards created"
                color="#9333EA"
              />
            </View>

            {/* Conversation Highlights */}
            {stage !== 'success' && conversationHighlights.length > 0 && (
              <View style={styles.highlightsContainer}>
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightText}>
                    "{conversationHighlights[currentHighlightIndex]}"
                  </Text>
                </View>
              </View>
            )}

            {/* Success Stats */}
            {stage === 'success' && (
              <>
                <View style={styles.statsContainer}>
                  <StatCard icon="📊" label="Duration" value={duration} />
                  <StatCard icon="💬" label="Messages" value={messageCount.toString()} />
                  <StatCard icon="🎯" label="Analyzed" value={sentenceCount.toString()} />
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onViewAnalysis}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="clipboard-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>View Analysis</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onGoDashboard}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>Go Dashboard</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Checklist Item Component
const ChecklistItem: React.FC<{
  completed: boolean;
  active: boolean;
  text: string;
  color: string;
}> = ({ completed, active, text, color }) => {
  return (
    <View style={styles.checklistItem}>
      <View
        style={[
          styles.checklistIcon,
          { backgroundColor: completed || active ? color : '#D1D5DB' },
        ]}
      >
        {completed ? (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        ) : active ? (
          <View style={styles.spinner} />
        ) : (
          <View style={styles.emptyCircle} />
        )}
      </View>
      <Text
        style={[
          styles.checklistText,
          { color: completed || active ? '#1F2937' : '#9CA3AF' },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

// Stat Card Component
const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  content: {
    padding: 24,
  },
  checklist: {
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  spinner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
  emptyCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  checklistText: {
    fontSize: 14,
    fontWeight: '500',
  },
  highlightsContainer: {
    marginBottom: 24,
  },
  highlightCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 207, 191, 0.3)',
  },
  highlightText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4ECFBF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});

export default SessionSummaryModal;
