/**
 * SubscriptionManagementScreen.tsx
 * Manage subscription - Cancel and Reactivate
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../api/config';

interface SubscriptionManagementScreenProps {
  onBack: () => void;
}

interface SubscriptionLimits {
  minutes_remaining?: number;
  is_unlimited?: boolean;
  period_end?: string;
}

interface SubscriptionStatus {
  status: string | null;
  plan: string | null;
  period: string | null;
  price_id: string | null;
  is_in_trial: boolean;
  trial_end_date: string | null;
  trial_days_remaining: number | null;
  limits?: SubscriptionLimits;
}

const SubscriptionManagementScreen: React.FC<SubscriptionManagementScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed: ${response.status}`);
    }

    return response.json();
  };

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchWithAuth('/api/stripe/subscription-status');
      setSubscription(data);
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      setError('Failed to load subscription information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      subscription?.is_in_trial ? 'Cancel Trial' : 'Cancel Subscription',
      subscription?.is_in_trial
        ? 'Are you sure you want to cancel your free trial? You will immediately lose access to premium features and no charges will be applied.'
        : 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        {
          text: 'Keep ' + (subscription?.is_in_trial ? 'Trial' : 'Subscription'),
          style: 'cancel',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: confirmCancelSubscription
        }
      ]
    );
  };

  const confirmCancelSubscription = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      const responseData = await fetchWithAuth('/api/stripe/cancel-subscription', {
        method: 'POST',
      });

      // Refresh subscription status
      await fetchSubscriptionStatus();

      // Show success message
      const message = responseData.period_end_date
        ? `Cancellation scheduled. Your subscription will remain active until ${responseData.period_end_date}. You can reactivate anytime before then.`
        : 'Your subscription has been canceled successfully. You will retain access until the end of your current billing period.';

      setSuccessMessage(message);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      setError(error.message || 'Failed to cancel subscription. Please try again later.');

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      const responseData = await fetchWithAuth('/api/stripe/reactivate-subscription', {
        method: 'POST',
      });

      // Refresh subscription status
      await fetchSubscriptionStatus();

      // Show success message
      const message = responseData.period_end_date
        ? `Subscription reactivated! Your subscription will continue and auto-renew on ${responseData.period_end_date}.`
        : 'Your subscription has been reactivated successfully!';

      setSuccessMessage(message);

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      setError(error.message || 'Failed to reactivate subscription. Please try again later.');

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatPlanName = (plan: string | null) => {
    if (!plan) return 'No Plan';

    return plan
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatPeriod = (period: string | null) => {
    if (!period) return '';

    return period === 'monthly' ? 'Monthly' : 'Annual';
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'trialing':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'canceling':
        return { bg: '#FED7AA', text: '#C2410C' };
      case 'canceled':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'past_due':
        return { bg: '#FEF3C7', text: '#CA8A04' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getStatusDisplayText = (status: string | null) => {
    switch (status) {
      case 'trialing':
        return 'Free Trial';
      case 'active':
        return 'Active';
      case 'canceling':
        return 'Canceling';
      case 'canceled':
        return 'Canceled';
      case 'past_due':
        return 'Past Due';
      default:
        return status || 'Unknown';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'the end of your billing period';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'the end of your billing period';
    }
  };

  const calculateDaysRemaining = (periodEnd: string | null) => {
    if (!periodEnd) return 0;

    try {
      const endDate = new Date(periodEnd);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#14B8A6" />
          </TouchableOpacity>
          <Text style={styles.title}>Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      </View>
    );
  }

  if (error && !subscription) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#14B8A6" />
          </TouchableOpacity>
          <Text style={styles.title}>Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSubscriptionStatus}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColors = getStatusBadgeColor(subscription?.status);
  const daysRemaining = subscription?.limits?.period_end
    ? calculateDaysRemaining(subscription.limits.period_end)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#14B8A6" />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {subscription && subscription.status ? (
          <>
            {/* Trial Banner */}
            {subscription.is_in_trial && subscription.trial_days_remaining !== null && (
              <View style={styles.trialBanner}>
                <View style={styles.trialBannerIcon}>
                  <Ionicons name="information-circle" size={24} color="#3B82F6" />
                </View>
                <View style={styles.trialBannerContent}>
                  <Text style={styles.trialBannerTitle}>🎉 Free Trial Active</Text>
                  <Text style={styles.trialBannerText}>
                    <Text style={styles.trialBannerBold}>
                      {subscription.trial_days_remaining} days remaining
                    </Text> in your free trial.
                  </Text>
                  {subscription.trial_end_date && (
                    <Text style={styles.trialBannerSubtext}>
                      Trial ends on {formatDate(subscription.trial_end_date)}
                    </Text>
                  )}
                  <Text style={styles.trialBannerNote}>
                    Cancel anytime during trial - no charges will be applied.
                  </Text>
                </View>
              </View>
            )}

            {/* Subscription Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Plan</Text>
                <Text style={styles.detailValue}>
                  {formatPlanName(subscription.plan)} {formatPeriod(subscription.period)}
                  {subscription.is_in_trial && (
                    <Text style={styles.trialBadge}> (Free Trial)</Text>
                  )}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                    {getStatusDisplayText(subscription.status)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {(subscription.status === 'active' || subscription.status === 'trialing') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelSubscription}
                  disabled={actionLoading}
                  activeOpacity={0.7}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>
                        {subscription.is_in_trial ? 'Cancel Trial' : 'Cancel Subscription'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {(subscription.status === 'canceling' || subscription.status === 'canceled') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.reactivateButton]}
                  onPress={handleReactivateSubscription}
                  disabled={actionLoading}
                  activeOpacity={0.7}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="refresh-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Reactivate Subscription</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Cancellation Warning Box */}
            {subscription.status === 'canceling' && subscription.limits && (
              <View style={styles.warningBox}>
                <View style={styles.warningHeader}>
                  <Ionicons name="warning" size={28} color="#F59E0B" />
                  <Text style={styles.warningTitle}>⚠️ Cancellation Scheduled</Text>
                </View>
                <Text style={styles.warningText}>
                  Your subscription will remain active until{' '}
                  <Text style={styles.warningTextBold}>
                    {formatDate(subscription.limits.period_end)}
                  </Text>
                  .
                </Text>

                <View style={styles.remainingBox}>
                  <Text style={styles.remainingTitle}>You still have:</Text>
                  <View style={styles.remainingList}>
                    <View style={styles.remainingItem}>
                      <Text style={styles.remainingBullet}>•</Text>
                      <Text style={styles.remainingText}>
                        {subscription.limits.is_unlimited
                          ? 'Unlimited'
                          : Math.round(subscription.limits.minutes_remaining || 0)}{' '}
                        minutes available
                      </Text>
                    </View>
                    <View style={styles.remainingItem}>
                      <Text style={styles.remainingBullet}>•</Text>
                      <Text style={styles.remainingText}>Full access to all features</Text>
                    </View>
                    <View style={styles.remainingItem}>
                      <Text style={styles.remainingBullet}>•</Text>
                      <Text style={styles.remainingText}>
                        {daysRemaining} days of learning time
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.warningFooter}>
                  After {formatDate(subscription.limits.period_end)}, your subscription will not
                  renew. You can reactivate anytime before then.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noSubscriptionContainer}>
            <Ionicons name="card-outline" size={64} color="#6B8A84" />
            <Text style={styles.noSubscriptionText}>
              You don't have an active subscription. Upgrade to a premium plan to access all features.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0B1A1F',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#B4E4DD',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0B1A1F',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#0D2832',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#6EE7B7',
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#FCA5A5',
    lineHeight: 20,
  },
  trialBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  trialBannerIcon: {
    marginRight: 12,
  },
  trialBannerContent: {
    flex: 1,
  },
  trialBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 6,
  },
  trialBannerText: {
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
  },
  trialBannerBold: {
    fontWeight: '600',
  },
  trialBannerSubtext: {
    fontSize: 14,
    color: '#93C5FD',
    marginTop: 4,
  },
  trialBannerNote: {
    fontSize: 12,
    color: '#60A5FA',
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#B4E4DD',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trialBadge: {
    fontSize: 14,
    fontWeight: '400',
    color: '#60A5FA',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  reactivateButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  warningBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FBBF24',
  },
  warningText: {
    fontSize: 14,
    color: '#FCD34D',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningTextBold: {
    fontWeight: '600',
  },
  remainingBox: {
    backgroundColor: 'rgba(11, 26, 31, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  remainingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  remainingList: {
    gap: 6,
  },
  remainingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  remainingBullet: {
    fontSize: 14,
    color: '#B4E4DD',
  },
  remainingText: {
    flex: 1,
    fontSize: 14,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  warningFooter: {
    fontSize: 12,
    color: '#FCD34D',
    lineHeight: 18,
  },
  noSubscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0B1A1F',
  },
  noSubscriptionText: {
    marginTop: 16,
    fontSize: 16,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SubscriptionManagementScreen;
