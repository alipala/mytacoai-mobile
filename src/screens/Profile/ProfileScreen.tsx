/**
 * ProfileScreen.tsx
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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../api/config';
import FlashcardViewerMobile from '../../components/FlashcardViewerMobile';

const { width } = Dimensions.get('window');
const API_URL = API_BASE_URL;

// Types remain the same...
interface User {
  _id: string;
  name: string;
  email: string;
  preferred_language?: string;
  preferred_level?: string;
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
  enhanced_analysis?: {
    summary?: string;
    key_topics?: string[];
    feedback?: string;
  };
}

interface SkillScore {
  score: number;
  feedback: string;
}

interface AssessmentData {
  overall_score: number;
  confidence: number;
  pronunciation: SkillScore;
  grammar: SkillScore;
  vocabulary: SkillScore;
  fluency: SkillScore;
  coherence: SkillScore;
  strengths?: string[];
  areas_for_improvement?: string[];
  recommended_level?: string;
}

interface WeekSchedule {
  week: number;
  focus: string;
  activities: string[];
  sessions_completed?: number;
  total_sessions?: number;
}

interface LearningPlan {
  id: string;
  language: string;
  proficiency_level: string;
  goals: string[];
  duration_months: number;
  plan_content: {
    overview: string;
    weekly_schedule: WeekSchedule[];
    title?: string;
  };
  assessment_data?: AssessmentData;
  created_at: string;
  total_sessions?: number;
  completed_sessions?: number;
  progress_percentage?: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: string;
  mastery_level: number;
  next_review_date?: string;
}

interface FlashcardSet {
  id: string;
  language: string;
  level: string;
  title: string;
  description: string;
  flashcards: Flashcard[];
  total_cards: number;
  created_at: string;
  is_completed?: boolean;
}

interface Notification {
  id: string;
  notification_id: string;
  notification: {
    title: string;
    content: string;
    notification_type: 'Maintenance' | 'Special Offer' | 'Information';
    created_at: string;
  };
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [conversationHistory, setConversationHistory] = useState<ConversationSession[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'flashcards' | 'notifications'>('overview');
  
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [expandedConversations, setExpandedConversations] = useState<Record<string, boolean>>({});
  const [showFlashcardViewer, setShowFlashcardViewer] = useState(false);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<FlashcardSet | null>(null);

  // API Functions
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
    if (!token) throw new Error('Not authenticated');

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
      const userData = await fetchWithAuth('/api/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchConversationHistory = async () => {
    try {
      const data = await fetchWithAuth('/api/progress/conversations?limit=20');
      setConversationHistory(data.sessions || []);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  const fetchLearningPlans = async () => {
    try {
      const plans = await fetchWithAuth('/api/learning/plans');
      setLearningPlans(plans || []);
    } catch (error) {
      console.error('Error fetching learning plans:', error);
    }
  };

  const fetchFlashcardData = async () => {
    try {
      const [sets, due] = await Promise.all([
        fetchWithAuth('/api/flashcards/sets'),
        fetchWithAuth('/api/flashcards/due?limit=10'),
      ]);
      setFlashcardSets(sets || []);
      setDueFlashcards(due || []);
    } catch (error) {
      console.error('Error fetching flashcard data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await fetchWithAuth('/api/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUserData(),
        fetchConversationHistory(),
        fetchLearningPlans(),
        fetchFlashcardData(),
        fetchNotifications(),
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 70) return '#14B8A6';
    if (score >= 60) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Maintenance': return 'construct-outline';
      case 'Special Offer': return 'gift-outline';
      case 'Information': return 'information-circle-outline';
      default: return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'Maintenance': return '#F59E0B';
      case 'Special Offer': return '#10B981';
      case 'Information': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetchWithAuth('/api/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ notification_id: notificationId }),
      });
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleConversationExpanded = (conversationId: string) => {
    setExpandedConversations(prev => ({
      ...prev,
      [conversationId]: !prev[conversationId],
    }));
  };

  const handleReviewFlashcard = async (flashcardId: string, correct: boolean) => {
    try {
      await fetchWithAuth('/api/flashcards/review', {
        method: 'POST',
        body: JSON.stringify({ flashcard_id: flashcardId, correct }),
      });
      await fetchFlashcardData();
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      Alert.alert('Error', 'Failed to record flashcard review');
    }
  };

  const openFlashcardViewer = (flashcardSet: FlashcardSet) => {
    setSelectedFlashcardSet(flashcardSet);
    setShowFlashcardViewer(true);
  };

  const closeFlashcardViewer = async () => {
    setShowFlashcardViewer(false);
    setSelectedFlashcardSet(null);
    await fetchFlashcardData();
  };

  // Render circular progress
  const renderCircularProgress = (percentage: number, size: number = 80) => {
    const radius = (size - 12) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[styles.circularProgress, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="6" fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor(percentage)}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.circularProgressText}>
          <Text style={[styles.circularProgressPercentage, { color: getScoreColor(percentage) }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    );
  };

  // Overview Tab
  const renderOverviewTab = () => (
    <View>
      <View style={styles.welcomeSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeTitle}>Welcome back, {user?.name || 'User'}!</Text>
          <Text style={styles.welcomeSubtitle}>
            {user?.preferred_language
              ? `Learning ${user.preferred_language} • ${user.preferred_level || 'Beginner'}`
              : 'Continue your learning journey'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="chatbubbles" size={24} color="#14B8A6" />
          <Text style={styles.statValue}>{conversationHistory.length}</Text>
          <Text style={styles.statLabel}>Conversations</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{learningPlans.length}</Text>
          <Text style={styles.statLabel}>Plans</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="school" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{flashcardSets.length}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {conversationHistory.length > 0 ? (
          <View style={styles.activityList}>
            {conversationHistory.slice(0, 3).map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.activityCard}
                onPress={() => toggleConversationExpanded(session.id)}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="chatbubbles" size={20} color="#14B8A6" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{session.topic}</Text>
                    <Text style={styles.activitySubtitle}>
                      {session.language} • {session.level}
                    </Text>
                  </View>
                  <Text style={styles.activityDate}>{formatDate(session.created_at)}</Text>
                </View>
                {expandedConversations[session.id] && (
                  <View style={styles.activityDetails}>
                    <Text style={styles.activitySummary}>{session.summary}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No conversations yet</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Progress Tab - IMPROVED DESIGN
  const renderProgressTab = () => {
    if (learningPlans.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No Learning Plans Yet</Text>
        </View>
      );
    }

    return (
      <View>
        {learningPlans.map((plan) => {
          const progressPercentage = plan.progress_percentage || 0;
          const currentWeek = Math.ceil((plan.completed_sessions || 0) / 3);
          const isExpanded = expandedPlans[plan.id];

          return (
            <View key={plan.id} style={styles.progressPlanCard}>
              {/* Header with Progress */}
              <TouchableOpacity 
                style={styles.progressPlanHeader}
                onPress={() => setExpandedPlans(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
              >
                <View style={styles.progressPlanHeaderLeft}>
                  <Text style={styles.progressPlanTitle}>
                    {plan.plan_content.title || `${plan.language} Learning`}
                  </Text>
                  <Text style={styles.progressPlanSubtitle}>
                    {plan.proficiency_level} • {plan.duration_months} months
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: getScoreColor(progressPercentage) }]} />
                    </View>
                    <Text style={[styles.progressBarText, { color: getScoreColor(progressPercentage) }]}>
                      {Math.round(progressPercentage)}%
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color="#6B7280" 
                />
              </TouchableOpacity>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.progressPlanContent}>
                  {/* Skills Grid - 2 Columns */}
                  {plan.assessment_data && (
                    <View style={styles.skillsSection}>
                      <Text style={styles.skillsSectionTitle}>Skills Assessment</Text>
                      <View style={styles.skillsGridHorizontal}>
                        {[
                          { key: 'pronunciation', label: 'Pronunciation', icon: 'mic', score: plan.assessment_data.pronunciation.score },
                          { key: 'grammar', label: 'Grammar', icon: 'book', score: plan.assessment_data.grammar.score },
                          { key: 'vocabulary', label: 'Vocabulary', icon: 'text', score: plan.assessment_data.vocabulary.score },
                          { key: 'fluency', label: 'Fluency', icon: 'chatbubbles', score: plan.assessment_data.fluency.score },
                          { key: 'coherence', label: 'Coherence', icon: 'git-merge', score: plan.assessment_data.coherence.score },
                        ].map((skill) => (
                          <View key={skill.key} style={styles.skillCardHorizontal}>
                            <View style={[styles.skillIconHorizontal, { backgroundColor: `${getScoreColor(skill.score)}20` }]}>
                              <Ionicons name={skill.icon as any} size={18} color={getScoreColor(skill.score)} />
                            </View>
                            <View style={styles.skillInfo}>
                              <Text style={styles.skillLabelHorizontal}>{skill.label}</Text>
                              <Text style={[styles.skillScoreHorizontal, { color: getScoreColor(skill.score) }]}>
                                {skill.score}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Current Week Focus */}
                  {plan.plan_content.weekly_schedule && plan.plan_content.weekly_schedule[currentWeek - 1] && (
                    <View style={styles.currentWeekSection}>
                      <View style={styles.currentWeekHeader}>
                        <Text style={styles.currentWeekLabel}>Current Focus • Week {currentWeek}</Text>
                      </View>
                      <Text style={styles.currentWeekFocus}>
                        {plan.plan_content.weekly_schedule[currentWeek - 1].focus}
                      </Text>
                      <View style={styles.currentWeekActivities}>
                        {plan.plan_content.weekly_schedule[currentWeek - 1].activities.slice(0, 3).map((activity, index) => (
                          <View key={index} style={styles.activityRow}>
                            <View style={styles.activityBullet} />
                            <Text style={styles.activityRowText}>{activity}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Weekly Schedule Preview */}
                  {plan.plan_content.weekly_schedule && (
                    <View style={styles.weeklyScheduleSection}>
                      <Text style={styles.weeklyScheduleTitle}>Schedule</Text>
                      <View style={styles.weeksList}>
                        {plan.plan_content.weekly_schedule.slice(0, 4).map((week) => {
                          const isCurrentWeek = week.week === currentWeek;
                          const isCompleted = week.week < currentWeek;

                          return (
                            <View
                              key={week.week}
                              style={[
                                styles.weekItem,
                                isCurrentWeek && styles.weekItemCurrent,
                                isCompleted && styles.weekItemCompleted,
                              ]}
                            >
                              <View style={styles.weekItemHeader}>
                                <Text style={[
                                  styles.weekItemNumber,
                                  isCurrentWeek && styles.weekItemNumberCurrent,
                                  isCompleted && styles.weekItemNumberCompleted,
                                ]}>
                                  Week {week.week}
                                </Text>
                                {isCurrentWeek && (
                                  <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>NOW</Text>
                                  </View>
                                )}
                                {isCompleted && (
                                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                )}
                              </View>
                              <Text style={styles.weekItemFocus} numberOfLines={2}>
                                {week.focus}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Flashcards Tab - GRID LAYOUT
  const renderFlashcardItem = ({ item }: { item: FlashcardSet }) => (
    <View style={styles.flashcardCard}>
      <View style={styles.flashcardCardHeader}>
        <View style={styles.flashcardCardIcon}>
          <Ionicons name="layers" size={28} color="#F75A5A" />
        </View>
        <View style={styles.flashcardCardInfo}>
          <Text style={styles.flashcardCardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.flashcardCardMeta}>
            {item.total_cards} cards
          </Text>
        </View>
      </View>
      <Text style={styles.flashcardCardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <TouchableOpacity
        style={styles.flashcardStudyButton}
        onPress={() => openFlashcardViewer(item)}
      >
        <Ionicons name="play-circle" size={20} color="#FFFFFF" />
        <Text style={styles.flashcardStudyButtonText}>Study</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFlashcardsTab = () => (
    <View style={styles.flashcardsContainer}>
      {flashcardSets.length > 0 ? (
        <FlatList
          data={flashcardSets}
          renderItem={renderFlashcardItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.flashcardGridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flashcardGridContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No Flashcards Yet</Text>
        </View>
      )}
    </View>
  );

  // Notifications Tab
  const renderNotificationsTab = () => (
    <View>
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
        </View>
      )}

      {notifications.length > 0 ? (
        <View style={styles.notificationList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.notificationCardUnread,
              ]}
              onPress={() => {
                if (!notification.is_read) {
                  markNotificationAsRead(notification.notification_id);
                }
              }}
            >
              <View style={styles.notificationHeader}>
                <View style={[styles.notificationIcon, { backgroundColor: `${getNotificationColor(notification.notification.notification_type)}20` }]}>
                  <Ionicons
                    name={getNotificationIcon(notification.notification.notification_type) as any}
                    size={20}
                    color={getNotificationColor(notification.notification.notification_type)}
                  />
                </View>
                <View style={styles.notificationHeaderInfo}>
                  <Text style={styles.notificationTitle}>
                    {notification.notification.title}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {formatDate(notification.notification.created_at)}
                  </Text>
                </View>
              </View>
              <Text style={styles.notificationContent}>{notification.notification.content}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No Notifications</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Tabs - NO BADGE ON FLASHCARDS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Ionicons name="home" size={20} color={activeTab === 'overview' ? '#14B8A6' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
            onPress={() => setActiveTab('progress')}
          >
            <Ionicons name="trending-up" size={20} color={activeTab === 'progress' ? '#14B8A6' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'flashcards' && styles.tabActive]}
            onPress={() => setActiveTab('flashcards')}
          >
            <Ionicons name="albums" size={20} color={activeTab === 'flashcards' ? '#14B8A6' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'flashcards' && styles.tabTextActive]}>Flashcards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
            onPress={() => setActiveTab('notifications')}
          >
            <Ionicons name="notifications" size={20} color={activeTab === 'notifications' ? '#14B8A6' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>Alerts</Text>
            {unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'flashcards' ? (
          renderFlashcardsTab()
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" colors={['#14B8A6']} />
            }
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'progress' && renderProgressTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </ScrollView>
        )}

        {/* Flashcard Modal */}
        <Modal
          visible={showFlashcardViewer}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={closeFlashcardViewer}
        >
          <View style={styles.flashcardModalContainer}>
            <View style={styles.flashcardModalHeader}>
              <TouchableOpacity 
                onPress={closeFlashcardViewer}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={styles.closeButton}
              >
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>
              <View style={styles.flashcardModalTitleContainer}>
                <Text style={styles.flashcardModalTitle} numberOfLines={1}>
                  {selectedFlashcardSet?.title || 'Flashcards'}
                </Text>
                <Text style={styles.flashcardModalSubtitle}>
                  {selectedFlashcardSet?.language} • {selectedFlashcardSet?.level}
                </Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>
            
            {selectedFlashcardSet && (
              <FlashcardViewerMobile
                flashcards={selectedFlashcardSet.flashcards}
                onReview={handleReviewFlashcard}
              />
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, gap: 6, position: 'relative' },
  tabActive: { backgroundColor: '#ECFDF5' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#14B8A6' },
  tabBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 20 },
  
  // Welcome
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#14B8A6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  welcomeText: { flex: 1 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, color: '#6B7280' },
  
  // Stats
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  // Activity
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  activityList: { gap: 12 },
  activityCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  activitySubtitle: { fontSize: 12, color: '#6B7280' },
  activityDate: { fontSize: 11, color: '#9CA3AF' },
  activityDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  activitySummary: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  
  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  
  // Progress Tab - IMPROVED DESIGN
  progressPlanCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    marginBottom: 16, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressPlanHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
  },
  progressPlanHeaderLeft: { 
    flex: 1, 
    marginRight: 16 
  },
  progressPlanTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 4 
  },
  progressPlanSubtitle: { 
    fontSize: 13, 
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  progressPlanContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Skills Grid - HORIZONTAL
  skillsGridHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillCardHorizontal: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  skillIconHorizontal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillLabelHorizontal: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  skillScoreHorizontal: {
    fontSize: 20,
    fontWeight: '700',
  },
  currentWeekActivities: {
    gap: 8,
  },
  activityBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3B82F6',
    marginTop: 6,
  },
  activityRowText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  weeklyScheduleSection: {
    marginTop: 8,
  },
  weeklyScheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  weeksList: {
    gap: 8,
  },
  weekItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekItemCurrent: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  weekItemCompleted: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  weekItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekItemNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  weekItemNumberCurrent: {
    color: '#1E40AF',
  },
  weekItemNumberCompleted: {
    color: '#047857',
  },
  currentBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekItemFocus: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  
  // Old styles kept for compatibility
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  progressHeaderText: { flex: 1, marginRight: 16 },
  progressTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  progressSubtitle: { fontSize: 13, color: '#6B7280' },
  circularProgress: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  circularProgressText: { position: 'absolute' },
  circularProgressPercentage: { fontSize: 20, fontWeight: '700' },
  
  // Skills Grid
  skillsSection: { marginBottom: 20 },
  skillsSectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillCard: { width: (width - 80) / 2, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, alignItems: 'center' },
  skillIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  skillLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  skillScore: { fontSize: 22, fontWeight: '700' },
  
  // Current Week
  currentWeekSection: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  currentWeekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  currentWeekLabel: { fontSize: 12, fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' },
  weekBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  weekBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  currentWeekFocus: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  
  // Flashcards - GRID
  flashcardsContainer: { flex: 1 },
  flashcardGridContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  flashcardGridRow: { gap: 12, marginBottom: 12 },
  flashcardCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  flashcardCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  flashcardCardIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  flashcardCardInfo: { flex: 1 },
  flashcardCardTitle: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  flashcardCardMeta: { fontSize: 10, color: '#9CA3AF' },
  flashcardCardDescription: { fontSize: 11, color: '#6B7280', lineHeight: 16, marginBottom: 12, minHeight: 32 },
  flashcardStudyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F75A5A', borderRadius: 10, paddingVertical: 10, gap: 6 },
  flashcardStudyButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  
  // Notifications
  unreadBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto', marginBottom: 16 },
  unreadBadgeText: { fontSize: 12, fontWeight: '600', color: '#991B1B' },
  notificationList: { gap: 12 },
  notificationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  notificationCardUnread: { borderColor: '#14B8A6', borderWidth: 2 },
  notificationHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  notificationIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notificationHeaderInfo: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  notificationDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  notificationContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  
  // Modal
  flashcardModalContainer: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 50 },
  flashcardModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', elevation: 3 },
  closeButton: { padding: 4, width: 44 },
  flashcardModalTitleContainer: { flex: 1, alignItems: 'center' },
  flashcardModalTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  flashcardModalSubtitle: { fontSize: 12, fontWeight: '500', color: '#6B7280', marginTop: 2, textAlign: 'center' },
  headerSpacer: { width: 44 },
});

export default ProfileScreen;