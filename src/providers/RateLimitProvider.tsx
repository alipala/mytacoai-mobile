/**
 * Rate Limit Provider
 * ====================
 *
 * Global provider that shows rate limit modal when needed.
 * Wraps the entire app and listens for 429 errors.
 */

import React, { useState, useCallback } from 'react';
import { RateLimitModal, RateLimitInfo } from '../components/RateLimitModal';
import { registerRateLimitHandler } from '../utils/rateLimitHandler';

interface RateLimitProviderProps {
  children: React.ReactNode;
}

export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({ children }) => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Handle rate limit trigger
  const handleRateLimit = useCallback((info: RateLimitInfo) => {
    console.log('[RateLimitProvider] Rate limit triggered:', info);
    setRateLimitInfo(info);
    setModalVisible(true);
  }, []);

  // Register handler on mount
  React.useEffect(() => {
    registerRateLimitHandler({
      onRateLimit: handleRateLimit,
    });
  }, [handleRateLimit]);

  // Dismiss modal
  const handleDismiss = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      {children}

      {/* Rate Limit Modal */}
      {rateLimitInfo && (
        <RateLimitModal
          visible={modalVisible}
          info={rateLimitInfo}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
};

export default RateLimitProvider;
