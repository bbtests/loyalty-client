"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  useGetUserLoyaltyDataQuery,
} from "@/store/loyalty";
import { useSimulateAchievementMutation } from "@/store/achievements";
import type { Achievement } from "@/types/api";

export function useLoyaltyData() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Use store query to fetch loyalty data
  const {
    data: loyaltyData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useGetUserLoyaltyDataQuery(parseInt(session?.user?.id || "0"), {
    skip: !session?.user?.id,
  });

  // Use store mutation for achievement simulation
  const [simulateAchievementMutation] = useSimulateAchievementMutation();

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

    // Show the achievement selection modal
    setShowAchievementModal(true);
  };

  const handleAchievementSelection = async (achievement: Achievement) => {
    try {

      // Use the store mutation to simulate the specific achievement unlock
      const result = await simulateAchievementMutation({
        achievement_id: achievement.id
      }).unwrap();

      refetch();

    } catch (err: any) {
      console.error("Simulate Achievement Error:", err);
      setError(err.message || "Failed to simulate achievement");
    }
  };

  const refreshData = () => { refetch(); };

  return {
    loyaltyData,
    loading,
    error,
    simulateAchievement,
    handleAchievementSelection,
    refreshData,
    showAchievementModal,
    setShowAchievementModal,
  };
}
