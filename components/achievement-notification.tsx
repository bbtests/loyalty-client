"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, X } from "lucide-react"

interface AchievementNotificationProps {
  achievement: {
    name: string
    description: string
    badge_icon: string
  }
  onClose: () => void
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
    >
      <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 shadow-lg min-w-80 bounce-in">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="font-medium">{achievement.name}</p>
                <p className="text-sm opacity-90">{achievement.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full confetti-animation"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
