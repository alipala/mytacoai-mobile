/**
 * Custom Toast Component - No External Dependencies
 * Professional toast notifications with animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface ToastConfig {
  type: 'success' | 'error' | 'info';
  text1: string;
  text2?: string;
  duration?: number;
  onHide?: () => void;
}

interface CustomToastProps {
  visible: boolean;
  config: ToastConfig;
  onDismiss: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  config,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        hideToast();
      }, config.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
      config.onHide?.();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={26} color="#10B981" />
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={26} color="#EF4444" />
          </View>
        );
      case 'info':
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="information-circle" size={26} color="#3B82F6" />
          </View>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (config.type) {
      case 'success':
        return '#FFFFFF';
      case 'error':
        return '#FFFFFF';
      case 'info':
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    switch (config.type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'info':
        return '#3B82F6';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          hideToast();
        }}
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        {getIcon()}
        <View style={styles.textContainer}>
          <Text style={styles.text1}>{config.text1}</Text>
          {config.text2 && <Text style={styles.text2}>{config.text2}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            hideToast();
          }}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderLeftWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    marginRight: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  text2: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  closeButton: {
    padding: 6,
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Toast Manager - Simple global state
class ToastManager {
  private listeners: Array<(config: ToastConfig | null) => void> = [];

  show(config: ToastConfig) {
    this.listeners.forEach((listener) => listener(config));
  }

  hide() {
    this.listeners.forEach((listener) => listener(null));
  }

  subscribe(listener: (config: ToastConfig | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const toastManager = new ToastManager();

// Global Toast Component to be used in App.tsx
export const GlobalToast: React.FC = () => {
  const [config, setConfig] = React.useState<ToastConfig | null>(null);

  React.useEffect(() => {
    const unsubscribe = toastManager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return (
    <CustomToast
      visible={config !== null}
      config={config || { type: 'info', text1: '' }}
      onDismiss={() => setConfig(null)}
    />
  );
};

// Helper function to show toasts
export const showToast = (config: ToastConfig) => {
  if (config.type === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else if (config.type === 'error') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  toastManager.show(config);
};
