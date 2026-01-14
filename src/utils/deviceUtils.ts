/**
 * deviceUtils.ts
 *
 * Device detection utilities for responsive design
 * Detects iPad vs iPhone to apply appropriate styling
 */

import { Dimensions, Platform } from 'react-native';

/**
 * Get current screen dimensions (dynamic - not cached)
 */
export const getScreenDimensions = () => {
  return Dimensions.get('window');
};

/**
 * Check if device is iPad (dynamic check)
 */
export const getIsIPad = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

/**
 * Check if device is iPhone (dynamic check)
 */
export const getIsIPhone = () => {
  const { width } = Dimensions.get('window');
  return width < 768;
};

// For backwards compatibility - use functions instead
export const isIPad = getIsIPad();
export const isIPhone = getIsIPhone();
export const DEVICE_WIDTH = Dimensions.get('window').width;
export const DEVICE_HEIGHT = Dimensions.get('window').height;

// Debug log
console.log('🔍 [DeviceUtils] Screen Width:', DEVICE_WIDTH, 'Height:', DEVICE_HEIGHT);
console.log('🔍 [DeviceUtils] isIPad:', isIPad);

/**
 * Responsive scaling functions
 */
export const scale = (size: number, iPadMultiplier: number = 1.3): number => {
  return isIPad ? size * iPadMultiplier : size;
};

/**
 * Font scaling for iPad
 */
export const scaleFont = (size: number, iPadSize?: number): number => {
  return isIPad && iPadSize !== undefined ? iPadSize : size;
};
