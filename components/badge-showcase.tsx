"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Medal, Crown, Star, Award } from "lucide-react"

interface BadgeData {
  id: number
  name: string
  description: string
  icon: string
  tier: number
  earned_at: string
}

interface BadgeShowcaseProps {
  badges: BadgeData[]
  currentBadge: BadgeData | null
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
  const allTiers = [
    { tier: 1, name: "Bronze Member", description: "Welcome to our loyalty program", points_required: 0 },
    { tier: 2, name: "Silver Member", description: "Reach 2500 points", points_required: 2500 },
    { tier: 3, name: "Gold Member", description: "Reach 10000 points", points_required: 10000 },
    { tier: 4, name: "Platinum Member", description: "Reach 25000 points", points_required: 25000 },
  ]

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
            <p className="opacity-90">{currentBadge.description}</p>
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
          {allTiers.map((tier) => {
            const earnedBadge = badges.find((b) => b.tier === tier.tier)
            const IconComponent = tierIcons[tier.tier as keyof typeof tierIcons]
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

                  {isEarned ? (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Earned {new Date(earnedBadge.earned_at).toLocaleDateString()}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {tier.points_required.toLocaleString()} points required
                    </Badge>
                  )}

                  {isCurrent && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
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
