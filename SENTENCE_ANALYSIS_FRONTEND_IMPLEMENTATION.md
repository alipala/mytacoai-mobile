# 🎯 Sentence Analysis Frontend Implementation Guide

## Overview
Complete frontend implementation for TaalCoach sentence analysis notification system.

## Files to Modify

### 1. `/src/components/TaalCoach/TaalCoach.tsx`
**Changes:**
- Add `hasBadge` prop
- Add animated red badge overlay
- Pulse animation for badge

### 2. `/src/components/TaalCoach/CoachModal.tsx`
**Changes:**
- Add "View Analysis" button when badge exists
- Call API to get badge status on mount
- Clear badge when user opens analysis

### 3. `/src/components/TaalCoach/SentenceAnalysisModal.tsx` (NEW FILE)
**Purpose:**
- Swipeable modal for sentence-by-sentence analysis
- Displays corrections, scores, grammar issues
- Pagination indicator
- Close button

### 4. `/src/screens/Dashboard/DashboardScreen.tsx`
**Changes:**
- Add badge state management
- Fetch badge status on mount and after session
- Pass `hasBadge` prop to TaalCoach component

### 5. `/src/api/generated/services.ts` (AUTO-GENERATED)
**Note:** Will be auto-generated after backend OpenAPI update
**New endpoints:**
- GET `/api/progress/conversation/{session_id}/sentence-analysis`
- POST `/api/progress/taalcoach-badge/clear`
- GET `/api/progress/taalcoach-badge/status`

## Implementation Steps

### Step 1: Update TaalCoach Component with Badge

```typescript
// TaalCoach.tsx
import { Text } from 'react-native';

interface TaalCoachProps {
  onPress: () => void;
  visible?: boolean;
  hasBadge?: boolean; // 🆕 NEW: Show red badge
}

export const TaalCoach: React.FC<TaalCoachProps> = ({
  onPress,
  visible = true,
  hasBadge = false,
}) => {
  // ... existing code ...

  // 🆕 Badge animation
  const badgeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasBadge) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeScale, {
            toValue: 1.3,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(badgeScale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [hasBadge]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.buttonWrapper, ...]}>
        <TouchableOpacity ...>
          <LottieView ... />

          {/* 🆕 Badge Overlay */}
          {hasBadge && (
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScale }],
                },
              ]}
            >
              <Text style={styles.badgeText}>1</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// 🆕 New styles
const styles = StyleSheet.create({
  // ... existing styles ...
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
```

### Step 2: Update DashboardScreen with Badge State

```typescript
// DashboardScreen.tsx

// 🆕 Import API service (after OpenAPI regeneration)
import { ProgressService } from '../../api/generated/services/ProgressService';

const DashboardScreen = () => {
  // ... existing state ...

  // 🆕 Badge state
  const [taalCoachBadge, setTaalCoachBadge] = useState<string | null>(null);

  // 🆕 Fetch badge status on mount
  useEffect(() => {
    fetchTaalCoachBadge();
  }, []);

  // 🆕 Function to fetch badge status
  const fetchTaalCoachBadge = async () => {
    try {
      const response = await ProgressService.getTaalcoachBadgeStatus();
      if (response.has_badge && response.session_id) {
        setTaalCoachBadge(response.session_id);
        console.log('[TAALCOACH_BADGE] Has badge for session:', response.session_id);
      } else {
        setTaalCoachBadge(null);
      }
    } catch (error) {
      console.error('[TAALCOACH_BADGE] Error fetching badge:', error);
    }
  };

  // 🆕 Listen for session completed event to refresh badge
  useEffect(() => {
    const handleSessionCompleted = () => {
      console.log('[TAALCOACH_BADGE] Session completed, checking for new badge...');
      // Wait 25 seconds for background task to complete
      setTimeout(() => {
        fetchTaalCoachBadge();
      }, 25000);
    };

    // Subscribe to session completed event
    const subscription = smartCache.subscribe('session_completed', handleSessionCompleted);

    return () => subscription.unsubscribe();
  }, []);

  // 🆕 Update TaalCoach component usage
  return (
    <SafeAreaView>
      {/* ... existing code ... */}

      <TaalCoach
        onPress={() => setShowCoachModal(true)}
        visible={true}
        hasBadge={!!taalCoachBadge} // 🆕 Pass badge state
      />

      <CoachModal
        visible={showCoachModal}
        onClose={() => setShowCoachModal(false)}
        language={userLanguage}
        badgeSessionId={taalCoachBadge} // 🆕 Pass session ID
        onBadgeCleared={() => setTaalCoachBadge(null)} // 🆕 Callback
      />
    </SafeAreaView>
  );
};
```

