import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { showSuccess } from "@/lib/notifications";
import { initializeEcho } from "@/lib/echo";
import { loyaltyApi } from "@/store/loyalty";
import { badges } from "@/store/badges";
import { achievements } from "@/store/achievements";
import { useDispatch } from "react-redux";

interface AchievementData {
  achievement: {
    id: number;
    name: string;
    description: string;
    badge_icon: string;
  };
}

interface BadgeData {
  badge: {
    id: number;
    name: string;
    description: string;
    icon: string;
    tier: number;
  };
}

interface WebSocketState {
  isConnected: boolean;
  isSubscribed: boolean;
  reconnectAttempts: number;
}

export function useWebSocketUpdates(onDataUpdate?: () => void, refreshDataWithRetry?: (maxRetries?: number, delay?: number, initialDelay?: number) => Promise<void>) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAchievementUnlocked = useCallback(
    (data: AchievementData) => {
      console.log('🎉 WebSocket Event Received: Achievement Unlocked', {
        event: 'achievement.unlocked',
        data,
        timestamp: new Date().toISOString(),
        userId,
      });
      
      if (data.achievement) {
        showSuccess(
          `🎉 Achievement Unlocked: ${data.achievement.name}`,
          data.achievement.description,
        );
        
        console.log('🔄 Invalidating RTK Query cache for achievement update', {
          tags: ['LoyaltyData', 'Achievements'],
          userId,
        });
        
        // More aggressive cache invalidation - reset entire cache for these APIs
        dispatch(loyaltyApi.util.resetApiState());
        dispatch(achievements.util.resetApiState());
        
        // Also try invalidating specific tags
        dispatch(loyaltyApi.util.invalidateTags(['LoyaltyData']));
        
        // Trigger data refresh with enhanced retry mechanism
        if (refreshDataWithRetry) {
          refreshDataWithRetry(3, 2000, 1500).catch(error => {
            console.error('❌ Enhanced refresh failed for achievement update', {
              userId,
              timestamp: new Date().toISOString(),
              error: error.message,
            });
            // Fallback to simple refresh
            onDataUpdate?.();
          });
        } else {
          // Fallback to delayed refresh
          setTimeout(() => {
            console.log('🔄 Delayed refresh triggered for achievement update', {
              userId,
              timestamp: new Date().toISOString(),
              delay: '2000ms',
            });
            onDataUpdate?.();
          }, 2000);
        }
        
        console.log('✅ Achievement unlock event processed successfully', {
          achievement: data.achievement.name,
          userId,
        });
      }
    },
    [onDataUpdate, dispatch, userId, refreshDataWithRetry],
  );

  const handleBadgeUnlocked = useCallback(
    (data: BadgeData) => {
      console.log('🏆 WebSocket Event Received: Badge Unlocked', {
        event: 'badge.unlocked',
        data,
        timestamp: new Date().toISOString(),
        userId,
      });
      
      if (data.badge) {
        showSuccess(
          `🏆 Badge Earned: ${data.badge.name}`,
          data.badge.description,
        );
        
        console.log('🔄 Invalidating RTK Query cache for badge update', {
          tags: ['LoyaltyData', 'Badges'],
          userId,
        });
        
        // More aggressive cache invalidation - reset entire cache for these APIs
        dispatch(loyaltyApi.util.resetApiState());
        dispatch(badges.util.resetApiState());
        
        // Also try invalidating specific tags
        dispatch(loyaltyApi.util.invalidateTags(['LoyaltyData']));
        
        // Trigger data refresh with enhanced retry mechanism
        if (refreshDataWithRetry) {
          refreshDataWithRetry(3, 2000, 1500).catch(error => {
            console.error('❌ Enhanced refresh failed for badge update', {
              userId,
              timestamp: new Date().toISOString(),
              error: error.message,
            });
            // Fallback to simple refresh
            onDataUpdate?.();
          });
        } else {
          // Fallback to delayed refresh
          setTimeout(() => {
            console.log('🔄 Delayed refresh triggered for badge update', {
              userId,
              timestamp: new Date().toISOString(),
              delay: '2000ms',
            });
            onDataUpdate?.();
          }, 2000);
        }
        
        console.log('✅ Badge unlock event processed successfully', {
          badge: data.badge.name,
          tier: data.badge.tier,
          userId,
        });
      }
    },
    [onDataUpdate, dispatch, userId, refreshDataWithRetry],
  );

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    let echoInstance: any = null;
    let channel: any = null;
    let subscriptionTimeout: NodeJS.Timeout | null = null;

    const setupEcho = async () => {
      try {
        // Store token in localStorage for Echo authentication
        const token = session?.accessToken;
        if (token) {
          localStorage.setItem("token", token);
        }

        // Initialize Echo dynamically
        echoInstance = await initializeEcho();
        if (!echoInstance) {
          setIsConnected(false);
          setIsSubscribed(false);
          return;
        }

        // Set connected state immediately when Echo is initialized
        setIsConnected(true);
        setReconnectAttempts(0);

        const channelName = `private-user.${userId}`;

        // Listen for connection state changes
        echoInstance.connector.pusher.connection.bind("connected", () => {
          console.log('🔗 WebSocket Connected', {
            userId,
            timestamp: new Date().toISOString(),
            channel: channelName,
          });
          setIsConnected(true);
          setReconnectAttempts(0);
        });

        echoInstance.connector.pusher.connection.bind("disconnected", () => {
          console.log('❌ WebSocket Disconnected', {
            userId,
            timestamp: new Date().toISOString(),
            channel: channelName,
          });
          setIsConnected(false);
          setIsSubscribed(false);
        });

        echoInstance.connector.pusher.connection.bind("error", (error: any) => {
          console.log('🚨 WebSocket Error', {
            userId,
            timestamp: new Date().toISOString(),
            channel: channelName,
            error,
          });
          setIsConnected(false);
          setIsSubscribed(false);
        });

        // Subscribe to private channel
        channel = echoInstance.private(channelName);

        // Listen for subscription success
        channel.subscribed(() => {
          console.log('✅ WebSocket Channel Subscribed', {
            userId,
            timestamp: new Date().toISOString(),
            channel: channelName,
          });
          if (subscriptionTimeout) {
            clearTimeout(subscriptionTimeout);
            subscriptionTimeout = null;
          }
          setIsSubscribed(true);
        });

        // Listen for subscription error
        channel.error((error: any) => {
          console.log('❌ WebSocket Channel Subscription Error', {
            userId,
            timestamp: new Date().toISOString(),
            channel: channelName,
            error,
          });
          setIsSubscribed(false);
        });

        // Fallback: If subscription doesn't trigger within 2 seconds, assume it's connected
        // This handles cases where the subscription event might not fire
        subscriptionTimeout = setTimeout(() => {
          setIsSubscribed((prevSubscribed) => {
            if (!prevSubscribed) {
              return true;
            }
            return prevSubscribed;
          });
        }, 2000);

        // Listen for achievement events
        console.log('🎧 Setting up WebSocket event listeners', {
          userId,
          timestamp: new Date().toISOString(),
          channel: channelName,
          events: ['achievement.unlocked', 'badge.unlocked'],
        });
        
        channel.listen("achievement.unlocked", handleAchievementUnlocked);

        // Listen for badge events
        channel.listen("badge.unlocked", handleBadgeUnlocked);
        
        console.log('✅ WebSocket event listeners set up successfully', {
          userId,
          timestamp: new Date().toISOString(),
          channel: channelName,
        });
      } catch (error) {
        console.log('🚨 WebSocket Setup Error', {
          userId,
          timestamp: new Date().toISOString(),
          error,
        });
        setIsConnected(false);
        setIsSubscribed(false);
      }
    };

    setupEcho();

    return () => {
      console.log('🧹 Cleaning up WebSocket connection', {
        userId,
        timestamp: new Date().toISOString(),
        channel: `private-user.${userId}`,
      });
      
      if (channel) {
        channel.stopListening("achievement.unlocked");
        channel.stopListening("badge.unlocked");
        echoInstance?.leaveChannel(`private-user.${userId}`);
        console.log('✅ WebSocket channel cleaned up', { userId });
      }
      if (echoInstance) {
        echoInstance.disconnect();
        console.log('✅ WebSocket instance disconnected', { userId });
      }
      // Clear any pending subscription timeout
      if (subscriptionTimeout) {
        clearTimeout(subscriptionTimeout);
        console.log('✅ Subscription timeout cleared', { userId });
      }
    };
  }, [
    userId,
    session?.accessToken,
    handleAchievementUnlocked,
    handleBadgeUnlocked,
  ]);

  return {
    isConnected,
    isSubscribed,
    reconnectAttempts,
  };
}
