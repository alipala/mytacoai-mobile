import { OpenAPI } from './generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired } from '../utils/jwtUtils';

// Set your backend URL
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'
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
}

export default OpenAPI;