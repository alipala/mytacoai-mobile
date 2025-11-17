/**
 * DashboardScreen.tsx
 * Main dashboard showing user's learning journey
 * 
 * Features:
 * - Display learning progress
 * - Show current language and CEFR level
 * - Session statistics
 * - Continue learning button
 * - Start new session button
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressService, LearningService } from '../../api/generated';
import { Ionicons } from '@expo/vector-icons';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [learningPlan, setLearningPlan] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
  try {
    setLoading(true);

    // Get user info from storage
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserName(user.email || user.name || 'User');
    }

    // TODO: Load real data when endpoints are ready
    // For now, use mock data
    setLearningPlan({
      target_language: 'English',
      target_cefr_level: 'B1',
      duration_weeks: 8,
      total_sessions: 16,
    });

    setProgressData({
      total_sessions: 0,
      completion_percentage: 0,
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    // Don't show alert - just use defaults
  } finally {
    setLoading(false);
  }
};

  const handleContinueLearning = () => {
    navigation.navigate('Conversation');
  };

  const handleStartNewSession = () => {
    navigation.navigate('VoiceSelection');
  };

  const handleViewDetails = () => {
    navigation.navigate('LearningPlanDetails', { plan: learningPlan });
  };

    const handleLogout = async () => {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FD1C5" />
      </View>
    );
  }

  // Calculate progress percentage
  const completedSessions = progressData?.total_sessions || 0;
  const totalSessions = learningPlan?.total_sessions || 16;
  const progressPercentage = Math.round((completedSessions / totalSessions) * 100);
  const completionPercentage = progressData?.completion_percentage || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <View style={styles.profilePill}>
            <Ionicons name="person-circle" size={20} color="#FFFFFF" />
            <Text style={styles.profileText}>{userName}</Text>
            <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>Your Learning Journey</Text>
        <Text style={styles.subtitle}>
          Continue your progress and achieve your language goals
        </Text>

        {/* Learning Plan Card */}
        <View style={styles.planCard}>
          {/* Language Header */}
          <View style={styles.languageHeader}>
            <View style={styles.languageInfo}>
              <Text style={styles.flagEmoji}>🇺🇸</Text>
              <View>
                <Text style={styles.languageName}>English</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {learningPlan?.target_cefr_level || 'B1'} Level
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="radio-button-on" size={24} color="#4FD1C5" />
              <Text style={styles.statValue}>{completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#718096" />
              <Text style={styles.statValue}>{completionPercentage}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={24} color="#805AD5" />
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Plan Title */}
          <Text style={styles.planTitle}>
            {learningPlan?.duration_weeks || 2}-Month{' '}
            {learningPlan?.target_language || 'English'} Learning Plan for{' '}
            {learningPlan?.target_cefr_level || 'B1'} Level
          </Text>

          {/* Continue Learning Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueLearning}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Continue Learning</Text>
          </TouchableOpacity>

          {/* View Details Button */}
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleViewDetails}
          >
            <Ionicons name="eye-outline" size={20} color="#4A5568" />
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>

          {/* Progress Footer */}
          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>Progress</Text>
            <Text style={styles.progressFooterValue}>
              {completedSessions}/{totalSessions} sessions
            </Text>
          </View>
        </View>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Start New Session Button */}
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={handleStartNewSession}
        >
          <Text style={styles.newSessionText}>
            Start New <Text style={styles.newSessionHighlight}>Learning Session</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4FD1C5',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    width: 150,
    height: 40,
  },
  profileButton: {
    // Profile button
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 32,
  },
  languageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  levelBadge: {
    backgroundColor: '#E9D8FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#805AD5',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  progressLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  planTitle: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  detailsButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  progressFooterText: {
    fontSize: 14,
    color: '#718096',
  },
  progressFooterValue: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  newSessionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4FD1C5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newSessionText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  newSessionHighlight: {
    color: '#48BB78',
    fontWeight: '700',
  },
});

export default DashboardScreen;