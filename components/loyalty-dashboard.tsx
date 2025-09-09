"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Crown, Gift, Zap, Target, Award, TrendingUp, CreditCard } from "lucide-react"
import { PointsOverview } from "@/components/points-overview"
import { AchievementGrid } from "@/components/achievement-grid"
import { BadgeShowcase } from "@/components/badge-showcase"
import { TransactionHistory } from "@/components/transaction-history"
import { AchievementNotification } from "@/components/achievement-notification"
import { PaymentModal } from "@/components/payment/payment-modal"
import { CashbackRequest } from "@/components/payment/cashback-request"
import { PaymentHistory } from "@/components/payment/payment-history"
import { useLoyaltyData } from "@/hooks/use-loyalty-data"

export function LoyaltyDashboard() {
  const { loyaltyData, loading, simulateAchievement } = useLoyaltyData()
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleSimulateAchievement = () => {
    const newAchievement = {
      id: Date.now(),
      name: "Big Spender",
      description: "Spent over $500 in a single transaction",
      badge_icon: "diamond",
      unlocked_at: new Date().toISOString(),
    }

    setNotificationData(newAchievement)
    setShowNotification(true)
    simulateAchievement()

    setTimeout(() => setShowNotification(false), 4000)
  }

  const handlePaymentSuccess = (transaction: any) => {
    // Simulate achievement unlock for large purchases
    if (transaction.amount >= 500) {
      handleSimulateAchievement()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Loyalty Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Track your rewards and achievements</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full sm:w-auto"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Make Purchase
          </Button>
          <Button onClick={handleSimulateAchievement} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Zap className="w-4 h-4 mr-2" />
            Simulate Achievement
          </Button>
        </div>
      </div>

      {/* Points Overview */}
      <PointsOverview loyaltyData={loyaltyData} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-card h-auto">
          <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1">
            <Award className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1">
            <Target className="w-4 h-4" />
            <span className="text-xs sm:text-sm">History</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Payments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Stats */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Total Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">{loyaltyData?.achievements?.length || 0}</div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Current Badge</CardTitle>
                <Crown className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">
                  {loyaltyData?.current_badge?.name || "No Badge"}
                </div>
                <p className="text-xs text-muted-foreground">Tier {loyaltyData?.current_badge?.tier || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Points Redeemed</CardTitle>
                <Gift className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">
                  {loyaltyData?.points?.total_redeemed?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Lifetime redemptions</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements Preview */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base text-card-foreground">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {loyaltyData?.achievements?.slice(0, 4).map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex-shrink-0">
                      <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementGrid achievements={loyaltyData?.achievements || []} />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeShowcase badges={loyaltyData?.badges || []} currentBadge={loyaltyData?.current_badge} />
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <PaymentHistory />
            </div>
            <div>
              <CashbackRequest
                availablePoints={loyaltyData?.points?.available || 0}
                totalSpent={2500} // Mock total spent
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Notification */}
      {showNotification && notificationData && (
        <AchievementNotification achievement={notificationData} onClose={() => setShowNotification(false)} />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
