"use client"

import { useState, useEffect } from "react"

// Mock user data - in real app, this would come from API
const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    points: { available: 2750, total_earned: 8950 },
    achievements_count: 5,
    current_badge: { name: "Gold Member", tier: 3, icon: "gold-medal" },
    member_since: "2023-06-15",
    last_activity: "2024-01-15 14:30:00",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    points: { available: 1850, total_earned: 5420 },
    achievements_count: 3,
    current_badge: { name: "Silver Member", tier: 2, icon: "silver-medal" },
    member_since: "2023-08-22",
    last_activity: "2024-01-14 16:45:00",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@example.com",
    points: { available: 4200, total_earned: 12750 },
    achievements_count: 7,
    current_badge: { name: "Platinum Member", tier: 4, icon: "platinum-medal" },
    member_since: "2023-03-10",
    last_activity: "2024-01-15 09:20:00",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    points: { available: 950, total_earned: 2100 },
    achievements_count: 2,
    current_badge: { name: "Bronze Member", tier: 1, icon: "bronze-medal" },
    member_since: "2023-11-05",
    last_activity: "2024-01-13 11:15:00",
  },
  {
    id: 5,
    name: "Chris Brown",
    email: "chris.brown@example.com",
    points: { available: 3150, total_earned: 9800 },
    achievements_count: 6,
    current_badge: { name: "Gold Member", tier: 3, icon: "gold-medal" },
    member_since: "2023-07-18",
    last_activity: "2024-01-15 13:40:00",
  },
]

export function useAdminUsers() {
  const [users, setUsers] = useState(mockUsers)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const searchUsers = (searchTerm: string) => {
    if (!searchTerm) {
      setUsers(mockUsers)
      return
    }

    const filtered = mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setUsers(filtered)
  }

  return {
    users,
    loading,
    searchUsers,
  }
}
