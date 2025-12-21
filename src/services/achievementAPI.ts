/**
 * Achievement API Service
 * Provides API integration for achievement persistence
 *
 * Features:
 * - Unlock achievements
 * - Fetch user achievements
 * - Complete challenge sessions
 */

import { OpenAPI } from '../api/generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Achievement data structure
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  unlocked_at?: Date;
  session_id?: string;
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
 * Unlock an achievement for the current user
 */
export async function unlockAchievement(
  achievementId: string,
  sessionId?: string
): Promise<{ success: boolean; already_unlocked: boolean; achievement: Achievement }> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/api/achievements/unlock`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        achievement_id: achievementId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `Failed to unlock achievement: ${response.status}`);
    }

    const data = await response.json();

    // Convert date string to Date object
    if (data.achievement && data.achievement.unlocked_at) {
      data.achievement.unlocked_at = new Date(data.achievement.unlocked_at);
    }

    return data;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
}

/**
 * Get all achievements unlocked by the current user
 */
export async function getUserAchievements(): Promise<{
  achievements: Achievement[];
  total_count: number;
  total_xp: number;
}> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/api/achievements`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `Failed to fetch achievements: ${response.status}`);
    }

    const data = await response.json();

    // Convert date strings to Date objects
    if (data.achievements) {
      data.achievements = data.achievements.map((achievement: any) => ({
        ...achievement,
        unlocked_at: achievement.unlocked_at ? new Date(achievement.unlocked_at) : undefined,
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
}

/**
 * Complete a challenge session and unlock achievements
 */
export async function completeSession(
  sessionId: string,
  correctAnswers: number,
  wrongAnswers: number,
  maxCombo: number,
  totalXP: number,
  answerTimes: number[],
  achievementIds: string[]
): Promise<{
  success: boolean;
  session_id: string;
  unlocked_achievements: Achievement[];
  total_xp: number;
}> {
  try {
    const baseUrl = getApiBaseUrl();
    const headers = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/api/achievements/sessions/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        max_combo: maxCombo,
        total_xp: totalXP,
        answer_times: answerTimes,
        achievements: achievementIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Session completion failed:', {
        status: response.status,
        errorData: JSON.stringify(errorData, null, 2),
      });
      throw new Error(JSON.stringify(errorData) || `Failed to complete session: ${response.status}`);
    }

    const data = await response.json();

    // Convert date strings to Date objects
    if (data.unlocked_achievements) {
      data.unlocked_achievements = data.unlocked_achievements.map((achievement: any) => ({
        ...achievement,
        unlocked_at: achievement.unlocked_at ? new Date(achievement.unlocked_at) : undefined,
      }));
    }

    return data;
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
}

/**
 * Get all available achievements (public endpoint)
 */
export async function getAvailableAchievements(): Promise<{
  achievements: Achievement[];
  total_count: number;
}> {
  try {
    const baseUrl = getApiBaseUrl();

    const response = await fetch(`${baseUrl}/api/achievements/available`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `Failed to fetch available achievements: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching available achievements:', error);
    throw error;
  }
}
