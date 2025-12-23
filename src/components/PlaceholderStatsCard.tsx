/**
 * Placeholder Stats Card
 *
 * Shows a beautiful sample graph and stats for new users
 * Makes them excited about what they'll achieve!
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function PlaceholderStatsCard() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sample data points (showing an upward trend)
  const sampleData = [30, 45, 40, 60, 75, 70, 85];
  const chartWidth = width - 140;
  const chartHeight = 80;
  const stepX = chartWidth / (sampleData.length - 1);

  // Create polyline points
  const minValue = Math.min(...sampleData);
  const maxValue = Math.max(...sampleData);
  const range = maxValue - minValue;

  const sparklinePoints = sampleData
    .map((value, index) => {
      const x = 40 + index * stepX;
      const y = chartHeight - ((value - minValue) / range) * chartHeight + 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Journey Awaits! 🚀</Text>
          <Text style={styles.subtitle}>Start practicing to see your progress</Text>
        </View>

        {/* Sample Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>85%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>7🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Sample Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Your Progress Graph</Text>
          <Svg width={chartWidth + 80} height={chartHeight + 20}>
            {/* Grid lines */}
            <Line x1="40" y1="10" x2={chartWidth + 40} y2="10" stroke="#E5E7EB" strokeWidth="1" />
            <Line x1="40" y1={chartHeight / 2 + 10} x2={chartWidth + 40} y2={chartHeight / 2 + 10} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <Line x1="40" y1={chartHeight + 10} x2={chartWidth + 40} y2={chartHeight + 10} stroke="#E5E7EB" strokeWidth="1" />

            {/* Sparkline */}
            <Polyline
              points={sparklinePoints}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {sampleData.map((value, index) => {
              const x = 40 + index * stepX;
              const y = chartHeight - ((value - minValue) / range) * chartHeight + 10;
              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#06B6D4"
                  strokeWidth="2"
                />
              );
            })}

            {/* Y-axis labels */}
            <SvgText
              x="5"
              y="15"
              fontSize="10"
              fill="#6B7280"
              fontWeight="600"
            >
              100%
            </SvgText>
            <SvgText
              x="15"
              y={chartHeight + 15}
              fontSize="10"
              fill="#6B7280"
              fontWeight="600"
            >
              0%
            </SvgText>
          </Svg>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={['#4ECFBF', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>👇 Start Your First Challenge Below!</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#0891B2',
    fontWeight: '500',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#0891B2',
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
