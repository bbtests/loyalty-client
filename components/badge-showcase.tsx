"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Medal, Crown, Star, Award, Loader2 } from "lucide-react"
import type { Badge as BadgeType, CurrentBadge } from "@/types/api"
import { useGetBadgesQuery } from "@/store/badges"

interface BadgeShowcaseProps {
  badges: BadgeType[]
  currentBadge: CurrentBadge | null
}

interface TierInfo {
  tier: number
  name: string
  description: string
  points_required: number
  icon: string
}

const tierColors = {
  1: "from-amber-600 to-amber-700", // Bronze
  2: "from-gray-400 to-gray-500", // Silver
  3: "from-yellow-400 to-yellow-500", // Gold
  4: "from-purple-500 to-purple-600", // Platinum
}

const tierIcons = {
  1: Medal,
  2: Star,
  3: Crown,
  4: Award,
}

export function BadgeShowcase({ badges, currentBadge }: BadgeShowcaseProps) {
  // Fetch all available badges from the backend
  const { data: allBadges, isLoading, error } = useGetBadgesQuery()


  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading badges...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load badges</p>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Get all unique tiers from the backend badges, sorted by tier
  // Handle different possible data structures
  let badgesArray: any[] = []
  
  if (allBadges) {
    if (Array.isArray(allBadges)) {
      // Direct array
      badgesArray = allBadges
    } else if ((allBadges as any).data && Array.isArray((allBadges as any).data)) {
      // Wrapped in data property
      badgesArray = (allBadges as any).data
    } else if ((allBadges as any).data && (allBadges as any).data.items && Array.isArray((allBadges as any).data.items)) {
      // API response format with items
      badgesArray = (allBadges as any).data.items
    }
  }

  const allTiers: TierInfo[] = badgesArray
    ?.filter((badge: any) => badge.is_active)
    ?.sort((a: any, b: any) => a.tier - b.tier)
    ?.map((badge: any): TierInfo => ({
      tier: badge.tier,
      name: badge.name,
      description: badge.description,
      points_required: badge.requirements?.points_minimum || 0,
      icon: badge.icon,
    })) || []

  // Fallback to hardcoded tiers if no badges are available
  const fallbackTiers: TierInfo[] = [
    { tier: 1, name: "Bronze Member", description: "Welcome to our loyalty program", points_required: 0, icon: "medal" },
    { tier: 2, name: "Silver Member", description: "Reach 2500 points", points_required: 2500, icon: "star" },
    { tier: 3, name: "Gold Member", description: "Reach 10000 points", points_required: 10000, icon: "crown" },
    { tier: 4, name: "Platinum Member", description: "Reach 25000 points", points_required: 25000, icon: "award" },
  ]

  const tiersToShow: TierInfo[] = allTiers.length > 0 ? allTiers : fallbackTiers

  return (
    <div className="space-y-8">
      {/* Current Badge Highlight */}
      {currentBadge && (
        <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl">Current Badge: {currentBadge.name}</CardTitle>
            <p className="opacity-90">Your current membership tier</p>
          </CardHeader>
          <CardContent className="text-center">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Tier {currentBadge.tier}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Badge Progression */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Badge Progression</h2>
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiersToShow.map((tier: TierInfo) => {
            // More robust badge matching - try multiple approaches
            let earnedBadge = badges.find((b) => b.tier === tier.tier)
            
            // If not found by tier, try by name as fallback
            if (!earnedBadge) {
              earnedBadge = badges.find((b) => b.name.toLowerCase() === tier.name.toLowerCase())
            }
            
            
            // Use dynamic icon mapping or fallback to tier-based icons
            const IconComponent = tierIcons[tier.tier as keyof typeof tierIcons] || Medal
            const isEarned = !!earnedBadge
            const isCurrent = currentBadge?.tier === tier.tier

            return (
              <Card
                key={tier.tier}
                className={`${isEarned ? "bg-card border-accent" : "bg-muted border-border"} ${isCurrent ? "ring-2 ring-primary" : ""} transition-all duration-300`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto w-16 h-16 bg-gradient-to-br ${isEarned ? tierColors[tier.tier as keyof typeof tierColors] : "from-gray-300 to-gray-400"} rounded-full flex items-center justify-center mb-3`}
                  >
                    <IconComponent className={`w-8 h-8 ${isEarned ? "text-white" : "text-gray-500"}`} />
                  </div>
                  <CardTitle className={`text-lg ${isEarned ? "text-card-foreground" : "text-muted-foreground"}`}>
                    {tier.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className={`text-sm ${isEarned ? "text-card-foreground" : "text-muted-foreground"}`}>
                    {tier.description}
                  </p>

                  {isEarned && earnedBadge ? (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Earned {new Date(earnedBadge.earned_at).toLocaleDateString()}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {tier.points_required.toLocaleString()} points required
                    </Badge>
                  )}

                  {isCurrent && (
                    <Badge variant="default" className="mx-1 bg-primary text-primary-foreground">
                      Current Badge
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
