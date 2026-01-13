/**
 * React Native WebRTC Realtime Service
 * Handles real-time voice conversation with OpenAI Realtime API using WebRTC.
 * This implementation is aligned with the web app's `enhancedRealtimeService.ts`,
 * using a session-based connection flow and delegating muting logic to a dedicated controller.
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { DefaultService } from '../api/generated';
import { RealtimeEvent, RealtimeServiceConfig, SessionConfig } from './types';
import { SemanticMuteController } from './semanticMuteController';

export class RealtimeService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: any | null = null;
  private localStream: MediaStream | null = null;
  private config: RealtimeServiceConfig;

  // Session and connection state
  private ephemeralKey: string | null = null;
  private sessionId: string | null = null;
  private model: string | null = null;
  private sessionConfig: SessionConfig | null = null;
  private isConnected: boolean = false;

  // Muting and audio control
  private semanticMuteController: SemanticMuteController;
  private userManuallyMuted: boolean = false;

  constructor(config: RealtimeServiceConfig) {
    this.config = config;
    this.semanticMuteController = new SemanticMuteController();
    this.semanticMuteController.setUserManualMuteChecker(() => this.userManuallyMuted);
  }

  /**
   * Initialize the WebRTC connection and start the conversation.
   */
  public async connect(): Promise<void> {
    try {
      console.log('[RealtimeService] Starting connection...');
      this.config.onConnectionStateChange?.('connecting');

      // Disconnect any existing session first
      await this.disconnect();

      // Step 1: Get session ID, key, and model name from backend
      await this.createSession();

      // Step 2: Request microphone permission and get audio stream
      await this.getUserMedia();

      // Step 3: Set up WebRTC peer connection
      await this.setupPeerConnection();

      // Step 4: Create SDP offer and exchange with the OpenAI session
      await this.exchangeSDP();

      console.log('[RealtimeService] Connection process completed successfully');
    } catch (error: any) {
      console.error('[RealtimeService] Connection failed:', error);
      this.config.onError?.(error);
      this.config.onConnectionStateChange?.('failed');
      await this.disconnect(); // Ensure cleanup on failure
      throw error;
    }
  }

  /**
   * Step 1: Create a session via the backend to get a session ID, ephemeral key, and model name.
   */
  private async createSession(): Promise<void> {
    try {
      console.log('[RealtimeService] Creating session via backend...');

      // Log news context if present
      if (this.config.newsContext) {
        console.log('[RealtimeService] 📰 NEWS CONTEXT DETECTED');
        console.log('[RealtimeService] News context object:', this.config.newsContext);
        console.log('[RealtimeService] News title:', (this.config.newsContext as any).title);
        const stringified = JSON.stringify(this.config.newsContext);
        console.log('[RealtimeService] Stringified length:', stringified.length);
        console.log('[RealtimeService] Stringified preview:', stringified.substring(0, 200));
      }

      const response = await DefaultService.generateTokenApiRealtimeTokenPost({
        language: this.config.language,
        level: this.config.level,
        topic: this.config.topic,
        voice: this.config.voice || 'alloy',
        user_prompt: this.config.userPrompt,
        assessment_data: this.config.assessmentData,
        research_data: this.config.researchData,
        news_context: this.config.newsContext ? JSON.stringify(this.config.newsContext) : undefined,
      });

      console.log('[RealtimeService] ✅ Session created, checking if news context was sent...');

      if (!response.id || !response.client_secret?.value || !response.model) {
        throw new Error('Invalid session response from backend. Missing id, client_secret, or model.');
      }

      this.sessionId = response.id;
      this.ephemeralKey = response.client_secret.value;
      this.model = response.model; // <-- Store the model from backend

      // Extract session config from response (backend-controlled duration)
      if ((response as any).session_config) {
        this.sessionConfig = (response as any).session_config as SessionConfig;
        console.log(`[RealtimeService] Session config received:`, {
          max_duration: this.sessionConfig.max_duration_seconds,
          is_guest: this.sessionConfig.is_guest,
          duration_minutes: this.sessionConfig.duration_minutes,
        });

        // Notify ConversationScreen of the session config
        this.config.onSessionConfigReceived?.(this.sessionConfig);
      } else {
        console.warn('[RealtimeService] ⚠️ No session_config in response - using defaults');
      }

      console.log(`[RealtimeService] Session created: ${this.sessionId} with model ${this.model}`);
    } catch (error) {
      console.error('[RealtimeService] Failed to create session:', error);
      throw new Error('Failed to get authentication token from backend');
    }
  }

  /**
   * Step 2: Request microphone permission and get audio stream.
   */
  private async getUserMedia(): Promise<void> {
    try {
      console.log('[RealtimeService] Requesting microphone access...');
      this.localStream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Initialize the mute controller with the new stream
      this.semanticMuteController.initialize(this.localStream);

      // Configure audio routing for loudspeaker
      InCallManager.start({ media: 'audio' });
      InCallManager.setForceSpeakerphoneOn(true);

      console.log('[RealtimeService] Microphone access granted and configured');
    } catch (error) {
      console.error('[RealtimeService] Microphone access denied:', error);
      throw new Error('Microphone permission denied');
    }
  }

  /**
   * Step 3: Set up the RTCPeerConnection.
   */
  private async setupPeerConnection(): Promise<void> {
    if (!this.localStream) {
      throw new Error('Local media stream is not available.');
    }

    console.log('[RealtimeService] Setting up peer connection...');
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Add local audio track
    const audioTrack = this.localStream.getAudioTracks()[0];
    this.peerConnection.addTrack(audioTrack, this.localStream);
    console.log('[RealtimeService] Local audio track added');

    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', { ordered: true });
    this.setupDataChannelHandlers();

    // Handle remote track
    this.peerConnection.ontrack = (event) => {
      console.log('[RealtimeService] Received remote audio track');
      // Audio will play automatically via the configured InCallManager
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'unknown';
      console.log(`[RealtimeService] Connection state changed: ${state}`);
      this.config.onConnectionStateChange?.(state);

      if (state === 'connected') {
        this.isConnected = true;
        this.config.onConnected?.();
      } else if (['disconnected', 'failed', 'closed'].includes(state)) {
        this.isConnected = false;
        this.config.onDisconnected?.();
      }
    };
  }

  /**
   * Step 4: Exchange SDP offer/answer with the OpenAI endpoint.
   */
  private async exchangeSDP(): Promise<void> {
    if (!this.peerConnection || !this.ephemeralKey || !this.model) {
      throw new Error('Cannot exchange SDP: session not fully initialized.');
    }

    console.log('[RealtimeService] Creating SDP offer...');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    console.log(`[RealtimeService] Sending SDP offer to OpenAI with model ${this.model}...`);
    
    // Use the dynamic model from the backend
    const response = await fetch(
      `https://api.openai.com/v1/realtime?model=${this.model}`,
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
      const errorText = await response.text();
      throw new Error(`OpenAI API error during SDP exchange: ${errorText}`);
    }

    const answerSdp = await response.text();
    const answer = new RTCSessionDescription({ type: 'answer', sdp: answerSdp });
    await this.peerConnection.setRemoteDescription(answer);

    console.log('[RealtimeService] SDP exchange completed');
  }

  /**
   * Configure handlers for the WebRTC data channel.
   */
  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('[RealtimeService] Data channel opened');
      // NOTE: All configuration is now handled by the backend.
      // We only need to send response.create to start the conversation.
      this.sendEvent({ type: 'response.create' });
    };

    this.dataChannel.onclose = () => {
      console.log('[RealtimeService] Data channel closed');
    };

    this.dataChannel.onerror = (error: any) => {
      console.error('[RealtimeService] Data channel error:', error);
      this.config.onError?.(new Error('Data channel communication error'));
    };

    this.dataChannel.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('[RealtimeService] Failed to parse event:', error);
      }
    };
  }

  /**
   * Process incoming events from OpenAI and delegate to handlers.
   */
  private handleRealtimeEvent(event: RealtimeEvent): void {
    // Delegate all audio-related events to the mute controller
    this.semanticMuteController.handleRealtimeEvent(event);

    // Notify the main event listener
    this.config.onEvent?.(event);

    // Handle specific events for application logic
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        // FIX: Use event.transcript, not event.text
        this.config.onTranscript?.(event.transcript, 'user');
        break;
      case 'response.audio_transcript.done':
        this.config.onTranscript?.(event.transcript, 'assistant');
        break;
      case 'error':
        console.error('[RealtimeService] Error event from OpenAI:', event.error);
        this.config.onError?.(new Error(event.error?.message || 'Unknown OpenAI error'));
        break;
    }
  }

  /**
   * Send an event through the data channel.
   */
  public sendEvent(event: any): void {
    if (this.dataChannel?.readyState !== 'open') {
      console.warn(`[RealtimeService] Data channel not open, cannot send event '${event.type}'`);
      return;
    }
    try {
      this.dataChannel.send(JSON.stringify(event));
    } catch (error) {
      console.error(`[RealtimeService] Failed to send event '${event.type}':`, error);
    }
  }

  /**
   * Mute the user's microphone.
   */
  public muteUserMicrophone(): void {
    console.log('[RealtimeService] User manually muting microphone');
    this.userManuallyMuted = true;
    this.semanticMuteController.ensureUnmutedForUserSpeech('manual mute override');
    if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => track.enabled = false);
    }
  }

  /**
   * Unmute the user's microphone.
   */
  public unmuteUserMicrophone(): void {
    console.log('[RealtimeService] User manually unmuting microphone');
    this.userManuallyMuted = false;
    this.semanticMuteController.ensureUnmutedForUserSpeech('manual unmute');
  }

  public isUserMicrophoneMuted(): boolean {
    return this.userManuallyMuted;
  }

  /**
   * FIX: Legacy setMuted for backwards compatibility with UI components.
   */
  public setMuted(muted: boolean): void {
    if (muted) {
      this.muteUserMicrophone();
    } else {
      this.unmuteUserMicrophone();
    }
  }

  /**
   * Disconnect and clean up all resources.
   */
  public async disconnect(): Promise<void> {
    console.log('[RealtimeService] Disconnecting and cleaning up resources...');
    this.semanticMuteController.dispose();

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    InCallManager.stop();
    this.isConnected = false;
    this.sessionId = null;
    this.ephemeralKey = null;
    this.model = null;

    console.log('[RealtimeService] Disconnected');
    this.config.onConnectionStateChange?.('disconnected');
  }

  public isServiceConnected(): boolean {
    return this.isConnected;
  }
}
