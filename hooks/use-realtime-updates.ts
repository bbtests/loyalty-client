import { useSession } from "next-auth/react";
import { useGetUserLoyaltyDataQuery } from "@/store/loyalty";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { initializeEcho } from "@/lib/echo";

// ============================================================================
// TYPES
// ============================================================================

interface WebSocketEventHandlers {
  onAchievementUnlocked?: (data: any) => void;
  onBadgeUnlocked?: (data: any) => void;
  onDataUpdate?: () => void;
}

interface WebSocketConnection {
  echoInstance: any;
  channel: any;
  subscriptionTimeout: NodeJS.Timeout | null;
}

interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isOffline: boolean;
  status: 'connected' | 'connecting' | 'offline';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NOTIFICATION_DURATION = 4000;
const SUBSCRIPTION_TIMEOUT = 2000;
const REFRESH_DELAY = 3000;
const DEBOUNCE_DELAY = 1000;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Unified hook for real-time updates via WebSocket
 * 
 * Provides loyalty data, WebSocket connection status, and utility functions
 * for managing real-time updates including achievement notifications.
 * 
 * @param eventHandlers - Optional custom event handlers for WebSocket events
 * @returns Object containing loyalty data, WebSocket status, and utility functions
 * 
 * @example
 * // Basic usage
 * const { loyaltyData, isConnected, refreshData } = useRealtimeUpdates();
 * 
 * @example
 * // With custom event handlers
 * const { loyaltyData, isConnected } = useRealtimeUpdates({
 *   onAchievementUnlocked: (data) => console.log('Achievement unlocked!', data),
 *   onBadgeUnlocked: (data) => console.log('Badge earned!', data),
 *   onDataUpdate: () => console.log('Data updated!')
 * });
 */
