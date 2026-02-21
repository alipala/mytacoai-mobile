/**
 * Coach Modal - Immersive Chat Interface
 * =======================================
 * Full-screen modal for chatting with AI language learning coach.
 *
 * Features:
 * - WhatsApp-style conversation UI
 * - Typing effect for AI messages
 * - Rich message types (text, cards, celebrations)
 * - Context-aware quick replies
 * - Lottie animations for coach avatar
 * - NO redirections - all guidance within modal
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';

// Import service and types
import coachService, { ChatMessage, RichMessage, QuickReply } from '../../services/CoachService';

// Import Lottie animations
const CompanionIdle = require('../../assets/lottie/companion_idle2.json');
const LoadingCat = require('../../assets/lottie/loading_cat.json');

// Import message components
import { EmojiText } from '../EmojiText';
import { ProgressCard } from './ProgressCard';
import { DNACard } from './DNACard';

interface CoachModalProps {
  visible: boolean;
  onClose: () => void;
  language: string; // Target learning language (for context)
}

// Animated Typing Indicator Component
const TypingIndicator: React.FC = () => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create pulsing animation for each dot with stagger
    const createPulse = (opacityValue: Animated.Value, scaleValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacityValue, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    // Start animations with stagger delays
    const anim1 = createPulse(dot1Opacity, dot1Scale, 0);
    const anim2 = createPulse(dot2Opacity, dot2Scale, 200);
    const anim3 = createPulse(dot3Opacity, dot3Scale, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
      <View style={[styles.messageBubble, styles.assistantBubble]}>
        <View style={styles.typingIndicator}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: dot1Opacity,
                transform: [{ scale: dot1Scale }]
              }
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: dot2Opacity,
                transform: [{ scale: dot2Scale }]
              }
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: dot3Opacity,
                transform: [{ scale: dot3Scale }]
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
};

// Animated Message Bubble Component
interface AnimatedMessageBubbleProps {
  isUser: boolean;
  richMessages: RichMessage[];
  timestamp: Date;
  index: number;
}

const AnimatedMessageBubble: React.FC<AnimatedMessageBubbleProps> = ({
  isUser,
  richMessages,
  timestamp,
  index,
}) => {
  // Create animated values for fade, slide, and glow effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Trigger animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle glow effect for assistant messages
    if (!isUser) {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false, // shadowOpacity doesn't support native driver
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      key={index}
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Render each rich message */}
      {richMessages.map((richMsg, idx) => {
        switch (richMsg.type) {
          case 'text':
            return (
              <Animated.View
                key={idx}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                  !isUser && {
                    shadowOpacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.25, 0.45], // Glow effect on assistant messages
                    }),
                  },
                ]}
              >
                <EmojiText
                  text={richMsg.content || ''}
                  style={isUser ? styles.userMessageText : styles.assistantMessageText}
                  emojiSize={20}
                />
              </Animated.View>
            );

          case 'progress_card':
            return <ProgressCard key={idx} data={richMsg.data} />;

          case 'dna_card':
            return <DNACard key={idx} data={richMsg.data} />;

          case 'celebration':
            return (
              <View key={idx} style={styles.celebrationContainer}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={styles.celebrationText}>{richMsg.content}</Text>
              </View>
            );

          default:
            return null;
        }
      })}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Animated.View>
  );
};

