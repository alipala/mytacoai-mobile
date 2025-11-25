import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProgressService, LearningService } from '../../api/generated';
import type { LearningPlan } from '../../api/generated';
import { LearningPlanCard } from '../../components/LearningPlanCard';
import { LearningPlanDetailsModal } from '../../components/LearningPlanDetailsModal';
import { styles } from './styles/DashboardScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from storage
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        
        // Use name and surname
        const displayName = [user.first_name, user.last_name]
          .filter(Boolean)
          .join(' ') || user.name || user.email?.split('@')[0] || 'User';
        
        setUserName(displayName);
      }

      // Load learning plans and progress stats in parallel
      const [plansResponse, statsResponse] = await Promise.all([
        LearningService.getUserLearningPlansApiLearningPlansGet(),
        ProgressService.getProgressStatsApiProgressStatsGet(),
      ]);

      setLearningPlans(plansResponse as LearningPlan[]);
      setProgressStats(statsResponse);

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleRetry = () => {
    loadDashboardData();
  };

  const handleContinueLearning = (planId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('Conversation', { planId });
  };

  const handleViewDetails = (plan: LearningPlan) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handleStartNewSession = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // iOS-native ActionSheet
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Choose Session Type',
          message: 'Select how you want to practice',
          options: ['Cancel', 'Practice Session', 'Assessment'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate('VoiceSelection', { mode: 'practice' });
          } else if (buttonIndex === 2) {
            navigation.navigate('Assessment', { mode: 'assessment' });
          }
        }
      );
    } else {
      // Android fallback
      Alert.alert(
        'Choose Session Type',
        'Select how you want to practice',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Practice Session',
            onPress: () => navigation.navigate('VoiceSelection', { mode: 'practice' }),
          },
          {
            text: 'Assessment',
            onPress: () => navigation.navigate('Assessment', { mode: 'assessment' }),
          },
        ]
      );
    }
  };

  const handleModalContinueLearning = () => {
    if (selectedPlan) {
      setShowDetailsModal(false);
      navigation.navigate('Conversation', { planId: selectedPlan.id });
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FD1C5" />
          <Text style={styles.loadingText}>Loading your learning journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State
  if (learningPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* iOS-Native Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          {/* iOS-Standard Text Button */}
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={handleLogout}
            activeOpacity={0.6}
          >
            <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.profileText}>{userName}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Ionicons name="book-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Learning Plans Yet</Text>
          <Text style={styles.emptyMessage}>
            Create your first learning plan to start your language journey!
          </Text>
          <TouchableOpacity
            style={styles.createPlanButton}
            onPress={() => navigation.navigate('CreatePlan')}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.createPlanButtonText}>Create Your First Plan</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* iOS-Native Header - Clean Design */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* iOS-Standard Text Button (not rounded pill) */}
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={handleLogout}
          activeOpacity={0.6}
        >
          <Ionicons name="person-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.profileText}>{userName}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section - Compact */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Your Learning Journey</Text>
          <Text style={styles.subtitle}>
            Continue your progress and achieve your language goals
          </Text>
        </View>

        {/* Learning Plans Carousel - Compact Cards */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentPlanIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {learningPlans.map((plan, index) => (
              <View key={plan.id || index} style={styles.cardContainer}>
                <LearningPlanCard
                  plan={plan}
                  progressStats={progressStats}
                  onContinue={() => handleContinueLearning(plan.id)}
                  onViewDetails={() => handleViewDetails(plan)}
                />
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {learningPlans.length > 1 && (
            <View style={styles.paginationDots}>
              {learningPlans.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentPlanIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Divider - Compact */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Start New Session Button - NOW VISIBLE! */}
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={handleStartNewSession}
          activeOpacity={0.7}
        >
          <View style={styles.newSessionContent}>
            <Ionicons name="add-circle-outline" size={24} color="#4FD1C5" />
            <View style={styles.newSessionTextContainer}>
              <Text style={styles.newSessionTitle}>Start New Session</Text>
              <Text style={styles.newSessionSubtitle}>Practice or Assessment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Learning Plan Details Modal */}
      {selectedPlan && (
        <LearningPlanDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          plan={selectedPlan}
          progressStats={progressStats}
          onContinueLearning={handleModalContinueLearning}
        />
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;