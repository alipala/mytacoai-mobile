/**
 * ProfileScreen.tsx
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '../../api/config';
import FlashcardViewerMobile from '../../components/FlashcardViewerMobile';
import SettingsScreen from './Settings/SettingsScreen';
import TransitionWrapper from '../../components/TransitionWrapper';
import { styles } from './styles/ProfileScreen.styles';
import { setBadgeCount } from '../../services/notificationService';

const API_URL = API_BASE_URL;
const SCREEN_WIDTH = Dimensions.get('window').width;

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
  session_id: string;
  user_id: string;
  language: string;
  level: string;
  topic?: string | null;
  title: string;
  description: string;
  flashcards: Flashcard[];
  total_cards: number;
  created_at: string;
  is_completed?: boolean;
  completed_at?: string | null;
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

interface ProfileScreenProps {
  route?: any;
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {
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
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Handle navigation from push notification tap
  useEffect(() => {
    if (route?.params?.tab === 'notifications') {
      console.log('📬 Navigating to notifications tab from push notification');
      setActiveTab('notifications');

      // Auto-expand the notification if ID is provided
      const notificationId = route?.params?.notificationId;
      if (notificationId) {
        console.log('📌 Auto-expanding notification:', notificationId);
        setExpandedNotifications(prev => ({
          ...prev,
          [notificationId]: true
        }));
      }

      // Clear the params to avoid re-triggering
      if (route.params) {
        route.params.tab = undefined;
        route.params.notificationId = undefined;
      }
    }
  }, [route?.params?.tab, route?.params?.notificationId]);

  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [expandedConversations, setExpandedConversations] = useState<Record<string, boolean>>({});
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});
  const [showFlashcardViewer, setShowFlashcardViewer] = useState(false);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<FlashcardSet | null>(null);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [flashcardFilter, setFlashcardFilter] = useState<'all' | 'practice' | 'learning_plan'>('all');

  // Refs for Swipeable components to programmatically close them
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  // Tab Navigation Helpers
  const tabs = ['overview', 'progress', 'flashcards', 'notifications'] as const;

  const handleTabPress = (tab: typeof activeTab) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
    const index = tabs.indexOf(tab);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    const newTab = tabs[index];
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

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

      // Debug: Log flashcard sets with their topics
      console.log('📚 Flashcard Sets:', sets?.map((s: any) => ({
        id: s.id,
        title: s.title,
        topic: s.topic,
        session_id: s.session_id
      })));

      setFlashcardSets(sets || []);
      setDueFlashcards(due || []);
    } catch (error) {
      console.error('Error fetching flashcard data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Note: The notifications endpoint is literally /api/ (base path)
      const data = await fetchWithAuth('/api/');

      // Filter and validate notifications to ensure they have required fields
      const validNotifications = (data.notifications || []).filter((notif: Notification) => {
        return notif && (notif.id || notif.notification_id) && notif.notification;
      });

      const newUnreadCount = data.unread_count || 0;
      setNotifications(validNotifications);
      setUnreadCount(newUnreadCount);

      // Update iOS badge count to match unread count
      await setBadgeCount(newUnreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      await setBadgeCount(0);
    }
  };

  const fetchAllData = async () => {
    try {
      // Check if user is authenticated (guest users shouldn't be on profile)
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        console.log('⚠️ [PROFILE] Guest user detected - redirecting to Welcome');
        navigation.replace('Welcome');
        return;
      }

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
      console.log('📖 Marking notification as read:', notificationId);

      // Check if already marked as read locally (avoid unnecessary API call)
      const notification = notifications.find(n => n.notification_id === notificationId);
      if (notification?.is_read) {
        console.log('ℹ️ Notification already marked as read locally');
        // Still close the swipeable for good UX
        const swipeableRef = swipeableRefs.current[notificationId];
        if (swipeableRef) {
          swipeableRef.close();
        }
        return;
      }

      // Mark as read on backend
      try {
        await fetchWithAuth('/api/mark-read', {
          method: 'POST',
          body: JSON.stringify({ notification_id: notificationId }),
        });
        console.log('✅ Notification marked as read successfully');
      } catch (backendError: any) {
        // If already read on backend (404 with specific message), treat as success
        if (backendError.message?.includes('already read') || backendError.message?.includes('not found')) {
          console.log('ℹ️ Notification already marked as read on backend (idempotent operation)');
          // Continue to update local state for consistency
        } else {
          // Other errors - rethrow
          throw backendError;
        }
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count (only if notification was unread)
      if (!notification?.is_read) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);

        // Update iOS badge count
        await setBadgeCount(newUnreadCount);
        console.log('✅ Badge count updated to:', newUnreadCount);
      }

      // Close the swipeable with animation
      const swipeableRef = swipeableRefs.current[notificationId];
      if (swipeableRef) {
        swipeableRef.close();
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Don't show alert - fail silently for better UX
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Check if notification was unread before deleting
      const notification = notifications.find(n => n.notification_id === notificationId);
      const wasUnread = notification && !notification.is_read;

      // Delete from backend - this will hide the notification for this user permanently
      try {
        await fetchWithAuth('/api/notifications/delete', {
          method: 'POST',
          body: JSON.stringify({ notification_id: notificationId }),
        });
        console.log('✅ Notification deleted on backend');
      } catch (backendError: any) {
        console.error('❌ Backend deletion failed:', backendError);

        // Check if endpoint doesn't exist (404) - inform user
        if (backendError.message?.includes('404') || backendError.message?.includes('not found')) {
          Alert.alert(
            'Feature Not Available',
            'Notification deletion is not yet supported by the server. The notification will be hidden locally but may reappear after refresh.',
            [{ text: 'OK' }]
          );
        } else {
          // Other errors - inform and continue
          Alert.alert('Warning', 'Failed to delete from server, but will remove locally.');
        }
      }

      // Remove from local state (always do this for good UX, even if backend fails)
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));

      // Update unread count and badge if notification was unread
      if (wasUnread) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        await setBadgeCount(newUnreadCount);
        console.log('✅ Badge count updated to:', newUnreadCount);
      }

      // Close the swipeable
      const swipeableRef = swipeableRefs.current[notificationId];
      if (swipeableRef) {
        swipeableRef.close();
      }

      console.log('✅ Notification deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification. Please try again.');
    }
  };

  const toggleNotificationExpanded = (notificationId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedNotifications(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }));
  };

  const renderLeftActions = (notification: Notification, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [-100, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX: trans }],
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#EF4444',
            justifyContent: 'center',
            alignItems: 'center',
            width: 100,
            borderRadius: 12,
            marginRight: 8,
          }}
          onPress={() => {
            Alert.alert(
              'Delete Notification',
              'Are you sure you want to delete this notification?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteNotification(notification.notification_id),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash" size={24} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderRightActions = (notification: Notification, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX: trans }],
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#10B981',
            justifyContent: 'center',
            alignItems: 'center',
            width: 100,
            borderRadius: 12,
            marginLeft: 8,
          }}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            markNotificationAsRead(notification.notification_id);
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            Mark Read
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
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

  // Render circular progress - Dark Theme
  const renderCircularProgress = (percentage: number, size: number = 80) => {
    const radius = (size - 12) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[styles.circularProgress, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(20, 184, 166, 0.15)" strokeWidth="6" fill="none" />
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
      {/* Learning Info Badge */}
      {user?.preferred_language && (
        <View style={styles.learningInfoBadge}>
          <Ionicons name="school" size={16} color="#14B8A6" />
          <Text style={styles.learningInfoText}>
            Learning {user.preferred_language} • {user.preferred_level || 'Beginner'}
          </Text>
        </View>
      )}

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

      {/* Speaking DNA Section - Dark Theme Enhanced */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
          <Ionicons name="analytics" size={20} color="#14B8A6" style={{marginRight: 8}} />
          <Text style={styles.sectionTitle}>Your Speaking DNA</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            // Use most recent learning plan's language, fallback to preferred language, then dutch
            const recentLanguage = learningPlans.length > 0
              ? learningPlans[0].language
              : (user?.preferred_language || 'dutch');
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            navigation.navigate('SpeakingDNA', { language: recentLanguage });
          }}
          activeOpacity={0.9}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Dark Theme DNA Card */}
          <View style={{
            backgroundColor: 'rgba(11, 26, 31, 0.8)',
            borderWidth: 1,
            borderColor: 'rgba(20, 184, 166, 0.3)',
          }}>
            {/* Header Row */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(20, 184, 166, 0.15)',
            }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(20, 184, 166, 0.3)',
                }}>
                  <Ionicons name="pulse" size={20} color="#14B8A6" />
                </View>
                <View>
                  <Text style={{fontSize: 16, fontWeight: '700', color: '#FFFFFF'}}>
                    Track Your Progress
                  </Text>
                  <Text style={{fontSize: 12, color: '#B4E4DD', marginTop: 2}}>
                    6 DNA Strands Analyzed
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="#14B8A6" />
            </View>

            {/* Content Row */}
            <View style={{
              flexDirection: 'row',
              padding: 16,
              gap: 12,
            }}>
              {/* Left: DNA Icon Grid with Glow */}
              <View style={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(20, 184, 166, 0.08)',
                borderRadius: 12,
                padding: 8,
                gap: 4,
                borderWidth: 1,
                borderColor: 'rgba(20, 184, 166, 0.2)',
              }}>
                <View style={{flexDirection: 'row', gap: 4, justifyContent: 'space-around'}}>
                  <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#6366F1', shadowColor: '#6366F1', shadowOpacity: 0.5, shadowRadius: 4}} />
                  <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOpacity: 0.5, shadowRadius: 4}} />
                  <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#EC4899', shadowColor: '#EC4899', shadowOpacity: 0.5, shadowRadius: 4}} />
                </View>
                <View style={{flexDirection: 'row', gap: 4, justifyContent: 'space-around'}}>
                  <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.5, shadowRadius: 4}} />
                  <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 4}} />
                  <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#14B8A6', shadowColor: '#14B8A6', shadowOpacity: 0.5, shadowRadius: 4}} />
                </View>
                <View style={{alignItems: 'center', marginTop: 4}}>
                  <Ionicons name="trending-up" size={16} color="#14B8A6" />
                </View>
              </View>

              {/* Right: Description */}
              <View style={{flex: 1, justifyContent: 'center'}}>
                <Text style={{
                  fontSize: 14,
                  color: '#B4E4DD',
                  lineHeight: 20,
                  marginBottom: 8,
                }}>
                  Discover your unique speaking patterns across confidence, vocabulary, rhythm, and more
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <View style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                  }}>
                    <Text style={{fontSize: 11, fontWeight: '600', color: '#FBBF24'}}>
                      Visual Analytics
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                  }}>
                    <Text style={{fontSize: 11, fontWeight: '600', color: '#3B82F6'}}>
                      Insights
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
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
                    <Text style={styles.activityTitle}>
                      {session.topic
                        ? session.topic.charAt(0).toUpperCase() + session.topic.slice(1)
                        : session.conversation_type === 'news'
                          ? 'Daily News'
                          : 'Practice Session'}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {session.language?.charAt(0).toUpperCase() + session.language?.slice(1) || 'English'} • {session.level}
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
          <Ionicons name="book-outline" size={64} color="#6B8A84" />
          <Text style={styles.emptyStateText}>No Learning Plans Yet</Text>
        </View>
      );
    }

    // Sort learning plans from latest to earliest
    const sortedPlans = [...learningPlans].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Latest first
    });

    return (
      <View>
        {sortedPlans.map((plan) => {
          const progressPercentage = plan.progress_percentage || 0;
          const currentWeek = Math.ceil((plan.completed_sessions || 0) / 3);
          const isExpanded = expandedPlans[plan.id];

          return (
            <View key={plan.id} style={styles.progressPlanCard}>
              {/* Header with Progress */}
              <TouchableOpacity
                style={styles.progressPlanHeader}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setExpandedPlans(prev => ({ ...prev, [plan.id]: !prev[plan.id] }));
                }}
                activeOpacity={0.7}
              >
                <View style={styles.progressPlanHeaderLeft}>
                  <Text style={styles.progressPlanTitle}>
                    {plan.plan_content.title || `${plan.language} Learning`}
                  </Text>
                  <Text style={styles.progressPlanSubtitle}>
                    {plan.proficiency_level} • {plan.duration_months} months • Created {formatDate(plan.created_at)}
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
                  color="#6B8A84"
                />
              </TouchableOpacity>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.progressPlanContent}>
                  {/* Skills Grid - TRUE HORIZONTAL 2 COLUMNS */}
                  {plan.assessment_data && (
                    <View style={styles.skillsSection}>
                      <Text style={styles.skillsSectionTitle}>Skills Assessment</Text>
                      <View style={styles.skillsGridHorizontal}>
                        <View style={styles.skillColumn}>
                          {[
                            { key: 'pronunciation', label: 'Pronunciation', icon: 'mic', score: plan.assessment_data.pronunciation.score },
                            { key: 'grammar', label: 'Grammar', icon: 'book', score: plan.assessment_data.grammar.score },
                            { key: 'vocabulary', label: 'Vocabulary', icon: 'text', score: plan.assessment_data.vocabulary.score },
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
                        <View style={styles.skillColumn}>
                          {[
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
  const renderFlashcardItem = ({ item }: { item: FlashcardSet }) => {
    // Determine if this is a learning plan card
    const isLearningPlan = item.session_id.startsWith('learning_plan');

    // Different colors for different categories
    const iconColor = isLearningPlan ? '#6366F1' : '#F59E0B'; // Purple for LP, Amber for Practice
    const iconBgColor = isLearningPlan ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)';
    const iconBorderColor = isLearningPlan ? 'rgba(99, 102, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)';
    const iconName = isLearningPlan ? 'school' : 'fitness';

    return (
      <View style={styles.flashcardCard}>
        <View style={styles.flashcardCardHeader}>
          <View style={[
            styles.flashcardCardIcon,
            {
              backgroundColor: iconBgColor,
              borderColor: iconBorderColor,
              shadowColor: iconColor,
            }
          ]}>
            <Ionicons name={iconName} size={28} color={iconColor} />
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
          style={[
            styles.flashcardStudyButton,
            isLearningPlan && styles.flashcardStudyButtonLP
          ]}
          onPress={() => openFlashcardViewer(item)}
        >
          <Ionicons name="play-circle" size={20} color="#FFFFFF" />
          <Text style={styles.flashcardStudyButtonText}>Study</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFlashcardsTab = () => {
    // Filter flashcard sets based on selected filter
    const filteredFlashcards = flashcardSets.filter((set) => {
      if (flashcardFilter === 'all') return true;

      if (flashcardFilter === 'practice') {
        // Practice flashcards: session_id does NOT start with "learning_plan"
        return !set.session_id.startsWith('learning_plan');
      }

      if (flashcardFilter === 'learning_plan') {
        // Learning plan flashcards: session_id STARTS with "learning_plan"
        return set.session_id.startsWith('learning_plan');
      }

      return true;
    });

    // Debug logging
    console.log(`🔍 Filter: ${flashcardFilter}, Total: ${flashcardSets.length}, Filtered: ${filteredFlashcards.length}`);

    return (
      <View style={styles.flashcardsContainer}>
        {/* iOS-style segmented control filter */}
        <View style={styles.flashcardFilterContainer}>
          <View style={styles.flashcardFilterSegment}>
            <TouchableOpacity
              style={[
                styles.flashcardFilterButton,
                flashcardFilter === 'all' && styles.flashcardFilterButtonActive,
              ]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFlashcardFilter('all');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.flashcardFilterButtonText,
                  flashcardFilter === 'all' && styles.flashcardFilterButtonTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.flashcardFilterButton,
                flashcardFilter === 'practice' && styles.flashcardFilterButtonActive,
              ]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFlashcardFilter('practice');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.flashcardFilterButtonText,
                  flashcardFilter === 'practice' && styles.flashcardFilterButtonTextActive,
                ]}
              >
                Practice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.flashcardFilterButton,
                flashcardFilter === 'learning_plan' && styles.flashcardFilterButtonActive,
              ]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFlashcardFilter('learning_plan');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.flashcardFilterButtonText,
                  flashcardFilter === 'learning_plan' && styles.flashcardFilterButtonTextActive,
                ]}
              >
                Learning Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredFlashcards.length > 0 ? (
          <FlatList
            data={filteredFlashcards}
            renderItem={renderFlashcardItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.flashcardGridRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flashcardGridContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={64} color="#6B8A84" />
            <Text style={styles.emptyStateText}>
              {flashcardFilter === 'all' ? 'No Flashcards Yet' : `No ${flashcardFilter === 'practice' ? 'Practice' : 'Learning Plan'} Flashcards`}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
          {notifications.map((notification, index) => {
            const isExpanded = expandedNotifications[notification.notification_id];
            const contentPreview = notification.notification.content.length > 100
              ? notification.notification.content.substring(0, 100) + '...'
              : notification.notification.content;

            return (
              <Swipeable
                key={notification.id || `notification-${notification.notification_id || index}`}
                ref={(ref) => {
                  if (ref) {
                    swipeableRefs.current[notification.notification_id] = ref;
                  }
                }}
                renderLeftActions={(_, dragX) => renderLeftActions(notification, dragX)}
                renderRightActions={(_, dragX) => renderRightActions(notification, dragX)}
                overshootLeft={false}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    !notification.is_read && styles.notificationCardUnread,
                  ]}
                  onPress={() => toggleNotificationExpanded(notification.notification_id)}
                  activeOpacity={0.7}
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
                    {notification.notification.content.length > 100 && (
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </View>
                  <Text style={styles.notificationContent} numberOfLines={isExpanded ? undefined : 3}>
                    {isExpanded ? notification.notification.content : contentPreview}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic' }}>
                    {notification.is_read
                      ? 'Swipe right to delete'
                      : 'Swipe left: mark read • Swipe right: delete'}
                  </Text>
                </TouchableOpacity>
              </Swipeable>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No Notifications</Text>
        </View>
      )}
    </View>
  );

  return (
    <TransitionWrapper isLoading={loading} loadingMessage="Loading your profile...">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        {/* Header with Welcome Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerWelcome}>Welcome back</Text>
              <Text style={styles.headerName}>{user?.name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowAppSettings(true);
            }}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#14B8A6" />
          </TouchableOpacity>
        </View>

        {/* Tabs - Premium Segmented Control Design */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => handleTabPress('overview')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'overview' ? 'home' : 'home-outline'}
                size={24}
                color={activeTab === 'overview' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
              onPress={() => handleTabPress('progress')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'progress' ? 'trending-up' : 'trending-up-outline'}
                size={24}
                color={activeTab === 'progress' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'flashcards' && styles.tabActive]}
              onPress={() => handleTabPress('flashcards')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'flashcards' ? 'albums' : 'albums-outline'}
                size={24}
                color={activeTab === 'flashcards' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'flashcards' && styles.tabTextActive]}>Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
              onPress={() => handleTabPress('notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
                  size={24}
                  color={activeTab === 'notifications' ? '#14B8A6' : '#6B8A84'}
                />
                <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>Alerts</Text>
                {unreadCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Swipeable Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.pagerContainer}
        >
          {/* Overview Page */}
          <View style={styles.page}>
            <ScrollView
              style={styles.pageContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" colors={['#14B8A6']} />
              }
            >
              {renderOverviewTab()}
            </ScrollView>
          </View>

          {/* Progress Page */}
          <View style={styles.page}>
            <ScrollView
              style={styles.pageContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" colors={['#14B8A6']} />
              }
            >
              {renderProgressTab()}
            </ScrollView>
          </View>

          {/* Flashcards Page */}
          <View style={styles.page}>
            {renderFlashcardsTab()}
          </View>

          {/* Notifications Page */}
          <View style={styles.page}>
            <ScrollView
              style={styles.pageContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" colors={['#14B8A6']} />
              }
            >
              {renderNotificationsTab()}
            </ScrollView>
          </View>
        </ScrollView>

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

        {/* App Settings Modal */}
        <Modal
          visible={showAppSettings}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAppSettings(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <SettingsScreen onClose={() => setShowAppSettings(false)} navigation={navigation} />
          </SafeAreaView>
        </Modal>
        </View>
      </SafeAreaView>
    </TransitionWrapper>
  );
};

export default ProfileScreen;