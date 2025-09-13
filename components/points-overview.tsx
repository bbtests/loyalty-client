"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Coins, TrendingUp, Gift, Loader2 } from "lucide-react"
import { useGetBadgesQuery } from "@/store/badges"

interface PointsOverviewProps {
  loyaltyData: any
}

export function PointsOverview({ loyaltyData }: PointsOverviewProps) {
  const availablePoints = loyaltyData?.points?.available || 0
  const totalEarned = loyaltyData?.points?.total_earned || 0
  const totalRedeemed = loyaltyData?.points?.total_redeemed || 0

  // Fetch badges from API to get actual tier requirements
  const { data: allBadges, isLoading: badgesLoading } = useGetBadgesQuery()

  // Calculate next tier progress based on actual badge requirements
  const calculateNextTierProgress = () => {
    if (!allBadges || badgesLoading) {
      // Fallback to hardcoded values while loading
      const nextTierThreshold = Math.ceil((totalEarned + 1) / 2500) * 2500
      const progressToNextTier = ((totalEarned % 2500) / 2500) * 100
      return {
        nextTierThreshold,
        progressToNextTier,
        pointsToNext: nextTierThreshold - totalEarned,
        nextTierName: 'Next Tier'
      }
    }


    // Handle different possible data structures
    let badgesArray: any[] = []
    
    if (allBadges) {
      if (Array.isArray(allBadges)) {
        badgesArray = allBadges
      } else if ((allBadges as any).data && Array.isArray((allBadges as any).data)) {
        badgesArray = (allBadges as any).data
      } else if ((allBadges as any).data && (allBadges as any).data.items && Array.isArray((allBadges as any).data.items)) {
        badgesArray = (allBadges as any).data.items
      }
    }

    // Filter active badges and sort by tier
    const activeBadges = badgesArray
      ?.filter((badge: any) => badge.is_active)
      ?.sort((a: any, b: any) => a.tier - b.tier) || []


    // Get user's current badge tier
    const currentBadge = loyaltyData?.current_badge
    const currentTier = currentBadge?.tier || 0


    // Find the next tier badge
    const nextTierBadge = activeBadges.find((badge: any) => badge.tier > currentTier)


    if (!nextTierBadge) {
      // User is at the highest tier
      return {
        nextTierThreshold: totalEarned,
        progressToNextTier: 100,
        pointsToNext: 0,
        nextTierName: 'Max Tier Reached'
      }
    }

    // Get points requirement for next tier
    const nextTierPointsRequired = nextTierBadge.requirements?.points_minimum || 0
    
    // Calculate progress
    const progressToNextTier = Math.min((totalEarned / nextTierPointsRequired) * 100, 100)
    const pointsToNext = Math.max(nextTierPointsRequired - totalEarned, 0)


    return {
      nextTierThreshold: nextTierPointsRequired,
      progressToNextTier,
      pointsToNext,
      nextTierName: nextTierBadge.name
    }
  }

  const tierProgress = calculateNextTierProgress()

  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Available Points */}
      <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground border-0 pulse-glow sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Available Points</CardTitle>
          <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{availablePoints.toLocaleString()}</div>
          <p className="text-xs opacity-90 mt-1">Ready to redeem</p>
        </CardContent>
      </Card>

      {/* Total Earned */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Total Earned</CardTitle>
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-card-foreground">{totalEarned.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Lifetime points</p>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
            {badgesLoading ? 'Loading...' : tierProgress.nextTierName}
          </CardTitle>
          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
        </CardHeader>
        <CardContent className="space-y-3">
          {badgesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-card-foreground">{totalEarned.toLocaleString()}</span>
                <span className="text-muted-foreground">{tierProgress.nextTierThreshold.toLocaleString()}</span>
              </div>
              <Progress value={tierProgress.progressToNextTier} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {tierProgress.pointsToNext === 0 
                  ? 'Max tier reached!' 
                  : `${tierProgress.pointsToNext.toLocaleString()} points to next tier`
                }
              </p>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
