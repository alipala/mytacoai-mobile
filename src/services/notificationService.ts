/**
 * Notification Service
 * Handles push notifications via Expo Push Notifications
 * Supports iOS and Android with proper permission handling
 *
 * IMPORTANT: This service must be initialized explicitly by calling initializeNotifications()
 * No module-level code execution to prevent app hang on startup
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/config';

const PUSH_TOKEN_KEY = '@push_token';
const TOKEN_REGISTERED_KEY = '@token_registered';

let isNotificationHandlerConfigured = false;

/**
 * Configure how notifications are handled when app is in foreground
 * For iOS: Show notifications even when app is open (beautiful native design)
 *
 * IMPORTANT: This is called inside initializeNotifications(), NOT at module level
 *
 * NOTE: This only affects foreground notifications. Background/lock screen notifications
 * are controlled by iOS system settings and push notification payload.
 *
 * CRITICAL: Never throws - safe to call during initialization
 */
function configureNotificationHandler() {
  if (isNotificationHandlerConfigured) {
    return; // Already configured, skip
  }

  try {
    if (Notifications.setNotificationHandler && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,      // Show notification banner (legacy)
          shouldShowBanner: true,     // Show banner notification (iOS 14+)
          shouldShowList: true,       // Show in notification list
          shouldPlaySound: true,       // Play notification sound
          shouldSetBadge: true,        // Update badge count
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });

      isNotificationHandlerConfigured = true;
      console.log('✅ Notification handler configured (affects foreground only)');
    } else {
      console.log('⚠️ setNotificationHandler not available in this build');
    }
  } catch (error) {
    console.log('⚠️ Error configuring notification handler (non-critical):', error);
  }
}

/**
 * Configure iOS-specific notification settings for beautiful presentation
 * CRITICAL: Never throws - safe to call during registration
 */
async function configureIOSNotifications() {
  if (Platform.OS === 'ios') {
    try {
      if (Notifications.setNotificationCategoryAsync && typeof Notifications.setNotificationCategoryAsync === 'function') {
        await Notifications.setNotificationCategoryAsync('default', [
          {
            identifier: 'mark_read',
            buttonTitle: 'Mark as Read',
            options: {
              opensAppToForeground: false,
            },
          },
          {
            identifier: 'open',
            buttonTitle: 'Open',
            options: {
              opensAppToForeground: true,
            },
          },
        ]);
        console.log('✅ iOS notification categories configured');
      } else {
        console.log('⚠️ setNotificationCategoryAsync not available in this build');
      }
    } catch (error) {
      console.log('⚠️ Error configuring iOS notifications (non-critical):', error);
    }
  }
}

/**
 * Request notification permissions
 * Handles both iOS and Android with appropriate permission flows
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Only works on physical devices, not simulators
    if (!Device.isDevice) {
      console.log('📱 Push notifications require a physical device');
      return null;
    }

    // Check if we already have a stored token
    const existingToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (existingToken) {
      console.log('✅ Using existing push token:', existingToken.substring(0, 20) + '...');
      return existingToken;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permissions not granted, request them
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If still not granted, we're done
    if (finalStatus !== 'granted') {
      console.log('⚠️ Failed to get push notification permissions');
      return null;
    }

    // Android specific: Configure notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ECFBF',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      // High priority channel for important notifications
      await Notifications.setNotificationChannelAsync('important', {
        name: 'Important Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF6B6B',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Configure iOS notifications
    await configureIOSNotifications();

    // Get the Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.error('❌ Project ID not found. Please configure EAS project ID.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;
    console.log('🎉 Got Expo Push Token:', token.substring(0, 30) + '...');

    // Store token locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    return token;
  } catch (error: any) {
    // Check if this is the "no valid aps-environment" error (missing Apple entitlements)
    if (error.message?.includes('aps-environment')) {
      console.log('⚠️ Push notifications not configured for this build');
      console.log('ℹ️ To enable push notifications:');
      console.log('   1. Run: eas build --profile development --platform ios');
      console.log('   2. Install the built app on your device');
      console.log('ℹ️ For now, the app will work without push notifications');
    } else {
      console.error('❌ Error registering for push notifications:', error);
    }
    return null;
  }
}

/**
 * Register push token with backend server
 * Sends the Expo push token to our FastAPI backend
 */
