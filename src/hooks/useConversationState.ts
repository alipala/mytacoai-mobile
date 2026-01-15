import { useState, useCallback, useRef, useEffect } from 'react';
import { RealtimeEvent } from '../services/types';

/**
 * Conversation State Machine
 *
 * States:
 * - AI_IDLE: AI is not speaking, waiting for user or processing
 * - AI_LISTENING: AI is listening to user speak
 * - AI_SPEAKING: AI is actively speaking/responding
 * - USER_IDLE: User is not speaking
 * - USER_SPEAKING: User is actively speaking
 */

export type ConversationState =
  | 'AI_IDLE'
  | 'AI_LISTENING'
  | 'AI_SPEAKING'
  | 'USER_SPEAKING'
  | 'USER_IDLE';

export interface ConversationStateResult {
  currentState: ConversationState;
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
  isAIListening: boolean;
  isIdle: boolean;
  handleRealtimeEvent: (event: RealtimeEvent) => void;
  setUserSpeaking: (speaking: boolean) => void;
}

/**
 * Custom hook to manage conversation state based on Realtime API events
 */
export const useConversationState = (): ConversationStateResult => {
  const [currentState, setCurrentState] = useState<ConversationState>('AI_IDLE');

  // Track AI speaking state
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Track user speaking state (from VAD - Voice Activity Detection)
  const [isUserSpeakingVAD, setIsUserSpeakingVAD] = useState(false);

  // Track user speaking state (from manual button press)
  const [isUserSpeakingManual, setIsUserSpeakingManual] = useState(false);

  // Timeout refs for state transitions
  const aiSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle events from OpenAI Realtime API
   */
  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    console.log('[CONVERSATION_STATE] Event received:', event.type);

    switch (event.type) {
      // ===== AI SPEAKING STATES =====
      case 'response.audio.start':
      case 'output_audio_buffer.started':
        console.log('[CONVERSATION_STATE] → AI_SPEAKING (audio start)');
        setIsAISpeaking(true);
        setCurrentState('AI_SPEAKING');

        // Clear any pending timeout
        if (aiSpeakingTimeoutRef.current) {
          clearTimeout(aiSpeakingTimeoutRef.current);
        }
        break;

      case 'response.audio.delta':
        // AI is actively speaking (continuous)
        console.log('[CONVERSATION_STATE] → AI_SPEAKING (audio delta)');
        setIsAISpeaking(true);
        setCurrentState('AI_SPEAKING');
        break;

      case 'response.audio.done':
      case 'output_audio_buffer.stopped':
        console.log('[CONVERSATION_STATE] → AI finished speaking');
        setIsAISpeaking(false);

        // Add small delay before transitioning to IDLE or LISTENING
        // This prevents flickering between states
        aiSpeakingTimeoutRef.current = setTimeout(() => {
          if (isUserSpeakingVAD || isUserSpeakingManual) {
            console.log('[CONVERSATION_STATE] → AI_LISTENING (user still speaking)');
            setCurrentState('AI_LISTENING');
          } else {
            console.log('[CONVERSATION_STATE] → AI_IDLE');
            setCurrentState('AI_IDLE');
          }
        }, 200);
        break;

      // ===== USER SPEAKING STATES (VAD) =====
      case 'input_audio_buffer.speech_started':
        console.log('[CONVERSATION_STATE] → USER_SPEAKING (VAD detected)');
        setIsUserSpeakingVAD(true);

        // Clear any pending timeout
        if (userSpeakingTimeoutRef.current) {
          clearTimeout(userSpeakingTimeoutRef.current);
        }

        // If AI is not speaking, transition to AI_LISTENING
        if (!isAISpeaking) {
          console.log('[CONVERSATION_STATE] → AI_LISTENING');
          setCurrentState('AI_LISTENING');
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('[CONVERSATION_STATE] → USER stopped speaking (VAD)');
        setIsUserSpeakingVAD(false);

        // Add small delay before transitioning state
        userSpeakingTimeoutRef.current = setTimeout(() => {
          if (!isUserSpeakingManual && !isAISpeaking) {
            console.log('[CONVERSATION_STATE] → AI_IDLE (no activity)');
            setCurrentState('AI_IDLE');
          }
        }, 300);
        break;

      case 'input_audio_buffer.committed':
        console.log('[CONVERSATION_STATE] User audio committed');
        // User finished speaking, audio is being processed
        break;

      // ===== ERROR STATE =====
      case 'error':
        console.error('[CONVERSATION_STATE] Error event:', event.error);
        setCurrentState('AI_IDLE');
        break;

      default:
        // Other events don't affect conversation state
        break;
    }
  }, [isAISpeaking, isUserSpeakingVAD, isUserSpeakingManual]);

  /**
   * Manually set user speaking state (from button press)
   */
  const setUserSpeaking = useCallback((speaking: boolean) => {
    console.log('[CONVERSATION_STATE] Manual user speaking:', speaking);
    setIsUserSpeakingManual(speaking);

    if (speaking) {
      setCurrentState('USER_SPEAKING');
    } else {
      // If VAD also not active and AI not speaking, go to IDLE
      if (!isUserSpeakingVAD && !isAISpeaking) {
        setCurrentState('AI_IDLE');
      }
    }
  }, [isUserSpeakingVAD, isAISpeaking]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (aiSpeakingTimeoutRef.current) {
        clearTimeout(aiSpeakingTimeoutRef.current);
      }
      if (userSpeakingTimeoutRef.current) {
        clearTimeout(userSpeakingTimeoutRef.current);
      }
    };
  }, []);

  // Derived states
  const isUserSpeaking = isUserSpeakingVAD || isUserSpeakingManual;
  const isAIListening = currentState === 'AI_LISTENING';
  const isIdle = currentState === 'AI_IDLE' || currentState === 'USER_IDLE';

  return {
    currentState,
    isAISpeaking,
    isUserSpeaking,
    isAIListening,
    isIdle,
    handleRealtimeEvent,
    setUserSpeaking,
  };
};
