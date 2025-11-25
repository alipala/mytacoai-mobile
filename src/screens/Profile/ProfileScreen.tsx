/**
 * ProfileScreen.tsx
 * 
 * Complete user profile/dashboard screen for MyTaco AI mobile app
 * Fetches and displays all user data similar to the web app's /profile page
 * 
 * Features:
 * - User profile information
 * - Progress statistics
 * - Conversation history
 * - Achievements
 * - Flashcard sets and due cards
 * - Learning plans
 * - Subscription status
 * 
 * Install required packages:
 * npx expo install react-native-svg
 * npm install @react-native-community/async-storage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../api/config';

const { width } = Dimensions.get('window');
const API_URL = API_BASE_URL;

// ============================================
// TYPES & INTERFACES
// ============================================

interface User {
  _id: string;
  name: string;
  email: string;
  preferred_language?: string;
  preferred_level?: string;
  last_assessment_data?: any;
}

interface ProgressStats {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  sessions_this_week: number;
  sessions_this_month: number;
  average_session_length?: number;
}

interface ConversationSession {
  id: string;
  language: string;
  level: string;
  topic: string;
  duration_minutes: number;
  message_count: number;
  summary: string;
  created_at: string;
  enhanced_analysis?: any;
}

interface Achievement {
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  date?: string;
}

interface Flashcard {
  id: string;
  session_id: string;
  front: string;
  back: string;
  category: string;
  difficulty: string;
  tags: string[];
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  mastery_level: number;
  next_review_date?: string;
}

interface FlashcardSet {
  id: string;
  session_id: string;
  language: string;
  level: string;
  topic?: string;
  title: string;
  description: string;
  flashcards: Flashcard[];
  total_cards: number;
  created_at: string;
  is_completed: boolean;
}

interface LearningPlan {
  id: string;
  language: string;
  proficiency_level: string;
  goals: string[];
  duration_months: number;
  plan_content: {
    overview: string;
    weekly_schedule: any[];
    title?: string;
  };
  created_at: string;
  total_sessions?: number;
  completed_sessions?: number;
  progress_percentage?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

const ProfileScreen: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'flashcards'>('overview');

  // ============================================
  // API FUNCTIONS
  // ============================================

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed: ${response.status}`);
    }

    return response.json();
  };

  const fetchUserData = async () => {
    try {
      const userData = await fetchWithAuth('/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const stats = await fetchWithAuth('/api/progress/stats');
      setProgressStats(stats);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

  const fetchConversationHistory = async () => {
    try {
      const data = await fetchWithAuth('/api/progress/conversations?limit=10');
      setConversationHistory(data.sessions || []);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const data = await fetchWithAuth('/api/progress/achievements');
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchFlashcardData = async () => {
    try {
      const [sets, due] = await Promise.all([
        fetchWithAuth('/api/flashcards/sets'),
        fetchWithAuth('/api/flashcards/due?limit=10'),
      ]);
      setFlashcardSets(sets);
      setDueFlashcards(due);
    } catch (error) {
      console.error('Error fetching flashcard data:', error);
    }
  };

  const fetchLearningPlans = async () => {
    try {
      const plans = await fetchWithAuth('/api/learning/plans');
      setLearningPlans(plans);
    } catch (error) {
      console.error('Error fetching learning plans:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUserData(),
        fetchProgressStats(),
        fetchConversationHistory(),
        fetchAchievements(),
        fetchFlashcardData(),
        fetchLearningPlans(),
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };

    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, []);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderProgressCircle = (value: number, size: number = 120) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#14B8A6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.progressTextContainer]}>
          <Text style={styles.progressValue}>{Math.round(value)}%</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="flame" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{progressStats?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="book-outline" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{user?.preferred_language || 'N/A'}</Text>
          <Text style={styles.statLabel}>Language</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FED7AA' }]}>
          <Ionicons name="trophy-outline" size={24} color="#F97316" />
          <Text style={styles.statValue}>{achievements.filter(a => a.earned).length}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#E9D5FF' }]}>
          <Ionicons name="flash-outline" size={24} color="#A855F7" />
          <Text style={styles.statValue}>{progressStats?.total_sessions || 0}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Ionicons
          name="grid-outline"
          size={20}
          color={activeTab === 'overview' ? '#14B8A6' : '#9CA3AF'}
        />
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          Overview
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
        onPress={() => setActiveTab('progress')}
      >
        <Ionicons
          name="trending-up-outline"
          size={20}
          color={activeTab === 'progress' ? '#14B8A6' : '#9CA3AF'}
        />
        <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
          Progress
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]}
        onPress={() => setActiveTab('flashcards')}
      >
        <Ionicons
          name="albums-outline"
          size={20}
          color={activeTab === 'flashcards' ? '#14B8A6' : '#9CA3AF'}
        />
        <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>
          Flashcards
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Learning Streak */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Learning Streak</Text>
        </View>
        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>{progressStats?.current_streak || 0} days</Text>
          <Text style={styles.streakSubtext}>
            Best: {progressStats?.longest_streak || 0} days
          </Text>
          {progressStats && progressStats.current_streak >= progressStats.longest_streak - 4 && (
            <Text style={styles.streakMotivation}>
              🔥 Keep it up! You're just {progressStats.longest_streak - progressStats.current_streak} days away from breaking your personal record!
            </Text>
          )}
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={20} color="#14B8A6" />
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
        </View>
        {conversationHistory.slice(0, 3).map((session, index) => (
          <TouchableOpacity key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionLanguage}>
                <Text style={styles.sessionFlag}>
                  {session.language === 'english' ? '🇬🇧' : 
                   session.language === 'dutch' ? '🇳🇱' : 
                   session.language === 'german' ? '🇩🇪' : '🌍'}
                </Text>
                <Text style={styles.sessionLang}>
                  {session.language.charAt(0).toUpperCase() + session.language.slice(1)}
                </Text>
              </View>
              <Text style={styles.sessionDuration}>{session.duration_minutes} min</Text>
            </View>
            <Text style={styles.sessionTopic} numberOfLines={1}>
              {session.topic}
            </Text>
            <Text style={styles.sessionDate}>
              {new Date(session.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy-outline" size={20} color="#F97316" />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View
              key={index}
              style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementLocked,
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementName} numberOfLines={1}>
                {achievement.name}
              </Text>
              {!achievement.earned && (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderProgressTab = () => (
    <View style={styles.tabContent}>
      {/* Progress Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart-outline" size={20} color="#14B8A6" />
          <Text style={styles.sectionTitle}>Your Progress</Text>
        </View>
        
        <View style={styles.progressStatsCard}>
          <View style={styles.progressStatRow}>
            <Text style={styles.progressStatLabel}>Total Sessions</Text>
            <Text style={styles.progressStatValue}>{progressStats?.total_sessions || 0}</Text>
          </View>
          <View style={styles.progressStatRow}>
            <Text style={styles.progressStatLabel}>Total Minutes</Text>
            <Text style={styles.progressStatValue}>{progressStats?.total_minutes || 0}</Text>
          </View>
          <View style={styles.progressStatRow}>
            <Text style={styles.progressStatLabel}>This Week</Text>
            <Text style={styles.progressStatValue}>{progressStats?.sessions_this_week || 0}</Text>
          </View>
          <View style={styles.progressStatRow}>
            <Text style={styles.progressStatLabel}>This Month</Text>
            <Text style={styles.progressStatValue}>{progressStats?.sessions_this_month || 0}</Text>
          </View>
        </View>
      </View>

      {/* Learning Plans */}
      {learningPlans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="map-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Learning Plans</Text>
          </View>
          {learningPlans.map((plan) => (
            <TouchableOpacity key={plan.id} style={styles.learningPlanCard}>
              <View style={styles.learningPlanHeader}>
                <Text style={styles.learningPlanLanguage}>
                  {plan.language.charAt(0).toUpperCase() + plan.language.slice(1)}
                </Text>
                <Text style={styles.learningPlanLevel}>{plan.proficiency_level}</Text>
              </View>
              {plan.progress_percentage !== undefined && (
                <View style={styles.learningPlanProgress}>
                  {renderProgressCircle(plan.progress_percentage, 80)}
                  <View style={styles.learningPlanStats}>
                    <Text style={styles.learningPlanStat}>
                      {plan.completed_sessions || 0} / {plan.total_sessions || 0} sessions
                    </Text>
                    <Text style={styles.learningPlanGoals}>
                      {plan.goals.length} goals
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderFlashcardsTab = () => (
    <View style={styles.tabContent}>
      {/* Due Flashcards */}
      {dueFlashcards.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alarm-outline" size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>Due for Review</Text>
          </View>
          <View style={styles.dueFlashcardsCard}>
            <Text style={styles.dueFlashcardsCount}>{dueFlashcards.length}</Text>
            <Text style={styles.dueFlashcardsText}>cards need review</Text>
            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Start Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Flashcard Sets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="albums-outline" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Your Flashcard Sets</Text>
        </View>
        {flashcardSets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No flashcard sets yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete sessions to generate flashcards
            </Text>
          </View>
        ) : (
          flashcardSets.map((set) => (
            <TouchableOpacity key={set.id} style={styles.flashcardSetCard}>
              <View style={styles.flashcardSetHeader}>
                <View style={styles.flashcardSetInfo}>
                  <Text style={styles.flashcardSetTitle} numberOfLines={1}>
                    {set.title}
                  </Text>
                  <Text style={styles.flashcardSetDescription} numberOfLines={2}>
                    {set.description}
                  </Text>
                </View>
                <View style={styles.flashcardSetBadge}>
                  <Text style={styles.flashcardSetCount}>{set.total_cards}</Text>
                  <Text style={styles.flashcardSetLabel}>cards</Text>
                </View>
              </View>
              <View style={styles.flashcardSetFooter}>
                <Text style={styles.flashcardSetLanguage}>
                  {set.language} • {set.level}
                </Text>
                <Text style={styles.flashcardSetDate}>
                  {new Date(set.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {renderStatsCards()}
        {renderTabBar()}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'progress' && renderProgressTab()}
        {activeTab === 'flashcards' && renderFlashcardsTab()}
        
        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#14B8A6',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#F0FDFA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakMotivation: {
    fontSize: 14,
    color: '#14B8A6',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionFlag: {
    fontSize: 20,
  },
  sessionLang: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14B8A6',
  },
  sessionTopic: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 3,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  progressStatsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressStatLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  learningPlanCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learningPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  learningPlanLanguage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  learningPlanLevel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14B8A6',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  learningPlanProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14B8A6',
  },
  learningPlanStats: {
    flex: 1,
  },
  learningPlanStat: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  learningPlanGoals: {
    fontSize: 14,
    color: '#6B7280',
  },
  dueFlashcardsCard: {
    backgroundColor: '#FEF2F2',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  dueFlashcardsCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  dueFlashcardsText: {
    fontSize: 16,
    color: '#991B1B',
    marginBottom: 16,
  },
  reviewButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  flashcardSetCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  flashcardSetHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  flashcardSetInfo: {
    flex: 1,
  },
  flashcardSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  flashcardSetDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  flashcardSetBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardSetCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  flashcardSetLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  flashcardSetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  flashcardSetLanguage: {
    fontSize: 13,
    color: '#14B8A6',
    fontWeight: '500',
  },
  flashcardSetDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ProfileScreen;