/**
 * Shared types for the Realtime Service, adapted for React Native.
 * Based on the web application's types.
 */

// Session configuration from backend (controls duration, guest status, etc.)
export interface SessionConfig {
  max_duration_seconds: number;
  is_guest: boolean;
  duration_minutes: number;
  assessment_duration_seconds: number;
}

// Event types that can be sent/received through the WebRTC data channel
export type RealtimeEvent =
  | { type: 'session.created'; session: any }
  | { type: 'session.updated'; session: any }
  | { type: 'conversation.created'; conversation: any }
  | { type: 'conversation.item.created'; item: any }
  | { type: 'conversation.item.input_audio_transcription.completed'; transcript: string; item_id: string; text: string; }
  | { type: 'conversation.item.input_audio_transcription.failed'; error: any }
  | { type: 'response.created'; response: any }
  | { type: 'response.done'; response: any }
  | { type: 'response.audio_transcript.done'; transcript: string }
  | { type: 'response.audio.start' }
  | { type: 'response.audio.delta'; delta: string }
  | { type: 'response.audio.done' }
  | { type: 'input_audio_buffer.speech_started' }
  | { type: 'input_audio_buffer.speech_stopped' }
  | { type: 'input_audio_buffer.committed' }
  | { type: 'error'; error: any };

export interface RealtimeServiceConfig {
  language: string;
  level: string;
  topic: string;
  voice?: string;
  userPrompt?: string;
  assessmentData?: any;
  researchData?: string;
  onEvent?: (event: RealtimeEvent) => void;
  onTranscript?: (transcript: string, role: 'user' | 'assistant') => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onSessionConfigReceived?: (config: SessionConfig) => void;
}