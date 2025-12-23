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
const NODE_SPACING = 60;
const CONNECTOR_WIDTH = NODE_SPACING - NODE_SIZE;

type NodeState = 'completed' | 'current' | 'upcoming';

interface ProgressNodeProps {
  index: number;
  state: NodeState;
  challengeType: string;
  total: number;
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
function ProgressNode({ index, state, challengeType, total }: ProgressNodeProps) {
  const scale = useSharedValue(state === 'current' ? 1.2 : 1);
  const opacity = useSharedValue(state === 'upcoming' ? 0.4 : 1);

  useEffect(() => {
    if (state === 'completed') {
      // Burst animation when completing
      animateNodeComplete(scale, opacity);
    } else if (state === 'current') {
      // Breathing pulse for current node
      scale.value = createNodePulseAnimation();
    } else {
      // Upcoming - dim and normal size
      scale.value = 1;
      opacity.value = 0.4;
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getNodeColor = () => {
    switch (state) {
      case 'completed':
        return '#10B981'; // Green
      case 'current':
        return getChallengeAccentColor(challengeType);
      case 'upcoming':
        return '#9CA3AF'; // Gray
    }
  };

  const nodeColor = getNodeColor();

  return (
    <Animated.View style={[styles.nodeContainer, animatedStyle]}>
      <View style={[styles.node, { backgroundColor: nodeColor }]}>
        {state === 'completed' && (
          <Ionicons name="checkmark" size={18} color="white" />
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

      {/* Node label */}
      <Text style={[styles.nodeLabel, { color: state === 'upcoming' ? '#9CA3AF' : '#6B7280' }]}>
        {index + 1}
      </Text>
    </Animated.View>
  );
}

// Connection line between nodes
interface ConnectionLineProps {
  state: 'lit' | 'dim';
}

function ConnectionLine({ state }: ConnectionLineProps) {
  const opacity = useSharedValue(state === 'lit' ? 1 : 0.3);

  useEffect(() => {
    if (state === 'lit') {
      opacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.connector,
        {
          backgroundColor: state === 'lit' ? '#10B981' : '#E5E7EB',
        },
        animatedStyle,
      ]}
    />
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
  const { challenges, currentIndex } = session;

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
            const state: NodeState =
              index < currentIndex
                ? 'completed'
                : index === currentIndex
                ? 'current'
                : 'upcoming';

            return (
              <React.Fragment key={`node-${challenge.id}-${index}`}>
                <ProgressNode
                  index={index}
                  state={state}
                  challengeType={challenge.type}
                  total={challenges.length}
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
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
    marginTop: 6,
  },
  connector: {
    width: CONNECTOR_WIDTH,
    height: 3,
    marginHorizontal: 0,
    borderRadius: 1.5,
  },
});
