"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Gift, TrendingUp, Loader2, Target, Award } from "lucide-react"
import { useSession } from "next-auth/react"
import { useGetUserLoyaltyDataQuery } from "@/store/loyalty"

export function LoyaltyPointsHistory() {
  const { data: session } = useSession()
  const userId = parseInt(session?.user?.id || "0")
  
  const { 
    data: loyaltyData, 
    isLoading, 
    error 
  } = useGetUserLoyaltyDataQuery(userId, {
    skip: !session?.user?.id,
  })

  const getBadgeIcon = (tier: number) => {
    switch (tier) {
      case 1:
        return <Target className="w-5 h-5 text-bronze" />
      case 2:
        return <Award className="w-5 h-5 text-silver" />
      case 3:
        return <Crown className="w-5 h-5 text-gold" />
      default:
        return <Trophy className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getBadgeColor = (tier: number) => {
    switch (tier) {
      case 1:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Loyalty Points</h2>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Loyalty Points</h2>
          <Badge variant="destructive">Error</Badge>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              Failed to load loyalty points data
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Loyalty Points</h2>
        <Badge variant="secondary" className="bg-primary text-primary-foreground">
          {loyaltyData?.points?.available || 0} Points Available
        </Badge>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Available Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loyaltyData?.points?.available?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ready to redeem</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Earned</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loyaltyData?.points?.total_earned?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loyaltyData?.points?.total_redeemed?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Points used</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Badge */}
      {loyaltyData?.current_badge && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Current Badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-background border border-border">
              <div className="flex-shrink-0">
                {getBadgeIcon(loyaltyData.current_badge.tier)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {loyaltyData.current_badge.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tier {loyaltyData.current_badge.tier}
                </p>
              </div>
              <Badge className={getBadgeColor(loyaltyData.current_badge.tier)}>
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {loyaltyData?.achievements && loyaltyData.achievements.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loyaltyData.achievements.slice(0, 5).map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex-shrink-0">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned on {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Badges */}
      {loyaltyData?.badges && loyaltyData.badges.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Earned Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {loyaltyData.badges.map((badge: any) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex-shrink-0">
                    {getBadgeIcon(badge.tier)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tier {badge.tier}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!loyaltyData?.achievements || loyaltyData.achievements.length === 0) && 
       (!loyaltyData?.badges || loyaltyData.badges.length === 0) && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No achievements yet</p>
              <p className="text-sm mt-2">Make purchases to start earning loyalty points and unlocking achievements!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

