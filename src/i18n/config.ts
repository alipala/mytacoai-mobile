/**
 * i18n Configuration
 * ===================
 * Multi-language support using react-i18next
 *
 * Supported Languages:
 * - English (en)
 * - Spanish (es)
 * - French (fr)
 * - German (de)
 * - Dutch (nl)
 * - Portuguese (pt)
 * - Turkish (tr)
 *
 * Features:
 * - Auto-detect device language
 * - User-selectable language in App Settings
 * - AsyncStorage persistence
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import nl from '../locales/nl.json';
import pt from '../locales/pt.json';
import tr from '../locales/tr.json';

// Storage key for language preference
const LANGUAGE_KEY = 'app_language';

// Supported languages with native names and flags
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'us' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'de' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'nl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'pt' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'tr' },
];

// Get device language (fallback to 'en' if not supported)
const getDeviceLanguage = (): string => {
  try {
    // Try multiple ways to get device locale
    let deviceLocale = Localization.locale;

    // If locale is not available, try getLocales() array
    if (!deviceLocale || typeof deviceLocale !== 'string') {
      const locales = Localization.getLocales();
      if (locales && locales.length > 0 && locales[0].languageCode) {
        deviceLocale = locales[0].languageCode;
        console.log('[i18n] Using getLocales() - Language code:', deviceLocale);
      }
    }

    // Check if deviceLocale is valid
    if (!deviceLocale || typeof deviceLocale !== 'string') {
      console.log('[i18n] No device locale found, defaulting to en');
      return 'en';
    }

    const languageCode = deviceLocale.includes('-')
      ? deviceLocale.split('-')[0]  // Extract "en" from "en-US"
      : deviceLocale;                // Already just language code

    // Check if language is supported
    const isSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);

    console.log('[i18n] Device locale:', deviceLocale);
    console.log('[i18n] Language code:', languageCode);
    console.log('[i18n] Is supported:', isSupported);

    return isSupported ? languageCode : 'en';
  } catch (error) {
    console.error('[i18n] Error getting device language:', error);
    return 'en';
  }
};

// Get stored language preference
const getStoredLanguage = async (): Promise<string | null> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    console.log('[i18n] Stored language:', storedLanguage);
    return storedLanguage;
  } catch (error) {
    console.error('[i18n] Error getting stored language:', error);
    return null;
  }
};

// Save language preference
export const saveLanguagePreference = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    console.log('[i18n] Language preference saved:', languageCode);
  } catch (error) {
    console.error('[i18n] Error saving language preference:', error);
  }
};

// Change language at runtime
export const changeLanguage = async (languageCode: string): Promise<void> => {
  try {
    await i18n.changeLanguage(languageCode);
    await saveLanguagePreference(languageCode);
    console.log('[i18n] Language changed to:', languageCode);
  } catch (error) {
    console.error('[i18n] Error changing language:', error);
  }
};

// Initialize i18n
const initI18n = async () => {
  // Determine initial language: stored preference > device language > English
  const storedLanguage = await getStoredLanguage();
  const deviceLanguage = getDeviceLanguage();
  const initialLanguage = storedLanguage || deviceLanguage;

  console.log('[i18n] Initializing with language:', initialLanguage);

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
        nl: { translation: nl },
        pt: { translation: pt },
        tr: { translation: tr },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v3', // Important for React Native
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false, // Important for React Native
      },
    });

  console.log('[i18n] Initialization complete');
};

// Initialize on module load
initI18n();

export default i18n;
