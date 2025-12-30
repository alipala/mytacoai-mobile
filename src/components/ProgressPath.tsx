/**
 * ProgressPath Component
 *
 * Node-based progress visualization that replaces traditional progress bar
 * Shows user's journey through challenges as connected nodes
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useChallengeSession } from '../contexts/ChallengeSessionContext';
import { COLORS } from '../constants/colors';
import {
  animateNodeComplete,
  createNodePulseAnimation,
} from '../animations/UniversalFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NODE_SIZE = 32;
const NODE_SPACING = 80; // Increased spacing for more breathing room
const GAP_PADDING = 8; // Gap between circle and line
const CONNECTOR_WIDTH = NODE_SPACING - NODE_SIZE - (GAP_PADDING * 2);

type NodeState = 'completed_correct' | 'completed_incorrect' | 'current' | 'upcoming';

interface ProgressNodeProps {
  index: number;
  state: NodeState;
  challengeType: string;
  total: number;
  challengeId: string;
}

// Get color for challenge type
const getChallengeAccentColor = (type: string): string => {
  switch (type) {
    case 'error_spotting':
      return COLORS.coral;
    case 'swipe_fix':
      return COLORS.turquoise;
    case 'micro_quiz':
      return COLORS.orange;
    case 'smart_flashcard':
      return '#9333EA';
    case 'native_check':
      return '#EAB308';
    case 'brain_tickler':
      return '#EC4899';
    default:
      return COLORS.textGray;
  }
};

// Individual Progress Node
function ProgressNode({ index, state, challengeType, total, challengeId }: ProgressNodeProps) {
  const scale = useSharedValue(state === 'current' ? 1.2 : 1);
  const opacity = useSharedValue(state === 'upcoming' ? 0.4 : 1);
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (state === 'completed_correct' || state === 'completed_incorrect') {
      // Gamified burst animation with rotation on completion
      animateNodeComplete(scale, opacity);
      rotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(360, { damping: 10, stiffness: 80 })
      );
      glowScale.value = 1;
    } else if (state === 'current') {
      // Breathing pulse for current node
      scale.value = createNodePulseAnimation();
      rotation.value = 0;
      // Pulsing glow ring
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      // Upcoming - dim and normal size
      scale.value = 1;
      opacity.value = 0.4;
      rotation.value = 0;
      glowScale.value = 1;
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const getNodeColor = () => {
    switch (state) {
      case 'completed_correct':
        return '#10B981'; // Green for correct
      case 'completed_incorrect':
        return '#F59E0B'; // Orange for incorrect
      case 'current':
        return getChallengeAccentColor(challengeType);
      case 'upcoming':
        return '#9CA3AF'; // Gray
    }
  };

  const nodeColor = getNodeColor();

  return (
    <View style={styles.nodeWrapper}>
      {/* Outer glow ring for current node */}
      {state === 'current' && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              backgroundColor: nodeColor,
              opacity: 0.2,
            },
            glowAnimatedStyle,
          ]}
        />
      )}

      <Animated.View style={[styles.nodeContainer, animatedStyle]}>
        <View style={[styles.node, { backgroundColor: nodeColor }]}>
          {state === 'completed_correct' && (
            <Ionicons
              name="checkmark"
              size={20}
              color="white"
            />
          )}
          {state === 'completed_incorrect' && (
            <Ionicons
              name="close"
              size={20}
              color="white"
            />
          )}
          {state === 'current' && (
            <View style={styles.currentNodeInner}>
              <View style={[styles.currentNodeDot, { backgroundColor: '#FFFFFF' }]} />
            </View>
          )}
          {state === 'upcoming' && (
            <View style={[styles.upcomingNodeDot, { backgroundColor: '#E5E7EB' }]} />
          )}
        </View>
      </Animated.View>

      {/* Node label below */}
      <Text style={[styles.nodeLabel, { color: state === 'upcoming' ? '#9CA3AF' : '#6B7280' }]}>
        {index + 1}
      </Text>
    </View>
  );
}

// Connection line between nodes
interface ConnectionLineProps {
  state: 'lit' | 'dim';
}

function ConnectionLine({ state }: ConnectionLineProps) {
  const opacity = useSharedValue(state === 'lit' ? 1 : 0.3);
  const scaleX = useSharedValue(state === 'lit' ? 1 : 1);

  useEffect(() => {
    if (state === 'lit') {
      // Gamified fill animation - line grows and glows
      scaleX.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      );
      opacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleX: scaleX.value }],
  }));

  return (
    <View style={styles.connectorWrapper}>
      <Animated.View
        style={[
          styles.connector,
          {
            backgroundColor: state === 'lit' ? '#10B981' : '#E5E7EB',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Main ProgressPath Component
interface ProgressPathProps {
  style?: any;
}

export function ProgressPath({ style }: ProgressPathProps) {
  const { session, getProgress } = useChallengeSession();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);

  if (!session) {
    return null;
  }

  const progress = getProgress();
  const { challenges, currentIndex, incorrectChallengeIds } = session;

  // Auto-scroll to keep current node visible
  useEffect(() => {
    if (scrollViewRef.current && currentIndex >= 0) {
      const targetX = Math.max(0, currentIndex * NODE_SPACING - SCREEN_WIDTH / 2 + NODE_SIZE / 2);

      scrollViewRef.current.scrollTo({
        x: targetX,
        animated: true,
      });
    }
  }, [currentIndex]);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        <View style={styles.pathContainer}>
          {challenges.map((challenge, index) => {
            // Determine node state based on completion and correctness
            let state: NodeState;
            if (index < currentIndex) {
              // Completed - check if it was correct or incorrect
              const wasIncorrect = incorrectChallengeIds.includes(challenge.id);
              state = wasIncorrect ? 'completed_incorrect' : 'completed_correct';

              // Debug logging
              console.log(`Node ${index + 1} (${challenge.id}): ${state}, wasIncorrect: ${wasIncorrect}, incorrectIds:`, incorrectChallengeIds);
            } else if (index === currentIndex) {
              state = 'current';
            } else {
              state = 'upcoming';
            }

            return (
              <React.Fragment key={`node-${challenge.id}-${index}`}>
                <ProgressNode
                  index={index}
                  state={state}
                  challengeType={challenge.type}
                  total={challenges.length}
                  challengeId={challenge.id}
                />

                {/* Connector line between nodes */}
                {index < challenges.length - 1 && (
                  <ConnectionLine state={index < currentIndex ? 'lit' : 'dim'} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  nodeWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: NODE_SIZE + 8,
    height: NODE_SIZE + 8,
    borderRadius: (NODE_SIZE + 8) / 2,
    zIndex: 0,
  },
  nodeContainer: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    zIndex: 1,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  currentNodeInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentNodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upcomingNodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  connectorWrapper: {
    width: NODE_SPACING - NODE_SIZE,
    height: NODE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GAP_PADDING,
  },
  connector: {
    width: CONNECTOR_WIDTH,
    height: 4, // Slightly thicker for better visibility
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
