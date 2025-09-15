"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Diamond, Repeat, Crown, Loader2, Check } from "lucide-react"
import type { Achievement } from "@/types/api"
import { useGetAchievementsQuery } from "@/store/achievements"

interface AchievementSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAchievement: (achievement: Achievement) => void
  unlockedAchievements: Achievement[]
  isLoading?: boolean
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  diamond: Diamond,
  repeat: Repeat,
  crown: Crown,
}

export function AchievementSelectionModal({
  isOpen,
  onClose,
  onSelectAchievement,
  unlockedAchievements,
  isLoading = false,
}: AchievementSelectionModalProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  
  // Fetch all available achievements from the backend
  const { data: allAchievements, isLoading: achievementsLoading, error } = useGetAchievementsQuery()

  // Handle different possible data structures
  let achievementsArray: any[] = []

  if (allAchievements) {
    if (Array.isArray(allAchievements)) {
      achievementsArray = allAchievements
    } else if ((allAchievements as any).data && Array.isArray((allAchievements as any).data)) {
      achievementsArray = (allAchievements as any).data
    } else if ((allAchievements as any).data && (allAchievements as any).data.items && Array.isArray((allAchievements as any).data.items)) {
      achievementsArray = (allAchievements as any).data.items
    }
  }

  // Filter active achievements that are available (not yet unlocked)
  const unlockedAchievementIds = new Set(unlockedAchievements.map(a => a.id.toString()))
  const availableAchievements = achievementsArray?.filter((achievement: any) => 
    achievement.is_active && !unlockedAchievementIds.has(achievement.id.toString())
  ) || []

  const handleSelectAchievement = () => {
    if (selectedAchievement) {
      onSelectAchievement(selectedAchievement)
      setSelectedAchievement(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedAchievement(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Select Achievement to Trigger
          </DialogTitle>
          <DialogDescription>
            Choose an available achievement to simulate unlocking. Only achievements you haven't unlocked yet are shown.
          </DialogDescription>
        </DialogHeader>

        {achievementsLoading || isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading achievements...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-2">Failed to load achievements</div>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page
            </p>
          </div>
        ) : availableAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">All Achievements Unlocked!</h3>
            <p className="text-sm text-muted-foreground">
              You have already unlocked all available achievements.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {availableAchievements.map((achievement: any) => {
                const IconComponent = iconMap[achievement.badge_icon as keyof typeof iconMap] || Trophy
                const isSelected = selectedAchievement?.id === achievement.id

                return (
                  <Card
                    key={achievement.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <CardHeader className="text-center pb-3">
                      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {achievement.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {achievement.points_required > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {achievement.points_required} points
                        </Badge>
                      )}
                      {isSelected && (
                        <div className="mt-2">
                          <Check className="w-4 h-4 text-primary mx-auto" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {availableAchievements.length} available achievement{availableAchievements.length !== 1 ? 's' : ''}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSelectAchievement}
                  disabled={!selectedAchievement}
                >
                  Trigger Achievement
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
