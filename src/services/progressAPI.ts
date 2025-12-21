/**
 * Progress API Service
 * Tracks user's challenge completion progress
 */

import { OpenAPI } from '../api/generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChallengeProgressStats {
  completed_count: number;
  completed_by_type: Record<string, number>;
  total_available: number;
  available_by_type: Record<string, number>;
  progress_percentage: number;
  language: string;
  level: string;
}

/**
 * Get the base API URL from OpenAPI config
 */
function getApiBaseUrl(): string {
  const baseUrl = OpenAPI.BASE;

  if (!baseUrl || baseUrl === '') {
    console.warn('No API base URL configured, using localhost');
    return 'http://localhost:8000';
  }

  return baseUrl;
}

/**
 * Get authorization header with token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
}

/**
 * Get user's challenge progress statistics
 */
export async function getChallengeProgress(
  language: string,
  level: string
): Promise<ChallengeProgressStats> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${baseUrl}/api/progress/challenge-stats?language=${language}&level=${level}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `Failed to fetch progress: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    throw error;
  }
}

/**
 * Format progress for display
 */
export function formatProgress(completed: number, total: number): string {
  const remaining = total - completed;
  if (remaining === 0) {
    return '✅ All completed!';
  }
  return `${remaining} remaining`;
}

/**
 * Format progress percentage
 */
export function formatProgressPercentage(percentage: number): string {
  return `${percentage.toFixed(0)}% Complete`;
}
