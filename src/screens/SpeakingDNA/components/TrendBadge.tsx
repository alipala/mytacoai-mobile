/**
 * Trend Badge Component
 * =====================
 *
 * A small, beautiful badge showing trend direction and percentage change
 * Used across DNA screens for consistency
 *
 * Features:
 * - Color-coded: Green (up), Red (down), Gray (stable)
 * - Arrow indicators: ↑ ↓ →
 * - Percentage delta: +X% or -X%
 * - Compact and elegant design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface TrendBadgeProps {
  delta: number; // Percentage change (e.g., 16 for +16%, -5 for -5%)
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

// ============================================================================
// TREND BADGE COMPONENT
// ============================================================================

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  delta,
  size = 'small',
  showPercentage = true,
  variant = 'compact',
}) => {
  // Determine trend direction
  const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';

  // Get icon name
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    if (trend === 'up') return 'arrow-up';
    if (trend === 'down') return 'arrow-down';
    return 'remove';
  };

  // Get colors based on trend
  const getColors = () => {
    if (trend === 'up') {
      return {
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#10B981',
        icon: '#10B981',
      };
    } else if (trend === 'down') {
      return {
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.3)',
        text: '#EF4444',
        icon: '#EF4444',
      };
    } else {
      return {
        bg: 'rgba(156, 163, 175, 0.15)',
        border: 'rgba(156, 163, 175, 0.3)',
        text: '#9CA3AF',
        icon: '#9CA3AF',
      };
    }
  };

  // Get size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { iconSize: 10, fontSize: 9, paddingH: 4, paddingV: 2, gap: 2 };
      case 'medium':
        return { iconSize: 12, fontSize: 11, paddingH: 6, paddingV: 3, gap: 3 };
      case 'large':
        return { iconSize: 14, fontSize: 13, paddingH: 8, paddingV: 4, gap: 4 };
      default:
        return { iconSize: 10, fontSize: 9, paddingH: 4, paddingV: 2, gap: 2 };
    }
  };

  const colors = getColors();
  const dimensions = getSizeDimensions();

  // Format percentage
  const formattedDelta = delta > 0 ? `+${delta}%` : `${delta}%`;

  // Render variants
  if (variant === 'minimal') {
    // Just arrow and number, no background
    return (
      <View style={[styles.minimalContainer, { gap: dimensions.gap }]}>
        <Ionicons name={getIconName()} size={dimensions.iconSize} color={colors.icon} />
        {showPercentage && (
          <Text style={[styles.minimalText, { fontSize: dimensions.fontSize, color: colors.text }]}>
            {Math.abs(delta)}%
          </Text>
        )}
      </View>
    );
  }

  if (variant === 'compact') {
    // Small badge with background
    return (
      <View
        style={[
          styles.compactContainer,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            paddingHorizontal: dimensions.paddingH,
            paddingVertical: dimensions.paddingV,
            gap: dimensions.gap,
          },
        ]}
      >
        <Ionicons name={getIconName()} size={dimensions.iconSize} color={colors.icon} />
        {showPercentage && (
          <Text style={[styles.compactText, { fontSize: dimensions.fontSize, color: colors.text }]}>
            {Math.abs(delta)}%
          </Text>
        )}
      </View>
    );
  }

  // Default variant - full badge with background and border
  return (
    <View
      style={[
        styles.defaultContainer,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingHorizontal: dimensions.paddingH + 2,
          paddingVertical: dimensions.paddingV + 1,
          gap: dimensions.gap,
        },
      ]}
    >
      <Ionicons name={getIconName()} size={dimensions.iconSize} color={colors.icon} />
      {showPercentage && (
        <Text style={[styles.defaultText, { fontSize: dimensions.fontSize, color: colors.text }]}>
          {formattedDelta}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimalText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 0.5,
  },
  compactText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  defaultText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});

export default TrendBadge;
