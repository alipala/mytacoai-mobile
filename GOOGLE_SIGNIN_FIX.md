# Fixing Google Sign-In DEVELOPER_ERROR on Android

## Problem
You're getting a `DEVELOPER_ERROR` when trying to use Google Sign-In in your EAS-built APK. This happens because the SHA-1 fingerprint of your app's signing certificate is not registered in Firebase/Google Cloud Console.

## Error Log
```
Error message: DEVELOPER_ERROR: Follow troubleshooting instructions at https://react-native-google-signin.github.io/docs/troubleshooting
ConnectionResult{statusCode=DEVELOPER_ERROR, resolution=null, message=null}
```

## Root Cause
When you build with EAS Build, Expo uses its own managed signing certificate. The SHA-1 fingerprint of this certificate must be added to your Firebase project for Google Sign-In to work.

## Solution

### Step 1: Get the SHA-1 Fingerprint from EAS Build

#### Option A: From EAS Build Dashboard
1. Go to your Expo build page: https://expo.dev/accounts/mytacoai/projects/MyTacoAIMobile/builds
2. Click on your build (build ID: `b228e0aa`)
3. Look for "Credentials" or "Signing Certificate" section
4. Copy the **SHA-1** and **SHA-256** fingerprints

#### Option B: Using EAS CLI
```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to Expo
eas login

# View Android credentials
eas credentials
# Select "Android" -> "production" or "preview" -> View credentials
# Copy the SHA-1 and SHA-256 fingerprints
```

#### Option C: Extract from APK
```bash
# Download your APK from the build page, then:
unzip -p path/to/your-app.apk META-INF/CERT.RSA | keytool -printcert | grep SHA

# Or if you have the APK installed:
adb shell pm path com.bigdavinci.MyTacoAI
# This gives you: package:/data/app/~~xxxxx/com.bigdavinci.MyTacoAI-xxxxx/base.apk

adb pull /data/app/~~xxxxx/com.bigdavinci.MyTacoAI-xxxxx/base.apk mytaco.apk
unzip -p mytaco.apk META-INF/CERT.RSA | keytool -printcert | grep SHA
```

### Step 2: Add SHA-1 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (MyTacoAI)
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. Find your Android app (`com.bigdavinci.MyTacoAI`)
6. Click **Add fingerprint**
7. Paste the **SHA-1** fingerprint
8. Click **Save**
9. **Repeat** for **SHA-256** fingerprint (add it as another fingerprint)

### Step 3: Download Updated google-services.json

1. In Firebase Console, after adding the fingerprints
2. Click **Download google-services.json** button
3. **IMPORTANT**: Replace the file in your project root:
   ```bash
   # Save the downloaded file to your project
   # Make sure it's in the root directory: /MyTacoAIMobile/google-services.json
   ```

### Step 4: Verify Google Cloud Console OAuth Setup

Your app uses this Web Client ID: `41687548204-0go9lqlnve4llpv3vdl48jujddlt2kp5.apps.googleusercontent.com`

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find the OAuth 2.0 Client ID for Web (the one ending in `2kp5`)
5. Verify the **Authorized redirect URIs** are configured

Also check your Android OAuth client:
1. Look for the Android OAuth client
2. Verify the **Package name**: `com.bigdavinci.MyTacoAI`
3. Verify the **SHA-1 fingerprint** matches your EAS build certificate

### Step 5: Rebuild and Test

After updating Firebase and Google Cloud Console:

#### Option A: Rebuild with EAS (Recommended)
```bash
# Rebuild your app with the updated google-services.json
eas build --platform android --profile preview

# Or for production:
eas build --platform android --profile production
```

#### Option B: If google-services.json is in your repo
If the `google-services.json` is committed to your repo and properly configured in `app.json`:
- The existing build should work after you add the SHA-1 to Firebase
- Try **uninstalling and reinstalling** the app:
```bash
adb uninstall com.bigdavinci.MyTacoAI
# Then install the APK again from the build page
```

### Step 6: Test Google Sign-In
1. Open the app on your device
2. Tap "Continue with Google"
3. It should now work without the DEVELOPER_ERROR

## Troubleshooting

### Still Getting DEVELOPER_ERROR?

1. **Double-check SHA-1 fingerprints match**:
   - The fingerprint in Firebase MUST exactly match your EAS build certificate
   - There should be no extra spaces or characters

2. **Clear Google Play Services cache**:
   ```bash
   adb shell pm clear com.google.android.gms
   ```
   Then try signing in again.

3. **Uninstall and reinstall the app**:
   ```bash
   adb uninstall com.bigdavinci.MyTacoAI
   # Reinstall from build page or using:
   adb install path/to/your-app.apk
   ```

4. **Check if you have multiple OAuth clients**:
   - Sometimes there are multiple Android OAuth clients in Google Cloud Console
   - Make sure you update the correct one (matching your package name)

5. **Verify webClientId in code**:
   - Check `src/screens/Auth/LoginScreen.tsx` line 359
   - Web Client ID: `41687548204-0go9lqlnve4llpv3vdl48jujddlt2kp5.apps.googleusercontent.com`
   - Make sure this matches the Web OAuth client in Google Cloud Console

### Need the Exact SHA-1?

Run this to get it from your installed app:
```bash
# Get the APK path
APK_PATH=$(adb shell pm path com.bigdavinci.MyTacoAI | cut -d':' -f2)

# Pull and extract certificate
adb pull $APK_PATH app.apk
unzip -p app.apk META-INF/CERT.RSA | keytool -printcert

# Look for:
# SHA1: XX:XX:XX:XX:XX:XX...
# SHA256: XX:XX:XX:XX:XX:XX...
```

## Important Files Checklist

- [ ] `google-services.json` exists in project root
- [ ] `google-services.json` matches your Firebase project
- [ ] SHA-1 added to Firebase Console
- [ ] SHA-256 added to Firebase Console
- [ ] Package name in Firebase matches: `com.bigdavinci.MyTacoAI`
- [ ] Web Client ID in code matches Google Cloud Console
- [ ] Android OAuth client in Google Cloud Console has correct SHA-1

## Additional Notes

### For Development Builds
If you're building locally with `npx expo run:android`, you'll need to add the **debug keystore SHA-1** as well:

```bash
# Get debug keystore SHA-1 (for local builds)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA
```

Add this fingerprint to Firebase too if you plan to test with local builds.

### For Production
When you create a production build or upload to Google Play Store, you may need to add **Google Play's app signing certificate** SHA-1 as well:

1. Go to Google Play Console
2. Select your app
3. Go to **Release** → **Setup** → **App signing**
4. Copy the **SHA-1 certificate fingerprint** from "App signing key certificate"
5. Add this to Firebase as well

## Quick Reference

**Firebase Console**: https://console.firebase.google.com/
**Google Cloud Console**: https://console.cloud.google.com/
**EAS Builds**: https://expo.dev/accounts/mytacoai/projects/MyTacoAIMobile/builds
**Troubleshooting Guide**: https://react-native-google-signin.github.io/docs/troubleshooting

## Summary

The fix involves:
1. Get SHA-1 from your EAS build
2. Add SHA-1 to Firebase Console
3. Download updated google-services.json (if needed)
4. Rebuild (or just reinstall if google-services.json was already correct)
5. Test Google Sign-In

Good luck! 🚀
