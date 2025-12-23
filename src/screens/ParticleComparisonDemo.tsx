/**
 * Particle System Comparison Demo
 *
 * Side-by-side comparison of Reanimated vs Skia particles
 * Useful for testing and choosing the right system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParticleBurst } from '../components/ParticleBurst';
import { SkiaParticleBurst } from '../components/SkiaParticleBurst';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ParticleComparisonDemo() {
  const [reanimatedActive, setReanimatedActive] = useState(false);
  const [skiaActive, setSkiaActive] = useState(false);
  const [skiaPreset, setSkiaPreset] = useState<'success' | 'combo' | 'xp' | 'celebration'>('success');
  const [tapPosition, setTapPosition] = useState({ x: SCREEN_WIDTH / 2, y: 300 });

  const handleReanimatedTest = () => {
    setReanimatedActive(true);
  };

  const handleSkiaTest = (preset: 'success' | 'combo' | 'xp' | 'celebration') => {
    setSkiaPreset(preset);
    setSkiaActive(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Particle System Comparison</Text>
          <Text style={styles.subtitle}>Tap buttons to test each system</Text>
        </View>

        {/* Reanimated Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color="#06B6D4" />
            <Text style={styles.sectionTitle}>Reanimated Particles</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>• 15 particles</Text>
            <Text style={styles.infoText}>• Circle shapes only</Text>
            <Text style={styles.infoText}>• Basic arc motion</Text>
            <Text style={styles.infoText}>• Lightweight & fast</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonReanimated]}
            onPress={handleReanimatedTest}
          >
            <Text style={styles.buttonText}>Test Reanimated</Text>
          </TouchableOpacity>
        </View>

        {/* Skia Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Skia Particles</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>• 40-80 particles</Text>
            <Text style={styles.infoText}>• Circle + Star + Sparkle shapes</Text>
            <Text style={styles.infoText}>• Physics + glow + trails</Text>
            <Text style={styles.infoText}>• Game-feel optimized</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSkia, styles.buttonSmall]}
              onPress={() => handleSkiaTest('success')}
            >
              <Text style={styles.buttonTextSmall}>Success</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSkia, styles.buttonSmall]}
              onPress={() => handleSkiaTest('combo')}
            >
              <Text style={styles.buttonTextSmall}>Combo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSkia, styles.buttonSmall]}
              onPress={() => handleSkiaTest('xp')}
            >
              <Text style={styles.buttonTextSmall}>XP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSkia, styles.buttonSmall]}
              onPress={() => handleSkiaTest('celebration')}
            >
              <Text style={styles.buttonTextSmall}>Celebration</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comparison Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Feature Comparison</Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>Feature</Text>
              <Text style={styles.tableHeaderCell}>Reanimated</Text>
              <Text style={styles.tableHeaderCell}>Skia</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Particles</Text>
              <Text style={styles.tableCell}>15</Text>
              <Text style={styles.tableCell}>40-80</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Shapes</Text>
              <Text style={styles.tableCell}>1</Text>
              <Text style={styles.tableCell}>3</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Glow</Text>
              <Text style={styles.tableCell}>❌</Text>
              <Text style={styles.tableCell}>✅</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Trails</Text>
              <Text style={styles.tableCell}>❌</Text>
              <Text style={styles.tableCell}>✅</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Physics</Text>
              <Text style={styles.tableCell}>Basic</Text>
              <Text style={styles.tableCell}>Advanced</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Performance</Text>
              <Text style={styles.tableCell}>Good</Text>
              <Text style={styles.tableCell}>Excellent</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Bundle Size</Text>
              <Text style={styles.tableCell}>Small</Text>
              <Text style={styles.tableCell}>+2MB</Text>
            </View>
          </View>
        </View>

        {/* Recommendation */}
        <View style={[styles.section, styles.recommendationSection]}>
          <Ionicons name="bulb" size={32} color="#FFD700" style={styles.bulbIcon} />
          <Text style={styles.recommendationTitle}>Recommendation</Text>
          <Text style={styles.recommendationText}>
            Use <Text style={styles.bold}>Skia particles</Text> for the gamified challenge experience.
            The extra visual fidelity (glow, trails, multiple shapes) significantly enhances the
            "game-feel" and emotional impact.
          </Text>
          <Text style={styles.recommendationText}>
            Keep Reanimated as a lightweight fallback if performance issues arise on older devices.
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.instructionsTitle}>🎯 Next Steps</Text>
          <Text style={styles.instructionText}>1. Test both systems above</Text>
          <Text style={styles.instructionText}>2. Verify 60fps on your device</Text>
          <Text style={styles.instructionText}>3. Choose Skia if performance is good</Text>
          <Text style={styles.instructionText}>4. Integrate into challenge screens</Text>
          <Text style={styles.instructionText}>5. Test on older devices (iPhone X, Pixel 3)</Text>
        </View>
      </ScrollView>

      {/* Particle overlays */}
      {reanimatedActive && (
        <ParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          particleCount={15}
          onComplete={() => setReanimatedActive(false)}
        />
      )}

      {skiaActive && (
        <SkiaParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          preset={skiaPreset}
          onComplete={() => setSkiaActive(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#0F1419',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 6,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonReanimated: {
    backgroundColor: '#06B6D4',
  },
  buttonSkia: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  buttonSmall: {
    flex: 1,
    marginHorizontal: 6,
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  table: {
    marginTop: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingVertical: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
  },
  recommendationSection: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  bulbIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 15,
    color: '#D1D5DB',
    marginBottom: 8,
  },
});
