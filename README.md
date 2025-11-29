MyTacoAI Mobile


  MyTacoAI Mobile is a cross-platform language learning application built with React Native and Expo. It provides an immersive, AI-powered
  experience to help users practice and improve their speaking skills in new languages.

  ✨ Key Features


   * AI-Powered Conversations: Engage in real-time voice conversations with an AI tutor.
   * Onboarding Flow: A smooth introduction for new users, including a splash screen and welcome guide.
   * User Authentication: Secure login, registration, password reset, and Google Sign-In.
   * Personalized Practice: Users can select their target language, proficiency level, and conversation topics.
   * Sentence Analysis: Receive instant feedback on grammar, pronunciation, and word choice after a conversation.
   * Dashboard & Progress Tracking: A central hub to view learning plans, track progress, and see achievements.
   * Subscription Management: In-app checkout and subscription handling (likely via Stripe, based on file names).
   * Profile Management: Users can manage their account details and settings.
   * Flashcards: Review and practice vocabulary and key phrases.

  🚀 Technology Stack


   * Framework: React Native (https://reactnative.dev/) with Expo (https://expo.dev/)
   * Language: TypeScript (https://www.typescriptlang.org/)
   * Navigation: React Navigation (https://reactnavigation.org/) (Stack and Tab navigators)
   * API Communication:
       * Axios (https://axios-http.com/) for HTTP requests.
       * OpenAPI (Swagger): The API client in src/api/generated is auto-generated from an openapi.json specification, ensuring type safety between the
         app and the backend.
   * Real-time Communication: WebRTC (https://webrtc.org/) (react-native-webrtc) for real-time voice chat.
   * State Management: React Context and custom hooks.
   * UI & Styling:
       * Core React Native components.
       * Lottie (https://lottiefiles.com/) (lottie-react-native) for rich animations.
       * Expo Vector Icons (https://docs.expo.dev/guides/icons/) for iconography.
   * Local Storage: @react-native-async-storage/async-storage (https://react-native-async-storage.github.io/async-storage/) for persisting data
     locally.

  📂 Project Structure

  The project follows a feature-oriented structure, making it scalable and easy to navigate.



    1 MyTacoAIMobile/
    2 ├── src/
    3 │   ├── api/            # API client, configuration, and generated types/services
    4 │   ├── assets/         # Local images, fonts, and animations
    5 │   ├── components/     # Reusable UI components (e.g., cards, modals)
    6 │   ├── constants/      # Global constants like color palettes
    7 │   ├── context/        # React Context providers for global state
    8 │   ├── hooks/          # Custom React hooks for shared logic
    9 │   ├── navigation/     # Navigation setup and routing logic
   10 │   ├── screens/        # Top-level screen components for each feature
   11 │   ├── services/       # Business logic services (e.g., RealtimeService)
   12 │   └── utils/          # Utility functions (e.g., storage, JWT helpers)
   13 ├── App.js              # Main application entry point and root navigator
   14 ├── app.json            # Expo configuration file for native builds
   15 ├── package.json        # Project dependencies and scripts
   16 └── openapi.json        # OpenAPI specification for the backend API


  🏁 Getting Started

  Prerequisites


   * Node.js (https://nodejs.org/) (LTS version recommended)
   * Yarn (https://yarnpkg.com/) or npm
   * Expo Go (https://expo.dev/go) app on your iOS or Android device for development.
   * For native builds: Xcode (https://developer.apple.com/xcode/) (for iOS) or Android Studio (https://developer.android.com/studio) (for Android).

  Installation

   1. Clone the repository:


   1     git clone <your-repository-url>
   2     cd MyTacoAIMobile


   2. Install dependencies:

   1     npm install

      or

   1     yarn install


  Running the Application


  Execute one of the following commands to start the development server:

   * To run on Expo Go (recommended for development):

   1     npm start

      Scan the QR code with the Expo Go app on your mobile device.

   * To run on an Android emulator/device:


   1     npm run android


   * To run on an iOS simulator/device:

   1     npm run ios


  ⚙️ Available Scripts


   * npm start: Starts the Metro bundler and development server.
   * npm run android: Builds the app and runs it on an Android emulator or connected device.
   * npm run ios: Builds the app and runs it on an iOS simulator or connected device.
   * npm run web: Runs the app in a web browser (compatibility may vary).

  🔄 API Client Generation


  The API client located in src/api/generated is created automatically from the openapi.json file. If the backend API specification changes, you can
  regenerate the client by running:

   1 npx openapi-typescript-codegen --input ./openapi.json --output ./src/api/generated --useOptions