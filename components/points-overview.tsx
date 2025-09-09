"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Coins, TrendingUp, Gift } from "lucide-react"

interface PointsOverviewProps {
  loyaltyData: any
}

export function PointsOverview({ loyaltyData }: PointsOverviewProps) {
  const availablePoints = loyaltyData?.points?.available || 0
  const totalEarned = loyaltyData?.points?.total_earned || 0
  const totalRedeemed = loyaltyData?.points?.total_redeemed || 0

  // Calculate progress to next tier (example: every 2500 points)
  const nextTierThreshold = Math.ceil((totalEarned + 1) / 2500) * 2500
  const progressToNextTier = ((totalEarned % 2500) / 2500) * 100

  return (
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
          <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Next Tier Progress</CardTitle>
          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-card-foreground">{totalEarned.toLocaleString()}</span>
            <span className="text-muted-foreground">{nextTierThreshold.toLocaleString()}</span>
          </div>
          <Progress value={progressToNextTier} className="h-2" />
          <p className="text-xs text-muted-foreground">{nextTierThreshold - totalEarned} points to next tier</p>
        </CardContent>
      </Card>
    </div>
  )
}
