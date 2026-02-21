import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { LearningService, ProgressService, LearningPlan, BackgroundAnalysisResponse, AuthenticationService, DefaultService, StripeService } from '../../api/generated';
import { SentenceForAnalysis } from '../../api/generated/models/SaveConversationRequest';
import { RealtimeService } from '../../services/RealtimeService';
import SessionSummaryModal, { SavingStage } from '../../components/SessionSummaryModal';
import { SessionStats, SessionComparison, OverallProgress } from '../../types/progressStats';
import ConversationHelpModal from '../../components/ConversationHelpModal';
import ConversationHelpButton from '../../components/ConversationHelpButton';
import { useConversationHelp } from '../../hooks/useConversationHelp';
import { API_BASE_URL } from '../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmojiText } from '../../components/EmojiText';

// New state-driven animation components
import { useConversationState } from '../../hooks/useConversationState';
import ConversationBackground from '../../components/ConversationBackground';
import AIVoiceAvatar from '../../components/AIVoiceAvatar';
import EnhancedRecordingButton from '../../components/EnhancedRecordingButton';
import { styles, SCREEN_HEIGHT } from './styles/ConversationScreen.styles';

// Speaking DNA integration
import { useSessionMetrics } from '../../hooks/useSessionMetrics';
import { speakingDNAService } from '../../services/SpeakingDNAService';
import { BreakthroughModal } from '../../components/SpeakingDNA/BreakthroughModal';
import { SpeakingBreakthrough } from '../../types/speakingDNA';

// Voice Check integration
import { useVoiceCheckSchedule } from '../../hooks/useVoiceCheckSchedule';
import { VoiceCheckModal } from '../../components/VoiceCheckModal';

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
  const { t } = useTranslation();
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
      {message.role === 'user' ? (
        // User message: Badge on top-right of bubble
        <View style={styles.userMessageContainer}>
          <View style={[styles.roleBadge, styles.roleBadgeUser]}>
            <Ionicons name="person" size={12} color="#14B8A6" />
            <Text style={[styles.roleText, styles.roleTextUser]}>{t('practice.conversation.role_you')}</Text>
          </View>
          <Animated.View
            style={[styles.messageBubble, styles.messageBubbleUser]}
          >
            <EmojiText
              text={message.content}
              style={[styles.messageText, styles.messageTextUser]}
              emojiSize={20}
            />
          </Animated.View>
        </View>
      ) : (
        // Assistant message: Badge above bubble (left side)
        <>
          <View style={[styles.roleBadge, styles.roleBadgeAssistant]}>
            <Ionicons name="sparkles" size={12} color="#8B5CF6" />
            <Text style={[styles.roleText, styles.roleTextAssistant]}>
              {voiceName.charAt(0).toUpperCase() + voiceName.slice(1)}
            </Text>
          </View>
          <Animated.View
            style={[
              styles.messageBubble,
              styles.messageBubbleAssistant,
              {
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.25],
                }),
              },
            ]}
          >
            <EmojiText
              text={message.content}
              style={[styles.messageText, styles.messageTextAssistant]}
              emojiSize={20}
            />
          </Animated.View>
        </>
      )}
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
  const { t } = useTranslation();
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
      <Text style={[styles.footerButtonText, { color }]}>{t('practice.conversation.role_help')}</Text>
    </TouchableOpacity>
  );
};

