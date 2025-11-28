# WebRTC Implementation for Quick Practice Flow

## Overview

This document describes the WebRTC implementation for real-time voice conversations in the MyTaco AI mobile app. The implementation follows the same pattern as the web application but uses React Native and `react-native-webrtc` instead of browser APIs.

## Architecture

### 1. RealtimeService (`src/services/RealtimeService.ts`)

The `RealtimeService` class handles all WebRTC communication with OpenAI's Realtime API:

**Key Features:**
- Establishes WebRTC peer connection with OpenAI
- Manages audio streaming (bidirectional)
- Handles data channel for control events
- Implements server-side Voice Activity Detection (VAD)
- Provides transcript callbacks for UI updates
- Manages connection lifecycle

**Connection Flow:**
1. Get ephemeral key from backend (`/api/realtime/token`)
2. Request microphone permission via React Native
3. Create RTCPeerConnection with STUN servers
4. Add local audio track (microphone)
5. Create data channel (`oai-events`)
6. Create and send SDP offer to OpenAI
7. Receive and set SDP answer from OpenAI
8. Begin real-time audio streaming

**Audio Configuration:**
```javascript
{
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}
```

### 2. ConversationScreen Integration

The ConversationScreen has been updated to use the RealtimeService:

**Key Changes:**
- Import and initialize `RealtimeService`
- Handle real-time transcripts via callbacks
- Manage microphone mute/unmute state
- Proper cleanup on unmount
- Connection state management

**Event Handlers:**
```typescript
{
  onTranscript: (transcript, role) => {
    // Add transcript as message to UI
  },
  onError: (error) => {
    // Handle errors
  },
  onConnectionStateChange: (state) => {
    // Update UI based on connection state
  },
  onEvent: (event) => {
    // Log all WebRTC events for debugging
  }
}
```

## Installation & Setup

### Dependencies Installed

```bash
npm install react-native-webrtc
```

### Permissions Configured

**iOS (app.json):**
```json
"NSMicrophoneUsageDescription": "This app needs access to your microphone to enable voice conversations for language practice.",
"NSCameraUsageDescription": "This app may need access to your camera for future video features."
```

**Android (app.json):**
```json
"permissions": [
  "RECORD_AUDIO",
  "CAMERA",
  "INTERNET",
  "ACCESS_NETWORK_STATE",
  "MODIFY_AUDIO_SETTINGS"
]
```

### Build Requirements

After installing dependencies, you need to rebuild the native iOS/Android apps:

```bash
# iOS
cd ios && pod install && cd ..
npx expo run:ios

# Android
npx expo run:android
```

> **Note:** You cannot test WebRTC functionality in Expo Go. You must build a development build or production build.

## How It Works

### 1. User Starts Conversation

When the user dismisses the "Important Information" modal:
- `handleStartConversation()` is called
- Session timer starts
- `initializeConversation()` begins WebRTC setup

### 2. WebRTC Connection Establishment

```typescript
realtimeServiceRef.current = new RealtimeService({
  language,
  level,
  topic,
  voice: 'alloy',
  // ... callbacks
});

await realtimeServiceRef.current.connect();
```

The service:
1. Gets ephemeral key from backend
2. Requests microphone permission
3. Sets up peer connection
4. Exchanges SDP with OpenAI
5. Establishes audio streaming

### 3. Real-Time Conversation

**Server-Side VAD (Voice Activity Detection):**
- OpenAI detects when user starts/stops speaking
- No manual "push to talk" needed (though mic can be muted)
- Automatic turn-taking between user and AI

**Transcript Flow:**
```
User speaks → OpenAI transcribes → onTranscript('...', 'user') → Add to messages
AI responds → OpenAI transcribes → onTranscript('...', 'assistant') → Add to messages
```

**Audio Flow:**
```
Microphone → Local Audio Track → Peer Connection → OpenAI
OpenAI → Remote Audio Track → Device Speakers
```

### 4. Microphone Control

The recording button controls microphone muting:
- Green button (mic icon): Microphone active
- Red button (stop icon): Microphone muted
- Muting prevents audio from being sent to OpenAI
- Does not disconnect the session

### 5. End Session

When user ends the session:
1. Disconnect WebRTC service
2. Save conversation to backend
3. Navigate back to dashboard

## Testing Checklist

### Pre-Testing Requirements

- [ ] Build a development build (cannot use Expo Go)
- [ ] Ensure device has microphone permission
- [ ] Use physical device (simulator may have audio issues)
- [ ] Use headphones to prevent echo/feedback

### Test Cases

1. **Connection Flow**
   - [ ] Start Quick Practice
   - [ ] Select language, topic, level
   - [ ] Wait for loading screen
   - [ ] Verify "Important Information" modal appears
   - [ ] Tap "Got it! Let's start"
   - [ ] Verify connection establishes successfully

2. **Microphone Permission**
   - [ ] First time: OS permission prompt appears
   - [ ] Grant permission
   - [ ] Subsequent times: No permission prompt

3. **Voice Conversation**
   - [ ] Speak clearly into microphone
   - [ ] Verify your transcript appears as user message
   - [ ] Verify AI responds with voice
   - [ ] Verify AI transcript appears as assistant message
   - [ ] Check messages appear in chat UI