export function useRealtimeUpdates(eventHandlers: WebSocketEventHandlers = {}) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { data: session } = useSession();
  const dispatch = useDispatch();
  const userId = session?.user?.id;
  const accessToken = session?.accessToken;

  // Refs for stable references and cleanup
  const connectionRef = useRef<WebSocketConnection | null>(null);
  const eventHandlersRef = useRef(eventHandlers);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Achievement notification state
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [achievementNotificationData, setAchievementNotificationData] = useState<any>(null);

  // Loyalty data query
  const {
    data: loyaltyData,
    isLoading: loyaltyLoading,
    error: loyaltyError,
    refetch: refetchLoyaltyData
  } = useGetUserLoyaltyDataQuery(userId ? Number(userId) : 0, {
    skip: !userId,
    pollingInterval: 0, // No polling - only WebSocket updates
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update event handlers ref when they change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const handleAchievementNotification = useCallback((achievementData: any) => {
    setAchievementNotificationData(achievementData);
    setShowAchievementNotification(true);

    setTimeout(() => {
      setShowAchievementNotification(false);
    }, NOTIFICATION_DURATION);
  }, []);

  const invalidateCache = useCallback(() => {
    dispatch({ type: 'loyaltyApi/util/resetApiState' });
    dispatch({ type: 'achievements/util/resetApiState' });
    dispatch({ type: 'loyaltyApi/util/invalidateTags', payload: ['LoyaltyData'] });
  }, [dispatch]);

  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Refreshing loyalty data (debounced)');
      refetchLoyaltyData();
    }, DEBOUNCE_DELAY);
  }, [refetchLoyaltyData]);

  const refreshData = useCallback(() => {
    console.log('🔄 Manual refresh requested');
    setTimeout(() => {
      refetchLoyaltyData();
    }, REFRESH_DELAY);
  }, [refetchLoyaltyData]);

  const refreshDataWithRetry = useCallback(async (
    maxRetries = 1,
    delay = REFRESH_DELAY,
    initialDelay = REFRESH_DELAY
  ) => {
    console.log('🔄 WebSocket-triggered refresh with retry');
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await refetchLoyaltyData();
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [refetchLoyaltyData]);

  // ============================================================================
  // WEBSOCKET CONNECTION MANAGEMENT
  // ============================================================================

  const setupConnection = useCallback(async () => {
    if (!userId || !accessToken || typeof window === "undefined") return;

    // Prevent duplicate connections
    if (connectionRef.current || isConnectingRef.current) { 
      console.log('🔄 Connection already exists or connecting, skipping setup');
      return; 
    }
    isConnectingRef.current = true;

    try {
      const echoInstance = await initializeEcho(accessToken);
      if (!echoInstance) {
        console.error('❌ Failed to initialize Echo instance');
        setIsConnected(false);
        setIsSubscribed(false);
        isConnectingRef.current = false;
        return;
      }

      console.log('✅ Echo instance initialized successfully');

      const channelName = `user.${userId}`;
      
      const channel = echoInstance.private(channelName);
      const subscriptionTimeout = setTimeout(() => {
        setIsSubscribed(prev => prev || true);
      }, SUBSCRIPTION_TIMEOUT);

      // Store connection for cleanup
      connectionRef.current = {
        echoInstance,
        channel,
        subscriptionTimeout
      };

      // Set up connection event listeners
      const connection = echoInstance.connector.pusher.connection;
      connection.bind("connected", () => {
        setIsConnected(true);
        setReconnectAttempts(0);
      });

      connection.bind("disconnected", () => {
        setIsConnected(false);
        setIsSubscribed(false);
      });

      connection.bind("error", (error: any) => {
        console.error('WebSocket Error', error);
        setIsConnected(false);
        setIsSubscribed(false);
      });

      // Set up channel event listeners
      channel.subscribed(() => {
        console.log('✅ Channel subscribed successfully', { channelName, userId });
        if (subscriptionTimeout) {
          clearTimeout(subscriptionTimeout);
        }
        setIsSubscribed(true);
      });

      channel.error((error: any) => {
        console.error('❌ WebSocket Channel Subscription Error', { 
          channelName, 
          userId, 
          error: error.message || error,
          errorType: error.type,
          timestamp: new Date().toISOString()
        });
        setIsSubscribed(false);
      });

      // Set up event listeners with consolidated handling
      channel.listen(".achievement.unlocked", (data: any) => {
        console.log('🎉 Achievement unlocked via WebSocket', data);
        console.log('🎉 Achievement data received:', {
          achievement: data.achievement,
          user: data.user,
          timestamp: new Date().toISOString(),
          channelName,
          userId
        });
        if (data.achievement) {
          handleAchievementNotification(data.achievement);
          invalidateCache();
          debouncedRefresh();
        }
        eventHandlersRef.current.onAchievementUnlocked?.(data);
      });


      channel.listen(".badge.unlocked", (data: any) => {
        console.log('🏆 Badge unlocked via WebSocket', data);
        if (data.badge) {
          invalidateCache();
          debouncedRefresh();
        }
        eventHandlersRef.current.onBadgeUnlocked?.(data);
      });

      // Set initial state
      setIsConnected(true);
      setReconnectAttempts(0);
      console.log(echoInstance.connector.pusher.channels);


    } catch (error) {
      console.error('WebSocket Setup Error', error);
      setIsConnected(false);
      setIsSubscribed(false);
      isConnectingRef.current = false;
    }
  }, [userId, accessToken]); // Only depend on essential values, other functions accessed via refs

  const cleanupConnection = useCallback(() => {
    const connection = connectionRef.current;
    if (!connection) return;

    const { echoInstance, channel, subscriptionTimeout } = connection;

    if (channel) {
      channel.stopListening(".achievement.unlocked");
      channel.stopListening(".badge.unlocked");
      echoInstance?.leaveChannel(`user.${userId}`);
    }

    if (echoInstance) {
      echoInstance.disconnect();
    }

    if (subscriptionTimeout) {
      clearTimeout(subscriptionTimeout);
    }

    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Reset connection state
    connectionRef.current = null;
    isConnectingRef.current = false;
  }, [userId]);

  // WebSocket connection effect - only run when userId or accessToken changes
  useEffect(() => {
    setupConnection();
    return cleanupConnection;
  }, [userId, accessToken]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const connectionStatus: ConnectionStatus = useMemo(() => {
    if (isConnected && isSubscribed) {
      return {
        isConnected: true,
        isConnecting: false,
        isOffline: false,
        status: 'connected'
      };
    } else if (isConnected && !isSubscribed) {
      return {
        isConnected: false,
        isConnecting: true,
        isOffline: false,
        status: 'connecting'
      };
    } else {
      return {
        isConnected: false,
        isConnecting: false,
        isOffline: true,
        status: 'offline'
      };
    }
  }, [isConnected, isSubscribed]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    loyaltyData,
    loyaltyLoading,
    loyaltyError,

    // WebSocket status
    ...connectionStatus,
    reconnectAttempts,

    // Actions
    refreshData,
    refreshDataWithRetry,
    refetchLoyaltyData,

    // Achievement notifications
    showAchievementNotification,
    achievementNotificationData,
    setShowAchievementNotification,
  };
}