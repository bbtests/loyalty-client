"use client"

import { useState, useEffect } from "react"

// Mock loyalty data - in real app, this would come from API
const mockLoyaltyData = {
  user_id: 1,
  points: {
    available: 2750,
    total_earned: 8950,
    total_redeemed: 6200,
  },
  achievements: [
    {
      id: 1,
      name: "First Purchase",
      description: "Made your first purchase",
      badge_icon: "trophy",
      unlocked_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Loyal Customer",
      description: "Earned 1000 loyalty points",
      badge_icon: "star",
      unlocked_at: "2024-01-05T00:00:00Z",
    },
    {
      id: 3,
      name: "Frequent Buyer",
      description: "Made 10 purchases",
      badge_icon: "repeat",
      unlocked_at: "2024-01-10T00:00:00Z",
    },
  ],
  badges: [
    {
      id: 1,
      name: "Bronze Member",
      description: "Welcome to our loyalty program",
      icon: "bronze-medal",
      tier: 1,
      earned_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Silver Member",
      description: "Reached 2500 points",
      icon: "silver-medal",
      tier: 2,
      earned_at: "2024-01-08T00:00:00Z",
    },
  ],
  current_badge: {
    id: 2,
    name: "Silver Member",
    tier: 2,
    icon: "silver-medal",
  },
}

export function useLoyaltyData() {
  const [loyaltyData, setLoyaltyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoyaltyData(mockLoyaltyData)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const simulateAchievement = () => {
    // Simulate earning points and potentially unlocking achievements
    setLoyaltyData((prev: any) =>
      prev
        ? {
            ...prev,
            points: {
              ...prev.points,
              available: prev.points.available + 500,
              total_earned: prev.points.total_earned + 500,
            },
          }
        : null,
    )
  }

  return {
    loyaltyData,
    loading,
    simulateAchievement,
  }
}
