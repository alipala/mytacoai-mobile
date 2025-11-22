import { OpenAPI } from './generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set your backend URL
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'
  : 'https://mytacoai.com';

// Configure OpenAPI client
OpenAPI.BASE = API_BASE_URL;

// Configure auth token
OpenAPI.TOKEN = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return token || '';
};

// For debugging in dev mode
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

export default OpenAPI;