/**
 * SkiaParticleBurst Usage Examples
 *
 * This file demonstrates how to use the SkiaParticleBurst component
 * in different scenarios within your challenge screens.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SkiaParticleBurst } from './SkiaParticleBurst';

/**
 * Example 1: Success Feedback
 * Shows particles when user answers correctly
 */
export function SuccessExample() {
  const [showParticles, setShowParticles] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });

  const handleCorrectAnswer = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setTapPosition({ x: locationX, y: locationY });
    setShowParticles(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.answerButton}
        onPress={handleCorrectAnswer}
      >
        <Text>Correct Answer!</Text>
      </TouchableOpacity>

      {showParticles && (
        <SkiaParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          preset="success"
          onComplete={() => setShowParticles(false)}
        />
      )}
    </View>
  );
}

/**
 * Example 2: Combo Milestone
 * Explosive particles when reaching combo milestones (3x, 5x, 10x)
 */
export function ComboExample() {
  const [showParticles, setShowParticles] = useState(false);
  const [combo, setCombo] = useState(0);

  const handleComboMilestone = () => {
    setCombo(combo + 1);
    if (combo % 3 === 0) {
      // Show particles on combo milestones
      setShowParticles(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Combo: {combo}x</Text>
      <TouchableOpacity
        style={styles.answerButton}
        onPress={handleComboMilestone}
      >
        <Text>Build Combo</Text>
      </TouchableOpacity>

      {showParticles && (
        <SkiaParticleBurst
          x={200}
          y={100}
          preset="combo"
          particleCount={60} // More particles for combo!
          onComplete={() => setShowParticles(false)}
        />
      )}
    </View>
  );
}

/**
 * Example 3: XP Gain
 * Subtle particles when XP is awarded
 */
export function XPExample() {
  const [showParticles, setShowParticles] = useState(false);
  const [xp, setXp] = useState(0);

  const handleXPGain = () => {
    setXp(xp + 15);
    setShowParticles(true);
  };

  return (
    <View style={styles.container}>
      <Text>XP: {xp}</Text>
      <TouchableOpacity
        style={styles.answerButton}
        onPress={handleXPGain}
      >
        <Text>Gain XP</Text>
      </TouchableOpacity>

      {showParticles && (
        <SkiaParticleBurst
          x={300}
          y={50}
          preset="xp"
          particleCount={30}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </View>
  );
}

/**
 * Example 4: Session Complete Celebration
 * Maximum particles for session completion
 */
export function CelebrationExample() {
  const [showParticles, setShowParticles] = useState(false);

  const handleSessionComplete = () => {
    setShowParticles(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.answerButton}
        onPress={handleSessionComplete}
      >
        <Text>Complete Session!</Text>
      </TouchableOpacity>

      {showParticles && (
        <SkiaParticleBurst
          x={200}
          y={400}
          preset="celebration"
          particleCount={80} // Maximum particles!
          onComplete={() => setShowParticles(false)}
        />
      )}
    </View>
  );
}

/**
 * Example 5: Custom Configuration
 * Full control over particles
 */
export function CustomExample() {
  const [showParticles, setShowParticles] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.answerButton}
        onPress={() => setShowParticles(true)}
      >
        <Text>Custom Particles</Text>
      </TouchableOpacity>

      {showParticles && (
        <SkiaParticleBurst
          x={200}
          y={300}
          preset="success"
          particleCount={50}
          colors={['#FF6B9D', '#C44569', '#FFA502', '#FFD32A', '#54E346']}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </View>
  );
}

/**
 * Example 6: Integration with Challenge Screen
 * Real-world usage pattern
 */
export function ChallengeIntegrationExample() {
  const [showParticles, setShowParticles] = useState(false);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [combo, setCombo] = useState(0);

  const handleAnswerTap = (event: any, isCorrect: boolean) => {
    if (!isCorrect) return;

    // Get tap position
    const { pageX, pageY } = event.nativeEvent;
    setTapPosition({ x: pageX, y: pageY });

    // Update combo
    setCombo(combo + 1);

    // Show particles
    setShowParticles(true);
  };

  const getPreset = () => {
    if (combo >= 10) return 'celebration';
    if (combo >= 5) return 'combo';
    return 'success';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.comboText}>Combo: {combo}x</Text>

      {/* Your challenge options here */}
      <TouchableOpacity
        style={styles.answerButton}
        onPress={(e) => handleAnswerTap(e, true)}
      >
        <Text>Answer Option</Text>
      </TouchableOpacity>

      {/* Particle effect */}
      {showParticles && (
        <SkiaParticleBurst
          x={tapPosition.x}
          y={tapPosition.y}
          preset={getPreset()}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  answerButton: {
    backgroundColor: '#0F3460',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 8,
  },
  comboText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
});
