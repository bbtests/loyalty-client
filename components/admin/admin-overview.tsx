"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Gift, TrendingUp, Banknote, Award } from "lucide-react"
import { useGetUsersQuery } from "@/store/users"
import { useGetAchievementsQuery } from "@/store/achievements"
import { useGetBadgesQuery } from "@/store/badges"
import { useGetTransactionsQuery } from "@/store/transactions"
import { useGetLoyaltyPointsQuery } from "@/store/loyalty-points"

export function AdminOverview() {
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery()
  const { data: achievementsResponse, isLoading: achievementsLoading } = useGetAchievementsQuery()
  const { data: badgesResponse, isLoading: badgesLoading } = useGetBadgesQuery()
  const { data: transactionsResponse, isLoading: transactionsLoading } = useGetTransactionsQuery()
  const { data: loyaltyPointsResponse, isLoading: loyaltyPointsLoading } = useGetLoyaltyPointsQuery()

  const loading = usersLoading || achievementsLoading || badgesLoading || transactionsLoading || loyaltyPointsLoading

  // Extract data from API responses
  const users = (usersResponse as any)?.data?.items || []
  const achievements = (achievementsResponse as any)?.data?.items || []
  const badges = (badgesResponse as any)?.data?.items || []
  const transactions = (transactionsResponse as any)?.data?.items || []
  const loyaltyPoints = (loyaltyPointsResponse as any)?.data?.items || []

  // Get pagination metadata for accurate counts
  const usersPagination = (usersResponse as any)?.meta?.pagination
  const achievementsPagination = (achievementsResponse as any)?.meta?.pagination
  const badgesPagination = (badgesResponse as any)?.meta?.pagination
  const transactionsPagination = (transactionsResponse as any)?.meta?.pagination
  const loyaltyPointsPagination = (loyaltyPointsResponse as any)?.meta?.pagination

  // Calculate stats from the data using pagination totals
  const totalUsers = usersPagination?.total || users.length
  const activeUsers = users.filter((user: any) => user.status === 'active').length
  const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  
  const totalRevenue = transactions.reduce((sum: number, transaction: any) => {
    const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalTransactions = transactionsPagination?.total || transactions.length
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  
  const totalPointsIssued = loyaltyPoints.reduce((sum: number, point: any) => {
    const earned = typeof point.total_earned === 'string' ? parseFloat(point.total_earned) : point.total_earned
    return sum + (isNaN(earned) ? 0 : earned)
  }, 0)
  const totalPointsRedeemed = loyaltyPoints.reduce((sum: number, point: any) => {
    const redeemed = typeof point.total_redeemed === 'string' ? parseFloat(point.total_redeemed) : point.total_redeemed
    return sum + (isNaN(redeemed) ? 0 : redeemed)
  }, 0)
  const redemptionRate = totalPointsIssued > 0 ? Math.round((totalPointsRedeemed / totalPointsIssued) * 100) : 0

  // Get recent achievements from users data
  const recentAchievements = users
    .flatMap((user: any) => 
      (user.achievements || []).map((achievement: any) => ({
        user_name: user.name,
        achievement_name: achievement.name,
        unlocked_at: achievement.unlocked_at,
        badge_icon: achievement.badge_icon
      }))
    )
    .sort((a: any, b: any) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 5) // Show only the 5 most recent

  // Badge distribution from real data
  const badgeDistribution = badges.map((badge: any) => {
    // Count how many users have this badge
    const userCount = users.filter((user: any) => 
      (user.badges || []).some((userBadge: any) => userBadge.id === badge.id)
    ).length
    
    return {
      name: badge.name,
      tier: badge.tier,
      count: userCount,
      icon: badge.icon
    }
  }).filter((badge: any) => badge.count > 0) // Only show badges that users actually have

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{engagementRate}% engagement rate</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ₦{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ₦{isNaN(averageTransaction) ? '0.00' : averageTransaction.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Points Issued</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{redemptionRate}% redemption rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.length > 0 ? (
                recentAchievements.map((achievement: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{achievement.user_name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.achievement_name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent achievements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Badge Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {badgeDistribution.length > 0 ? (
                badgeDistribution.map((badge: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">Tier {badge.tier}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {badge.count} users
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No badges earned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
