import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { LearningService, ProgressService, LearningPlan, BackgroundAnalysisResponse, AuthenticationService } from '../../api/generated';
import { SentenceForAnalysis } from '../../api/generated/models/SaveConversationRequest';
import { RealtimeService } from '../../services/RealtimeService';
import SessionSummaryModal, { SavingStage } from '../../components/SessionSummaryModal';
import ConversationHelpModal from '../../components/ConversationHelpModal';
import ConversationHelpButton from '../../components/ConversationHelpButton';
import { useConversationHelp } from '../../hooks/useConversationHelp';
import { API_BASE_URL } from '../../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// MODULE-LEVEL LOG - Should appear when this file is imported
console.log('🔴🔴🔴 CONVERSATIONSCREEN.TSX MODULE LOADED 🔴🔴🔴');

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

// Animated Message Component with fade-in effect
interface AnimatedMessageProps {
  message: Message;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ message }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
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
          {message.role === 'user' ? 'You' : 'AI Tutor'}
        </Text>
      </View>

      <View
        style={[
          styles.messageBubble,
          message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant,
        ]}
      >
        <Text style={[
          styles.messageText,
          message.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant,
        ]}>
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
};

const ConversationScreen: React.FC<ConversationScreenProps> = ({
  navigation,
  route,
}) => {
  const { mode, language, topic, level, planId } = route.params;

  // Add state for the fetched learning plan
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);

  // Modal states
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

  // Conversation states
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true); // Start in connecting state
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Session saving states
  const [collectedSentences, setCollectedSentences] = useState<SentenceForAnalysis[]>([]);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [savingStage, setSavingStage] = useState<SavingStage>('saving');
  const [backgroundAnalyses, setBackgroundAnalyses] = useState<BackgroundAnalysisResponse[]>([]);
  const [sessionSummary, setSessionSummary] = useState<string>('');
  const [sessionCompletedNaturally, setSessionCompletedNaturally] = useState(false);
  const [autoSavePending, setAutoSavePending] = useState(false);

  // Realtime service ref
  const realtimeServiceRef = useRef<RealtimeService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation for recording button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Countdown animation refs
  const timerPulseAnim = useRef(new Animated.Value(1)).current;
  const timerColorAnim = useRef(new Animated.Value(0)).current;
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const lastBeepSecondRef = useRef(-1);

  // Ref to track if auto-save was triggered
  const autoSaveTriggeredRef = useRef(false);

  // Initialize conversation help system
  console.log('[CONVERSATION_HELP] 🔵🔵🔵 ABOUT TO CALL useConversationHelp HOOK');
  console.log('[CONVERSATION_HELP] Parameters:', {
    targetLanguage: learningPlan?.language || language,
    proficiencyLevel: learningPlan?.proficiency_level || level,
    topic: planId ? undefined : topic,
    enabled: true,
  });
  const conversationHelp = useConversationHelp({
    targetLanguage: learningPlan?.language || language,
    proficiencyLevel: learningPlan?.proficiency_level || level,
    topic: planId ? undefined : topic,
    enabled: true,
  });
  console.log('[CONVERSATION_HELP] 🟢🟢🟢 HOOK RETURNED:', {
    isLoading: conversationHelp.isLoading,
    isHelpReady: conversationHelp.isHelpReady,
    helpEnabled: conversationHelp.helpSettings?.help_enabled,
  });

  // Fetch learning plan if planId is provided
  useEffect(() => {
    if (planId) {
      const fetchPlan = async () => {
        try {
          console.log(`[CONVERSATION] Fetching learning plan with ID: ${planId}`);
          setIsConnecting(true);
          const plan = await LearningService.getLearningPlanApiLearningPlanPlanIdGet({ planId });
          setLearningPlan(plan);
          console.log('[CONVERSATION] ✅ Learning plan fetched successfully.');
          // Now that the plan is fetched, initialize the conversation
          await initializeConversation(plan);
        } catch (error) {
          console.error('[CONVERSATION] Error fetching learning plan:', error);
          setConnectionError('Failed to load learning plan details.');
          setIsConnecting(false);
          Alert.alert('Error', 'Could not load the learning plan. Please try again.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      };
      fetchPlan();
    } else {
      // For practice mode, show the info modal
      setShowInfoModal(true);
    }
  }, [planId]);


  // Update session duration every second and check for completion (5 minutes)
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(async () => {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionDuration(duration);

      // Calculate seconds remaining
      const secondsRemaining = 300 - duration;

      // Trigger countdown effects for last 10 seconds
      if (secondsRemaining <= 10 && secondsRemaining >= 0) {
        await triggerCountdownEffects(secondsRemaining);
      }

      // Check if 5 minutes (300 seconds) completed
      if (duration >= 300 && !autoSaveTriggeredRef.current) {
        console.log('[TIMER] ⏰ 5 minutes completed - triggering automatic session save');
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

  // Initialize conversation for practice mode when modal is dismissed
  const handleStartPracticeConversation = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowInfoModal(false);
    await initializeConversation();
  };

  // Initialize the realtime conversation
  const initializeConversation = async (plan: LearningPlan | null = null) => {
    try {
      // Ensure we are in a connecting state
      if (!isConnecting) setIsConnecting(true);
      setConnectionError(null);
  
      const sessionLanguage = plan ? plan.language : language;
      const sessionLevel = plan ? plan.proficiency_level : level;
      const assessmentData = plan ? plan.plan_content?.assessment_summary : null;
  
      console.log(`[CONVERSATION] Initializing WebRTC connection for ${plan ? 'Learning Plan' : 'Practice'}`);
      console.log(`[CONVERSATION] Language: ${sessionLanguage}, Level: ${sessionLevel}`);
      if (assessmentData) {
        console.log('[CONVERSATION] Including assessment data from learning plan.');
      }

      // Fetch user's preferred voice
      let userVoice = 'alloy'; // Default voice
      try {
        const voicePreference = await AuthenticationService.getVoicePreferenceApiAuthGetVoiceGet();
        if (voicePreference && typeof voicePreference === 'object' && 'voice' in voicePreference && voicePreference.voice) {
          userVoice = (voicePreference as any).voice;
          console.log(`[CONVERSATION] Using user's preferred voice: ${userVoice}`);
        } else {
          console.log('[CONVERSATION] No voice preference found, using default: alloy');
        }
      } catch (voiceError) {
        console.warn('[CONVERSATION] Could not fetch voice preference, using default:', voiceError);
      }

      // Create and configure RealtimeService
      realtimeServiceRef.current = new RealtimeService({
        language: sessionLanguage,
        level: sessionLevel,
        topic: plan ? null : topic, // Topic is only for practice mode
        assessmentData: assessmentData || undefined,
        voice: userVoice,
        onTranscript: (transcript: string, role: 'user' | 'assistant') => {
          console.log('[CONVERSATION] Transcript received:', role, transcript);
          addMessage(role, transcript);
        },
        onError: (error: Error) => {
          console.error('[CONVERSATION] Service error:', error);
          setConnectionError(error.message);
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
        onEvent: (event) => {
          console.log('[CONVERSATION] Event:', event.type);
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
        console.log('[CONVERSATION_HELP] 🎯 AI message received');
        console.log('[CONVERSATION_HELP] 📝 Content length:', content.trim().length);
        console.log('[CONVERSATION_HELP] ⚙️ Help enabled:', conversationHelp.helpSettings.help_enabled);
        console.log('[CONVERSATION_HELP] 🔍 Help settings:', conversationHelp.helpSettings);

        if (content.trim().length > 0 && conversationHelp.helpSettings.help_enabled) {
          console.log('[CONVERSATION_HELP] ✅ Conditions met, triggering help generation');
          // Convert messages to the format expected by conversation help
          const conversationContext = updated.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }));
          conversationHelp.handleAIResponseComplete(content, conversationContext);
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

    // Reset conversation help when user starts speaking
    if (newRecordingState && (conversationHelp.isHelpReady || conversationHelp.isModalVisible)) {
      console.log('[CONVERSATION_HELP] User started speaking, resetting help state');
      conversationHelp.resetHelpState();
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

      // Disconnect realtime service
      if (realtimeServiceRef.current) {
        console.log('[MANUAL_END] User ended session early - disconnecting without saving');
        await realtimeServiceRef.current.disconnect();
        realtimeServiceRef.current = null;
      }

      // Navigate back to dashboard without saving
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
      });
    } catch (error) {
      console.error('[MANUAL_END] Error disconnecting:', error);

      // Navigate back anyway
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Dashboard' } }],
      });
    }
  };

  // Automatic session end when 5 minutes completed - WITH SAVING
  const handleAutomaticSessionEnd = async () => {
    try {
      console.log('[AUTO_END] 💾 Starting automatic session save...');

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
        if (result.background_analyses && result.background_analyses.length > 0) {
          console.log('[AUTO_END] Received', result.background_analyses.length, 'analyses');
          setBackgroundAnalyses(result.background_analyses);
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

    // Navigate to Sentence Analysis screen
    navigation.navigate('SentenceAnalysis', {
      analyses: backgroundAnalyses,
      sessionSummary: sessionSummary,
      duration: formatDuration(sessionDuration),
      messageCount: messages.filter(m => m.role === 'user').length,
    });
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
      {/* Header */}
      <View style={styles.header}>
        {/* Empty spacer for header balance */}
        <View style={styles.backButton} />

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {screenLanguage ? `${screenLanguage.charAt(0).toUpperCase() + screenLanguage.slice(1)} Practice` : 'Conversation'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleEndSession}
          style={styles.endButton}
          activeOpacity={0.7}
        >
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Badge - Clean design below header */}
      {sessionStartTime && (
        <View style={styles.timerBadgeContainer}>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={16} color="#14B8A6" />
            <Text style={styles.timerText}>{formatDuration(sessionDuration)}</Text>
            <Text style={styles.timerLabel}>/ 5:00</Text>
          </View>
        </View>
      )}

      {/* Floating Countdown Overlay (appears in last 10 seconds) */}
      {sessionStartTime && (
        <AnimatedCountdownTimer
          duration={sessionDuration}
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
            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Ready to start</Text>
            <Text style={styles.emptyText}>
              Tap the microphone button below to begin speaking
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <AnimatedMessage key={message.id} message={message} />
          ))
        )}
      </ScrollView>

      {/* Conversation Help Button */}
      <ConversationHelpButton
        visible={conversationHelp.isHelpReady && !isRecording && !isConnecting}
        isLoading={conversationHelp.isLoading}
        onPress={conversationHelp.showHelpModal}
        helpLanguage={conversationHelp.helpSettings.help_language}
      />

      {/* Recording Button */}
      <View style={styles.footer}>
        {isRecording && (
          <Text style={styles.recordingIndicator}>Recording...</Text>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={handleToggleRecording}
            disabled={isConnecting}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.recordHint}>
          {isRecording ? 'Tap to stop' : 'Tap to speak'}
        </Text>
      </View>

      {/* Important Information Modal (for practice mode only) */}
      <Modal
        visible={showInfoModal && !planId}
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

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleStartPracticeConversation}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Got it! Let's start</Text>
            </TouchableOpacity>
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
              You haven't completed the full 5-minute session yet. If you end now, your progress won't be saved and you won't receive analysis or flashcards.
            </Text>

            <View style={styles.endModalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(sessionDuration)}</Text>
                <Text style={styles.statLabel}>Time Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(300 - sessionDuration)}</Text>
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
        onViewAnalysis={handleViewAnalysis}
        onGoDashboard={handleGoDashboard}
      />

      {/* Conversation Help Modal */}
      <ConversationHelpModal
        visible={conversationHelp.isModalVisible}
        helpData={conversationHelp.helpData}
        isLoading={conversationHelp.isLoading}
        targetLanguage={learningPlan?.language || language}
        helpLanguage={conversationHelp.helpSettings.help_language || 'english'}
        onClose={conversationHelp.closeHelpModal}
        onSelectResponse={(responseText) => {
          // When user selects a suggested response, we could add it to the input
          // For now, just close the modal and let them speak it
          console.log('[CONVERSATION_HELP] User selected response:', responseText);
          conversationHelp.selectSuggestedResponse(responseText);
        }}
      />
    </SafeAreaView>
  );
};

// Animated Countdown Timer Component - Modern Floating Design
interface AnimatedCountdownTimerProps {
  duration: number;
  pulseAnim: Animated.Value;
  colorAnim: Animated.Value;
  scaleAnim: Animated.Value;
  formatDuration: (seconds: number) => string;
}

const AnimatedCountdownTimer: React.FC<AnimatedCountdownTimerProps> = ({
  duration,
  pulseAnim,
  colorAnim,
  scaleAnim,
  formatDuration,
}) => {
  const secondsRemaining = 300 - duration;
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
    backgroundColor: '#FFFFFF',
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
  backButton: {
    padding: 8,
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
    backgroundColor: '#F9FAFB',
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
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
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
  recordingIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 12,
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
  modalButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
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