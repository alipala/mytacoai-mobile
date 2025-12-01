import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

// Onboarding Screens
import { SplashScreen, OnboardingSlider, WelcomeScreen } from './src/screens/Onboarding';

// Auth Screens
import { LoginScreen } from './src/screens/Auth/LoginScreen.tsx';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen.tsx';
import VerifyEmailScreen from './src/screens/Auth/VerifyEmailScreen.tsx';

// Main Screens
import DashboardScreen from './src/screens/Dashboard/DashboardScreen.tsx';
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

import './src/api/config'; // Initialize API config

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Tabs (after login) - Premium iOS Design
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4FD1C5',
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
          let iconSize = 28;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      {/* Dashboard Tab */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          headerShown: false,
        }}
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

  // Show loading screen while checking status
  if (isLoading) {
    return <LoadingScreen />;
  }

  /**
   * Determine initial route based on app state:
   * 1. If authenticated -> Main app
   * 2. If onboarding completed but not authenticated -> Login
   * 3. If onboarding not completed -> Splash (will show onboarding)
   */
  const getInitialRouteName = () => {
    if (isAuthenticated) {
      return 'Main';
    }
    if (onboardingCompleted) {
      return 'Login';
    }
    return 'Splash';
  };

  // Deep linking configuration
  const linking = {
    prefixes: ['mytacoai://', 'com.anonymous.MyTacoAIMobile://'],
    config: {
      screens: {
        CheckoutSuccess: 'checkout-success',
        Main: {
          screens: {
            Dashboard: 'dashboard',
            Profile: 'profile',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking} fallback={<LoadingScreen />}>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
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
        <Stack.Screen name="SentenceAnalysis" component={SentenceAnalysisScreen} />

        {/* Assessment Flow Screens */}
        <Stack.Screen name="AssessmentLanguageSelection" component={AssessmentLanguageSelectionScreen} />
        <Stack.Screen name="AssessmentTopicSelection" component={AssessmentTopicSelectionScreen} />
        <Stack.Screen name="SpeakingAssessmentRecording" component={SpeakingAssessmentRecordingScreen} />
        <Stack.Screen name="SpeakingAssessmentResults" component={SpeakingAssessmentResultsScreen} />

        {/* Main App (with tabs) */}
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
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