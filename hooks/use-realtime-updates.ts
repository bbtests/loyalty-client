import { useSession } from "next-auth/react";
import { useGetUserLoyaltyDataQuery } from "@/store/loyalty";
import { useWebSocketUpdates } from "./use-websocket-updates";
import { useCallback, useEffect } from "react";

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

  // Log when loyalty data changes
  useEffect(() => {
    if (loyaltyData) {
      console.log('📊 Loyalty data updated', {
        userId,
        timestamp: new Date().toISOString(),
        data: {
          points: loyaltyData.points,
          achievementsCount: loyaltyData.achievements?.length || 0,
          badgesCount: loyaltyData.badges?.length || 0,
          currentBadge: loyaltyData.current_badge?.name || 'None',
        },
      });
    }
  }, [loyaltyData, userId]);

  // Manual refresh function for when WebSocket is offline
  const refreshData = useCallback(() => {
    console.log('🔄 Manual data refresh triggered', {
      userId,
      timestamp: new Date().toISOString(),
    });
    
    // Add delay before triggering achievements call to allow backend processing
    setTimeout(() => {
      console.log('🔄 Delayed manual refresh triggered', {
        userId,
        timestamp: new Date().toISOString(),
        delay: '1500ms',
      });
      
      // Force refetch with cache busting
      refetchLoyaltyData();
      
      // Also trigger a small delay to ensure the refetch completes
      setTimeout(() => {
        console.log('🔄 Secondary data refresh triggered', {
          userId,
          timestamp: new Date().toISOString(),
        });
        refetchLoyaltyData();
      }, 100);
    }, 1500);
  }, [refetchLoyaltyData, userId]);

  // Enhanced refresh function with retry mechanism for WebSocket events
  const refreshDataWithRetry = useCallback(async (maxRetries = 3, delay = 2000, initialDelay = 1500) => {
    console.log('🔄 Enhanced refresh with retry mechanism', {
      userId,
      timestamp: new Date().toISOString(),
      maxRetries,
      delay,
      initialDelay,
    });
    
    // Add initial delay to allow backend processing to complete
    console.log(`⏳ Waiting ${initialDelay}ms before starting refresh attempts`, {
      userId,
      timestamp: new Date().toISOString(),
    });
    await new Promise(resolve => setTimeout(resolve, initialDelay));
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Refresh attempt ${attempt}/${maxRetries}`, {
        userId,
        timestamp: new Date().toISOString(),
      });
      
      // Force refetch
      await refetchLoyaltyData();
      
      // Wait for the specified delay before next attempt
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('✅ Enhanced refresh completed successfully', {
      userId,
      timestamp: new Date().toISOString(),
      totalAttempts: maxRetries,
    });
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
