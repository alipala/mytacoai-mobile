/**
 * Typography System
 * Defines consistent font sizes, weights, and line heights throughout the app
 */

export const Typography = {
  // Display (Hero metrics, main focus points)
  display: {
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
  },

  // Title sizes (Card headers, section names)
  title: {
    large: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    medium: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    small: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },

  // Body text (Regular content)
  body: {
    large: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    medium: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },

  // Stats (Numbers, metrics, progress indicators)
  stats: {
    hero: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
    },
    large: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    medium: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },

  // Labels (Supporting text, captions)
  label: {
    large: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    medium: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
    small: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 16,
    },
  },

  // Button text
  button: {
    large: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    medium: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    small: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
  },
};

// Helper function to get typography style
export const getTypographyStyle = (
  category: keyof typeof Typography,
  size?: 'large' | 'medium' | 'small' | 'hero'
) => {
  const categoryStyles = Typography[category];

  if (typeof categoryStyles === 'object' && 'fontSize' in categoryStyles) {
    return categoryStyles;
  }

  if (size && typeof categoryStyles === 'object' && size in categoryStyles) {
    return categoryStyles[size as keyof typeof categoryStyles];
  }

  return Typography.body.medium;
};
