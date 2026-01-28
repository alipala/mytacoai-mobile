/**
 * DNA Sticky Header Component
 *
 * A collapsing header that responds to scroll position
 * Includes back button, title, and action buttons (share, settings)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, GRADIENTS, SCROLL_RANGES, SHADOWS } from '../constants';
import { DNAStickyHeaderProps } from '../types';

const EXPANDED_HEIGHT = 100;
const COLLAPSED_HEIGHT = 60;

/**
 * DNA Sticky Header Component
 */
export const DNAStickyHeader: React.FC<DNAStickyHeaderProps> = ({
  scrollY,
  title,
  onBack,
  onShare,
  onSettings,
}) => {
  const insets = useSafeAreaInsets();

  /**
   * Animated header height
   */
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      SCROLL_RANGES.headerCollapse.inputRange,
      SCROLL_RANGES.headerCollapse.heightOutputRange,
      Extrapolate.CLAMP
    );

    return { height };
  });

  /**
   * Animated title scale and opacity
   */
  const animatedTitleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      SCROLL_RANGES.titleScale.inputRange,
      SCROLL_RANGES.titleScale.outputRange,
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  /**
   * Animated background opacity
   */
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      SCROLL_RANGES.backgroundFade.inputRange,
      SCROLL_RANGES.backgroundFade.outputRange,
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  /**
   * Animated shadow
   */
  const animatedShadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 0.1],
      Extrapolate.CLAMP
    );

    const elevation = interpolate(
      scrollY.value,
      [0, 50],
      [0, 3],
      Extrapolate.CLAMP
    );

    return {
      shadowOpacity,
      elevation,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        },
        animatedHeaderStyle,
        animatedShadowStyle,
      ]}
    >
      {/* Background gradient */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { zIndex: 0 }, animatedBackgroundStyle]}
      >
        <LinearGradient
          colors={[COLORS.primary[500], COLORS.primary[400], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Left: Close button (minimalist) */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Center: Title */}
        <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
          <Text style={styles.title}>{title}</Text>
        </Animated.View>

        {/* Right: Action buttons */}
        <View style={styles.actionsContainer}>
          {onShare && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="share-social-outline" size={18} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {onSettings && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSettings}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.white}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${COLORS.white}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default DNAStickyHeader;
