import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Alert, InteractionManager } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

// Initialize i18n (multi-language support)
import './src/i18n/config';

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

// Onboarding Screens
import { OnboardingSlider, WelcomeScreen } from './src/screens/Onboarding';

// Auth Screens
import { LoginScreen } from './src/screens/Auth/LoginScreen.tsx';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen.tsx';
import VerifyEmailScreen from './src/screens/Auth/VerifyEmailScreen.tsx';

// Main Screens
import DashboardScreen from './src/screens/Dashboard/DashboardScreen.tsx';
import ExploreScreen from './src/screens/Explore/ExploreScreenRedesigned.tsx'; // NEW REDESIGNED VERSION
import ProfileScreen from './src/screens/Profile/ProfileScreen.tsx';

// Practice Flow Screens
import {
  LanguageSelectionScreen,
  TopicSelectionScreen,
  LevelSelectionScreen,
  ConversationLoadingScreen,
  ConversationScreen,
} from './src/screens/Practice';
import SentenceAnalysisScreen from './src/screens/Practice/SentenceAnalysisScreen';
import GuestSessionResultsScreen from './src/screens/Practice/GuestSessionResultsScreen';

// Assessment Flow Screens
import {
  AssessmentLanguageSelectionScreen,
  AssessmentTopicSelectionScreen,
  SpeakingAssessmentRecordingScreen,
  SpeakingAssessmentResultsScreen,
} from './src/screens/Assessment';

// Subscription Screens
import { CheckoutScreen, CheckoutSuccessScreen } from './src/screens/Subscription';

// Services & Utils
import { authService } from './src/api/services/auth';
import { hasCompletedOnboarding, debugOnboardingStorage } from './src/utils/storage';
import {
  initializeNotifications,
  setupNotificationReceivedHandler,
  setupNotificationResponseHandler,
  cleanupNotifications,
  setBadgeCount,
} from './src/services/notificationService';

// Context Providers
import { ChallengeSessionProvider } from './src/contexts/ChallengeSessionContext';

// Challenge Screens
import ChallengeSessionScreen from './src/screens/Explore/ChallengeSessionScreen';

// News Screens (Daily News Tab Feature)
import { NewsListScreen, NewsDetailScreen } from './src/screens/News';

// Speaking DNA Screens
import SpeakingDNAScreen from './src/screens/SpeakingDNA/SpeakingDNAScreen.tsx';
import SpeakingDNAScreenNew from './src/screens/SpeakingDNA/SpeakingDNAScreenNew.tsx';
import { SpeakingDNAScreenV2 } from './src/screens/SpeakingDNA/SpeakingDNAScreenV2.tsx';
import { SpeakingDNAScreenHorizontal } from './src/screens/SpeakingDNA/SpeakingDNAScreenHorizontal.tsx';
import { DNAVoiceScanScreen } from './src/screens/SpeakingDNA/DNAVoiceScanScreen.tsx';
import { DNAScanResultsScreen } from './src/screens/SpeakingDNA/DNAScanResultsScreen.tsx';

// API config will be loaded dynamically after initial render for better startup performance

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Tabs (after login) - Dark Theme Design
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#14B8A6', // Teal accent - matches app theme
        tabBarInactiveTintColor: '#6B7280', // Muted gray for inactive
        tabBarStyle: {
          backgroundColor: 'rgba(11, 26, 31, 0.95)', // Dark translucent background
          borderTopWidth: 1,
          borderTopColor: 'rgba(20, 184, 166, 0.2)', // Subtle teal border
          height: 88,
          paddingBottom: 28,
          paddingTop: 12,
          shadowColor: '#14B8A6',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          const iconSize = 26;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? tabIconStyles.activeWrap : tabIconStyles.inactiveWrap}>
              <Ionicons name={iconName} size={iconSize} color={color} />
            </View>
          );
        },
      })}
    >
      {/* Dashboard Tab - Learning Plans & Speaking Practice */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: ({ focused, color }) => {
            const i18n = require('./src/i18n/config').default;
            return <Text style={{ fontSize: 13, fontWeight: '600', color }}>{i18n.t('dashboard.tabs.learn')}</Text>;
          },
          headerShown: false,
        }}
      />

      {/* News Tab (Daily News Feature) - MOVED TO 2ND POSITION */}
      <Tab.Screen
        name="News"
        component={NewsListScreen}
        options={{
          tabBarLabel: ({ focused, color }) => {
            const i18n = require('./src/i18n/config').default;
            return <Text style={{ fontSize: 13, fontWeight: '600', color }}>{i18n.t('news.tab_today') || 'Today'}</Text>;
          },
          headerShown: false,
        }}
      />

      {/* Challenges Tab */}
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: ({ focused, color }) => {
            const i18n = require('./src/i18n/config').default;
            return <Text style={{ fontSize: 13, fontWeight: '600', color }}>{i18n.t('explore.tab_challenges') || 'Challenges'}</Text>;
          },
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Get current route state
            const state = navigation.getState();
            const exploreRoute = state.routes.find(r => r.name === 'Explore');

            // If we're already on Explore tab and user taps again, reset to initial screen
            if (exploreRoute && state.index === state.routes.findIndex(r => r.name === 'Explore')) {
              e.preventDefault();
              navigation.navigate('Explore', { reset: true });
            }
          },
        })}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused, color }) => {
            const i18n = require('./src/i18n/config').default;
            return <Text style={{ fontSize: 13, fontWeight: '600', color }}>{i18n.t('dashboard.tabs.profile')}</Text>;
          },
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}


