/**
 * TransitionWrapper Component
 *
 * Provides smooth fade transitions between loading and content states
 */

import React, { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import ImmersiveLoader from './ImmersiveLoader';

interface TransitionWrapperProps {
  isLoading: boolean;
  loadingMessage: string;
  children: React.ReactNode;
}

export default function TransitionWrapper({
  isLoading,
  loadingMessage,
  children
}: TransitionWrapperProps) {
  const [showLoader, setShowLoader] = useState(true);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Reset state when loading starts again
  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
      contentOpacity.setValue(0);
    }
  }, [isLoading]);

  // Handle smooth transition when loading completes
  useEffect(() => {
    if (!isLoading && showLoader) {
      // Start fading in content immediately
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const handleLoaderFadeOutComplete = () => {
    setShowLoader(false);
  };

  return (
    <>
      {/* Show loader while loading or during fade-out */}
      {showLoader && (
        <ImmersiveLoader
          message={loadingMessage}
          isVisible={isLoading}
          onFadeOutComplete={handleLoaderFadeOutComplete}
        />
      )}

      {/* Show content with fade-in animation once data is loaded */}
      {!isLoading && (
        <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
          {children}
        </Animated.View>
      )}
    </>
  );
}
