"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useInitializePaymentMutation,
  useVerifyPaymentMutation,
  useProcessPurchaseAfterPaymentMutation,
} from "@/store/loyalty";
import {
  handlePaymentRedirect,
  getDefaultProvider,
  isValidProvider,
  type PaymentProvider,
} from "@/lib/payment-providers";

interface PaymentData {
  amount: number;
  description: string;
  provider?: string;
}

interface PaymentTransaction {
  id: number;
  amount: number;
  points_earned: number;
  transaction_type: string;
  status: string;
  created_at: string;
}

export function usePayment() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use store mutations
  const [initializePayment] = useInitializePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [processPurchaseAfterPayment] =
    useProcessPurchaseAfterPaymentMutation();

  const processPayment = async (paymentData: PaymentData) => {
    if (!session?.user?.id) {
      const errorMessage = "User authentication is required";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Initialize payment
      const provider = (paymentData.provider ||
        getDefaultProvider()) as PaymentProvider;

      if (!isValidProvider(provider)) {
        throw new Error(`Invalid payment provider selected: ${provider}`);
      }

      const paymentInit = await initializePayment({
        amount: paymentData.amount,
        description: paymentData.description,
        provider: provider,
      }).unwrap();

      console.log("Payment initialized:", paymentInit);

      // Extract reference from response
      const reference = paymentInit?.data?.reference || paymentInit?.reference;
      if (!reference) {
        throw new Error("Failed to initialize payment: No reference generated");
      }

      // Step 2: Handle payment provider redirect logic
      const redirectResult = handlePaymentRedirect(
        provider,
        paymentInit,
        (response) => {
          if (provider === "paystack")
            return (
              response?.data?.authorization_url || response?.authorization_url
            );
          if (provider === "flutterwave")
            return response?.data?.payment_url || response?.payment_url;
          return undefined;
        },
      );

      if (redirectResult.shouldRedirect && redirectResult.redirectUrl) {
        // Redirect to payment provider
        window.location.href = redirectResult.redirectUrl;
        return {
          success: true,
          redirect: true,
          authorization_url: redirectResult.redirectUrl,
        };
      } else {
        // For mock provider or providers without redirect, simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment processing time

        // Step 3: Verify payment
        const paymentVerification = await verifyPayment({
          reference: reference,
          provider: provider,
        }).unwrap();

        console.log("Payment verified:", paymentVerification);

        // Extract verification data
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

        // Step 4: Process transaction only after successful payment verification
        const transaction = await processPurchaseAfterPayment({
          user_id: parseInt(session.user.id),
          amount: paymentData.amount,
          transaction_id: verificationData.transaction_id,
        }).unwrap();

        return {
          success: true,
          transaction: {
            id: transaction.id,
            amount: parseFloat(transaction.amount),
            points_earned: transaction.points_earned,
            transaction_type: transaction.transaction_type,
            status: transaction.status,
            created_at: transaction.created_at,
          },
        };
      }
    } catch (err: any) {
      console.error("Payment Processing Error:", err, { paymentData });
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        "An unexpected error occurred";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error,
  };
}