// Root Navigation (Onboarding + Auth + Main)
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigationRef = useRef();

  // Load API config after initial render (performance optimization)
  useEffect(() => {
    const loadAPIConfig = () => {
      InteractionManager.runAfterInteractions(() => {
        // Dynamically import API config after UI is ready
        import('./src/api/config').catch((error) => {
          console.log('⚠️ API config load error (non-critical):', error);
        });
      });
    };

    loadAPIConfig();
  }, []);

  // Check authentication and onboarding status on app startup
  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        console.log('🔍 [App] Checking app status...');

        // Debug: Show all onboarding storage values
        await debugOnboardingStorage();

        // Check if onboarding has been completed
        const onboardingDone = await hasCompletedOnboarding();
        console.log('📱 [App] Onboarding completed:', onboardingDone);
        setOnboardingCompleted(onboardingDone);

        // Check authentication status
        const authenticated = await authService.isAuthenticated();
        console.log('✅ Auth status:', authenticated);
        setIsAuthenticated(authenticated);

        // NOTE: Notification initialization is handled by separate useEffect below
        // This ensures notifications are re-initialized when any user logs in/out
      } catch (error) {
        console.error('❌ Error checking app status:', error);
        setIsAuthenticated(false);
        setOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
        // Hide splash screen once checks are complete
        await SplashScreen.hideAsync();
        console.log('✅ Splash screen hidden');
      }
    };

    checkAppStatus();
  }, []);

  // Initialize notifications and setup handlers when authentication changes (handles multi-user login)
  useEffect(() => {
    // Skip if loading or not authenticated
    if (isLoading || !isAuthenticated) {
      return;
    }

    console.log('🔄 Starting notification setup for current user...');

    // Set up handlers (these can be set up immediately, they'll work when notifications arrive)
    try {
      // Handler for notifications received while app is in foreground
      const receivedListener = setupNotificationReceivedHandler((notification) => {
        console.log('🔔 Notification received (foreground):', notification);

        // Show alert for important notifications
        const notifData = notification.request.content;
        if (notifData.data?.priority === 'high') {
          Alert.alert(
            notifData.title || 'Notification',
            notifData.body || '',
            [{ text: 'OK' }]
          );
        }
      });

      // Only store listener if it was successfully created
      if (receivedListener) {
        notificationListener.current = receivedListener;
        console.log('✅ Notification received handler set up');
      }

      // Handler for notification interactions (user tapped notification)
      const responseListenerRef = setupNotificationResponseHandler((response) => {
        console.log('👆 Notification tapped:', response);

        const notification = response.notification;
        const data = notification.request.content.data;

        // Navigate based on notification data
        if (data?.screen) {
          // Navigate to specific screen if provided
          navigationRef.current?.navigate(data.screen, data.params);
        } else {
          // Default: navigate to Profile notifications tab with notification_id
          const notificationId = data?.notification_id || data?.notificationId;
          console.log('📬 Navigating to alerts with notification ID:', notificationId);

          navigationRef.current?.navigate('Main', {
            screen: 'Profile',
            params: {
              tab: 'notifications',
              notificationId: notificationId // Pass the notification ID to expand it
            }
          });
        }

        // Clear badge count (this function never throws)
        setBadgeCount(0).catch(err =>
          console.log('⚠️ Badge count error (non-critical):', err)
        );
      });

      // Only store listener if it was successfully created
      if (responseListenerRef) {
        responseListener.current = responseListenerRef;
        console.log('✅ Notification response handler set up');
      }

      console.log('✅ Notification handlers setup complete');
    } catch (error) {
      console.log('⚠️ Error setting up notification handlers (non-critical):', error);
    }

    // Initialize notifications (async, registers push token with backend)
    const initNotifications = async () => {
      try {
        console.log('🔔 Initializing notification system...');
        const authToken = await authService.getToken();
        if (authToken) {
          await initializeNotifications(authToken);
        }
        console.log('✅ Notification system initialized');
      } catch (error) {
        console.log('⚠️ Error initializing notifications:', error);
      }
    };

    initNotifications();

    // Cleanup handlers on unmount or logout
    return () => {
      try {
        if (notificationListener.current && Notifications.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(notificationListener.current);
          console.log('✅ Notification listener cleaned up');
        }
        if (responseListener.current && Notifications.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(responseListener.current);
          console.log('✅ Response listener cleaned up');
        }
      } catch (error) {
        console.log('⚠️ Error cleaning up notification listeners (non-critical):', error);
      }
    };
  }, [isAuthenticated, isLoading]);

  // Cleanup notifications on logout
  useEffect(() => {
    // Only cleanup if user was previously authenticated and is now logging out
    // Don't cleanup on initial mount or app close
    if (!isAuthenticated && !isLoading) {
      cleanupNotifications().catch(err =>
        console.log('⚠️ Notification cleanup error (non-critical):', err)
      );
    }
  }, [isAuthenticated, isLoading]);

  // Don't render anything while loading (splash screen is shown)
  if (isLoading) {
    return null;
  }

  /**
   * Determine initial route based on app state:
   * 1. If authenticated -> Main app
   * 2. If onboarding completed but not authenticated -> Welcome (with guest option)
   * 3. If onboarding not completed -> Onboarding (skip splash)
   */
  const getInitialRouteName = () => {
    console.log('🧭 [App] Determining initial route...');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - onboardingCompleted:', onboardingCompleted);

    if (isAuthenticated) {
      console.log('  ✅ Navigating to: Main');
      return 'Main';
    }
    if (onboardingCompleted) {
      console.log('  ✅ Navigating to: Welcome');
      return 'Welcome';
    }
    console.log('  ✅ Navigating to: Onboarding');
    return 'Onboarding';
  };

  // Deep linking configuration
  const linking = {
    prefixes: ['mytacoai://', 'com.bigdavinci.MyTacoAI://'],
    config: {
      screens: {
        CheckoutSuccess: 'checkout-success',
        Main: {
          screens: {
            Dashboard: 'dashboard',
            Explore: 'explore',
            Profile: 'profile',
          },
        },
      },
    },
  };

  return (
    <ChallengeSessionProvider>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        fallback={<View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />}
      >
        <Stack.Navigator
          initialRouteName={getInitialRouteName()}
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Onboarding Flow */}
          <Stack.Screen name="Onboarding" component={OnboardingSlider} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />

          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />

          {/* Subscription Screens */}
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} />

          {/* Practice Flow Screens */}
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
          <Stack.Screen name="TopicSelection" component={TopicSelectionScreen} />
          <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
          <Stack.Screen name="ConversationLoading" component={ConversationLoadingScreen} />
          <Stack.Screen name="Conversation" component={ConversationScreen} />
          <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
          <Stack.Screen name="SentenceAnalysis" component={SentenceAnalysisScreen} />
          <Stack.Screen name="GuestSessionResults" component={GuestSessionResultsScreen} />

          {/* News Flow Screens */}
          <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />

          {/* Assessment Flow Screens */}
          <Stack.Screen name="AssessmentLanguageSelection" component={AssessmentLanguageSelectionScreen} />
          <Stack.Screen name="AssessmentTopicSelection" component={AssessmentTopicSelectionScreen} />
          <Stack.Screen name="SpeakingAssessmentRecording" component={SpeakingAssessmentRecordingScreen} />
          <Stack.Screen name="SpeakingAssessmentResults" component={SpeakingAssessmentResultsScreen} />

          {/* Challenge Session Screen */}
          <Stack.Screen name="ChallengeSession" component={ChallengeSessionScreen} />

          {/* Speaking DNA Screen - HORIZONTAL PAGING REDESIGN */}
          <Stack.Screen
            name="SpeakingDNA"
            component={SpeakingDNAScreenHorizontal}
            options={{ headerShown: false }}
          />

          {/* Old Speaking DNA Screens (backup/testing) */}
          <Stack.Screen name="SpeakingDNAV2" component={SpeakingDNAScreenV2} options={{ headerShown: false }} />
          <Stack.Screen name="SpeakingDNANew" component={SpeakingDNAScreenNew} />
          <Stack.Screen name="SpeakingDNAOld" component={SpeakingDNAScreen} />

          {/* DNA Voice Scan Flow (intermediate acoustic checks between learning plan sessions) */}
          <Stack.Screen name="DNAVoiceScan" component={DNAVoiceScanScreen} options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="DNAScanResults" component={DNAScanResultsScreen} options={{ headerShown: false, gestureEnabled: false }} />

          {/* Main App (with tabs) */}
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </ChallengeSessionProvider>
  );
}

// Styles for Loading Screen
const tabIconStyles = StyleSheet.create({
  inactiveWrap: {
    // Subtle teal glow on inactive icons — consistent with tab bar edge glow
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  activeWrap: {
    // Brighter glow for active icon
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
});

const styles = StyleSheet.create({
  // No custom styles needed - using Expo's native splash screen
});