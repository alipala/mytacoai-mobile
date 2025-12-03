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
        return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#EF4444" />;
      case 'info':
        return <Ionicons name="information-circle" size={24} color="#3B82F6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (config.type) {
      case 'success':
        return '#F0FDF4';
      case 'error':
        return '#FEF2F2';
      case 'info':
        return '#EFF6FF';
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
            borderLeftColor: getBorderColor(),
          },
        ]}
      >
        <View style={styles.iconContainer}>{getIcon()}</View>
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
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
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