### Step 3: Update CoachModal with Analysis Button

```typescript
// CoachModal.tsx

interface CoachModalProps {
  visible: boolean;
  onClose: () => void;
  language: string;
  badgeSessionId?: string | null; // 🆕 NEW: Session ID if badge exists
  onBadgeCleared?: () => void; // 🆕 NEW: Callback when badge cleared
}

export const CoachModal: React.FC<CoachModalProps> = ({
  visible,
  onClose,
  language,
  badgeSessionId,
  onBadgeCleared,
}) => {
  // ... existing state ...

  // 🆕 Sentence analysis modal state
  const [showSentenceAnalysis, setShowSentenceAnalysis] = useState(false);

  // 🆕 Handle opening sentence analysis
  const handleOpenSentenceAnalysis = async () => {
    if (!badgeSessionId) return;

    try {
      // Clear badge
      await ProgressService.clearTaalcoachBadge();
      console.log('[TAALCOACH_BADGE] Badge cleared');

      // Notify parent to update badge state
      onBadgeCleared?.();

      // Open sentence analysis modal
      setShowSentenceAnalysis(true);
    } catch (error) {
      console.error('[TAALCOACH_BADGE] Error clearing badge:', error);
    }
  };

  return (
    <Modal visible={visible} ...>
      {/* ... existing header ... */}

      <ScrollView>
        {/* 🆕 Sentence Analysis Button (at top if badge exists) */}
        {badgeSessionId && (
          <TouchableOpacity
            style={styles.analysisButton}
            onPress={handleOpenSentenceAnalysis}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF3B30']}
              style={styles.analysisGradient}
            >
              <View style={styles.analysisContent}>
                <View style={styles.analysisIcon}>
                  <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                </View>
                <View style={styles.analysisText}>
                  <Text style={styles.analysisTitle}>
                    Your Session Analysis is Ready! 🎯
                  </Text>
                  <Text style={styles.analysisSubtitle}>
                    Tap to review sentence-by-sentence corrections
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ... existing chat messages ... */}
      </ScrollView>

      {/* 🆕 Sentence Analysis Modal */}
      {showSentenceAnalysis && (
        <SentenceAnalysisModal
          visible={showSentenceAnalysis}
          onClose={() => setShowSentenceAnalysis(false)}
          sessionId={badgeSessionId!}
        />
      )}
    </Modal>
  );
};

// 🆕 New styles
const styles = StyleSheet.create({
  // ... existing styles ...
  analysisButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analysisGradient: {
    padding: 16,
  },
  analysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisIcon: {
    position: 'relative',
    marginRight: 12,
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF3B30',
  },
  analysisText: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
```

### Step 4: Create SentenceAnalysisModal Component

