import { OpenAPI } from './generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired } from '../utils/jwtUtils';
import { setFeatureFlag } from '../config/features';

// Set your backend URL
// For physical device testing, use your laptop's local IP address
// Find your IP: ifconfig (Mac/Linux) or ipconfig (Windows)
export const API_BASE_URL = __DEV__
  ? 'http://192.168.68.109:8000'  // Your laptop's local IP (UPDATE THIS!)
  : 'https://mytacoai.com';

// Configure OpenAPI client
OpenAPI.BASE = API_BASE_URL;

// Configure auth token with expiration validation
OpenAPI.TOKEN = async () => {
  const token = await AsyncStorage.getItem('auth_token');

  if (!token) {
    return '';
  }

  // Check if token is expired before using it
  if (isTokenExpired(token)) {
    console.warn('⚠️ Attempting to use expired token - clearing session');
    await AsyncStorage.removeItem('auth_token');
    return '';
  }

  return token;
};

// For debugging in dev mode
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);

  // 🧪 TESTING: Enable Challenge API for localhost testing
  // Comment out these lines to disable API testing
  setFeatureFlag('USE_CHALLENGE_API', true);
  setFeatureFlag('SHOW_API_STATUS_INDICATOR', true);
  console.log('🧪 Challenge API enabled for testing');
}

export default OpenAPI;