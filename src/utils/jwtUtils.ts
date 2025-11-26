/**
 * JWT Token Utilities
 * Handles JWT decoding and expiration validation
 */

export interface JWTPayload {
  exp?: number; // Expiration timestamp (seconds since epoch)
  iat?: number; // Issued at timestamp
  sub?: string; // Subject (usually user ID)
  [key: string]: any;
}

/**
 * Decode a JWT token without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Base64 decode (handle URL-safe base64)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false if still valid
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    // If we can't decode or no expiration, consider it invalid
    console.warn('Token has no expiration claim');
    return true;
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  // Add 5 minute buffer for safety
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  const isExpired = currentTime >= (expirationTime - bufferTime);

  if (isExpired) {
    console.log('🔒 Token expired at:', new Date(expirationTime).toISOString());
  }

  return isExpired;
};

/**
 * Get token expiration date
 * @param token - JWT token string
 * @returns Date object or null
 */
export const getTokenExpiration = (token: string): Date | null => {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
};

/**
 * Get remaining time until token expires (in seconds)
 * @param token - JWT token string
 * @returns Remaining seconds or 0 if expired
 */
export const getTokenRemainingTime = (token: string): number => {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remaining = Math.max(0, Math.floor((expirationTime - currentTime) / 1000));

  return remaining;
};
