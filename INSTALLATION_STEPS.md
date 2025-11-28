# Installation Steps for WebRTC Support

## Required Dependencies

Run the following commands to install WebRTC support for React Native:

```bash
# Install react-native-webrtc for WebRTC support
npm install react-native-webrtc

# For iOS, install pods
cd ios && pod install && cd ..
```

## Permissions Setup

### iOS (ios/MyTacoAIMobile/Info.plist)

Add these permissions to your Info.plist:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>MyTaco AI needs access to your microphone for conversation practice</string>
<key>NSCameraUsageDescription</key>
<string>MyTaco AI may need camera access for future features</string>
```

### Android (android/app/src/main/AndroidManifest.xml)

Add these permissions:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Post-Installation

After installing dependencies, rebuild your app:

```bash
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```
