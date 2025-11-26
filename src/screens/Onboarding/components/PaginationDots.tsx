import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { styles, COLORS, SCREEN_WIDTH } from '../styles/OnboardingScreen.styles';

interface PaginationDotsProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
  currentIndex: number;
}

export default function PaginationDots({
  data,
  scrollX,
  currentIndex,
}: PaginationDotsProps) {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1.4, 0.8],
            Extrapolate.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ scale }],
            opacity,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              animatedStyle,
              {
                backgroundColor:
                  index === currentIndex ? COLORS.primary : '#D1D5DB',
              },
            ]}
          />
        );
      })}
    </View>
  );
}