const ConversationScreen: React.FC<ConversationScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { mode, language, topic, level, planId, customTopicText, researchData, newsContext, sessionType, newsTitle, cardColor } = route.params;

  // Use the card color or default to turquoise
  const modalColor = cardColor || '#14B8A6';

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
      sessionType,
      hasNewsContext: !!newsContext,
    });

    // Log news context details if present
    if (sessionType === 'news' && newsContext) {
      console.log('[CONVERSATION] 📰 NEWS SESSION DETECTED');
      console.log('[CONVERSATION] News context keys:', Object.keys(newsContext));
      console.log('[CONVERSATION] News title:', newsContext.title || 'NO TITLE');
      console.log('[CONVERSATION] News summary length:', newsContext.summary?.length || 0);
    }

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
  const [isConnecting, setIsConnecting] = useState(false); // Don't show spinner until user clicks start
  const [connectionStep, setConnectionStep] = useState<string>('creating_session');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false); // Control spinner via events only
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

  // Final assessment states
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [showAssessmentResults, setShowAssessmentResults] = useState(false);
  const [showCreateNextPlanModal, setShowCreateNextPlanModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null); // NO default - user must select
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]); // Predefined goals (optional)
  const [customGoals, setCustomGoals] = useState<string>('');
  const [creatingPlan, setCreatingPlan] = useState(false);

  // New progress tracking states
  const [sessionStats, setSessionStats] = useState<SessionStats | undefined>(undefined);
  const [sessionComparison, setSessionComparison] = useState<SessionComparison | undefined>(undefined);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | undefined>(undefined);

  // Speaking DNA states
  const [showBreakthroughModal, setShowBreakthroughModal] = useState(false);
  const [currentBreakthrough, setCurrentBreakthrough] = useState<SpeakingBreakthrough | null>(null);
  const [breakthroughQueue, setBreakthroughQueue] = useState<SpeakingBreakthrough[]>([]);

  // Voice Check state
  const [showVoiceCheckModal, setShowVoiceCheckModal] = useState(false);
  const [voiceCheckPrompt, setVoiceCheckPrompt] = useState<any>(null);
  const [pendingNavigation, setPendingNavigation] = useState<'dashboard' | 'analysis' | null>(null);

  // Realtime service ref
  const realtimeServiceRef = useRef<RealtimeService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation for recording button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressPulseAnim = useRef(new Animated.Value(1)).current; // For milestone pulse effect
  const lastMinuteRef = useRef(-1); // Track last minute for milestone animation

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

  // Initialize Speaking DNA metrics tracking
  const dnaSessionId = useMemo(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const dnaSessionType = useMemo(() => {
    if (sessionType === 'news') return 'news' as const;
    if (topic && topic !== 'custom') return 'learning' as const;
    return 'freestyle' as const;
  }, [sessionType, topic]);

  const sessionMetrics = useSessionMetrics({
    sessionId: dnaSessionId,
    sessionType: dnaSessionType,
    debug: __DEV__, // Enable debug logging in development
  });

  // Voice Check schedule management
  const {
    status: voiceCheckStatus,
    completeVoiceCheck,
    skipVoiceCheck,
    refreshStatus: refreshVoiceCheckStatus,
  } = useVoiceCheckSchedule(planId, !!planId); // Only enabled if we have a plan ID

  // Use refs to ensure event handlers always have latest values
  const conversationHelpOptionsRef = useRef(conversationHelpOptions);
  const learningPlanRef = useRef(learningPlan);
  const conversationHelpRef = useRef(conversationHelp);
  const conversationStateRef = useRef(conversationState);
  const sessionMetricsRef = useRef(sessionMetrics);

  // Track user turn timing for DNA metrics
  const userTurnStartTimeRef = useRef<number | null>(null);

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

  useEffect(() => {
    sessionMetricsRef.current = sessionMetrics;
  }, [sessionMetrics]);

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
          Alert.alert(t('practice.conversation.alert_plan_error_title'), t('practice.conversation.alert_load_plan_error'), [
            { text: t('buttons.ok'), onPress: () => navigation.goBack() },
          ]);
        }
      };
      fetchPlan();
    }
    // For practice mode, modal is already shown via initial state
  }, [planId]);

  // Update session duration every second and check for completion (5 minutes)
  useEffect(() => {
    // Don't start interval if sessionStartTime is null or 0 (0 = badge visible but not counting)
    if (!sessionStartTime || sessionStartTime === 0) return;

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

      // Trigger milestone pulse animation every minute
      const currentMinute = Math.floor(duration / 60);
      if (currentMinute > lastMinuteRef.current && currentMinute > 0) {
        lastMinuteRef.current = currentMinute;

        // Pulse effect on progress bar
        Animated.sequence([
          Animated.timing(progressPulseAnim, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(progressPulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        console.log(`[MILESTONE] ⏱️ ${currentMinute} minute(s) completed!`);
      }

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

  // 🧬 Speaking DNA: Show breakthrough modals from queue
  useEffect(() => {
    if (breakthroughQueue.length > 0 && !showBreakthroughModal && !currentBreakthrough) {
      console.log('[DNA] Showing next breakthrough from queue');
      const [nextBreakthrough, ...remainingQueue] = breakthroughQueue;
      setCurrentBreakthrough(nextBreakthrough);
      setBreakthroughQueue(remainingQueue);
      setShowBreakthroughModal(true);
    }
    // If no breakthroughs and voice check is due (post-session), show voice check modal
    else if (breakthroughQueue.length === 0 && !showBreakthroughModal && !showVoiceCheckModal && voiceCheckPrompt && sessionCompletedNaturally) {
      console.log('[VOICE_CHECK] No breakthroughs, showing voice check modal (post-session)');
      setShowVoiceCheckModal(true);
    }
  }, [breakthroughQueue, showBreakthroughModal, currentBreakthrough, showVoiceCheckModal, voiceCheckPrompt, sessionCompletedNaturally]);

  // 🎙️ Voice Check: Update prompt when status changes.
  // The status API returns is_due=true at session START when the previous completed_sessions
  // count matches the schedule [1, 3, 6, 8]. This is intentional: the voice check is a
  // separate 30-second standalone recording that happens BEFORE the conversation starts.
  // handleStartPracticeConversation will show the voice check first, then start the conversation.
  useEffect(() => {
    if (voiceCheckStatus?.is_due && voiceCheckStatus.prompt && !voiceCheckPrompt) {
      console.log('[VOICE_CHECK] 🎙️ Voice check is due - setting prompt');
      console.log('[VOICE_CHECK] Current session:', voiceCheckStatus.current_session);
      console.log('[VOICE_CHECK] Prompt:', voiceCheckStatus.prompt.title);
      setVoiceCheckPrompt(voiceCheckStatus.prompt);
    } else if (!voiceCheckStatus?.is_due && voiceCheckPrompt) {
      // Clear prompt if voice check is no longer due
      console.log('[VOICE_CHECK] Voice check no longer due - clearing prompt');
      setVoiceCheckPrompt(null);
    }
  }, [voiceCheckStatus, voiceCheckPrompt]);

  // Load voice preference early to prevent avatar flicker and show timer badge
  useEffect(() => {
    // Show timer badge immediately (with 0 = not counting yet)
    setSessionStartTime(0);

    const loadVoicePreference = async () => {
      try {
        const voicePreference = await AuthenticationService.getVoicePreferenceApiAuthGetVoiceGet();
        if (voicePreference && typeof voicePreference === 'object' && 'voice' in voicePreference && voicePreference.voice) {
          const selectedVoice = (voicePreference as any).voice;
          console.log(`[CONVERSATION] Pre-loaded user's preferred voice: ${selectedVoice}`);
          setUserVoice(selectedVoice);
        }
      } catch (error) {
        console.warn('[CONVERSATION] Could not pre-load voice preference:', error);
      }
    };
    loadVoicePreference();
  }, []);

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
        Alert.alert(t('practice.conversation.alert_plan_error_title'), t('practice.conversation.alert_plan_not_loaded'));
        return;
      }

      console.log('[CONVERSATION] 🚀 Starting learning plan conversation');
      setShowInfoModal(false);
      setShowLoadingSpinner(true); // Show spinner when user clicks start
      await initializeConversation(learningPlan);
    } else {
      console.log('[CONVERSATION] 🚀 Starting practice conversation');
      setShowInfoModal(false);
      setShowLoadingSpinner(true); // Show spinner when user clicks start
      await initializeConversation();
    }
  };

  // Initialize the realtime conversation
  const initializeConversation = async (plan: LearningPlan | null = null) => {
    try {
      // Timer badge already visible (set to 0 on mount)
      // Countdown will start when connection state becomes 'connected'
      console.log('[CONVERSATION] 🚀 Starting connection (timer visible, not counting yet)');

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

      // Log news context before creating RealtimeService
      if (sessionType === 'news' && newsContext) {
        console.log('[CONVERSATION] 🎯 Passing news context to RealtimeService');
        console.log('[CONVERSATION] News title:', newsContext.title);
        console.log('[CONVERSATION] News context object:', JSON.stringify(newsContext).substring(0, 300));
      }

      // Create and configure RealtimeService
      realtimeServiceRef.current = new RealtimeService({
        language: sessionLanguage,
        level: sessionLevel,
        topic: plan ? null : topic, // Topic is only for practice mode
        assessmentData: assessmentData || undefined,
        voice: selectedVoice,
        userPrompt: topic === 'custom' ? customTopicText : undefined,
        researchData: topic === 'custom' && researchData ? JSON.stringify(researchData) : undefined,
        newsContext: sessionType === 'news' ? newsContext : undefined, // Pass news context for news conversations
        onTranscript: (transcript: string, role: 'user' | 'assistant') => {
          console.log('[CONVERSATION] Transcript received:', role, transcript);
          addMessage(role, transcript);

          // 🧬 Speaking DNA: Track user turns
          if (role === 'user' && transcript && transcript.trim().length > 0) {
            const endTime = Date.now();
            const startTime = userTurnStartTimeRef.current || (endTime - 2000); // Fallback: estimate 2s duration

            console.log('[DNA] Recording user turn:', {
              transcript: transcript.substring(0, 50) + '...',
              duration: (endTime - startTime) / 1000,
            });

            sessionMetricsRef.current.recordUserTurn(transcript, startTime, endTime);
            userTurnStartTimeRef.current = null; // Reset for next turn
          }
        },
        onError: (error: Error) => {
          console.error('[CONVERSATION] Service error:', error);
          const errorMessage = error.message || 'Connection failed';
          setConnectionError(errorMessage);

          // Show user-friendly error alert
          Alert.alert(
            t('practice.conversation.alert_connection_error_title'),
            t('practice.conversation.alert_connection_error_message'),
            [
              {
                text: t('practice.conversation.button_retry'),
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
                text: t('practice.conversation.button_go_back'),
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
            // Start timer only when connection is successfully established
            setSessionStartTime(Date.now());
            console.log('[CONVERSATION] ⏱️ Timer started - connection established');
            console.log('[CONVERSATION] Ready for conversation - waiting for AI greeting');
          } else if (state === 'failed') {
            setIsConnecting(false);
            setShowLoadingSpinner(false); // Hide spinner on failure
            setConnectionError('Connection failed. Please try again.');
          }
        },
        onConnectionProgress: (step) => {
          console.log('[CONVERSATION] Connection progress:', step);
          setConnectionStep(step);
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

          // Hide loading spinner when AI AUDIO starts (with delay for buffering/unmuting)
          if (event.type === 'output_audio_buffer.started') {
            console.log('[CONVERSATION] 🎉 AI voice buffering started, will hide spinner in 400ms');
            // Wait for audio to be unmuted and actually audible
            setTimeout(() => {
              console.log('[CONVERSATION] ✅ Hiding loading spinner NOW - voice should be audible');
              setShowLoadingSpinner(false);
            }, 400);
          }

          // 🧬 Speaking DNA: Track AI response completion
          if (event.type === 'response.audio.done' || event.type === 'output_audio_buffer.stopped') {
            console.log('[DNA] AI finished speaking - marking prompt end');
            sessionMetricsRef.current.markAIPromptEnd();
          }

          // 🧬 Speaking DNA: Track user speech start timing
          if (event.type === 'input_audio_buffer.speech_started') {
            console.log('[DNA] User started speaking - recording start time');
            userTurnStartTimeRef.current = Date.now();
          }

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
        t('practice.conversation.alert_connection_error_title'),
        t('practice.conversation.alert_start_conversation_error'),
        [
          {
            text: t('practice.conversation.button_retry'),
            onPress: () => initializeConversation(plan),
          },
          {
            text: t('buttons.cancel'),
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

  // 🧬 Speaking DNA: Handle breakthrough modal close
  const handleBreakthroughClose = () => {
    console.log('[DNA] Closing breakthrough modal');
    setShowBreakthroughModal(false);
    setCurrentBreakthrough(null);

    // 🎙️ After breakthrough modal closes, check if voice check should be shown
    // Only show if:
    // 1. We have a voice check prompt (voice check is due)
    // 2. No more breakthroughs in queue
    // 3. Voice check modal is not already showing
    if (voiceCheckPrompt && breakthroughQueue.length === 0 && !showVoiceCheckModal) {
      console.log('[VOICE_CHECK] 🎙️ Showing voice check modal after breakthrough');
      setShowVoiceCheckModal(true);
    }
  };

  // 🧬 Speaking DNA: Handle breakthrough share (optional)
  const handleBreakthroughShare = (breakthrough: SpeakingBreakthrough) => {
    console.log('[DNA] Share breakthrough:', breakthrough.title);
    // TODO: Implement share functionality in future
    // For now, just log it
    Alert.alert(t('practice.conversation.alert_share_feature'), t('practice.conversation.alert_share_coming_soon'), [{ text: t('buttons.ok') }]);
  };

  // 🎙️ Voice Check handlers
  const handleVoiceCheckComplete = async (audioBase64: string) => {
    try {
      console.log('[VOICE_CHECK] 🎤 Voice check recording completed');
      console.log('[VOICE_CHECK] Audio size:', Math.round(audioBase64.length / 1024), 'KB');

      // Prepare voice-only session data for DNA analysis
      const voiceCheckSessionData = {
        session_id: `voice_check_${Date.now()}`,
        session_type: 'voice_check',
        duration_seconds: 30, // Voice checks are 30 seconds
        user_turns: [], // No turns for voice-only recording
        corrections_received: [],
        challenges_offered: 0,
        challenges_accepted: 0,
        topics_discussed: [voiceCheckPrompt?.title || 'Voice Check'],
        audio_base64: audioBase64,
        audio_format: 'wav', // useVoiceCheckRecording records .wav (LINEARPCM)
      };

      const targetLanguage = learningPlan?.language || language || 'english';

      console.log('[VOICE_CHECK] Sending voice check to DNA analysis...');

      // Analyze with DNA service
      const dnaResult = await speakingDNAService.analyzeSession(
        targetLanguage.toLowerCase(),
        voiceCheckSessionData
      );

      console.log('[VOICE_CHECK] ✅ DNA analysis complete');

      // Queue any breakthroughs detected during voice check to show after session
      if (dnaResult?.breakthroughs && dnaResult.breakthroughs.length > 0) {
        console.log(`[VOICE_CHECK] 🎯 ${dnaResult.breakthroughs.length} breakthrough(s) detected - queuing for display`);
        setBreakthroughQueue(prev => [...prev, ...dnaResult.breakthroughs]);
      }

      // Mark voice check as completed in learning plan
      if (voiceCheckStatus && planId) {
        await completeVoiceCheck(voiceCheckStatus.current_session);
        console.log('[VOICE_CHECK] ✅ Marked as completed in learning plan');
      }

      // Close modal
      setShowVoiceCheckModal(false);
      setVoiceCheckPrompt(null);

      // Execute pending navigation if any (post-session voice check)
      const navAction = pendingNavigation;
      setPendingNavigation(null);

      if (navAction === 'dashboard') {
        console.log('[VOICE_CHECK] 🧭 Executing pending dashboard navigation');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
        });
      } else if (navAction === 'analysis') {
        console.log('[VOICE_CHECK] 🧭 Executing pending analysis navigation');
        if (backgroundAnalyses && backgroundAnalyses.length > 0) {
          navigation.navigate('SentenceAnalysis', {
            analyses: backgroundAnalyses,
            sessionSummary: sessionSummary,
            duration: formatDuration(sessionDuration),
            messageCount: messages.filter(m => m.role === 'user').length,
          });
        } else {
          // Fallback to dashboard if no analyses
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
          });
        }
      }

      // Show success message (after navigation starts)
      Alert.alert(
        t('practice.conversation.alert_dna_updated_title'),
        t('practice.conversation.alert_dna_updated_message'),
        [{ text: t('practice.conversation.button_great'), onPress: () => {} }]
      );
    } catch (error: any) {
      console.error('[VOICE_CHECK] ❌ Error completing voice check:', error);
      Alert.alert(t('practice.conversation.alert_plan_error_title'), t('practice.conversation.alert_voice_check_error'));
    }
  };

  const handleVoiceCheckSkip = async () => {
    try {
      console.log('[VOICE_CHECK] ⏭️ User skipped voice check');

      // Mark as skipped in backend
      if (voiceCheckStatus && planId) {
        await skipVoiceCheck(voiceCheckStatus.current_session);
      }

      // Close modal
      setShowVoiceCheckModal(false);
      setVoiceCheckPrompt(null);

      // Execute pending navigation if any (post-session voice check)
      const navAction = pendingNavigation;
      setPendingNavigation(null);

      if (navAction === 'dashboard') {
        console.log('[VOICE_CHECK] 🧭 Executing pending dashboard navigation (after skip)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
        });
      } else if (navAction === 'analysis') {
        console.log('[VOICE_CHECK] 🧭 Executing pending analysis navigation (after skip)');
        if (backgroundAnalyses && backgroundAnalyses.length > 0) {
          navigation.navigate('SentenceAnalysis', {
            analyses: backgroundAnalyses,
            sessionSummary: sessionSummary,
            duration: formatDuration(sessionDuration),
            messageCount: messages.filter(m => m.role === 'user').length,
          });
        } else {
          // Fallback to dashboard if no analyses
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
          });
        }
      }

      console.log('[VOICE_CHECK] ✅ Voice check skipped');
    } catch (error: any) {
      console.error('[VOICE_CHECK] ❌ Error skipping voice check:', error);
      // Still close modal even if skip fails
      setShowVoiceCheckModal(false);
      setVoiceCheckPrompt(null);
    }
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
    // DISABLED: Don't auto-close modal when speaking - let user manually close via X button
    // if (newRecordingState && conversationHelp.isModalVisible) {
    //   console.log('[CONVERSATION_HELP] User started speaking, closing modal but keeping help button visible');
    //   conversationHelp.closeHelpModal();
    // }

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

  // Confirm manual early end - disconnect without saving BUT track partial minutes
  const handleConfirmEndSession = async () => {
    try {
      setShowEndSessionModal(false);

      // Check if user is guest
      const authToken = await AsyncStorage.getItem('auth_token');
      const isGuest = !authToken;

      // 🔥 CRITICAL: Track partial minutes even for early exit
      if (!isGuest && sessionDuration > 0) {
        const partialMinutes = Math.ceil(sessionDuration / 60); // Round up partial minutes
        console.log('[PARTIAL_EXIT] 🎯 Tracking partial session time:', partialMinutes, 'minutes');

        try {
          // 🔥 FIX: Use correct auth token (auth_token, not access_token)
          const authToken = await AsyncStorage.getItem('auth_token');

          if (!authToken) {
            console.error('[PARTIAL_EXIT] ❌ CRITICAL: No auth token found! Cannot track partial minutes.');
          } else {
            console.log('[PARTIAL_EXIT] ✅ Auth token retrieved successfully');

            // 🔥 FIX: Added /api prefix to endpoint
            const trackingResponse = await fetch(`${API_BASE_URL}/api/stripe/track-speaking-time`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                session_id: `partial_exit_${Date.now()}`,
                speaking_minutes: partialMinutes,
                session_completed: false // Mark as incomplete
              })
            });

            console.log('[PARTIAL_EXIT] 📡 Tracking API response status:', trackingResponse.status);

            if (trackingResponse.ok) {
              const trackingResult = await trackingResponse.json();
              console.log('[PARTIAL_EXIT] ✅ Partial time tracked successfully:', trackingResult);
            } else {
              const errorText = await trackingResponse.text();
              console.error('[PARTIAL_EXIT] ❌ Failed to track partial time - Status:', trackingResponse.status);
              console.error('[PARTIAL_EXIT] ❌ Error response:', errorText);
            }

            // Update learning plan spoken time if this was a learning plan session
            if (planId) {
              try {
                const durationMinutes = sessionDuration / 60;
                const spokenTimeResponse = await fetch(
                  `${API_BASE_URL}/api/learning/plan/${planId}/add-spoken-time?duration_minutes=${durationMinutes}`,
                  {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                  }
                );
                if (spokenTimeResponse.ok) {
                  const spokenResult = await spokenTimeResponse.json();
                  console.log('[PARTIAL_EXIT] ✅ Learning plan spoken time updated:', spokenResult.practice_minutes_used, 'min total');
                } else {
                  console.error('[PARTIAL_EXIT] ❌ Failed to update learning plan spoken time:', spokenTimeResponse.status);
                }
              } catch (spokenTimeError) {
                console.error('[PARTIAL_EXIT] ❌ Error updating learning plan spoken time:', spokenTimeError);
              }
            }
          }
        } catch (trackingError) {
          console.error('[PARTIAL_EXIT] ❌ EXCEPTION during tracking:', trackingError);
          console.error('[PARTIAL_EXIT] ❌ Error details:', {
            name: trackingError instanceof Error ? trackingError.name : 'Unknown',
            message: trackingError instanceof Error ? trackingError.message : String(trackingError)
          });
        }
      }

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
        const analysis: any = await DefaultService.analyzeGuestSessionApiGuestAnalyzeSessionPost(guestAnalysisRequest);

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
        t('practice.conversation.alert_analysis_error_title'),
        t('practice.conversation.alert_analysis_error_message'),
        [
          {
            text: t('practice.conversation.button_sign_up'),
            onPress: () => navigation.navigate('Welcome'),
          },
          {
            text: t('practice.conversation.button_try_again'),
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
          // Original logic for practice sessions (including news)
          console.log(`[AUTO_END] Saving ${sessionType || 'practice'} session via original endpoint...`);
          result = await ProgressService.saveConversationApiProgressSaveConversationPost({
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
            conversation_type: sessionType || 'practice', // Use sessionType if available (e.g., 'news')
            sentences_for_analysis: collectedSentences.length > 0 ? collectedSentences : [],
          });
        }

        console.log('[AUTO_END] Session saved successfully:', result);

        // 🔥 CRITICAL: Track speaking time for subscription/billing
        let minuteTrackingSuccess = false;
        try {
          const sessionId = result.session_id || result._id || `session_${Date.now()}`;
          const durationMinutes = Math.round(sessionDuration / 60);

          console.log('[MINUTE_TRACKING] 🎯 Tracking speaking time:', {
            sessionId,
            durationMinutes,
            sessionCompleted: true
          });

          // 🔥 FIX: Use correct auth token (auth_token, not access_token)
          const authToken = await AsyncStorage.getItem('auth_token');

          if (!authToken) {
            console.error('[MINUTE_TRACKING] ❌ CRITICAL: No auth token found! User may not be authenticated.');
            throw new Error('No authentication token available');
          }

          console.log('[MINUTE_TRACKING] ✅ Auth token retrieved successfully');

          // Call the tracking API (🔥 FIX: Added /api prefix to endpoint)
          const trackingResponse = await fetch(`${API_BASE_URL}/api/stripe/track-speaking-time`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              session_id: sessionId,
              speaking_minutes: durationMinutes,
              session_completed: true
            })
          });

          console.log('[MINUTE_TRACKING] 📡 Tracking API response status:', trackingResponse.status);

          if (trackingResponse.ok) {
            const trackingResult = await trackingResponse.json();
            console.log('[MINUTE_TRACKING] ✅ Speaking time tracked successfully:', trackingResult);
            minuteTrackingSuccess = true;
          } else {
            const errorText = await trackingResponse.text();
            console.error('[MINUTE_TRACKING] ❌ Failed to track speaking time - Status:', trackingResponse.status);
            console.error('[MINUTE_TRACKING] ❌ Error response:', errorText);
          }
        } catch (trackingError) {
          console.error('[MINUTE_TRACKING] ❌ EXCEPTION during tracking:', trackingError);
          console.error('[MINUTE_TRACKING] ❌ Error details:', {
            name: trackingError instanceof Error ? trackingError.name : 'Unknown',
            message: trackingError instanceof Error ? trackingError.message : String(trackingError),
            stack: trackingError instanceof Error ? trackingError.stack : 'No stack trace'
          });
          // Don't fail the session save if tracking fails
        }

        // Log final tracking status for debugging
        if (!minuteTrackingSuccess) {
          console.error('[MINUTE_TRACKING] ⚠️ WARNING: Session saved but minutes were NOT tracked!');
          console.error('[MINUTE_TRACKING] ⚠️ Session duration:', sessionDuration, 'seconds');
          console.error('[MINUTE_TRACKING] ⚠️ This issue should be reported to support!');
        }

        // 🧬 Speaking DNA: Analyze session for premium users
        try {
          console.log('[DNA] 🧬 Starting DNA analysis...');

          // Get session data from metrics collector
          const sessionData = sessionMetricsRef.current.getSessionData();
          const metricsCount = sessionMetricsRef.current.getMetricsCount();

          console.log('[DNA] Session metrics collected:', {
            turns: metricsCount.turns,
            duration: sessionData.duration_seconds,
            sessionType: sessionData.session_type,
          });

          // Only analyze if we have meaningful data
          if (metricsCount.turns > 0) {
            const targetLanguage = learningPlan?.language || language || 'english';

            console.log('[DNA] Calling DNA analysis service for language:', targetLanguage);

            const dnaResult = await speakingDNAService.analyzeSession(
              targetLanguage.toLowerCase(),
              sessionData
            );

            console.log('[DNA] ✅ DNA analysis complete. Breakthroughs:', dnaResult.breakthroughs.length);

            // Queue breakthroughs for display
            if (dnaResult.breakthroughs.length > 0) {
              console.log('[DNA] 🎉 Setting breakthrough queue:', dnaResult.breakthroughs.length, 'breakthroughs');
              setBreakthroughQueue(dnaResult.breakthroughs);
            }

            // 🎙️ Check if voice check is due (only for learning plan sessions)
            if (planId) {
              console.log('[VOICE_CHECK] Refreshing voice check status after session...');
              await refreshVoiceCheckStatus(); // Refresh status after session completion

              // Note: The refreshed status will be available in the next render
              // The useEffect will handle showing the modal when voiceCheckPrompt is set
              console.log('[VOICE_CHECK] Status refresh complete');
            }
          } else {
            console.log('[DNA] ⏭️ Skipping DNA analysis - no user turns recorded');
          }
        } catch (dnaError) {
          console.error('[DNA] ❌ DNA analysis failed (non-fatal):', dnaError);
          // Don't fail session save if DNA analysis fails
        }

        // Check if this is a final assessment
        if (result.is_final_assessment) {
          console.log('[FINAL_ASSESSMENT] 🎓 Final assessment results received!');
          console.log('[FINAL_ASSESSMENT] Passed:', result.assessment_result.passed);
          console.log('[FINAL_ASSESSMENT] Overall Score:', result.assessment_result.overall_score);

          // Close saving modal and show assessment results
          setShowSavingModal(false);
          setAssessmentResult(result.assessment_result);
          setShowAssessmentResults(true);
          return;
        }

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
        t('practice.conversation.alert_save_error_title'),
        t('practice.conversation.alert_save_error_message'),
        [
          {
            text: t('practice.conversation.button_try_again'),
            onPress: () => handleAutomaticSessionEnd(),
          },
          {
            text: t('practice.conversation.button_exit_anyway'),
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

    // 🎙️ Check if voice check is due before navigating
    if (voiceCheckPrompt && !showVoiceCheckModal) {
      console.log('[VOICE_CHECK] 🎙️ Voice check due - showing modal before analysis navigation');
      setPendingNavigation('analysis'); // Store pending navigation
      setShowVoiceCheckModal(true);
      return; // Don't navigate yet, wait for voice check to complete
    }

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
        t('practice.conversation.alert_no_analysis_title'),
        t('practice.conversation.alert_no_analysis_message'),
        [
          {
            text: t('buttons.ok'),
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

    // 🎙️ Check if voice check is due before navigating
    if (voiceCheckPrompt && !showVoiceCheckModal) {
      console.log('[VOICE_CHECK] 🎙️ Voice check due - showing modal before dashboard navigation');
      setPendingNavigation('dashboard'); // Store pending navigation
      setShowVoiceCheckModal(true);
      return; // Don't navigate yet, wait for voice check to complete
    }

    // Navigate back to dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
    });
  };

  const screenLanguage = learningPlan?.language || language;

  return (
    <View style={{ flex: 1 }}>
      {/* Transparent Status Bar for immersive experience */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Full-Screen Gradient Background - Extends to status bar */}
      <LinearGradient
        colors={['#0A1628', '#0D2832', '#1A3A42', '#2D4A54']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.absoluteGradient}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.immersiveHeader}>
            {/* Title & Timer - Horizontal layout at TOP for maximum visibility */}
            <View style={styles.titleTimerRow}>
              {/* Left: Title & Level with badge background */}
              <View style={styles.titleBadge}>
                <Text
                  style={[
                    styles.immersiveTitle,
                    // Dynamic font size: smaller for longer titles
                    (() => {
                      const titleText = learningPlan && (learningPlan.status === 'awaiting_final_assessment' || learningPlan.status === 'failed_assessment')
                        ? 'Final Assessment'
                        : sessionType === 'news' && newsTitle
                          ? newsTitle // SHOW FULL NEWS TITLE
                          : customTopicText
                            ? customTopicText // SHOW FULL CUSTOM TOPIC
                            : screenLanguage
                              ? `${screenLanguage.charAt(0).toUpperCase() + screenLanguage.slice(1)} Practice`
                              : 'Practice';

                      const titleLength = titleText.length;
                      if (titleLength > 25) return { fontSize: 12 }; // Very long
                      if (titleLength > 20) return { fontSize: 13 }; // Long
                      if (titleLength > 15) return { fontSize: 14 }; // Medium
                      return { fontSize: 16 }; // Normal
                    })()
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {learningPlan && (learningPlan.status === 'awaiting_final_assessment' || learningPlan.status === 'failed_assessment')
                    ? 'Final Assessment'
                    : sessionType === 'news' && newsTitle
                      ? newsTitle
                      : customTopicText
                        ? customTopicText
                        : screenLanguage
                          ? `${screenLanguage.charAt(0).toUpperCase() + screenLanguage.slice(1)} Practice`
                          : 'Practice'}
                </Text>
                <Text style={styles.immersiveSubtitle} numberOfLines={1}>
                  {learningPlan?.proficiency_level || 'PRACTICE'}
                </Text>
              </View>

              {/* Right: Timer Badge */}
              {sessionStartTime !== null && maxDuration > 0 && (
                <View style={styles.immersiveTimerBadge}>
                  <Ionicons name="timer-outline" size={14} color="#14B8A6" />
                  <Text style={styles.immersiveTimerText}>
                    {formatDuration(Math.max(0, maxDuration - sessionDuration))}
                  </Text>
                </View>
              )}
            </View>

            {/* Large Centered AI Avatar - Below title for contextual placement */}
            <View style={styles.avatarContainer}>
              <AIVoiceAvatar
                voice={userVoice}
                state={conversationState.currentState}
                size={110}
              />
            </View>
          </View>

          {/* Progress Bar - Visual time indicator with milestone pulse */}
        {sessionStartTime !== null && (
          <Animated.View
            style={[
              styles.progressBarContainer,
              {
                transform: [{ scaleY: progressPulseAnim }],
              },
            ]}
          >
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
          </Animated.View>
        )}

        {/* Floating Countdown Overlay (appears in last 10 seconds) */}
        {sessionStartTime !== null && (
          <AnimatedCountdownTimer
            duration={sessionDuration}
            maxDuration={maxDuration}
            pulseAnim={timerPulseAnim}
            colorAnim={timerColorAnim}
            scaleAnim={timerScaleAnim}
            formatDuration={formatDuration}
            t={t}
          />
        )}

        {/* Conversation Transcript */}
        <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {connectionError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{connectionError}</Text>
          </View>
        ) : showLoadingSpinner ? (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.connectingText}>
              {t('practice.conversation.connecting')}
            </Text>
          </View>
        ) : (
          <>
            {messages.map((message) => (
              <AnimatedMessage key={message.id} message={message} voiceName={userVoice} />
            ))}

            {/* Inline Conversation Help - shown after last message */}
            {conversationHelp.isModalVisible && (
              <ConversationHelpModal
                visible={true}
                variant="inline"
                helpData={conversationHelp.helpData}
                isLoading={conversationHelp.isLoading}
                targetLanguage={learningPlan?.language || language}
                helpLanguage={conversationHelp.helpSettings.help_language || 'english'}
                helpEnabled={conversationHelp.helpSettings.help_enabled}
                onClose={conversationHelp.closeHelpModal}
                onSelectResponse={(responseText) => {
                  console.log('[CONVERSATION_HELP] User selected response:', responseText);
                  conversationHelp.selectSuggestedResponse(responseText);
                }}
                onToggleHelp={(enabled) => {
                  console.log('[CONVERSATION_HELP] User toggled help:', enabled);
                  conversationHelp.updateHelpSettings({ help_enabled: enabled });
                }}
              />
            )}
          </>
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
            <Text style={styles.footerButtonText}>{t('practice.conversation.role_help')}</Text>
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
            {t('practice.conversation.role_leave')}
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
          <View style={[styles.modalContent, {
            backgroundColor: modalColor,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            shadowColor: modalColor,
          }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={32} color="#FFFFFF" />
              <Text style={styles.modalTitle}>{t('practice.conversation.modal_info_title')}</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{t('practice.conversation.modal_info_headphones_title')}</Text>
                  <Text style={styles.infoText}>
                    {t('practice.conversation.modal_info_headphones_text')}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="mic" size={24} color="#FFFFFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{t('practice.conversation.modal_info_speak_title')}</Text>
                  <Text style={styles.infoText}>
                    {t('practice.conversation.modal_info_speak_text')}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="time" size={24} color="#FFFFFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{t('practice.conversation.modal_info_time_title')}</Text>
                  <Text style={styles.infoText}>
                    {t('practice.conversation.modal_info_time_text')}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{t('practice.conversation.modal_info_conversation_title')}</Text>
                  <Text style={styles.infoText}>
                    {t('practice.conversation.modal_info_conversation_text')}
                  </Text>
                </View>
              </View>

              {/* Conversation Help Toggle */}
              <View style={[styles.infoCard, styles.helpToggleCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="help-circle" size={24} color="#FFFFFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{t('practice.conversation.modal_info_help_title')}</Text>
                  <Text style={styles.infoText}>
                    {t('practice.conversation.modal_info_help_text')}
                  </Text>
                </View>
                <Switch
                  value={conversationHelp.helpSettings.help_enabled}
                  onValueChange={(value) => {
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    conversationHelp.updateHelpSettings({ help_enabled: value });
                  }}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: 'rgba(255, 255, 255, 0.5)' }}
                  thumbColor={conversationHelp.helpSettings.help_enabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButtonSecondary, {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowInfoModal(false);
                  navigation.goBack();
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: '#FFFFFF' }]}>{t('practice.conversation.button_go_back')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButtonPrimary,
                  {
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#000000',
                  },
                  (planId && isConnecting) && styles.modalButtonDisabled
                ]}
                onPress={handleStartPracticeConversation}
                activeOpacity={0.8}
                disabled={planId && isConnecting}
              >
                {planId && isConnecting ? (
                  <ActivityIndicator color={modalColor} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: modalColor }]}>{t('practice.conversation.button_got_it')}</Text>
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
            <Text style={styles.endModalTitle}>{t('practice.conversation.modal_end_title')}</Text>
            <Text style={styles.endModalText}>
              {t('practice.conversation.modal_end_message', { minutes: Math.round(maxDuration / 60) })}
            </Text>

            <View style={styles.endModalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(sessionDuration)}</Text>
                <Text style={styles.statLabel}>{t('practice.conversation.modal_end_time_spent')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(maxDuration - sessionDuration)}</Text>
                <Text style={styles.statLabel}>{t('practice.conversation.modal_end_remaining')}</Text>
              </View>
            </View>

            <View style={styles.endModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEndSessionModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{t('practice.conversation.button_keep_practicing')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmEndButton}
                onPress={handleConfirmEndSession}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmEndButtonText}>{t('practice.conversation.button_end_anyway')}</Text>
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

      {/* 🧬 Speaking DNA: Breakthrough Celebration Modal */}
      <BreakthroughModal
        breakthrough={currentBreakthrough}
        visible={showBreakthroughModal}
        onClose={handleBreakthroughClose}
        onShare={handleBreakthroughShare}
      />

      {/* 🎙️ Voice Check Modal */}
      {voiceCheckPrompt && (
        <VoiceCheckModal
          visible={showVoiceCheckModal}
          prompt={voiceCheckPrompt}
          language={learningPlan?.language || language || 'english'}
          onComplete={handleVoiceCheckComplete}
          onSkip={handleVoiceCheckSkip}
        />
      )}

      {/* Final Assessment Results Modal */}
      {showAssessmentResults && assessmentResult && (
        <Modal
          visible={showAssessmentResults}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowAssessmentResults(false);
            handleGoDashboard();
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 500, maxHeight: '90%', backgroundColor: 'white', borderRadius: 20, overflow: 'hidden' }}>
              <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: assessmentResult.passed ? '#10B981' : '#EF4444' }}>
                  {assessmentResult.passed ? t('practice.conversation.assessment_passed') : t('practice.conversation.assessment_keep_practicing')}
                </Text>

                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
                  {t('practice.conversation.assessment_final', { level: assessmentResult.current_level })}
                </Text>

                <View style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>{t('practice.conversation.assessment_overall_score')}</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{assessmentResult.overall_score}/100</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>{t('practice.conversation.assessment_mastery', { level: assessmentResult.current_level })}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{assessmentResult.current_level_mastery}/100</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>{t('practice.conversation.assessment_readiness', { level: assessmentResult.next_level })}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{assessmentResult.next_level_readiness}/100</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1F2937' }}>{t('practice.conversation.assessment_skill_scores')}</Text>
                <View style={{ marginBottom: 16 }}>
                  {Object.entries(assessmentResult.scores).map(([skill, score]) => (
                    <View key={skill} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 14, color: '#6B7280', textTransform: 'capitalize' }}>{skill}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{String(score)}/100</Text>
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: 14, color: '#4B5563', marginBottom: 16, lineHeight: 20 }}>
                  {assessmentResult.feedback}
                </Text>

                {/* Next Level Plan Option (only if passed) */}
                {assessmentResult.passed && (
                  <View style={{ backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#10B981' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#065F46', marginBottom: 8 }}>
                      {t('practice.conversation.assessment_ready_next', { level: assessmentResult.next_level })}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#047857', marginBottom: 12 }}>
                      {t('practice.conversation.assessment_mastered_message', { currentLevel: assessmentResult.current_level, nextLevel: assessmentResult.next_level })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        // Close assessment results and show next plan creation modal
                        setShowAssessmentResults(false);
                        setShowCreateNextPlanModal(true);
                      }}
                      style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
                    >
                      <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>{t('practice.conversation.button_create_plan', { level: assessmentResult.next_level })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAssessmentResults(false);
                        handleGoDashboard();
                      }}
                      style={{ backgroundColor: 'transparent', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#10B981' }}
                    >
                      <Text style={{ color: '#047857', fontSize: 15, fontWeight: '600' }}>{t('practice.conversation.button_maybe_later')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Only show dashboard button if not passed or as fallback */}
                {!assessmentResult.passed && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowAssessmentResults(false);
                      handleGoDashboard();
                    }}
                    style={{ backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{t('practice.conversation.button_go_dashboard')}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Create Next Level Plan Modal */}
      {showCreateNextPlanModal && assessmentResult && learningPlan && (
        <Modal
          visible={showCreateNextPlanModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateNextPlanModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', flexDirection: 'column' }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937' }}>
                  {t('practice.conversation.modal_create_plan_title', { level: assessmentResult.next_level })}
                </Text>
                <TouchableOpacity onPress={() => setShowCreateNextPlanModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#10B981' }}>
                  <Text style={{ fontSize: 14, color: '#047857' }}>
                    {t('practice.conversation.plan_language_level', {
                      language: learningPlan.language.charAt(0).toUpperCase() + learningPlan.language.slice(1),
                      level: assessmentResult.next_level
                    })}
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
                  {t('practice.conversation.plan_choose_duration')}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {[1, 2, 3, 4, 5, 6].map(months => (
                    <TouchableOpacity
                      key={months}
                      onPress={() => setSelectedDuration(months)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: selectedDuration === months ? '#10B981' : '#E5E7EB',
                        backgroundColor: selectedDuration === months ? '#ECFDF5' : 'white'
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: selectedDuration === months ? '#047857' : '#4B5563'
                      }}>
                        {months} {months === 1 ? t('practice.conversation.plan_month') : t('practice.conversation.plan_months')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1F2937' }}>
                  {t('practice.conversation.plan_select_goals')}
                </Text>

                {/* Predefined Goals */}
                <View style={{ gap: 8, marginBottom: 16 }}>
                  {[
                    { key: 'business', label: t('practice.conversation.plan_goal_business') },
                    { key: 'travel', label: t('practice.conversation.plan_goal_travel') },
                    { key: 'academic', label: t('practice.conversation.plan_goal_academic') },
                    { key: 'daily', label: t('practice.conversation.plan_goal_daily') },
                    { key: 'presentations', label: t('practice.conversation.plan_goal_presentations') },
                    { key: 'interviews', label: t('practice.conversation.plan_goal_interviews') }
                  ].map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => {
                        setSelectedGoals(prev =>
                          prev.includes(label)
                            ? prev.filter(g => g !== label)
                            : [...prev, label]
                        );
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: selectedGoals.includes(label) ? '#10B981' : '#E5E7EB',
                        backgroundColor: selectedGoals.includes(label) ? '#ECFDF5' : 'white'
                      }}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selectedGoals.includes(label) ? '#10B981' : '#D1D5DB',
                        backgroundColor: selectedGoals.includes(label) ? '#10B981' : 'white',
                        marginRight: 12,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedGoals.includes(label) && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: selectedGoals.includes(label) ? '#047857' : '#4B5563'
                      }}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#6B7280' }}>
                  {t('practice.conversation.plan_additional_goals')}
                </Text>

                <TextInput
                  value={customGoals}
                  onChangeText={setCustomGoals}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: 14,
                    minHeight: 60,
                    textAlignVertical: 'top'
                  }}
                  placeholder={t('practice.conversation.plan_placeholder_goals')}
                  multiline
                  numberOfLines={2}
                />
              </ScrollView>

              {/* Fixed Footer with Create Button */}
              <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: 'white' }}>
                <TouchableOpacity
                  onPress={async () => {
                    // Validation: Require at least duration selection (goals are optional)
                    if (!selectedDuration) {
                      Alert.alert(t('practice.conversation.alert_duration_required_title'), t('practice.conversation.alert_duration_required_message'));
                      return;
                    }

                    setCreatingPlan(true);
                    try {
                      const token = await AsyncStorage.getItem('auth_token');

                      // Combine selected goals and custom goals
                      const allGoals = [...selectedGoals];
                      if (customGoals.trim()) {
                        allGoals.push(customGoals.trim());
                      }

                      console.log('[CREATE_PLAN] Creating plan with duration:', selectedDuration, 'goals:', allGoals);

                      const response = await fetch(`${API_BASE_URL}/api/learning-plans/create-next-level`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          current_plan_id: learningPlan.id,
                          duration_months: selectedDuration,
                          goals: allGoals.length > 0 ? allGoals : null,
                          custom_goal: allGoals.length > 0 ? allGoals.join(', ') : null
                        })
                      });

                      if (response.ok) {
                        console.log('[CREATE_PLAN] ✅ Next level plan created successfully');
                        setShowCreateNextPlanModal(false);
                        setSelectedGoals([]);
                        setCustomGoals('');
                        setSelectedDuration(null); // Reset - user must select again
                        handleGoDashboard();
                      } else {
                        const errorData = await response.json();
                        console.error('[CREATE_PLAN] ❌ Failed to create plan:', errorData);
                        Alert.alert(t('practice.conversation.alert_plan_error_title'), t('practice.conversation.alert_plan_error_message'));
                      }
                    } catch (error) {
                      console.error('[CREATE_PLAN] Error:', error);
                      Alert.alert(t('practice.conversation.alert_plan_error_title'), t('practice.conversation.alert_error_occurred'));
                    } finally {
                      setCreatingPlan(false);
                    }
                  }}
                  disabled={creatingPlan || !selectedDuration}
                  style={{
                    backgroundColor: (creatingPlan || !selectedDuration) ? '#9CA3AF' : '#10B981',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    shadowColor: selectedDuration ? '#10B981' : '#9CA3AF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: selectedDuration ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: selectedDuration ? 4 : 2
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {creatingPlan ? t('practice.conversation.button_creating') : !selectedDuration ? t('practice.conversation.button_select_duration') : t('practice.conversation.button_create_learning_plan')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Conversation Help is now rendered inline in the ScrollView above */}
        </SafeAreaView>
      </LinearGradient>
    </View>
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
  t: any;
}

const AnimatedCountdownTimer: React.FC<AnimatedCountdownTimerProps> = ({
  duration,
  maxDuration,
  pulseAnim,
  colorAnim,
  scaleAnim,
  formatDuration,
  t,
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
            <Text style={styles.countdownLabel}>{t('practice.conversation.countdown_seconds')}</Text>
          </View>
        </Animated.View>

        {/* Session Ending Message */}
        <Text style={styles.sessionEndingText}>{t('practice.conversation.countdown_session_ending')}</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default ConversationScreen;