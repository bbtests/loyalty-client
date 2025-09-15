import { useSession } from "next-auth/react";
import { useGetUserLoyaltyDataQuery } from "@/store/loyalty";
import { useWebSocketUpdates } from "./use-websocket-updates";
import { useCallback } from "react";

export function useRealtimeUpdates() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Get current loyalty data (no polling - only WebSocket updates)
  const { 
    data: loyaltyData, 
    isLoading: loyaltyLoading,
    error: loyaltyError,
    refetch: refetchLoyaltyData 
  } = useGetUserLoyaltyDataQuery(userId ? Number(userId) : 0, {
    skip: !userId,
    pollingInterval: 0, // No polling - only WebSocket updates
  });


  // Manual refresh function for when WebSocket is offline
  const refreshData = useCallback(() => {
    // Add delay before triggering achievements call to allow backend processing
    setTimeout(() => {
      // Force refetch with cache busting
      refetchLoyaltyData();
      
      // Also trigger a small delay to ensure the refetch completes
      setTimeout(() => {
        refetchLoyaltyData();
      }, 100);
    }, 3000);
  }, [refetchLoyaltyData, userId]);

  // Enhanced refresh function with retry mechanism for WebSocket events
  const refreshDataWithRetry = useCallback(async (maxRetries = 3, delay = 3000, initialDelay = 3000) => {
    // Add initial delay to allow backend processing to complete
    await new Promise(resolve => setTimeout(resolve, initialDelay));
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Force refetch
      await refetchLoyaltyData();
      
      // Wait for the specified delay before next attempt
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [refetchLoyaltyData, userId]);

  // Use WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    isSubscribed,
    reconnectAttempts,
  } = useWebSocketUpdates(refetchLoyaltyData, refreshDataWithRetry);

  // Determine connection status
  const isWebSocketConnected = wsConnected && isSubscribed;
  const isWebSocketConnecting = wsConnected && !isSubscribed;
  const isWebSocketOffline = !wsConnected;

  return {
    refetchLoyaltyData,
    refreshData,
    refreshDataWithRetry,
    isWebSocketConnected,
    isWebSocketConnecting,
    isWebSocketOffline,
    reconnectAttempts,
    loyaltyData,
    loyaltyLoading,
    loyaltyError,
  };
}
