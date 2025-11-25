/**
 * LearningPlanDetailsModal.tsx
 * 
 * Full-screen modal showing detailed information about a learning plan
 * Mobile-optimized version of the web app modal
 * 
 * Features:
 * - Animated modal entrance
 * - Progress visualization with circular progress
 * - Stats cards (Sessions, Practice Time, Weekly)
 * - Learning goals
 * - Weekly schedule with pagination
 * - Resources section
 * - Milestones
 * - AI-Generated Flashcards
 * - Continue Learning button
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== TYPES ====================

interface LearningPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: any; // LearningPlan type
  progressStats?: any;
  onContinueLearning: () => void;
}

// ==================== HELPER FUNCTIONS ====================

// Language flag mapping
const getLanguageFlag = (language: string): string => {
  const flags: Record<string, string> = {
    'english': '🇺🇸',
    'spanish': '🇪🇸',
    'french': '🇫🇷',
    'german': '🇩🇪',
    'dutch': '🇳🇱',
    'portuguese': '🇵🇹',
    'italian': '🇮🇹',
    'chinese': '🇨🇳',
    'japanese': '🇯🇵',
    'korean': '🇰🇷',
    'turkish': '🇹🇷'
  };
  return flags[language.toLowerCase()] || '🌍';
};

// Calculate progress from plan data
const calculateProgress = (plan: any): number => {
  if (plan.progress_percentage !== undefined) {
    return plan.progress_percentage;
  }
  
  const completed = plan.completed_sessions || 0;
  const total = plan.total_sessions || 24;
  
  return Math.min((completed / total) * 100, 100);
};

// Get level color (mobile version)
const getLevelColor = (level: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'A1': { bg: '#FEE2E2', text: '#DC2626' },
    'A2': { bg: '#FED7AA', text: '#EA580C' },
    'B1': { bg: '#E9D8FD', text: '#805AD5' },
    'B2': { bg: '#DBEAFE', text: '#2563EB' },
    'C1': { bg: '#D1FAE5', text: '#059669' },
    'C2': { bg: '#FEF3C7', text: '#D97706' }
  };
  return colors[level.toUpperCase()] || { bg: '#E0F2FE', text: '#0891B2' };
};

// ==================== PROGRESS RING COMPONENT ====================

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 10 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = percentage / 100;
  
  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      {/* Background Circle */}
      <View 
        style={[
          styles.progressRingBackground,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          }
        ]} 
      />
      
      {/* Progress Circle (simplified - in production use react-native-svg) */}
      <View 
        style={[
          styles.progressRingForeground,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: percentage >= 100 ? '#10B981' : '#4FD1C5',
          }
        ]} 
      />
      
      {/* Percentage Text */}
      <View style={styles.progressRingTextContainer}>
        <Text style={styles.progressRingPercentage}>{Math.round(percentage)}%</Text>
        <Text style={styles.progressRingLabel}>Complete</Text>
      </View>
      
      {/* Checkmark for 100% */}
      {percentage >= 100 && (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
        </View>
      )}
    </View>
  );
};

// ==================== MAIN MODAL COMPONENT ====================

