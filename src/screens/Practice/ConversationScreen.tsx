import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { LearningService, ProgressService, LearningPlan, BackgroundAnalysisResponse, AuthenticationService, GuestService, GuestAnalysisResponse } from '../../api/generated';
import { SentenceForAnalysis } from '../../api/generated/models/SaveConversationRequest';
import { RealtimeService } from '../../services/RealtimeService';
import SessionSummaryModal, { SavingStage } from '../../components/SessionSummaryModal';
import { SessionStats, SessionComparison, OverallProgress } from '../../types/progressStats';
import ConversationHelpModal from '../../components/ConversationHelpModal';
import ConversationHelpButton from '../../components/ConversationHelpButton';
import { useConversationHelp } from '../../hooks/useConversationHelp';
import { API_BASE_URL } from '../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// New state-driven animation components
import { useConversationState } from '../../hooks/useConversationState';
import ConversationBackground from '../../components/ConversationBackground';
import AIVisualization from '../../components/AIVisualization';
import AIVoiceAvatar from '../../components/AIVoiceAvatar';
import EnhancedRecordingButton from '../../components/EnhancedRecordingButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConversationScreenProps {
  navigation: any;
  route: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Enhanced Animated Message Component with smooth entrance
interface AnimatedMessageProps {
  message: Message;
  voiceName?: string;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ message, voiceName = 'Alloy' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle glow effect for AI messages
    if (message.role === 'assistant') {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Role indicator badge */}
      <View style={[
        styles.roleBadge,
        message.role === 'user' ? styles.roleBadgeUser : styles.roleBadgeAssistant,
      ]}>
        <Ionicons
          name={message.role === 'user' ? 'person' : 'sparkles'}
          size={12}
          color={message.role === 'user' ? '#14B8A6' : '#8B5CF6'}
        />
        <Text style={[
          styles.roleText,
          message.role === 'user' ? styles.roleTextUser : styles.roleTextAssistant,
        ]}>
          {message.role === 'user' ? 'You' : voiceName.charAt(0).toUpperCase() + voiceName.slice(1)}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.messageBubble,
          message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant,
          message.role === 'assistant' && {
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.25],
            }),
          },
        ]}
      >
        <Text style={[
          styles.messageText,
          message.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant,
        ]}>
          {message.content}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

// Animated Help Button Component
const AnimatedHelpButton: React.FC<{
  isLoading: boolean;
  isReady: boolean;
  onPress: () => void;
  disabled: boolean;
}> = ({ isLoading, isReady, onPress, disabled }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      // Rotating loading animation
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.stopAnimation();
      rotation.setValue(0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isReady && !isLoading) {
      // Pop animation when ready
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isReady, isLoading]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const color = isReady ? '#8B5CF6' : '#D1D5DB';

  return (
    <TouchableOpacity
      style={styles.footerSideButton}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Animated.View
        style={{
          transform: [
            { rotate: isLoading ? rotateInterpolate : '0deg' },
            { scale: scaleAnim },
          ],
        }}
      >
        <Ionicons
          name={isLoading ? 'sync' : 'help-circle'}
          size={24}
          color={color}
        />
      </Animated.View>
      <Text style={[styles.footerButtonText, { color }]}>Help</Text>
    </TouchableOpacity>
  );
};

