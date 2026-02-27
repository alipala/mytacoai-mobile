/**
 * Sentence Analysis Modal - Swipeable Sentence Review
 * ====================================================
 * Displays individual sentence analysis from a completed session.
 * Users can swipe between sentences to review corrections, scores, and grammar issues.
 *
 * Features:
 * - Swipeable cards (left/right navigation)
 * - Polling for analysis status (processing → ready)
 * - Color-coded score gradient (green ≥80%, yellow ≥60%, red <60%)
 * - Grammar issue highlighting
 * - Loading and error states
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SentenceAnalysis {
  original_sentence: string;
  corrected_sentence: string;
  score: number;
  grammar_issues: Array<{
    issue: string;
    correction: string;
    explanation: string;
  }>;
}

interface SentenceAnalysisModalProps {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
}

export const SentenceAnalysisModal: React.FC<SentenceAnalysisModalProps> = ({
  visible,
  sessionId,
  onClose,
}) => {
  const [status, setStatus] = useState<'loading' | 'processing' | 'ready' | 'error'>('loading');
  const [analyses, setAnalyses] = useState<SentenceAnalysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values for swipe
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Polling state
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollCount = useRef(0);
  const MAX_POLLS = 30; // 30 seconds max polling

  /**
   * Fetch sentence analysis from backend
   */
  const fetchAnalysis = async () => {
    try {
      console.log('[SENTENCE_ANALYSIS_MODAL] Fetching analysis for session:', sessionId);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/progress/conversation/${sessionId}/sentence-analysis`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if required
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.status}`);
      }

      const data = await response.json();

      console.log('[SENTENCE_ANALYSIS_MODAL] Response:', data.status);

      if (data.status === 'ready' && data.analyses) {
        setAnalyses(data.analyses);
        setStatus('ready');
        stopPolling();
      } else if (data.status === 'processing') {
        setStatus('processing');
        // Continue polling
      } else if (data.status === 'not_found') {
        setStatus('error');
        setErrorMessage('Session analysis not found');
        stopPolling();
      }
    } catch (error) {
      console.error('[SENTENCE_ANALYSIS_MODAL] Error fetching analysis:', error);
      setStatus('error');
      setErrorMessage('Failed to load sentence analysis');
      stopPolling();
    }
  };

  /**
   * Start polling for analysis (max 30 seconds)
   */
  const startPolling = () => {
    console.log('[SENTENCE_ANALYSIS_MODAL] Starting polling');
    pollCount.current = 0;

    // Initial fetch
    fetchAnalysis();

    // Poll every 1 second
    pollingInterval.current = setInterval(() => {
      pollCount.current += 1;

      if (pollCount.current >= MAX_POLLS) {
        console.log('[SENTENCE_ANALYSIS_MODAL] Max polls reached, stopping');
        setStatus('error');
        setErrorMessage('Analysis is taking longer than expected. Please try again later.');
        stopPolling();
        return;
      }

      fetchAnalysis();
    }, 1000);
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  /**
   * Initialize when modal opens
   */
  useEffect(() => {
    if (visible && sessionId) {
      setStatus('loading');
      setCurrentIndex(0);
      setAnalyses([]);
      setErrorMessage('');
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [visible, sessionId]);

  /**
   * Handle swipe gesture
   */
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: swipeDistance } = event.nativeEvent;

      // Swipe left (next)
      if (swipeDistance < -SWIPE_THRESHOLD && currentIndex < analyses.length - 1) {
        animateSwipe('next');
      }
      // Swipe right (previous)
      else if (swipeDistance > SWIPE_THRESHOLD && currentIndex > 0) {
        animateSwipe('previous');
      }
      // Return to center
      else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  /**
   * Animate card swipe and change index
   */
  const animateSwipe = (direction: 'next' | 'previous') => {
    const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update index
      setCurrentIndex((prev) =>
        direction === 'next' ? prev + 1 : prev - 1
      );

      // Reset position for next card
      translateX.setValue(direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      opacity.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  /**
   * Get color based on score
   */
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#34C759'; // Green
    if (score >= 60) return '#FF9500'; // Yellow/Orange
    return '#FF3B30'; // Red
  };

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading analysis...</Text>
    </View>
  );

  /**
   * Render processing state
   */
  const renderProcessing = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Analyzing sentences...</Text>
      <Text style={styles.subText}>This may take a few moments</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={startPolling}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render sentence card
   */
  const renderSentenceCard = () => {
    if (analyses.length === 0) return null;

    const analysis = analyses[currentIndex];
    const scoreColor = getScoreColor(analysis.score);

    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
        >
          {/* Score Badge */}
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.scoreText}>{analysis.score}%</Text>
          </View>

          {/* Original Sentence */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your Sentence:</Text>
            <Text style={styles.originalText}>{analysis.original_sentence}</Text>
          </View>

          {/* Corrected Sentence (if different) */}
          {analysis.original_sentence !== analysis.corrected_sentence && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Corrected:</Text>
              <Text style={styles.correctedText}>{analysis.corrected_sentence}</Text>
            </View>
          )}

          {/* Grammar Issues */}
          {analysis.grammar_issues && analysis.grammar_issues.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Grammar Issues:</Text>
              {analysis.grammar_issues.map((issue, index) => (
                <View key={index} style={styles.issueCard}>
                  <View style={styles.issueHeader}>
                    <Ionicons name="warning-outline" size={16} color="#FF9500" />
                    <Text style={styles.issueText}>{issue.issue}</Text>
                  </View>
                  <Text style={styles.correctionText}>
                    Correction: {issue.correction}
                  </Text>
                  <Text style={styles.explanationText}>{issue.explanation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Perfect score message */}
          {analysis.score === 100 && (
            <View style={styles.perfectContainer}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
              <Text style={styles.perfectText}>Perfect! No corrections needed.</Text>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  /**
   * Render pagination dots
   */
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {analyses.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sentence Analysis</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {status === 'loading' && renderLoading()}
          {status === 'processing' && renderProcessing()}
          {status === 'error' && renderError()}
          {status === 'ready' && (
            <>
              {renderSentenceCard()}
              {renderPagination()}
              <Text style={styles.swipeHint}>
                Swipe left/right to navigate
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  originalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  correctedText: {
    fontSize: 16,
    color: '#34C759',
    lineHeight: 24,
    fontWeight: '500',
  },
  issueCard: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 6,
  },
  correctionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  perfectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E8F8EA',
    borderRadius: 12,
    marginTop: 16,
  },
  perfectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
});

export default SentenceAnalysisModal;
