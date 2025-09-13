"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Diamond, Repeat, Crown, Loader2 } from "lucide-react"
import type { Achievement } from "@/types/api"
import { useGetAchievementsQuery } from "@/store/achievements"

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
  // Fetch all available achievements from the backend
  const { data: allAchievements, isLoading, error } = useGetAchievementsQuery()

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading achievements...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load achievements</p>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle different possible data structures
  let achievementsArray: any[] = []

  if (allAchievements) {
    if (Array.isArray(allAchievements)) {
      // Direct array
      achievementsArray = allAchievements
    } else if ((allAchievements as any).data && Array.isArray((allAchievements as any).data)) {
      // Wrapped in data property
      achievementsArray = (allAchievements as any).data
    } else if ((allAchievements as any).data && (allAchievements as any).data.items && Array.isArray((allAchievements as any).data.items)) {
      // API response format with items
      achievementsArray = (allAchievements as any).data.items
    }
  }

  // Filter active achievements
  const activeAchievements = achievementsArray?.filter((achievement: any) => achievement.is_active) || []

  // Create a map of unlocked achievements for quick lookup
  const unlockedAchievementIds = new Set(achievements.map(a => a.id))

  // Combine all achievements with unlock status
  const allAchievementsWithStatus = activeAchievements.map((achievement: any) => {
    const unlockedAchievement = achievements.find(a => a.id === achievement.id)
    return {
      ...achievement,
      isUnlocked: !!unlockedAchievement,
      unlocked_at: unlockedAchievement?.unlocked_at || null,
    }
  })

  // Sort achievements: unlocked first, then by name
  const sortedAchievements = allAchievementsWithStatus.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1
    if (!a.isUnlocked && b.isUnlocked) return 1
    return a.name.localeCompare(b.name)
  })

  const unlockedCount = achievements.length

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Achievements</h2>
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          {unlockedCount} of {sortedAchievements.length} Unlocked
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAchievements.map((achievement) => {
          const IconComponent = iconMap[achievement.badge_icon as keyof typeof iconMap] || Trophy
          const isUnlocked = achievement.isUnlocked

          return (
            <Card
              key={achievement.id}
              className={`${
                isUnlocked 
                  ? "bg-card border-border hover:shadow-lg transition-all duration-300 bounce-in" 
                  : "bg-muted border-border opacity-75"
              }`}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  isUnlocked 
                    ? "bg-gradient-to-br from-primary to-secondary" 
                    : "bg-muted"
                }`}>
                  <IconComponent className={`w-8 h-8 ${
                    isUnlocked ? "text-primary-foreground" : "text-muted-foreground"
                  }`} />
                </div>
                <CardTitle className={`text-lg ${
                  isUnlocked ? "text-card-foreground" : "text-muted-foreground"
                }`}>
                  {achievement.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className={`text-sm mb-3 ${
                  isUnlocked ? "text-muted-foreground" : "text-muted-foreground"
                }`}>
                  {achievement.description}
                </p>
                {isUnlocked ? (
                  <Badge variant="outline" className="text-xs">
                    Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Locked
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sortedAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Achievements Available</h3>
          <p className="text-sm text-muted-foreground">
            Achievements will appear here once they are configured in the system.
          </p>
        </div>
      )}
    </div>
  )
}