const ConversationScreen: React.FC<ConversationScreenProps> = ({
  navigation,
  route,
}) => {
  const { mode, language, topic, level, planId, customTopicText, researchData } = route.params;

  // Add state for the fetched learning plan
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);

  // Log route params once on mount
  useEffect(() => {
    console.log('[CONVERSATION] 🎬 Component mounted with route params:', {
      mode,
      language,
      topic,
      level,
      planId,
      customTopicText,
      hasResearchData: !!researchData,
    });

    // Log custom topic details if present
    if (topic === 'custom' && customTopicText) {
      console.log('[CONVERSATION] 📝 Custom topic detected:', customTopicText);
      if (researchData) {
        console.log('[CONVERSATION] 🔍 Research data available for custom topic');
      }
    }
  }, []);

  // Log when learning plan changes
  useEffect(() => {
    console.log('[CONVERSATION] 📚 Learning plan state changed:', {
      hasLearningPlan: !!learningPlan,
      language: learningPlan?.language,
      proficiency_level: learningPlan?.proficiency_level,
    });
  }, [learningPlan]);

  // Modal states
  // Show modal immediately for both modes
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

  // Conversation states
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true); // Start in connecting state
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(300); // Default 5 minutes, backend will override
  const [userVoice, setUserVoice] = useState<string>('alloy'); // Track user's selected voice

  // Session saving states
  const [collectedSentences, setCollectedSentences] = useState<SentenceForAnalysis[]>([]);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [savingStage, setSavingStage] = useState<SavingStage>('saving');
  const [backgroundAnalyses, setBackgroundAnalyses] = useState<BackgroundAnalysisResponse[]>([]);
  const [sessionSummary, setSessionSummary] = useState<string>('');
  const [sessionCompletedNaturally, setSessionCompletedNaturally] = useState(false);
  const [autoSavePending, setAutoSavePending] = useState(false);

  // New progress tracking states
  const [sessionStats, setSessionStats] = useState<SessionStats | undefined>(undefined);
  const [sessionComparison, setSessionComparison] = useState<SessionComparison | undefined>(undefined);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | undefined>(undefined);

  // Realtime service ref
  const realtimeServiceRef = useRef<RealtimeService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation for recording button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Countdown animation refs
  const timerPulseAnim = useRef(new Animated.Value(1)).current;
  const timerColorAnim = useRef(new Animated.Value(0)).current;
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const lastBeepSecondRef = useRef(-1);

  // Ref to track if auto-save was triggered
  const autoSaveTriggeredRef = useRef(false);

  // Initialize conversation help system with memoized options to prevent re-renders
  const conversationHelpOptions = useMemo(() => {
    const targetLang = learningPlan?.language || language;
    const profLevel = learningPlan?.proficiency_level || level;

    // Only enable if we have valid required fields
    const hasRequiredFields = !!targetLang && !!profLevel;

    console.log('[CONVERSATION_HELP_OPTIONS] 📋 Creating options:', {
      learningPlanLanguage: learningPlan?.language,
      routeLanguage: language,
      learningPlanLevel: learningPlan?.proficiency_level,
      routeLevel: level,
      targetLang,
      profLevel,
      hasRequiredFields,
      enabled: hasRequiredFields,
    });

    return {
      targetLanguage: targetLang || 'english', // Fallback to prevent undefined
      proficiencyLevel: profLevel || 'beginner', // Fallback to prevent undefined
      topic: planId ? undefined : topic,
      enabled: hasRequiredFields, // Disable until we have valid data
    };
  }, [learningPlan?.language, learningPlan?.proficiency_level, language, level, planId, topic]);

  const conversationHelp = useConversationHelp(conversationHelpOptions);

  // Initialize conversation state machine
  const conversationState = useConversationState();

  // Use refs to ensure event handlers always have latest values
  const conversationHelpOptionsRef = useRef(conversationHelpOptions);
  const learningPlanRef = useRef(learningPlan);
  const conversationHelpRef = useRef(conversationHelp);
  const conversationStateRef = useRef(conversationState);

  // Keep refs in sync with latest values
  useEffect(() => {
    conversationHelpOptionsRef.current = conversationHelpOptions;
  }, [conversationHelpOptions]);

  useEffect(() => {
    learningPlanRef.current = learningPlan;
  }, [learningPlan]);

  useEffect(() => {
    conversationHelpRef.current = conversationHelp;
  }, [conversationHelp]);

  useEffect(() => {
    conversationStateRef.current = conversationState;
  }, [conversationState]);

  // Log when conversation help options change
  useEffect(() => {
    console.log('[CONVERSATION_HELP_OPTIONS] 🔄 Options changed:', conversationHelpOptions);
  }, [conversationHelpOptions]);

  // Retroactively generate help when learning plan loads and there are existing messages
  useEffect(() => {
    if (learningPlan && conversationHelpOptions.enabled && messages.length > 0) {
      console.log('[CONVERSATION_HELP] 🔄 Learning plan loaded, checking for recent AI messages to generate help');

      // Find the most recent assistant message
      const lastAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant');

      if (lastAssistantMessage && lastAssistantMessage.content.trim().length > 0) {
        console.log('[CONVERSATION_HELP] 🔄 Retroactively generating help for last AI message');

        const conversationContext = messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));

        conversationHelp.handleAIResponseComplete(
          lastAssistantMessage.content,
          conversationContext
        );
      }
    }
  }, [learningPlan?.id, conversationHelpOptions.enabled]);

  // Fetch learning plan if planId is provided
  useEffect(() => {
    console.log('[CONVERSATION] 🔍 Checking if we need to fetch plan. planId:', planId);
    if (planId) {
      const fetchPlan = async () => {
        try {
          console.log(`[CONVERSATION] 📥 Fetching learning plan with ID: ${planId}`);
          setIsConnecting(true);
          const plan = await LearningService.getLearningPlanApiLearningPlanPlanIdGet(planId);
          console.log('[CONVERSATION] ✅ Learning plan fetched successfully.');
          console.log('[CONVERSATION] 📊 Plan details:', {
            id: plan.id,
            language: plan.language,
            proficiency_level: plan.proficiency_level,
            hasLanguage: !!plan.language,
            hasProficiency: !!plan.proficiency_level,
          });
          setLearningPlan(plan);
          console.log('[CONVERSATION] 💾 Learning plan saved to state');
          // Learning plan is ready, modal is already showing
          console.log('[CONVERSATION] ✅ Learning plan ready, waiting for user to start');
          setIsConnecting(false);
        } catch (error) {
          console.error('[CONVERSATION] ❌ Error fetching learning plan:', error);
          setConnectionError('Failed to load learning plan details.');
          setIsConnecting(false);
          Alert.alert('Error', 'Could not load the learning plan. Please try again.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      };
      fetchPlan();
    }
    // For practice mode, modal is already shown via initial state
  }, [planId]);


  // Update session duration every second and check for completion (5 minutes)
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(async () => {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionDuration(duration);

      // Update progress bar (0 to 1 over max duration)
      const progress = Math.min(duration / maxDuration, 1);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();

      // Calculate seconds remaining
      const secondsRemaining = maxDuration - duration;

      // Trigger countdown effects for last 10 seconds
      if (secondsRemaining <= 10 && secondsRemaining >= 0) {
        await triggerCountdownEffects(secondsRemaining);
      }

      // Check if max duration completed
      if (duration >= maxDuration && !autoSaveTriggeredRef.current) {
        console.log(`[TIMER] ⏰ ${maxDuration} seconds (${Math.round(maxDuration/60)} minutes) completed - triggering automatic session save`);
        clearInterval(interval);

        // Mark as triggered to prevent double-firing
        autoSaveTriggeredRef.current = true;
        setSessionCompletedNaturally(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Trigger auto-save when session completes naturally
  useEffect(() => {
    if (sessionCompletedNaturally && !autoSavePending) {
      console.log('[TIMER] Triggering automatic session save...');
      setAutoSavePending(true);
      handleAutomaticSessionEnd();
    }
  }, [sessionCompletedNaturally, autoSavePending]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Disconnect realtime service when component unmounts
      if (realtimeServiceRef.current) {
        console.log('[CONVERSATION] Cleaning up realtime service');
        realtimeServiceRef.current.disconnect();
      }
    };
  }, []);

  // Pulse animation for recording button
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play countdown beep sound
  const playBeep = async (isLastSecond = false) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDWK0/DciycGKH3L79KHKwUQar3o6qFSEAg+m3DTLA==' },
        { shouldPlay: true, volume: isLastSecond ? 1.0 : 0.7 }
      );
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('[COUNTDOWN] Error playing beep:', error);
    }
  };

  // Trigger countdown effects (haptics + audio + animations)
  const triggerCountdownEffects = async (secondsRemaining: number) => {
    // Prevent duplicate triggers for same second
    if (lastBeepSecondRef.current === secondsRemaining) return;
    lastBeepSecondRef.current = secondsRemaining;

    console.log(`[COUNTDOWN] ⏰ ${secondsRemaining} seconds remaining`);

    // Haptic feedback (iOS)
    if (Platform.OS === 'ios') {
      if (secondsRemaining === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (secondsRemaining <= 3) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    // Play beep sound
    await playBeep(secondsRemaining === 0);

    // Visual animations
    if (secondsRemaining <= 10) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(timerPulseAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(timerPulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Scale animation (more intense in final 3 seconds)
      const scaleIntensity = secondsRemaining <= 3 ? 1.3 : 1.15;
      Animated.spring(timerScaleAnim, {
        toValue: scaleIntensity,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(timerScaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });

      // Color animation (interpolate from teal → yellow → red)
      Animated.timing(timerColorAnim, {
        toValue: 10 - secondsRemaining,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Initialize conversation when modal is dismissed (works for both practice and learning plan modes)
  const handleStartPracticeConversation = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // For learning plan mode, wait for plan to load if still loading
    if (planId) {
      if (!learningPlan && isConnecting) {
        console.log('[CONVERSATION] ⏳ Plan still loading, please wait...');
        return; // Don't close modal yet, plan is still loading
      }

      if (!learningPlan) {
        console.log('[CONVERSATION] ❌ No learning plan loaded');
        Alert.alert('Error', 'Learning plan not loaded. Please try again.');
        return;
      }

      console.log('[CONVERSATION] 🚀 Starting learning plan conversation');
      setShowInfoModal(false);
      await initializeConversation(learningPlan);
    } else {
      console.log('[CONVERSATION] 🚀 Starting practice conversation');
      setShowInfoModal(false);
      await initializeConversation();
    }
  };

  // Initialize the realtime conversation
  const initializeConversation = async (plan: LearningPlan | null = null) => {
    try {
      // Ensure we are in a connecting state
      if (!isConnecting) setIsConnecting(true);
      setConnectionError(null);
  
      const sessionLanguage = plan ? plan.language : language;
      const sessionLevel = plan ? plan.proficiency_level : level;

      // Construct assessment_data with nested learning_plan_data for backend
      const assessmentData = plan ? {
        ...plan.plan_content?.assessment_summary,  // Includes overall_score
        learning_plan_data: {
          id: plan.id,
          completed_sessions: plan.completed_sessions || 0,
          total_sessions: plan.total_sessions || 0,
          session_summaries: plan.session_summaries || [],
          plan_content: plan.plan_content
        }
      } : null;

      console.log(`[CONVERSATION] Initializing WebRTC connection for ${plan ? 'Learning Plan' : 'Practice'}`);
      console.log(`[CONVERSATION] Language: ${sessionLanguage}, Level: ${sessionLevel}`);
      if (assessmentData) {
        console.log('[CONVERSATION] Including assessment data from learning plan with nested learning_plan_data.');
        console.log('[CONVERSATION] Learning plan ID:', plan?.id);
        console.log('[CONVERSATION] Sessions:', `${plan?.completed_sessions || 0}/${plan?.total_sessions || 0}`);
      }

      // Fetch user's preferred voice
      let selectedVoice = 'alloy'; // Default voice
      try {
        const voicePreference = await AuthenticationService.getVoicePreferenceApiAuthGetVoiceGet();
        if (voicePreference && typeof voicePreference === 'object' && 'voice' in voicePreference && voicePreference.voice) {
          selectedVoice = (voicePreference as any).voice;
          console.log(`[CONVERSATION] Using user's preferred voice: ${selectedVoice}`);
        } else {
          console.log('[CONVERSATION] No voice preference found, using default: alloy');
        }
      } catch (voiceError) {
        console.warn('[CONVERSATION] Could not fetch voice preference, using default:', voiceError);
      }

      // Update state with selected voice
      setUserVoice(selectedVoice);

      // Create and configure RealtimeService
      realtimeServiceRef.current = new RealtimeService({
        language: sessionLanguage,
        level: sessionLevel,
        topic: plan ? null : topic, // Topic is only for practice mode
        assessmentData: assessmentData || undefined,
        voice: selectedVoice,
        userPrompt: topic === 'custom' ? customTopicText : undefined,
        researchData: topic === 'custom' && researchData ? JSON.stringify(researchData) : undefined,
        onTranscript: (transcript: string, role: 'user' | 'assistant') => {
          console.log('[CONVERSATION] Transcript received:', role, transcript);
          addMessage(role, transcript);
        },
        onError: (error: Error) => {
          console.error('[CONVERSATION] Service error:', error);
          const errorMessage = error.message || 'Connection failed';
          setConnectionError(errorMessage);

          // Show user-friendly error alert
          Alert.alert(
            'Connection Error',
            'Unable to connect to the AI tutor. This might be due to temporary server issues.',
            [
              {
                text: 'Retry',
                onPress: () => {
                  setConnectionError(null);
                  if (planId && learningPlan) {
                    initializeConversation(learningPlan);
                  } else {
                    initializeConversation(null);
                  }
                },
              },
              {
                text: 'Go Back',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        },
        onConnectionStateChange: (state: string) => {
          console.log('[CONVERSATION] Connection state:', state);

          if (state === 'connected') {
            setIsConnecting(false);
            setSessionStartTime(Date.now()); // Start timer on successful connection
            console.log('[CONVERSATION] Ready for conversation');
          } else if (state === 'failed' || state === 'disconnected') {
            setIsConnecting(false);
            if (state === 'failed') {
              setConnectionError('Connection failed. Please try again.');
            }
          }
        },
        onSessionConfigReceived: (config) => {
          console.log('[CONVERSATION] 📋 Session config received from backend:',{
            maxDuration: config.max_duration_seconds,
            isGuest: config.is_guest,
            durationMinutes: config.duration_minutes,
          });
          // Update max duration with backend-provided value
          setMaxDuration(config.max_duration_seconds);
        },
        onEvent: (event) => {
          console.log('[CONVERSATION] Event:', event.type);
          // Pass events to conversation state machine
          conversationStateRef.current.handleRealtimeEvent(event);
        },
      });

      // Connect to OpenAI Realtime API via WebRTC
      await realtimeServiceRef.current.connect();

      // Start with microphone muted - user must press button to speak
      realtimeServiceRef.current.setMuted(true);
      console.log('[CONVERSATION] Initial state: microphone muted');

    } catch (error: any) {
      console.error('[CONVERSATION] Error initializing:', error);
      setConnectionError(error.message || 'Failed to connect');
      setIsConnecting(false);

      Alert.alert(
        'Connection Error',
        'Failed to start a conversation. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => initializeConversation(plan),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  // Add a message to the conversation
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];

      // Collect user sentences for analysis (max 5)
      if (role === 'user' && content.trim().length > 5 && collectedSentences.length < 5) {
        const qualityScore = calculateQualityScore(content);

        // Only collect if quality score is high enough (> 30)
        if (qualityScore > 30) {
          const sentenceForAnalysis: SentenceForAnalysis = {
            text: content,
            timestamp: newMessage.timestamp,
            messageIndex: updated.filter(m => m.role === 'user').length - 1,
            qualityScore,
          };

          setCollectedSentences(prevSentences => {
            const newSentences = [...prevSentences, sentenceForAnalysis];

            // Keep only top 5 by quality score
            if (newSentences.length > 5) {
              return newSentences.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0)).slice(0, 5);
            }

            return newSentences;
          });
        }
      }

      // Trigger conversation help when AI responds
      if (role === 'assistant') {
        // Use refs to get the LATEST values (avoid closure issue)
        const latestOptions = conversationHelpOptionsRef.current;
        const latestLearningPlan = learningPlanRef.current;
        const latestConversationHelp = conversationHelpRef.current;

        console.log('[CONVERSATION_HELP] 🎯 AI message received');
        console.log('[CONVERSATION_HELP] 📝 Content length:', content.trim().length);
        console.log('[CONVERSATION_HELP] ⚙️ Help enabled (from helpSettings - USER PREFERENCE):', latestConversationHelp.helpSettings.help_enabled);
        console.log('[CONVERSATION_HELP] ⚙️ Help enabled (from options - HAS VALID DATA):', latestOptions.enabled);
        console.log('[CONVERSATION_HELP] ⚙️ Has learningPlan (via REF):', !!latestLearningPlan);
        console.log('[CONVERSATION_HELP] ⚙️ Target language (via REF):', latestOptions.targetLanguage);
        console.log('[CONVERSATION_HELP] ⚙️ Proficiency level (via REF):', latestOptions.proficiencyLevel);
        console.log('[CONVERSATION_HELP] 🔍 Help settings:', latestConversationHelp.helpSettings);

        // Check BOTH: user wants help AND we have valid data
        const shouldGenerateHelp = content.trim().length > 0 &&
                                  latestOptions.enabled &&
                                  latestConversationHelp.helpSettings.help_enabled;
        console.log('[CONVERSATION_HELP] 🔍 Should generate help:', shouldGenerateHelp);

        if (shouldGenerateHelp) {
          console.log('[CONVERSATION_HELP] ✅ Conditions met, triggering help generation');
          // Convert messages to the format expected by conversation help
          const conversationContext = updated.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }));
          latestConversationHelp.handleAIResponseComplete(content, conversationContext);
        } else {
          console.log('[CONVERSATION_HELP] ❌ Conditions not met, skipping help generation');
        }
      }

      return updated;
    });

    // Scroll to bottom after adding message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Calculate quality score for a sentence
  const calculateQualityScore = (text: string): number => {
    let score = 50; // Base score

    // Length bonus (prefer longer, more complete sentences)
    if (text.length > 20) score += 15;
    if (text.length > 50) score += 15;

    // Word count (prefer multi-word sentences)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 5) score += 10;
    if (wordCount >= 10) score += 10;

    return score;
  };

  // Toggle recording state (mute/unmute microphone)
  const handleToggleRecording = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!realtimeServiceRef.current) {
      console.warn('[CONVERSATION] Service not initialized');
      return;
    }

    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);

    // Update conversation state machine
    conversationState.setUserSpeaking(newRecordingState);

    // Keep conversation help visible while recording so user can read suggestions
    // Only close the modal if it's open, but keep the button visible
    if (newRecordingState && conversationHelp.isModalVisible) {
      console.log('[CONVERSATION_HELP] User started speaking, closing modal but keeping help button visible');
      conversationHelp.closeHelpModal();
    }

    // Mute/unmute the microphone
    realtimeServiceRef.current.setMuted(!newRecordingState);

    console.log('[CONVERSATION]', newRecordingState ? 'Microphone active' : 'Microphone muted');
  };

  // Manual end session (user clicks End button) - NO SAVING
  const handleEndSession = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // If session already completed naturally, just navigate away
    if (sessionCompletedNaturally) {
      console.log('[CONVERSATION] Session already completed - navigating to dashboard');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
      });
      return;
    }

    setShowEndSessionModal(true);
  };

  // Confirm manual early end - just disconnect without saving
  const handleConfirmEndSession = async () => {
    try {
      setShowEndSessionModal(false);

      // Check if user is guest
      const authToken = await AsyncStorage.getItem('auth_token');
      const isGuest = !authToken;

      // Disconnect realtime service
      if (realtimeServiceRef.current) {
        console.log('[MANUAL_END] User ended session early - disconnecting without saving');
        await realtimeServiceRef.current.disconnect();
        realtimeServiceRef.current = null;
      }

      // Navigate based on user type
      if (isGuest) {
        console.log('[MANUAL_END] Guest user - navigating to Welcome');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } else {
        console.log('[MANUAL_END] Authenticated user - navigating to Dashboard');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
        });
      }
    } catch (error) {
      console.error('[MANUAL_END] Error disconnecting:', error);

      // Navigate based on user type (even on error)
      const authToken = await AsyncStorage.getItem('auth_token');
      const isGuest = !authToken;

      navigation.reset({
        index: 0,
        routes: isGuest ? [{ name: 'Welcome' }] : [{ name: 'Main', params: { screen: 'Dashboard' } }],
      });
    }
  };

  // Handle guest session end - call guest analysis API
  const handleGuestSessionEnd = async () => {
    try {
      console.log('[GUEST_END] 🎯 Starting guest session analysis...');

      // Show analyzing modal
      setShowSavingModal(true);
      setSavingStage('analyzing');

      // Disconnect realtime service first
      if (realtimeServiceRef.current) {
        console.log('[GUEST_END] Disconnecting realtime service');
        await realtimeServiceRef.current.disconnect();
        realtimeServiceRef.current = null;
      }

      if (messages.length > 0) {
        console.log('[GUEST_END] Analyzing conversation with', collectedSentences.length, 'sentences');

        // Prepare guest analysis request
        const guestAnalysisRequest = {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          duration_minutes: sessionDuration / 60,
          sentences_for_analysis: collectedSentences.map(sentence => ({
            text: sentence.text,
            timestamp: sentence.timestamp,
            messageIndex: sentence.messageIndex,
          })),
          language: language,
          level: level,
          topic: topic || 'general conversation',
        };

        // Call guest analysis API
        const analysis: GuestAnalysisResponse = await GuestService.analyzeGuestSessionApiGuestAnalyzeSessionPost({
          requestBody: guestAnalysisRequest,
        });

        console.log('[GUEST_END] ✅ Guest analysis complete:', analysis);

        // Close saving modal
        setShowSavingModal(false);

        // Navigate to GuestSessionResults screen
        navigation.navigate('GuestSessionResults', {
          analysis: analysis,
        });
      } else {
        // No messages, just navigate back to welcome
        setShowSavingModal(false);
        navigation.navigate('Welcome');
      }
    } catch (error) {
      console.error('[GUEST_END] Error analyzing guest session:', error);

      // Close saving modal
      setShowSavingModal(false);

      // Disconnect service even on error
      if (realtimeServiceRef.current) {
        realtimeServiceRef.current.disconnect();
        realtimeServiceRef.current = null;
      }

      Alert.alert(
        'Analysis Error',
        'Failed to analyze your session. You can still sign up to save your progress!',
        [
          {
            text: 'Sign Up',
            onPress: () => navigation.navigate('Welcome'),
          },
          {
            text: 'Try Again',
            onPress: () => handleGuestSessionEnd(),
          },
        ]
      );
    }
  };

  // Automatic session end when 5 minutes completed - WITH SAVING
  const handleAutomaticSessionEnd = async () => {
    try {
      console.log('[AUTO_END] 💾 Starting automatic session save...');

      // Check if user is guest (no auth token)
      const authToken = await AsyncStorage.getItem('auth_token');
      const isGuest = !authToken;

      console.log('[AUTO_END] User type:', isGuest ? 'GUEST' : 'AUTHENTICATED');

      // Handle guest users differently
      if (isGuest) {
        await handleGuestSessionEnd();
        return;
      }

      // Show saving modal
      setShowSavingModal(true);
      setSavingStage('saving');

      // Disconnect realtime service first
      if (realtimeServiceRef.current) {
        console.log('[AUTO_END] Disconnecting realtime service');
        await realtimeServiceRef.current.disconnect();
        realtimeServiceRef.current = null;
      }

      console.log('[AUTO_END] Saving conversation with', collectedSentences.length, 'sentences for analysis');

      // Save conversation progress
      if (messages.length > 0) {
        // Transition to analyzing stage
        await new Promise(resolve => setTimeout(resolve, 600));
        setSavingStage('analyzing');

        let result: any;

        if (planId) {
          // New logic for learning plan sessions
          console.log('[AUTO_END] Saving learning plan session via new endpoint...');
          const token = await AsyncStorage.getItem('auth_token');
          const summaryText = `Session completed: ${Math.round(sessionDuration / 60 * 10) / 10} minutes, ${messages.length} messages exchanged. Focus: general conversation at ${learningPlan?.proficiency_level} level in ${learningPlan?.language}.`;
          
          const response = await fetch(`${API_BASE_URL}/api/learning/session-summary?plan_id=${planId}&session_summary=${encodeURIComponent(summaryText)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
              })),
              duration_minutes: sessionDuration / 60,
              language: learningPlan?.language || language,
              level: learningPlan?.proficiency_level || level,
              sentences_for_analysis: collectedSentences.length > 0 ? collectedSentences : null,
            }),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${errorBody}`);
          }

          result = await response.json();

        } else {
          // Original logic for practice sessions
          console.log('[AUTO_END] Saving practice session via original endpoint...');
          result = await ProgressService.saveConversationApiProgressSaveConversationPost({
            requestBody: {
              language: language,
              level: level,
              topic: topic || null,
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
              })),
              duration_minutes: sessionDuration / 60,
              learning_plan_id: null,
              conversation_type: 'practice',
              sentences_for_analysis: collectedSentences.length > 0 ? collectedSentences : null,
            },
          });
        }

        console.log('[AUTO_END] Session saved successfully:', result);

        // Store the results (compatible with both responses)
        console.log('[AUTO_END] 🔍 Full result:', JSON.stringify(result, null, 2));
        console.log('[AUTO_END] 🔍 Background analyses:', result.background_analyses);
        console.log('[AUTO_END] 🔍 Analyses length:', result.background_analyses?.length);

        if (result.background_analyses && result.background_analyses.length > 0) {
          console.log('[AUTO_END] ✅ Received', result.background_analyses.length, 'analyses');
          setBackgroundAnalyses(result.background_analyses);
        } else {
          console.log('[AUTO_END] ⚠️ No background analyses in response!');
          console.log('[AUTO_END] 🔍 Collected sentences:', collectedSentences);
        }

        // Store new progress tracking data
        if (result.session_stats) {
          console.log('[AUTO_END] Received session stats:', result.session_stats);
          setSessionStats(result.session_stats);
        }
        if (result.comparison) {
          console.log('[AUTO_END] Received comparison data:', result.comparison);
          setSessionComparison(result.comparison);
        }
        if (result.overall_progress) {
          console.log('[AUTO_END] Received overall progress:', result.overall_progress);

          // Calculate plan-specific total minutes
          // For learning plans, we calculate by multiplying completed sessions by current session duration
          // This is an approximation since sessions may vary in length
          let planTotalMinutes = result.overall_progress.total_minutes;

          if (planId && result.overall_progress.plan_completed_sessions && result.session_stats) {
            // Use current session duration as estimate for all sessions
            const avgDuration = result.session_stats.duration_minutes || 5;
            planTotalMinutes = result.overall_progress.plan_completed_sessions * avgDuration;
            console.log('[AUTO_END] 📊 Calculated plan-specific minutes:', planTotalMinutes);
            console.log('[AUTO_END] 📊 Formula: sessions × duration =',
              result.overall_progress.plan_completed_sessions, '×', avgDuration);
          }

          setOverallProgress({
            ...result.overall_progress,
            plan_total_minutes: planTotalMinutes,
          });
        }

        // The new endpoint doesn't return a summary, so we generate it client-side for the modal
        if (planId) {
          const summaryText = `Session completed: ${Math.round(sessionDuration / 60 * 10) / 10} minutes, ${messages.length} messages exchanged.`;
          setSessionSummary(summaryText);
        } else if (result.summary) {
          setSessionSummary(result.summary);
        }

        // Transition to finalizing stage
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSavingStage('finalizing');

        // Transition to success stage
        await new Promise(resolve => setTimeout(resolve, 800));
        setSavingStage('success');
      } else {
        // No messages, just navigate back
        setShowSavingModal(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
        });
      }
    } catch (error) {
      console.error('[AUTO_END] Error saving session:', error);

      // Close saving modal
      setShowSavingModal(false);

      // Disconnect service even on error
      if (realtimeServiceRef.current) {
        realtimeServiceRef.current.disconnect();
        realtimeServiceRef.current = null;
      }

      Alert.alert(
        'Save Error',
        'Failed to save your session. Do you want to try again or exit anyway?',
        [
          {
            text: 'Try Again',
            onPress: () => handleAutomaticSessionEnd(),
          },
          {
            text: 'Exit Anyway',
            style: 'destructive',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
              });
            },
          },
        ]
      );
    }
  };

  // Handle viewing analysis after session save
  const handleViewAnalysis = () => {
    setShowSavingModal(false);

    // Check if we have analyses to show
    if (backgroundAnalyses && backgroundAnalyses.length > 0) {
      // Navigate to Sentence Analysis screen
      navigation.navigate('SentenceAnalysis', {
        analyses: backgroundAnalyses,
        sessionSummary: sessionSummary,
        duration: formatDuration(sessionDuration),
        messageCount: messages.filter(m => m.role === 'user').length,
      });
    } else {
      // If no analyses available, show alert and go to dashboard
      Alert.alert(
        'No Analysis Available',
        'No sentences were analyzed during this session. This can happen if the conversation was too short or no quality sentences were detected.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
              });
            },
          },
        ]
      );
    }
  };

  // Handle go to dashboard after session save
  const handleGoDashboard = () => {
    setShowSavingModal(false);

    // Navigate back to dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
    });
  };

  const screenLanguage = learningPlan?.language || language;

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle Static Background - Clean, minimal */}
      <ConversationBackground />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {learningPlan && (learningPlan.status === 'awaiting_final_assessment' || learningPlan.status === 'failed_assessment')
              ? `Final Assessment - ${screenLanguage?.charAt(0).toUpperCase()}${screenLanguage?.slice(1)} ${learningPlan.proficiency_level || ''}`
              : screenLanguage
                ? `${screenLanguage.charAt(0).toUpperCase() + screenLanguage.slice(1)} Practice`
                : 'Conversation'}
          </Text>
        </View>

        {/* AI Voice Avatar with animated rings in top-right corner */}
        <View style={styles.headerAIBlob}>
          <AIVoiceAvatar
            voice={userVoice}
            state={conversationState.currentState}
            size={40}
          />
        </View>
      </View>

      {/* Timer Badge - Clean design below header */}
      {sessionStartTime && (
        <View style={styles.timerBadgeContainer}>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={16} color="#14B8A6" />
            <Text style={styles.timerText}>{formatDuration(sessionDuration)}</Text>
            <Text style={styles.timerLabel}>/ {formatDuration(maxDuration)}</Text>
          </View>
        </View>
      )}

      {/* Progress Bar - Visual time indicator */}
      {sessionStartTime && (
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: progressAnim.interpolate({
                  inputRange: [0, 0.6, 0.9, 1],
                  outputRange: ['#14B8A6', '#F59E0B', '#F59E0B', '#EF4444'],
                }),
              },
            ]}
          />
        </View>
      )}

      {/* Floating Countdown Overlay (appears in last 10 seconds) */}
      {sessionStartTime && (
        <AnimatedCountdownTimer
          duration={sessionDuration}
          maxDuration={maxDuration}
          pulseAnim={timerPulseAnim}
          colorAnim={timerColorAnim}
          scaleAnim={timerScaleAnim}
          formatDuration={formatDuration}
        />
      )}

      {/* Conversation Transcript */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isConnecting ? (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.connectingText}>
              {planId ? 'Loading your learning plan...' : 'Connecting to AI tutor...'}
            </Text>
          </View>
        ) : connectionError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{connectionError}</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            {/* Large AI Visualization - Shows state visually (only when empty) */}
            <View style={styles.aiVisualizationContainer}>
              <AIVisualization state={conversationState.currentState} size={120} />
            </View>
            <Text style={styles.emptyTitle}>Ready to start</Text>
            <Text style={styles.emptyText}>
              Tap the microphone button below to begin speaking
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <AnimatedMessage key={message.id} message={message} voiceName={userVoice} />
          ))
        )}
      </ScrollView>

      {/* Footer with Help, Microphone, and End buttons */}
      <View style={styles.footerContainer}>
        {/* Animated Help Button - Left */}
        {conversationHelp.helpSettings.help_enabled &&
        (conversationHelp.isHelpReady || conversationHelp.isLoading) &&
        messages.length > 0 ? (
          <AnimatedHelpButton
            isLoading={conversationHelp.isLoading}
            isReady={conversationHelp.isHelpReady}
            onPress={conversationHelp.showHelpModal}
            disabled={false}
          />
        ) : (
          <View style={[styles.footerSideButton, { opacity: 0 }]}>
            <Ionicons name="help-circle" size={24} color="transparent" />
            <Text style={styles.footerButtonText}>Help</Text>
          </View>
        )}

        {/* Enhanced Recording Button - Center */}
        <View style={styles.footerCenterButton}>
          <EnhancedRecordingButton
            isRecording={isRecording}
            onPress={handleToggleRecording}
            disabled={isConnecting}
            conversationState={conversationState.currentState}
          />
        </View>

        {/* Leave Button - Right */}
        <TouchableOpacity
          style={styles.footerSideButton}
          onPress={handleEndSession}
          activeOpacity={0.7}
        >
          <Ionicons name="exit-outline" size={24} color="#EF4444" />
          <Text style={[styles.footerButtonText, { color: '#EF4444' }]}>
            Leave
          </Text>
        </TouchableOpacity>
      </View>

      {/* Important Information Modal (for both practice and learning plan modes) */}
      <Modal
        visible={showInfoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={32} color="#14B8A6" />
              <Text style={styles.modalTitle}>💡 Important Information</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.infoCard}>
                <Ionicons name="volume-high" size={24} color="#3B82F6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Use Headphones</Text>
                  <Text style={styles.infoText}>
                    For best experience, use headphones to prevent audio feedback
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="mic" size={24} color="#10B981" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Speak Clearly</Text>
                  <Text style={styles.infoText}>
                    Speak at a normal pace and volume for accurate recognition
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="time" size={24} color="#F59E0B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Practice Time</Text>
                  <Text style={styles.infoText}>
                    Take your time and enjoy the conversation. There's no rush!
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Natural Conversation</Text>
                  <Text style={styles.infoText}>
                    Engage in natural dialogue. The AI will help you improve as you speak
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowInfoModal(false);
                  navigation.goBack();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonSecondaryText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButtonPrimary,
                  (planId && isConnecting) && styles.modalButtonDisabled
                ]}
                onPress={handleStartPracticeConversation}
                activeOpacity={0.8}
                disabled={planId && isConnecting}
              >
                {planId && isConnecting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Got it! Let's start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Session Modal - Warning for Early Exit */}
      <Modal
        visible={showEndSessionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEndSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.endModalContent}>
            <Ionicons name="warning-outline" size={48} color="#F59E0B" style={{ marginBottom: 16, textAlign: 'center' }} />
            <Text style={styles.endModalTitle}>End Early?</Text>
            <Text style={styles.endModalText}>
              You haven't completed the full {Math.round(maxDuration / 60)}-minute session yet. If you end now, your progress won't be saved and you won't receive analysis or flashcards.
            </Text>

            <View style={styles.endModalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(sessionDuration)}</Text>
                <Text style={styles.statLabel}>Time Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(maxDuration - sessionDuration)}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>

            <View style={styles.endModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEndSessionModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Keep Practicing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmEndButton}
                onPress={handleConfirmEndSession}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmEndButtonText}>End Anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Session Saving Modal */}
      <SessionSummaryModal
        visible={showSavingModal}
        stage={savingStage}
        sentenceCount={collectedSentences.length}
        conversationHighlights={messages
          .filter(m => m.role === 'user')
          .slice(-3)
          .map(m => m.content.substring(0, 100))}
        duration={formatDuration(sessionDuration)}
        messageCount={messages.filter(m => m.role === 'user').length}
        onComplete={() => setShowSavingModal(false)}
        onViewAnalysis={() => {
          console.log('[VIEW_ANALYSIS] 🎯 Button clicked');
          console.log('[VIEW_ANALYSIS] 📊 Background analyses count:', backgroundAnalyses.length);
          console.log('[VIEW_ANALYSIS] 📊 Background analyses:', backgroundAnalyses);
          handleViewAnalysis();
        }}
        onGoDashboard={handleGoDashboard}
        sessionStats={sessionStats}
        comparison={sessionComparison}
        overallProgress={overallProgress}
        hasAnalyses={backgroundAnalyses.length > 0}
      />

      {/* Conversation Help Modal */}
      <ConversationHelpModal
        visible={conversationHelp.isModalVisible}
        helpData={conversationHelp.helpData}
        isLoading={conversationHelp.isLoading}
        targetLanguage={learningPlan?.language || language}
        helpLanguage={conversationHelp.helpSettings.help_language || 'english'}
        helpEnabled={conversationHelp.helpSettings.help_enabled}
        onClose={conversationHelp.closeHelpModal}
        onSelectResponse={(responseText) => {
          // When user selects a suggested response, we could add it to the input
          // For now, just close the modal and let them speak it
          console.log('[CONVERSATION_HELP] User selected response:', responseText);
          conversationHelp.selectSuggestedResponse(responseText);
        }}
        onToggleHelp={(enabled) => {
          console.log('[CONVERSATION_HELP] User toggled help:', enabled);
          conversationHelp.updateHelpSettings({ help_enabled: enabled });
        }}
      />
    </SafeAreaView>
  );
};

