import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { SpeakingAssessmentResponse } from '../../api/generated';
import { CreateLearningPlanModal } from '../../components/CreateLearningPlanModal';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SpeakingAssessmentResultsScreenProps {
  navigation: any;
  route: any;
}

const SpeakingAssessmentResultsScreen: React.FC<SpeakingAssessmentResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { language, topicName, assessmentResult, audioUri, recordingDuration } = route.params;
  const result: SpeakingAssessmentResponse = assessmentResult;

  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Audio playback state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(recordingDuration || 60);

  const handleSaveAndProceed = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowCreatePlanModal(true);
  };

  const handleCreatePlan = async (planData: { planId: string }) => {
    setShowCreatePlanModal(false);

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    console.log('✅ Learning plan created:', planData.planId);
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  const handleGoToDashboard = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('Main', { screen: 'Dashboard' });
  };

  // Audio playback handlers
  const handlePlayPause = async () => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (!audioUri) {
        console.warn('[AUDIO] No audio URI available');
        return;
      }

      if (isPlaying) {
        // Pause audio
        if (sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
      } else {
        // Play audio
        if (sound) {
          // Resume existing sound
          await sound.playAsync();
          setIsPlaying(true);
        } else {
          // Load and play new sound
          setIsLoadingAudio(true);
          console.log('[AUDIO] Loading audio from URI:', audioUri);

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: true },
            (status) => {
              if (status.isLoaded) {
                setPlaybackPosition(status.positionMillis / 1000);
                if (status.durationMillis) {
                  setPlaybackDuration(status.durationMillis / 1000);
                }
                if (status.didJustFinish) {
                  setIsPlaying(false);
                  setPlaybackPosition(0);
                }
              }
            }
          );

          setSound(newSound);
          setIsPlaying(true);
          setIsLoadingAudio(false);
          console.log('[AUDIO] Audio loaded and playing');
        }
      }
    } catch (error) {
      console.error('[AUDIO] Error playing audio:', error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        console.log('[AUDIO] Unloading sound');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getGradientColors = (score: number): string[] => {
    if (score >= 80) return ['#10B981', '#059669'];
    if (score >= 60) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  const skills = [
    { label: 'Pronunciation', score: result.pronunciation.score, icon: 'mic-outline', feedback: result.pronunciation.feedback },
    { label: 'Grammar', score: result.grammar.score, icon: 'create-outline', feedback: result.grammar.feedback },
    { label: 'Vocabulary', score: result.vocabulary.score, icon: 'book-outline', feedback: result.vocabulary.feedback },
    { label: 'Fluency', score: result.fluency.score, icon: 'speedometer-outline', feedback: result.fluency.feedback },
    { label: 'Coherence', score: result.coherence.score, icon: 'git-network-outline', feedback: result.coherence.feedback },
  ];

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Animate progress ring on mount
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: result.overall_score,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get unique icon color for each skill
  const getSkillIconColor = (index: number): string => {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    return colors[index % colors.length];
  };

  // Overview Tab
  const renderOverview = () => {
    const size = 180;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = result.overall_score / 100;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.tabContent}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.overviewScrollContent}>
          {/* Hero Section with Score */}
          <View style={styles.scoreContainer}>
            {/* Circular Progress Ring with SVG */}
            <View style={styles.progressRingContainer}>
              <Svg width={size} height={size} style={styles.svgProgress}>
                {/* Background Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(31, 41, 55, 0.8)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={getScoreColor(result.overall_score)}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              </Svg>

              {/* Score Text Overlay */}
              <View style={styles.progressRingInner}>
                <Text style={styles.overallScoreText}>{result.overall_score}</Text>
                <View style={styles.scoreMaxContainer}>
                  <View style={styles.scoreMaxDivider} />
                  <Text style={styles.scoreMaxText}>100</Text>
                </View>
              </View>
            </View>

            {/* Score Info */}
            <View style={styles.scoreInfo}>
              <Text style={styles.recommendedLevel}>
                Recommended Level: <Text style={styles.levelText}>{result.recommended_level}</Text>
              </Text>
            </View>
          </View>

          {/* Audio Player Card */}
          {audioUri && (
            <View style={styles.audioPlayerCard}>
              <View style={styles.audioPlayerHeader}>
                <Ionicons name="musical-notes-outline" size={20} color="#14B8A6" />
                <Text style={styles.audioPlayerTitle}>Your Recording</Text>
                <Text style={styles.audioPlayerDuration}>
                  {Math.floor(playbackPosition)}s / {Math.floor(playbackDuration)}s
                </Text>
              </View>

              {/* Play/Pause Button */}
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                disabled={isLoadingAudio}
              >
                {isLoadingAudio ? (
                  <ActivityIndicator size="large" color="#14B8A6" />
                ) : (
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={64}
                    color="#14B8A6"
                  />
                )}
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${(playbackPosition / playbackDuration) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.audioPlayerHint}>
                <Ionicons name="headset-outline" size={14} color="#9CA3AF" /> Tap to listen to your assessment recording
              </Text>
            </View>
          )}

          {/* Transcript Card */}
          <View style={styles.transcriptCard}>
            <View style={styles.transcriptHeader}>
              <Ionicons name="chatbubble-outline" size={20} color="#14B8A6" />
              <Text style={styles.transcriptTitle}>What You Said</Text>
            </View>
            <Text style={styles.transcriptText}>{result.recognized_text}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Skills Detail Tab
  const renderSkillsDetail = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        <Text style={styles.tabTitle}>Skills Breakdown</Text>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillDetailCard}>
            <View style={styles.skillDetailHeader}>
              <View style={[styles.skillIconContainer, { backgroundColor: getSkillIconColor(index) + '20' }]}>
                <Ionicons name={skill.icon as any} size={24} color={getSkillIconColor(index)} />
              </View>
              <View style={styles.skillDetailInfo}>
                <Text style={styles.skillDetailLabel}>{skill.label}</Text>
                <View style={styles.skillDetailScoreContainer}>
                  <View style={styles.skillDetailScoreBar}>
                    <View
                      style={[
                        styles.skillDetailScoreFill,
                        {
                          width: `${skill.score}%`,
                          backgroundColor: getSkillIconColor(index),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.skillDetailScoreText, { color: getSkillIconColor(index) }]}>
                    {skill.score}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.skillFeedback}>{skill.feedback}</Text>
            {skill.examples && skill.examples.length > 0 && (
              <View style={styles.examplesContainer}>
                {skill.examples.map((example, i) => (
                  <View key={i} style={styles.exampleItem}>
                    <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Action Plan Tab
  const renderActionPlan = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.tabScrollContent, { paddingTop: 24 }]}>
        {/* Strengths */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.actionSectionTitle}>Your Strengths</Text>
          </View>
          {result.strengths.map((strength, index) => (
            <View key={index} style={styles.actionItem}>
              <View style={styles.strengthBullet} />
              <Text style={styles.actionText}>{strength}</Text>
            </View>
          ))}
        </View>

        {/* Areas for Improvement */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <Ionicons name="trending-up" size={24} color="#3B82F6" />
            <Text style={styles.actionSectionTitle}>Areas to Improve</Text>
          </View>
          {result.areas_for_improvement.map((area, index) => (
            <View key={index} style={styles.actionItem}>
              <View style={styles.improvementBullet} />
              <Text style={styles.actionText}>{area}</Text>
            </View>
          ))}
        </View>

        {/* Next Steps */}
        <View style={styles.actionSection}>
          <View style={styles.actionSectionHeader}>
            <Ionicons name="footsteps" size={24} color="#10B981" />
            <Text style={styles.actionSectionTitle}>Next Steps</Text>
          </View>
          {result.next_steps.map((step, index) => (
            <View key={index} style={styles.actionItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.actionText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // DNA Profile Tab - NEW!
  const renderDNAProfile = () => {
    const dnaProfile = result.dna_profile;

    if (!dnaProfile) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.dnaPlaceholder}>
            <Ionicons name="flask-outline" size={64} color="#6B7280" />
            <Text style={styles.dnaPlaceholderTitle}>DNA Analysis Coming Soon</Text>
            <Text style={styles.dnaPlaceholderText}>
              Complete a few more practice sessions to unlock your Speaking DNA profile
            </Text>
          </View>
        </View>
      );
    }

    const strands = dnaProfile.dna_strands || {};
    const acousticMetrics = dnaProfile.baseline_assessment?.acoustic_metrics || {};

    // DNA Strand data with colors and icons
    const dnaData = [
      {
        key: 'rhythm',
        label: 'Rhythm',
        data: strands.rhythm,
        color: '#8B5CF6',
        icon: 'pulse-outline',
        getValue: () => strands.rhythm?.words_per_minute_avg || 0,
        getSubtext: () => strands.rhythm?.type || 'Analyzing...'
      },
      {
        key: 'confidence',
        label: 'Confidence',
        data: strands.confidence,
        color: '#F59E0B',
        icon: 'flash-outline',
        getValue: () => (strands.confidence?.score || 0) * 100,
        getSubtext: () => strands.confidence?.level || 'Analyzing...'
      },
      {
        key: 'vocabulary',
        label: 'Vocabulary',
        data: strands.vocabulary,
        color: '#10B981',
        icon: 'book-outline',
        getValue: () => strands.vocabulary?.unique_words_per_session || 0,
        getSubtext: () => strands.vocabulary?.style || 'Analyzing...'
      },
      {
        key: 'accuracy',
        label: 'Accuracy',
        data: strands.accuracy,
        color: '#EF4444',
        icon: 'checkmark-circle-outline',
        getValue: () => (strands.accuracy?.grammar_accuracy || 0) * 100,
        getSubtext: () => strands.accuracy?.pattern || 'Analyzing...'
      },
      {
        key: 'learning',
        label: 'Learning',
        data: strands.learning,
        color: '#3B82F6',
        icon: 'trending-up-outline',
        getValue: () => (strands.learning?.challenge_acceptance || 0) * 100,
        getSubtext: () => strands.learning?.type || 'Analyzing...'
      },
      {
        key: 'emotional',
        label: 'Emotional',
        data: strands.emotional,
        color: '#EC4899',
        icon: 'heart-outline',
        getValue: () => ((strands.emotional?.session_start_confidence || 0) + (strands.emotional?.session_end_confidence || 0)) * 50,
        getSubtext: () => strands.emotional?.pattern || 'Analyzing...'
      },
    ];

    return (
      <View style={styles.tabContent}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.tabScrollContent, { paddingTop: 16 }]}>
          {/* DNA Header */}
          <View style={styles.dnaHeader}>
            <Text style={styles.dnaHeaderEmoji}>🧬</Text>
            <Text style={styles.dnaHeaderTitle}>Your Speaking DNA</Text>
            <Text style={styles.dnaHeaderSubtitle}>
              {dnaProfile.overall_profile?.speaker_archetype || 'Unique Speaker Profile'}
            </Text>
          </View>

          {/* DNA Strands */}
          <View style={styles.dnaStrandsSection}>
            <Text style={styles.dnaSectionTitle}>DNA Strands</Text>
            {dnaData.map((strand, index) => (
              <View key={strand.key} style={styles.dnaStrandCard}>
                <View style={styles.dnaStrandHeader}>
                  <View style={[styles.dnaStrandIconContainer, { backgroundColor: strand.color + '20' }]}>
                    <Ionicons name={strand.icon as any} size={24} color={strand.color} />
                  </View>
                  <View style={styles.dnaStrandInfo}>
                    <Text style={styles.dnaStrandLabel}>{strand.label}</Text>
                    <Text style={styles.dnaStrandSubtext}>{strand.getSubtext()}</Text>
                  </View>
                  <View style={styles.dnaStrandValueContainer}>
                    <Text style={[styles.dnaStrandValue, { color: strand.color }]}>
                      {Math.round(strand.getValue())}
                    </Text>
                  </View>
                </View>
                {strand.data?.description && (
                  <Text style={styles.dnaStrandDescription}>{strand.data.description}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Acoustic Metrics - Voice Signature */}
          {Object.keys(acousticMetrics).length > 0 && (
            <View style={styles.acousticSection}>
              <Text style={styles.dnaSectionTitle}>🎤 Voice Signature</Text>

              {/* Pitch Analysis */}
              <View style={styles.acousticCard}>
                <View style={styles.acousticHeader}>
                  <Ionicons name="musical-note-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.acousticTitle}>Pitch Profile</Text>
                </View>
                <View style={styles.acousticMetricsGrid}>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Average</Text>
                    <Text style={styles.acousticMetricValue}>
                      {Math.round(acousticMetrics.pitch_mean || 0)} Hz
                    </Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Range</Text>
                    <Text style={styles.acousticMetricValue}>
                      {Math.round(acousticMetrics.pitch_std || 0)} Hz
                    </Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Min</Text>
                    <Text style={styles.acousticMetricValue}>
                      {Math.round(acousticMetrics.pitch_min || 0)} Hz
                    </Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Max</Text>
                    <Text style={styles.acousticMetricValue}>
                      {Math.round(acousticMetrics.pitch_max || 0)} Hz
                    </Text>
                  </View>
                </View>
              </View>

              {/* Voice Quality */}
              <View style={styles.acousticCard}>
                <View style={styles.acousticHeader}>
                  <Ionicons name="radio-outline" size={20} color="#10B981" />
                  <Text style={styles.acousticTitle}>Voice Quality</Text>
                </View>
                <View style={styles.acousticMetricsGrid}>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Jitter</Text>
                    <Text style={styles.acousticMetricValue}>
                      {((acousticMetrics.jitter || 0) * 100).toFixed(2)}%
                    </Text>
                    <Text style={styles.acousticMetricHint}>Voice stability</Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Shimmer</Text>
                    <Text style={styles.acousticMetricValue}>
                      {((acousticMetrics.shimmer || 0) * 100).toFixed(2)}%
                    </Text>
                    <Text style={styles.acousticMetricHint}>Volume control</Text>
                  </View>
                </View>
              </View>

              {/* Speaking Patterns */}
              <View style={styles.acousticCard}>
                <View style={styles.acousticHeader}>
                  <Ionicons name="time-outline" size={20} color="#F59E0B" />
                  <Text style={styles.acousticTitle}>Speaking Patterns</Text>
                </View>
                <View style={styles.acousticMetricsGrid}>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Speaking Time</Text>
                    <Text style={styles.acousticMetricValue}>
                      {((acousticMetrics.speaking_ratio || 0) * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Pauses</Text>
                    <Text style={styles.acousticMetricValue}>
                      {acousticMetrics.pause_count || 0}
                    </Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Avg Pause</Text>
                    <Text style={styles.acousticMetricValue}>
                      {((acousticMetrics.avg_pause_duration_ms || 0) / 1000).toFixed(1)}s
                    </Text>
                  </View>
                  <View style={styles.acousticMetricItem}>
                    <Text style={styles.acousticMetricLabel}>Energy</Text>
                    <Text style={styles.acousticMetricValue}>
                      {((acousticMetrics.energy_mean || 0) * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Assessment Results</Text>
        <TouchableOpacity
          onPress={handleGoToDashboard}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigator */}
      <View style={styles.tabNavigator}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(0)}
        >
          <Ionicons
            name="analytics-outline"
            size={20}
            color={activeTab === 0 ? '#14B8A6' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 0 && styles.tabButtonTextActive]}>
            Overview
          </Text>
          {activeTab === 0 && <View style={styles.tabUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(1)}
        >
          <Ionicons
            name="bar-chart-outline"
            size={20}
            color={activeTab === 1 ? '#14B8A6' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 1 && styles.tabButtonTextActive]}>
            Skills
          </Text>
          {activeTab === 1 && <View style={styles.tabUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(2)}
        >
          <Ionicons
            name="clipboard-outline"
            size={20}
            color={activeTab === 2 ? '#14B8A6' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 2 && styles.tabButtonTextActive]}>
            Plan
          </Text>
          {activeTab === 2 && <View style={styles.tabUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress(3)}
        >
          <Ionicons
            name="flask-outline"
            size={20}
            color={activeTab === 3 ? '#14B8A6' : '#9CA3AF'}
          />
          <Text style={[styles.tabButtonText, activeTab === 3 && styles.tabButtonTextActive]}>
            DNA
          </Text>
          {activeTab === 3 && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveTab(newIndex);
        }}
        style={styles.tabScroll}
      >
        <View style={styles.tabPage}>{renderOverview()}</View>
        <View style={styles.tabPage}>{renderSkillsDetail()}</View>
        <View style={styles.tabPage}>{renderActionPlan()}</View>
        <View style={styles.tabPage}>{renderDNAProfile()}</View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleSaveAndProceed}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#14B8A6', '#0D9488']}
            style={styles.proceedButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.proceedButtonText}>Create Learning Plan</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Create Learning Plan Modal */}
      <CreateLearningPlanModal
        visible={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onCreate={handleCreatePlan}
        language={language}
        recommendedLevel={result.recommended_level}
        assessmentFocus={result.areas_for_improvement}
        assessmentData={assessmentResult}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)', // Teal border
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Dark semi-transparent header
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  tabNavigator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Dark tab bar
    paddingHorizontal: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)', // Teal border
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
    position: 'relative',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#14B8A6',
    borderRadius: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray
  },
  tabButtonTextActive: {
    color: '#14B8A6', // Teal accent
  },
  tabScroll: {
    flex: 1,
  },
  tabPage: {
    width: SCREEN_WIDTH,
  },
  tabContent: {
    flex: 1,
  },
  overviewScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    marginBottom: 20,
    marginTop: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  progressRingContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  svgProgress: {
    position: 'absolute',
  },
  progressRingInner: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(15, 35, 40, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  overallScoreText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreMaxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  scoreMaxDivider: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
  },
  scoreMaxText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  scoreInfo: {
    alignItems: 'center',
  },
  recommendedLevel: {
    fontSize: 15,
    color: '#B4E4DD',
  },
  levelText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#14B8A6',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  skillCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)', // Teal border
  },
  skillIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF', // Light gray
    marginBottom: 2,
    textAlign: 'center',
  },
  skillScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  audioPlayerCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    alignItems: 'center',
  },
  audioPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  audioPlayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  audioPlayerDuration: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  playButton: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 2,
  },
  audioPlayerHint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  transcriptCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)', // Teal border
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  transcriptText: {
    fontSize: 15,
    color: '#D1D5DB', // Light gray
    lineHeight: 24,
  },
  skillDetailCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)', // Dark card
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)', // Teal border
  },
  skillDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  skillDetailInfo: {
    flex: 1,
  },
  skillDetailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    marginBottom: 8,
  },
  skillDetailScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillDetailScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.3)', // Dark gray
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillDetailScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillDetailScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  skillFeedback: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray
    lineHeight: 22,
  },
  examplesContainer: {
    marginTop: 12,
    gap: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 8,
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF', // Light gray
    fontStyle: 'italic',
  },
  actionSection: {
    marginBottom: 24,
  },
  actionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(20, 184, 166, 0.3)', // Teal border
  },
  actionSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  strengthBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B', // Keep orange (works on dark)
    marginTop: 6,
  },
  improvementBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6', // Keep blue (works on dark)
    marginTop: 6,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal tinted dark
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14B8A6', // Teal accent
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#D1D5DB', // Light gray
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.2)', // Teal border
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Dark footer
  },
  proceedButton: {
    borderRadius: 14,
    overflow: 'visible', // Changed to visible for outer glow
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  proceedButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // DNA Tab Styles
  dnaPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  dnaPlaceholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 16,
    marginBottom: 8,
  },
  dnaPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  dnaHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  dnaHeaderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  dnaHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dnaHeaderSubtitle: {
    fontSize: 14,
    color: '#14B8A6',
    textAlign: 'center',
  },
  dnaStrandsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dnaSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  dnaStrandCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  dnaStrandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dnaStrandIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dnaStrandInfo: {
    flex: 1,
  },
  dnaStrandLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dnaStrandSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  dnaStrandValueContainer: {
    alignItems: 'flex-end',
  },
  dnaStrandValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dnaStrandDescription: {
    fontSize: 13,
    color: '#B4E4DD',
    lineHeight: 18,
    marginTop: 4,
  },
  acousticSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  acousticCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  acousticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  acousticTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  acousticMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  acousticMetricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acousticMetricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  acousticMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 2,
  },
  acousticMetricHint: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default SpeakingAssessmentResultsScreen;