export const LearningPlanDetailsModal: React.FC<LearningPlanDetailsModalProps> = ({
  visible,
  onClose,
  plan,
  progressStats,
  onContinueLearning,
}) => {
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);

  // Calculate values
  const progress = calculateProgress(plan);
  const completedSessions = plan.completed_sessions || 0;
  const totalSessions = plan.total_sessions || 24;
  const currentStreak = progressStats?.current_streak || 0;
  const isCompleted = progress >= 100;
  const levelColors = getLevelColor(plan.proficiency_level || plan.target_cefr_level);

  // Parse plan content
  const planContent = plan.plan_content || {};
  const goals = plan.goals || [];
  const weeklySchedule = planContent.weekly_schedule || [];
  const resources = planContent.resources || {};
  const milestones = planContent.milestones || [];

  // Weekly schedule pagination
  const weeksPerPage = 2;
  const totalPages = Math.ceil(weeklySchedule.length / weeksPerPage);

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Load flashcards (placeholder - implement with your API)
  useEffect(() => {
    if (visible) {
      loadFlashcards();
    }
  }, [visible, plan.id]);

  const loadFlashcards = async () => {
    // TODO: Implement flashcard loading from your API
    // For now, just set loading state
    setLoadingFlashcards(true);
    setTimeout(() => {
      setFlashcardSets([]); // Replace with actual API call
      setLoadingFlashcards(false);
    }, 1000);
  };

  const handleContinue = () => {
    // Store plan context for session
    // In mobile, you might use AsyncStorage or Context
    onContinueLearning();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header with Gradient */}
            <LinearGradient
              colors={['#14B8A6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Header Content */}
              <View style={styles.headerContent}>
                <Text style={styles.headerFlag}>
                  {getLanguageFlag(plan.language || plan.target_language)}
                </Text>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>
                    {(plan.language || plan.target_language).charAt(0).toUpperCase() + 
                     (plan.language || plan.target_language).slice(1)} Learning Plan
                  </Text>
                  <View style={styles.headerBadges}>
                    <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
                      <Text style={[styles.levelBadgeText, { color: levelColors.text }]}>
                        {plan.proficiency_level || plan.target_cefr_level} Level
                      </Text>
                    </View>
                    {currentStreak > 0 && (
                      <View style={styles.streakBadge}>
                        <Ionicons name="trophy" size={12} color="#FFF" />
                        <Text style={styles.streakText}>{currentStreak} day streak</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Progress Section */}
              <View style={styles.progressSection}>
                <ProgressRing percentage={progress} size={140} strokeWidth={12} />
                <Text style={styles.progressLabel}>Overall Progress</Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color="#14B8A6" />
                    <Text style={styles.statLabel}>Sessions</Text>
                  </View>
                  <Text style={styles.statValue}>{completedSessions}/{totalSessions}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#3B82F6" />
                    <Text style={styles.statLabel}>Practice Time</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {Math.round(progressStats?.total_minutes || 0)} min
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.statLabel}>This Week</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {progressStats?.sessions_this_week || 0}
                  </Text>
                </View>
              </View>

              {/* Continue Learning Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isCompleted && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={isCompleted}
              >
                <LinearGradient
                  colors={isCompleted ? ['#D1D5DB', '#D1D5DB'] : ['#14B8A6', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Ionicons
                    name={isCompleted ? "checkmark-circle" : "play"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.continueButtonText}>
                    {isCompleted ? 'Plan Completed' : 'Continue Learning'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Plan Title & Overview */}
              {(planContent.title || planContent.overview) && (
                <View style={styles.section}>
                  {planContent.title && (
                    <Text style={styles.sectionTitle}>{planContent.title}</Text>
                  )}
                  {planContent.overview && (
                    <Text style={styles.sectionText}>{planContent.overview}</Text>
                  )}
                </View>
              )}

              {/* Learning Goals */}
              {goals.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="flag-outline" size={20} color="#14B8A6" />
                    <Text style={styles.sectionHeaderText}>Learning Goals</Text>
                  </View>
                  <View style={styles.goalsContainer}>
                    {goals.map((goal: string, index: number) => (
                      <View key={index} style={styles.goalItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Weekly Schedule */}
              {weeklySchedule.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="calendar" size={20} color="#3B82F6" />
                    <Text style={styles.sectionHeaderText}>Weekly Schedule Preview</Text>
                  </View>

                  {/* Pagination Info */}
                  <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                      Weeks {currentPage * weeksPerPage + 1}-
                      {Math.min((currentPage + 1) * weeksPerPage, weeklySchedule.length)} of {weeklySchedule.length}
                    </Text>
                    <View style={styles.paginationButtons}>
                      <TouchableOpacity
                        onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
                      >
                        <Ionicons name="chevron-back" size={16} color={currentPage === 0 ? '#9CA3AF' : '#4B5563'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                        style={[styles.paginationButton, currentPage === totalPages - 1 && styles.paginationButtonDisabled]}
                      >
                        <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages - 1 ? '#9CA3AF' : '#4B5563'} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Weekly Cards */}
                  <View style={styles.weeklyContainer}>
                    {weeklySchedule
                      .slice(currentPage * weeksPerPage, (currentPage + 1) * weeksPerPage)
                      .map((week: any, index: number) => {
                        const weekNumber = currentPage * weeksPerPage + index + 1;
                        const weekSessionsCompleted = Math.min(week.sessions_completed || 0, week.total_sessions || 2);
                        const weekTotalSessions = week.total_sessions || 2;

                        // Determine week status based on session completion
                        const isWeekCompleted = weekSessionsCompleted >= weekTotalSessions;
                        const isWeekInProgress = weekSessionsCompleted > 0 && weekSessionsCompleted < weekTotalSessions;
                        const isWeekNotStarted = weekSessionsCompleted === 0;

                        // Find the current week (first week with incomplete sessions)
                        const currentWeekIndex = weeklySchedule.findIndex((w: any) =>
                          (w.sessions_completed || 0) < (w.total_sessions || 2)
                        );
                        const isCurrent = currentWeekIndex !== -1 && (currentPage * weeksPerPage + index) === currentWeekIndex;

                        return (
                          <View key={index} style={[
                            styles.weekCard,
                            isCurrent && styles.weekCardCurrent,
                            isWeekCompleted && styles.weekCardCompleted,
                          ]}>
                            <View style={styles.weekHeader}>
                              <Text style={[
                                styles.weekTitle,
                                isCurrent && styles.weekTitleCurrent,
                                isWeekCompleted && styles.weekTitleCompleted,
                              ]}>
                                Week {weekNumber}
                              </Text>
                              <View style={[
                                styles.weekProgressBadge,
                                isWeekCompleted && styles.weekProgressBadgeCompleted,
                              ]}>
                                <Text style={styles.weekProgressText}>
                                  {weekSessionsCompleted}/{weekTotalSessions} sessions
                                </Text>
                              </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.weekProgressBarContainer}>
                              <View
                                style={[
                                  styles.weekProgressBar,
                                  {
                                    width: `${(weekSessionsCompleted / weekTotalSessions) * 100}%`,
                                    backgroundColor: isWeekCompleted ? '#10B981' : isCurrent ? '#3B82F6' : '#D1D5DB',
                                  }
                                ]}
                              />
                            </View>

                            {/* Activities */}
                            {week.activities && week.activities.length > 0 && (
                              <View style={styles.weekActivities}>
                                {week.activities.slice(0, 2).map((activity: string, actIndex: number) => (
                                  <View key={actIndex} style={styles.activityItem}>
                                    <Ionicons
                                      name="ellipse"
                                      size={8}
                                      color={isWeekCompleted ? '#10B981' : isCurrent ? '#3B82F6' : '#9CA3AF'}
                                    />
                                    <Text style={[
                                      styles.activityText,
                                      isWeekCompleted && styles.activityTextCompleted,
                                      isCurrent && styles.activityTextCurrent,
                                    ]}>
                                      {activity}
                                    </Text>
                                  </View>
                                ))}
                                {week.activities.length > 2 && (
                                  <Text style={styles.moreActivitiesText}>
                                    +{week.activities.length - 2} more activities
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })}
                  </View>
                </View>
              )}

              {/* Resources */}
              {resources && Object.keys(resources).length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="book-outline" size={20} color="#8B5CF6" />
                    <Text style={styles.sectionHeaderText}>Learning Resources</Text>
                  </View>
                  <View style={styles.resourcesContainer}>
                    {Array.isArray(resources) ? (
                      resources.slice(0, 3).map((resource: string, index: number) => (
                        <View key={index} style={styles.resourceItem}>
                          <Ionicons name="ellipse" size={8} color="#8B5CF6" />
                          <Text style={styles.resourceText}>{resource}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.resourceGrid}>
                        {resources.apps && resources.apps.length > 0 && (
                          <View style={styles.resourceCategory}>
                            <Text style={styles.resourceCategoryTitle}>Apps:</Text>
                            {resources.apps.slice(0, 2).map((app: string, index: number) => (
                              <Text key={index} style={styles.resourceCategoryItem}>• {app}</Text>
                            ))}
                          </View>
                        )}
                        {resources.books && resources.books.length > 0 && (
                          <View style={styles.resourceCategory}>
                            <Text style={styles.resourceCategoryTitle}>Books:</Text>
                            {resources.books.slice(0, 2).map((book: string, index: number) => (
                              <Text key={index} style={styles.resourceCategoryItem}>• {book}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Milestones */}
              {milestones.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
                    <Text style={styles.sectionHeaderText}>Milestones</Text>
                  </View>
                  <View style={styles.milestonesContainer}>
                    {milestones.slice(0, 3).map((milestone: any, index: number) => (
                      <View key={index} style={styles.milestoneCard}>
                        <View style={styles.milestoneHeader}>
                          <Text style={styles.milestoneTitle}>{milestone.milestone}</Text>
                          <View style={styles.milestoneTimeline}>
                            <Text style={styles.milestoneTimelineText}>{milestone.timeline}</Text>
                          </View>
                        </View>
                        {milestone.assessment && (
                          <Text style={styles.milestoneDescription}>{milestone.assessment}</Text>
                        )}
                      </View>
                    ))}
                    {milestones.length > 3 && (
                      <Text style={styles.moreItemsText}>
                        +{milestones.length - 3} more milestones
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* AI-Generated Flashcards */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#6366F1" />
                  <Text style={styles.sectionHeaderText}>AI-Generated Flashcards</Text>
                </View>
                <View style={styles.flashcardsContainer}>
                  <Text style={styles.flashcardsDescription}>
                    Review flashcards automatically generated from your speaking sessions to reinforce learning.
                  </Text>

                  {loadingFlashcards ? (
                    <View style={styles.flashcardsLoading}>
                      <ActivityIndicator size="small" color="#6366F1" />
                      <Text style={styles.flashcardsLoadingText}>Loading flashcards...</Text>
                    </View>
                  ) : flashcardSets.length > 0 ? (
                    <View style={styles.flashcardsList}>
                      {flashcardSets.slice(0, 3).map((set: any, index: number) => (
                        <View key={index} style={styles.flashcardSetCard}>
                          <View style={styles.flashcardSetInfo}>
                            <Text style={styles.flashcardSetTitle}>{set.title}</Text>
                            <Text style={styles.flashcardSetMeta}>
                              {set.total_cards} cards • {set.language} • {set.level}
                            </Text>
                          </View>
                          <TouchableOpacity style={styles.flashcardStudyButton}>
                            <Ionicons name="book" size={14} color="#FFFFFF" />
                            <Text style={styles.flashcardStudyButtonText}>Study</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {flashcardSets.length > 3 && (
                        <Text style={styles.moreFlashcardsText}>
                          +{flashcardSets.length - 3} more flashcard sets available
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.flashcardsEmpty}>
                      <Ionicons name="book-outline" size={40} color="#D1D5DB" />
                      <Text style={styles.flashcardsEmptyText}>
                        Complete speaking sessions to generate AI-powered flashcards
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Created Date */}
              <View style={styles.footerSection}>
                <Text style={styles.createdDateText}>
                  Created on {new Date(plan.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerFlag: {
    fontSize: 48,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingBackground: {
    position: 'absolute',
    borderColor: '#E5E7EB',
  },
  progressRingForeground: {
    position: 'absolute',
    borderColor: '#4FD1C5',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  progressRingTextContainer: {
    alignItems: 'center',
  },
  progressRingPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  progressRingLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  completeBadge: {
    position: 'absolute',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  statsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  weeklyContainer: {
    gap: 12,
  },
  weekCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekCardCurrent: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  weekCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  weekTitleCurrent: {
    color: '#3B82F6',
  },
  weekTitleCompleted: {
    color: '#10B981',
  },
  weekProgressBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekProgressBadgeCompleted: {
    backgroundColor: '#D1FAE5',
  },
  weekProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  weekProgressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  weekProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  weekActivities: {
    gap: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  activityTextCompleted: {
    color: '#059669',
  },
  activityTextCurrent: {
    color: '#2563EB',
  },
  moreActivitiesText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  resourcesContainer: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resourceText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  resourceGrid: {
    gap: 12,
  },
  resourceCategory: {
    gap: 4,
  },
  resourceCategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 4,
  },
  resourceCategoryItem: {
    fontSize: 12,
    color: '#6B7280',
  },
  milestonesContainer: {
    gap: 12,
  },
  milestoneCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  milestoneTimeline: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  milestoneTimelineText: {
    fontSize: 12,
    color: '#D97706',
  },
  milestoneDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  moreItemsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  flashcardsContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
  },
  flashcardsDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  flashcardsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  flashcardsLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  flashcardsList: {
    gap: 12,
  },
  flashcardSetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  flashcardSetInfo: {
    flex: 1,
  },
  flashcardSetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  flashcardSetMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  flashcardStudyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  flashcardStudyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreFlashcardsText: {
    fontSize: 12,
    color: '#6366F1',
    textAlign: 'center',
  },
  flashcardsEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  flashcardsEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  footerSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createdDateText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default LearningPlanDetailsModal;
