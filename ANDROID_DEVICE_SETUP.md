# Running MyTaco App on Android Device

This guide will help you run the MyTaco React Native app on a physical Android device connected to your MacBook Pro.

## Prerequisites

### 1. Install Android Studio and SDK
If you haven't already:
- Download and install [Android Studio](https://developer.android.com/studio)
- During installation, make sure to install Android SDK, Android SDK Platform, and Android Virtual Device
- Open Android Studio > Settings/Preferences > Appearance & Behavior > System Settings > Android SDK
- Install at least one Android SDK Platform (e.g., Android 14.0 or latest)

### 2. Set up Android SDK environment variables
Add these to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

After adding, run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### 3. Verify ADB is installed
```bash
adb --version
```

If this doesn't work, the environment variables weren't set correctly.

## Prepare Your Android Device

### 1. Enable Developer Options
1. Go to **Settings** > **About phone**
2. Tap **Build number** 7 times until you see "You are now a developer!"

### 2. Enable USB Debugging
1. Go to **Settings** > **System** > **Developer options**
2. Enable **USB debugging**
3. (Recommended) Enable **Stay awake** to prevent screen timeout during development

### 3. Connect Your Device
1. Connect your Android device to your MacBook via USB cable
2. On your device, you'll see a prompt "Allow USB debugging?" - tap **Allow**
3. (Optional) Check "Always allow from this computer" for convenience

### 4. Verify Device Connection
```bash
adb devices
```

You should see output like:
```
List of devices attached
ABC123XYZ    device
```

If you see "unauthorized", check your phone for the USB debugging authorization prompt.

## Running the App

### Method 1: Using npm script (Recommended)
```bash
npm run android
```

### Method 2: Using npx directly
```bash
npx expo run:android
```

### Method 3: Using Expo CLI
```bash
npx expo start
# Then press 'a' to open on Android
```

## First-Time Build

The first time you run the app, Expo will:
1. Generate native Android project files
2. Download dependencies (Gradle, etc.) - this can take 5-10 minutes
3. Build the APK
4. Install it on your device
5. Launch the app

Subsequent runs will be much faster!

## Troubleshooting

### Issue: "adb: command not found"
**Solution:** Your Android SDK path is not set correctly. Follow the environment variables setup above.

### Issue: "No devices/emulators found"
**Solution:**
- Make sure USB debugging is enabled
- Check `adb devices` to see if your device is listed
- Try `adb kill-server && adb start-server` to restart ADB
- Try a different USB cable or USB port

### Issue: Device shows as "unauthorized"
**Solution:**
- Check your phone for the USB debugging authorization prompt
- Revoke USB debugging authorizations in Developer Options, then re-enable and reconnect

### Issue: Build fails with Gradle errors
**Solution:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Issue: "SDK location not found"
**Solution:** Create/edit `android/local.properties`:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### Issue: Port 8081 already in use
**Solution:**
```bash
# Kill the process using port 8081
lsof -ti:8081 | xargs kill -9
# Or use a different port
npx expo start --port 8082
```

## Development Tips

### Hot Reload
- Shake your device to open the developer menu
- Enable "Fast Refresh" for automatic updates when you save files

### View Logs
```bash
# View all logs
adb logcat

# View React Native logs only
npx react-native log-android
```

### Inspect Element
- Shake device > "Show Inspector" to inspect UI elements

### Debug Menu
Shake your device to access:
- Reload
- Debug
- Enable/Disable Fast Refresh
- Toggle Inspector

## Project-Specific Notes

This app uses:
- **Expo SDK 54**
- **React Native 0.81.5**
- **New Architecture enabled** (see `app.json`)
- **Google Services** (requires `google-services.json`)
- **Permissions**: Microphone, Camera, Notifications

Make sure your `google-services.json` is present in the project root for full functionality.

## Common Commands Reference

```bash
# Start development server
npx expo start

# Build and run on Android device
npx expo run:android

# Build release APK
cd android && ./gradlew assembleRelease

# Check connected devices
adb devices

# Restart ADB
adb kill-server && adb start-server

# Uninstall app from device
adb uninstall com.bigdavinci.MyTacoAI

# Clear app data
adb shell pm clear com.bigdavinci.MyTacoAI
```

## Need More Help?

- [Expo Android Setup Docs](https://docs.expo.dev/workflow/android-studio-emulator/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- Check the [Expo Discord](https://chat.expo.dev/) for community support
