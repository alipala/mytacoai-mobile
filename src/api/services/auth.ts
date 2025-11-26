import { AuthenticationService } from '../generated';
import type { Token, UserResponse } from '../generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired } from '../../utils/jwtUtils';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<Token> => {
    const response = await AuthenticationService.loginApiAuthLoginPost({
      requestBody: { email, password }  // ← Fixed: wrapped in requestBody
    });

    await AsyncStorage.setItem('auth_token', response.access_token);
    return response;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    return await AuthenticationService.getUserMeApiAuthMeGet();  // ← Fixed method name
  },

  /**
   * Logout - clears token and calls backend logout
   */
  logout: async (): Promise<void> => {
    try {
      await AuthenticationService.logoutApiAuthLogoutPost();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    }
    await AsyncStorage.removeItem('auth_token');
  },

  /**
   * Clear local session without calling backend
   */
  clearLocalSession: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
  },

  /**
   * Check if authenticated with token expiration validation
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        console.log('🔒 No token found');
        return false;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('🔒 Token expired - clearing session');
        await authService.clearLocalSession();
        return false;
      }

      console.log('✅ Valid token found');
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  /**
   * Get stored token
   */
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('auth_token');
  },
};