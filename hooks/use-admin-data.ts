"use client";

import { useState, useEffect } from "react";

// Mock admin data - in real app, this would come from API
const mockAdminStats = {
  total_users: 2847,
  active_users: 2156,
  engagement_rate: 75.7,
  total_points_issued: 284750,
  total_points_redeemed: 89420,
  redemption_rate: 31.4,
  total_transactions: 1523,
  total_revenue: 45680,
  average_transaction: 30.0,
  achievements_unlocked: 4521,
  badges_earned: 1847,
  badge_distribution: [
    { name: "Bronze Member", tier: 1, count: 1278 },
    { name: "Silver Member", tier: 2, count: 854 },
    { name: "Gold Member", tier: 3, count: 567 },
    { name: "Platinum Member", tier: 4, count: 148 },
  ],
  recent_achievements: [
    {
      user_name: "John Smith",
      achievement_name: "Big Spender",
      unlocked_at: "2024-01-15T10:30:00Z",
    },
    {
      user_name: "Sarah Johnson",
      achievement_name: "Loyal Customer",
      unlocked_at: "2024-01-15T09:15:00Z",
    },
    {
      user_name: "Mike Wilson",
      achievement_name: "Frequent Buyer",
      unlocked_at: "2024-01-14T16:45:00Z",
    },
    {
      user_name: "Emily Davis",
      achievement_name: "First Purchase",
      unlocked_at: "2024-01-14T14:20:00Z",
    },
    {
      user_name: "Chris Brown",
      achievement_name: "Point Master",
      unlocked_at: "2024-01-14T11:10:00Z",
    },
  ],
};

export function useAdminData() {
  const [stats, setStats] = useState(mockAdminStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats(mockAdminStats);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return {
    stats,
    loading,
    recentActivity: stats.recent_achievements,
  };
}
