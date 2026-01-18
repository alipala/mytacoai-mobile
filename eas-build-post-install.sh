#!/bin/bash

# EAS Build Hook: Remove expo-in-app-purchases Android native code
# This package is iOS-only and causes build failures on Android

echo "🔧 [EAS Hook] Removing expo-in-app-purchases Android native code..."

if [ "$EAS_BUILD_PLATFORM" = "android" ]; then
  IAP_ANDROID_DIR="./node_modules/expo-in-app-purchases/android"

  if [ -d "$IAP_ANDROID_DIR" ]; then
    echo "📁 Found: $IAP_ANDROID_DIR"
    rm -rf "$IAP_ANDROID_DIR"
    echo "✅ Removed Android native code for expo-in-app-purchases"
  else
    echo "⚠️  Directory not found: $IAP_ANDROID_DIR"
  fi
else
  echo "ℹ️  Platform is iOS - keeping expo-in-app-purchases"
fi

echo "✅ [EAS Hook] Post-install complete"
