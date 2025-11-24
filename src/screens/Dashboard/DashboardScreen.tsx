/**
 * DashboardScreen.tsx - Learning Journey
 * Complete implementation matching web app structure
 * 
 * Features:
 * ✅ Matches web app LearningPlanDashboard exactly
 * ✅ Horizontal scrolling carousel for plans
 * ✅ Progress stats display
 * ✅ Session mode selection
 * ✅ Empty state, loading state, error state
 * ✅ Streak display
 * ✅ Refresh functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressService, LearningService } from '../../api/generated';
import type { LearningPlan } from '../../api/generated';
import { Ionicons } from '@expo/vector-icons';
import { LearningPlanCard } from '../../components/LearningPlanCard';
import { LearningPlanDetailsModal } from '../../components/LearningPlanDetailsModal';

interface DashboardScreenProps {
  navigation: any;
}

interface ProgressStats {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  sessions_this_week: number;
  sessions_this_month: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Loading Skeleton Component
const DashboardSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonTitle} />
    <View style={styles.skeletonSubtitle} />
    <View style={styles.skeletonCard} />
    <View style={styles.skeletonCard} />
  </View>
);

// Empty State Component
const EmptyState: React.FC<{ onCreatePlan: () => void }> = ({ onCreatePlan }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="book-outline" size={80} color="#CBD5E0" />
    <Text style={styles.emptyTitle}>No Learning Plans Yet</Text>
    <Text style={styles.emptyText}>
      Start your learning journey by creating your first personalized plan!
    </Text>
    <TouchableOpacity style={styles.emptyButton} onPress={onCreatePlan}>
      <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
      <Text style={styles.emptyButtonText}>Create Your First Plan</Text>
    </TouchableOpacity>
  </View>
);

// Session Mode Modal (Simplified for Mobile)
const SessionModeModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (mode: 'practice' | 'assessment') => void;
}> = ({ visible, onClose, onSelect }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose Session Type</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => onSelect('practice')}
        >
          <View style={[styles.modalOptionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="chatbubbles" size={28} color="#2563EB" />
          </View>
          <View style={styles.modalOptionContent}>
            <Text style={styles.modalOptionTitle}>Practice Session</Text>
            <Text style={styles.modalOptionDescription}>
              Have a conversation with your AI tutor
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => onSelect('assessment')}
        >
          <View style={[styles.modalOptionIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="clipboard" size={28} color="#DC2626" />
          </View>
          <View style={styles.modalOptionContent}>
            <Text style={styles.modalOptionTitle}>Assessment</Text>
            <Text style={styles.modalOptionDescription}>
              Test your speaking skills and get feedback
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Get user info from storage
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserName(user.name || user.email || 'User');
      }

      // Fetch learning plans and progress stats in parallel
      const [plansResponse, statsResponse] = await Promise.all([
        LearningService.getUserLearningPlansApiLearningPlansGet(),
        ProgressService.getProgressStatsApiProgressStatsGet().catch(() => null),
      ]);

      console.log('✅ Learning plans loaded:', plansResponse.length);
      console.log('✅ Progress stats loaded:', statsResponse);

      setLearningPlans(plansResponse);
      setProgressStats(statsResponse);
    } catch (error: any) {
      console.error('❌ Error loading dashboard:', error);
      setError('Failed to load learning data');

      // Show user-friendly error
      Alert.alert(
        'Error',
        'Could not load your learning journey. Please try again.',
        [{ text: 'Retry', onPress: () => fetchDashboardData() }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Session mode selection
  const handleSessionModeSelect = (mode: 'practice' | 'assessment') => {
    setShowSessionModal(false);

    // Clear previous selections
    AsyncStorage.multiRemove([
      'selectedLanguage',
      'selectedLevel',
      'selectedTopic',
      'assessmentMode',
      'practiceMode',
    ]);

    if (mode === 'practice') {
      // Navigate to practice flow
      navigation.navigate('VoiceSelection', { mode: 'practice' });
    } else {
      // Navigate to assessment flow
      navigation.navigate('Assessment', { mode: 'assessment' });
    }
  };

  // Handle create first plan
  const handleCreateFirstPlan = () => {
    navigation.navigate('CreatePlan');
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['auth_token', 'user']);
          navigation.replace('Login');
        },
      },
    ]);
  };

  // Handle view details (opens modal)
  const handleViewDetails = (plan: LearningPlan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  // Handle continue learning from modal
  const handleModalContinueLearning = () => {
    if (selectedPlan) {
      setShowDetailsModal(false);
      navigation.navigate('Conversation', { planId: selectedPlan.id });
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  // Error state
  if (error && learningPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (learningPlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <EmptyState onCreatePlan={handleCreateFirstPlan} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main dashboard
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <View style={styles.profilePill}>
            <Ionicons name="person-circle" size={20} color="#FFFFFF" />
            <Text style={styles.profileText} numberOfLines={1}>
              {userName}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Your Learning Journey</Text>
          <Text style={styles.subtitle}>
            Continue your progress and achieve your language goals
          </Text>

          {/* Streak Display - Only show if exists */}
          {progressStats && progressStats.current_streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="trophy" size={16} color="#F59E0B" />
              <Text style={styles.streakText}>
                <Text style={styles.streakValue}>
                  {progressStats.current_streak}
                </Text>{' '}
                day streak
              </Text>
            </View>
          )}
        </View>

        {/* Learning Plans - Horizontal Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH - 20} // Card width + gap
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContainer}
          style={styles.carousel}
        >
          {learningPlans.map((plan, index) => (
            <View key={plan.id} style={styles.cardWrapper}>
              <LearningPlanCard
                plan={plan}
                progressStats={progressStats}
                onViewDetails={handleViewDetails}
              />
            </View>
          ))}
        </ScrollView>

        {/* Scroll Indicator Dots */}
        {learningPlans.length > 1 && (
          <View style={styles.dotsContainer}>
            {learningPlans.map((_, index) => (
              <View key={index} style={styles.dot} />
            ))}
          </View>
        )}

        {/* Swipe Hint */}
        {learningPlans.length > 1 && (
          <Text style={styles.swipeHint}>
            👈 Swipe to see all your learning plans 👉
          </Text>
        )}

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <View style={styles.orBadge}>
            <Text style={styles.orText}>OR</Text>
          </View>
          <View style={styles.orLine} />
        </View>

        {/* Start New Session Button */}
        <TouchableOpacity
          style={styles.newSessionButton}
          onPress={() => setShowSessionModal(true)}
        >
          <Text style={styles.newSessionText}>
            Start New{' '}
            <Text style={styles.newSessionHighlight}>Learning Session</Text>
          </Text>
        </TouchableOpacity>

        {/* Motivational Message - Show for streaks */}
        {progressStats && progressStats.current_streak > 0 && (
          <View style={styles.motivationalCard}>
            <Text style={styles.motivationalTitle}>
              🔥 Amazing! You're on a {progressStats.current_streak}-day streak!
            </Text>
            <Text style={styles.motivationalText}>
              Keep practicing to maintain your momentum
            </Text>
          </View>
        )}

        {/* Progress Stats Card */}
        {progressStats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statsGridItem}>
                <Ionicons name="radio-button-on" size={28} color="#4FD1C5" />
                <Text style={styles.statsGridValue}>
                  {progressStats.total_sessions}
                </Text>
                <Text style={styles.statsGridLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statsGridItem}>
                <Ionicons name="time-outline" size={28} color="#4FD1C5" />
                <Text style={styles.statsGridValue}>
                  {Math.round(progressStats.total_minutes)}
                </Text>
                <Text style={styles.statsGridLabel}>Minutes</Text>
              </View>
              <View style={styles.statsGridItem}>
                <Ionicons name="flame" size={28} color="#F59E0B" />
                <Text style={styles.statsGridValue}>
                  {progressStats.current_streak}
                </Text>
                <Text style={styles.statsGridLabel}>Day Streak</Text>
              </View>
              <View style={styles.statsGridItem}>
                <Ionicons name="calendar-outline" size={28} color="#4FD1C5" />
                <Text style={styles.statsGridValue}>
                  {progressStats.sessions_this_week}
                </Text>
                <Text style={styles.statsGridLabel}>This Week</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Session Mode Modal */}
      <SessionModeModal
        visible={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onSelect={handleSessionModeSelect}
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  // Header
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
  profileButton: {},
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    maxWidth: 150,
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  // Scroll Content
  scrollContent: {
    paddingBottom: 40,
  },
  // Title Section
  titleSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // Carousel
  carousel: {
    marginBottom: 16,
  },
  carouselContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cardWrapper: {
    marginRight: 16,
  },
  // Scroll Indicators
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  // OR Divider
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    paddingHorizontal: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  orText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  // New Session Button
  newSessionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4FD1C5',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  newSessionText: {
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '500',
  },
  newSessionHighlight: {
    color: '#4FD1C5',
    fontWeight: '700',
  },
  // Motivational Card
  motivationalCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  motivationalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: '#B45309',
  },
  // Progress Stats Card
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statsGridItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statsGridValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4FD1C5',
    marginVertical: 8,
  },
  statsGridLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#4FD1C5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading Skeleton
  skeletonContainer: {
    padding: 20,
  },
  skeletonTitle: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonSubtitle: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 32,
    width: '70%',
    alignSelf: 'center',
  },
  skeletonCard: {
    height: 400,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 16,
  },
  // Session Mode Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default DashboardScreen;