// Animated Countdown Timer Component - Modern Floating Design
interface AnimatedCountdownTimerProps {
  duration: number;
  maxDuration: number;
  pulseAnim: Animated.Value;
  colorAnim: Animated.Value;
  scaleAnim: Animated.Value;
  formatDuration: (seconds: number) => string;
}

const AnimatedCountdownTimer: React.FC<AnimatedCountdownTimerProps> = ({
  duration,
  maxDuration,
  pulseAnim,
  colorAnim,
  scaleAnim,
  formatDuration,
}) => {
  const secondsRemaining = maxDuration - duration;
  const isCountingDown = secondsRemaining <= 10 && secondsRemaining >= 0;

  // Color interpolation: gradient colors
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 5, 10],
    outputRange: ['rgba(239, 68, 68, 0.95)', 'rgba(245, 158, 11, 0.95)', 'rgba(20, 184, 166, 0.95)'], // red → orange → teal
  });

  const ringColor = colorAnim.interpolate({
    inputRange: [0, 5, 10],
    outputRange: ['#EF4444', '#F59E0B', '#14B8A6'],
  });

  if (!isCountingDown) {
    // Don't show timer when not in countdown mode
    return null;
  }

  // Countdown mode with modern floating design
  return (
    <Animated.View
      style={[
        styles.floatingCountdownContainer,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.countdownCard,
          {
            backgroundColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Ring */}
        <Animated.View style={[styles.countdownRing, { borderColor: ringColor }]}>
          <View style={styles.countdownContent}>
            {/* Large Countdown Number */}
            <Text style={styles.countdownNumber}>{secondsRemaining}</Text>
            <Text style={styles.countdownLabel}>SECONDS</Text>
          </View>
        </Animated.View>

        {/* Session Ending Message */}
        <Text style={styles.sessionEndingText}>Session Ending...</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Allow animated background to show through
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerAIBlob: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Timer Badge Styles
  timerBadgeContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDFA',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  timerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14B8A6',
    letterSpacing: 0.5,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  // Progress Bar Styles
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 0,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  // Modern End Button Styles
  modernEndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernEndButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Allow animated background gradient to show
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  connectingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  connectingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  aiVisualizationContainer: {
    marginBottom: 24,
  },
  aiVisualizationContainerInline: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  footerSideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  footerCenterButton: {
    flex: 1,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  messageRow: {
    marginBottom: 20,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAssistant: {
    alignItems: 'flex-start',
  },
  // Role Badge Styles
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  roleBadgeUser: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  roleBadgeAssistant: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  roleTextUser: {
    color: '#14B8A6',
  },
  roleTextAssistant: {
    color: '#8B5CF6',
  },
  // Modern Message Bubble Styles
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: '#14B8A6',
    borderBottomRightRadius: 6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageTextAssistant: {
    color: '#1F2937',
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  recordHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  modalBody: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonSecondaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  endModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 100,
  },
  endModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  endModalText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  endModalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  endModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  confirmEndButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmEndButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modern Floating Countdown Timer Styles
  floatingCountdownContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  countdownCard: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  countdownRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
  },
  countdownContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.9,
    marginTop: 4,
  },
  sessionEndingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
    letterSpacing: 0.5,
  },
});

export default ConversationScreen;