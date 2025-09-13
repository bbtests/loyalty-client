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
      // Step 1: Initialize payment
      const paymentInit = await initializePayment({
        amount: 50000,
        description: "Mock purchase for testing achievements",
        provider: "mock",
      }).unwrap();

      // Step 2: Extract reference
      const reference = paymentInit?.data?.reference || paymentInit?.reference;
      if (!reference) {
        throw new Error("Failed to initialize payment: No reference generated");
      }

      // Step 3: Simulate payment processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Verify payment
      const paymentVerification = await verifyPayment({
        reference: reference,
        provider: "mock",
      }).unwrap();

      // Step 5: Extract verification data
      const verificationData = {
        status:
          paymentVerification?.data?.status || paymentVerification?.status,
        amount:
          paymentVerification?.data?.amount || paymentVerification?.amount,
        transaction_id:
          paymentVerification?.data?.transaction_id ||
          paymentVerification?.transaction_id,
      };

      if (!verificationData.status) {
        throw new Error("Payment verification failed: No status received");
      }
      if (!verificationData.amount) {
        throw new Error("Payment verification failed: No amount received");
      }
      if (!verificationData.transaction_id) {
        throw new Error(
          "Payment verification failed: No transaction ID received",
        );
      }

      if (verificationData.status !== "success") {
        throw new Error("Payment verification failed");
      }

      // Step 6: Process purchase
      await processPurchaseAfterPayment({
        user_id: parseInt(session.user.id),
        amount: verificationData.amount,
        transaction_id: verificationData.transaction_id,
      }).unwrap();

      // Step 7: Refresh loyalty data to get updated achievements
      refetch();
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
