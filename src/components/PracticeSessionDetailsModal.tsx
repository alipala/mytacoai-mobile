import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

interface PracticeSessionDetailsModalProps {
  visible: boolean;
  session: any | null; // TODO: Define proper type
  onClose: () => void;
  cardColor: string;
}

export const PracticeSessionDetailsModal: React.FC<PracticeSessionDetailsModalProps> = ({
  visible,
  session,
  onClose,
  cardColor,
}) => {
  const { t } = useTranslation();

  // Debug logging
  console.log('🔍 PracticeSessionDetailsModal - visible:', visible);
  console.log('🔍 PracticeSessionDetailsModal - session:', JSON.stringify(session, null, 2));

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`;
    }
    return `rgba(20, 184, 166, ${opacity})`;
  };

  // Don't render modal content if no session, but still render Modal component
  if (!session || !visible) {
    return (
      <Modal
        visible={false}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      />
    );
  }

  const language = session.language || session.target_language || 'English';
  const level = session.cefr_level || session.level || 'B1';

  // Get topic and capitalize first letter
  let topic = session.topic || session.custom_topic || 'General Practice';
  topic = topic.charAt(0).toUpperCase() + topic.slice(1);

  const duration = session.duration_minutes || session.duration || 10;
  const timestamp = new Date(session.created_at || session.timestamp);
  const messageCount = session.message_count || 0;

  // Get enhanced analysis data
  const enhancedAnalysis = session.enhanced_analysis;
  const aiInsights = enhancedAnalysis?.ai_insights;
  const breakthroughMoments = aiInsights?.breakthrough_moments || [];
  const strugglePoints = aiInsights?.struggle_points || [];
  const grammarPatterns = aiInsights?.grammar_patterns || [];
  const nextSessionFocus = aiInsights?.next_session_focus || [];
  const learningProgress = enhancedAnalysis?.learning_progress;

  console.log('✅ Modal data parsed:', { language, level, topic, duration, timestamp, cardColor, enhancedAnalysis });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={[styles.modalContainer, {
          backgroundColor: cardColor,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadowColor: cardColor,
        }]}>
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header with card color gradient */}
            <View style={[styles.header, {
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              borderBottomColor: 'rgba(255, 255, 255, 0.15)',
            }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>{language} - {topic}</Text>
                  <Text style={styles.headerSubtitle}>
                    {timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.3)' }]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Compact Stats Bar */}
              <View style={styles.compactStatsBar}>
                <View style={styles.compactStatItem}>
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.compactStatText}>{duration} min</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.compactStatItem}>
                  <Ionicons name="chatbubbles-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.compactStatText}>{messageCount} msgs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.compactStatItem}>
                  <Ionicons name="trophy-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.compactStatText}>{level}</Text>
                </View>
                {learningProgress?.complexity_score && (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.compactStatItem}>
                      <Ionicons name="analytics-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.compactStatText}>{Math.round(learningProgress.complexity_score * 100)}%</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Enhanced Analysis Available - Show Full Insights */}
              {enhancedAnalysis ? (
                <>
                  {/* Session Quality Overview */}
                  {enhancedAnalysis.conversation_quality && (
                    <View style={styles.section}>
                      <View style={[styles.qualityCard, {
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }]}>
                        <View style={styles.qualityHeader}>
                          <View style={styles.qualityScoreContainer}>
                            <Text style={styles.qualityScoreValue}>
                              {enhancedAnalysis.conversation_quality.overall_score || 0}
                            </Text>
                            <Text style={styles.qualityScoreLabel}>Overall</Text>
                          </View>
                          <View style={styles.qualityMetrics}>
                            <View style={styles.qualityMetricItem}>
                              <Ionicons name="chatbox-ellipses" size={16} color="#FFFFFF" />
                              <Text style={styles.qualityMetricText}>
                                {enhancedAnalysis.conversation_quality.engagement?.score || 0}% engagement
                              </Text>
                            </View>
                            {enhancedAnalysis.conversation_quality.topic_depth?.score > 0 && (
                              <View style={styles.qualityMetricItem}>
                                <Ionicons name="layers" size={16} color="#FFFFFF" />
                                <Text style={styles.qualityMetricText}>
                                  {enhancedAnalysis.conversation_quality.topic_depth.score}% depth
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        {enhancedAnalysis.conversation_quality.engagement?.feedback && (
                          <Text style={styles.qualityFeedback}>
                            {enhancedAnalysis.conversation_quality.engagement.feedback}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}



              {/* What You Did Great */}
              {breakthroughMoments.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="trophy" size={22} color="#FFFFFF" />
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>What You Did Great</Text>
                  </View>
                  <View style={styles.insightsList}>
                    {breakthroughMoments.map((moment: string, index: number) => (
                      <View key={index} style={[styles.insightItem, {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.insightText}>{moment}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Keep Practicing */}
              {strugglePoints.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="bulb" size={22} color="#FFFFFF" />
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>Keep Practicing</Text>
                  </View>
                  <View style={styles.insightsList}>
                    {strugglePoints.map((point: string, index: number) => (
                      <View key={index} style={[styles.insightItem, {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }]}>
                        <Ionicons name="arrow-up-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.insightText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Grammar Patterns */}
              {grammarPatterns && (grammarPatterns.successful?.length > 0 || grammarPatterns.unsuccessful?.length > 0) && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="school" size={22} color="#FFFFFF" />
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>Grammar Review</Text>
                  </View>

                  {/* Successful Grammar */}
                  {grammarPatterns.successful && grammarPatterns.successful.length > 0 && (
                    <View style={styles.grammarSubsection}>
                      <View style={styles.grammarSubheader}>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.grammarSubtitle}>Used Correctly</Text>
                      </View>
                      {grammarPatterns.successful.map((pattern: string, index: number) => (
                        <View key={`success-${index}`} style={[styles.grammarItem, {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.25)',
                        }]}>
                          <Text style={styles.grammarText}>{pattern}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Unsuccessful Grammar - Needs Practice */}
                  {grammarPatterns.unsuccessful && grammarPatterns.unsuccessful.length > 0 && (
                    <View style={styles.grammarSubsection}>
                      <View style={styles.grammarSubheader}>
                        <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.grammarSubtitle}>Needs Practice</Text>
                      </View>
                      {grammarPatterns.unsuccessful.map((pattern: string, index: number) => (
                        <View key={`unsuccess-${index}`} style={[styles.grammarItem, {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.25)',
                        }]}>
                          <Text style={styles.grammarText}>{pattern}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Vocabulary Highlights from AI Insights */}
              {aiInsights?.vocabulary_highlights && aiInsights.vocabulary_highlights.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="star" size={22} color="#FFFFFF" />
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>Key Vocabulary</Text>
                  </View>
                  <View style={styles.wordsContainer}>
                    {aiInsights.vocabulary_highlights.map((word: string, index: number) => (
                      <View key={index} style={[styles.wordChip, {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }]}>
                        <Text style={[styles.wordText, { color: '#FFFFFF', fontWeight: '700' }]}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Next Steps */}
              {nextSessionFocus.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="rocket" size={22} color="#FFFFFF" />
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>Next Steps</Text>
                  </View>
                  <View style={styles.insightsList}>
                    {nextSessionFocus.map((focus: string, index: number) => (
                      <View key={index} style={[styles.insightItem, {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }]}>
                        <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.insightText}>{focus}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Session Summary - Moved to bottom */}
              {session.summary && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="document-text" size={20} color="#FFFFFF" />
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>Session Overview</Text>
                  </View>
                  <View style={[styles.summaryCard, {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }]}>
                    <Text style={[styles.summaryText, { color: '#FFFFFF', fontWeight: '600' }]} numberOfLines={4}>{session.summary}</Text>
                  </View>
                </View>
              )}

              {/* Vocabulary */}
              {session.vocabulary && session.vocabulary.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800' }]}>Vocabulary Practiced</Text>
                    <View style={[styles.countBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                      <Text style={[styles.countText, { color: '#FFFFFF', fontWeight: '800' }]}>{session.vocabulary.length}</Text>
                    </View>
                  </View>
                  <View style={styles.wordsContainer}>
                    {session.vocabulary.map((word: string, index: number) => (
                      <View key={index} style={[styles.wordChip, {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }]}>
                        <Text style={[styles.wordText, { color: '#FFFFFF', fontWeight: '700' }]}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              </>
              ) : (
                /* Fallback UI - No Enhanced Analysis */
                <>
                  {/* Session Summary */}
                  {session.summary && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeaderRow}>
                        <Ionicons name="document-text" size={20} color="#FFFFFF" />
                        <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800', marginBottom: 0 }]}>Session Summary</Text>
                      </View>
                      <View style={[styles.summaryCard, {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                      }]}>
                        <Text style={[styles.summaryText, { color: '#FFFFFF', fontWeight: '600' }]}>{session.summary}</Text>
                      </View>
                    </View>
                  )}

                  {/* Basic Info Card - When no enhanced analysis */}
                  <View style={styles.section}>
                    <View style={[styles.insightCard, {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }]}>
                      <Ionicons name="information-circle" size={24} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.insightCardText}>
                        Complete longer practice sessions to unlock detailed learning insights, breakthrough moments, and personalized recommendations!
                      </Text>
                    </View>
                  </View>

                  {/* Vocabulary - Basic display */}
                  {session.vocabulary && session.vocabulary.length > 0 && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: '#FFFFFF', fontWeight: '800' }]}>Vocabulary</Text>
                        <View style={[styles.countBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                          <Text style={[styles.countText, { color: '#FFFFFF', fontWeight: '800' }]}>{session.vocabulary.length}</Text>
                        </View>
                      </View>
                      <View style={styles.wordsContainer}>
                        {session.vocabulary.map((word: string, index: number) => (
                          <View key={index} style={[styles.wordChip, {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }]}>
                            <Text style={[styles.wordText, { color: '#FFFFFF', fontWeight: '700' }]}>{word}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    height: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  compactStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactStatText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  insightsList: {
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  insightCardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  wordText: {
    fontSize: 13,
    fontWeight: '700',
  },
  grammarSubsection: {
    marginBottom: 16,
  },
  grammarSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  grammarSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grammarItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  grammarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  qualityCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  qualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityScoreContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  qualityScoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  qualityScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qualityMetrics: {
    flex: 1,
    gap: 8,
  },
  qualityMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityMetricText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qualityFeedback: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
  },
});
