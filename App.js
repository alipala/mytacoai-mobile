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

// Subscription Screens
import { CheckoutScreen, CheckoutSuccessScreen } from './src/screens/Subscription';

// Services & Utils
import { authService } from './src/api/services/auth';
import { hasCompletedOnboarding } from './src/utils/storage';

import './src/api/config'; // Initialize API config

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Tabs (after login)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      {/* Dashboard Tab */}
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
          headerShown: false, // ✅ Hide navigation header - Dashboard has its own
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false, // ProfileScreen has its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
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