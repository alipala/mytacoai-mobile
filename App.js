import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

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
import { hasCompletedOnboarding } from './src/utils/storage';
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

import './src/api/config'; // Initialize API config

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Tabs (after login) - Premium iOS Design
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#06B6D4', // Modern turquoise - matches app theme
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 88,
          paddingBottom: 28,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          const iconSize = 26; // Consistent size for all icons - prevents cutoff

          if (route.name === 'Dashboard') {
            // Conversation bubbles - modern, immersive, represents speaking/dialogue
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Explore') {
            // Trophy icon for Challenges
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'News') {
            // Calendar/Today icon - emphasizes daily fresh content
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      {/* Dashboard Tab - Learning Plans & Speaking Practice */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Learn',
          headerShown: false,
        }}
      />

      {/* News Tab (Daily News Feature) - MOVED TO 2ND POSITION */}
      <Tab.Screen
        name="News"
        component={NewsListScreen}
        options={{
          tabBarLabel: 'Today',
          headerShown: false,
        }}
      />

      {/* Challenges Tab */}
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Challenges',
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
          tabBarLabel: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Loading/Splash Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingTitle}>MyTaco AI</Text>
      <ActivityIndicator size="large" color="#14B8A6" style={styles.loader} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
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

  // Check authentication and onboarding status on app startup
  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        console.log('🔍 Checking app status...');

        // Check if onboarding has been completed
        const onboardingDone = await hasCompletedOnboarding();
        console.log('📱 Onboarding completed:', onboardingDone);
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

  // Show loading screen while checking status
  if (isLoading) {
    return <LoadingScreen />;
  }

  /**
   * Determine initial route based on app state:
   * 1. If authenticated -> Main app
   * 2. If onboarding completed but not authenticated -> Welcome (with guest option)
   * 3. If onboarding not completed -> Onboarding (skip splash)
   */
  const getInitialRouteName = () => {
    if (isAuthenticated) {
      return 'Main';
    }
    if (onboardingCompleted) {
      return 'Welcome';
    }
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
        fallback={<LoadingScreen />}
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

          {/* Main App (with tabs) */}
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </ChallengeSessionProvider>
  );
}

// Styles for Loading Screen
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});