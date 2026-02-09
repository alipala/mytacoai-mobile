# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyTacoAI Mobile is a cross-platform language learning application built with React Native and Expo. It provides AI-powered conversations for speaking practice, challenges, progress tracking, and subscription management.

## Development Commands

### Starting Development Server
```bash
npm start              # Start Metro bundler with Expo
npm run ios            # Build and run on iOS simulator/device
npm run android        # Build and run on Android emulator/device
```

### Building for Production
This project uses EAS (Expo Application Services) for builds:
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas build --platform all --profile preview        # Internal testing builds
```

Build profiles are configured in `eas.json`.

### API Client Regeneration
The API client is auto-generated from `openapi.json`:
```bash
npx openapi-typescript-codegen --input ./openapi.json --output ./src/api/generated --useOptions
```

Run this whenever the backend API specification changes. The generated client is located in `src/api/generated/` and should not be manually edited.

## Architecture Overview

### Application Entry Point
- **App.js**: Root component that handles navigation setup, authentication state, onboarding flow, and notification initialization
- Navigation uses React Navigation with both Stack and Tab navigators
- Three main states: Onboarding → Welcome/Auth → Main App (authenticated)

### Core Architecture Patterns

#### Real-Time Communication (WebRTC)
- **src/services/RealtimeService.ts**: Manages WebRTC connections for real-time voice conversations with OpenAI Realtime API
- Uses `react-native-webrtc` for peer connections
- Implements session-based connection flow with ephemeral keys from backend
- **src/services/semanticMuteController.ts**: Handles intelligent audio muting during AI speech
- Audio routing managed by `react-native-incall-manager`

#### API Communication
- **src/api/generated/**: Auto-generated TypeScript API client from OpenAPI spec
- **src/api/config.ts**: API base URL configuration (switches between local dev and production)
- **src/api/services/auth.ts**: Authentication service wrapper with token management
- API client automatically handles authentication tokens via AsyncStorage
- Token expiration validation happens automatically using `src/utils/jwtUtils.ts`

#### State Management
- React Context for global state (e.g., `src/contexts/ChallengeSessionContext.tsx`)
- Custom hooks for shared logic (located in `src/hooks/`)
  - `useStats.ts`: Progress and statistics data
  - `useConversationState.ts`: Conversation session state
  - `useComboSystem.ts`: Gamification combo tracking
  - `useUniversalFeedback.ts`: User feedback animations
- AsyncStorage for persistent local data (`@react-native-async-storage/async-storage`)

#### Internationalization (i18n)
- **src/i18n/config.ts**: i18next configuration with 7 supported languages (en, es, fr, de, nl, pt, tr)
- Translation files: `src/locales/*.json`
- Auto-detects device language, allows user selection
- Language preference persisted to AsyncStorage
- Use `useTranslation()` hook in components, access via `i18n.t('key.path')`

### Screen Organization

#### Main Tab Navigation
1. **Dashboard Tab** (`Learn`): Learning plans, practice sessions, progress overview
2. **News Tab** (`Today`): Daily news articles for language practice
3. **Explore Tab** (`Challenges`): Gamified challenges by language/level
4. **Profile Tab**: User settings, subscription, notifications, DNA analysis

#### Key Flows
- **Practice Flow**: LanguageSelection → TopicSelection → LevelSelection → ConversationLoading → Conversation → SentenceAnalysis
- **Assessment Flow**: AssessmentLanguageSelection → AssessmentTopicSelection → SpeakingAssessmentRecording → SpeakingAssessmentResults
- **Challenge Flow**: Explore (challenge selection) → ChallengeSession (gameplay)
- **Subscription Flow**: Checkout → CheckoutSuccess (Apple/Google IAP integration)

### Important Services

#### Notification System
- **src/services/notificationService.ts**: Push notification setup and handling
- Registers device tokens with backend on login
- Handles foreground notifications and tap actions
- Badge count management for unread notifications
- Cleanup on logout to prevent cross-user notifications

#### Progress & Analytics
- **src/services/statsService.ts**: Aggregated user statistics
- **src/services/dailyStatsService.ts**: Daily progress tracking
- **src/services/progressAPI.ts**: Backend API integration for progress data
- **src/services/achievementService.ts**: Achievement/badge unlocking logic
- **src/services/xpCalculator.ts**: XP/points calculation for gamification

#### In-App Purchases
- **src/services/AppleIAPService.ts**: Apple StoreKit integration
- **src/services/GooglePlayBillingService.ts**: Google Play Billing integration
- Platform-specific subscription handling with `expo-in-app-purchases`

#### Challenge System
- **src/services/challengeService.ts**: Challenge gameplay logic
- **src/services/challengeAPI.ts**: Backend challenge data fetching
- **src/contexts/ChallengeSessionContext.tsx**: Challenge session state management
- Feature flag controlled: `USE_CHALLENGE_API` in `src/config/features.ts`

### Styling & Theme
- **src/constants/colors.ts**: App-wide color palette (dark theme with teal accent)
- Primary accent: `#14B8A6` (teal)
- Dark backgrounds: `#0B1A1F`, `#1A2F38`
- Consistent dark theme across all screens

### Animations & Visual Effects
- Lottie animations: `src/assets/lottie/*.json` (companion states, feedback, loading)
- React Native Reanimated for smooth transitions
- Skia-based particle effects for gamification (`src/components/SkiaParticleBurst.tsx`)
- Confetti cannon for achievements (`react-native-confetti-cannon`)

## Development Practices

### API Configuration
When developing locally, update the IP address in `src/api/config.ts`:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:8000'  // ← Change this
  : 'https://mytacoai.com';
```
Find your local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)

### Working with OpenAPI-Generated Code
- Never manually edit files in `src/api/generated/`
- When backend API changes, regenerate with the command listed above
- Type-safe API calls ensure contracts match between frontend and backend

### Feature Flags
Toggle experimental features in `src/config/features.ts`:
```typescript
setFeatureFlag('USE_CHALLENGE_API', true);
setFeatureFlag('SHOW_API_STATUS_INDICATOR', true);
```

### Platform-Specific Code
- iOS config: `app.json` → `ios` section
- Android config: `app.json` → `android` section, `google-services.json`
- Native modules require rebuilding: `npx expo prebuild` then `npm run ios/android`

### Deep Linking
Supported URL schemes: `mytacoai://` and `com.bigdavinci.MyTacoAI://`
Deep link config is in `App.js` linking object.

## Key Technical Details

### WebRTC Voice Conversation Architecture
1. Backend provides ephemeral session key via `/api/realtime/token` endpoint
2. Client creates RTCPeerConnection with OpenAI session
3. Local microphone stream added to peer connection
4. SDP offer/answer exchange establishes connection
5. Data channel for real-time events (transcription, interruptions, etc.)
6. SemanticMuteController mutes user mic during AI speech to prevent echo

### Authentication Flow
1. User logs in → JWT token stored in AsyncStorage
2. API client auto-injects token in requests via `OpenAPI.TOKEN` function
3. Token expiration checked before each API call
4. Expired tokens automatically cleared, triggering re-auth

### Subscription Status
- Free users: Limited features, hearts system, ads
- Paid subscribers: Unlimited access, no hearts/ads
- Subscription state managed via `src/services/AppleIAPService.ts` or `GooglePlayBillingService.ts`
- Server validates receipts and syncs subscription status

### Navigation State Management
Navigation refs stored in App.js allow programmatic navigation from:
- Notification handlers (deep linking to specific screens)
- Background services
- Modal actions

## Common Patterns

### Adding a New Screen
1. Create screen component in `src/screens/[Feature]/ScreenName.tsx`
2. Register in `App.js` Stack.Navigator with `<Stack.Screen name="ScreenName" component={ScreenComponent} />`
3. Navigate using: `navigation.navigate('ScreenName', { params })`

### Adding Translations
1. Add keys to all files in `src/locales/*.json` (en, es, fr, de, nl, pt, tr)
2. Use in components: `const { t } = useTranslation(); ... {t('namespace.key')}`
3. Maintain consistent key structure across all language files

### API Integration
1. Update `openapi.json` with new endpoint spec
2. Regenerate client: `npx openapi-typescript-codegen ...`
3. Import service from `src/api/generated/services/[ServiceName]`
4. Call methods which return type-safe promises

### Custom Hooks Pattern
Create reusable hooks in `src/hooks/` following existing patterns:
- Encapsulate complex stateful logic
- Return state values and action functions
- Keep components focused on presentation

## Platform Configuration

### iOS
- Bundle ID: `com.bigdavinci.mytaco`
- Apple Team ID: `WD9KS62P6X`
- Uses Apple Sign-In capability
- Photo library access for Speaking DNA sharing
- Microphone permission required for voice practice

### Android
- Package: `com.bigdavinci.MyTacoAI`
- Google Play Billing required
- Firebase Cloud Messaging for push notifications
- Edge-to-edge enabled for modern UI

## Important Notes

- **Dark Theme**: All screens use dark backgrounds; maintain consistency when adding new UI
- **Portrait Only**: App is locked to portrait orientation
- **No Tests**: This project does not have automated tests (no test files in src/)
- **Expo SDK 54**: Using Expo managed workflow with EAS for native builds
- **React Native 0.81.5**: Specific version for compatibility with dependencies

## Related Repository
This mobile app connects to the backend API at `/Users/alipala/CascadeProjects/language-tutor/backend`