4. **Microphone Mute/Unmute**
   - [ ] Tap mic button to mute (turns red)
   - [ ] Speak - verify no transcript appears
   - [ ] Tap mic button to unmute (turns green)
   - [ ] Speak - verify transcript appears

5. **Session Duration**
   - [ ] Verify timer updates in header
   - [ ] Format should be MM:SS

6. **End Session**
   - [ ] Tap "End" button
   - [ ] Verify modal shows duration and message count
   - [ ] Tap "End Session"
   - [ ] Verify session saves to backend
   - [ ] Verify navigation to dashboard

7. **Error Handling**
   - [ ] Test with no internet connection
   - [ ] Test with denied microphone permission
   - [ ] Verify error messages appear
   - [ ] Verify retry functionality works

8. **Cleanup**
   - [ ] End session normally
   - [ ] Verify no memory leaks
   - [ ] Force quit app mid-session
   - [ ] Reopen app - verify clean state

## Debugging

### Enable Console Logs

All logs are prefixed with tags:
- `[RealtimeService]` - Service-level operations
- `[CONVERSATION]` - ConversationScreen operations

**Key logs to watch:**
```
[RealtimeService] Starting connection...
[RealtimeService] Ephemeral key received
[RealtimeService] Microphone access granted
[RealtimeService] Setting up peer connection...
[RealtimeService] SDP exchange completed
[RealtimeService] Data channel opened
[RealtimeService] Connection established successfully
[RealtimeService] Event received: conversation.item.input_audio_transcription.completed
[RealtimeService] Event received: response.audio_transcript.done
```

### Common Issues

**1. "Microphone permission denied"**
- Solution: Check app permissions in device settings
- iOS: Settings > MyTaco AI > Microphone
- Android: Settings > Apps > MyTaco AI > Permissions

**2. "Failed to get authentication token"**
- Solution: Check backend API is running and accessible
- Verify token endpoint: `/api/realtime/token`

**3. "OpenAI API error"**
- Solution: Check ephemeral key is valid
- Verify OpenAI API endpoint is accessible
- Check backend logs for token generation errors

**4. No audio output**
- Solution: Check device volume
- Use headphones
- Verify remote audio track is connected
- Check device audio output settings

**5. Echo or feedback**
- Solution: Use headphones
- Ensure echo cancellation is enabled
- Test in quiet environment

## API Integration

### Backend Endpoint

**POST** `/api/realtime/token`

**Request:**
```json
{
  "language": "spanish",
  "level": "B1",
  "topic": "travel",
  "voice": "alloy"
}
```

**Response:**
```json
{
  "client_secret": {
    "value": "eph_..."
  }
}
```

### OpenAI Realtime API

**Endpoint:** `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`

**Method:** POST (SDP offer)

**Headers:**
```
Authorization: Bearer <ephemeral_key>
Content-Type: application/sdp
```

**Body:** SDP offer from RTCPeerConnection

**Response:** SDP answer (text/plain)

## Key Events

The service handles these WebRTC events:

### Session Events
- `session.created` - Session initialized
- `session.updated` - Session configuration updated

### Conversation Events
- `conversation.created` - Conversation started
- `conversation.item.created` - New item added

### Input Audio Events
- `input_audio_buffer.speech_started` - User started speaking
- `input_audio_buffer.speech_stopped` - User stopped speaking
- `conversation.item.input_audio_transcription.completed` - User speech transcribed

### Response Events
- `response.created` - AI response started
- `response.audio_transcript.done` - AI response transcribed
- `response.audio.delta` - Audio chunk received
- `response.audio.done` - Audio response complete
- `response.done` - Response complete

### Error Events
- `error` - Error occurred

## Performance Considerations

1. **Battery Usage:** WebRTC audio streaming is battery-intensive
2. **Network Usage:** Continuous audio streaming requires stable connection
3. **Memory:** Proper cleanup prevents memory leaks
4. **Audio Latency:** Aim for <300ms round-trip time

## Future Enhancements

Potential improvements to consider:

1. **Voice Selection:** Allow users to choose AI voice (alloy, echo, fable, onyx, nova, shimmer)
2. **Push to Talk Mode:** Option to disable VAD and use manual control
3. **Audio Visualization:** Show waveform or audio level indicators
4. **Offline Handling:** Better UX when connection drops
5. **Background Audio:** Continue session when app is backgrounded
6. **Recording Export:** Save conversation audio for review
7. **Real-Time Hints:** Show conversation hints during silence
8. **Interruption Handling:** Better handling of phone calls, notifications

## Security Notes

1. **Ephemeral Keys:** Keys expire after session ends
2. **HTTPS Only:** All communication encrypted
3. **Permissions:** Request microphone permission only when needed
4. **No Recording:** Audio is not stored locally or on backend (only transcripts)

## Resources

- [React Native WebRTC Documentation](https://github.com/react-native-webrtc/react-native-webrtc)
- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/api-reference/realtime)
- [WebRTC MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## Summary

The WebRTC implementation provides real-time, low-latency voice conversations between users and AI tutors. The architecture mirrors the web application but uses React Native APIs for mobile compatibility. The system is production-ready with proper error handling, cleanup, and user experience considerations.