export const CoachModal: React.FC<CoachModalProps> = ({
  visible,
  onClose,
  language,
}) => {
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Use app's interface language for coach responses (English, Turkish, etc.)
  const interfaceLanguage = i18n.language || 'english';

  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    richMessages: RichMessage[];
    timestamp: Date;
    animated?: boolean; // Track if message was already animated
  }>>([]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  // Scroll button states
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Load conversation from cache when modal opens
  useEffect(() => {
    if (visible) {
      loadConversationFromCache();
    }
  }, [visible]);

  const loadConversationFromCache = async () => {
    try {
      const cached = await coachService.loadConversation(language);
      if (cached && cached.length > 0) {
        // Restore conversation from cache
        // Convert timestamp strings back to Date objects
        const restoredMessages = cached.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(restoredMessages);
        console.log('[CoachModal] Restored conversation from cache');

        // Scroll to bottom after restoring messages
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } else if (messages.length === 0) {
        // No cache and no messages - load initial greeting
        loadInitialGreeting();
      }
    } catch (error) {
      console.error('[CoachModal] Failed to load conversation from cache:', error);
      // Fallback to loading greeting if no messages
      if (messages.length === 0) {
        loadInitialGreeting();
      }
    }
  };

  // Save conversation to cache whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Debounce saves to avoid excessive writes
      const saveTimeout = setTimeout(() => {
        coachService.saveConversation(language, messages);
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [messages, language]);

  // Auto-scroll to bottom when new messages arrive and modal is visible
  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  // Keyboard listeners for better UX
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Auto-scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Don't reset conversation when modal closes - keep it in memory
  // Only reset if user explicitly clears or after timeout

  const loadInitialGreeting = async () => {
    try {
      setIsLoading(true);

      // Get user context first to personalize greeting
      // Pass target learning language for context, but responses will be in interface language
      const context = await coachService.getContext(language);

      let greeting = '';
      if (context.is_new_user) {
        greeting = 'start_greeting_new_user';
      } else {
        greeting = 'start_greeting_returning_user';
      }

      // Send greeting message
      await sendMessage(greeting, true);
    } catch (error) {
      console.error('[CoachModal] Failed to load greeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string, isSystemMessage = false) => {
    if (!text.trim() && !isSystemMessage) return;

    try {
      // Add user message to UI
      if (!isSystemMessage) {
        const userMessage = {
          role: 'user' as const,
          richMessages: [{
            type: 'text' as const,
            content: text,
            timestamp: new Date().toISOString(),
          }],
          timestamp: new Date(),
          animated: true, // User messages don't animate
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setShowQuickReplies(false);
      }

      // Show typing indicator
      setIsTyping(true);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Build conversation history
      const history: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.richMessages[0]?.content || '',
      }));

      if (!isSystemMessage) {
        history.push({ role: 'user', content: text });
      }

      // Get AI response in interface language (English, Turkish, etc.)
      // Pass target learning language for context
      const response = await coachService.chat(
        interfaceLanguage,
        isSystemMessage ? text : text,
        history,
        language // Target learning language
      );

      // Hide typing indicator
      setIsTyping(false);

      // Add AI response to UI with delay for natural feel
      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant' as const,
          richMessages: response.messages,
          timestamp: new Date(),
          animated: false, // Mark as needing animation
        };
        setMessages(prev => [...prev, assistantMessage]);
        setQuickReplies(response.quick_replies);
        setShowQuickReplies(true);

        // Mark as animated after typing completes (estimate based on message length)
        const firstTextMessage = response.messages.find(m => m.type === 'text');
        const typingDuration = firstTextMessage?.content ? firstTextMessage.content.length * 20 + 500 : 1000;

        setTimeout(() => {
          setMessages(prev =>
            prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, animated: true } : msg
            )
          );
        }, typingDuration);

        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 500); // Small delay for natural conversation feel

    } catch (error) {
      console.error('[CoachModal] Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    sendMessage(reply.label);
  };

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
  };

  // Handle scroll event to show/hide scroll buttons
  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const viewHeight = layoutMeasurement.height;
    const contentHeight = contentSize.height;

    // Show "scroll to top" if scrolled down more than 200px
    setShowScrollToTop(scrollY > 200);

    // Show "scroll to bottom" if not at the bottom (with 100px threshold)
    const isAtBottom = scrollY + viewHeight >= contentHeight - 100;
    setShowScrollToBottom(!isAtBottom && contentHeight > viewHeight);
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = (message: {
    role: 'user' | 'assistant';
    richMessages: RichMessage[];
    timestamp: Date;
    animated?: boolean;
  }, index: number) => {
    const isUser = message.role === 'user';

    return (
      <AnimatedMessageBubble
        key={index}
        isUser={isUser}
        richMessages={message.richMessages}
        timestamp={message.timestamp}
        index={index}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <LinearGradient
        colors={['#0A1628', '#0D2832', '#1A3A42', '#2D4A54']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <LottieView
                  source={CompanionIdle}
                  autoPlay
                  loop
                  style={styles.avatarLottie}
                  speed={1}
                />
              </View>
              <View>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.headerTitle}>Taal Coach</Text>
                  <View style={styles.betaBadge}>
                    <Text style={styles.betaText}>BETA</Text>
                  </View>
                </View>
                <Text style={styles.headerSubtitle}>Your AI learning guide</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: keyboardHeight > 0 ? 20 : 100 }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={LoadingCat}
                  autoPlay
                  loop
                  style={styles.loadingCatAnimation}
                />
              </View>
            ) : (
              <>
                {messages.map((message, index) => renderMessage(message, index))}

                {/* Typing Indicator */}
                {isTyping && <TypingIndicator />}
              </>
            )}
          </ScrollView>

          {/* Quick Replies */}
          {showQuickReplies && quickReplies.length > 0 && !isTyping && (
            <ScrollView
              horizontal
              style={styles.quickRepliesContainer}
              contentContainerStyle={styles.quickRepliesContent}
              showsHorizontalScrollIndicator={false}
            >
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyButton}
                  onPress={() => handleQuickReply(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Scroll to Top Button - Center Top */}
          {showScrollToTop && (
            <TouchableOpacity
              style={styles.scrollToTopButton}
              onPress={scrollToTop}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(20, 184, 166, 0.92)', 'rgba(16, 146, 130, 0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scrollButtonGradient}
              >
                <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Scroll to Bottom Button - Center Bottom */}
          {showScrollToBottom && (
            <TouchableOpacity
              style={styles.scrollToBottomButton}
              onPress={scrollToBottom}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(20, 184, 166, 0.92)', 'rgba(16, 146, 130, 0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scrollButtonGradient}
              >
                <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Input */}
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16 }]}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#6B7280"
              multiline
              maxLength={500}
              editable={!isLoading && !isTyping}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading || isTyping) && styles.sendButtonDisabled,
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading || isTyping}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading && !isTyping ? '#FFFFFF' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.25)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  betaBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarLottie: {
    width: 70,
    height: 70,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B4E4DD',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingCatAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#B4E4DD',
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 4,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: 'rgba(20, 184, 166, 0.45)',
    borderBottomRightRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(78, 207, 191, 0.8)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  assistantBubble: {
    backgroundColor: 'rgba(139, 92, 246, 0.40)',
    borderBottomLeftRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.7)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  userMessageText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  assistantMessageText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  quickRepliesContainer: {
    maxHeight: 70,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.25)',
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
  },
  quickRepliesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  quickReplyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 184, 166, 0.30)',
    borderWidth: 1.5,
    borderColor: 'rgba(78, 207, 191, 0.7)',
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14B8A6',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.25)',
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14B8A6',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  scrollToTopButton: {
    position: 'absolute',
    top: 120,
    left: '50%',
    marginLeft: -20, // Half of width to center
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 140,
    left: '50%',
    marginLeft: -20, // Half of width to center
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  scrollButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default CoachModal;
