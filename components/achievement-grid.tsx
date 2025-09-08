"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Diamond, Repeat, Crown } from "lucide-react"

interface Achievement {
  id: number
  name: string
  description: string
  badge_icon: string
  unlocked_at: string
}

interface AchievementGridProps {
  achievements: Achievement[]
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  diamond: Diamond,
  repeat: Repeat,
  crown: Crown,
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Achievements</h2>
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          {achievements.length} Unlocked
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.badge_icon as keyof typeof iconMap] || Trophy

          return (
            <Card
              key={achievement.id}
              className="bg-card border-border hover:shadow-lg transition-all duration-300 bounce-in"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-3">
                  <IconComponent className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg text-card-foreground">{achievement.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                <Badge variant="outline" className="text-xs">
                  Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                </Badge>
              </CardContent>
            </Card>
          )
        })}

        {/* Placeholder for locked achievements */}
        {[...Array(Math.max(0, 6 - achievements.length))].map((_, index) => (
          <Card key={`locked-${index}`} className="bg-muted border-border opacity-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg text-muted-foreground">Locked Achievement</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">Keep shopping to unlock more achievements!</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
