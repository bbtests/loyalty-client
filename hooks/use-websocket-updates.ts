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

export function useWebSocketUpdates(onDataUpdate?: () => void) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAchievementUnlocked = useCallback(
    (data: AchievementData) => {
      if (data.achievement) {
        showSuccess(
          `🎉 Achievement Unlocked: ${data.achievement.name}`,
          data.achievement.description,
        );
        
               // Invalidate RTK Query cache to trigger data refresh
               dispatch(loyaltyApi.util.invalidateTags(['LoyaltyData']));
               dispatch(achievements.util.invalidateTags(['Achievements']));
        
        // Trigger data refresh
        onDataUpdate?.();
      }
    },
    [onDataUpdate, dispatch],
  );

  const handleBadgeUnlocked = useCallback(
    (data: BadgeData) => {
      if (data.badge) {
        showSuccess(
          `🏆 Badge Earned: ${data.badge.name}`,
          data.badge.description,
        );
        
               // Invalidate RTK Query cache to trigger data refresh
               dispatch(loyaltyApi.util.invalidateTags(['LoyaltyData']));
               dispatch(badges.util.invalidateTags(['Badges']));
        
        // Trigger data refresh
        onDataUpdate?.();
      }
    },
    [onDataUpdate, dispatch],
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
          setIsConnected(true);
          setReconnectAttempts(0);
        });

        echoInstance.connector.pusher.connection.bind("disconnected", () => {
          setIsConnected(false);
          setIsSubscribed(false);
        });

        echoInstance.connector.pusher.connection.bind("error", () => {
          setIsConnected(false);
          setIsSubscribed(false);
        });

        // Subscribe to private channel
        channel = echoInstance.private(channelName);

        // Listen for subscription success
        channel.subscribed(() => {
          if (subscriptionTimeout) {
            clearTimeout(subscriptionTimeout);
            subscriptionTimeout = null;
          }
          setIsSubscribed(true);
        });

        // Listen for subscription error
        channel.error((error: any) => {
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
        channel.listen("achievement.unlocked", handleAchievementUnlocked);

        // Listen for badge events
        channel.listen("badge.unlocked", handleBadgeUnlocked);
      } catch (error) {
        setIsConnected(false);
        setIsSubscribed(false);
      }
    };

    setupEcho();

    return () => {
      if (channel) {
        channel.stopListening("achievement.unlocked");
        channel.stopListening("badge.unlocked");
        echoInstance?.leaveChannel(`private-user.${userId}`);
      }
      if (echoInstance) {
        echoInstance.disconnect();
      }
      // Clear any pending subscription timeout
      if (subscriptionTimeout) {
        clearTimeout(subscriptionTimeout);
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
