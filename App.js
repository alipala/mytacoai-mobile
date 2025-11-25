import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from './src/screens/Auth/LoginScreen.tsx';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen.tsx';

// Main Screens
import DashboardScreen from './src/screens/Dashboard/DashboardScreen.tsx';
import ProfileScreen from './src/screens/Profile/ProfileScreen.tsx';

// Components
import { UserMenu } from './src/components/UserMenu';

import './src/api/config'; // Initialize API config

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Tabs (after login)
function MainTabs() {
  // TODO: Get user from your auth context
  const userName = 'User'; // Replace with: user?.name || 'User'
  const userEmail = 'user@email.com'; // Replace with: user?.email
  
  const handleLogout = () => {
    // TODO: Add your logout logic here
    console.log('Logout pressed');
  };

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
          headerShown: true,
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <UserMenu 
                userName={userName}
                userEmail={userEmail}
                onLogout={handleLogout}
              />
            </View>
          ),
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

// Root Navigation (Auth + Main)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        
        {/* Main App (with tabs) */}
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}