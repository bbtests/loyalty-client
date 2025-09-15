"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    useGetUserLoyaltyDataQuery,
    useInitializePaymentMutation,
    useVerifyPaymentMutation,
    useProcessPurchaseAfterPaymentMutation,
} from "@/store/loyalty";

export function useLoyaltyData() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  // Use store query to fetch loyalty data
  const {
    data: loyaltyData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useGetUserLoyaltyDataQuery(parseInt(session?.user?.id || "0"), {
    skip: !session?.user?.id,
  });

  // Use store mutations for payment processing
  const [initializePayment] = useInitializePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [processPurchaseAfterPayment] =
    useProcessPurchaseAfterPaymentMutation();

  // Set error from query if it exists
  useEffect(() => {
    if (queryError) {
      const errorMessage =
        "message" in queryError
          ? queryError.message
          : "error" in queryError
            ? queryError.error
            : "Failed to load loyalty data";
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [queryError]);

  const simulateAchievement = async () => {
    if (!session?.user?.id) {
      setError("User authentication is required");
      return;
    }

    try {
      // Just refresh the data without triggering real achievement processing
      // This simulates the UI update without calling the backend
      console.log("🎯 Simulating achievement UI update (mock mode)");
      
      // Refresh loyalty data to get current state
      refetch();
      
      // Show a mock success message
      console.log("✅ Mock achievement simulation completed");
    } catch (err: any) {
      console.error("Simulate Achievement Error:", err);
      setError(err.message || "Failed to simulate achievement");
    }
  };

  const refreshData = () => {
    refetch();
  };

  return {
    loyaltyData,
    loading,
    error,
    simulateAchievement,
    refreshData,
  };
}
