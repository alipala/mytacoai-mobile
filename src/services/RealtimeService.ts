/**
 * React Native WebRTC Realtime Service
 * Handles real-time voice conversation with OpenAI Realtime API using WebRTC
 * Based on the web implementation but adapted for React Native
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { DefaultService } from '../api/generated';

// Event types that can be sent/received through WebRTC data channel
export type RealtimeEvent =
  | { type: 'session.created'; session: any }
  | { type: 'session.updated'; session: any }
  | { type: 'conversation.created'; conversation: any }
  | { type: 'conversation.item.created'; item: any }
  | { type: 'conversation.item.input_audio_transcription.completed'; transcript: string; item_id: string }
  | { type: 'conversation.item.input_audio_transcription.failed'; error: any }
  | { type: 'response.created'; response: any }
  | { type: 'response.done'; response: any }
  | { type: 'response.audio_transcript.done'; transcript: string }
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
  onEvent?: (event: RealtimeEvent) => void;
  onTranscript?: (transcript: string, role: 'user' | 'assistant') => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: string) => void;
}

export class RealtimeService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: any | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudioTrack: MediaStreamTrack | null = null;
  private config: RealtimeServiceConfig;
  private ephemeralKey: string | null = null;
  private isConnected: boolean = false;
  private isMuted: boolean = false;
  private isAISpeaking: boolean = false;
  private userManuallyMuted: boolean = false; // Track user-initiated mute
  private fallbackMuteTimeout: NodeJS.Timeout | null = null;
  private emergencyMuteTimeout: NodeJS.Timeout | null = null;

  // Timing constants (from web implementation)
  private readonly PREEMPTIVE_MUTE_DELAY = 100; // Reduced delay before muting
  private readonly MOBILE_SAFETY_BUFFER = 0; // Reduced mobile buffer
  private readonly EMERGENCY_MUTE_THRESHOLD = 50;

  constructor(config: RealtimeServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the WebRTC connection and start the conversation
   */
  async connect(): Promise<void> {
    try {
      console.log('[RealtimeService] Starting connection...');

      // Step 1: Get ephemeral key from backend
      await this.getEphemeralKey();

      // Step 2: Request microphone permission and get audio stream
      await this.getUserMedia();

      // Step 3: Set up WebRTC peer connection
      await this.setupPeerConnection();

      // Step 4: Create SDP offer and exchange with OpenAI
      await this.exchangeSDP();

      console.log('[RealtimeService] Connection established successfully');
      this.isConnected = true;
      this.config.onConnectionStateChange?.('connected');
    } catch (error: any) {
      console.error('[RealtimeService] Connection failed:', error);
      this.config.onError?.(error);
      this.config.onConnectionStateChange?.('failed');
      throw error;
    }
  }

  /**
   * Get ephemeral key from backend API
   */
  private async getEphemeralKey(): Promise<void> {
    try {
      console.log('[RealtimeService] Requesting ephemeral key...');

      const response = await DefaultService.generateTokenApiRealtimeTokenPost({
        requestBody: {
          language: this.config.language,
          level: this.config.level,
          topic: this.config.topic,
          voice: this.config.voice || 'alloy',
        },
      });

      this.ephemeralKey = response.client_secret.value;
      console.log('[RealtimeService] Ephemeral key received');
    } catch (error) {
      console.error('[RealtimeService] Failed to get ephemeral key:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  /**
   * Request microphone permission and get audio stream
   */
  private async getUserMedia(): Promise<void> {
    try {
      console.log('[RealtimeService] Requesting microphone access...');

      // Request audio stream with echo cancellation and noise suppression
      this.localStream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Configure audio routing for loudspeaker (high volume)
      // InCallManager handles iOS/Android audio session management
      try {
        InCallManager.start({ media: 'audio', ringback: '' });
        InCallManager.setForceSpeakerphoneOn(true); // Force speaker for maximum volume
        console.log('[RealtimeService] Audio routing configured for loudspeaker');
      } catch (audioError) {
        console.warn('[RealtimeService] Audio routing configuration failed:', audioError);
        // Non-fatal error, continue anyway
      }

      console.log('[RealtimeService] Microphone access granted');
    } catch (error) {
      console.error('[RealtimeService] Microphone access denied:', error);
      throw new Error('Microphone permission denied');
    }
  }

  /**
   * Set up WebRTC peer connection with OpenAI
   */
  private async setupPeerConnection(): Promise<void> {
    console.log('[RealtimeService] Setting up peer connection...');

    // Create RTCPeerConnection with STUN servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Add local audio track to peer connection
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.peerConnection.addTrack(audioTrack, this.localStream);
      console.log('[RealtimeService] Local audio track added');
    }

    // Create data channel for events
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    // Set up data channel event handlers
    this.setupDataChannelHandlers();

    // Handle incoming remote audio track
    this.peerConnection.ontrack = (event) => {
      console.log('[RealtimeService] Received remote audio track');
      if (event.track.kind === 'audio') {
        this.remoteAudioTrack = event.track;
        // The audio will automatically play through the device speakers
      }
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'unknown';
      console.log('[RealtimeService] Connection state:', state);
      this.config.onConnectionStateChange?.(state);
    };

    // Handle ICE candidates (should be handled by OpenAI automatically)
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[RealtimeService] ICE candidate:', event.candidate);
      }
    };
  }

  /**
   * Set up data channel event handlers
   */
  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('[RealtimeService] Data channel opened');

      // Send initial session update with instructions
      this.sendEvent({
        type: 'session.update',
        session: {
          turn_detection: { type: 'server_vad' },
          input_audio_transcription: { model: 'whisper-1' },
          instructions: `You are a friendly language tutor helping the user practice ${this.config.language}. Your role is to have a natural conversation about ${this.config.topic} at ${this.config.level} level. Start the conversation by greeting the user warmly and introducing yourself briefly.`,
        },
      });

      // Trigger AI to start the conversation with a greeting
      console.log('[RealtimeService] Triggering AI to start conversation');
      this.sendEvent({
        type: 'response.create',
      });
    };

    this.dataChannel.onclose = () => {
      console.log('[RealtimeService] Data channel closed');
    };

    this.dataChannel.onerror = (error: any) => {
      console.error('[RealtimeService] Data channel error:', error);
      this.config.onError?.(new Error('Data channel error'));
    };

    this.dataChannel.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('[RealtimeService] Failed to parse event:', error);
      }
    };
  }

  /**
   * Handle incoming realtime events from OpenAI
   */
  private handleRealtimeEvent(event: RealtimeEvent): void {
    console.log('[RealtimeService] Event received:', event.type);

    // Notify event listener
    this.config.onEvent?.(event);

    // Handle specific events
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        // User speech transcription completed
        this.config.onTranscript?.(event.transcript, 'user');
        break;

      case 'response.audio_transcript.done':
        // Assistant response transcription completed
        this.config.onTranscript?.(event.transcript, 'assistant');
        break;

      case 'input_audio_buffer.speech_started':
        // User started speaking - could be used for UI feedback
        console.log('[RealtimeService] User started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        // User stopped speaking
        console.log('[RealtimeService] User stopped speaking');
        break;

      case 'response.audio.delta':
        // Ensure we stay muted during AI speech chunks
        if (!this.isAISpeaking) {
          console.log('[RealtimeService] AI audio delta - ensuring muted');
          this.executeImmediateMute('AI audio delta received');
        }
        break;

      case 'response.audio.done':
        console.log('[RealtimeService] AI audio done - scheduling delayed unmute');
        this.scheduleDelayedUnmute('AI audio response completed');
        break;

      case 'response.done':
        console.log('[RealtimeService] Response done - scheduling delayed unmute');
        this.scheduleDelayedUnmute('AI response completed');
        break;

      case 'input_audio_buffer.speech_started':
        // User speech detected - immediate unmute
        console.log('[RealtimeService] User speech started - immediate unmute');
        this.executeImmediateUnmute('User speech detected');
        break;

      case 'error':
        console.error('[RealtimeService] Error event:', event.error);
        this.config.onError?.(new Error(event.error?.message || 'Unknown error'));
        break;
    }
  }

  /**
   * Exchange SDP offer/answer with OpenAI
   */
  private async exchangeSDP(): Promise<void> {
    if (!this.peerConnection || !this.ephemeralKey) {
      throw new Error('Peer connection not initialized');
    }

    console.log('[RealtimeService] Creating SDP offer...');

    // Create SDP offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    console.log('[RealtimeService] Sending SDP offer to OpenAI...');

    // Send offer to OpenAI Realtime API
    const response = await fetch(
      'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    // Get SDP answer from OpenAI
    const answerSdp = await response.text();
    console.log('[RealtimeService] Received SDP answer from OpenAI');

    // Set remote description
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: answerSdp,
    });
    await this.peerConnection.setRemoteDescription(answer);

    console.log('[RealtimeService] SDP exchange completed');
  }

  /**
   * Send an event through the data channel
   */
  public sendEvent(event: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('[RealtimeService] Data channel not open, cannot send event');
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify(event));
      console.log('[RealtimeService] Event sent:', event.type);
    } catch (error) {
      console.error('[RealtimeService] Failed to send event:', error);
    }
  }

  /**
   * Execute immediate muting (AI speech detected)
   */
  private executeImmediateMute(reason: string): void {
    console.log(`[RealtimeService] IMMEDIATE MUTE: ${reason}`);
    this.isAISpeaking = true;
    this.clearAllDelayedOperations();

    // Hardware-level track muting
    this.muteViaTrackEnabled(true);

    // Set emergency timeout as safety net
    this.setEmergencyMuteTimeout();
  }

  /**
   * Execute immediate unmuting (user speech detected)
   */
  private executeImmediateUnmute(reason: string): void {
    console.log(`[RealtimeService] IMMEDIATE UNMUTE: ${reason}`);
    this.isAISpeaking = false;
    this.clearAllDelayedOperations();

    // Check if user manually muted
    if (this.userManuallyMuted) {
      console.log('[RealtimeService] SKIPPING UNMUTE - user manually muted');
      return;
    }

    this.muteViaTrackEnabled(false);
  }

  /**
   * Schedule delayed unmuting with safety buffer
   */
  private scheduleDelayedUnmute(reason: string): void {
    console.log(`[RealtimeService] SCHEDULING DELAYED UNMUTE: ${reason}`);
    this.isAISpeaking = false;
    this.clearAllDelayedOperations();

    const semanticDelay = 100; // Reduced from 300ms
    const tailProtection = 100; // Reduced from 500ms
    const totalDelay = semanticDelay + tailProtection + this.MOBILE_SAFETY_BUFFER;

    console.log(`[RealtimeService] Unmuting in ${totalDelay}ms`);

    this.fallbackMuteTimeout = setTimeout(() => {
      console.log(`[RealtimeService] EXECUTING DELAYED UNMUTE: ${reason}`);

      if (this.userManuallyMuted) {
        console.log('[RealtimeService] SKIPPING UNMUTE - user manually muted');
        return;
      }

      if (!this.isAISpeaking) {
        this.muteViaTrackEnabled(false);
      }

      this.fallbackMuteTimeout = null;
    }, totalDelay);
  }

  /**
   * Hardware-level track muting/unmuting
   */
  private muteViaTrackEnabled(mute: boolean): void {
    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    const action = mute ? 'MUTING' : 'UNMUTING';
    console.log(`[RealtimeService] ${action} ${audioTracks.length} audio track(s)`);

    audioTracks.forEach((track, index) => {
      if (track.enabled !== undefined) {
        track.enabled = !mute;
        console.log(`[RealtimeService] Track ${index} enabled: ${!mute}`);
      }
    });
  }

  /**
   * Set emergency mute timeout as safety net
   */
  private setEmergencyMuteTimeout(): void {
    if (this.emergencyMuteTimeout) {
      clearTimeout(this.emergencyMuteTimeout);
    }

    this.emergencyMuteTimeout = setTimeout(() => {
      console.log('[RealtimeService] EMERGENCY MUTE TIMEOUT');
      this.muteViaTrackEnabled(true);
      this.emergencyMuteTimeout = null;
    }, this.EMERGENCY_MUTE_THRESHOLD);
  }

  /**
   * Clear all delayed operations
   */
  private clearAllDelayedOperations(): void {
    if (this.fallbackMuteTimeout) {
      clearTimeout(this.fallbackMuteTimeout);
      this.fallbackMuteTimeout = null;
    }

    if (this.emergencyMuteTimeout) {
      clearTimeout(this.emergencyMuteTimeout);
      this.emergencyMuteTimeout = null;
    }
  }

  /**
   * User-initiated mute (separate from AI-prevention muting)
   */
  public muteUserMicrophone(): void {
    console.log('[RealtimeService] User manually muting microphone');
    this.userManuallyMuted = true;

    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      if (track.enabled !== undefined) {
        track.enabled = false;
      }
    });
  }

  /**
   * User-initiated unmute
   */
  public unmuteUserMicrophone(): void {
    console.log('[RealtimeService] User manually unmuting microphone');
    this.userManuallyMuted = false;

    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      if (track.enabled !== undefined) {
        track.enabled = true;
      }
    });
  }

  /**
   * Check if user manually muted
   */
  public isUserMicrophoneMuted(): boolean {
    return this.userManuallyMuted;
  }

  /**
   * Legacy setMuted for backwards compatibility (maps to user mute)
   */
  public setMuted(muted: boolean): void {
    if (muted) {
      this.muteUserMicrophone();
    } else {
      this.unmuteUserMicrophone();
    }
  }

  /**
   * Send a text message (for interrupting or sending text input)
   */
  public sendTextMessage(text: string): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    });

    // Trigger response generation
    this.sendEvent({
      type: 'response.create',
    });
  }

  /**
   * Interrupt the current assistant response
   */
  public interrupt(): void {
    this.sendEvent({
      type: 'response.cancel',
    });
  }

  /**
   * Disconnect and cleanup resources
   */
  public async disconnect(): Promise<void> {
    console.log('[RealtimeService] Disconnecting...');

    // Clear all timeouts
    this.clearAllDelayedOperations();

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Stop audio routing management
    try {
      InCallManager.stop();
      console.log('[RealtimeService] Audio routing stopped');
    } catch (error) {
      console.warn('[RealtimeService] Error stopping audio routing:', error);
    }

    // Reset state
    this.isConnected = false;
    this.isAISpeaking = false;
    this.userManuallyMuted = false;

    this.config.onConnectionStateChange?.('disconnected');
    console.log('[RealtimeService] Disconnected');
  }

  /**
   * Get connection status
   */
  public getConnectionState(): string {
    return this.peerConnection?.connectionState || 'disconnected';
  }

  /**
   * Check if currently connected
   */
  public isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if microphone is muted
   */
  public isMicrophoneMuted(): boolean {
    return this.isMuted;
  }
}
