"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, Trash2 } from "lucide-react"
import { useGetAchievementsQuery, useCreateAchievementMutation, useUpdateAchievementMutation, useDeleteAchievementMutation } from "@/store/achievements"

export function AdminSettings() {
  const { data: achievementsResponse, isLoading: achievementsLoading } = useGetAchievementsQuery()
  const [createAchievement] = useCreateAchievementMutation()
  const [updateAchievement] = useUpdateAchievementMutation()
  const [deleteAchievement] = useDeleteAchievementMutation()

  // Extract achievements from API response
  const achievements = (achievementsResponse as any)?.data?.items || []

  const [settings, setSettings] = useState({
    pointsPerDollar: 10,
    cashbackPercentage: 2,
    enableNotifications: true,
    enableBadges: true,
    enableAchievements: true,
  })

  const handleSaveSettings = () => {
    // In real app, this would call API
    console.log("Saving settings:", settings)
  }

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      await deleteAchievement(achievementId).unwrap()
    } catch (error) {
      console.error("Failed to delete achievement:", error)
    }
  }

  const handleToggleAchievement = async (achievement: any) => {
    try {
      await updateAchievement({
        id: achievement.id,
        data: { is_active: !achievement.is_active }
      }).unwrap()
    } catch (error) {
      console.error("Failed to update achievement:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Program Settings</h2>
        <p className="text-muted-foreground">Configure loyalty program parameters and rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pointsPerDollar" className="text-card-foreground">
                Points per Dollar
              </Label>
              <Input
                id="pointsPerDollar"
                type="number"
                value={settings.pointsPerDollar}
                onChange={(e) => setSettings({ ...settings, pointsPerDollar: Number.parseInt(e.target.value) })}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">How many points users earn per dollar spent</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashbackPercentage" className="text-card-foreground">
                Cashback Percentage
              </Label>
              <Input
                id="cashbackPercentage"
                type="number"
                step="0.1"
                value={settings.cashbackPercentage}
                onChange={(e) => setSettings({ ...settings, cashbackPercentage: Number.parseFloat(e.target.value) })}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">Percentage of purchase amount for cashback</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-card-foreground">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send achievement notifications to users</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-card-foreground">Enable Badges</Label>
                  <p className="text-xs text-muted-foreground">Allow users to earn tier badges</p>
                </div>
                <Switch
                  checked={settings.enableBadges}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableBadges: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-card-foreground">Enable Achievements</Label>
                  <p className="text-xs text-muted-foreground">Allow users to unlock achievements</p>
                </div>
                <Switch
                  checked={settings.enableAchievements}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableAchievements: checked })}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Achievement Management */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-card-foreground">Achievements</CardTitle>
            <Button variant="outline" size="sm" className="border-border text-card-foreground bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement: any) => (
                <div key={achievement.id} className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{achievement.name}</h4>
                        <Badge variant={achievement.is_active ? "default" : "secondary"} className="text-xs">
                          {achievement.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      {achievement.points_required > 0 && (
                        <p className="text-xs text-accent">Requires {achievement.points_required} points</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={achievement.is_active}
                        onCheckedChange={() => handleToggleAchievement(achievement)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteAchievement(achievement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
