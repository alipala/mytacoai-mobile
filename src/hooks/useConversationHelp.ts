import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConversationHelpService,
  ConversationHelpRequest,
  ConversationHelpResponse,
  UserHelpSettings
} from '../api/generated';
import { OpenAPI } from '../api/generated/core/OpenAPI';

interface ConversationMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface UseConversationHelpOptions {
  targetLanguage: string;
  proficiencyLevel: string;
  topic?: string;
  enabled?: boolean;
}

interface HelpState {
  isLoading: boolean;
  isHelpReady: boolean;
  helpData: ConversationHelpResponse | null;
  error: string | null;
  isModalVisible: boolean;
}

export const useConversationHelp = (options: UseConversationHelpOptions) => {
  const {
    targetLanguage,
    proficiencyLevel,
    topic,
    enabled = true,
  } = options;

  // Keep track of the enabled prop to use during settings load
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // State for help settings
  const [helpSettings, setHelpSettings] = useState<UserHelpSettings>({
    help_enabled: enabled,
    help_language: 'english',
    show_pronunciation: true,
    show_grammar_tips: true,
    show_cultural_notes: true,
    show_vocabulary: true,
    user_id: '',
  });

  // State for help content and UI
  const [helpState, setHelpState] = useState<HelpState>({
    isLoading: false,
    isHelpReady: false,
    helpData: null,
    error: null,
    isModalVisible: false,
  });

  // Track last processed message to avoid duplicates
  const lastProcessedMessageRef = useRef<string>('');
  const helpGenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load help settings on mount
  useEffect(() => {
    console.log('[CONVERSATION_HELP] 🚀 Hook mounted, loading settings...');
    loadHelpSettings();
  }, []);

  // Log when help settings change
  useEffect(() => {
    console.log('[CONVERSATION_HELP] 📊 Settings updated:', {
      help_enabled: helpSettings.help_enabled,
      help_language: helpSettings.help_language,
    });
  }, [helpSettings]);

  /**
   * Load user's help settings from AsyncStorage and API
   */
  const loadHelpSettings = useCallback(async () => {
    try {
      console.log('[CONVERSATION_HELP] 🔄 Loading settings...');

      // Get auth token
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.log('[CONVERSATION_HELP] ⚠️ No auth token found, using default settings with help_enabled=true');
        // Set help_enabled to true by default for guest users
        setHelpSettings(prev => ({
          ...prev,
          help_enabled: true,
        }));
        return;
      }

      // Set OpenAPI auth token
      OpenAPI.TOKEN = token;

      // Try to fetch settings from API
      try {
        const settings = await ConversationHelpService.getHelpSettingsApiConversationHelpSettingsGet();

        // Use preferences from API but ALWAYS use the enabled prop from options
        // This allows the component to control when help is enabled based on having valid data
        const mergedSettings = {
          ...settings,
          help_enabled: enabledRef.current, // ALWAYS use options.enabled, ignore API setting
          help_language: settings.help_language || 'english',
          show_pronunciation: settings.show_pronunciation !== false,
          show_grammar_tips: settings.show_grammar_tips !== false,
          show_cultural_notes: settings.show_cultural_notes !== false,
          show_vocabulary: settings.show_vocabulary !== false,
        };

        setHelpSettings(mergedSettings);
        console.log('[CONVERSATION_HELP] ✅ Loaded user settings from API');
        console.log('[CONVERSATION_HELP] 🔑 help_enabled (using options prop):', enabledRef.current);
        console.log('[CONVERSATION_HELP] 🔑 help_enabled (API returned, but ignored):', settings.help_enabled);
      } catch (apiError) {
        console.log('[CONVERSATION_HELP] ⚠️ Failed to load settings from API, using defaults with help_enabled from options:', enabledRef.current);
      }
    } catch (error) {
      console.error('[CONVERSATION_HELP] ❌ Error loading settings:', error);
    }
  }, []); // Empty deps - only uses refs and setters which don't change

  /**
   * Update help settings locally and on server
   */
  const updateHelpSettings = useCallback(async (newSettings: Partial<UserHelpSettings>) => {
    try {
      const updatedSettings = { ...helpSettings, ...newSettings };
      setHelpSettings(updatedSettings);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('[CONVERSATION_HELP] Guest user, settings updated locally only');
        return;
      }

      OpenAPI.TOKEN = token;

      await ConversationHelpService.updateHelpSettingsApiConversationHelpSettingsPut({
        requestBody: newSettings,
      });

      console.log('[CONVERSATION_HELP] Settings updated successfully');
      trackHelpUsage('settings_updated');
    } catch (error) {
      console.error('[CONVERSATION_HELP] Error updating settings:', error);
    }
  }, [helpSettings]);

  /**
   * Generate help content for AI response
   */
  const generateHelpContent = useCallback(async (
    aiResponse: string,
    conversationContext: ConversationMessage[]
  ): Promise<ConversationHelpResponse | null> => {
    if (!helpSettings.help_enabled) {
      console.log('[CONVERSATION_HELP] Help is disabled, skipping generation');
      return null;
    }

    // Avoid duplicate processing
    if (aiResponse === lastProcessedMessageRef.current) {
      console.log('[CONVERSATION_HELP] Skipping duplicate AI response processing');
      return helpState.helpData;
    }

    setHelpState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isHelpReady: false,
    }));

    try {
      console.log('[CONVERSATION_HELP] Generating help content for AI response:', aiResponse.substring(0, 100) + '...');

      const token = await AsyncStorage.getItem('token');
      if (token) {
        OpenAPI.TOKEN = token;
      }

      const requestData: ConversationHelpRequest = {
        ai_response: aiResponse,
        conversation_context: conversationContext.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        target_language: targetLanguage,
        user_language: helpSettings.help_language || 'english',
        proficiency_level: proficiencyLevel,
        topic: topic || undefined,
      };

      console.log('[CONVERSATION_HELP] 📤 Sending API request with data:', JSON.stringify(requestData, null, 2));

      const helpContent = await ConversationHelpService.generateHelpContentApiConversationHelpGeneratePost({
        requestBody: requestData,
      });

      setHelpState(prev => ({
        ...prev,
        helpData: helpContent,
        isHelpReady: true,
        isLoading: false,
      }));

      lastProcessedMessageRef.current = aiResponse;

      console.log('[CONVERSATION_HELP] Help content generated successfully');
      trackHelpUsage('help_generated');

      return helpContent;
    } catch (error: any) {
      console.error('[CONVERSATION_HELP] ❌ Error generating help content:', error);
      console.error('[CONVERSATION_HELP] ❌ Error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        body: JSON.stringify(error?.body, null, 2),
        url: error?.url,
      });

      // Log validation errors specifically
      if (error?.status === 422 && error?.body?.detail) {
        console.error('[CONVERSATION_HELP] ❌ Validation errors:', JSON.stringify(error.body.detail, null, 2));
      }

      // Handle specific error cases
      if (error?.status === 204) {
        // No contextual help available
        console.log('[CONVERSATION_HELP] No contextual help available');
        setHelpState(prev => ({
          ...prev,
          isLoading: false,
          isHelpReady: false,
          helpData: null,
        }));
      } else if (error?.message?.includes('timeout')) {
        console.log('[CONVERSATION_HELP] Request timeout - help generation taking longer than expected');
        setHelpState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Help generation timeout - please try again',
        }));
      } else {
        setHelpState(prev => ({
          ...prev,
          isLoading: false,
          error: error?.message || 'Failed to generate help content',
        }));
      }

      return null;
    }
  }, [targetLanguage, proficiencyLevel, topic, helpSettings.help_enabled, helpSettings.help_language]);

  /**
   * Show help modal
   */
  const showHelpModal = useCallback(() => {
    if (!helpSettings.help_enabled) {
      console.log('[CONVERSATION_HELP] Help is disabled');
      return;
    }

    if (!helpState.isHelpReady || !helpState.helpData) {
      console.log('[CONVERSATION_HELP] No help content available');
      return;
    }

    console.log('[CONVERSATION_HELP] Showing help modal');
    setHelpState(prev => ({ ...prev, isModalVisible: true }));
    trackHelpUsage('modal_opened');
  }, [helpSettings.help_enabled, helpState.isHelpReady, helpState.helpData]);

  /**
   * Close help modal
   */
  const closeHelpModal = useCallback(() => {
    setHelpState(prev => ({ ...prev, isModalVisible: false }));
    trackHelpUsage('modal_closed');
  }, []);

  /**
   * Reset help state (when user starts speaking)
   */
  const resetHelpState = useCallback(() => {
    setHelpState({
      isLoading: false,
      isHelpReady: false,
      helpData: null,
      error: null,
      isModalVisible: false,
    });
    lastProcessedMessageRef.current = '';

    if (helpGenerationTimeoutRef.current) {
      clearTimeout(helpGenerationTimeoutRef.current);
      helpGenerationTimeoutRef.current = null;
    }
  }, []);

  /**
   * Select a suggested response
   */
  const selectSuggestedResponse = useCallback((responseText: string) => {
    console.log('[CONVERSATION_HELP] User selected suggested response:', responseText);
    trackHelpUsage('response_selected');
    closeHelpModal();
    return responseText;
  }, [closeHelpModal]);

  /**
   * Track help usage analytics
   */
  const trackHelpUsage = async (helpType: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        OpenAPI.TOKEN = token;
      }

      await ConversationHelpService.trackHelpSystemUsageApiConversationHelpTrackUsagePost({
        requestBody: {
          help_type: helpType,
          language: targetLanguage,
        },
      });
    } catch (error) {
      console.error('[CONVERSATION_HELP] Error tracking usage:', error);
      // Don't throw error for analytics failures
    }
  };

  /**
   * Handle AI response completion event
   */
  const handleAIResponseComplete = useCallback((
    aiResponse: string,
    conversationContext: ConversationMessage[]
  ) => {
    console.log('[CONVERSATION_HELP] 📞 handleAIResponseComplete called');
    console.log('[CONVERSATION_HELP] 🔑 help_enabled:', helpSettings.help_enabled);
    console.log('[CONVERSATION_HELP] 📄 aiResponse length:', aiResponse?.length || 0);

    if (!helpSettings.help_enabled || !aiResponse) {
      console.log('[CONVERSATION_HELP] ⛔ Skipping: help_enabled=', helpSettings.help_enabled, 'aiResponse=', !!aiResponse);
      return;
    }

    console.log('[CONVERSATION_HELP] ✅ AI response completion detected, scheduling help generation');

    // Clear any existing timeout
    if (helpGenerationTimeoutRef.current) {
      clearTimeout(helpGenerationTimeoutRef.current);
    }

    // Generate help content after a small delay
    helpGenerationTimeoutRef.current = setTimeout(() => {
      generateHelpContent(aiResponse, conversationContext);
    }, 500);
  }, [helpSettings.help_enabled, generateHelpContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (helpGenerationTimeoutRef.current) {
        clearTimeout(helpGenerationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Settings
    helpSettings,
    updateHelpSettings,

    // State
    isLoading: helpState.isLoading,
    isHelpReady: helpState.isHelpReady,
    helpData: helpState.helpData,
    error: helpState.error,
    isModalVisible: helpState.isModalVisible,

    // Actions
    generateHelpContent,
    showHelpModal,
    closeHelpModal,
    resetHelpState,
    selectSuggestedResponse,
    handleAIResponseComplete,
    trackHelpUsage,
  };
};

export default useConversationHelp;