**New file:** `/src/components/TaalCoach/SentenceAnalysisModal.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

// Import API service
import { ProgressService } from '../../api/generated/services/ProgressService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SentenceAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
}

interface SentenceAnalysis {
  recognized_text: string;
  corrected_text: string;
  grammatical_score: number;
  vocabulary_score: number;
  complexity_score: number;
  appropriateness_score: number;
  overall_score: number;
  grammar_issues: Array<{
    issue: string;
    correction: string;
    explanation: string;
  }>;
  improvement_suggestions: string[];
  level_appropriate_alternatives: string[];
}

export const SentenceAnalysisModal: React.FC<SentenceAnalysisModalProps> = ({
  visible,
  onClose,
  sessionId,
}) => {
  const [analyses, setAnalyses] = useState<SentenceAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pollingCount, setPollingCount] = useState(0);

  const translateX = useSharedValue(0);

  // Fetch analyses
  useEffect(() => {
    if (visible && sessionId) {
      fetchAnalyses();
    }
  }, [visible, sessionId]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await ProgressService.getSentenceAnalysis(sessionId);

      if (response.status === 'ready' && response.analyses.length > 0) {
        setAnalyses(response.analyses);
        setLoading(false);
      } else if (response.status === 'processing') {
        // Poll every 2 seconds (max 15 times = 30 seconds)
        if (pollingCount < 15) {
          setTimeout(() => {
            setPollingCount(prev => prev + 1);
            fetchAnalyses();
          }, 2000);
        } else {
          // Timeout
          setLoading(false);
          console.error('[SENTENCE_ANALYSIS] Timeout waiting for analysis');
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('[SENTENCE_ANALYSIS] Error fetching:', error);
      setLoading(false);
    }
  };

  // Swipe gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.3;

      if (event.translationX < -threshold && currentIndex < analyses.length - 1) {
        // Swipe left - next
        runOnJS(setCurrentIndex)(currentIndex + 1);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      } else if (event.translationX > threshold && currentIndex > 0) {
        // Swipe right - previous
        runOnJS(setCurrentIndex)(currentIndex - 1);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }

      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const currentAnalysis = analyses[currentIndex];

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>
            Analyzing your sentences...
          </Text>
        </View>
      </Modal>
    );
  }

  if (!currentAnalysis) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>
            No sentence analysis available
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sentence Analysis</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Pagination Indicator */}
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Sentence {currentIndex + 1} of {analyses.length}
          </Text>
          <View style={styles.dots}>
            {analyses.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Swipeable Content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.content, animatedStyle]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Original Sentence */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>What you said:</Text>
                <Text style={styles.originalText}>
                  {currentAnalysis.recognized_text}
                </Text>
              </View>

              {/* Corrected Sentence */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Correction:</Text>
                <Text style={styles.correctedText}>
                  {currentAnalysis.corrected_text}
                </Text>
              </View>

              {/* Score */}
              <View style={styles.scoreCard}>
                <LinearGradient
                  colors={getScoreGradient(currentAnalysis.overall_score)}
                  style={styles.scoreGradient}
                >
                  <Text style={styles.scoreValue}>
                    {currentAnalysis.overall_score}%
                  </Text>
                  <Text style={styles.scoreLabel}>Overall Score</Text>
                </LinearGradient>
              </View>

              {/* Grammar Issues */}
              {currentAnalysis.grammar_issues.map((issue, idx) => (
                <View key={idx} style={styles.issueCard}>
                  <Text style={styles.issueTitle}>❌ {issue.issue}</Text>
                  <Text style={styles.issueCorrection}>
                    ✅ {issue.correction}
                  </Text>
                  <Text style={styles.issueExplanation}>
                    💡 {issue.explanation}
                  </Text>
                </View>
              ))}

              {/* Swipe Hint */}
              <Text style={styles.swipeHint}>
                👈 Swipe to navigate 👉
              </Text>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

// Helper function
const getScoreGradient = (score: number): string[] => {
  if (score >= 80) return ['#10B981', '#059669'];
  if (score >= 60) return ['#F59E0B', '#D97706'];
  return ['#EF4444', '#DC2626'];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeIcon: {
    padding: 4,
  },
  pagination: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#10B981',
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  correctedText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    lineHeight: 24,
  },
  scoreCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  issueCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  issueCorrection: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  issueExplanation: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

## Testing Checklist

- [ ] TaalCoach badge appears after session completes
- [ ] Badge pulses with animation
- [ ] Badge disappears when user opens CoachModal
- [ ] Analysis button appears in CoachModal when badge exists
- [ ] Sentence analysis modal opens with swipeable cards
- [ ] Swipe left/right navigates between sentences
- [ ] Pagination indicator updates correctly
- [ ] Score colors match score ranges (green, yellow, red)
- [ ] Grammar issues display correctly
- [ ] Loading state shows while polling
- [ ] Error state shows if no analysis available
- [ ] Push notification received when app in background

## Performance Considerations

- Badge state cached to avoid unnecessary API calls
- Polling limited to 15 attempts (30 seconds max)
- Analysis data fetched once and cached in component state
- Swipe gestures use reanimated for 60fps performance

## Next Steps

1. Regenerate OpenAPI client after backend deployment
2. Test with real session data
3. Adjust badge positioning if needed
4. Add translations for all text strings
5. Consider adding celebration animation when viewing analysis