export async function registerPushTokenWithBackend(
  token: string,
  authToken: string
): Promise<boolean> {
  try {
    console.log('📤 Registering push token with backend...');
    console.log('📱 Device:', Platform.OS, Device.brand, Device.modelName);
    console.log('🔑 Token preview:', token.substring(0, 30) + '...');

    const response = await fetch(`${API_BASE_URL}/api/auth/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        push_token: token,
        device_type: Platform.OS,
        device_info: {
          brand: Device.brand,
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to register push token (HTTP', response.status, '):', error.substring(0, 200));
      return false;
    }

    const responseData = await response.json();
    console.log('✅ Push token registered successfully:', responseData);

    // Mark token as registered
    await AsyncStorage.setItem(TOKEN_REGISTERED_KEY, 'true');
    console.log('✅ Token registration marked in local storage');
    return true;
  } catch (error: any) {
    console.error('❌ Error registering push token with backend:', error?.message || error);
    return false;
  }
}

/**
 * Initialize notification system
 * Call this when user logs in or app starts with authenticated user
 *
 * IMPORTANT: This is where we configure the notification handler (not at module level)
 */
export async function initializeNotifications(authToken: string): Promise<void> {
  try {
    console.log('🔔 Initializing notification system...');

    // Configure notification handler FIRST (before any other operations)
    configureNotificationHandler();

    // Register for push notifications
    const pushToken = await registerForPushNotificationsAsync();

    if (!pushToken) {
      console.log('⚠️ Could not get push token - push notifications will not work');
      console.log('ℹ️ This is normal in development. For production, build with EAS Build.');
      console.log('ℹ️ You can still use the app and view in-app notifications.');
      return;
    }

    console.log('📱 Push token available, proceeding to register with backend...');

    // ALWAYS register with backend on initialization to ensure token is associated
    // with the CURRENT user (important for multi-user devices)
    console.log('📤 Registering push token with backend for current user...');
    const success = await registerPushTokenWithBackend(pushToken, authToken);

    if (success) {
      console.log('🎉 Push notification setup complete! User will receive notifications.');
    } else {
      console.log('⚠️ Push token registration failed. User may not receive notifications.');
      console.log('ℹ️ This could be due to network issues or backend problems.');
    }
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
    console.log('ℹ️ Push notifications unavailable, but app will continue to work normally');
  }
}

/**
 * Set up notification received handler (foreground)
 * Called when a notification is received while app is open
 * CRITICAL: Never throws - returns null if unavailable
 */
export function setupNotificationReceivedHandler(
  handler: (notification: Notifications.Notification) => void
): any {
  try {
    if (Notifications.addNotificationReceivedListener && typeof Notifications.addNotificationReceivedListener === 'function') {
      return Notifications.addNotificationReceivedListener(handler);
    }
    console.log('⚠️ addNotificationReceivedListener not available in this build');
  } catch (error) {
    console.log('⚠️ Error setting up notification received handler (non-critical):', error);
  }
  return null;
}

/**
 * Set up notification response handler (user interaction)
 * Called when user taps on a notification
 * CRITICAL: Never throws - returns null if unavailable
 */
export function setupNotificationResponseHandler(
  handler: (response: Notifications.NotificationResponse) => void
): any {
  try {
    if (Notifications.addNotificationResponseReceivedListener && typeof Notifications.addNotificationResponseReceivedListener === 'function') {
      return Notifications.addNotificationResponseReceivedListener(handler);
    }
    console.log('⚠️ addNotificationResponseReceivedListener not available in this build');
  } catch (error) {
    console.log('⚠️ Error setting up notification response handler (non-critical):', error);
  }
  return null;
}

/**
 * Get badge count (iOS)
 * CRITICAL: Never throws - safe to call anywhere
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'ios') {
    try {
      // Check if the method exists before calling it (production build safety)
      if (Notifications.getBadgeCountAsync && typeof Notifications.getBadgeCountAsync === 'function') {
        return await Notifications.getBadgeCountAsync();
      }
      console.log('⚠️ getBadgeCountAsync not available in this build');
    } catch (error) {
      console.log('⚠️ Error getting badge count (non-critical):', error);
    }
  }
  return 0;
}

/**
 * Set badge count (iOS)
 * CRITICAL: Never throws - safe to call anywhere, including error handlers
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      // Check if the method exists before calling it (production build safety)
      if (Notifications.setBadgeCountAsync && typeof Notifications.setBadgeCountAsync === 'function') {
        await Notifications.setBadgeCountAsync(count);
        console.log(`✅ Badge count set to: ${count}`);
      } else {
        console.log('⚠️ setBadgeCountAsync not available in this build (app continues normally)');
      }
    } catch (error) {
      console.log('⚠️ Error setting badge count (non-critical):', error);
      // Never throw - this is critical for preventing crashes in error handlers
    }
  }
}

/**
 * Clear all notifications
 * CRITICAL: Never throws - safe to call anywhere
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    if (Notifications.dismissAllNotificationsAsync && typeof Notifications.dismissAllNotificationsAsync === 'function') {
      await Notifications.dismissAllNotificationsAsync();
      console.log('✅ All notifications dismissed');
    } else {
      console.log('⚠️ dismissAllNotificationsAsync not available in this build');
    }
  } catch (error) {
    console.log('⚠️ Error dismissing notifications (non-critical):', error);
  }

  // Always try to clear badge (this function never throws)
  await setBadgeCount(0);
}

/**
 * Schedule a local notification (for testing)
 * CRITICAL: Never throws - returns empty string if unavailable
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  try {
    if (Notifications.scheduleNotificationAsync && typeof Notifications.scheduleNotificationAsync === 'function') {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'default',
        },
        trigger: null, // Send immediately
      });
    }
    console.log('⚠️ scheduleNotificationAsync not available in this build');
  } catch (error) {
    console.log('⚠️ Error scheduling notification (non-critical):', error);
  }
  return '';
}

/**
 * Cleanup notification system
 * Call this when user logs out
 * CRITICAL: Never throws - safe to call in logout flows
 */
export async function cleanupNotifications(): Promise<void> {
  try {
    // Clear stored tokens
    await AsyncStorage.removeItem(TOKEN_REGISTERED_KEY);

    // Clear all pending notifications
    try {
      if (Notifications.cancelAllScheduledNotificationsAsync && typeof Notifications.cancelAllScheduledNotificationsAsync === 'function') {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('✅ Scheduled notifications cancelled');
      } else {
        console.log('⚠️ cancelAllScheduledNotificationsAsync not available in this build');
      }
    } catch (notifError) {
      console.log('⚠️ Error cancelling notifications (non-critical):', notifError);
    }

    // Clear badge (this function never throws)
    await setBadgeCount(0);

    console.log('✅ Notification system cleaned up');
  } catch (error) {
    console.error('⚠️ Error cleaning up notifications (non-critical):', error);
    // Never throw - this is called during logout which should always succeed
  }
}

/**
 * Check if notifications are enabled
 * CRITICAL: Never throws - returns false if unavailable
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    if (Notifications.getPermissionsAsync && typeof Notifications.getPermissionsAsync === 'function') {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    }
    console.log('⚠️ getPermissionsAsync not available in this build');
  } catch (error) {
    console.log('⚠️ Error checking notification permissions (non-critical):', error);
  }
  return false;
}

/**
 * Open system settings to enable notifications
 * CRITICAL: Never throws - safe to call from UI
 */
export async function openNotificationSettings(): Promise<void> {
  try {
    if (Notifications.getPermissionsAsync && typeof Notifications.getPermissionsAsync === 'function') {
      await Notifications.getPermissionsAsync();
    }
    if (Notifications.requestPermissionsAsync && typeof Notifications.requestPermissionsAsync === 'function') {
      // On iOS, this will prompt to open settings if denied
      await Notifications.requestPermissionsAsync();
    }
  } catch (error) {
    console.log('⚠️ Error opening notification settings (non-critical):', error);
  }
}

/**
 * Debug function to check push notification status
 * Returns current push token and registration status
 * CRITICAL: Never throws - returns safe defaults if unavailable
 */
export async function getNotificationDebugInfo(): Promise<{
  hasToken: boolean;
  token: string | null;
  isRegistered: boolean;
  permissionsGranted: boolean;
}> {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  const isRegistered = await AsyncStorage.getItem(TOKEN_REGISTERED_KEY);

  let permissionsGranted = false;
  try {
    if (Notifications.getPermissionsAsync && typeof Notifications.getPermissionsAsync === 'function') {
      const permissions = await Notifications.getPermissionsAsync();
      permissionsGranted = permissions.status === 'granted';
    }
  } catch (error) {
    console.log('⚠️ Error getting permissions in debug info (non-critical):', error);
  }

  return {
    hasToken: !!token,
    token: token,
    isRegistered: isRegistered === 'true',
    permissionsGranted,
  };
}
