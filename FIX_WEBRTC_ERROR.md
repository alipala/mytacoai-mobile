# How to Fix: "Unable to resolve react-native-webrtc" Error

## Problem
The error occurs because `react-native-webrtc` is a **native module** that requires native code compilation. It cannot be loaded by the JavaScript Metro bundler alone.

## Solution

### Step 1: Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

This installs the native iOS dependencies defined in the Podfile.

### Step 2: Rebuild the iOS App

**Option A: Using Expo (Recommended)**
```bash
npx expo run:ios
```

**Option B: Using Xcode**
1. Open `ios/MyTacoAIMobile.xcworkspace` in Xcode (NOT the .xcodeproj file)
2. Select your device/simulator
3. Click Run (▶️) button

### Step 3: Verify

After the app rebuilds and launches:
1. Navigate to Quick Practice
2. Select language, topic, level
3. The app should now load without the import error
4. Check console for `[RealtimeService]` logs

---

## For Android

If testing on Android:

```bash
npx expo run:android
```

---

## Why This Happened

1. **Native Modules**: `react-native-webrtc` contains native iOS/Android code
2. **Expo Requirement**: Native modules require a development build, not Expo Go
3. **Prebuild**: We ran `expo prebuild` which generated the native `ios/` and `android/` directories
4. **Rebuild**: You must rebuild the app to compile the native code

---

## Troubleshooting

### Error: "pod: command not found"
```bash
# Install CocoaPods first
sudo gem install cocoapods
```

### Error: "No Podfile found"
```bash
# Run prebuild again
npx expo prebuild --clean
```

### Metro bundler cache issues
```bash
# Clear cache
rm -rf node_modules
npm install
npx expo start --clear
```

### Still getting import errors
```bash
# Full clean rebuild
rm -rf node_modules ios android
npm install
npx expo prebuild
cd ios && pod install && cd ..
npx expo run:ios
```

---

## Notes

- **Cannot use Expo Go**: WebRTC requires a development build
- **First time**: Build may take 5-10 minutes
- **Subsequent builds**: Much faster (incremental compilation)
- **Simulator**: Audio may not work properly, use physical device for testing
- **M1/M2 Macs**: If you get architecture errors, add this to ios/Podfile:

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
    end
  end
end
```

---

## Quick Reference

```bash
# Full setup from scratch
npm install
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios

# Quick rebuild (after code changes)
npx expo run:ios
```
