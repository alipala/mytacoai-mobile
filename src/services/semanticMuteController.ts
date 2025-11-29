import { MediaStream, MediaStreamTrack } from 'react-native-webrtc';
import { RealtimeEvent } from './types';

/**
 * SemanticMuteController - Universal muting controller for semantic VAD
 * Implements dual-layer muting and semantic processing delays to prevent AI self-hearing.
 * Adapted for React Native from the web implementation.
 */

export interface SemanticMuteState {
  isMuted: boolean;
  isAISpeaking: boolean;
  delayedUnmuteTimeout: NodeJS.Timeout | null;
  lastMuteReason: string;
}

export class SemanticMuteController {
  private audioTracks: MediaStreamTrack[] = [];
  private state: SemanticMuteState;

  // Semantic VAD delays from the web implementation
  private readonly SEMANTIC_PROCESSING_DELAY = 100;
  private readonly AI_SPEECH_TAIL_PROTECTION = 100;

  private userManualMuteChecker: (() => boolean) | null = null;

  constructor() {
    this.state = {
      isMuted: false,
      isAISpeaking: false,
      delayedUnmuteTimeout: null,
      lastMuteReason: 'initialized',
    };
    console.log('🔇 [SemanticMuteController] Initialized');
  }

  public setUserManualMuteChecker(checker: () => boolean): void {
    this.userManualMuteChecker = checker;
  }

  public initialize(mediaStream: MediaStream): boolean {
    this.audioTracks = mediaStream.getAudioTracks();
    if (this.audioTracks.length === 0) {
      console.error('❌ [SemanticMuteController] No audio tracks found');
      return false;
    }
    console.log(`✅ [SemanticMuteController] Initialized with ${this.audioTracks.length} audio tracks`);
    return true;
  }

  public muteForAISpeech(reason: string = 'AI speaking'): void {
    this.state.isAISpeaking = true;
    this.state.lastMuteReason = reason;
    this.clearDelayedUnmute();
    this.applyMute(true, `Mute for AI: ${reason}`);
  }

  public scheduleUnmuteAfterAISpeech(reason: string = 'AI speech ended'): void {
    this.state.isAISpeaking = false;
    this.state.lastMuteReason = `schedule unmute: ${reason}`;
    this.clearDelayedUnmute();

    const totalDelay = this.SEMANTIC_PROCESSING_DELAY + this.AI_SPEECH_TAIL_PROTECTION;
    console.log(`⏱️ [SemanticMuteController] Unmuting in ${totalDelay}ms`);

    this.state.delayedUnmuteTimeout = setTimeout(() => {
      if (this.userManualMuteChecker && this.userManualMuteChecker()) {
        console.log('🔇 [SemanticMuteController] SKIPPING UNMUTE - User has manually muted');
        this.state.delayedUnmuteTimeout = null;
        return;
      }
      this.applyMute(false, `Execute delayed unmute: ${reason}`);
      this.state.delayedUnmuteTimeout = null;
    }, totalDelay);
  }

  public ensureUnmutedForUserSpeech(reason: string = 'User speech detected'): void {
    if (this.userManualMuteChecker && this.userManualMuteChecker()) {
      console.log('🔇 [SemanticMuteController] SKIPPING UNMUTE - User has manually muted');
      return;
    }
    this.clearDelayedUnmute();
    this.state.isAISpeaking = false;
    this.state.lastMuteReason = reason;
    this.applyMute(false, `Unmute for user: ${reason}`);
  }

  private applyMute(shouldMute: boolean, reason: string): void {
    const action = shouldMute ? 'Muting' : 'Unmuting';
    console.log(`🎛️ [SemanticMuteController] ${action}. Reason: ${reason}`);

    this.audioTracks.forEach((track, index) => {
      if (track.readyState === 'live') {
        track.enabled = !shouldMute;
      }
    });
    this.state.isMuted = shouldMute;
  }

  private clearDelayedUnmute(): void {
    if (this.state.delayedUnmuteTimeout) {
      clearTimeout(this.state.delayedUnmuteTimeout);
      this.state.delayedUnmuteTimeout = null;
    }
  }

  public handleRealtimeEvent(event: RealtimeEvent): void {
    switch (event.type) {
      case 'response.audio.start':
        this.muteForAISpeech('OpenAI audio response started');
        break;
      case 'response.audio.done':
      case 'response.done':
        this.scheduleUnmuteAfterAISpeech('OpenAI audio response completed');
        break;
      case 'input_audio_buffer.speech_started':
        this.ensureUnmutedForUserSpeech('User speech detected by semantic VAD');
        break;
      case 'response.audio.delta':
        if (!this.state.isMuted) {
          this.muteForAISpeech('AI audio delta received');
        }
        break;
    }
  }

  public dispose(): void {
    this.clearDelayedUnmute();
    this.audioTracks = [];
    console.log('✅ [SemanticMuteController] Disposed');
  }
}