import { AuthenticationService } from '../generated';
import type { Token, UserResponse } from '../generated';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
   * Logout
   */
  logout: async (): Promise<void> => {
    await AuthenticationService.logoutApiAuthLogoutPost();
    await AsyncStorage.removeItem('auth_token');
  },

  /**
   * Check if authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
};