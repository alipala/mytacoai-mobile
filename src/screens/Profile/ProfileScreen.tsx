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
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../api/config';
import FlashcardViewerMobile from '../../components/FlashcardViewerMobile';
import SettingsScreen from './Settings/SettingsScreen';
import TransitionWrapper from '../../components/TransitionWrapper';
import { styles } from './styles/ProfileScreen.styles';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { LanguageGradients } from '../../constants/colors';

// Flag imports
import EnglishFlag from '../../assets/flags/english.svg';
import SpanishFlag from '../../assets/flags/spanish.svg';
import FrenchFlag from '../../assets/flags/french.svg';
import GermanFlag from '../../assets/flags/german.svg';
import PortugueseFlag from '../../assets/flags/portuguese.svg';
import DutchFlag from '../../assets/flags/dutch.svg';
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
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [conversationHistory, setConversationHistory] = useState<ConversationSession[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // DNA tab state — kept at component level to respect Rules of Hooks
  const [selectedDNALanguage, setSelectedDNALanguage] = useState<string>('');
  const [dnaProfile, setDnaProfile] = useState<any>(null);
  const [loadingDNA, setLoadingDNA] = useState(false);
  const [isDNAPremium, setIsDNAPremium] = useState<boolean | null>(null);
  // True once fetchUserData has written fresh subscription data to AsyncStorage
  const [userSynced, setUserSynced] = useState(false);

  // Live stats state (replaces hardcoded values)
  const [progressStats, setProgressStats] = useState<{
    total_minutes: number;
    total_sessions: number;
    current_streak: number;
    longest_streak: number;
    total_xp: number;
  } | null>(null);
  const [achievementCount, setAchievementCount] = useState<number | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'flashcards' | 'dna'>('overview');
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Handle navigation from push notification tap
  useEffect(() => {
    // Notifications tab removed - redirect to overview
    if (route?.params?.tab === 'notifications') {
      console.log('📬 Notifications tab removed - staying on overview');
      setActiveTab('overview');

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
  const [flashcardViewerColor, setFlashcardViewerColor] = useState<string>('#6366F1');
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [flashcardFilter, setFlashcardFilter] = useState<'practice' | 'learning_plan'>('practice');

  // Refs for Swipeable components to programmatically close them
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  // Helper function to get flag component
  const getFlagComponent = (language: string) => {
    const languageLower = language.toLowerCase();
    switch (languageLower) {
      case 'english':
        return EnglishFlag;
      case 'spanish':
        return SpanishFlag;
      case 'french':
        return FrenchFlag;
      case 'german':
        return GermanFlag;
      case 'portuguese':
        return PortugueseFlag;
      case 'dutch':
        return DutchFlag;
      default:
        return null;
    }
  };

  // Tab Navigation Helpers
  const tabs = ['overview', 'progress', 'flashcards', 'dna'] as const;

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
      // Grab challenge stats from the user object to avoid a duplicate API call
      const total = userData?.challengeStats?.totalCompleted ?? 0;
      setChallengesCompleted(total);
      // Keep AsyncStorage in sync so subscription-gated services (e.g. hasPremiumAccess)
      // always read the current plan/status rather than a stale cached object.
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUserSynced(true);
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
      // Fetch notifications from the notifications endpoint
      const data = await fetchWithAuth('/api/notifications/');

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

  const fetchProgressStats = async () => {
    try {
      const [progressData, lifetimeData] = await Promise.all([
        fetchWithAuth('/api/progress/stats'),
        fetchWithAuth('/api/stats/lifetime').catch(() => null),
      ]);
      setProgressStats({
        total_minutes: progressData.total_minutes || 0,
        total_sessions: progressData.total_sessions || 0,
        current_streak: progressData.current_streak || 0,
        longest_streak: progressData.longest_streak || 0,
        total_xp: lifetimeData?.summary?.total_xp || 0,
      });
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      setProgressStats({ total_minutes: 0, total_sessions: 0, current_streak: 0, longest_streak: 0, total_xp: 0 });
    }
  };

  const fetchAchievements = async () => {
    try {
      const data = await fetchWithAuth('/api/progress/achievements');
      setAchievementCount((data.achievements || []).length);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievementCount(0);
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

      // Reset all stats state before fetching to avoid showing stale data from a previous user
      setProgressStats(null);
      setAchievementCount(null);
      setChallengesCompleted(null);
      setUser(null);
      setConversationHistory([]);
      setLearningPlans([]);
      setFlashcardSets([]);
      setDueFlashcards([]);
      setNotifications([]);
      setUnreadCount(0);
      setUserSynced(false);
      setDnaProfile(null);
      setIsDNAPremium(null);

      await Promise.all([
        fetchUserData(),
        fetchConversationHistory(),
        fetchLearningPlans(),
        fetchFlashcardData(),
        fetchNotifications(),
        fetchProgressStats(),
        fetchAchievements(),
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

  // Derived list of unique languages from learning plans (used by DNA tab)
  const dnaLanguages = Array.from(new Set(
    learningPlans
      .map(plan => plan.language)
      .filter((lang): lang is string => lang !== null && lang !== undefined)
  ));

  // Keep selectedDNALanguage in sync when learning plans load.
  // Only set a language when the user actually has plans — no fallback,
  // so the DNA fetch is skipped entirely for users with no learning plans.
  useEffect(() => {
    if (dnaLanguages.length > 0) {
      setSelectedDNALanguage(prev => prev && dnaLanguages.includes(prev) ? prev : dnaLanguages[0]);
    }
  }, [learningPlans]);

  // Fetch DNA profile — at component level to respect Rules of Hooks.
  // Only runs after userSynced=true (fresh subscription data in AsyncStorage)
  // and only when the user actually has learning plans (real language, not a fallback).
  useEffect(() => {
    if (!selectedDNALanguage || !userSynced || dnaLanguages.length === 0) return;

    let cancelled = false;
    const fetchDNAProfile = async () => {
      try {
        setLoadingDNA(true);

        // Check premium access first — avoids a 403 for free users
        const hasPremium = await speakingDNAService.hasPremiumAccess();
        if (cancelled) return;
        setIsDNAPremium(hasPremium);

        if (!hasPremium) {
          setDnaProfile(null);
          return;
        }

        const profile = await speakingDNAService.getProfile(selectedDNALanguage);
        if (cancelled) return;
        setDnaProfile(profile);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching DNA profile:', error);
          setDnaProfile(null);
        }
      } finally {
        if (!cancelled) setLoadingDNA(false);
      }
    };

    fetchDNAProfile();
    return () => { cancelled = true; };
  }, [selectedDNALanguage, userSynced]);

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

  // Helper function to get language-specific color from gradients
  const getLanguageColor = (language: string) => {
    const languageLower = language.toLowerCase();
    const gradientKey = languageLower as keyof typeof LanguageGradients;

    if (LanguageGradients[gradientKey]) {
      return LanguageGradients[gradientKey].colors[0]; // Return primary color
    }

    // Default fallback to turquoise
    return '#14B8A6';
  };

  // Helper function to determine if a color is light or dark
  const isLightColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return true if light (luminance > 0.6)
    return luminance > 0.6;
  };

  // Helper function to get text color based on background
  const getTextColor = (backgroundColor: string) => {
    return isLightColor(backgroundColor) ? '#1F2937' : '#FFFFFF';
  };

  // Helper function to get subtitle color based on background
  const getSubtitleColor = (backgroundColor: string) => {
    if (isLightColor(backgroundColor)) {
      // For light backgrounds, use darker gray
      return '#6B7280';
    } else {
      // For dark backgrounds, use lighter tint
      const r = parseInt(backgroundColor.slice(1, 3), 16);
      const g = parseInt(backgroundColor.slice(3, 5), 16);
      const b = parseInt(backgroundColor.slice(5, 7), 16);

      const lighterR = Math.round(r + (255 - r) * 0.7);
      const lighterG = Math.round(g + (255 - g) * 0.7);
      const lighterB = Math.round(b + (255 - b) * 0.7);

      return `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
    }
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
        await fetchWithAuth('/api/notifications/mark-read', {
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
            t('errors.not_found'),
            t('notifications.error_delete_not_supported'),
            [{ text: t('buttons.ok') }]
          );
        } else {
          // Other errors - inform and continue
          Alert.alert(t('errors.unknown'), t('notifications.error_delete_warning'));
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
      Alert.alert(t('modals.error.title'), t('notifications.error_delete'));
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
              t('notifications.confirm_delete_title'),
              t('notifications.confirm_delete_message'),
              [
                { text: t('buttons.cancel'), style: 'cancel' },
                {
                  text: t('buttons.delete'),
                  style: 'destructive',
                  onPress: () => deleteNotification(notification.notification_id),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash" size={24} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
            {t('notifications.delete')}
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
            {t('notifications.mark_as_read')}
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
      Alert.alert(t('modals.error.title'), t('flashcards.error_review'));
    }
  };

  const openFlashcardViewer = (flashcardSet: FlashcardSet) => {
    setSelectedFlashcardSet(flashcardSet);
    // Determine color based on card type
    const isLearningPlan = flashcardSet.session_id.startsWith('learning_plan');
    const color = isLearningPlan ? '#EC4899' : '#6366F1'; // Pink for LP, Indigo for Practice
    setFlashcardViewerColor(color);
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
          <Ionicons name="school" size={18} color="#FFFFFF" />
          <Text style={styles.learningInfoText}>
            {t('profile.overview.learning_info', {
              language: user.preferred_language,
              level: user.preferred_level || t('practice.levels.beginner')
            })}
          </Text>
        </View>
      )}

      {/* Statistics Dashboard - Masonry Style (NO TITLE) */}
      <View style={styles.section}>
        {/* Row 1: Large Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCardLarge, { backgroundColor: '#14B8A6' }]}>
            <Ionicons name="time" size={36} color="#FFFFFF" />
            <Text style={styles.statLargeValue}>
              {progressStats !== null ? Math.round(progressStats.total_minutes) : '—'}
            </Text>
            <Text style={styles.statLargeLabel}>Minutes Practiced</Text>
          </View>

          <View style={[styles.statCardLarge, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="trophy" size={36} color="#FFFFFF" />
            <Text style={styles.statLargeValue}>
              {challengesCompleted !== null ? challengesCompleted : '—'}
            </Text>
            <Text style={styles.statLargeLabel}>Challenges Completed</Text>
          </View>
        </View>

        {/* Row 2: Medium Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCardMedium, { backgroundColor: '#FCD34D' }]}>
            <Ionicons name="flame" size={32} color="#FFFFFF" />
            <Text style={styles.statMediumValue}>
              {progressStats !== null ? progressStats.current_streak : '—'}
            </Text>
            <Text style={styles.statMediumLabel}>Day Streak</Text>
          </View>

          <View style={[styles.statCardMedium, { backgroundColor: '#EC4899' }]}>
            <Ionicons name="albums" size={32} color="#FFFFFF" />
            <Text style={styles.statMediumValue}>{flashcardSets.length}</Text>
            <Text style={styles.statMediumLabel}>Flashcard Sets</Text>
          </View>

          <View style={[styles.statCardMedium, { backgroundColor: '#10B981' }]}>
            <Ionicons name="ribbon" size={32} color="#FFFFFF" />
            <Text style={styles.statMediumValue}>
              {achievementCount !== null ? achievementCount : '—'}
            </Text>
            <Text style={styles.statMediumLabel}>Achievements</Text>
          </View>
        </View>

        {/* Full-Width Card: Average Practice Time */}
        <View style={[styles.statCardFullWidth, { backgroundColor: '#3B82F6' }]}>
          <View style={styles.statFullWidthHeader}>
            <Text style={styles.statFullWidthTitle}>Average Practice Time</Text>
            <Ionicons name="analytics" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.statFullWidthContent}>
            <View>
              <Text style={styles.statFullWidthValue}>
                {progressStats && progressStats.total_sessions > 0
                  ? Math.round(progressStats.total_minutes / progressStats.total_sessions)
                  : 0}
              </Text>
              <Text style={styles.statFullWidthSubtext}>minutes per session</Text>
            </View>
          </View>
        </View>

        {/* Full-Width Card: Speaking Assessment Score */}
        {(user as any)?.latest_assessment && (
          <View style={[styles.statCardFullWidth, { backgroundColor: '#10B981' }]}>
            <View style={styles.statFullWidthHeader}>
              <Text style={styles.statFullWidthTitle}>Latest Assessment Score</Text>
              <Ionicons name="checkbox-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.statFullWidthContent}>
              <View>
                <Text style={styles.statFullWidthValue}>
                  {(user as any).latest_assessment.overall_score}
                </Text>
                <Text style={styles.statFullWidthSubtext}>
                  Level: {(user as any).latest_assessment.recommended_level || 'B1'}
                </Text>
              </View>
              <View style={styles.statFullWidthBadge}>
                <Ionicons name="trophy" size={16} color="#FFFFFF" />
                <Text style={styles.statFullWidthBadgeText}>
                  {(user as any).latest_assessment.confidence}% confident
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Row 3: Small Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCardSmall, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
            <Text style={styles.statSmallValue}>{conversationHistory.length}</Text>
            <Text style={styles.statSmallLabel}>Practice Sessions</Text>
          </View>

          <View style={[styles.statCardSmall, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
            <Text style={styles.statSmallValue}>{learningPlans.length}</Text>
            <Text style={styles.statSmallLabel}>Learning Plans</Text>
          </View>

          <View style={[styles.statCardSmall, { backgroundColor: '#FB923C' }]}>
            <Ionicons name="star" size={24} color="#FFFFFF" />
            <Text style={styles.statSmallValue}>
              {progressStats !== null ? progressStats.total_xp : '—'}
            </Text>
            <Text style={styles.statSmallLabel}>Total XP</Text>
          </View>

          <View style={[styles.statCardSmall, { backgroundColor: '#A855F7' }]}>
            <Ionicons name="checkbox" size={24} color="#FFFFFF" />
            <Text style={styles.statSmallValue}>{user?.assessments_used || 0}</Text>
            <Text style={styles.statSmallLabel}>Assessments</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Progress Tab - IMPROVED DESIGN
  const renderProgressTab = () => {
    if (learningPlans.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#6B8A84" />
          <Text style={styles.emptyStateText}>{t('profile.progress.no_plans')}</Text>
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

          const FlagComponent = getFlagComponent(plan.language);

          const languageColor = getLanguageColor(plan.language);

          return (
            <View key={plan.id} style={[styles.progressPlanCard, { backgroundColor: languageColor }]}>
              {/* Header with Progress */}
              <TouchableOpacity
                style={styles.progressPlanHeader}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  // Accordion behavior: collapse all others, toggle current
                  setExpandedPlans({ [plan.id]: !isExpanded });
                }}
                activeOpacity={0.7}
              >
                {/* Flag Icon */}
                {FlagComponent && (
                  <View style={[styles.planFlagContainer, { shadowColor: languageColor }]}>
                    <FlagComponent width={40} height={40} />
                  </View>
                )}

                <View style={styles.progressPlanHeaderLeft}>
                  <Text style={[styles.progressPlanTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
                    {plan.goals && plan.goals.length > 0
                      ? plan.goals.slice(0, 2).join(', ').toUpperCase() + (plan.goals.length > 2 ? '...' : '')
                      : t('profile.progress.default_plan_title')}
                  </Text>
                  <Text style={[styles.progressPlanSubtitle, { color: 'rgba(255, 255, 255, 0.85)' }]}>
                    {plan.proficiency_level} • {t('profile.progress.duration_months', { count: plan.duration_months })} • {t('profile.progress.created')} {formatDate(plan.created_at)}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[
                      styles.progressBarTrack,
                      { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                    ]}>
                      <View style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: '#FFFFFF',
                        }
                      ]} />
                    </View>
                    <Text style={[
                      styles.progressBarText,
                      { color: '#FFFFFF' }
                    ]}>
                      {Math.round(progressPercentage)}%
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={[
                  styles.progressPlanContent,
                  {
                    backgroundColor: languageColor,
                    borderTopColor: 'rgba(255, 255, 255, 0.2)',
                  }
                ]}>
                  {/* Skills Grid - TRUE HORIZONTAL 2 COLUMNS */}
                  {plan.assessment_data && (
                    <View style={styles.skillsSection}>
                      <Text style={[styles.skillsSectionTitle, { color: '#FFFFFF' }]}>{t('profile.progress.skills_assessment')}</Text>
                      <View style={styles.skillsGridHorizontal}>
                        <View style={styles.skillColumn}>
                          {[
                            { key: 'pronunciation', label: t('profile.progress.skill_pronunciation'), icon: 'mic', score: plan.assessment_data.pronunciation.score },
                            { key: 'grammar', label: t('profile.progress.skill_grammar'), icon: 'book', score: plan.assessment_data.grammar.score },
                            { key: 'vocabulary', label: t('profile.progress.skill_vocabulary'), icon: 'text', score: plan.assessment_data.vocabulary.score },
                          ].map((skill) => (
                            <View key={skill.key} style={[
                              styles.skillCardHorizontal,
                              {
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderColor: 'rgba(255, 255, 255, 0.25)',
                              }
                            ]}>
                              <View style={[styles.skillIconHorizontal, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                <Ionicons name={skill.icon as any} size={18} color="#FFFFFF" />
                              </View>
                              <View style={styles.skillInfo}>
                                <Text style={[styles.skillLabelHorizontal, { color: '#FFFFFF' }]}>{skill.label}</Text>
                                <Text style={[styles.skillScoreHorizontal, { color: '#FFFFFF' }]}>
                                  {skill.score}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                        <View style={styles.skillColumn}>
                          {[
                            { key: 'fluency', label: t('profile.progress.skill_fluency'), icon: 'chatbubbles', score: plan.assessment_data.fluency.score },
                            { key: 'coherence', label: t('profile.progress.skill_coherence'), icon: 'git-merge', score: plan.assessment_data.coherence.score },
                          ].map((skill) => (
                            <View key={skill.key} style={[
                              styles.skillCardHorizontal,
                              {
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderColor: 'rgba(255, 255, 255, 0.25)',
                              }
                            ]}>
                              <View style={[styles.skillIconHorizontal, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                <Ionicons name={skill.icon as any} size={18} color="#FFFFFF" />
                              </View>
                              <View style={styles.skillInfo}>
                                <Text style={[styles.skillLabelHorizontal, { color: '#FFFFFF' }]}>{skill.label}</Text>
                                <Text style={[styles.skillScoreHorizontal, { color: '#FFFFFF' }]}>
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
                    <View style={[
                      styles.currentWeekSection,
                      {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }
                    ]}>
                      <View style={styles.currentWeekHeader}>
                        <Text style={[styles.currentWeekLabel, { color: '#FFFFFF' }]}>{t('profile.progress.current_focus')} • {t('profile.progress.week', { week: currentWeek })}</Text>
                      </View>
                      <Text style={[styles.currentWeekFocus, { color: '#FFFFFF' }]}>
                        {plan.plan_content.weekly_schedule[currentWeek - 1].focus}
                      </Text>
                      <View style={styles.currentWeekActivities}>
                        {plan.plan_content.weekly_schedule[currentWeek - 1].activities.slice(0, 3).map((activity, index) => (
                          <View key={index} style={styles.activityRow}>
                            <View style={[styles.activityBullet, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={[styles.activityRowText, { color: '#FFFFFF' }]}>{activity}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Weekly Schedule Preview */}
                  {plan.plan_content.weekly_schedule && (
                    <View style={styles.weeklyScheduleSection}>
                      <Text style={[styles.weeklyScheduleTitle, { color: '#FFFFFF' }]}>{t('profile.progress.schedule')}</Text>
                      <View style={styles.weeksList}>
                        {plan.plan_content.weekly_schedule.slice(0, 4).map((week) => {
                          const isCurrentWeek = week.week === currentWeek;
                          const isCompleted = week.week < currentWeek;

                          return (
                            <View
                              key={week.week}
                              style={[
                                styles.weekItem,
                                {
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  borderColor: 'rgba(255, 255, 255, 0.25)',
                                },
                                isCurrentWeek && [
                                  styles.weekItemCurrent,
                                  {
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    borderColor: '#FFFFFF',
                                    shadowColor: '#FFFFFF',
                                  },
                                ],
                                isCompleted && [
                                  styles.weekItemCompleted,
                                  {
                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                    borderColor: '#10B981',
                                  }
                                ],
                              ]}
                            >
                              <View style={styles.weekItemHeader}>
                                <Text style={[
                                  styles.weekItemNumber,
                                  { color: '#FFFFFF' },
                                ]}>
                                  {t('profile.progress.week', { week: week.week })}
                                </Text>
                                {isCurrentWeek && (
                                  <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>{t('profile.progress.now')}</Text>
                                  </View>
                                )}
                                {isCompleted && (
                                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                                )}
                              </View>
                              <Text style={[
                                styles.weekItemFocus,
                                { color: 'rgba(255, 255, 255, 0.9)' }
                              ]} numberOfLines={2}>
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

    // Solid background colors that work well with white text - Modern & Harmonious
    const bgColor = isLearningPlan ? '#EC4899' : '#6366F1'; // Pink for LP, Indigo for Practice
    const iconName = isLearningPlan ? 'school' : 'fitness';

    return (
      <View style={[
        styles.flashcardCard,
        { backgroundColor: bgColor }
      ]}>
        {/* Category Badge */}
        <View style={[
          styles.flashcardCategoryBadge,
          { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }
        ]}>
          <Ionicons name={iconName} size={11} color="#FFFFFF" />
          <Text style={[styles.flashcardCategoryText, { color: '#FFFFFF' }]}>
            {isLearningPlan ? t('profile.flashcards.category_learning_plan') : t('profile.flashcards.category_practice')}
          </Text>
        </View>

        <View style={styles.flashcardCardHeader}>
          <View style={[
            styles.flashcardCardIcon,
            { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', shadowColor: '#000' }
          ]}>
            <Ionicons name={iconName} size={28} color="#FFFFFF" />
          </View>
          <View style={styles.flashcardCardInfo}>
            <Text style={[styles.flashcardCardTitle, { color: '#FFFFFF' }]} numberOfLines={2}>{item.title}</Text>
            <Text style={[styles.flashcardCardMeta, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {t('profile.flashcards.cards_count', { count: item.total_cards })}
            </Text>
          </View>
        </View>
        <Text style={[styles.flashcardCardDescription, { color: 'rgba(255, 255, 255, 0.9)' }]} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={[
            styles.flashcardStudyButton,
            {
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: '#FFFFFF',
              borderRadius: 20,
            }
          ]}
          onPress={() => openFlashcardViewer(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle" size={20} color="#FFFFFF" />
          <Text style={[styles.flashcardStudyButtonText, { color: '#FFFFFF' }]}>{t('flashcards.button_study')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFlashcardsTab = () => {
    // Filter flashcard sets based on selected filter
    const filteredFlashcards = flashcardSets.filter((set) => {
      if (flashcardFilter === 'practice') {
        // Practice flashcards: session_id does NOT start with "learning_plan"
        return !set.session_id.startsWith('learning_plan');
      }

      if (flashcardFilter === 'learning_plan') {
        // Learning plan flashcards: session_id STARTS with "learning_plan"
        return set.session_id.startsWith('learning_plan');
      }

      return false;
    });

    // Debug logging
    console.log(`🔍 Filter: ${flashcardFilter}, Total: ${flashcardSets.length}, Filtered: ${filteredFlashcards.length}`);

    return (
      <View style={styles.flashcardsContainer}>
        {/* iOS-style segmented control filter - Only Practice and Learning Plan */}
        <View style={styles.flashcardFilterContainer}>
          <View style={styles.flashcardFilterSegment}>
            <TouchableOpacity
              style={[
                styles.flashcardFilterButton,
                { borderColor: '#6366F1' },
                flashcardFilter === 'practice' && [
                  styles.flashcardFilterButtonActive,
                  { backgroundColor: '#6366F1', shadowColor: '#6366F1' },
                ],
              ]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFlashcardFilter('practice');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.flashcardFilterButtonText,
                  { color: flashcardFilter === 'practice' ? '#FFFFFF' : '#6366F1' },
                  flashcardFilter === 'practice' && styles.flashcardFilterButtonTextActive,
                ]}
                numberOfLines={1}
              >
                Practice Sessions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.flashcardFilterButton,
                { borderColor: '#EC4899' },
                flashcardFilter === 'learning_plan' && [
                  styles.flashcardFilterButtonActive,
                  { backgroundColor: '#EC4899', shadowColor: '#EC4899' },
                ],
              ]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFlashcardFilter('learning_plan');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.flashcardFilterButtonText,
                  { color: flashcardFilter === 'learning_plan' ? '#FFFFFF' : '#EC4899' },
                  flashcardFilter === 'learning_plan' && styles.flashcardFilterButtonTextActive,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Learning Plans
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
              {flashcardFilter === 'all'
                ? t('empty_states.no_flashcards')
                : t('profile.flashcards.no_filtered_flashcards', {
                    filter: flashcardFilter === 'practice'
                      ? t('profile.flashcards.filter_practice')
                      : t('profile.flashcards.filter_learning_plan')
                  })
              }
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
          <Text style={styles.unreadBadgeText}>{t('notifications.unread_count', { count: unreadCount })}</Text>
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
                      ? t('notifications.swipe_delete_only')
                      : t('notifications.swipe_instructions')}
                  </Text>
                </TouchableOpacity>
              </Swipeable>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>{t('notifications.empty')}</Text>
        </View>
      )}
    </View>
  );

  // DNA Tab - Show DNA analysis with language selector and inline visualization
  const renderDNATab = () => {
    if (dnaLanguages.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>{t('profile.progress.no_plans')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {t('profile.dna.create_plan_prompt')}
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#0B1A1F' }}>
        {/* Flag Selector with Animated Glow - Very Top */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          paddingHorizontal: 20,
          gap: 10,
          backgroundColor: '#0B1A1F',
        }}>
          {dnaLanguages.map((language) => {
            const FlagComponent = getFlagComponent(language);
            const isSelected = selectedDNALanguage === language;

            // Define glow color for each flag based on its primary color
            const getGlowColor = (lang: string) => {
              switch(lang.toLowerCase()) {
                case 'english': return '#C8102E'; // Red
                case 'spanish': return '#F1BF00'; // Yellow/Gold
                case 'french': return '#0055A4'; // Blue
                case 'german': return '#FFCE00'; // Gold
                case 'dutch': return '#FF6C00'; // Orange
                case 'portuguese': return '#006600'; // Green
                default: return '#14B8A6';
              }
            };

            const glowColor = getGlowColor(language);

            return (
              <View key={language} style={{ position: 'relative' }}>
                {/* Animated Glow Layer - Only for Selected */}
                {isSelected && (
                  <>
                    <View style={{
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: 10,
                      backgroundColor: '#14B8A6',
                      opacity: 0.3,
                      shadowColor: '#14B8A6',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 16,
                    }} />
                    <View style={{
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: 9,
                      backgroundColor: '#14B8A6',
                      opacity: 0.4,
                      shadowColor: '#14B8A6',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 12,
                    }} />
                  </>
                )}

                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedDNALanguage(language);
                  }}
                  style={{
                    width: 56,
                    height: 40,
                    borderRadius: 8,
                    overflow: 'hidden',
                    borderWidth: isSelected ? 3 : 1.5,
                    borderColor: isSelected ? '#14B8A6' : 'rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: isSelected ? '#14B8A6' : glowColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: isSelected ? 0.8 : 0.3,
                    shadowRadius: isSelected ? 16 : 6,
                    elevation: isSelected ? 10 : 3,
                  }}
                  activeOpacity={0.7}
                >
                  {FlagComponent ? (
                    <FlagComponent width={52} height={36} />
                  ) : (
                    <Ionicons name="flag" size={24} color="#6B8A84" />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* DNA Content Area */}
        <View style={{ flex: 1 }}>
          {loadingDNA ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color="#14B8A6" />
              <Text style={{ fontSize: 14, color: '#8CA5A0', marginTop: 16, textAlign: 'center' }}>
                {t('profile.dna.loading', { language: selectedDNALanguage })}
              </Text>
            </View>
          ) : dnaProfile ? (
            // Show DNA visualization inline
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Compact Header */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B8A84', letterSpacing: 0.5, marginBottom: 4 }}>
                      {t('profile.dna.analysis_title')}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#14B8A6', textTransform: 'capitalize' }}>
                      {selectedDNALanguage}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.15)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(20, 184, 166, 0.3)',
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#14B8A6' }}>
                      {t('profile.dna.strands_count')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* DNA Strands - Grid Layout 2x3 */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {[
                  { name: t('profile.dna.strand_confidence'), key: 'confidence', icon: 'shield-checkmark', color: '#6366F1', accessor: (p: any) => (p.dna_strands?.confidence?.score || 0) * 100 },
                  { name: t('profile.dna.strand_vocabulary'), key: 'vocabulary', icon: 'book', color: '#8B5CF6', accessor: (p: any) => (p.dna_strands?.vocabulary?.new_word_attempt_rate || 0) * 100 },
                  { name: t('profile.dna.strand_accuracy'), key: 'accuracy', icon: 'checkmark-circle', color: '#EC4899', accessor: (p: any) => (p.dna_strands?.accuracy?.grammar_accuracy || 0) * 100 },
                  { name: t('profile.dna.strand_rhythm'), key: 'rhythm', icon: 'pulse', color: '#F59E0B', accessor: (p: any) => (p.dna_strands?.rhythm?.consistency_score || 0) * 100 },
                  { name: t('profile.dna.strand_learning'), key: 'learning', icon: 'school', color: '#10B981', accessor: (p: any) => (p.dna_strands?.learning?.challenge_acceptance || 0) * 100 },
                  { name: t('profile.dna.strand_emotional'), key: 'emotional', icon: 'heart', color: '#EF4444', accessor: (p: any) => ((p.dna_strands?.emotional?.session_start_confidence || 0) + (p.dna_strands?.emotional?.session_end_confidence || 0)) / 2 * 100 },
                ].map((strand) => {
                  const value = strand.accessor(dnaProfile);
                  const normalizedValue = Math.min(Math.max(value, 0), 100);

                  return (
                    <View key={strand.key} style={{
                      width: 'calc(50% - 6px)',
                      backgroundColor: 'rgba(26, 47, 58, 0.4)',
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: `${strand.color}30`,
                      alignItems: 'center',
                    }}>
                      {/* Circle Progress Ring */}
                      <View style={{ position: 'relative', width: 70, height: 70, marginBottom: 12 }}>
                        <View style={{
                          position: 'absolute',
                          width: 70,
                          height: 70,
                          borderRadius: 35,
                          borderWidth: 6,
                          borderColor: `${strand.color}20`,
                        }} />
                        <View style={{
                          position: 'absolute',
                          width: 70,
                          height: 70,
                          borderRadius: 35,
                          borderWidth: 6,
                          borderColor: strand.color,
                          borderRightColor: 'transparent',
                          borderBottomColor: normalizedValue > 25 ? strand.color : 'transparent',
                          borderLeftColor: normalizedValue > 50 ? strand.color : 'transparent',
                          borderTopColor: normalizedValue > 75 ? strand.color : 'transparent',
                          transform: [{ rotate: '-90deg' }],
                        }} />
                        <View style={{
                          position: 'absolute',
                          width: 70,
                          height: 70,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Ionicons name={strand.icon as any} size={24} color={strand.color} />
                        </View>
                      </View>

                      {/* Score */}
                      <Text style={{ fontSize: 24, fontWeight: '800', color: strand.color, marginBottom: 4 }}>
                        {Math.round(normalizedValue)}
                      </Text>

                      {/* Name */}
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' }}>
                        {strand.name}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* View Full Analysis Button - Immersive */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  navigation.navigate('SpeakingDNA', { language: selectedDNALanguage });
                }}
                style={{
                  backgroundColor: '#14B8A6',
                  borderRadius: 16,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginTop: 20,
                  shadowColor: '#14B8A6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 }}>
                  {t('profile.dna.view_full_analysis')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
          ) : isDNAPremium === false ? (
            // Free user — premium upsell
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 2,
                borderColor: 'rgba(139, 92, 246, 0.3)',
              }}>
                <Ionicons name="lock-closed" size={44} color="#8B5CF6" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>
                {t('profile.dna.premium_title', 'Speaking DNA')}
              </Text>
              <Text style={{ fontSize: 14, color: '#8CA5A0', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
                {t('profile.dna.premium_description', 'Unlock your personalised Speaking DNA analysis. Upgrade to a premium plan to see your pronunciation, grammar, vocabulary and fluency patterns.')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Subscription')}
                style={{
                  backgroundColor: '#8B5CF6',
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                  {t('profile.dna.upgrade_button', 'Upgrade to Premium')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Premium user — no DNA data yet for this language
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 2,
                borderColor: 'rgba(20, 184, 166, 0.2)',
              }}>
                <Ionicons name="analytics-outline" size={50} color="#6B8A84" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>
                {t('profile.dna.no_data')}
              </Text>
              <Text style={{ fontSize: 14, color: '#8CA5A0', textAlign: 'center', lineHeight: 20 }}>
                {t('profile.dna.complete_assessment_prompt', { language: selectedDNALanguage })}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <TransitionWrapper isLoading={loading} loadingMessage={t('profile.loading_message')}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        {/* Header with Welcome Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerWelcome}>{t('profile.header.welcome_back')}</Text>
              <Text style={styles.headerName}>{user?.name || t('profile.header.default_user')}</Text>
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
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'overview' ? 'grid' : 'grid-outline'}
                size={22}
                color={activeTab === 'overview' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>{t('profile.tabs.overview')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
              onPress={() => handleTabPress('progress')}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'progress' ? 'rocket' : 'rocket-outline'}
                size={22}
                color={activeTab === 'progress' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'flashcards' && styles.tabActive]}
              onPress={() => handleTabPress('flashcards')}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'flashcards' ? 'albums' : 'albums-outline'}
                size={22}
                color={activeTab === 'flashcards' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'flashcards' && styles.tabTextActive]}>{t('profile.tabs.cards')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'dna' && styles.tabActive]}
              onPress={() => handleTabPress('dna')}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'dna' ? 'analytics' : 'analytics-outline'}
                size={22}
                color={activeTab === 'dna' ? '#14B8A6' : '#6B8A84'}
              />
              <Text style={[styles.tabText, activeTab === 'dna' && styles.tabTextActive]}>{t('profile.tabs.dna')}</Text>
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

          {/* DNA Page */}
          <View style={styles.page}>
            <ScrollView
              style={styles.pageContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" colors={['#14B8A6']} />
              }
            >
              {renderDNATab()}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Flashcard Modal */}
        <Modal
          visible={showFlashcardViewer}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={closeFlashcardViewer}
          statusBarTranslucent
        >
          <View style={styles.flashcardModalContainer}>
            <View style={styles.flashcardModalHeader}>
              <TouchableOpacity
                onPress={closeFlashcardViewer}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color="#EF4444" />
              </TouchableOpacity>
              <View style={styles.flashcardModalTitleContainer}>
                <Text style={styles.flashcardModalTitle} numberOfLines={1}>
                  {selectedFlashcardSet?.title || t('flashcards.title')}
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
                accentColor={flashcardViewerColor}
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
