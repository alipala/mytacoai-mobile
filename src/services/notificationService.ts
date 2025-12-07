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
 */
function configureNotificationHandler() {
  if (isNotificationHandlerConfigured) {
    return; // Already configured, skip
  }

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
  console.log('✅ Notification handler configured');
}

/**
 * Configure iOS-specific notification settings for beautiful presentation
 */
async function configureIOSNotifications() {
  if (Platform.OS === 'ios') {
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

    const response = await fetch(`${API_BASE_URL}/user/push-token`, {
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
      console.error('❌ Failed to register push token:', error);
      return false;
    }

    // Mark token as registered
    await AsyncStorage.setItem(TOKEN_REGISTERED_KEY, 'true');
    console.log('✅ Push token registered with backend successfully');
    return true;
  } catch (error) {
    console.error('❌ Error registering push token with backend:', error);
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

    // Check if token is already registered
    const isRegistered = await AsyncStorage.getItem(TOKEN_REGISTERED_KEY);

    if (isRegistered === 'true') {
      console.log('✅ Push token already registered with backend');
      return;
    }

    // Register with backend
    await registerPushTokenWithBackend(pushToken, authToken);
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
    console.log('ℹ️ Push notifications unavailable, but app will continue to work normally');
  }
}

/**
 * Set up notification received handler (foreground)
 * Called when a notification is received while app is open
 */
export function setupNotificationReceivedHandler(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Set up notification response handler (user interaction)
 * Called when user taps on a notification
 */
export function setupNotificationResponseHandler(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Get badge count (iOS)
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'ios') {
    return await Notifications.getBadgeCountAsync();
  }
  return 0;
}

/**
 * Set badge count (iOS)
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(count);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await setBadgeCount(0);
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
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

/**
 * Cleanup notification system
 * Call this when user logs out
 */
export async function cleanupNotifications(): Promise<void> {
  try {
    // Clear stored tokens
    await AsyncStorage.removeItem(TOKEN_REGISTERED_KEY);

    // Clear all pending notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Clear badge
    await setBadgeCount(0);

    console.log('✅ Notification system cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Open system settings to enable notifications
 */
export async function openNotificationSettings(): Promise<void> {
  await Notifications.getPermissionsAsync();
  // On iOS, this will prompt to open settings if denied
  await Notifications.requestPermissionsAsync();
}
