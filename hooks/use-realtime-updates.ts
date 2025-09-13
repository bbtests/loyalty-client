import { useSession } from "next-auth/react";
import { useGetUserLoyaltyDataQuery } from "@/store/loyalty";
import { useWebSocketUpdates } from "./use-websocket-updates";
import { useCallback } from "react";

export function useRealtimeUpdates() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Get current loyalty data (no polling - only WebSocket updates)
  const { data: loyaltyData, refetch: refetchLoyaltyData } =
    useGetUserLoyaltyDataQuery(userId ? Number(userId) : 0, {
      skip: !userId,
      pollingInterval: 0, // No polling - only WebSocket updates
    });

  // Use WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    isSubscribed,
    reconnectAttempts,
  } = useWebSocketUpdates(refetchLoyaltyData);

  // Manual refresh function for when WebSocket is offline
  const refreshData = useCallback(() => {
    refetchLoyaltyData();
  }, [refetchLoyaltyData]);

  // Determine connection status
  const isWebSocketConnected = wsConnected && isSubscribed;
  const isWebSocketConnecting = wsConnected && !isSubscribed;
  const isWebSocketOffline = !wsConnected;

  return {
    refetchLoyaltyData,
    refreshData,
    isWebSocketConnected,
    isWebSocketConnecting,
    isWebSocketOffline,
    reconnectAttempts,
    loyaltyData,
  };
}
